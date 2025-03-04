"use client";

import { useEffect, useState } from 'react';
import styles from './ImagePopup.module.scss';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');

  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && !target.closest(`.${styles.popupContent}`)) {
        e.preventDefault();
        setCurrentImage(target.getAttribute('src') || '');
        setIsOpen(true);
      }
    };

    document.addEventListener('click', handleImageClick);

    return () => {
      document.removeEventListener('click', handleImageClick);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className={styles.popup} 
      onClick={() => setIsOpen(false)}
    >
      <div className={styles.popupContent}>
        <img 
          src={currentImage} 
          alt="Enlarged view"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
} 