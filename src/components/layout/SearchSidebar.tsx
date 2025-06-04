import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';
import styles from './SearchSidebar.module.scss';
import { getAllTags, getAllDocuments } from '~/utils/getAllDocuments';
import { useTagContext } from '~/context/TagContext';

export default function SearchSidebar() {
  const { isSearchOpen, onClose, onTagSelect, selectedTags } = useTagContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isSearchOpen) {
      const allTags = getAllTags();
      setTags(allTags);

      // 태그별 게시물 수 계산
      const documents = getAllDocuments();
      const counts: Record<string, number> = {};
      allTags.forEach(tag => {
        counts[tag] = documents.filter(doc => doc.tags.includes(tag)).length;
      });
      setTagCounts(counts);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, onClose]);

  const handleTagClick = (tag: string) => {
    onTagSelect(tag);
  };

  const filteredTags = tags.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isSearchOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.sidebar} ref={sidebarRef}>
        <div className={styles.header}>
          <div className={styles.searchInput}>
            <Search size={20} />
            <input
              type="text"
              className={styles.input}
              placeholder="search Tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.tagSection}>
            {/*<h2 className={styles.tagTitle}>Tags</h2>*/}
            <div className={styles.tagList}>
              {filteredTags.map(tag => (
                <button
                  key={tag}
                  className={
                    styles.tagItem + (selectedTags.includes(tag) ? ' ' + styles.active : '')
                  }
                  onClick={() => handleTagClick(tag)}
                >
                  <span className={styles.tagName}>{tag}</span>
                  <span className={styles.tagCount}>({tagCounts[tag] || 0})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 