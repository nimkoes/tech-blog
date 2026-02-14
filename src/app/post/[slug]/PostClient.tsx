import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { isValidElement, type ReactNode } from 'react';
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

export default function PostClient({ document, postContent, toc, idMap }: PostClientProps) {
  const HeadingRenderer = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
    function Heading({children}: any) {
      const text = String(children).replace(/<[^>]+>/g, '').trim();
      const id = idMap[`${level}_${text}`] || '';
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

  const Pre = ({children}: {children?: ReactNode}) => {
    const blockCode = extractCodeFromPre(children);
    if (!blockCode) {
      return <pre>{children}</pre>;
    }

    return <CodeBlock className={blockCode.className}>{blockCode.children}</CodeBlock>;
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
          rehypePlugins={[rehypeHighlight]}
          components={markdownComponents}
        >
          {postContent.content}
        </ReactMarkdown>
      </article>
      <PostEnhancements />
    </div>
  );
}
