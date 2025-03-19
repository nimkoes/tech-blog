"use client";

import {useEffect, useState} from 'react';
import styles from './TagModal.module.scss';
import CloseIcon from '../common/icons/CloseIcon';
import Button from '../common/Button/Button';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import Toast from '../common/Toast/Toast';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTags: string[];
  allTags: string[];
  documents: Array<{
    title: string;
    tags: string[];
    fileName: string;
  }>;
  onLogMessage?: (message: string) => void;
}

export default function TagModal({isOpen, onClose, currentTags, allTags, documents, onLogMessage}: TagModalProps) {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set(currentTags));
  const [filteredDocs, setFilteredDocs] = useState(documents);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const currentFileName = pathname?.split('/').pop() || '';

  useEffect(() => {
  }, [documents, currentTags, allTags]);

  // 모달이 열릴 때마다 태그 선택 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setActiveTags(new Set(currentTags));
      setToastMessage(null);
    }
  }, [isOpen, currentTags]);

  // 태그 정렬: 활성화된 태그가 앞쪽에, 그 다음은 가나다순
  const sortedTags = [...allTags].sort((a, b) => {
    const isActiveA = activeTags.has(a);
    const isActiveB = activeTags.has(b);
    if (isActiveA && !isActiveB) return -1;
    if (!isActiveA && isActiveB) return 1;
    return a.localeCompare(b);
  });

  // 활성화된 태그에 따라 문서 필터링
  useEffect(() => {
    if (activeTags.size === 0) {
      setFilteredDocs(documents);
    } else {
      // 대소문자를 구분하지 않고 태그 비교
      const normalizedActiveTags = Array.from(activeTags).map(tag => tag.toLowerCase());

      const filtered = documents.filter(doc => {
        const normalizedDocTags = doc.tags.map(tag => tag.toLowerCase());

        // 활성 태그 중 하나라도 문서의 태그에 포함되어 있는지 확인
        return normalizedDocTags.some(docTag =>
          normalizedActiveTags.includes(docTag)
        );
      });

      // 태그 일치 개수에 따라 정렬
      filtered.sort((a, b) => {
        const matchCountA = a.tags.filter(tag =>
          normalizedActiveTags.includes(tag.toLowerCase())
        ).length;
        const matchCountB = b.tags.filter(tag =>
          normalizedActiveTags.includes(tag.toLowerCase())
        ).length;
        return matchCountB - matchCountA;
      });

      setFilteredDocs(filtered);
    }
  }, [activeTags, documents]);

  const toggleTag = (tag: string) => {
    setActiveTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        if (newTags.size >= 5) {
          setToastMessage('최대 5개의 태그를 선택할 수 있습니다.');
          return prev;
        }
        newTags.add(tag);
      }
      return newTags;
    });
  };

  const handleDocumentClick = (doc: { title: string; fileName: string }) => {
    console.log('Document Clicked:', doc.title);
    if (onLogMessage) {
      console.log('Logging message:', doc.title);
      // 모달을 닫고
      onClose();
      
      // 로그를 기록
      onLogMessage(`${doc.title}`);
      
      console.log('Log recorded, navigating to:', `/post/${doc.fileName}`);
      // 로그가 기록된 후 페이지 이동
      router.push(`/post/${doc.fileName}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          {/* 헤더 영역 */}
          <div className={styles.modalHeader}>
            <Button
              variant="icon"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="모달 닫기"
            >
              <CloseIcon/>
            </Button>
          </div>

          {/* 태그 영역 */}
          <div className={styles.tagSection}>
            {sortedTags.map(tag => (
              <button
                key={tag}
                className={`${styles.tagButton} ${activeTags.has(tag) ? styles.active : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 문서 목록 영역 */}
          <div className={styles.documentSection}>
            {filteredDocs.length > 0 ? (
              filteredDocs.map(doc => (
                <div key={doc.fileName} className={styles.documentItem}>
                  <button
                    className={`${styles.documentTitle} ${doc.fileName === currentFileName ? styles.current : ''}`}
                    onClick={() => handleDocumentClick(doc)}
                  >
                    {doc.title}
                    {doc.fileName === currentFileName && (
                      <span className={styles.currentIndicator}>현재 문서</span>
                    )}
                  </button>
                  <div className={styles.documentTags}>
                    {doc.tags.map(tag => (
                      <span
                        key={tag}
                        className={`${styles.documentTag} ${activeTags.has(tag) ? styles.active : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                일치하는 문서가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
} 