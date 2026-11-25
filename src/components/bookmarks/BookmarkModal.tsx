'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Check, RotateCcw, Search, Settings, Trash2, X } from 'lucide-react';
import { useBookmarks } from '~/context/BookmarkContext';
import useBodyScrollLock from '~/hooks/useBodyScrollLock';
import { isCustomBookmarkName } from '~/utils/bookmarks';
import styles from './BookmarkModal.module.scss';

const DELETE_DELAY_MS = 10_000;

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('ko-KR');
}

export default function BookmarkModal() {
  const {
    bookmarks,
    isManagerOpen,
    managerInitialQuery,
    closeManager,
    removeBookmarks,
  } = useBookmarks();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, number>>({});
  const [countdownNow, setCountdownNow] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const confirmCancelRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const confirmBulkDeleteRef = useRef(false);
  useBodyScrollLock(isManagerOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (Object.keys(pendingDeletions).length === 0) return;

    const updatePendingDeletions = () => {
      const now = performance.now();
      setCountdownNow(now);
      const expiredIds = Object.entries(pendingDeletions)
        .filter(([, expiresAt]) => expiresAt <= now)
        .map(([bookmarkId]) => bookmarkId);
      if (expiredIds.length === 0) return;

      removeBookmarks(expiredIds);
      setPendingDeletions(current => {
        const next = { ...current };
        expiredIds.forEach(bookmarkId => delete next[bookmarkId]);
        return next;
      });
    };

    updatePendingDeletions();
    const timer = window.setInterval(updatePendingDeletions, 250);
    return () => window.clearInterval(timer);
  }, [pendingDeletions, removeBookmarks]);

  useEffect(() => {
    confirmBulkDeleteRef.current = confirmBulkDelete;
    if (confirmBulkDelete) {
      requestAnimationFrame(() => confirmCancelRef.current?.focus());
    }
  }, [confirmBulkDelete]);

  useEffect(() => {
    if (!isManagerOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery(managerInitialQuery);
    setIsSelecting(false);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    requestAnimationFrame(() => searchRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmBulkDeleteRef.current) {
          setConfirmBulkDelete(false);
        } else {
          closeManager();
        }
        return;
      }
      if (event.key !== 'Tab') return;

      const focusRoot = confirmBulkDeleteRef.current ? confirmDialogRef.current : panelRef.current;
      const focusable = focusRoot?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
      previousFocusRef.current?.focus();
    };
  }, [closeManager, isManagerOpen, managerInitialQuery]);

  const filteredBookmarks = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return bookmarks;
    return bookmarks.filter(bookmark =>
      normalize(`${bookmark.name} ${bookmark.postTitle} ${bookmark.headingText}`).includes(normalizedQuery)
    );
  }, [bookmarks, query]);

  const scheduleDeletion = (bookmarkId: string, startedAt: number) => {
    setCountdownNow(startedAt);
    setPendingDeletions(current => ({
      ...current,
      [bookmarkId]: startedAt + DELETE_DELAY_MS,
    }));
  };

  const cancelDeletion = (bookmarkId: string) => {
    setPendingDeletions(current => {
      const next = { ...current };
      delete next[bookmarkId];
      return next;
    });
  };

  const deleteBookmarksImmediately = (ids: string[]) => {
    removeBookmarks(ids);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!mounted) return null;

  const modal = isManagerOpen ? (
    <div className={styles.overlay} onMouseDown={event => {
      if (event.target === event.currentTarget) closeManager();
    }}>
      <section
        id="bookmark-manager"
        ref={panelRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmark-modal-title"
      >
        <header className={styles.header}>
          <h2 id="bookmark-modal-title">북마크</h2>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setConfirmBulkDelete(true)}
              disabled={!isSelecting || selectedIds.size === 0}
              aria-label={`선택한 북마크 ${selectedIds.size}개 삭제`}
              title="선택한 북마크 삭제"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${isSelecting ? styles.activeAction : ''}`}
              onClick={() => {
                setIsSelecting(value => !value);
                setSelectedIds(new Set());
              }}
              aria-pressed={isSelecting}
              aria-label={isSelecting ? '북마크 선택 종료' : '여러 북마크 선택'}
              title="북마크 선택"
            >
              <Settings size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={closeManager}
              aria-label="북마크 닫기"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className={styles.searchArea}>
          <Search size={17} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="북마크 이름, 글 제목, 제목행 검색"
            aria-label="북마크 검색"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className={styles.summary}>
          <span>{filteredBookmarks.length}개의 북마크</span>
          {isSelecting && <strong>{selectedIds.size}개 선택</strong>}
        </div>

        <div className={styles.listViewport}>
          {filteredBookmarks.length === 0 ? (
            <div className={styles.emptyState}>
              <Bookmark size={28} aria-hidden="true" />
              <strong>{bookmarks.length === 0 ? '저장한 북마크가 없습니다.' : '검색 결과가 없습니다.'}</strong>
              <p>
                {bookmarks.length === 0
                  ? '게시물의 제목행 오른쪽에서 북마크를 추가할 수 있습니다.'
                  : '다른 이름이나 글 제목으로 검색해 보세요.'}
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {filteredBookmarks.map(bookmark => {
                const selected = selectedIds.has(bookmark.id);
                const deletionExpiresAt = pendingDeletions[bookmark.id];
                const isPendingDeletion = deletionExpiresAt !== undefined;
                const remainingSeconds = isPendingDeletion
                  ? Math.max(1, Math.ceil((deletionExpiresAt - countdownNow) / 1000))
                  : 0;
                return (
                  <li
                    key={bookmark.id}
                    className={`${selected ? styles.selectedItem : ''} ${isPendingDeletion ? styles.pendingDeleteItem : ''}`}
                  >
                    {isSelecting && !isPendingDeletion ? (
                      <button
                        type="button"
                        className={styles.selectionRow}
                        onClick={() => toggleSelection(bookmark.id)}
                        aria-label={`${bookmark.name} 선택`}
                        aria-pressed={selected}
                      >
                        <span className={styles.selectionIndicator} aria-hidden="true">
                          {selected && <Check size={14} />}
                        </span>
                        <span className={styles.selectionText}>
                          <strong>{bookmark.name}</strong>
                          {isCustomBookmarkName(bookmark) && (
                            <small>{bookmark.defaultName}</small>
                          )}
                        </span>
                      </button>
                    ) : (
                      <>
                        {isPendingDeletion ? (
                          <div className={`${styles.bookmarkLink} ${styles.pendingBookmark}`} aria-disabled="true">
                            <strong>{bookmark.name}</strong>
                            {isCustomBookmarkName(bookmark) && (
                              <small>{bookmark.defaultName}</small>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={`/post/${bookmark.postSlug}/#${bookmark.headingId}`}
                            className={styles.bookmarkLink}
                            onClick={closeManager}
                          >
                            <strong>{bookmark.name}</strong>
                            {isCustomBookmarkName(bookmark) && (
                              <small>{bookmark.defaultName}</small>
                            )}
                          </Link>
                        )}
                        {isPendingDeletion ? (
                          <button
                            type="button"
                            className={styles.undoDeleteButton}
                            onClick={() => cancelDeletion(bookmark.id)}
                            aria-label={`${bookmark.name} 삭제 되돌리기, ${remainingSeconds}초 남음`}
                            title="삭제 되돌리기"
                          >
                            <RotateCcw size={15} aria-hidden="true" />
                            <span aria-hidden="true">{remainingSeconds}s</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={event => scheduleDeletion(bookmark.id, event.timeStamp)}
                            aria-label={`${bookmark.name} 북마크 삭제`}
                            title="북마크 삭제"
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className={styles.footer}>
          <Bookmark size={14} aria-hidden="true" />
          <span>브라우저 단위로 저장 됩니다.</span>
        </footer>

        {confirmBulkDelete && (
          <div
            className={styles.confirmOverlay}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="bulk-delete-title"
            aria-describedby="bulk-delete-description"
          >
            <div ref={confirmDialogRef} className={styles.confirmBox}>
              <Trash2 size={24} aria-hidden="true" />
              <h3 id="bulk-delete-title">선택한 북마크를 삭제할까요?</h3>
              <p id="bulk-delete-description">{selectedIds.size}개의 북마크가 삭제됩니다.</p>
              <div>
                <button
                  ref={confirmCancelRef}
                  type="button"
                  onClick={() => setConfirmBulkDelete(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => {
                    deleteBookmarksImmediately(Array.from(selectedIds));
                    setConfirmBulkDelete(false);
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  ) : null;

  return createPortal(modal, document.body);
}
