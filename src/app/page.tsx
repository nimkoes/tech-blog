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
        <PostList initialPosts={allPosts} />
      </div>
    </main>
  );
}