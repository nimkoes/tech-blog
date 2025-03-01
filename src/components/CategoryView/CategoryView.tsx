"use client";

import {ReactNode, useState} from "react";
import styles from "./CategoryView.module.scss";
import categoryData from "@resources/category.json";
import CategoryControl from "~/components/CategoryView/CategoryControl/CategoryControl";

interface CategoryItem {
  id: string;
  name: string;
  mdPath?: string;
  children?: CategoryItem[];
}

const CategoryView = () => {
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
  // 📂 폴더 클릭 시 토글
  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={styles.categoryView}>
      <CategoryControl expandAll={expandAll} collapseAll={collapseAll} setSearchQuery={setSearchQuery}/>
      <CategoryTree data={categoryData} depth={0} toggleFolder={toggleFolder} openFolders={openFolders}
                    highlightText={highlightText}/>
    </div>
  );
};

// ✅ 폴더 & 파일을 트리 구조로 렌더링하는 재귀 컴포넌트
const CategoryTree = ({
                        data,
                        depth,
                        toggleFolder,
                        openFolders,
                        highlightText,
                      }: {
  data: CategoryItem[];
  depth: number;
  toggleFolder: (id: string) => void;
  openFolders: { [key: string]: boolean };
  highlightText: (text: string) => React.ReactNode;  // ✅ 타입 수정
}) => {
  return (
    <ul className={styles.categoryTree} style={{paddingLeft: `${depth * 15}px`}}>
      {data.map((item) => (
        <li key={item.id} className={styles.treeItem}>
          {item.children ? (
            <span onClick={() => toggleFolder(item.id)} className={styles.folder}>
              {openFolders[item.id] ? "📂" : "📁"} {highlightText(item.name)}
            </span>
          ) : (
            <span className={styles.file}>{highlightText(item.name)}</span>
          )}
          {item.children && openFolders[item.id] && (
            <CategoryTree data={item.children} depth={depth + 1} toggleFolder={toggleFolder} openFolders={openFolders}
                          highlightText={highlightText}/>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CategoryView;