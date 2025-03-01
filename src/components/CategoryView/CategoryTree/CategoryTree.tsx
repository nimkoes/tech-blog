import styles from "~/components/CategoryView/CategoryView.module.scss";

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
                      }: {
  data: CategoryItem[];
  depth: number;
  toggleFolder: (id: string) => void;
  openFolders: { [key: string]: boolean };
  highlightText: (text: string) => JSX.Element | string;
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

export default CategoryTree;
