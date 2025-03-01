"use client";

import styles from "./NavigationView.module.scss";

const Navigation = () => {
  return (
    <aside className={styles.navigationView}>
      <div className={styles.navigation}>
        <button className={styles.navButton}>📂</button>
        <button className={styles.navButton}>🖥</button>
      </div>
    </aside>
  );
};

export default Navigation;
