"use client";

import { useState } from "react";
import styles from "./CategoryControl.module.scss";

interface CategoryControlProps {
  expandAll: () => void;
  collapseAll: () => void;
  setSearchQuery: (query: string) => void;
  onClose: () => void; // ✅ 카테고리 닫기 이벤트 추가
}

const CategoryControl = ({ expandAll, collapseAll, setSearchQuery, onClose }: CategoryControlProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false); // 🔍 검색창 토글 상태

  // 🔍 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setSearchQuery(query);
  };

  return (
    <div className={styles.categoryControl}>
      <div className={styles.controls}>
        {/* 🔍 돋보기 아이콘 */}
        <button className={styles.iconButton} onClick={() => setIsSearchOpen(!isSearchOpen)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="17" y1="17" x2="22" y2="22"/>
          </svg>
        </button>

        {/* 🔍 검색 입력창 (돋보기를 클릭하면 표시) */}
        <input
          type="text"
          placeholder="검색..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={`${styles.searchInput} ${isSearchOpen ? styles.searchActive : ""}`}
        />

        {/* 전체 열기 & 닫기 버튼 */}
        <div className={styles.actionButtons}>
          <button onClick={expandAll} className={styles.iconButton}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6-6 6 6"/>
              <path d="M6 15l6 6 6-6"/>
            </svg>
          </button>
          <button onClick={collapseAll} className={styles.iconButton}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 21l6-6 6 6"/>
              <path d="M6 3l6 6 6-6"/>
            </svg>
          </button>
          <button onClick={onClose} className={styles.iconButton}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryControl;