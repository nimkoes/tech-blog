"use client";

import styles from "./PostHeader.module.scss";
import TagModalWrapper from '../../../components/PostHeader/TagModalWrapper';
import { useLogStore } from '../../../store/logStore';

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
  const { addLog } = useLogStore();

  const handleLogMessage = (message: string) => {
    console.log('handleLogMessage called with:', message);
    const now = new Date();
    const timestamp = now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    console.log('Timestamp generated:', timestamp);
    addLog(`${timestamp} - ${message}`);
    console.log('Log added to store');
  };

  return (
    <header className={styles.postHeader}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.meta}>
        {author && <span className={styles.author}>{author}</span>}
        {date && <span className={styles.date}>{date}</span>}
      </div>
      {tags && tags.length > 0 && (
        <TagModalWrapper
          documents={documents}
          currentTags={[]}
          allTags={allTags}
          tags={tags}
          onLogMessage={handleLogMessage}
        />
      )}
    </header>
  );
}