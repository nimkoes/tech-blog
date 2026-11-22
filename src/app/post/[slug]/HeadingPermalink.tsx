import { Link as LinkIcon } from 'lucide-react';
import styles from './page.module.scss';

interface HeadingPermalinkProps {
  id: string;
  heading: string;
}

export default function HeadingPermalink({ id, heading }: HeadingPermalinkProps) {
  return (
    <button
      type="button"
      className={styles.headingPermalink}
      data-heading-permalink={id}
      aria-label={`${heading} 제목 링크 복사`}
      title="이 제목의 링크 복사"
    >
      <LinkIcon size={15} />
    </button>
  );
}
