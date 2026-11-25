import { describe, expect, it } from 'vitest';
import {
  BOOKMARK_STORAGE_VERSION,
  createDefaultBookmarkName,
  getBookmarkLocationKey,
  isCustomBookmarkName,
  parseBookmarkStorage,
  serializeBookmarks,
  type BookmarkRecord,
} from '~/utils/bookmarks';

const bookmark: BookmarkRecord = {
  id: 'bookmark-1',
  name: 'Transformer 글::Self-Attention',
  defaultName: 'Transformer 글::Self-Attention',
  postSlug: '0148-transformer-attention-context',
  postTitle: 'Transformer 글',
  headingId: '2_4',
  headingText: 'Self-Attention',
  createdAt: '2026-11-25T00:00:00.000Z',
  updatedAt: '2026-11-25T00:00:00.000Z',
};

describe('bookmark storage', () => {
  it('글 제목과 제목행으로 기본 이름을 만든다', () => {
    expect(createDefaultBookmarkName('Transformer 글', 'Self-Attention'))
      .toBe('Transformer 글::Self-Attention');
  });

  it('이름이 아니라 게시물과 제목 ID로 위치를 구분한다', () => {
    const renamedBookmark: BookmarkRecord = { ...bookmark, name: '직접 만든 이름' };
    expect(getBookmarkLocationKey(bookmark)).toBe('0148-transformer-attention-context::2_4');
    expect(getBookmarkLocationKey(renamedBookmark))
      .toBe(getBookmarkLocationKey(bookmark));
  });

  it('저장 데이터를 다시 읽는다', () => {
    expect(parseBookmarkStorage(serializeBookmarks([bookmark]))).toEqual([bookmark]);
  });

  it('같은 위치가 중복되면 최근 수정 항목만 남긴다', () => {
    const newer = {
      ...bookmark,
      id: 'bookmark-2',
      name: '수정한 이름',
      updatedAt: '2026-11-25T01:00:00.000Z',
    };
    const raw = JSON.stringify({
      version: BOOKMARK_STORAGE_VERSION,
      bookmarks: [bookmark, newer],
    });

    expect(parseBookmarkStorage(raw)).toEqual([newer]);
  });

  it('손상되었거나 지원하지 않는 데이터는 무시한다', () => {
    expect(parseBookmarkStorage('{broken')).toEqual([]);
    expect(parseBookmarkStorage(JSON.stringify({ version: 2, bookmarks: [bookmark] }))).toEqual([]);
  });

  it('기본 이름과 다른 이름을 커스텀 이름으로 판단한다', () => {
    expect(isCustomBookmarkName(bookmark)).toBe(false);
    expect(isCustomBookmarkName({ ...bookmark, name: '다시 읽을 부분' })).toBe(true);
  });
});
