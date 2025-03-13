"use client";

import "~/styles/index.scss";
import styles from "./layout.module.scss";
import NavigationView from "~/components/NavigationView/NavigationView";
import CategoryView from "~/components/CategoryView/CategoryView";
import LogView from "~/components/LogView/LogView";
import ImagePopup from "~/components/ImagePopup/ImagePopup";
import { useState, useEffect, useRef } from "react";
import useNavigationStore from "~/store/navigationStore";

const STORAGE_KEY = 'nktbsdb';
const MAX_LOGS = 30;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<string[]>([]);
  const { isLogOpen } = useNavigationStore();
  const [logViewHeight, setLogViewHeight] = useState(250); // 기본 높이 설정

  // LocalStorage에서 로그 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLogs = localStorage.getItem(STORAGE_KEY);
      if (savedLogs) {
        try {
          const parsedLogs = JSON.parse(savedLogs);
          // 저장된 로그가 30개를 초과하면 최근 30개만 유지
          setLogs(parsedLogs.slice(-MAX_LOGS));
        } catch (e) {
          console.error('Failed to parse saved logs:', e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  // 로그가 변경될 때마다 LocalStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && logs.length > 0) {
      // 30개 초과시 최근 30개만 저장
      const logsToStore = logs.slice(-MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToStore));
    }
  }, [logs]);

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

    setLogs((prevLogs) => {
      const newLogs = [...prevLogs, `${timestamp} - ${fileName}`];
      // 30개 초과시 가장 오래된 로그 제거
      return newLogs.slice(-MAX_LOGS);
    });
  };

  // 로그 삭제 핸들러 수정
  const handleClearLogs = () => {
    setLogs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
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