import {
  createDefaultBookmarkName,
  getBookmarkLocationKey,
  MAX_BOOKMARK_CUSTOM_NAME_LENGTH,
  type BookmarkLocation,
  type BookmarkRecord,
} from '~/utils/bookmarks';

const TRANSFER_VERSION = 1;
const GZIP_PREFIX = 'TBM1:G:';
const JSON_PREFIX = 'TBM1:J:';
const MAX_TRANSFER_TEXT_LENGTH = 1_000_000;

type CompactBookmark = [
  postSlug: string,
  headingId: string,
  postTitle: string,
  headingText: string,
  customName?: string,
];

interface CompactPayload {
  v: number;
  b: CompactBookmark[];
}

export interface ImportedBookmark extends BookmarkLocation {
  name: string;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function compress(text: string) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompress(bytes: Uint8Array) {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

function toCompactPayload(bookmarks: BookmarkRecord[]): CompactPayload {
  return {
    v: TRANSFER_VERSION,
    b: bookmarks.map(bookmark => {
      const customName = bookmark.name === bookmark.defaultName ? undefined : bookmark.name;
      return [
        bookmark.postSlug,
        bookmark.headingId,
        bookmark.postTitle,
        bookmark.headingText,
        customName?.slice(0, MAX_BOOKMARK_CUSTOM_NAME_LENGTH),
      ];
    }),
  };
}

function isValidText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function parseCompactPayload(raw: string): ImportedBookmark[] {
  const payload = JSON.parse(raw) as Partial<CompactPayload>;
  if (payload.v !== TRANSFER_VERSION || !Array.isArray(payload.b)) {
    throw new Error('지원하지 않는 북마크 데이터입니다.');
  }

  const byLocation = new Map<string, ImportedBookmark>();
  payload.b.forEach(item => {
    if (
      !Array.isArray(item) ||
      item.length < 4 ||
      !isValidText(item[0], 200) ||
      !isValidText(item[1], 100) ||
      !isValidText(item[2], 500) ||
      !isValidText(item[3], 500) ||
      (item[4] !== undefined && item[4] !== null && !isValidText(item[4], MAX_BOOKMARK_CUSTOM_NAME_LENGTH))
    ) {
      throw new Error('올바르지 않은 북마크가 포함되어 있습니다.');
    }

    const bookmark: ImportedBookmark = {
      postSlug: item[0].trim(),
      headingId: item[1].trim(),
      postTitle: item[2].trim(),
      headingText: item[3].trim(),
      name: item[4]?.trim() || createDefaultBookmarkName(item[2].trim(), item[3].trim()),
    };
    const key = getBookmarkLocationKey(bookmark);
    if (!byLocation.has(key)) byLocation.set(key, bookmark);
  });

  return Array.from(byLocation.values());
}

export async function createBookmarkExportCode(bookmarks: BookmarkRecord[]) {
  const json = JSON.stringify(toCompactPayload(bookmarks));
  try {
    const compressed = await compress(json);
    return `${GZIP_PREFIX}${bytesToBase64(compressed)}`;
  } catch {
    return `${JSON_PREFIX}${bytesToBase64(new TextEncoder().encode(json))}`;
  }
}

export async function parseBookmarkExportCode(code: string) {
  const normalized = code.trim();
  if (!normalized || normalized.length > MAX_TRANSFER_TEXT_LENGTH) {
    throw new Error('북마크 데이터가 비어 있거나 너무 큽니다.');
  }

  try {
    if (normalized.startsWith(GZIP_PREFIX)) {
      const json = await decompress(base64ToBytes(normalized.slice(GZIP_PREFIX.length)));
      return parseCompactPayload(json);
    }
    if (normalized.startsWith(JSON_PREFIX)) {
      const json = new TextDecoder().decode(base64ToBytes(normalized.slice(JSON_PREFIX.length)));
      return parseCompactPayload(json);
    }
    if (normalized.startsWith('{')) return parseCompactPayload(normalized);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('지원하지 않는')) throw error;
    if (error instanceof Error && error.message.startsWith('올바르지 않은')) throw error;
    throw new Error('북마크 데이터를 읽을 수 없습니다.');
  }

  throw new Error('지원하지 않는 북마크 데이터입니다.');
}
