'use client';
import {useEffect, useState} from 'react';
import ReactMarkdown, {Components} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import "highlight.js/styles/github-dark.css";
import styles from './page.module.scss';
import {generateTOC} from '~/utils/generateTOC';
import TOC, {TOCItem} from './TOC';
import '~/styles/toc.scss';
import CodeBlock from '~/components/common/CodeBlock';
import Giscus from '~/components/common/Giscus';

function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      className="scrollTopBtn"
      aria-label="맨 위로 이동"
      onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
    >
      {/* 임시 SVG 아이콘, 나중에 이미지로 교체 가능 */}
      {/* <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#fff" fillOpacity="0.7" />
        <path d="M10 18l6-6 6 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg> */}
      <svg viewBox="0 0 24 24" width={40} height={40} fill="#DD4AFF">
        <path
          d="m12.097.227-1.913 1.341L7.93.914 6.6 2.816l-2.346.142-.586 2.234-2.157.92.23 2.295L.032 9.995l1.015 2.083L0 14.14l1.679 1.616-.267 2.291 2.141.955.549 2.243 2.344.178 1.3 1.925 2.965-.836-6.421-6.298a4.548 4.548 0 0 1-1.491-3.364c0-2.542 2.1-4.601 4.692-4.601 1.406 0 2.668.607 3.527 1.57l.978.959 1.195-1.173a4.725 4.725 0 0 1 3.3-1.332c2.591 0 4.692 2.061 4.692 4.603 0 1.4-.702 2.628-1.644 3.497l-6.291 6.178a1.78 1.78 0 0 0-1.25-.509c-.489 0-.933.195-1.252.51.006.675.563 1.22 1.252 1.22.66 0 1.2-.502 1.248-1.139l2.822.78 1.33-1.901 2.348-.142.585-2.234 2.156-.921-.227-2.297 1.705-1.587-1.015-2.081L24 10.186l-1.68-1.614.266-2.293-2.14-.955-.55-2.243-2.344-.18L16.253.98l-2.265.619ZM9.292 13.58c-.614 0-1.111.489-1.111 1.091a1.1 1.1 0 0 0 1.111 1.09 1.1 1.1 0 0 0 1.112-1.09 1.1 1.1 0 0 0-1.112-1.09zm5.423 0a1.1 1.1 0 0 0-1.11 1.091 1.1 1.1 0 0 0 1.11 1.09c.616 0 1.112-.488 1.112-1.09 0-.602-.496-1.09-1.112-1.09z"/>
      </svg>
    </button>
  );
}

export default function PostClient({slug, document}: { slug: string, document: any }) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toc, setTOC] = useState<TOCItem[]>([]);
  const [idMap, setIdMap] = useState<Record<string, string>>({});

  // 환경에 따라 basePath 자동 처리
  const basePath =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/tech-blog')
      ? '/tech-blog'
      : '';

  useEffect(() => {
    if (!slug) return;
    fetch(`${basePath}/resources/${slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.text();
      })
      .then(async (text) => {
        // gray-matter로 frontmatter 제거
        const matter = (await import('gray-matter')).default;
        const {content} = matter(text);
        setMarkdown(content);
        const {toc, idMap} = generateTOC(content);
        setTOC(toc);
        setIdMap(idMap);
      })
      .catch(() => setNotFound(true));
  }, [slug, basePath]);

  if (notFound) {
    return <div className={styles.notFound}>해당 게시물의 본문이 아직 준비되지 않았습니다.<br/>빠른 시일 내에 업데이트될 예정입니다.</div>;
  }

  // heading 렌더러: level+텍스트로 id를 찾아서 부여
  const HeadingRenderer = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
    function Heading({children}: any) {
      // plain text 추출
      const text = String(children).replace(/<[^>]+>/g, '').trim();
      const id = idMap[`${level}_${text}`] || '';
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return <Tag id={id}>{children}</Tag>;
    };

  type CodeProps = {
    node?: any;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  };

  const Code = ({node, className, children, ...props}: CodeProps) => {
    if ((node && node.type === 'inlineCode') || !className) {
      return <code className={className} {...props}>{children}</code>;
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  };

  const markdownComponents: Components = {
    h1: HeadingRenderer(1),
    h2: HeadingRenderer(2),
    h3: HeadingRenderer(3),
    h4: HeadingRenderer(4),
    h5: HeadingRenderer(5),
    h6: HeadingRenderer(6),
    code: Code,
  };

  return (
    <div key={slug} className={styles.container}>
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
      {toc.length > 0 && <TOC toc={toc}/>}
      <article className={styles.markdown}>
        {markdown ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {markdown}
          </ReactMarkdown>
        ) : (
          <div className={styles.loading}>불러오는 중...</div>
        )}
      </article>
      <br/>
      <br/>
      <br/>
      <Giscus
        repo="nimkoes/tech-blog"
        repoId="R_kgDON-8fIg"
        category="Comments"
        categoryId="DIC_kwDON-8fIs4CtWZk"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="preferred_color_scheme"
        lang="ko"
        loading="lazy"
      />
      <ScrollTopButton/>
    </div>
  );
}
