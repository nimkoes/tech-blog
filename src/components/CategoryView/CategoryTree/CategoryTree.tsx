"use client";

import styles from "./CategoryTree.module.scss";

interface CategoryItem {
  id: string;
  name: string;
  mdPath?: string;
  children?: CategoryItem[];
}

const CategoryTree = ({
                        data,
                        depth,
                        toggleFolder,
                        openFolders,
                        highlightText,
                        onFileSelect = () => {},
                      }: {
  data: CategoryItem[];
  depth: number;
  toggleFolder: (id: string) => void;
  openFolders: { [key: string]: boolean };
  highlightText: (text: string) => React.ReactNode;
  onFileSelect: (fileName: string) => void;
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
            <span
              className={styles.file}
              onClick={() => onFileSelect && onFileSelect(item.name)}
            >{highlightText(item.name)}</span>
          )}
          {item.children && openFolders[item.id] && (
            <CategoryTree
              data={item.children}
              depth={depth + 1}
              toggleFolder={toggleFolder}
              openFolders={openFolders}
              highlightText={highlightText}
              onFileSelect={onFileSelect}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default CategoryTree;