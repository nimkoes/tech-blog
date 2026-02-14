// Utils
import { getAllDocuments } from '~/utils/getAllDocuments';

// Components
import PostList from './PostList';

// Styles
import styles from './page.module.scss';

export default function Home() {
  const allPosts = getAllDocuments();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section id="home-intro-anchor" className={styles.intro}>
          <p className={styles.kicker}>Backend Engineer</p>
          <h1 className={styles.headline}>I work diligently to become lazy ☕</h1>
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
  );
}
