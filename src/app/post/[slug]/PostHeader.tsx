"use client";

import styles from "./PostHeader.module.scss";

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
  return (
    <header className={styles.postHeader}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.meta}>
        {author && <span className={styles.author}>{author}</span>}
        {date && <span className={styles.date}>{date}</span>}
      </div>
      {/* 태그 등 추가 UI 필요시 여기에 구현 */}
    </header>
  );
}