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
    const regex = new RegExp(`(${searchQuery})`, "gi");

    return (
      <>
        {text.split(regex).map((part, i) =>
          regex.test(part) ? (
            <span key={i} className={styles.highlight}>{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
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
        <CategoryControl
          expandAll={expandAll}
          collapseAll={collapseAll}
          setSearchQuery={setSearchQuery}
          onClose={handleClose}
        />
        <CategoryTree
          data={categoryData}
          depth={0}
          toggleFolder={toggleFolder}
          openFolders={openFolders}
          highlightText={highlightText}
          onFileSelect={onFileSelect}
        />
      </div>
    </>
  );
};

export default CategoryView;