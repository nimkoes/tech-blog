import type { Metadata } from 'next';

// Utils
import { getAllDocuments } from '~/utils/getAllDocuments';
import { getPostUrl } from '~/utils/contentRepository';
import {
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  getAuthorUrl,
  getDefaultOpenGraph,
  getHomeUrl,
  parseIsoDate,
  serializeJsonLd,
} from '~/utils/seo';

// Components
import PostList from './PostList';

// Styles
import styles from './page.module.scss';

// 홈 정체성(canonical, og:url)은 layout 이 아니라 홈 페이지가 갖는다.
export const metadata: Metadata = {
  alternates: {
    canonical: getHomeUrl(),
    languages: {
      [SITE_LANGUAGE]: getHomeUrl(),
    },
  },
  openGraph: {
    ...getDefaultOpenGraph(),
    url: getHomeUrl(),
  },
};

export default function Home() {
  const allPosts = getAllDocuments();
  const latestPost = allPosts[0];
  const blogJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: getHomeUrl(),
    inLanguage: SITE_LANGUAGE,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: getAuthorUrl(),
    },
    publisher: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: getAuthorUrl(),
    },
  };

  if (latestPost) {
    blogJsonLd.dateModified = parseIsoDate(latestPost.lastModifiedDate);
    blogJsonLd.blogPost = allPosts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: getPostUrl(post.fileName),
      datePublished: parseIsoDate(post.regDate),
      dateModified: parseIsoDate(post.lastModifiedDate),
      keywords: post.tags.join(', '),
    }));
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogJsonLd) }}
      />
      <main className={styles.main}>
        <div className={styles.container}>
          <section id="home-intro-anchor" className={styles.intro}>
            <p className={styles.kicker}>Backend Engineer</p>
            <h1 className={styles.headline}>백엔드와 인프라를 기록하는 기술 블로그</h1>
            <p className={styles.slogan}>I work diligently to become lazy ☕</p>
            <p className={styles.description}>
              잊을만 할 때 꺼내보려고 기록합니다.
            </p>
            <div className={styles.externalLinks} aria-label="외부 링크">
              <a
                href="https://nimkoes.github.io/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                Portfolio
              </a>
              <a
                href="https://www.linkedin.com/in/wxpjegiysxlovzvhvjncev"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                LinkedIn
              </a>
              <a
                href="https://xxxelppa.tistory.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                Tistory
              </a>
            </div>
          </section>
          <PostList initialPosts={allPosts} />
        </div>
      </main>
    </>
  );
}
