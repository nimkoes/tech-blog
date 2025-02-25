"use client";

import {useState} from "react";
import styles from "./Category.module.scss";
import rawCategoryData from "@resources/menu-category.json";

interface CategoryItemProps {
  id: string;
  name: string;
  mdPath?: string;
  children?: CategoryItemProps[];
}

const CategoryItem: React.FC<{ item: CategoryItemProps }> = ({item}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className={styles.categoryItem}>
      <div className={styles.categoryTitle} onClick={() => setIsOpen(!isOpen)}>
        {hasChildren && (
          <span className={styles.toggleIcon}>{isOpen ? "▼" : "▶"}</span>
        )}
        <span className={styles.folderIcon}>{hasChildren ? "📂" : "📄"}</span>
        <span className={styles.categoryName}>{item.name}</span>
        {item.mdPath && <a href={item.mdPath} className={styles.mdLink}>(문서 보기)</a>}
      </div>
      {hasChildren && isOpen && (
        <ul className={styles.subCategoryList}>
          {item.children?.map((child) => (
            <CategoryItem key={child.id} item={child}/>
          ))}
        </ul>
      )}
    </li>
  );
};

const Category: React.FC = () => (
  <div className={styles.category}>
    <h2>CATEGORY</h2>
    <ul className={styles.categoryList}>
      {rawCategoryData.map((item) => (
        <CategoryItem key={item.id} item={item}/>
      ))}
    </ul>
  </div>
);

export default Category;