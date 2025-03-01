"use client";

import styles from "./NavigationView.module.scss";

const NavigationView = ({
                          toggleCategory,
                          toggleLog,
                        }: {
  toggleCategory: () => void;
  toggleLog: () => void;
}) => {
  return (
    <aside className={styles.navigationView}>
      <div className={styles.navigation}>
        <button className={styles.navButton} onClick={toggleCategory}>📂</button>
        <button className={styles.navButton} onClick={toggleLog}>🖥</button>
      </div>
    </aside>
  );
};

export default NavigationView;