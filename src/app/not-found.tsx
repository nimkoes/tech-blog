import Link from 'next/link';
import { getCategoryPosts } from '~/utils/contentRepository';
import styles from './not-found.module.scss';

export default function NotFound() {
  const recentPosts = getCategoryPosts().slice(0, 5);

  return (
    <main className={styles.container}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
      <p className={styles.description}>
        주소가 바뀌었거나 삭제된 페이지일 수 있어요. 아래에서 다시 시작해보세요.
      </p>
      <Link href="/" className={styles.homeLink}>
        홈으로 돌아가기
      </Link>
      {recentPosts.length > 0 && (
        <section className={styles.recent} aria-label="최근 글">
          <h2 className={styles.recentTitle}>최근 업데이트된 글</h2>
          <ul className={styles.recentList}>
            {recentPosts.map(post => (
              <li key={post.fileName}>
                <Link href={`/post/${post.fileName}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
