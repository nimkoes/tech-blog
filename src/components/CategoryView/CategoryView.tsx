"use client";

import {useState} from "react";
import styles from "./CategoryView.module.scss";
import categoryData from "@resources/category.json";

interface CategoryItem {
  id: string;
  name: string;
  mdPath?: string;
  children?: CategoryItem[];
}

const CategoryView = () => {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});

  // 📂 폴더 클릭 시 열고 닫기
  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={styles.categoryView}>
      <CategoryTree data={categoryData} depth={0} toggleFolder={toggleFolder} openFolders={openFolders}/>
    </div>
  );
};

// ✅ 폴더 & 파일을 트리 구조로 렌더링하는 재귀 컴포넌트
const CategoryTree = ({
                        data,
                        depth,
                        toggleFolder,
                        openFolders,
                      }: {
  data: CategoryItem[];
  depth: number;
  toggleFolder: (id: string) => void;
  openFolders: { [key: string]: boolean };
}) => {
  return (
    <ul className={styles.categoryTree} style={{paddingLeft: `${depth * 15}px`}}>
      {data.map((item) => (
        <li key={item.id} className={styles.treeItem}>
          {item.children ? (
            <span onClick={() => toggleFolder(item.id)} className={styles.folder}>
              {openFolders[item.id] ? "📂" : "📁"} {item.name}
            </span>
          ) : (
            <span className={styles.file}>📄 {item.name}</span>
          )}
          {item.children && openFolders[item.id] && (
            <CategoryTree data={item.children} depth={depth + 1} toggleFolder={toggleFolder} openFolders={openFolders}/>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CategoryView;