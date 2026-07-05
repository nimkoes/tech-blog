import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags, getBasePath, getSiteOrigin } from '~/utils/contentRepository';
import { SITE_NAME } from '~/utils/seo';
import styles from './tags.module.scss';

export const metadata: Metadata = {
  title: '태그',
  description: `${SITE_NAME}의 전체 태그 목록입니다. 태그별로 글을 모아 볼 수 있습니다.`,
  alternates: {
    canonical: `${getSiteOrigin()}${getBasePath()}/tags`,
  },
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>태그</h1>
      <p className={styles.description}>
        총 {tags.length}개의 태그가 있습니다. 태그를 선택하면 관련 글을 모아 볼 수 있어요.
      </p>
      <ul className={styles.tagCloud}>
        {tags.map(({ tag, slug, count }) => (
          <li key={slug}>
            <Link href={`/tags/${slug}`} className={styles.tagChip}>
              {tag}
              <span className={styles.tagCount}>{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
