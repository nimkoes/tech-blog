import { useState } from 'react';
import Link from 'next/link';
import styles from './CategorySidebar.module.scss';
import categoryData from '@/resources/category.json';

interface Category {
  id: string;
  displayName: string;
  fileName?: string;
  tags?: string[];
  children?: Category[];
}

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      toggleCategory(category.id);
    }
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className={styles.categoryItem} style={{ paddingLeft: `${level * 16}px` }}>
        <div 
          className={styles.categoryHeader}
          onClick={() => handleCategoryClick(category)}
        >
          {hasChildren && (
            <button 
              className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
            >
              ▼
            </button>
          )}
          {category.fileName ? (
            <Link href={`/post/${category.fileName}`} className={styles.categoryLink}>
              {category.displayName}
            </Link>
          ) : (
            <span className={styles.categoryName}>{category.displayName}</span>
          )}
        </div>
        {hasChildren && isExpanded && category.children && (
          <div className={styles.children}>
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
      <div className={styles.sidebar} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>카테고리</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>
          {categoryData.map(category => renderCategory(category))}
        </div>
      </div>
    </div>
  );
} 