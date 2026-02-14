"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Command, CornerDownLeft, FileText, Search, Tag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTagContext } from '~/context/TagContext';
import { getAllDocuments } from '~/utils/getAllDocuments';
import type { PostMeta } from '~/types/content';
import styles from './SearchSidebar.module.scss';

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RankedPost {
  item: PostMeta;
  score: number;
  matchedTags: string[];
}

interface RankedTag {
  tag: string;
  count: number;
  score: number;
}

interface CommandItem {
  id: string;
  kind: 'post' | 'tag';
  post?: PostMeta;
  tag?: string;
}

const MAX_POST_RESULTS = 12;
const MAX_TAG_RESULTS = 8;

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function buildPostScore(post: PostMeta, query: string): { score: number; matchedTags: string[] } {
  if (!query) {
    return { score: 1, matchedTags: [] };
  }

  const title = post.title.toLowerCase();
  const slug = post.fileName.toLowerCase();
  const queryTokens = query.split(/\s+/).filter(Boolean);
  const matchedTags = post.tags.filter(tag => tag.toLowerCase().includes(query));

  let score = 0;
  const titleIndex = title.indexOf(query);
  if (titleIndex >= 0) {
    score += 120 - Math.min(titleIndex, 60);
  }

  const slugIndex = slug.indexOf(query);
  if (slugIndex >= 0) {
    score += 55 - Math.min(slugIndex, 30);
  }

  if (matchedTags.length > 0) {
    score += matchedTags.length * 35;
  }

  const joined = `${title} ${post.tags.join(' ').toLowerCase()}`;
  if (queryTokens.length > 1 && queryTokens.every(token => joined.includes(token))) {
    score += 24;
  }

  return { score, matchedTags };
}

export default function SearchSidebar({ isOpen, onClose }: SearchSidebarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectedTags, setSelectedTags, setToastMessage } = useTagContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredTerm = useDeferredValue(normalize(searchTerm));

  const documents = useMemo(() => getAllDocuments(), []);

  const tagCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    documents.forEach(doc => {
      doc.tags.forEach(tag => {
        map[tag] = (map[tag] || 0) + 1;
      });
    });
    return map;
  }, [documents]);

  const allTags = useMemo(
    () => Object.entries(tagCountMap).sort((a, b) => b[1] - a[1]),
    [tagCountMap]
  );

  const rankedPosts = useMemo<RankedPost[]>(() => {
    if (!deferredTerm) {
      return documents.slice(0, MAX_POST_RESULTS).map((item, index) => ({
        item,
        score: MAX_POST_RESULTS - index,
        matchedTags: [],
      }));
    }

    return documents
      .map(item => {
        const { score, matchedTags } = buildPostScore(item, deferredTerm);
        return { item, score, matchedTags };
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_POST_RESULTS);
  }, [deferredTerm, documents]);

  const rankedTags = useMemo<RankedTag[]>(() => {
    if (!deferredTerm) {
      return allTags.slice(0, MAX_TAG_RESULTS).map(([tag, count], index) => ({
        tag,
        count,
        score: MAX_TAG_RESULTS - index,
      }));
    }

    return allTags
      .filter(([tag]) => tag.toLowerCase().includes(deferredTerm))
      .map(([tag, count]) => ({
        tag,
        count,
        score: 30 + count,
      }))
      .slice(0, MAX_TAG_RESULTS);
  }, [allTags, deferredTerm]);

  const commandItems = useMemo<CommandItem[]>(() => {
    const posts = rankedPosts.map(entry => ({
      id: `post:${entry.item.fileName}`,
      kind: 'post' as const,
      post: entry.item,
    }));

    const tags = rankedTags.map(entry => ({
      id: `tag:${entry.tag}`,
      kind: 'tag' as const,
      tag: entry.tag,
    }));

    return [...posts, ...tags];
  }, [rankedPosts, rankedTags]);

  const commandIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    commandItems.forEach((item, index) => map.set(item.id, index));
    return map;
  }, [commandItems]);

  const activeItem = commandItems[activeIndex] || null;

  const focusCommandById = useCallback((id: string) => {
    const index = commandIndexMap.get(id);
    if (index !== undefined) {
      setActiveIndex(index);
    }
  }, [commandIndexMap]);

  const moveToHomeWithTags = useCallback((tags: string[]) => {
    if (tags.length === 0) {
      router.push('/');
      return;
    }

    const params = new URLSearchParams();
    params.set('tags', tags.join(','));
    router.push(`/?${params.toString()}`);
  }, [router]);

  const addTag = useCallback((tag: string, closeAfter = false) => {
    if (selectedTags.includes(tag)) {
      moveToHomeWithTags(selectedTags);
      if (closeAfter) {
        onClose();
      }
      return;
    }

    if (selectedTags.length >= 5) {
      setToastMessage('태그는 최대 5개까지 선택할 수 있습니다.');
      moveToHomeWithTags(selectedTags);
      return;
    }

    const nextTags = [...selectedTags, tag];
    setSelectedTags(nextTags);
    moveToHomeWithTags(nextTags);
    if (closeAfter) {
      onClose();
    }
  }, [moveToHomeWithTags, onClose, selectedTags, setSelectedTags, setToastMessage]);

  const removeTag = useCallback((tag: string) => {
    const nextTags = selectedTags.filter(item => item !== tag);
    setSelectedTags(nextTags);
    moveToHomeWithTags(nextTags);
  }, [moveToHomeWithTags, selectedTags, setSelectedTags]);

  const runCommand = useCallback((item: CommandItem) => {
    if (item.kind === 'post' && item.post) {
      router.push(`/post/${item.post.fileName}/`);
      onClose();
      return;
    }

    if (item.kind === 'tag' && item.tag) {
      addTag(item.tag, true);
    }
  }, [addTag, onClose, router]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setSearchTerm('');
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [deferredTerm, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (commandItems.length === 0) return;
        setActiveIndex(prev => (prev + 1) % commandItems.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (commandItems.length === 0) return;
        setActiveIndex(prev => (prev - 1 + commandItems.length) % commandItems.length);
        return;
      }

      if (event.key === 'Enter' && activeItem) {
        event.preventDefault();
        runCommand(activeItem);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem, commandItems.length, isOpen, onClose, runCommand]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        id="search-sidebar"
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="검색 패널"
        onClick={event => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>문서 검색</h2>
            <p className={styles.subtitle}>제목, 태그, 문서 키워드로 빠르게 이동합니다.</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="검색 닫기">
            <X size={20} />
          </button>
        </header>

        <div className={styles.searchRow}>
          <Search className={styles.searchIcon} size={18} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="예: kubernetes service, security filter chain"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            aria-activedescendant={activeItem?.id}
          />
        </div>

        {selectedTags.length > 0 && (
          <div className={styles.selectedTags}>
            {selectedTags.map(tag => (
              <button type="button" key={tag} className={styles.selectedTag} onClick={() => removeTag(tag)}>
                <Tag size={12} />
                {tag}
                <X size={12} />
              </button>
            ))}
          </div>
        )}

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText size={14} />
              문서
            </div>
            {rankedPosts.length === 0 ? (
              <div className={styles.empty}>검색 결과가 없습니다. 다른 키워드를 시도해보세요.</div>
            ) : (
              <ul className={styles.resultList} role="listbox" aria-label="문서 검색 결과">
                {rankedPosts.map(entry => {
                  const id = `post:${entry.item.fileName}`;
                  const active = commandIndexMap.get(id) === activeIndex;
                  return (
                    <li key={id}>
                      <button
                        id={id}
                        type="button"
                        className={`${styles.resultItem} ${active ? styles.resultItemActive : ''}`}
                        onMouseEnter={() => focusCommandById(id)}
                        onClick={() => runCommand({ id, kind: 'post', post: entry.item })}
                        role="option"
                        aria-selected={active}
                      >
                        <div className={styles.resultTop}>
                          <span className={styles.resultTitle}>{entry.item.title}</span>
                          <span className={styles.resultDate}>{entry.item.lastModifiedDate}</span>
                        </div>
                        <div className={styles.resultMeta}>
                          {entry.item.tags.slice(0, 4).map(tag => (
                            <span key={`${id}:${tag}`} className={styles.metaTag}>{tag}</span>
                          ))}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Tag size={14} />
              태그 제안
            </div>
            {rankedTags.length === 0 ? (
              <div className={styles.empty}>일치하는 태그가 없습니다.</div>
            ) : (
              <div className={styles.tagGrid} role="listbox" aria-label="태그 제안">
                {rankedTags.map(entry => {
                  const id = `tag:${entry.tag}`;
                  const active = commandIndexMap.get(id) === activeIndex;
                  return (
                    <button
                      key={id}
                      id={id}
                      type="button"
                      className={`${styles.tagItem} ${active ? styles.tagItemActive : ''}`}
                      onMouseEnter={() => focusCommandById(id)}
                      onClick={() => addTag(entry.tag, true)}
                      role="option"
                      aria-selected={active}
                    >
                      <span>{entry.tag}</span>
                      <span className={styles.tagCount}>{entry.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <footer className={styles.footer}>
          <span><Command size={13} />⌘/Ctrl + K 검색 열기</span>
          <span>↑ ↓ 이동</span>
          <span><CornerDownLeft size={13} /> 실행</span>
        </footer>
      </section>
    </div>
  );
}
