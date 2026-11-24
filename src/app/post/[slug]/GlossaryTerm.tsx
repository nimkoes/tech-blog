'use client';

import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './GlossaryTerm.module.scss';

interface GlossaryTermProps {
  term: string;
  definition: string;
  children: ReactNode;
}

interface TooltipPosition {
  left: number;
  top: number;
  visible: boolean;
}

export default function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const lastPointerType = useRef('mouse');
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    left: 0,
    top: 0,
    visible: false,
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportMargin = 12;
    const gap = 9;
    const maxLeft = Math.max(viewportMargin, window.innerWidth - tooltipRect.width - viewportMargin);
    const left = Math.min(
      Math.max(triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2, viewportMargin),
      maxLeft
    );
    const showAbove = triggerRect.top >= tooltipRect.height + gap + viewportMargin;
    const top = showAbove
      ? triggerRect.top - tooltipRect.height - gap
      : triggerRect.bottom + gap;

    setPosition({ left, top, visible: true });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !tooltipRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    lastPointerType.current = event.pointerType;
    if (event.pointerType === 'mouse') setOpen(true);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') setOpen(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    lastPointerType.current = event.pointerType;
  };

  const handleClick = () => {
    if (lastPointerType.current !== 'mouse') setOpen(value => !value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setOpen(value => !value);
  };

  const tooltipStyle: CSSProperties = {
    left: position.left,
    top: position.top,
    visibility: position.visible ? 'visible' : 'hidden',
  };

  return (
    <>
      <dfn
        ref={triggerRef}
        className={styles.term}
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        data-open={open ? 'true' : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onFocus={() => {
          if (lastPointerType.current === 'mouse') setOpen(true);
        }}
        onBlur={() => {
          if (lastPointerType.current === 'mouse') setOpen(false);
        }}
        onKeyDown={handleKeyDown}
      >
        {children}
      </dfn>
      {open && typeof document !== 'undefined' && createPortal(
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={styles.tooltip}
          style={tooltipStyle}
        >
          <strong className={styles.tooltipTerm}>{term}</strong>
          <span className={styles.tooltipDefinition}>{definition}</span>
        </span>,
        document.body
      )}
    </>
  );
}
