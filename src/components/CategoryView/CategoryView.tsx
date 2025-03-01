"use client";

import {ReactNode, useState} from "react";
import styles from "./CategoryView.module.scss";
import categoryData from "@resources/category.json";
import CategoryControl from "./CategoryControl/CategoryControl";
import CategoryTree from "./CategoryTree/CategoryTree";

interface CategoryItem {
  id: string;
  name: string;
  mdPath?: string;
  children?: CategoryItem[];
}

const CategoryView = ({
                        onClose,
                        onFileSelect,
                      }: {
  onClose: () => void;
  onFileSelect: (fileName: string) => void;

}) => { // ✅ onClose props 추가
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");

  // 📂 전체 폴더 열기
  const expandAll = () => {
    const allOpen: { [key: string]: boolean } = {};
    const traverse = (items: CategoryItem[]) => {
      items.forEach((item) => {
        if (item.children) {
          allOpen[item.id] = true;
          traverse(item.children);
        }
      });
    };
    traverse(categoryData);
    setOpenFolders(allOpen);
  };

  // 📁 전체 폴더 접기
  const collapseAll = () => {
    setOpenFolders({});
  };

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

  return (
    <div className={styles.categoryView}>
      <CategoryControl
        expandAll={expandAll}
        collapseAll={collapseAll}
        setSearchQuery={setSearchQuery}
        onClose={onClose} // ✅ 부모에서 전달받은 onClose 함수 실행
      />
      <CategoryTree
        data={categoryData}
        depth={0}
        toggleFolder={(id) =>
          setOpenFolders((prev) => ({
            ...prev,
            [id]: !prev[id],
          }))
        }
        openFolders={openFolders}
        highlightText={highlightText}
        onFileSelect={onFileSelect}
      />
    </div>
  );
};

export default CategoryView;