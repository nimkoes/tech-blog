"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import Category from "../components/Category";
import Contents from "../components/Contents";

const HomePage = () => {
  const [selectedMd, setSelectedMd] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 🖥️ 반응형 감지 (화면 크기에 따라 모바일 여부 설정)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false); // 데스크톱에서는 항상 메뉴 보이도록
      }
    };

    handleResize(); // 초기 실행
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ 메뉴 닫기 함수 (Contents 클릭 시 호출)
  const closeMenu = () => {
    if (isMobile) setIsMenuOpen(false);
  };

  return (
    <main className={styles.home}>
      {/* 📌 햄버거 메뉴 버튼 */}
      {isMobile && (
        <button className={styles.hamburger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
      )}

      {/* 📂 Category (햄버거 메뉴 클릭 시 표시) */}
      <div className={`${styles.categoryContainer} ${isMenuOpen ? styles.showMenu : ""}`}>
        <Category
          onSelect={(mdPath) => {
            setSelectedMd(mdPath);
            closeMenu(); // ✅ 문서 선택 시 메뉴 닫기
          }}
        />
      </div>

      {/* ✅ 오버레이 (Contents 클릭 시 메뉴 닫기) */}
      {isMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

      {/* 📝 Markdown Contents (클릭하면 메뉴 닫힘) */}
      <div className={styles.homeContainer} onClick={closeMenu}>
        <Contents mdPath={selectedMd} />
      </div>
    </main>
  );
};

export default HomePage;