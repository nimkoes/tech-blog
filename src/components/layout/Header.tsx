import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';
import SearchSidebar from './SearchSidebar';
import CategorySidebar from './CategorySidebar';
import { useTheme } from '~/context/ThemeContext';
import { Compass, Search, Sun, Moon } from 'lucide-react';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showHeaderMission, setShowHeaderMission] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const handleSearchClick = () => {
    setIsCategoryOpen(false);
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    searchButtonRef.current?.focus();
  };

  const handleCategoryOpen = () => {
    setIsSearchOpen(false);
    setIsCategoryOpen(true);
  };

  const handleCategoryClose = () => {
    setIsCategoryOpen(false);
    categoryButtonRef.current?.focus();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCommandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isCommandK) return;
      event.preventDefault();
      setIsCategoryOpen(false);
      setIsSearchOpen(true);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const isHome = pathname === '/';
    if (!isHome) {
      setShowHeaderMission(false);
      return;
    }

    const target = document.getElementById('home-intro-anchor');
    if (!target) {
      setShowHeaderMission(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowHeaderMission(!entry.isIntersecting);
      },
      {
        threshold: 0.12,
        rootMargin: '-56px 0px 0px 0px',
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.left}>
            <Link href="/" className={styles.logo}>
              nimkoes tech
            </Link>
            <a
              href="https://github.com/nimkoes"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              github
            </a>
          </div>
          <p
            className={`${styles.missionInHeader} ${showHeaderMission ? styles.missionVisible : ''}`}
            aria-hidden={!showHeaderMission}
          >
            <span className={styles.missionText}>I work diligently to become lazy ☕</span>
          </p>
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.exploreButton}
              ref={categoryButtonRef}
              onClick={handleCategoryOpen}
              aria-label="탐색 패널 열기"
              aria-expanded={isCategoryOpen}
              aria-controls="category-sidebar"
            >
              <Compass size={16} />
              <span className={styles.exploreLabel}>탐색</span>
            </button>
            <button
              type="button"
              className={styles.searchButton}
              ref={searchButtonRef}
              onClick={handleSearchClick}
              aria-label="검색 열기"
              aria-expanded={isSearchOpen}
              aria-controls="search-sidebar"
            >
              <Search size={16} />
              <span className={styles.searchLabel}>검색, 태그, 문서 이동</span>
              <span className={styles.shortcut}>⌘K / Ctrl+K</span>
            </button>
            {theme && (
              <button
                type="button"
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
      <SearchSidebar isOpen={isSearchOpen} onClose={handleSearchClose} />
      <CategorySidebar isOpen={isCategoryOpen} onClose={handleCategoryClose} />
    </>
  );
}
