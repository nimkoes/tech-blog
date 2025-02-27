"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import Category from "../components/Category";
import Contents from "../components/Contents";
import LogTerminal from "../components/LogTerminal";

const HomePage = () => {
  const [selectedMd, setSelectedMd] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); // 카테고리 열림 여부
  const [isLogOpen, setIsLogOpen] = useState(true); // 로그 열림 여부
  const [isMobile, setIsMobile] = useState(false); // 모바일 감지
  const [isTablet, setIsTablet] = useState(false); // 태블릿 감지
  const [logs, setLogs] = useState<string[]>([]);

  // ✅ 반응형 감지 (모바일, 태블릿 구분)
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth < 1024); // 1024px 미만이면 모바일
      setIsTablet(screenWidth >= 1024 && screenWidth <= 1280); // 1024px 이상 1280px 이하일 경우 태블릿
    };

    handleResize(); // 초기 실행 (첫 로딩 시 현재 창 크기 확인)
    window.addEventListener("resize", handleResize); // 창 크기 변경 감지
    return () => window.removeEventListener("resize", handleResize); // 컴포넌트 언마운트 시 이벤트 제거
  }, []);

  // ✅ 문서 선택 시 실행되는 함수 (선택한 문서를 로그에 기록)
  const handleSelect = (mdPath: string) => {
    setSelectedMd(mdPath);
    setLogs((prevLogs) => [...prevLogs, `${new Date().toLocaleTimeString()} : ${mdPath}`]); // 열람한 파일 기록 추가
  };

  return (
    <main className={styles.home}>
      {/* 📌 네비게이션 패널 (항상 표시) */}
      <div className={styles.navigation}>
        {/* 📂 카테고리 토글 버튼 */}
        <button className={styles.navButton} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
          📂
        </button>
        {/* 🖥 로그 패널 토글 버튼 */}
        <button className={styles.navButton} onClick={() => setIsLogOpen(!isLogOpen)}>
          🖥
        </button>
      </div>

      <div className={styles.mainContainer}>
        {/* 📂 카테고리 (파일 탐색기) */}
        <div className={`
          ${styles.categoryContainer} 
          ${isCategoryOpen ? styles.show : styles.hide} 
          ${isMobile ? styles.overlay : ""} 
          ${isTablet ? styles.tablet : ""}
        `}>
          <Category onSelect={handleSelect} />
        </div>

        {/* 📝 컨텐츠 영역 (에디터) */}
        <div className={styles.contentContainer}>
          <Contents mdPath={selectedMd} />
        </div>
      </div>

      {/* 🖥 로그 영역 (터미널) */}
      <div className={`
        ${styles.logContainer} 
        ${isLogOpen ? styles.show : styles.hide} 
        ${isTablet ? styles.tablet : ""}
      `}>
        <LogTerminal logs={logs} />
      </div>
    </main>
  );
};

export default HomePage;