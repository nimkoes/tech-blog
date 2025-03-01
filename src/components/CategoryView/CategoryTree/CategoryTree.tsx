import Link from "next/link";
import styles from "./CategoryTree.module.scss";

interface CategoryItem {
  id: string;
  displayName: string;
  fileName?: string;
  children?: CategoryItem[];
}

const CategoryTree = ({
                        data,
                        depth,
                        toggleFolder,
                        openFolders,
                        highlightText,
                        onFileSelect = () => {
                        },
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
              <span className={styles.arrow}>
                {openFolders[item.id] ? (
                  <svg viewBox="0 0 24 24">
                    <path fill="#AEB2B8" d="M5 8l7 8 7-8z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path fill="#AEB2B8" d="M8 5l8 7-8 7z"/>
                  </svg>
                )}
              </span>

              {/* IntelliJ 스타일 폴더 아이콘 */}
              <span className={styles.folderIcon}>
                  <svg viewBox="0 0 24 24">
                    <path fill="#cccccc"
                          d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                  </svg>
              </span>
              {highlightText(item.displayName)}
            </span>
          ) : (

            <Link href={`/post/${encodeURIComponent(item.fileName || "")}`} className={styles.file} legacyBehavior>
              <a
                className={styles.file}
                onClick={() => onFileSelect(item.displayName)} // 로그 기록
              >
                {highlightText(item.displayName)}
              </a>
            </Link>
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