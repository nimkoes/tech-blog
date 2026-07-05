import Link from 'next/link';
import styles from './page.module.scss';
import type { SeriesInfo, PostNavigation } from '~/utils/contentRepository';

interface SeriesBoxProps {
  series: SeriesInfo;
  currentSlug: string;
}

export function SeriesBox({ series, currentSlug }: SeriesBoxProps) {
  return (
    <nav className={styles.seriesBox} aria-label="시리즈 목차">
      <details>
        <summary className={styles.seriesSummary}>
          <span className={styles.seriesLabel}>시리즈</span>
          <span className={styles.seriesName}>{series.name}</span>
          <span className={styles.seriesCount}>
            {series.index} / {series.total}
          </span>
        </summary>
        <ol className={styles.seriesList}>
          {series.posts.map(post => (
            <li key={post.fileName}>
              {post.fileName === currentSlug ? (
                <span className={styles.seriesCurrent} aria-current="page">
                  {post.title}
                </span>
              ) : (
                <Link href={`/post/${post.fileName}`}>{post.title}</Link>
              )}
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}

interface PostFooterNavProps {
  navigation: PostNavigation;
}

export function PostFooterNav({ navigation }: PostFooterNavProps) {
  const { prev, next, related } = navigation;

  return (
    <>
      {(prev || next) && (
        <nav className={styles.postNav} aria-label="이전 글과 다음 글">
          {prev ? (
            <Link href={`/post/${prev.fileName}`} rel="prev" className={styles.postNavCard}>
              <span className={styles.postNavDirection}>← 이전 글</span>
              <span className={styles.postNavTitle}>{prev.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {next ? (
            <Link
              href={`/post/${next.fileName}`}
              rel="next"
              className={`${styles.postNavCard} ${styles.postNavCardNext}`}
            >
              <span className={styles.postNavDirection}>다음 글 →</span>
              <span className={styles.postNavTitle}>{next.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      )}
      {related.length > 0 && (
        <section className={styles.related} aria-label="관련 글">
          <h2 className={styles.relatedTitle}>함께 읽으면 좋은 글</h2>
          <ul className={styles.relatedList}>
            {related.map(post => (
              <li key={post.fileName}>
                <Link href={`/post/${post.fileName}`} className={styles.relatedLink}>
                  <span className={styles.relatedPostTitle}>{post.title}</span>
                  <time dateTime={post.lastModifiedDate} className={styles.relatedDate}>
                    {post.lastModifiedDate}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
