"use client";

import "~/styles/index.scss";
import styles from "./layout.module.scss";
import { useState, ReactNode } from "react";
import Header from "~/components/layout/Header";
import SearchSidebar from "~/components/layout/SearchSidebar";
import Footer from "~/components/layout/Footer";
import React from 'react';
import Toast from "~/components/common/Toast";
import { TagContext } from '~/context/TagContext';
import NoticePopup from '~/components/NoticePopup';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= 5) {
        setToastMessage('태그는 최대 5개까지 선택할 수 있습니다.');
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <TagContext.Provider value={{
      selectedTags, setSelectedTags, handleTagSelect, toastMessage, setToastMessage,
      isSearchOpen, setIsSearchOpen,
      onTagSelect: handleTagSelect
    }}>
      <div className={styles.layout}>
        <Header onSearchClick={() => setIsSearchOpen(true)} />
        <main className={styles.main}>
          <div className={styles.content}>
            {children}
          </div>
          <SearchSidebar isOpen={false} onClose={function(): void {
                      throw new Error("Function not implemented.");
                  } } />
        </main>
        <Footer />
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage('')}
          />
        )}
        <NoticePopup />
      </div>
    </TagContext.Provider>
  );
}