import styles from './PostHeader.module.scss';

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
  tags: string[];
  documents: DocumentInfo[];
  allTags: string[];
}

export function PostHeader({ title, tags, documents, allTags }: PostHeaderProps) {
  return (
    <div className={styles.postHeader}>
      <h1 className={styles.title}>{title}</h1>
      {/* 태그 등 추가 UI 필요시 여기에 구현 */}
    </div>
  );
} 