import { describe, expect, it } from 'vitest';
import {
  getAllTags,
  getCategoryPostBySlug,
  getCategoryPosts,
  getPostNavigation,
  getPostsByTagSlug,
  slugifyTag,
} from '~/utils/contentRepository';

describe('slugifyTag', () => {
  it('공백을 하이픈으로 바꾸고 소문자로 정규화한다', () => {
    expect(slugifyTag('Spring Security')).toBe('spring-security');
    expect(slugifyTag('  Web   Server ')).toBe('web-server');
    expect(slugifyTag('단위 테스트')).toBe('단위-테스트');
  });
});

describe('getCategoryPosts', () => {
  it('category.json의 모든 포스트를 최신 수정일 순으로 반환한다', () => {
    const posts = getCategoryPosts();

    expect(posts.length).toBeGreaterThan(0);
    for (let i = 1; i < posts.length; i++) {
      expect(
        posts[i - 1].lastModifiedDate >= posts[i].lastModifiedDate
      ).toBe(true);
    }
  });

  it('모든 포스트는 필수 메타데이터를 가진다', () => {
    getCategoryPosts().forEach(post => {
      expect(post.title).toBeTruthy();
      expect(post.fileName).toBeTruthy();
      expect(post.regDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.lastModifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Array.isArray(post.tags)).toBe(true);
    });
  });
});

describe('getPostNavigation', () => {
  it('시리즈 중간 글은 같은 시리즈의 이전/다음 글을 가리킨다', () => {
    const navigation = getPostNavigation('0003-kubernetes');

    expect(navigation).not.toBeNull();
    expect(navigation?.prev?.fileName).toBe('0002-kubernetes');
    expect(navigation?.next?.fileName).toBe('0004-kubernetes');
    expect(navigation?.series).toMatchObject({ index: 2 });
    expect(navigation?.series?.total).toBeGreaterThanOrEqual(2);
  });

  it('관련 글은 현재 글과 같은 시리즈를 제외하고 태그가 겹치는 글만 담는다', () => {
    const navigation = getPostNavigation('0003-kubernetes');
    const current = getCategoryPostBySlug('0003-kubernetes');
    const currentTags = new Set(current?.tags.map(tag => tag.toLowerCase()));

    expect(navigation?.related.length).toBeLessThanOrEqual(4);
    navigation?.related.forEach(post => {
      expect(post.fileName).not.toBe('0003-kubernetes');
      const overlap = post.tags.some(tag => currentTags.has(tag.toLowerCase()));
      expect(overlap).toBe(true);
    });
  });

  it('존재하지 않는 슬러그는 null을 반환한다', () => {
    expect(getPostNavigation('no-such-post')).toBeNull();
  });
});

describe('getAllTags / getPostsByTagSlug', () => {
  it('태그 슬러그는 중복이 없다', () => {
    const tags = getAllTags();
    const slugs = tags.map(entry => entry.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('태그 카운트와 태그 페이지의 글 수가 일치한다', () => {
    const [top] = getAllTags();
    const result = getPostsByTagSlug(top.slug);

    expect(result).not.toBeNull();
    expect(result?.posts).toHaveLength(top.count);
    result?.posts.forEach(post => {
      expect(post.tags.some(tag => slugifyTag(tag) === top.slug)).toBe(true);
    });
  });

  it('존재하지 않는 태그 슬러그는 null을 반환한다', () => {
    expect(getPostsByTagSlug('no-such-tag')).toBeNull();
  });
});
