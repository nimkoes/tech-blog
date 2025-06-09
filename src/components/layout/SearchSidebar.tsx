"use client";

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTagContext } from '~/context/TagContext';
import { getAllDocuments } from '~/utils/getAllDocuments';
import styles from './SearchSidebar.module.scss';

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchSidebar({ isOpen, onClose }: SearchSidebarProps) {
  const router = useRouter();
  const tagContext = useTagContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [titleResults, setTitleResults] = useState<any[]>([]);
  const [tagResults, setTagResults] = useState<string[]>([]);

  useEffect(() => {
    const allTags = getAllDocuments().reduce((acc: string[], doc) => {
      doc.tags.forEach((tag: string) => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
      return acc;
    }, []);
    setTags(allTags);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setTitleResults([]);
      setTagResults([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    
    // 제목 검색 결과
    const titleResults = getAllDocuments().filter(doc => 
      doc.title.toLowerCase().includes(searchTermLower)
    );
    setTitleResults(titleResults);

    // 태그 검색 결과
    const tagResults = tags.filter(tag => 
      tag.toLowerCase().includes(searchTermLower)
    );
    setTagResults(tagResults);
  }, [searchTerm, tags]);

  const handleTagClick = (tag: string) => {
    tagContext.handleTagSelect(tag);
  };

  const handleViewInList = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2 className={styles.title}>검색</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              className={styles.input}
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm.trim() !== '' && (
            <>
              {titleResults.length > 0 && (
                <div className={styles.searchResults}>
                  <h3 className={styles.tagTitle}>게시물 검색 결과</h3>
                  <div className={styles.postList}>
                    {titleResults.map((result) => (
                      <a
                        key={result.fileName}
                        href={`/tech-blog/post/${result.fileName}/`}
                        className={styles.postLink}
                      >
                        {result.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {tagResults.length > 0 && (
                <div className={styles.tagSection}>
                  <h3 className={styles.tagTitle}>태그 검색 결과</h3>
                  <div className={styles.tagList}>
                    {tagResults.map((tag) => (
                      <button
                        key={tag}
                        className={`${styles.tagItem} ${tagContext.selectedTags.includes(tag) ? styles.active : ''}`}
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tagContext.selectedTags.length > 0 && (
            <div className={styles.selectedTagsSection}>
              <div className={styles.selectedTagsHeader}>
                <h3 className={styles.tagTitle}>선택한 태그</h3>
                <button className={styles.viewInListLink} onClick={handleViewInList}>
                  목록에서 확인하기
                </button>
              </div>
              <div className={styles.tagList}>
                {tagContext.selectedTags.map((tag: string) => (
                  <button
                    key={tag}
                    className={`${styles.tagItem} ${styles.active}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.tagSection}>
            <h3 className={styles.tagTitle}>전체 태그</h3>
            <div className={styles.tagList}>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`${styles.tagItem} ${tagContext.selectedTags.includes(tag) ? styles.active : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 