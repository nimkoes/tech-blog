"use client";

// 웹폰트: 본문 Pretendard(필요한 글자만 받는 dynamic subset), 코드 JetBrains Mono, 코드 속 한글 D2Coding
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@fontsource-variable/jetbrains-mono";
import "d2coding/d2coding-subset.css";
import "~/styles/index.scss";
import styles from "./layout.module.scss";
import { useCallback, useMemo, useState, ReactNode } from "react";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import Toast from "~/components/common/Toast";
import { TagContext } from '~/context/TagContext';
import { BookmarkProvider } from '~/context/BookmarkContext';
import BookmarkModal from '~/components/bookmarks/BookmarkModal';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({children}: ClientLayoutProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      }

      if (prevTags.length >= 5) {
        setToastMessage('태그는 최대 5개까지 선택할 수 있습니다.');
        return prevTags;
      }

      return [...prevTags, tag];
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      selectedTags,
      setSelectedTags,
      handleTagSelect,
      toastMessage,
      setToastMessage,
    }),
    [handleTagSelect, selectedTags, toastMessage]
  );

  return (
    <TagContext.Provider value={contextValue}>
      <BookmarkProvider>
        <div className={styles.layout}>
          <a className={styles.skipLink} href="#main-content">본문으로 바로가기</a>
          <Header />
          <main id="main-content" className={styles.main} tabIndex={-1}>
            <div className={styles.content}>
              {children}
            </div>
          </main>
          <Footer/>
          <BookmarkModal />
          {toastMessage && (
            <Toast
              message={toastMessage}
              onClose={() => setToastMessage('')}
            />
          )}
        </div>
      </BookmarkProvider>
    </TagContext.Provider>
  );
}
