"use client";

import {ReactNode} from "react";
import styles from "./CategoryView.module.scss";
import categoryData from "@resources/category.json";
import CategoryControl from "./CategoryControl/CategoryControl";
import CategoryTree from "./CategoryTree/CategoryTree";
import useCategoryStore from "../../store/categoryStore";
import useNavigationStore from "../../store/navigationStore";

const CategoryView = ({
  onFileSelect,
}: {
  onFileSelect: (fileName: string) => void;
}) => {
  const { 
    openFolders, 
    searchQuery, 
    toggleFolder, 
    setSearchQuery, 
    expandAll, 
    collapseAll 
  } = useCategoryStore();
  
  const { isCategoryOpen, toggleCategory } = useNavigationStore();

  // 🔍 파일명 하이라이트 처리
  const highlightText = (text: string): ReactNode => {
    if (!searchQuery) return text;
    
    // 정규식 특수문자를 이스케이프
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    
    let lastIndex = 0;
    const parts: ReactNode[] = [];
    let match;
    
    // 원본 텍스트를 순회하면서 매칭되는 부분을 찾음
    while ((match = regex.exec(text)) !== null) {
      // 매칭 이전 부분을 추가
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }
      // 매칭된 부분을 하이라이트로 추가
      parts.push(
        <span key={`highlight-${match.index}`} className={styles.highlight}>
          {match[0]}
        </span>
      );
      lastIndex = regex.lastIndex;
    }
    
    // 마지막 매칭 이후 남은 텍스트 추가
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }
    
    return <>{parts}</>;
  };

  const handleClose = () => {
    toggleCategory();
  };

  if (!isCategoryOpen) return null;

  return (
    <>
      {/* 모바일에서만 배경 추가 (내비게이션 & 로그는 침범하지 않음) */}
      {isCategoryOpen && window.innerWidth <= 768 && (
        <div className={styles.backdrop} onClick={handleClose}></div>
      )}

      <div className={`${styles.categoryView} ${isCategoryOpen ? styles.open : ""}`}>
        <div className={styles.categoryControl}>
          <CategoryControl
            expandAll={expandAll}
            collapseAll={collapseAll}
            setSearchQuery={setSearchQuery}
            onClose={handleClose}
          />
        </div>
        <div className={styles.treeContainer}>
          <CategoryTree
            data={categoryData}
            depth={0}
            toggleFolder={toggleFolder}
            openFolders={openFolders}
            highlightText={highlightText}
            onFileSelect={onFileSelect}
          />
        </div>
      </div>
    </>
  );
};

export default CategoryView;