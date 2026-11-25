"use client";

// React
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

// Components
import DateTooltip from '~/components/common/DateTooltip';
import { Bookmark, X } from 'lucide-react';
import ShareButton from './post/[slug]/ShareButton';

// Utils & Context
import { useTagContext } from '~/context/TagContext';
import { useBookmarks } from '~/context/BookmarkContext';
import type { PostMeta } from '~/types/content';

// Styles
import styles from './page.module.scss';

interface PostListProps {
  initialPosts: PostMeta[];
}

const PAGE_SIZE = 18;

function parseTagQuery(rawTags: string | null, allowedTags: Set<string>) {
  if (!rawTags) return [];
  return Array.from(
    new Set(
      rawTags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .filter(tag => allowedTags.has(tag))
    )
  ).slice(0, 5);
}

export default function PostList({ initialPosts }: PostListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isSyncingFromUrlRef = useRef(false);
  const {
    selectedTags, setSelectedTags, handleTagSelect
  } = useTagContext();
  const { bookmarks, countForPost, openManager } = useBookmarks();

  const posts = initialPosts;
  const allowedTags = useMemo(() => new Set(posts.flatMap(post => post.tags)), [posts]);
  // useSearchParams()는 정적 export에서 페이지 전체를 CSR로 강등시키므로,
  // 목록이 프리렌더되도록 쿼리스트링은 mount 이후 window.location에서 읽는다.
  const [tagParam, setTagParam] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isBookmarkFilterActive, setIsBookmarkFilterActive] = useState(false);

  useEffect(() => {
    const readTagsFromLocation = () => {
      setTagParam(new URLSearchParams(window.location.search).get('tags'));
    };
    readTagsFromLocation();
    window.addEventListener('popstate', readTagsFromLocation);
    return () => window.removeEventListener('popstate', readTagsFromLocation);
  }, []);
  const tagsFromUrl = useMemo(
    () => parseTagQuery(tagParam, allowedTags),
    [allowedTags, tagParam]
  );
  const tagsFromUrlKey = useMemo(() => tagsFromUrl.join(','), [tagsFromUrl]);
  const selectedTagsKey = useMemo(() => selectedTags.join(','), [selectedTags]);

  const clearTags = () => {
    setSelectedTags([]);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setIsBookmarkFilterActive(false);
  };

  useEffect(() => {
    setSelectedTags(prev => {
      if (prev.join(',') === tagsFromUrlKey) {
        return prev;
      }
      isSyncingFromUrlRef.current = true;
      return tagsFromUrl;
    });
  }, [setSelectedTags, tagsFromUrl, tagsFromUrlKey]);

  useEffect(() => {
    if (isSyncingFromUrlRef.current) {
      isSyncingFromUrlRef.current = false;
      return;
    }

    if (selectedTagsKey === tagsFromUrlKey) return;

    const params = new URLSearchParams(window.location.search);
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }

    const nextQuery = params.toString();
    const currentQuery = window.location.search.replace(/^\?/, '');
    if (nextQuery !== currentQuery) {
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
      setTagParam(selectedTags.length > 0 ? selectedTags.join(',') : null);
    }
  }, [pathname, router, selectedTags, selectedTagsKey, tagsFromUrlKey]);

  const bookmarkedPostSlugs = useMemo(
    () => new Set(bookmarks.map(bookmark => bookmark.postSlug)),
    [bookmarks]
  );

  const filteredPosts = useMemo(() => {
    const tagFilteredPosts = selectedTags.length > 0
      ? posts.filter(post => selectedTags.some(tag => post.tags.includes(tag)))
      : posts;

    return isBookmarkFilterActive
      ? tagFilteredPosts.filter(post => bookmarkedPostSlugs.has(post.fileName))
      : tagFilteredPosts;
  }, [bookmarkedPostSlugs, isBookmarkFilterActive, posts, selectedTags]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [isBookmarkFilterActive, selectedTagsKey]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visiblePosts.length < filteredPosts.length;

  const getIsRecentlyUpdated = (lastModifiedDate: string) => {
    const modifiedAt = new Date(lastModifiedDate);
    const now = new Date();
    const diffTime = now.getTime() - modifiedAt.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <>
      <div id="archive" className={styles.sectionHeading}>
        <div>
          <h2>Archive</h2>
        </div>
        <div className={styles.sectionActions}>
          <Link href="/tags" className={styles.allTagsLink}>주요 토픽 보기</Link>
          <button
            type="button"
            className={`${styles.bookmarkFilterButton} ${isBookmarkFilterActive ? styles.bookmarkFilterActive : ''}`}
            onClick={() => setIsBookmarkFilterActive(active => !active)}
            aria-pressed={isBookmarkFilterActive}
            aria-label={`북마크가 있는 게시물만 보기, 전체 북마크 ${bookmarks.length}개`}
            title="북마크가 있는 게시물만 보기"
          >
            <Bookmark size={14} fill={isBookmarkFilterActive ? 'currentColor' : 'none'} aria-hidden="true" />
            <strong>{bookmarks.length}</strong>
          </button>
        </div>
      </div>
      <div className={styles.filterSection}>
        <div className={styles.filterSummary}>
          <strong>{filteredPosts.length}</strong>개의 문서
          {selectedTags.length > 0 && (
            <span className={styles.filterSummaryMeta}>
              선택 태그 {selectedTags.length}개 중 하나라도 포함
            </span>
          )}
          {isBookmarkFilterActive && (
            <span className={styles.filterSummaryMeta}>북마크가 있는 문서만 표시</span>
          )}
        </div>
        {selectedTags.length > 0 && (
          <div className={styles.selectedTags}>
            {selectedTags.map(tag => (
              <button
                type="button"
                key={tag}
                className={styles.tagPill}
                onClick={() => handleTagSelect(tag)}
                aria-label={`${tag} 태그 필터 해제`}
              >
                {tag}
                <X size={14} />
              </button>
            ))}
            <button
              type="button"
              className={styles.clearButton}
              onClick={clearTags}
              aria-label="태그 필터 전체 해제"
            >
              초기화
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>
            {isBookmarkFilterActive
              ? '현재 조건에 맞는 북마크 문서가 없습니다.'
              : '선택한 태그에 맞는 문서가 없습니다.'}
          </h2>
          <p>
            {isBookmarkFilterActive
              ? '북마크 필터를 해제하거나 게시물에서 북마크를 추가해보세요.'
              : '태그를 줄이거나 다른 태그로 다시 탐색해보세요.'}
          </p>
          <button type="button" className={styles.emptyAction} onClick={clearFilters}>
            필터 초기화
          </button>
        </div>
      ) : (
        <div className={styles.postList}>
          {visiblePosts.map(post => {
            const bookmarkCount = countForPost(post.fileName);
            return (
              <article
                key={post.fileName}
                className={`${styles.postCard} ${bookmarkCount > 0 ? styles.bookmarkedPostCard : ''}`}
              >
                {bookmarkCount > 0 && (
                  <button
                    type="button"
                    className={styles.postBookmarkIndicator}
                    aria-label={`${bookmarkCount}개의 북마크가 저장된 게시물`}
                    title={`이 게시물의 북마크 ${bookmarkCount}개 보기`}
                    onClick={() => openManager(post.title)}
                  >
                    <Bookmark size={14} fill="currentColor" aria-hidden="true" />
                    <span>{bookmarkCount}</span>
                  </button>
                )}
                <h3 className={styles.postTitle}>
                  <Link href={`/post/${post.fileName}/`}>
                    {post.title}
                    {getIsRecentlyUpdated(post.lastModifiedDate) && (
                      <span className={styles.newBadge}>NEW</span>
                    )}
                  </Link>
                </h3>
                <p className={styles.postDescription}>{post.description}</p>
                <div className={styles.postMeta}>
                  <DateTooltip regDate={post.regDate} lastModifiedDate={post.lastModifiedDate}>
                    <time className={styles.postDate}>
                      최종 수정 {post.lastModifiedDate}
                    </time>
                  </DateTooltip>
                  <span className={styles.readingTime}>약 {post.readingTime}분</span>
                  <ShareButton title={post.title} path={`/post/${post.fileName}/`} />

                  <div className={styles.postTags}>
                    {post.tags.map(tag => (
                      <button
                        type="button"
                        key={tag}
                        className={`${styles.tagPill} ${selectedTags.includes(tag) ? styles.active : ''}`}
                        onClick={() => handleTagSelect(tag)}
                        aria-pressed={selectedTags.includes(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {hasMore && (
        <div className={styles.loadMoreArea}>
          <p>{visiblePosts.length} / {filteredPosts.length}개 표시</p>
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
          >
            문서 더 보기
          </button>
        </div>
      )}
    </>
  );
}
