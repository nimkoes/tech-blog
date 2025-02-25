import styles from "./page.module.scss";
import Menu from "../components/Menu";
import Contents from "../components/Contents";

const HomePage = () => (
  <main className={styles.home}>
    <Menu />
    <div className={styles.homeContainer}>
      <Contents />
    </div>
  </main>
);

export default HomePage;

