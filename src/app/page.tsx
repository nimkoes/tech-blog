import styles from "./page.module.scss";
import Careers from "~/components/Careers";
import Activities from "~/components/Activities";
import Aside from "~/components/Aside";

const HomePage = () => (
  <main className={styles.home}>
    <Aside />

    <div className={styles.homeContainer}>
      <Careers />
      <Activities />
    </div>
  </main>
);

export default HomePage;

