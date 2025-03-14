"use client";

import { useState } from 'react';
import styles from "./PostHeader.module.scss";
import TagModal from '../../../components/TagModal/TagModal';

interface DocumentInfo {
  title: string;
  tags: string[];
  fileName: string;
}

interface PostHeaderProps {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
  documents: DocumentInfo[];
  allTags: string[];
}

export default function PostHeader({ 
  title, 
  description, 
  author, 
  date, 
  tags = [], 
  documents,
  allTags 
}: PostHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagClick = (tag: string) => {
    setSelectedTags([tag]);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className={styles.postHeader}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.meta}>
          {author && <span className={styles.author}>{author}</span>}
          {date && <span className={styles.date}>{date}</span>}
        </div>
        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <button
                key={tag}
                className={styles.tag}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </header>

      <TagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentTags={selectedTags}
        allTags={allTags}
        documents={documents}
      />
    </>
  );
}