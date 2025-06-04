'use client';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import "highlight.js/styles/github-dark.css";
import styles from './page.module.scss';

export default function PostClient({ slug, document }: { slug: string, document: any }) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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
      })
      .catch(() => setNotFound(true));
  }, [slug, basePath]);

  if (notFound) {
    return <div className={styles.notFound}>해당 게시물의 본문이 아직 준비되지 않았습니다.<br/>빠른 시일 내에 업데이트될 예정입니다.</div>;
  }

  return (
    <div key={slug} className={styles.container}>
      <div className={styles.postHeader}>
        <h1 className={styles.title}>{document.title}</h1>
        <div className={styles.meta}>
          {document.tags && document.tags.length > 0 && (
            <div className={styles.tags}>
              {document.tags.map((tag: string) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <article className={styles.markdown}>
        {markdown ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
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