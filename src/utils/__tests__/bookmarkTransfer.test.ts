import { describe, expect, it } from 'vitest';
import { createBookmarkExportCode, parseBookmarkExportCode } from '~/utils/bookmarkTransfer';
import type { BookmarkRecord } from '~/utils/bookmarks';

const bookmarks: BookmarkRecord[] = [
  {
    id: 'bookmark-1',
    name: '다시 읽을 부분',
    defaultName: 'Transformer 글::Self-Attention',
    postSlug: '0148-transformer-attention-context',
    postTitle: 'Transformer 글',
    headingId: '2_4',
    headingText: 'Self-Attention',
    createdAt: '2026-11-25T00:00:00.000Z',
    updatedAt: '2026-11-25T00:00:00.000Z',
  },
  {
    id: 'bookmark-2',
    name: 'Spring 글::HTTP 요청',
    defaultName: 'Spring 글::HTTP 요청',
    postSlug: '0147-spring-ecosystem-http-request-flow',
    postTitle: 'Spring 글',
    headingId: '2_2',
    headingText: 'HTTP 요청',
    createdAt: '2026-11-25T00:00:00.000Z',
    updatedAt: '2026-11-25T00:00:00.000Z',
  },
];

describe('bookmark transfer', () => {
  it('북마크를 압축 문자열로 내보내고 다시 읽는다', async () => {
    const code = await createBookmarkExportCode(bookmarks);
    expect(code).toMatch(/^TBM1:[GJ]:/);
    await expect(parseBookmarkExportCode(code)).resolves.toEqual([
      {
        postSlug: bookmarks[0].postSlug,
        headingId: bookmarks[0].headingId,
        postTitle: bookmarks[0].postTitle,
        headingText: bookmarks[0].headingText,
        name: bookmarks[0].name,
      },
      {
        postSlug: bookmarks[1].postSlug,
        headingId: bookmarks[1].headingId,
        postTitle: bookmarks[1].postTitle,
        headingText: bookmarks[1].headingText,
        name: bookmarks[1].defaultName,
      },
    ]);
  });

  it('같은 위치가 중복되면 하나만 읽는다', async () => {
    const raw = JSON.stringify({
      v: 1,
      b: [
        ['post', '2_1', '글', '제목'],
        ['post', '2_1', '글', '제목', '다른 이름'],
      ],
    });
    await expect(parseBookmarkExportCode(raw)).resolves.toHaveLength(1);
  });

  it('손상된 문자열을 거부한다', async () => {
    await expect(parseBookmarkExportCode('TBM1:G:broken')).rejects.toThrow(
      '북마크 데이터를 읽을 수 없습니다.'
    );
  });
});
