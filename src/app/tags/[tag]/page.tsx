import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllTags,
  getBasePath,
  getPostsByTagSlug,
  getSiteOrigin,
} from '~/utils/contentRepository';
import { SITE_NAME } from '~/utils/seo';
import styles from '../tags.module.scss';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  // 정적 export 산출물은 유니코드 디렉토리(raw slug)로 만들어져 GitHub Pages에서 서빙되고,
  // next dev는 percent-encoding 된 세그먼트로 매칭하므로 두 형태를 모두 등록한다.
  const params = new Map<string, { tag: string }>();
  getAllTags().forEach(({ slug }) => {
    params.set(slug, { tag: slug });
    params.set(encodeURIComponent(slug), { tag: encodeURIComponent(slug) });
  });
  return Array.from(params.values());
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const result = getPostsByTagSlug(tag);

  if (!result) {
    return {
      title: '존재하지 않는 태그',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${result.tag} 태그`,
    description: `${SITE_NAME}에서 '${result.tag}' 태그가 달린 글 ${result.posts.length}편을 모아 봅니다.`,
    alternates: {
      canonical: `${getSiteOrigin()}${getBasePath()}/tags/${decodeURIComponent(tag)}`,
    },
    robots: result.posts.length < 2 ? { index: false, follow: true } : undefined,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag: tagSlug } = await params;
  const result = getPostsByTagSlug(tagSlug);

  if (!result) {
    notFound();
  }

  const { tag, posts, sortMode } = result;

  return (
    <main className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="브레드크럼">
        <Link href="/tags">태그</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{tag}</span>
      </nav>
      <h1 className={styles.title}>#{tag}</h1>
      <p className={styles.description}>
        {`${posts.length}편의 글이 있습니다. · ${
          sortMode === 'series'
            ? '시리즈 순서로 정렬했습니다.'
            : '최근 업데이트 순으로 정렬했습니다.'
        }`}
      </p>
      <ul className={styles.postList}>
        {posts.map(post => (
          <li key={post.fileName}>
            <Link href={`/post/${post.fileName}`} className={styles.postLink}>
              <span className={styles.postTitle}>{post.title}</span>
              <time dateTime={post.lastModifiedDate} className={styles.postDate}>
                {post.lastModifiedDate}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
