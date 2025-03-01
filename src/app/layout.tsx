"use client";

import "~/styles/index.scss";
import styles from "./layout.module.scss";
import NavigationView from "~/components/NavigationView/NavigationView";
import CategoryView from "~/components/CategoryView/CategoryView";
import LogView from "~/components/LogView/LogView";
import { useState } from "react";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isCategoryVisible, setIsCategoryVisible] = useState(false);
  const [isLogVisible, setIsLogVisible] = useState(true);

  return (
    <html lang="ko">
    <head>
      <title>Nimkoes Tech Blog</title>
    </head>
    <body className={styles.home}>
    <NavigationView
      toggleCategory={() => setIsCategoryVisible((prev) => !prev)}
      toggleLog={() => setIsLogVisible((prev) => !prev)}
    />
    <div className={styles.page}>
      <div className={styles.subPage}>
        {isCategoryVisible && <CategoryView onClose={() => setIsCategoryVisible(false)} />}
        <div className={styles.contentsView}>{children}</div>
      </div>
      {isLogVisible && <LogView />}
    </div>
    </body>
    </html>
  );
}