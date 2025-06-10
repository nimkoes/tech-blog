'use client';
import { useEffect, useState } from 'react';
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

export default function PostClient({ slug, document }: { slug: string, document: any }) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toc, setTOC] = useState<TOCItem[]>([]);

  // id 매핑용 맵
  const [headingIdMap, setHeadingIdMap] = useState<Record<string, string>>({});

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
        const tocArr = generateTOC(content);
        setTOC(tocArr);
        // heading 텍스트 → id 매핑
        const map: Record<string, string> = {};
        tocArr.forEach(item => { map[item.text] = item.id; });
        setHeadingIdMap(map);
      })
      .catch(() => setNotFound(true));
  }, [slug, basePath]);

  if (notFound) {
    return <div className={styles.notFound}>해당 게시물의 본문이 아직 준비되지 않았습니다.<br/>빠른 시일 내에 업데이트될 예정입니다.</div>;
  }

  // heading 렌더러
  const HeadingRenderer = (level: 1 | 2 | 3) =>
    function Heading({ node, children }: any) {
      // plain text 추출
      const text = String(children).replace(/<[^>]+>/g, '');
      const id = headingIdMap[text] || '';
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