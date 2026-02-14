"use client";

// React
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

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
  const searchParams = useSearchParams();
  const isSyncingFromUrlRef = useRef(false);
  const {
    selectedTags, setSelectedTags, handleTagSelect
  } = useTagContext();

  const posts = initialPosts;
  const allowedTags = useMemo(() => new Set(posts.flatMap(post => post.tags)), [posts]);
  const tagParam = searchParams.get('tags');
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

    const params = new URLSearchParams(searchParams.toString());
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }
  }, [pathname, router, searchParams, selectedTags, selectedTagsKey, tagsFromUrlKey]);

  const filteredPosts = useMemo(
    () => (
      selectedTags.length > 0
        ? posts.filter(post => selectedTags.some(tag => post.tags.includes(tag)))
        : posts
    ),
    [posts, selectedTags]
  );

  const getIsRecentlyUpdated = (lastModifiedDate: string) => {
    const modifiedAt = new Date(lastModifiedDate);
    const now = new Date();
    const diffTime = now.getTime() - modifiedAt.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  return (
    <>
      <div className={styles.filterSection}>
        <div className={styles.filterSummary}>
          <strong>{filteredPosts.length}</strong>개의 문서
          {selectedTags.length > 0 && (
            <span className={styles.filterSummaryMeta}>선택 태그 {selectedTags.length}개 적용 중</span>
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
          {filteredPosts.map(post => (
            <article key={post.fileName} className={styles.postCard}>
              <h2 className={styles.postTitle}>
                <Link href={`/post/${post.fileName}/`}>
                  {post.title}
                  {getIsRecentlyUpdated(post.lastModifiedDate) && (
                    <span className={styles.newBadge}>NEW</span>
                  )}
                </Link>
              </h2>
              <div className={styles.postMeta}>
                <DateTooltip regDate={post.regDate} lastModifiedDate={post.lastModifiedDate}>
                  <time className={styles.postDate}>
                    최종 수정 {post.lastModifiedDate}
                  </time>
                </DateTooltip>

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
    </>
  );
}
