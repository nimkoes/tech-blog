"use client";

import styles from "./PostHeader.module.scss";
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
    const now = new Date();
    const timestamp = now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    addLog(`${timestamp} - ${message}`);
  };

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