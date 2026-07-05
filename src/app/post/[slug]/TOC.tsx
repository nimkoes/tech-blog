"use client";

import { useEffect, useState } from 'react';
import type { TocItem } from '~/types/content';

interface TOCProps {
  toc: TocItem[];
}

// 헤딩의 scroll-margin-top(88px)과 맞춘 활성 판정 기준선
const ACTIVE_OFFSET = 96;

const TOC = ({toc}: TOCProps) => {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const ids = toc.map(item => item.id).filter(Boolean);
    if (ids.length === 0) return;

    let ticking = false;
    const updateActive = () => {
      ticking = false;
      let current = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  return (
    <nav className="tocCard" aria-label="목차">
      <details open>
        <summary>Table of Contents</summary>
        <ul className="tocList">
          {toc.map((item, idx) => (
            <li key={idx} style={{marginLeft: `${(item.level - 1) * 1.2}em`}}>
              <a
                href={`#${item.id}`}
                className={activeId === item.id ? 'tocLinkActive' : undefined}
                aria-current={activeId === item.id ? 'true' : undefined}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
};

export default TOC;
