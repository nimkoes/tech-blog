"use client";
import styles from './page.module.scss';
import { getAllDocuments, extractDateAndSerial } from '~/utils/getAllDocuments';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Toast from '~/components/common/Toast';
import { X } from 'lucide-react';
import { useTagContext } from '~/context/TagContext';

interface Document {
  title: string;
  tags: string[];
  fileName: string;
}

export default function Home() {
  const {
    selectedTags, setSelectedTags, handleTagSelect, toastMessage, setToastMessage, isSearchOpen, setIsSearchOpen
  } = useTagContext();
  const [posts, setPosts] = useState<Document[]>([]);

  useEffect(() => {
    const allPosts = getAllDocuments();
    setPosts(allPosts);
  }, []);

  const handleSearchTagSelect = (tag: string) => {
    handleTagSelect(tag);
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  const filteredPosts = selectedTags.length > 0
    ? posts.filter(post => selectedTags.some(tag => post.tags.includes(tag)))
    : posts;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.filterSection}>
          {selectedTags.length > 0 && (
            <div className={styles.selectedTags}>
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  className={styles.tagPill}
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag}
                  <X size={14} />
                </button>
              ))}
              <button
                className={styles.clearButton}
                onClick={clearTags}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.postList}>
          {filteredPosts.map(post => (
            <article key={post.fileName} className={styles.postCard}>
              <h2 className={styles.postTitle}>
                <Link href={`/post/${post.fileName}/`}>{post.title}</Link>
              </h2>
              <div className={styles.postMeta}>
                <time className={styles.postDate}>
                  {extractDateAndSerial(post.fileName).date}
                </time>
                <div className={styles.postTags}>
                  {post.tags.map(tag => (
                    <button
                      key={tag}
                      className={`${styles.tagPill} ${selectedTags.includes(tag) ? styles.active : ''}`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </main>
  );
} 