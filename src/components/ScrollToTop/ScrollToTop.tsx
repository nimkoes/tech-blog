"use client";

import { useEffect, useState } from "react";
import styles from "./ScrollToTop.module.scss";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // contentsView 요소 찾기
    const contentsView = document.querySelector('[class*="layout_contentsView_"]');
    
    if (!contentsView) {
      console.warn('ContentsView element not found');
      return;
    }

    const checkScrollPosition = () => {
      const scrollTop = (contentsView as HTMLElement).scrollTop;
      const shouldBeVisible = scrollTop > 100;
      setIsVisible(shouldBeVisible);
    };

    // 초기 스크롤 위치 체크
    checkScrollPosition();

    // 스크롤 이벤트 리스너 등록
    contentsView.addEventListener("scroll", checkScrollPosition, { passive: true });
    return () => contentsView.removeEventListener("scroll", checkScrollPosition);
  }, []);

  const scrollToTop = () => {
    const contentsView = document.querySelector('[class*="layout_contentsView_"]');
    if (contentsView) {
      (contentsView as HTMLElement).scrollTo({
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