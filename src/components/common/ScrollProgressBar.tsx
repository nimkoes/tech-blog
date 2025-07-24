"use client";

import React, { useState, useEffect } from 'react';
import styles from './ScrollProgressBar.module.scss'; // SCSS 모듈 사용

const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = window.scrollY;
      if (totalHeight > 0) {
        setScrollProgress((scrolled / totalHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // 컴포넌트 마운트 시 초기 값 설정
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ScrollProgressBar;
