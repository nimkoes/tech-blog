'use client';

import { useEffect } from 'react';

let lockCount = 0;
let lockedScrollY = 0;
let previousHtmlOverflow = '';
let previousHtmlScrollBehavior = '';
let previousScrollLockMarker: string | undefined;
let previousBodyStyles: Partial<CSSStyleDeclaration> = {};

function lockBodyScroll() {
  if (lockCount > 0) {
    lockCount += 1;
    return;
  }

  lockCount = 1;
  lockedScrollY = window.scrollY;
  previousHtmlOverflow = document.documentElement.style.overflow;
  previousHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
  previousScrollLockMarker = document.documentElement.dataset.scrollLocked;
  previousBodyStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    left: document.body.style.left,
    right: document.body.style.right,
    width: document.body.style.width,
    overscrollBehavior: document.body.style.overscrollBehavior,
  };

  document.documentElement.style.overflow = 'hidden';
  document.documentElement.dataset.scrollLocked = 'true';
  Object.assign(document.body.style, {
    overflow: 'hidden',
    position: 'fixed',
    top: `-${lockedScrollY}px`,
    left: '0',
    right: '0',
    width: '100%',
    overscrollBehavior: 'none',
  });
}

function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.documentElement.style.overflow = previousHtmlOverflow;
  document.documentElement.style.scrollBehavior = 'auto';
  if (previousScrollLockMarker === undefined) {
    delete document.documentElement.dataset.scrollLocked;
  } else {
    document.documentElement.dataset.scrollLocked = previousScrollLockMarker;
  }
  Object.assign(document.body.style, previousBodyStyles);
  window.scrollTo({ top: lockedScrollY, left: 0, behavior: 'auto' });

  const scrollBehavior = previousHtmlScrollBehavior;
  window.requestAnimationFrame(() => {
    if (lockCount === 0) document.documentElement.style.scrollBehavior = scrollBehavior;
  });
}

export default function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    lockBodyScroll();
    return unlockBodyScroll;
  }, [isLocked]);
}
