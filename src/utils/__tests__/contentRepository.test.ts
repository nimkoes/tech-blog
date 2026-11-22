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

  it('카테고리 바로 아래의 글은 시리즈로 취급하지 않는다', () => {
    const navigation = getPostNavigation('0056-kubernetes-static-pod');
    expect(navigation?.series).toBeNull();
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

  it('하나의 시리즈로만 구성된 태그는 연재 순서를 따른다', () => {
    const result = getPostsByTagSlug('live-study');

    expect(result?.sortMode).toBe('series');
    expect(result?.posts.map(post => post.fileName)).toEqual([
      '0084-133-whiteship-java-live-study-s01',
      '0094-194-java-live-study-week-1-jvm-and-execution',
      '0095-195-java-live-study-week-2-data-types-variables-arrays',
      '0096-196-java-live-study-week-3-operators',
      '0097-197-java-live-study-week-4-control-flow',
      '0098-198-java-live-study-week-5-class',
      '0099-199-java-live-study-week-6-inheritance',
      '0100-200-java-live-study-week-7-package',
      '0101-201-java-live-study-week-8-interface',
      '0102-202-java-live-study-week-9-exception',
      '0103-203-java-live-study-week-10-multithread-programming',
      '0104-204-java-live-study-week-11-enum',
      '0105-205-java-live-study-week-12-annotation',
      '0106-206-java-live-study-week-14-generic',
      '0107-207-java-live-study-week-15-lambda',
    ]);
  });

  it('여러 묶음에 걸친 일반 태그는 최근 업데이트 순서를 유지한다', () => {
    const result = getPostsByTagSlug('kubernetes');

    expect(result?.sortMode).toBe('updated');
    result?.posts.slice(1).forEach((post, index) => {
      expect(result.posts[index].lastModifiedDate >= post.lastModifiedDate).toBe(true);
    });
  });

  it('존재하지 않는 태그 슬러그는 null을 반환한다', () => {
    expect(getPostsByTagSlug('no-such-tag')).toBeNull();
  });
});
