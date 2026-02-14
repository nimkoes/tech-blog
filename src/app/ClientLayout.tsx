"use client";

import "~/styles/index.scss";
import styles from "./layout.module.scss";
import { useCallback, useMemo, useState, ReactNode } from "react";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import Toast from "~/components/common/Toast";
import { TagContext } from '~/context/TagContext';

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
      <div className={styles.layout}>
        <Header />
        <main className={styles.main}>
          <div className={styles.content}>
            {children}
          </div>
        </main>
        <Footer/>
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage('')}
          />
        )}
      </div>
    </TagContext.Provider>
  );
}
