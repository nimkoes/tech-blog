'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  BOOKMARK_STORAGE_KEY,
  MAX_BOOKMARKS,
  createDefaultBookmarkName,
  getBookmarkLocationKey,
  normalizeBookmarkName,
  parseBookmarkStorage,
  serializeBookmarks,
  type BookmarkLocation,
  type BookmarkRecord,
} from '~/utils/bookmarks';
import type { ImportedBookmark } from '~/utils/bookmarkTransfer';

interface BookmarkImportResult {
  added: number;
  skipped: number;
  exceeded: boolean;
  requestedNew: number;
}

interface BookmarkContextValue {
  bookmarks: BookmarkRecord[];
  isHydrated: boolean;
  isManagerOpen: boolean;
  managerInitialQuery: string;
  openManager: (initialQuery?: string) => void;
  closeManager: () => void;
  findBookmark: (location: Pick<BookmarkLocation, 'postSlug' | 'headingId'>) => BookmarkRecord | undefined;
  countForPost: (postSlug: string) => number;
  saveBookmark: (location: BookmarkLocation, name: string) => BookmarkRecord | null;
  importBookmarks: (bookmarks: ImportedBookmark[]) => BookmarkImportResult;
  removeBookmarks: (ids: string[]) => BookmarkRecord[];
}

const BookmarkContext = createContext<BookmarkContextValue | undefined>(undefined);

function createBookmarkId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `bookmark-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [managerInitialQuery, setManagerInitialQuery] = useState('');
  const bookmarksRef = useRef<BookmarkRecord[]>([]);
  const openManager = useCallback((initialQuery = '') => {
    setManagerInitialQuery(initialQuery);
    setIsManagerOpen(true);
  }, []);
  const closeManager = useCallback(() => setIsManagerOpen(false), []);

  const commit = useCallback((next: BookmarkRecord[]) => {
    bookmarksRef.current = next;
    setBookmarks(next);
    try {
      window.localStorage.setItem(BOOKMARK_STORAGE_KEY, serializeBookmarks(next));
    } catch {
      // 저장소를 사용할 수 없는 환경에서도 현재 탭의 기능은 유지한다.
    }
  }, []);

  useEffect(() => {
    let stored: BookmarkRecord[] = [];
    try {
      stored = parseBookmarkStorage(window.localStorage.getItem(BOOKMARK_STORAGE_KEY));
    } catch {
      stored = [];
    }
    bookmarksRef.current = stored;
    setBookmarks(stored);
    setIsHydrated(true);

    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key !== BOOKMARK_STORAGE_KEY) return;
      const next = parseBookmarkStorage(event.newValue);
      bookmarksRef.current = next;
      setBookmarks(next);
    };
    window.addEventListener('storage', syncAcrossTabs);
    return () => window.removeEventListener('storage', syncAcrossTabs);
  }, []);

  const findBookmark = useCallback(
    (location: Pick<BookmarkLocation, 'postSlug' | 'headingId'>) => {
      const key = getBookmarkLocationKey(location);
      return bookmarks.find(bookmark => getBookmarkLocationKey(bookmark) === key);
    },
    [bookmarks]
  );

  const countForPost = useCallback(
    (postSlug: string) => bookmarks.filter(bookmark => bookmark.postSlug === postSlug).length,
    [bookmarks]
  );

  const saveBookmark = useCallback((location: BookmarkLocation, name: string) => {
    const now = new Date().toISOString();
    const defaultName = createDefaultBookmarkName(location.postTitle, location.headingText);
    const normalizedName = normalizeBookmarkName(name, defaultName);
    const locationKey = getBookmarkLocationKey(location);
    const existing = bookmarksRef.current.find(
      bookmark => getBookmarkLocationKey(bookmark) === locationKey
    );
    if (!existing && bookmarksRef.current.length >= MAX_BOOKMARKS) return null;

    const saved: BookmarkRecord = existing
      ? {
          ...existing,
          ...location,
          name: normalizedName,
          defaultName,
          updatedAt: now,
        }
      : {
          ...location,
          id: createBookmarkId(),
          name: normalizedName,
          defaultName,
          createdAt: now,
          updatedAt: now,
        };
    const next = [saved, ...bookmarksRef.current.filter(bookmark => bookmark.id !== saved.id)];
    commit(next);
    return saved;
  }, [commit]);

  const importBookmarks = useCallback((imported: ImportedBookmark[]): BookmarkImportResult => {
    const current = bookmarksRef.current;
    const existingLocations = new Set(current.map(getBookmarkLocationKey));
    const uniqueNew: ImportedBookmark[] = [];
    let skipped = 0;

    imported.forEach(bookmark => {
      const key = getBookmarkLocationKey(bookmark);
      if (existingLocations.has(key)) {
        skipped += 1;
        return;
      }
      existingLocations.add(key);
      uniqueNew.push(bookmark);
    });

    if (current.length + uniqueNew.length > MAX_BOOKMARKS) {
      return {
        added: 0,
        skipped,
        exceeded: true,
        requestedNew: uniqueNew.length,
      };
    }

    const now = new Date().toISOString();
    const added = uniqueNew.map(bookmark => ({
      ...bookmark,
      id: createBookmarkId(),
      defaultName: createDefaultBookmarkName(bookmark.postTitle, bookmark.headingText),
      createdAt: now,
      updatedAt: now,
    }));
    commit([...added, ...current]);
    return {
      added: added.length,
      skipped,
      exceeded: false,
      requestedNew: added.length,
    };
  }, [commit]);

  const removeBookmarks = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    const removed = bookmarksRef.current.filter(bookmark => idSet.has(bookmark.id));
    commit(bookmarksRef.current.filter(bookmark => !idSet.has(bookmark.id)));
    return removed;
  }, [commit]);

  const value = useMemo<BookmarkContextValue>(() => ({
    bookmarks,
    isHydrated,
    isManagerOpen,
    managerInitialQuery,
    openManager,
    closeManager,
    findBookmark,
    countForPost,
    saveBookmark,
    importBookmarks,
    removeBookmarks,
  }), [
    bookmarks,
    closeManager,
    countForPost,
    findBookmark,
    isHydrated,
    isManagerOpen,
    importBookmarks,
    managerInitialQuery,
    openManager,
    removeBookmarks,
    saveBookmark,
  ]);

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error('useBookmarks must be used within BookmarkProvider');
  return context;
}
