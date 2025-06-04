import Link from "next/link";
import styles from "./CategoryTree.module.scss";
import useCategoryStore from "../../../store/categoryStore";

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
  const searchQuery = useCategoryStore((state) => state.searchQuery);

  const basePath = process.env.NODE_ENV === 'production' ? '/tech-blog' : '';

  // 검색 결과에 따라 아이템을 필터링하는 함수
  const filterItems = (items: CategoryItem[]): CategoryItem[] => {
    if (!searchQuery) return items;

    return items.filter(item => {
      const matchesQuery = item.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      const hasMatchingChildren = item.children && filterItems(item.children).length > 0;
      
      if (item.children) {
        // 폴더인 경우, 검색어와 일치하거나 일치하는 자식이 있는 경우 표시
        return matchesQuery || hasMatchingChildren;
      } else {
        // 파일인 경우, 검색어와 일치하는 경우만 표시
        return matchesQuery;
      }
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterItems(item.children)
        };
      }
      return item;
    });
  };

  const filteredData = filterItems(data);

  return (
    <ul className={styles.categoryTree} style={{ paddingLeft: `${depth * 15}px` }}>
      {filteredData.map((item) => (
        <li key={item.id} className={styles.treeItem}>
          {item.children ? (
            // 📂 폴더 아이콘과 토글 버튼
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
            // 📄 파일 아이콘 + 파일명 링크
            <Link href={`/post/${encodeURIComponent(item.fileName || "")}`} legacyBehavior>
              <a className={styles.file} onClick={() => onFileSelect(item.displayName)}>
                {/* ✅ 파일 아이콘 추가 */}
                <span className={styles.fileIcon}>
                  <svg viewBox="0 0 24 24">
                    <path fill="#AEB2B8"
                          d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z"/>
                  </svg>
                </span>
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