'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './DateTooltip.module.scss';

interface DateTooltipProps {
  regDate: string;
  lastModifiedDate: string;
  children: React.ReactNode;
}

export default function DateTooltip({ regDate, lastModifiedDate, children }: DateTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTooltip]);

  const updateTooltipPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY - 5,
        left: rect.left + window.scrollX
      });
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      updateTooltipPosition();
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowTooltip(false);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      updateTooltipPosition();
      setShowTooltip(!showTooltip);
    }
  };

  const handleCloseTooltip = () => {
    setShowTooltip(false);
  };

  const tooltipContent = showTooltip && (
    <div 
      className={styles.tooltip}
      style={{
        position: 'absolute',
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        zIndex: 999999
      }}
    >
      <button 
        className={styles.closeButton}
        onClick={handleCloseTooltip}
        aria-label="툴팁 닫기"
      >
        <X size={12} />
      </button>
      <div className={styles.tooltipContent}>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>등록일:</span>
          <span className={styles.dateValue}>{regDate}</span>
        </div>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>최종수정일:</span>
          <span className={styles.dateValue}>{lastModifiedDate}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        ref={containerRef}
        className={styles.container}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className={styles.content}>
          {children}
        </div>
      </div>
      
      {showTooltip && createPortal(tooltipContent, document.body)}
    </>
  );
} 