export const BOOKMARK_STORAGE_KEY = 'tech-blog:bookmarks:v1';
export const BOOKMARK_STORAGE_VERSION = 1;

export interface BookmarkLocation {
  postSlug: string;
  postTitle: string;
  headingId: string;
  headingText: string;
}

export interface BookmarkRecord extends BookmarkLocation {
  id: string;
  name: string;
  defaultName: string;
  createdAt: string;
  updatedAt: string;
}

interface BookmarkStoragePayload {
  version: number;
  bookmarks: BookmarkRecord[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function createDefaultBookmarkName(postTitle: string, headingText: string) {
  return `${postTitle}::${headingText}`;
}

export function getBookmarkLocationKey(location: Pick<BookmarkLocation, 'postSlug' | 'headingId'>) {
  return `${location.postSlug}::${location.headingId}`;
}

export function isCustomBookmarkName(bookmark: BookmarkRecord) {
  return bookmark.name.trim() !== bookmark.defaultName.trim();
}

function isBookmarkRecord(value: unknown): value is BookmarkRecord {
  if (!value || typeof value !== 'object') return false;
  const bookmark = value as Partial<BookmarkRecord>;

  return (
    isNonEmptyString(bookmark.id) &&
    isNonEmptyString(bookmark.name) &&
    isNonEmptyString(bookmark.defaultName) &&
    isNonEmptyString(bookmark.postSlug) &&
    isNonEmptyString(bookmark.postTitle) &&
    isNonEmptyString(bookmark.headingId) &&
    isNonEmptyString(bookmark.headingText) &&
    isNonEmptyString(bookmark.createdAt) &&
    isNonEmptyString(bookmark.updatedAt)
  );
}

export function parseBookmarkStorage(raw: string | null): BookmarkRecord[] {
  if (!raw) return [];

  try {
    const payload = JSON.parse(raw) as Partial<BookmarkStoragePayload>;
    if (payload.version !== BOOKMARK_STORAGE_VERSION || !Array.isArray(payload.bookmarks)) {
      return [];
    }

    const byLocation = new Map<string, BookmarkRecord>();
    payload.bookmarks.filter(isBookmarkRecord).forEach(bookmark => {
      const normalized: BookmarkRecord = {
        ...bookmark,
        id: bookmark.id.trim(),
        name: bookmark.name.trim(),
        defaultName: bookmark.defaultName.trim(),
        postSlug: bookmark.postSlug.trim(),
        postTitle: bookmark.postTitle.trim(),
        headingId: bookmark.headingId.trim(),
        headingText: bookmark.headingText.trim(),
      };
      const key = getBookmarkLocationKey(normalized);
      const existing = byLocation.get(key);
      if (!existing || normalized.updatedAt > existing.updatedAt) {
        byLocation.set(key, normalized);
      }
    });

    return Array.from(byLocation.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export function serializeBookmarks(bookmarks: BookmarkRecord[]) {
  const payload: BookmarkStoragePayload = {
    version: BOOKMARK_STORAGE_VERSION,
    bookmarks,
  };
  return JSON.stringify(payload);
}
