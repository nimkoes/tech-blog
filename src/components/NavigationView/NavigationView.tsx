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
        <button className={styles.navButton} onClick={toggleCategory}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#AEB2B8" d="M2 4c0-1.1.9-2 2-2h5l2 2h9c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z"/>
            <path fill="#7D848D" d="M2 8h20v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8z"/>
          </svg>
        </button>
        <button className={styles.navButton} onClick={toggleLog}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="14" x="2" y="5" rx="2" ry="2" fill="#AEB2B8"/>
            <path fill="black" d="M5 9l5 3-5 3V9zM12 15h6v-2h-6v2z"/>
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default NavigationView;