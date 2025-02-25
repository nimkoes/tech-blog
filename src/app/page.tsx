import styles from "./page.module.scss";
import Category from "../components/Category";
import Contents from "../components/Contents";

const HomePage = () => (
  <main className={styles.home}>
    <Category />
    <div className={styles.homeContainer}>
      <Contents />
    </div>
  </main>
);

export default HomePage;
