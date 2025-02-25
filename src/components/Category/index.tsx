"use client";

import {useState} from "react";
import styles from "./Category.module.scss";
import rawCategoryData from "@resources/category.json";

interface CategoryItemProps {
  id: string;
  name: string;
  mdPath?: string;
  children?: CategoryItemProps[];
  onSelect?: (mdPath: string) => void;
}

const CategoryItem: React.FC<{ item: CategoryItemProps; onSelect: (mdPath: string) => void }> = ({item, onSelect}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <li className={styles.categoryItem}>
      <div
        className={styles.categoryTitle}
        onClick={handleToggle} // 전체 클릭 가능하도록 변경
        style={{cursor: hasChildren ? "pointer" : "default"}}
      >
        {hasChildren && (
          <span className={styles.toggleIcon}>{isOpen ? "📂" : "📁"}</span>
        )}
        <span className={styles.folderIcon}>{hasChildren ? "" : "📄"}</span>

        {/* 📌 mdPath가 있으면 문서 열기, 없으면 폴더 열기/닫기 */}
        <span
          className={styles.categoryName}
          onClick={(e) => {
            if (item.mdPath) {
              e.stopPropagation(); // 폴더 열림 방지
              onSelect(item.mdPath);
            }
          }}
          style={{cursor: "pointer"}}
        >
          {item.name}
        </span>
      </div>

      {hasChildren && isOpen && (
        <ul className={styles.subCategoryList}>
          {item.children?.map((child) => (
            <CategoryItem key={child.id} item={child} onSelect={onSelect}/>
          ))}
        </ul>
      )}
    </li>
  );
};

const Category: React.FC<{ onSelect: (mdPath: string) => void }> = ({onSelect}) => (
  <div className={styles.category}>
    <ul className={styles.categoryList}>
      {rawCategoryData.map((item) => (
        <CategoryItem key={item.id} item={item} onSelect={onSelect}/>
      ))}
    </ul>
  </div>
);

export default Category;