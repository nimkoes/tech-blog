"use client";

// React
import {useState, useEffect} from 'react';
import Link from 'next/link';

// Components
import Toast from '~/components/common/Toast';
import {X} from 'lucide-react';

// Utils & Context
import {getAllDocuments, extractSerial} from '~/utils/getAllDocuments';
import {useTagContext} from '~/context/TagContext';

// Styles
import styles from './page.module.scss';

interface Document {
  title: string;
  tags: string[];
  fileName: string;
  regDate: string;
  lastModifiedDate: string;
}

export default function Home() {
  const {
    selectedTags, setSelectedTags, handleTagSelect, toastMessage, setToastMessage
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
    ? posts.filter(post => selectedTags.some((tag: string) => post.tags.includes(tag)))
    : posts;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.filterSection}>
          {selectedTags.length > 0 && (
            <div className={styles.selectedTags}>
              {selectedTags.map((tag: string) => (
                <button
                  key={tag}
                  className={styles.tagPill}
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag}
                  <X size={14}/>
                </button>
              ))}
              <button
                className={styles.clearButton}
                onClick={clearTags}
              >
                <X size={16}/>
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
                  ✚ {post.regDate}
                </time>

                {/* regDate !== lastModifiedDate 인 경우에만 최종수정일 표시 */}
                {post.regDate !== post.lastModifiedDate && (
                  <time className={styles.postDate}>
                    ✎ {post.lastModifiedDate}
                  </time>
                )}

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
