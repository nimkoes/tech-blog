import styles from "./PostHeader.module.scss";

interface PostHeaderProps {
  title: string;
  description: string;
  author: string;
  date: string;
  tags?: string[];
}

export default function PostHeader({ title, description, author, date, tags }: PostHeaderProps) {
  return (
    <header className={styles.postHeader}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.meta}>
        <span className={styles.author}>{author}</span>
        <span className={styles.date}>{date}</span>
      </div>
      {tags && (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}