import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useBodyScrollLock from "~/hooks/useBodyScrollLock";
import { BookOpen, ChevronDown, ChevronRight, Folder, FolderOpen, Hash, Search, X } from "lucide-react";
import styles from "./CategorySidebar.module.scss";
import categoryData from "@/resources/category.json";
import { getAllDocuments } from "~/utils/getAllDocuments";
import type { CategoryNode } from "~/types/content";
import { slugifyTag } from "~/utils/tags";
import {
  buildCategoryTree,
  collectCategoryGroupIds,
  filterCategoryTree,
  findCategoryAncestorIds,
  type CategoryTreeGroup,
} from "~/utils/categoryTree";

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExploreView = "recent" | "topics" | "library";
const NON_TOPIC_TAGS = new Set(["단편", "시리즈", "학습노트"]);

function normalize(text: string) {
  return text.trim().toLowerCase();
}

interface CategoryTreeNodeProps {
  node: CategoryTreeGroup;
  depth: number;
  expanded: Set<string>;
  searchActive: boolean;
  currentSlug: string;
  onToggle: (id: string) => void;
  onNavigate: () => void;
}

function CategoryTreeNode({ node, depth, expanded, searchActive, currentSlug, onToggle, onNavigate }: CategoryTreeNodeProps) {
  const isExpanded = searchActive || expanded.has(node.id);
  const groupLabel = node.kind === "series" ? "시리즈" : node.kind === "folder" ? "폴더" : "카테고리";

  return (
    <li className={`${styles.treeNode} ${depth === 0 ? styles.treeRoot : ""}`}>
      <button
        type="button"
        className={styles.treeFolderButton}
        onClick={() => onToggle(node.id)}
        aria-expanded={isExpanded}
        aria-controls={`category-tree-${node.id}`}
      >
        <span className={styles.treeFolderLead}>
          {isExpanded ? <FolderOpen size={17} /> : <Folder size={17} />}
          <span className={styles.treeFolderText}>
            <strong>{node.name}</strong>
            <small>{groupLabel}</small>
          </span>
        </span>
        <span className={styles.treeFolderSummary}>
          <span className={styles.treeCount}>{node.postCount}</span>
          <ChevronDown size={15} className={`${styles.chevron} ${isExpanded ? styles.expanded : ""}`} />
        </span>
      </button>

      {isExpanded && (
        <ul id={`category-tree-${node.id}`} className={styles.treeChildren}>
          {node.children.map((child) => {
            if (child.type === "group") {
              return (
                <CategoryTreeNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  expanded={expanded}
                  searchActive={searchActive}
                  currentSlug={currentSlug}
                  onToggle={onToggle}
                  onNavigate={onNavigate}
                />
              );
            }

            const isCurrent = child.post.fileName === currentSlug;
            return (
              <li key={child.id} className={styles.treePost}>
                <Link
                  href={`/post/${child.post.fileName}/`}
                  className={`${styles.postLink} ${isCurrent ? styles.currentPost : ""}`}
                  onClick={onNavigate}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <span>{child.post.title}</span>
                  <small>{child.post.lastModifiedDate}</small>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export default function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
  useBodyScrollLock(isOpen);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<ExploreView>("recent");
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const allDocuments = useMemo(() => getAllDocuments(), []);
  const currentSlug = pathname.match(/\/post\/([^/]+)/)?.[1] ?? "";
  const categoryTree = useMemo(() => buildCategoryTree(categoryData as CategoryNode[], allDocuments), [allDocuments]);

  const recentPosts = useMemo(() => allDocuments.slice(0, 8), [allDocuments]);

  const matchingPosts = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return recentPosts;
    return allDocuments
      .filter((post) => `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 12);
  }, [allDocuments, query, recentPosts]);

  const topics = useMemo(() => {
    const topicMap = new Map<string, { tag: string; count: number }>();
    allDocuments.forEach((post) => {
      post.tags.forEach((tag) => {
        const key = tag.trim().toLowerCase();
        const existing = topicMap.get(key);
        topicMap.set(key, { tag: existing?.tag || tag, count: (existing?.count || 0) + 1 });
      });
    });

    return Array.from(topicMap.values())
      .filter((topic) => topic.count >= 2 && !NON_TOPIC_TAGS.has(topic.tag.trim().toLowerCase()))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "ko"));
  }, [allDocuments]);

  const filteredTopics = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return topics.slice(0, 24);
    return topics.filter((topic) => normalize(topic.tag).includes(normalizedQuery)).slice(0, 24);
  }, [query, topics]);

  const filteredTree = useMemo(() => filterCategoryTree(categoryTree, query), [categoryTree, query]);
  const expandableGroupIds = useMemo(() => collectCategoryGroupIds(filteredTree), [filteredTree]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncViewport = () => setIsMobile(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setQuery("");
    setMobileView("recent");
    setExpanded(new Set(findCategoryAncestorIds(categoryTree, currentSlug)));

    requestAnimationFrame(() => inputRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryTree, currentSlug, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || mobileView !== "library" || !currentSlug || query) return;

    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
    });
  }, [currentSlug, isOpen, mobileView, query]);

  const toggleGroup = (groupId: string) => {
    setExpanded((prev) => {
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
    setExpanded(new Set(expandableGroupIds));
  };

  const collapseAllGroups = () => {
    setExpanded(new Set());
  };

  const showRecentSection = mobileView === "recent";
  const showTopicSection = mobileView === "topics";
  const showLibrarySection = mobileView === "library";

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside
        ref={panelRef}
        id="category-sidebar"
        className={styles.sidebar}
        role="dialog"
        aria-modal="true"
        aria-label="카테고리 탐색 패널"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.sheetHandle} aria-hidden="true" />
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>탐색</h2>
            <p className={styles.subtitle}>최근 글, 주요 토픽, 카테고리와 시리즈를 탐색하세요.</p>
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="토픽명 또는 문서 제목 검색"
            aria-label="토픽과 문서 검색"
          />
        </div>

        <div
          className={styles.mobileTabs}
          role="tablist"
          aria-label="탐색 보기 전환"
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const order: ExploreView[] = ["recent", "topics", "library"];
            const currentIndex = order.indexOf(mobileView);
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const nextView = order[(currentIndex + direction + order.length) % order.length];
            setMobileView(nextView);
            requestAnimationFrame(() => document.getElementById(`explore-tab-${nextView}`)?.focus());
          }}
        >
          <button
            id="explore-tab-recent"
            type="button"
            role="tab"
            aria-selected={mobileView === "recent"}
            aria-controls="explore-panel-recent"
            tabIndex={mobileView === "recent" ? 0 : -1}
            className={`${styles.mobileTab} ${mobileView === "recent" ? styles.mobileTabActive : ""}`}
            onClick={() => setMobileView("recent")}
          >
            최근 글
          </button>
          <button
            id="explore-tab-topics"
            type="button"
            role="tab"
            aria-selected={mobileView === "topics"}
            aria-controls="explore-panel-topics"
            tabIndex={mobileView === "topics" ? 0 : -1}
            className={`${styles.mobileTab} ${mobileView === "topics" ? styles.mobileTabActive : ""}`}
            onClick={() => setMobileView("topics")}
          >
            주요 토픽
          </button>
          <button
            id="explore-tab-library"
            type="button"
            role="tab"
            aria-selected={mobileView === "library"}
            aria-controls="explore-panel-library"
            tabIndex={mobileView === "library" ? 0 : -1}
            className={`${styles.mobileTab} ${mobileView === "library" ? styles.mobileTabActive : ""}`}
            onClick={() => setMobileView("library")}
          >
            분류
          </button>
        </div>

        <div className={styles.panelBody}>
          {showRecentSection && (
            <section id="explore-panel-recent" className={styles.recentSection} role="tabpanel" aria-labelledby="explore-tab-recent">
              <h3 className={styles.sectionTitle}>최근 업데이트</h3>
              <ul className={styles.recentList}>
                {matchingPosts.map((post) => (
                  <li key={`recent:${post.fileName}`} className={styles.recentItem}>
                    <Link href={`/post/${post.fileName}/`} className={styles.recentLink} onClick={onClose}>
                      <span className={styles.recentMain}>
                        <span className={styles.recentTitle}>{post.title}</span>
                        <span className={styles.recentMeta}>
                          <time dateTime={post.lastModifiedDate}>{post.lastModifiedDate}</time>
                          {post.tags.slice(0, 2).map((tag) => (
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
              {matchingPosts.length === 0 && <div className={styles.emptyState}>일치하는 문서가 없습니다.</div>}
            </section>
          )}

          {showTopicSection && (
            <section id="explore-panel-topics" className={styles.topicSection} role="tabpanel" aria-labelledby="explore-tab-topics">
              <h3 className={styles.sectionTitle}>
                <Hash size={14} />
                주요 토픽
              </h3>
              <div className={styles.topicGrid}>
                {filteredTopics.map((topic) => (
                  <Link key={topic.tag} href={`/tags/${slugifyTag(topic.tag)}`} className={styles.topicLink} onClick={onClose}>
                    <span>{topic.tag}</span>
                    <small>{topic.count}</small>
                  </Link>
                ))}
              </div>
              {filteredTopics.length === 0 && <div className={styles.emptyState}>일치하는 토픽이 없습니다.</div>}
            </section>
          )}

          {showLibrarySection && (
            <section id="explore-panel-library" className={styles.groupSection} role="tabpanel" aria-labelledby="explore-tab-library">
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.sectionTitle}>
                  <BookOpen size={14} />
                  문서 구조
                </h3>
                {isMobile && filteredTree.length > 0 && (
                  <div className={styles.foldButtons}>
                    <button
                      type="button"
                      className={styles.foldButton}
                      onClick={expandAllGroups}
                      disabled={expanded.size >= expandableGroupIds.length}
                    >
                      전체 펼치기
                    </button>
                    <button type="button" className={styles.foldButton} onClick={collapseAllGroups} disabled={expanded.size === 0}>
                      모두 접기
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.categoryTree}>
                {filteredTree.length === 0 && <div className={styles.emptyState}>일치하는 분류나 문서가 없습니다.</div>}
                <ul className={styles.treeList}>
                  {filteredTree.map((group) => (
                    <CategoryTreeNode
                      key={group.id}
                      node={group}
                      depth={0}
                      expanded={expanded}
                      searchActive={Boolean(query.trim())}
                      currentSlug={currentSlug}
                      onToggle={toggleGroup}
                      onNavigate={onClose}
                    />
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
