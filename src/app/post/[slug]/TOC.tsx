'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ListTree, X } from 'lucide-react';
import type { TocItem } from '~/types/content';

interface TOCProps {
  toc: TocItem[];
}

interface TocGroup {
  heading: TocItem;
  children: TocItem[];
}

const ACTIVE_OFFSET = 112;

function groupToc(toc: TocItem[]): TocGroup[] {
  const groups: TocGroup[] = [];

  toc.forEach(item => {
    if (item.level === 2 || groups.length === 0) {
      groups.push({ heading: item, children: [] });
      return;
    }

    groups[groups.length - 1].children.push(item);
  });

  return groups;
}

export default function TOC({ toc }: TOCProps) {
  const [activeId, setActiveId] = useState('');
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const groups = useMemo(() => groupToc(toc), [toc]);
  const activeItem = toc.find(item => item.id === activeId);
  const activeGroup = groups.find(group =>
    group.heading.id === activeId || group.children.some(item => item.id === activeId)
  );

  useEffect(() => {
    const ids = toc.map(item => item.id).filter(Boolean);
    if (ids.length === 0) return;

    let frame = 0;
    const updateReadingState = () => {
      frame = 0;
      let current = '';

      for (const id of ids) {
        const heading = document.getElementById(id);
        if (!heading) continue;
        if (heading.getBoundingClientRect().top <= ACTIVE_OFFSET) current = id;
        else break;
      }

      const root = document.documentElement;
      const available = Math.max(root.scrollHeight - window.innerHeight, 1);
      const nextProgress = Math.min(100, Math.max(0, (window.scrollY / available) * 100));
      setActiveId(current);
      setProgress(nextProgress);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateReadingState);
    };

    updateReadingState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [toc]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('a, button')?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [isOpen]);

  const closeAfterNavigation = () => setIsOpen(false);
  const progressLabel = `${Math.round(progress)}%`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="readingNavigator"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="document-map"
      >
        <span className="readingNavigatorIcon" aria-hidden="true">
          <ListTree size={17} />
        </span>
        <span className="readingNavigatorText">
          <span className="readingNavigatorEyebrow">글 탐색 · {progressLabel}</span>
          <span className="readingNavigatorSection">{activeItem?.text || '글 시작'}</span>
        </span>
        <span className="readingNavigatorTrack" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
      </button>

      {isOpen && (
        <div className="documentMapOverlay" onClick={() => setIsOpen(false)}>
          <nav
            ref={panelRef}
            id="document-map"
            className="documentMap"
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-map-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="documentMapHandle" aria-hidden="true" />
            <header className="documentMapHeader">
              <div>
                <p>DOCUMENT MAP</p>
                <h2 id="document-map-title">이 글에서 찾기</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="글 목차 닫기">
                <X size={19} />
              </button>
            </header>

            <div className="documentMapProgress" aria-label={`읽기 진행률 ${progressLabel}`}>
              <span style={{ width: `${progress}%` }} />
            </div>

            <ol className="documentMapList">
              {groups.map((group, index) => {
                const isCurrentGroup = activeGroup?.heading.id === group.heading.id;
                return (
                  <li key={group.heading.id} className={isCurrentGroup ? 'documentMapGroupActive' : undefined}>
                    <a
                      href={`#${group.heading.id}`}
                      onClick={closeAfterNavigation}
                      aria-current={activeId === group.heading.id ? 'location' : undefined}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {group.heading.text}
                    </a>
                    {isCurrentGroup && group.children.length > 0 && (
                      <ol className="documentMapChildren">
                        {group.children.map(child => (
                          <li key={child.id}>
                            <a
                              href={`#${child.id}`}
                              onClick={closeAfterNavigation}
                              aria-current={activeId === child.id ? 'location' : undefined}
                            >
                              {child.text}
                            </a>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      )}
    </>
  );
}
