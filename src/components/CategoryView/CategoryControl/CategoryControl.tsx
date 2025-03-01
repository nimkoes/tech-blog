"use client";

import {useState} from "react";
import styles from "./CategoryControl.module.scss";

interface CategoryControlProps {
  expandAll: () => void;
  collapseAll: () => void;
  setSearchQuery: (query: string) => void;
}

const CategoryControl = ({expandAll, collapseAll, setSearchQuery}: CategoryControlProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 🔍 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setSearchQuery(query); // 부모 컴포넌트로 검색어 전달
  };

  return (
    <div className={styles.categoryControl}>
      <div className={styles.buttons}>

        <button className="p-2 rounded hover:bg-gray-200">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
               strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="5"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </button>

        <button onClick={expandAll} className="p-2 rounded hover:bg-gray-200">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6-6 6 6"/>
            <path d="M6 15l6 6 6-6"/>
          </svg>
        </button>
        <button onClick={collapseAll} className="p-2 rounded hover:bg-gray-200">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 15l6-6 6 6"/>
          </svg>
        </button>

        <button className="p-2 rounded hover:bg-gray-200">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
          </svg>
        </button>
      </div>
      <input
        type="text"
        placeholder="🔍 파일명 검색..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default CategoryControl;