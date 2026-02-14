import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import 'highlight.js/styles/github-dark.css';
import styles from './page.module.scss';
import TOC from './TOC';
import '~/styles/toc.scss';
import CodeBlock from '~/components/common/CodeBlock';
import PostEnhancements from './PostEnhancements';
import type { PostContent, PostMeta, TocItem } from '~/types/content';

interface PostClientProps {
  document: PostMeta;
  postContent: PostContent;
  toc: TocItem[];
  idMap: Record<string, string>;
}

function normalizeHeadingText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^[`"'“”‘’]+|[`"'“”‘’]+$/g, '')
    .trim();
}

function readReactNodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(readReactNodeText).join('');
  if (!isValidElement(node)) return '';
  return readReactNodeText((node.props as { children?: ReactNode }).children);
}

export default function PostClient({ document, postContent, toc, idMap }: PostClientProps) {
  const headingSeen: Record<string, number> = {};

  const HeadingRenderer = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
    function Heading({children}: any) {
      const text = normalizeHeadingText(readReactNodeText(children));
      const baseKey = `${level}_${text}`;
      const occurrence = (headingSeen[baseKey] || 0) + 1;
      headingSeen[baseKey] = occurrence;
      const id = idMap[`${baseKey}__${occurrence}`] || '';
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return <Tag id={id}>{children}</Tag>;
    };

  type CodeProps = {
    className?: string;
    children?: ReactNode;
    [key: string]: any;
  };

  const Code = ({className, children, ...props}: CodeProps) => {
    return <code className={className} {...props}>{children}</code>;
  };

  const Anchor = ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
    const resolvedHref = href || '#';
    return (
      <a {...props} href={resolvedHref} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  };

  function extractCodeFromPre(children: ReactNode): { className?: string; children?: ReactNode } | null {
    if (children == null) return null;

    if (Array.isArray(children)) {
      for (const child of children) {
        const found = extractCodeFromPre(child);
        if (found) return found;
      }
      return null;
    }

    if (!isValidElement(children)) {
      return null;
    }

    const props = children.props as {
      className?: string;
      children?: ReactNode;
      node?: { tagName?: string };
    };

    const className = props.className || '';
    const isCodeNode =
      children.type === 'code' ||
      children.type === Code ||
      props.node?.tagName === 'code' ||
      /(^|\s)(language-|hljs)/.test(className);

    if (isCodeNode) {
      return {
        className: props.className,
        children: props.children,
      };
    }

    return extractCodeFromPre(props.children);
  }

  type PreProps = ComponentPropsWithoutRef<'pre'> & { node?: unknown };

  const Pre = ({
    children,
    className,
    ...props
  }: PreProps) => {
    const blockCode = extractCodeFromPre(children);
    if (!blockCode) {
      return <pre className={className}>{children}</pre>;
    }

    const dataLanguage =
      typeof (props as Record<string, unknown>)['data-ke-language'] === 'string'
        ? String((props as Record<string, unknown>)['data-ke-language'])
        : '';
    const fallbackClassName = className || (dataLanguage ? `language-${dataLanguage}` : '');
    const resolvedClassName = blockCode.className || fallbackClassName;
    return <CodeBlock className={resolvedClassName}>{blockCode.children}</CodeBlock>;
  };

  const markdownComponents: Components = {
    h1: HeadingRenderer(1),
    h2: HeadingRenderer(2),
    h3: HeadingRenderer(3),
    h4: HeadingRenderer(4),
    h5: HeadingRenderer(5),
    h6: HeadingRenderer(6),
    pre: Pre,
    code: Code,
    a: Anchor,
  };

  return (
    <div className={styles.container}>
      <div className={styles.postHeader}>
        <h1 className={styles.title}>{document.title}</h1>
        <div className={styles.postDate}>
          등록일 : {document.regDate}
        </div>
        <div className={styles.postDate}>
          최종수정일 : {document.lastModifiedDate}
        </div>
        {document.tags && document.tags.length > 0 && (
          <div className={styles.postTags}>
            {document.tags.map((tag: string) => (
              <span key={tag} className={styles.tagPill}>{tag}</span>
            ))}
          </div>
        )}
      </div>
      {toc.length > 0 && <TOC toc={toc} />}
      <article className={styles.markdown}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={markdownComponents}
        >
          {postContent.content}
        </ReactMarkdown>
      </article>
      <PostEnhancements />
    </div>
  );
}
