import {useState} from 'react';
import Link from 'next/link';
import styles from './Header.module.scss';
import SearchSidebar from './SearchSidebar';
import CategorySidebar from './CategorySidebar';
import {useTagContext} from '~/context/TagContext';
import { useTheme } from '~/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onSearchClick?: () => void
}

export default function Header({onSearchClick}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const tagContext = useTagContext();
  const { theme, toggleTheme } = useTheme();

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    if (tagContext && tagContext.setIsSearchOpen) {
      tagContext.setIsSearchOpen(true);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.left}>
            <Link href="/" className={styles.logo}>
              nimkoes
            </Link>
            <a
              href="https://github.com/nimkoes"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              GitHub
            </a>
          </div>
          <div className={styles.buttons}>
            <button
              className={styles.button}
              onClick={() => setIsCategoryOpen(true)}
            >
              카테고리
            </button>
            <button
              className={styles.button}
              onClick={handleSearchClick}
            >
              검색
            </button>
            {theme && (
              <button
                className={styles.themeToggle}
                aria-label="다크모드 토글"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Moon size={22} />
                ) : (
                  <Sun size={22} />
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}/>
      <CategorySidebar isOpen={isCategoryOpen} onClose={() => setIsCategoryOpen(false)}/>
    </>
  );
}
