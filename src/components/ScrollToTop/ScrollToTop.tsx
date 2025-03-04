"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./ScrollToTop.module.scss";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const checkScrollPosition = useCallback((element: HTMLElement) => {
    const scrollTop = element.scrollTop;
    const shouldBeVisible = scrollTop > 100;
    setIsVisible(shouldBeVisible);
  }, []);

  useEffect(() => {
    // 스크롤 가능한 컨테이너 찾기
    const scrollContainer = document.querySelector('.contentsView') as HTMLElement;
    
    if (!scrollContainer) {
      console.warn('Scroll container not found');
      return;
    }

    // 초기 스크롤 위치 체크
    checkScrollPosition(scrollContainer);

    // 스크롤 이벤트 리스너 등록
    const handleScroll = () => checkScrollPosition(scrollContainer);
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [checkScrollPosition]);

  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.contentsView') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  return (
    <button 
      className={`${styles.scrollToTop} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      type="button"
    >
      ⬆
    </button>
  );
}