"use client";

// React
import Link from 'next/link';

// Components
import Toast from '~/components/common/Toast';
import DateTooltip from '~/components/common/DateTooltip';
import { X } from 'lucide-react';

// Utils & Context
import { useTagContext } from '~/context/TagContext';

// Styles
import styles from './page.module.scss';

interface Document {
  title: string;
  tags: string[];
  fileName: string;
  regDate: string;
  lastModifiedDate: string;
}

interface PostListProps {
  initialPosts: Document[];
}

export default function PostList({ initialPosts }: PostListProps) {
  const {
    selectedTags, setSelectedTags, handleTagSelect, toastMessage, setToastMessage
  } = useTagContext();

  const posts = initialPosts;

  const clearTags = () => {
    setSelectedTags([]);
  };

  const filteredPosts = selectedTags.length > 0
    ? posts.filter(post => selectedTags.some((tag: string) => post.tags.includes(tag)))
    : posts;

  return (
    <>
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
              {(() => {
                const lastModified = new Date(post.lastModifiedDate);
                const now = new Date();
                const diffTime = now.getTime() - lastModified.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                return (
                  <Link href={`/post/${post.fileName}/`}>
                    {diffDays <= 7 ? '🅝 ' : ''}{post.title}
                  </Link>
                );
              })()}
            </h2>
            <div className={styles.postMeta}>
              <DateTooltip regDate={post.regDate} lastModifiedDate={post.lastModifiedDate}>
                <time className={styles.postDate}>
                  ✎ {post.lastModifiedDate}
                </time>
              </DateTooltip>

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

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </>
  );
}
