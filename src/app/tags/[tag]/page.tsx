import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllTags,
  getBasePath,
  getPostsByTagSlug,
  getSiteOrigin,
} from '~/utils/contentRepository';
import { SITE_NAME, getPageOpenGraph } from '~/utils/seo';
import styles from '../tags.module.scss';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  // 정적 export 산출물은 유니코드 디렉토리(raw slug)로 만들어져 GitHub Pages에서 서빙된다.
  // next dev 는 percent-encoding 된 세그먼트로 매칭하므로 개발 모드에서만 인코딩 형태를 함께 등록한다.
  // 운영 빌드에 인코딩 형태를 넣으면 out/tags/%EA%B8... 디렉토리가 생겨 /tags/%25EA%25B8.../ 같은 중복 URL 이 된다.
  const includeEncoded = process.env.NODE_ENV === 'development';
  const params = new Map<string, { tag: string }>();
  getAllTags().forEach(({ slug }) => {
    params.set(slug, { tag: slug });
    if (includeEncoded) {
      params.set(encodeURIComponent(slug), { tag: encodeURIComponent(slug) });
    }
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

  const title = `${result.tag} 태그`;
  const description = `${SITE_NAME}에서 '${result.tag}' 태그가 달린 글 ${result.posts.length}편을 모아 봅니다.`;
  const canonical = `${getSiteOrigin()}${getBasePath()}/tags/${encodeURIComponent(decodeURIComponent(tag))}/`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: getPageOpenGraph({ title, description, url: canonical }),
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
