// Utils
import { getAllDocuments } from '~/utils/getAllDocuments';
import Link from 'next/link';

// Components
import PostList from './PostList';

// Styles
import styles from './page.module.scss';

export default function Home() {
  const allPosts = getAllDocuments();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.intro}>
          <p className={styles.kicker}>Backend Engineer</p>
          <h1 className={styles.headline}>I work diligently to become lazy ☕</h1>
          <p className={styles.description}>
            잊을만 할 때 꺼내보려고 기록합니다.
          </p>
          <div className={styles.quickLinks}>
            <Link href="/?tags=Kubernetes" className={styles.quickLink}>Kubernetes</Link>
            <Link href="/?tags=Spring%20Security" className={styles.quickLink}>Spring Security</Link>
            <Link href="/?tags=unit%20test" className={styles.quickLink}>Unit Test</Link>
          </div>
        </section>
        <PostList initialPosts={allPosts} />
      </div>
    </main>
  );
}
