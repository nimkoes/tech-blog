"use client";

import {ReactNode} from "react";
import styles from "./CategoryView.module.scss";
import categoryData from "@resources/category.json";
import CategoryControl from "./CategoryControl/CategoryControl";
import CategoryTree from "./CategoryTree/CategoryTree";
import useCategoryStore from "../../store/categoryStore";
import useNavigationStore from "../../store/navigationStore";

interface CategoryItem {
  id: string;
  displayName: string;
  fileName?: string;
  children?: CategoryItem[];
}

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
    <div className={styles.categoryView}>
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
  );
};

export default CategoryView;