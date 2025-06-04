import styles from './Header.module.scss';
import Link from 'next/link';
import { useTagContext } from '~/context/TagContext';

interface HeaderProps {
  onSearchClick: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  const tagContext = useTagContext();
  const handleClick = () => {
    if (onSearchClick) onSearchClick();
    else if (tagContext && tagContext.setIsSearchOpen) tagContext.setIsSearchOpen(true);
  };
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Tech Blog
        </Link>
        <nav className={styles.nav}>
          <button 
            className={styles.searchButton}
            onClick={handleClick}
            aria-label="검색"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
} 