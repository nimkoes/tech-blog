'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Save, Trash2, X } from 'lucide-react';
import { useBookmarks } from '~/context/BookmarkContext';
import useBodyScrollLock from '~/hooks/useBodyScrollLock';
import {
  createDefaultBookmarkName,
  isCustomBookmarkName,
  MAX_BOOKMARK_CUSTOM_NAME_LENGTH,
  type BookmarkLocation,
} from '~/utils/bookmarks';
import styles from './HeadingBookmarkButton.module.scss';

export default function HeadingBookmarkButton(location: BookmarkLocation) {
  const { findBookmark, saveBookmark, removeBookmarks } = useBookmarks();
  const existing = findBookmark(location);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const defaultName = createDefaultBookmarkName(location.postTitle, location.headingText);
  useBodyScrollLock(isOpen);

  useEffect(() => setMounted(true), []);

  const openEditor = () => {
    setName(existing && isCustomBookmarkName(existing)
      ? existing.name.slice(0, MAX_BOOKMARK_CUSTOM_NAME_LENGTH)
      : '');
    setErrorMessage('');
    setConfirmDelete(false);
    setIsOpen(true);
  };

  const closeEditor = () => {
    setIsOpen(false);
    setConfirmDelete(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeEditor();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [isOpen]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const saved = saveBookmark(location, name);
    if (!saved) {
      setErrorMessage('북마크는 최대 30개까지 저장할 수 있습니다.');
      return;
    }
    closeEditor();
  };

  const editor = mounted && isOpen ? createPortal(
    <div className={styles.overlay} onMouseDown={event => {
      if (event.target === event.currentTarget) closeEditor();
    }}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`bookmark-editor-${location.headingId}`}
      >
        <header>
          <div>
            <p>{existing ? 'EDIT BOOKMARK' : 'NEW BOOKMARK'}</p>
            <h2 id={`bookmark-editor-${location.headingId}`}>
              {existing ? '북마크 수정' : '북마크 추가'}
            </h2>
          </div>
          <button type="button" onClick={closeEditor} aria-label="북마크 편집 닫기">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={onSubmit}>
          <div className={styles.fieldLabel}>
            <label htmlFor={`bookmark-name-${location.headingId}`}>커스텀 이름 (선택)</label>
            <span>{name.length}/{MAX_BOOKMARK_CUSTOM_NAME_LENGTH}</span>
          </div>
          <input
            ref={inputRef}
            id={`bookmark-name-${location.headingId}`}
            value={name}
            onChange={event => {
              setName(event.target.value);
              setErrorMessage('');
            }}
            maxLength={MAX_BOOKMARK_CUSTOM_NAME_LENGTH}
            placeholder="비워두면 기본 이름을 사용합니다."
          />
          {errorMessage && <p className={styles.errorMessage} role="alert">{errorMessage}</p>}
          <p className={styles.location}>기본 이름 · {defaultName}</p>

          {confirmDelete && existing ? (
            <div className={styles.deleteConfirm}>
              <span>이 북마크를 삭제할까요?</span>
              <div>
                <button type="button" onClick={() => setConfirmDelete(false)}>취소</button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => {
                    removeBookmarks([existing.id]);
                    closeEditor();
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.actions}>
              {existing && (
                <button
                  type="button"
                  className={styles.deleteAction}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  삭제
                </button>
              )}
              <span />
              <button type="button" onClick={closeEditor}>취소</button>
              <button type="submit" className={styles.saveButton}>
                <Save size={16} aria-hidden="true" />
                저장
              </button>
            </div>
          )}
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${existing ? styles.bookmarked : ''}`}
        onClick={openEditor}
        aria-label={`${location.headingText} ${existing ? '북마크 수정' : '북마크 추가'}`}
        aria-pressed={Boolean(existing)}
        title={existing ? '북마크 수정' : '이 제목을 북마크'}
      >
        <Bookmark size={15} fill={existing ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
      {editor}
    </>
  );
}
