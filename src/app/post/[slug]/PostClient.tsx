'use client';
import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import "highlight.js/styles/github-dark.css";
import styles from './page.module.scss';
import { extractDateAndSerial } from '~/utils/getAllDocuments';
import { generateTOC } from '~/utils/generateTOC';
import TOC, { TOCItem } from './TOC';
import '~/styles/toc.scss';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

export default function PostClient({ slug, document }: { slug: string, document: any }) {
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
        const { content } = matter(text);
        setMarkdown(content);
        const { toc, idMap } = generateTOC(content);
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
    function Heading({ children }: any) {
      // plain text 추출
      const text = String(children).replace(/<[^>]+>/g, '').trim();
      const id = idMap[`${level}_${text}`] || '';
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return <Tag id={id}>{children}</Tag>;
    };

  return (
    <div key={slug} className={styles.container}>
      <div className={styles.postHeader}>
        <h1 className={styles.title}>{document.title}</h1>
        <div className={styles.postDate}>
          등록일 : {extractDateAndSerial(document.fileName).date}
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
        {markdown ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: HeadingRenderer(1),
              h2: HeadingRenderer(2),
              h3: HeadingRenderer(3),
              h4: HeadingRenderer(4),
              h5: HeadingRenderer(5),
              h6: HeadingRenderer(6),
            }}
          >
            {markdown}
          </ReactMarkdown>
        ) : (
          <div className={styles.loading}>불러오는 중...</div>
        )}
      </article>
    </div>
  );
} 