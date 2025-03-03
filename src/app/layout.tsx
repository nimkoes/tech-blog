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
  const [logs, setLogs] = useState<string[]>([]);

  /* MD 파일 선택 시 로그 추가 */
  const handleFileSelect = (fileName: string) => {
    const timestamp = new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLogs((prevLogs) => [...prevLogs, `${timestamp} - ${fileName}`]);
  };

  return (
    <html lang="ko">
    <head>
      <title>Nimkoes Tech Blog</title>
    </head>
    <body className={styles.home}>
    <NavigationView
      isCategoryOpen={isCategoryVisible}
      isLogOpen={isLogVisible}
      toggleCategory={() => setIsCategoryVisible((prev) => !prev)}
      toggleLog={() => setIsLogVisible((prev) => !prev)}
    />
    <div className={styles.page} style={{ height: isLogVisible ? "calc(100vh - 150px)" : "100vh" }}>
      <div className={styles.subPage}>
        {isCategoryVisible && (
          <CategoryView onClose={() => setIsCategoryVisible(false)} onFileSelect={handleFileSelect} />
        )}
        <div className={styles.contentsView}>{children}</div>
      </div>
      {isLogVisible && <LogView logs={logs} onClose={() => setIsLogVisible(false)} />}
    </div>
    </body>
    </html>
  );
}