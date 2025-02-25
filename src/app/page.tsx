"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import Category from "../components/Category";
import Contents from "../components/Contents";
import LogTerminal from "../components/LogTerminal";

const HomePage = () => {
  const [selectedMd, setSelectedMd] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(true); // 카테고리 열림 여부
  const [isLogOpen, setIsLogOpen] = useState(true); // 로그 열림 여부
  const [isMobile, setIsMobile] = useState(false); // 반응형 감지
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelect = (mdPath: string) => {
    setSelectedMd(mdPath);
    setLogs((prevLogs) => [...prevLogs, `${new Date().toLocaleTimeString()} : ${mdPath}`]);
  };

  return (
    <main className={styles.home}>
      {/* 📌 네비게이션 패널 (항상 표시) */}
      <div className={styles.navigation}>
        <button className={styles.navButton} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
          📂
        </button>
        <button className={styles.navButton} onClick={() => setIsLogOpen(!isLogOpen)}>
          🖥
        </button>
      </div>

      <div className={styles.mainContainer}>
        {/* 📂 카테고리 (파일 탐색기) */}
        <div className={`${styles.categoryContainer} ${isCategoryOpen ? styles.show : styles.hide} ${isMobile ? styles.overlay : ""}`}>
          <Category onSelect={handleSelect} />
        </div>

        {/* 📝 컨텐츠 영역 (에디터) */}
        <div className={styles.contentContainer}>
          <Contents mdPath={selectedMd} />
        </div>
      </div>

      {/* 🖥 로그 영역 (터미널) */}
      <div className={`${styles.logContainer} ${isLogOpen ? styles.show : styles.hide}`}>
        <LogTerminal logs={logs} />
      </div>
    </main>
  );
};

export default HomePage;