'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowUp, ListTree, Minus, Plus, SlidersHorizontal, Type, X } from 'lucide-react';
import type { TocItem } from '~/types/content';
import useBodyScrollLock from '~/hooks/useBodyScrollLock';

interface TOCProps {
  toc: TocItem[];
}

interface TocGroup {
  heading: TocItem;
  children: TocItem[];
}

const ACTIVE_OFFSET = 112;
const FONT_SIZE_STORAGE_KEY = 'post-font-size-step';
const MIN_FONT_SIZE_STEP = -5;
const MAX_FONT_SIZE_STEP = 5;
const PANEL_CLOSE_DRAG_DISTANCE = 72;

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
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState(0);
  const [panelDragOffset, setPanelDragOffset] = useState(0);
  const [isPanelDragging, setIsPanelDragging] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const panelDragStartRef = useRef(0);
  const panelDragOffsetRef = useRef(0);
  const suppressHandleClickRef = useRef(false);
  const groups = useMemo(() => groupToc(toc), [toc]);
  const activeItem = toc.find(item => item.id === activeId);
  const activeGroup = groups.find(group =>
    group.heading.id === activeId || group.children.some(item => item.id === activeId)
  );
  useBodyScrollLock(isOpen);

  const closeDocumentMap = useCallback(() => {
    panelDragOffsetRef.current = 0;
    setPanelDragOffset(0);
    setIsPanelDragging(false);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const stored = Number.parseInt(window.localStorage.getItem(FONT_SIZE_STORAGE_KEY) || '0', 10);
    const nextStep = Number.isFinite(stored)
      ? Math.min(MAX_FONT_SIZE_STEP, Math.max(MIN_FONT_SIZE_STEP, stored))
      : 0;
    setFontSizeStep(nextStep);
    document.documentElement.style.setProperty('--reader-font-adjust', `${nextStep}px`);
  }, []);

  const changeFontSize = (nextStep: number) => {
    const boundedStep = Math.min(MAX_FONT_SIZE_STEP, Math.max(MIN_FONT_SIZE_STEP, nextStep));
    setFontSizeStep(boundedStep);
    document.documentElement.style.setProperty('--reader-font-adjust', `${boundedStep}px`);
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(boundedStep));
  };

  useEffect(() => {
    const ids = toc.map(item => item.id).filter(Boolean);
    if (ids.length === 0) return;

    let frame = 0;
    const updateReadingState = () => {
      frame = 0;
      if (document.documentElement.dataset.scrollLocked === 'true') return;
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

    const trigger = triggerRef.current;
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('a, button')?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDocumentMap();
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
      window.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [closeDocumentMap, isOpen]);

  useEffect(() => {
    if (!isToolsOpen) return;

    const closeTools = (event: PointerEvent) => {
      if (!toolsRef.current?.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    const closeToolsWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsToolsOpen(false);
    };

    document.addEventListener('pointerdown', closeTools);
    window.addEventListener('keydown', closeToolsWithEscape);
    return () => {
      document.removeEventListener('pointerdown', closeTools);
      window.removeEventListener('keydown', closeToolsWithEscape);
    };
  }, [isToolsOpen]);

  const startPanelDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    panelDragStartRef.current = event.clientY;
    panelDragOffsetRef.current = 0;
    suppressHandleClickRef.current = false;
    setPanelDragOffset(0);
    setIsPanelDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePanelDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isPanelDragging) return;

    const nextOffset = Math.max(0, event.clientY - panelDragStartRef.current);
    panelDragOffsetRef.current = nextOffset;
    if (nextOffset > 6) suppressHandleClickRef.current = true;
    setPanelDragOffset(nextOffset);
  };

  const finishPanelDrag = (event: ReactPointerEvent<HTMLButtonElement>, cancelled = false) => {
    if (!isPanelDragging) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const shouldClose = !cancelled && panelDragOffsetRef.current >= PANEL_CLOSE_DRAG_DISTANCE;
    setIsPanelDragging(false);
    panelDragOffsetRef.current = 0;
    setPanelDragOffset(0);

    if (shouldClose) closeDocumentMap();
  };

  const closeAfterNavigation = closeDocumentMap;
  const progressLabel = `${Math.round(progress)}%`;

  return (
    <>
      <div className="readingNavigatorDock" ref={toolsRef}>
        <button
          ref={triggerRef}
          type="button"
          className="readingNavigator"
          onClick={() => {
            setIsToolsOpen(false);
            setIsOpen(true);
          }}
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

        <div className="readingTools">
          {isToolsOpen && (
            <div
              id="reading-tools-panel"
              className="readingToolsPanel"
              role="dialog"
              aria-label="읽기 도구"
            >
              <button
                type="button"
                className="readingToolsTopAction"
                onClick={() => {
                  setIsToolsOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <ArrowUp size={18} aria-hidden="true" />
                <span>맨 위로</span>
              </button>

              <div className="readingFontControl" aria-label="본문 글자 크기 조절">
                <span className="readingFontControlLabel">
                  <Type size={16} aria-hidden="true" />
                  글자 크기
                </span>
                <div className="readingFontControlButtons">
                  <button
                    type="button"
                    onClick={() => changeFontSize(fontSizeStep - 1)}
                    disabled={fontSizeStep === MIN_FONT_SIZE_STEP}
                    aria-label="본문 글자 크기 줄이기"
                  >
                    <Minus size={17} aria-hidden="true" />
                  </button>
                  <output aria-live="polite">
                    {fontSizeStep === 0 ? '기본' : fontSizeStep > 0 ? `+${fontSizeStep}` : fontSizeStep}
                  </output>
                  <button
                    type="button"
                    onClick={() => changeFontSize(fontSizeStep + 1)}
                    disabled={fontSizeStep === MAX_FONT_SIZE_STEP}
                    aria-label="본문 글자 크기 키우기"
                  >
                    <Plus size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="readingToolsTrigger"
            onClick={() => setIsToolsOpen(open => !open)}
            aria-label={isToolsOpen ? '읽기 도구 닫기' : '읽기 도구 열기'}
            aria-expanded={isToolsOpen}
            aria-controls="reading-tools-panel"
          >
            <SlidersHorizontal size={19} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="documentMapOverlay" onClick={closeDocumentMap}>
          <nav
            ref={panelRef}
            id="document-map"
            className={`documentMap${isPanelDragging ? ' documentMapDragging' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-map-title"
            onClick={event => event.stopPropagation()}
            style={{ '--document-map-drag-y': `${panelDragOffset}px` } as CSSProperties}
          >
            <button
              type="button"
              className="documentMapHandle"
              aria-label="글 탐색 닫기"
              onClick={() => {
                if (suppressHandleClickRef.current) {
                  suppressHandleClickRef.current = false;
                  return;
                }
                closeDocumentMap();
              }}
              onPointerDown={startPanelDrag}
              onPointerMove={movePanelDrag}
              onPointerUp={event => finishPanelDrag(event)}
              onPointerCancel={event => finishPanelDrag(event, true)}
            />
            <header className="documentMapHeader">
              <div>
                <p>DOCUMENT MAP</p>
                <h2 id="document-map-title">이 글에서 찾기</h2>
              </div>
              <button type="button" onClick={closeDocumentMap} aria-label="글 목차 닫기">
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
