import styles from './PostHeader.module.scss';
import TagModalWrapper from './TagModalWrapper';

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
      <TagModalWrapper
        documents={documents}
        currentTags={tags}
        allTags={allTags}
        tags={tags}
      />
    </div>
  );
} 