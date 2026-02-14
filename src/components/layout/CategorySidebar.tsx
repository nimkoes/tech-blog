import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronDown, ChevronRight, Compass, Search, X } from 'lucide-react';
import styles from './CategorySidebar.module.scss';
import categoryData from '@/resources/category.json';
import { getAllDocuments } from '~/utils/getAllDocuments';
import type { CategoryNode, PostMeta } from '~/types/content';

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TopicGroup {
  id: string;
  name: string;
  posts: PostMeta[];
  latestDate: string;
  uniqueTagCount: number;
}

type ExploreView = 'topics' | 'recent';

function collectSlugs(node: CategoryNode): string[] {
  const slugs: string[] = [];

  if (node.fileName) {
    slugs.push(node.fileName);
  }

  node.children?.forEach(child => {
    slugs.push(...collectSlugs(child));
  });

  return slugs;
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function parseChapterOrder(title: string): number | null {
  const matched = title.match(/\[chap\.(\d+)]/i);
  if (!matched?.[1]) return null;

  const value = Number.parseInt(matched[1], 10);
  return Number.isFinite(value) ? value : null;
}

function parseFileOrder(fileName: string): number | null {
  const matched = fileName.match(/^(\d{4})-/);
  if (!matched?.[1]) return null;

  const value = Number.parseInt(matched[1], 10);
  return Number.isFinite(value) ? value : null;
}

function comparePostsForTrack(a: PostMeta, b: PostMeta): number {
  const chapterA = parseChapterOrder(a.title);
  const chapterB = parseChapterOrder(b.title);

  if (chapterA !== null || chapterB !== null) {
    if (chapterA === null) return 1;
    if (chapterB === null) return -1;
    if (chapterA !== chapterB) return chapterA - chapterB;
  }

  if (a.regDate !== b.regDate) {
    return a.regDate.localeCompare(b.regDate);
  }

  const fileOrderA = parseFileOrder(a.fileName);
  const fileOrderB = parseFileOrder(b.fileName);
  if (fileOrderA !== null && fileOrderB !== null && fileOrderA !== fileOrderB) {
    return fileOrderA - fileOrderB;
  }

  return a.title.localeCompare(b.title, 'ko', { numeric: true, sensitivity: 'base' });
}

function getTopicDisplayName(name: string): string {
  if (name.trim().toLowerCase() === 'go') {
    return 'golang';
  }
  return name;
}

function getLatestDate(posts: PostMeta[]): string {
  if (posts.length === 0) {
    return '-';
  }

  return posts.reduce((latest, post) => {
    return post.lastModifiedDate > latest ? post.lastModifiedDate : latest;
  }, posts[0].lastModifiedDate);
}

export default function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<ExploreView>('topics');
  const inputRef = useRef<HTMLInputElement>(null);
  const allDocuments = useMemo(() => getAllDocuments(), []);

  const documentMap = useMemo(() => {
    const map = new Map<string, PostMeta>();
    allDocuments.forEach(doc => map.set(doc.fileName, doc));
    return map;
  }, [allDocuments]);

  const groups = useMemo<TopicGroup[]>(() => {
    const roots = (categoryData as CategoryNode[]).flatMap(root => root.children ?? []);

    return roots
      .map(node => {
        const posts = collectSlugs(node)
          .map(slug => documentMap.get(slug))
          .filter((doc): doc is PostMeta => Boolean(doc))
          .sort(comparePostsForTrack);

        return {
          id: node.id,
          name: node.displayName,
          posts,
          latestDate: getLatestDate(posts),
          uniqueTagCount: new Set(posts.flatMap(post => post.tags)).size,
        };
      })
      .filter(group => group.posts.length > 0);
  }, [documentMap]);

  const recentPosts = useMemo(() => allDocuments.slice(0, 5), [allDocuments]);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
      return groups;
    }

    return groups
      .map(group => {
        const groupSearchSeed = `${group.name} ${getTopicDisplayName(group.name)}`.toLowerCase();
        const isGroupMatch = groupSearchSeed.includes(normalizedQuery);
        if (isGroupMatch) {
          return group;
        }

        const matchedPosts = group.posts.filter(post => {
          const haystack = `${post.title} ${post.tags.join(' ')}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        });

        if (matchedPosts.length === 0) {
          return null;
        }

        return {
          ...group,
          posts: matchedPosts,
          latestDate: matchedPosts.length > 0 ? getLatestDate(matchedPosts) : group.latestDate,
          uniqueTagCount: new Set(matchedPosts.flatMap(post => post.tags)).size,
        };
      })
      .filter((group): group is TopicGroup => Boolean(group));
  }, [groups, query]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const syncViewport = () => setIsMobile(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    if (query.trim()) {
      setMobileView('topics');
    }
  }, [isMobile, query]);

  useEffect(() => {
    if (!isOpen) return;

    setQuery('');
    setMobileView('topics');
    setExpanded(new Set());

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => inputRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [groups, isMobile, isOpen, onClose]);

  const toggleGroup = (groupId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const expandAllGroups = () => {
    setExpanded(new Set(filteredGroups.map(group => group.id)));
  };

  const collapseAllGroups = () => {
    setExpanded(new Set());
  };

  const showRecentSection = !isMobile || mobileView === 'recent';
  const showTopicSection = !isMobile || mobileView === 'topics';
  const shouldCollapseRecentSection = !isMobile && query.trim().length > 0;

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside
        id="category-sidebar"
        className={styles.sidebar}
        role="dialog"
        aria-modal="true"
        aria-label="카테고리 탐색 패널"
        onClick={event => event.stopPropagation()}
      >
        <div className={styles.sheetHandle} aria-hidden="true" />
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>탐색</h2>
            <p className={styles.subtitle}>토픽별 학습 트랙과 최근 업데이트를 확인하세요.</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="탐색 닫기">
            <X size={20} />
          </button>
        </header>

        <div className={styles.searchRow}>
          <Search size={16} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="토픽명 또는 문서 제목 검색"
            aria-label="토픽과 문서 검색"
          />
        </div>

        {isMobile && (
          <div className={styles.mobileTabs} role="tablist" aria-label="탐색 보기 전환">
            <button
              id="explore-tab-topics"
              type="button"
              role="tab"
              aria-selected={mobileView === 'topics'}
              className={`${styles.mobileTab} ${mobileView === 'topics' ? styles.mobileTabActive : ''}`}
              onClick={() => setMobileView('topics')}
            >
              토픽 트랙
            </button>
            <button
              id="explore-tab-recent"
              type="button"
              role="tab"
              aria-selected={mobileView === 'recent'}
              className={`${styles.mobileTab} ${mobileView === 'recent' ? styles.mobileTabActive : ''}`}
              onClick={() => setMobileView('recent')}
            >
              최근 업데이트
            </button>
          </div>
        )}

        <div className={styles.panelBody}>
          {showRecentSection && (
            <section
              className={`${styles.recentSection} ${shouldCollapseRecentSection ? styles.recentSectionCollapsed : ''}`}
              role={isMobile ? 'tabpanel' : undefined}
              aria-labelledby={isMobile ? 'explore-tab-recent' : undefined}
              aria-hidden={shouldCollapseRecentSection}
            >
              <h3 className={styles.sectionTitle}>최근 업데이트</h3>
              <ul className={styles.recentList}>
                {recentPosts.map(post => (
                  <li key={`recent:${post.fileName}`} className={styles.recentItem}>
                    <Link href={`/post/${post.fileName}/`} className={styles.recentLink} onClick={onClose}>
                      <span className={styles.recentMain}>
                        <span className={styles.recentTitle}>{post.title}</span>
                        <span className={styles.recentMeta}>
                          <time dateTime={post.lastModifiedDate}>{post.lastModifiedDate}</time>
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={`recent:${post.fileName}:${tag}`} className={styles.recentTag}>
                              {tag}
                            </span>
                          ))}
                        </span>
                      </span>
                      <ChevronRight className={styles.recentArrow} size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showTopicSection && (
            <section
              className={styles.groupSection}
              role={isMobile ? 'tabpanel' : undefined}
              aria-labelledby={isMobile ? 'explore-tab-topics' : undefined}
            >
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.sectionTitle}>
                  <Compass size={14} />
                  토픽 트랙
                </h3>
                {isMobile && filteredGroups.length > 0 && (
                  <div className={styles.foldButtons}>
                    <button
                      type="button"
                      className={styles.foldButton}
                      onClick={expandAllGroups}
                      disabled={expanded.size === filteredGroups.length}
                    >
                      전체 펼치기
                    </button>
                    <button
                      type="button"
                      className={styles.foldButton}
                      onClick={collapseAllGroups}
                      disabled={expanded.size === 0}
                    >
                      모두 접기
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.groupList}>
                {filteredGroups.length === 0 && (
                  <div className={styles.emptyState}>일치하는 토픽이 없습니다.</div>
                )}
                {filteredGroups.map(group => {
                  const isExpanded = expanded.has(group.id);
                  return (
                    <article key={group.id} className={styles.groupCard}>
                      <button
                        type="button"
                        className={styles.groupHeader}
                        onClick={() => toggleGroup(group.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`topic-${group.id}`}
                      >
                        <div className={styles.groupMeta}>
                          <strong>{getTopicDisplayName(group.name)}</strong>
                          <span>{group.posts.length}개 문서 · 태그 {group.uniqueTagCount}개</span>
                        </div>
                        <div className={styles.groupRight}>
                          <span className={styles.dateChip}>
                            <CalendarDays size={12} />
                            {group.latestDate}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <ul id={`topic-${group.id}`} className={styles.groupPosts}>
                          {group.posts.map(post => (
                            <li key={`${group.id}:${post.fileName}`}>
                              <Link href={`/post/${post.fileName}/`} className={styles.postLink} onClick={onClose}>
                                <span>{post.title}</span>
                                <small>{post.lastModifiedDate}</small>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
