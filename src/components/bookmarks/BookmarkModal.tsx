'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bookmark,
  Check,
  ClipboardCopy,
  ClipboardPaste,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { useBookmarks } from '~/context/BookmarkContext';
import useBodyScrollLock from '~/hooks/useBodyScrollLock';
import {
  createDefaultBookmarkName,
  isCustomBookmarkName,
  MAX_BOOKMARKS,
  MAX_BOOKMARK_CUSTOM_NAME_LENGTH,
  type BookmarkRecord,
} from '~/utils/bookmarks';
import { createBookmarkExportCode, parseBookmarkExportCode } from '~/utils/bookmarkTransfer';
import styles from './BookmarkModal.module.scss';

const DELETE_DELAY_MS = 5_000;

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('ko-KR');
}

export default function BookmarkModal() {
  const {
    bookmarks,
    isManagerOpen,
    managerInitialQuery,
    closeManager,
    importBookmarks,
    removeBookmarks,
    saveBookmark,
  } = useBookmarks();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [transferMessage, setTransferMessage] = useState('');
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, number>>({});
  const [countdownNow, setCountdownNow] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const confirmCancelRef = useRef<HTMLButtonElement>(null);
  const importDialogRef = useRef<HTMLDivElement>(null);
  const importTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editDialogRef = useRef<HTMLFormElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const confirmBulkDeleteRef = useRef(false);
  const isImportOpenRef = useRef(false);
  const isEditOpenRef = useRef(false);
  const transferMessageTimerRef = useRef<number | undefined>(undefined);
  useBodyScrollLock(isManagerOpen);

  useEffect(() => {
    setMounted(true);
    return () => window.clearTimeout(transferMessageTimerRef.current);
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
    isImportOpenRef.current = isImportOpen;
    if (isImportOpen) {
      requestAnimationFrame(() => importTextareaRef.current?.focus());
    }
  }, [isImportOpen]);

  useEffect(() => {
    isEditOpenRef.current = editingBookmark !== null;
    if (editingBookmark) {
      requestAnimationFrame(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      });
    }
  }, [editingBookmark]);

  useEffect(() => {
    if (!isManagerOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery(managerInitialQuery);
    setIsSelecting(false);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    setIsImportOpen(false);
    setEditingBookmark(null);
    setImportError('');
    requestAnimationFrame(() => searchRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isEditOpenRef.current) {
          setEditingBookmark(null);
        } else if (isImportOpenRef.current) {
          setIsImportOpen(false);
        } else if (confirmBulkDeleteRef.current) {
          setConfirmBulkDelete(false);
        } else {
          closeManager();
        }
        return;
      }
      if (event.key !== 'Tab') return;

      const focusRoot = isEditOpenRef.current
        ? editDialogRef.current
        : isImportOpenRef.current
          ? importDialogRef.current
          : confirmBulkDeleteRef.current
            ? confirmDialogRef.current
            : panelRef.current;
      const focusable = focusRoot?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    const idSet = new Set(ids);
    setPendingDeletions(current => {
      const next = { ...current };
      idSet.forEach(bookmarkId => delete next[bookmarkId]);
      return next;
    });
  };

  const showTransferMessage = (message: string) => {
    setTransferMessage(message);
    window.clearTimeout(transferMessageTimerRef.current);
    transferMessageTimerRef.current = window.setTimeout(() => setTransferMessage(''), 3500);
  };

  const exportBookmarks = async () => {
    setIsExporting(true);
    try {
      const code = await createBookmarkExportCode(bookmarks);
      await navigator.clipboard.writeText(code);
      showTransferMessage(`북마크 ${bookmarks.length}개를 클립보드에 복사했습니다.`);
    } catch {
      showTransferMessage('클립보드에 복사하지 못했습니다. 브라우저 권한을 확인해 주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const submitImport = async () => {
    setIsImporting(true);
    setImportError('');
    try {
      const imported = await parseBookmarkExportCode(importText);
      const result = importBookmarks(imported);
      if (result.exceeded) {
        setImportError(
          `현재 ${bookmarks.length}개에 새 북마크 ${result.requestedNew}개를 더하면 최대 ${MAX_BOOKMARKS}개를 넘습니다.`
        );
        return;
      }

      setIsImportOpen(false);
      setImportText('');
      showTransferMessage(
        `북마크 ${result.added}개를 가져왔습니다.${result.skipped > 0 ? ` 중복 ${result.skipped}개는 유지했습니다.` : ''}`
      );
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '북마크를 가져오지 못했습니다.');
    } finally {
      setIsImporting(false);
    }
  };

  const openBookmarkEditor = (bookmark: BookmarkRecord) => {
    setEditName(isCustomBookmarkName(bookmark)
      ? bookmark.name.slice(0, MAX_BOOKMARK_CUSTOM_NAME_LENGTH)
      : '');
    setEditError('');
    setEditingBookmark(bookmark);
  };

  const saveEditedBookmark = () => {
    if (!editingBookmark) return;
    const saved = saveBookmark(editingBookmark, editName);
    if (!saved) {
      setEditError(`북마크는 최대 ${MAX_BOOKMARKS}개까지 저장할 수 있습니다.`);
      return;
    }
    setEditingBookmark(null);
    showTransferMessage('북마크 이름을 수정했습니다.');
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
              onClick={() => {
                setConfirmBulkDelete(false);
                setIsSelecting(false);
                setSelectedIds(new Set());
                setImportText('');
                setImportError('');
                setIsImportOpen(true);
              }}
              aria-label="북마크 가져오기"
              title="북마크 가져오기"
            >
              <ClipboardCopy size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={exportBookmarks}
              disabled={bookmarks.length === 0 || isExporting}
              aria-label={`북마크 ${bookmarks.length}개 내보내기`}
              title="북마크를 클립보드에 복사"
            >
              {transferMessage.includes('클립보드에 복사했습니다') && !isExporting
                ? <Check size={18} aria-hidden="true" />
                : <ClipboardPaste size={18} aria-hidden="true" />}
            </button>
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
          <span>{filteredBookmarks.length}개의 북마크 · 저장 {bookmarks.length}/{MAX_BOOKMARKS}</span>
          {isSelecting && <strong>{selectedIds.size}개 선택</strong>}
          {!isSelecting && transferMessage && (
            <strong className={styles.transferMessage} role="status">{transferMessage}</strong>
          )}
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
                          <>
                            <button
                              type="button"
                              className={styles.immediateDeleteButton}
                              onClick={() => deleteBookmarksImmediately([bookmark.id])}
                              aria-label={`${bookmark.name} 지금 삭제`}
                              title="지금 삭제"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
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
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className={styles.editButton}
                              onClick={() => openBookmarkEditor(bookmark)}
                              aria-label={`${bookmark.name} 북마크 이름 수정`}
                              title="북마크 이름 수정"
                            >
                              <Pencil size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className={styles.deleteButton}
                              onClick={event => scheduleDeletion(bookmark.id, event.timeStamp)}
                              aria-label={`${bookmark.name} 북마크 삭제`}
                              title="북마크 삭제"
                            >
                              <Trash2 size={17} aria-hidden="true" />
                            </button>
                          </>
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

        {editingBookmark && (
          <div className={styles.confirmOverlay}>
            <form
              ref={editDialogRef}
              className={styles.bookmarkEditBox}
              role="dialog"
              aria-modal="true"
              aria-labelledby="bookmark-name-edit-title"
              onSubmit={event => {
                event.preventDefault();
                saveEditedBookmark();
              }}
            >
              <header>
                <div>
                  <h3 id="bookmark-name-edit-title">북마크 이름 수정</h3>
                  <p>비워두면 기본 이름으로 되돌아갑니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBookmark(null)}
                  aria-label="북마크 이름 수정 닫기"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </header>
              <div className={styles.editFieldLabel}>
                <label htmlFor="bookmark-edit-name">커스텀 이름</label>
                <span>{editName.length}/{MAX_BOOKMARK_CUSTOM_NAME_LENGTH}</span>
              </div>
              <input
                ref={editInputRef}
                id="bookmark-edit-name"
                value={editName}
                onChange={event => {
                  setEditName(event.target.value);
                  setEditError('');
                }}
                maxLength={MAX_BOOKMARK_CUSTOM_NAME_LENGTH}
                placeholder="비워두면 기본 이름을 사용합니다."
              />
              <p className={styles.editLocation}>
                기본 이름 · {createDefaultBookmarkName(editingBookmark.postTitle, editingBookmark.headingText)}
              </p>
              {editError && <p className={styles.importError} role="alert">{editError}</p>}
              <div className={styles.importActions}>
                <button type="button" onClick={() => setEditingBookmark(null)}>취소</button>
                <button type="submit" className={styles.importButton}>
                  <Save size={16} aria-hidden="true" />
                  저장
                </button>
              </div>
            </form>
          </div>
        )}

        {isImportOpen && (
          <div className={styles.confirmOverlay}>
            <div
              ref={importDialogRef}
              className={styles.importBox}
              role="dialog"
              aria-modal="true"
              aria-labelledby="bookmark-import-title"
              aria-describedby="bookmark-import-description"
            >
              <header>
                <div>
                  <h3 id="bookmark-import-title">북마크 가져오기</h3>
                  <p id="bookmark-import-description">
                    다른 브라우저에서 복사한 북마크 데이터를 붙여 넣어 주세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  aria-label="북마크 가져오기 닫기"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </header>
              <label htmlFor="bookmark-import-data">북마크 데이터</label>
              <textarea
                ref={importTextareaRef}
                id="bookmark-import-data"
                value={importText}
                onChange={event => {
                  setImportText(event.target.value);
                  setImportError('');
                }}
                placeholder="TBM1:G:..."
                spellCheck="false"
              />
              {importError && <p className={styles.importError} role="alert">{importError}</p>}
              <div className={styles.importActions}>
                <button type="button" onClick={() => setIsImportOpen(false)}>취소</button>
                <button
                  type="button"
                  className={styles.importButton}
                  onClick={submitImport}
                  disabled={!importText.trim() || isImporting}
                >
                  {isImporting ? '확인 중…' : '가져오기'}
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
