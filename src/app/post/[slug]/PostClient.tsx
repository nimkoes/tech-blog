import Link from 'next/link';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import 'highlight.js/styles/github-dark.css';
import styles from './page.module.scss';
import TOC from './TOC';
import '~/styles/toc.scss';
import CodeBlock from '~/components/common/CodeBlock';
import PostEnhancements from './PostEnhancements';
import { SeriesBox, PostFooterNav } from './PostNav';
import type { PostContent, PostMeta, TocItem } from '~/types/content';
import type { PostNavigation } from '~/utils/contentRepository';
import { slugifyTag } from '~/utils/tags';
import { deriveImageAlt } from '~/utils/seo';
import imageMetadata from '~/resources/image-metadata.json';
import HeadingPermalink from './HeadingPermalink';
import RelativeUpdateAge from './RelativeUpdateAge';

interface PostClientProps {
  document: PostMeta;
  postContent: PostContent;
  toc: TocItem[];
  idMap: Record<string, string>;
  definitionHeadingMap: Record<string, true>;
  navigation: PostNavigation | null;
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

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

export default function PostClient({
  document,
  postContent,
  toc,
  idMap,
  definitionHeadingMap,
  navigation,
}: PostClientProps) {
  const headingSeen: Record<string, number> = {};

  const HeadingRenderer = (
    sourceLevel: 1 | 2 | 3 | 4 | 5 | 6,
    renderedLevel: 1 | 2 | 3 | 4 | 5 | 6 = sourceLevel
  ) =>
    function Heading({ children }: { children?: ReactNode }) {
      const text = normalizeHeadingText(readReactNodeText(children));
      const baseKey = `${sourceLevel}_${text}`;
      const occurrence = (headingSeen[baseKey] || 0) + 1;
      headingSeen[baseKey] = occurrence;
      const headingKey = `${baseKey}__${occurrence}`;
      const id = idMap[headingKey] || '';
      const Tag = `h${renderedLevel}` as HeadingTag;
      const className = sourceLevel === 1 ? styles.markdownH1 : undefined;
      const isDefinitionHeading = definitionHeadingMap[headingKey];

      if (isDefinitionHeading) {
        return <p className={styles.definitionHeading}>{children}</p>;
      }

      if (sourceLevel >= 3) {
        return <Tag className={styles.subheading}>{children}</Tag>;
      }

      return (
        <div className={`${styles.headingRow} ${styles.headingRowMajor}`}>
          <Tag id={id} className={className}>{children}</Tag>
          {id && text && <HeadingPermalink id={id} heading={text} />}
        </div>
      );
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
    const isExternalLink =
      /^https?:\/\//i.test(resolvedHref) ||
      resolvedHref.startsWith('//') ||
      resolvedHref.startsWith('mailto:');

    return (
      <a
        {...props}
        href={resolvedHref}
        target={isExternalLink ? '_blank' : undefined}
        rel={isExternalLink ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  };

  const Image = ({ src, alt, ...props }: ComponentPropsWithoutRef<'img'>) => {
    const resolvedSrc = typeof src === 'string' ? src : '';
    const suppliedAlt = alt?.trim() || '';
    const isFileNameAlt = /(^|\/)[^/]+\.(png|jpe?g|gif|webp|svg)$/i.test(suppliedAlt);
    const resolvedAlt = suppliedAlt && !isFileNameAlt
      ? suppliedAlt
      : deriveImageAlt('', `${document.title} 관련 본문 이미지`);
    const dimensions = (imageMetadata as Record<string, { width: number; height: number }>)[resolvedSrc];

    return (
      // 마크다운 이미지 경로는 빌드 시 생성한 크기 정보와 함께 직접 렌더링합니다.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        src={resolvedSrc}
        alt={resolvedAlt}
        width={dimensions?.width}
        height={dimensions?.height}
        loading="lazy"
        decoding="async"
      />
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
    h1: HeadingRenderer(1, 2),
    h2: HeadingRenderer(2),
    h3: HeadingRenderer(3),
    h4: HeadingRenderer(4),
    h5: HeadingRenderer(5),
    h6: HeadingRenderer(6),
    pre: Pre,
    code: Code,
    a: Anchor,
    img: Image,
  };

  return (
    <div className={styles.container}>
      <header className={styles.postHeader}>
        <h1 className={styles.title}>{document.title}</h1>
        <p className={styles.postLead}>{postContent.description}</p>
        <div className={styles.postMetaSummary}>
          <span className={styles.readingTime}>약 {document.readingTime}분</span>
        </div>
        {document.tags && document.tags.length > 0 && (
          <div className={styles.postTags}>
            {document.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/tags/${slugifyTag(tag)}`}
                className={styles.tagPill}
                aria-label={`${tag} 태그가 달린 글 목록`}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
        <p className={styles.latestUpdate}>
          <span>최근 업데이트</span>
          <time dateTime={document.lastModifiedDate}>{document.lastModifiedDate}</time>
          <RelativeUpdateAge date={document.lastModifiedDate} />
        </p>
      </header>
      {navigation?.series && (
        <SeriesBox series={navigation.series} currentSlug={document.fileName} />
      )}
      {toc.length > 0 && <TOC toc={toc} />}
      <article className={styles.markdown}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
          components={markdownComponents}
        >
          {postContent.content}
        </ReactMarkdown>
      </article>
      {postContent.sources.length > 0 && (
        <aside className={styles.sources} aria-labelledby="official-sources-title">
          <h2 id="official-sources-title">공식 참고 자료</h2>
          <ul>
            {postContent.sources.map(source => (
              <li key={source}>
                <a href={source} target="_blank" rel="noopener noreferrer">
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
      {navigation && <PostFooterNav navigation={navigation} />}
      <PostEnhancements />
    </div>
  );
}
