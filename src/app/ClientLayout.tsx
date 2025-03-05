"use client";

import "~/styles/index.scss";
import styles from "./layout.module.scss";
import NavigationView from "~/components/NavigationView/NavigationView";
import CategoryView from "~/components/CategoryView/CategoryView";
import LogView from "~/components/LogView/LogView";
import ImagePopup from "~/components/ImagePopup/ImagePopup";
import { useState } from "react";
import useNavigationStore from "~/store/navigationStore";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<string[]>([]);
  const { isLogOpen } = useNavigationStore();

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
    <body className={styles.home}>
      <NavigationView />
      <div className={styles.page} style={{ height: isLogOpen ? "calc(100vh - 150px)" : "100vh" }}>
        <div className={styles.subPage}>
          <CategoryView onFileSelect={handleFileSelect} />
          <div className={`${styles.contentsView} contentsView`}>{children}</div>
        </div>
        <LogView logs={logs} />
      </div>
      <ImagePopup />
    </body>
  );
} 