import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags, getBasePath, getCategoryPosts, getSiteOrigin } from '~/utils/contentRepository';
import { AUTHOR_NAME, SITE_NAME, serializeJsonLd } from '~/utils/seo';
import styles from './about.module.scss';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE_NAME}을 운영하는 백엔드 엔지니어 nimkoes를 소개합니다.`,
  alternates: {
    canonical: `${getSiteOrigin()}${getBasePath()}/about`,
  },
};

const externalLinks = [
  { label: 'GitHub', href: 'https://github.com/nimkoes' },
  { label: 'Portfolio', href: 'https://nimkoes.github.io/portfolio/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/wxpjegiysxlovzvhvjncev' },
  { label: 'Tistory', href: 'https://xxxelppa.tistory.com/' },
];

export default function AboutPage() {
  const posts = getCategoryPosts();
  const topTags = getAllTags().slice(0, 8);
  const siteUrl = `${getSiteOrigin()}${getBasePath()}`;
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: `${siteUrl}/about`,
    jobTitle: 'Backend Engineer',
    sameAs: externalLinks.map(link => link.href),
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd) }}
      />
      <h1 className={styles.title}>About</h1>
      <p className={styles.lead}>
        안녕하세요, 백엔드 엔지니어 <strong>nimkoes</strong> 입니다.
      </p>
      <p className={styles.paragraph}>
        &ldquo;I work diligently to become lazy&rdquo; — 반복되는 일을 줄이기 위해 부지런히
        공부하고, 잊을만 할 때 꺼내보려고 기록합니다. 이 블로그에는 백엔드와 인프라를 공부하며
        정리한 {posts.length}편의 글이 쌓여 있습니다.
      </p>

      <h2 className={styles.sectionTitle}>주로 다루는 주제</h2>
      <ul className={styles.topicList}>
        {topTags.map(({ tag, slug, count }) => (
          <li key={slug}>
            <Link href={`/tags/${slug}`} className={styles.topicChip}>
              {tag} <span className={styles.topicCount}>{count}편</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className={styles.sectionTitle}>연락처</h2>
      <ul className={styles.linkList}>
        {externalLinks.map(link => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <a href="mailto:xxxelppa@gmail.com">Email</a>
        </li>
      </ul>
    </main>
  );
}
