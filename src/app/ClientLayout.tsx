"use client";

import "~/styles/index.scss";
import styles from "./layout.module.scss";
import NavigationView from "~/components/NavigationView/NavigationView";
import CategoryView from "~/components/CategoryView/CategoryView";
import LogView from "~/components/LogView/LogView";
import ImagePopup from "~/components/ImagePopup/ImagePopup";
import { useState, useEffect, useRef } from "react";
import useNavigationStore from "~/store/navigationStore";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<string[]>([]);
  const { isLogOpen } = useNavigationStore();
  const [logViewHeight, setLogViewHeight] = useState(250); // 기본 높이 설정

  useEffect(() => {
    const updateLogViewHeight = () => {
      const width = window.innerWidth;
      let height = 250; // 기본 높이

      if (width <= 768) {
        height = 0; // 모바일
      } else if (width <= 1024) {
        height = 200; // 태블릿
      }

      setLogViewHeight(height);
    };

    // 초기 높이 설정
    updateLogViewHeight();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', updateLogViewHeight);

    return () => {
      window.removeEventListener('resize', updateLogViewHeight);
    };
  }, []);

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

  // 로그 삭제 핸들러 추가
  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <body className={styles.home}>
      <NavigationView />
      <div className={styles.page} style={{ height: isLogOpen ? `calc(100vh - ${logViewHeight}px)` : "100vh" }}>
        <div className={styles.subPage}>
          <CategoryView onFileSelect={handleFileSelect} />
          <div className={`${styles.contentsView} contentsView`}>{children}</div>
        </div>
        <LogView logs={logs} onClearLogs={handleClearLogs} />
      </div>
      <ImagePopup />
    </body>
  );
} 