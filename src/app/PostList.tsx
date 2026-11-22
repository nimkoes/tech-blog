"use client";

// React
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

// Components
import DateTooltip from '~/components/common/DateTooltip';
import { X } from 'lucide-react';

// Utils & Context
import { useTagContext } from '~/context/TagContext';
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

  const posts = initialPosts;
  const allowedTags = useMemo(() => new Set(posts.flatMap(post => post.tags)), [posts]);
  // useSearchParams()는 정적 export에서 페이지 전체를 CSR로 강등시키므로,
  // 목록이 프리렌더되도록 쿼리스트링은 mount 이후 window.location에서 읽는다.
  const [tagParam, setTagParam] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  const filteredPosts = useMemo(
    () => (
      selectedTags.length > 0
        ? posts.filter(post => selectedTags.some(tag => post.tags.includes(tag)))
        : posts
    ),
    [posts, selectedTags]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedTagsKey]);

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
      <div className={styles.sectionHeading}>
        <div>
          <p>Archive</p>
          <h2>최근 업데이트</h2>
        </div>
        <Link href="/tags" className={styles.allTagsLink}>주요 토픽 보기</Link>
      </div>
      <div className={styles.filterSection}>
        <div className={styles.filterSummary}>
          <strong>{filteredPosts.length}</strong>개의 문서
          {selectedTags.length > 0 && (
            <span className={styles.filterSummaryMeta}>
              선택 태그 {selectedTags.length}개 중 하나라도 포함
            </span>
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
          <h2>선택한 태그에 맞는 문서가 없습니다.</h2>
          <p>태그를 줄이거나 다른 태그로 다시 탐색해보세요.</p>
          <button type="button" className={styles.emptyAction} onClick={clearTags}>
            필터 초기화
          </button>
        </div>
      ) : (
        <div className={styles.postList}>
          {visiblePosts.map(post => (
            <article key={post.fileName} className={styles.postCard}>
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
          ))}
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
