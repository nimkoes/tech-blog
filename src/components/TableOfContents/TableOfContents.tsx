"use client";

import { useEffect, useState } from "react";
import styles from "./TableOfContents.module.scss";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isTocVisible, setIsTocVisible] = useState(false);

  useEffect(() => {
    const updateHeadings = () => {
      requestAnimationFrame(() => {
        const elements = document.querySelectorAll("h1, h2, h3");
        const tocItems: TocItem[] = [];
        const headingCount: Record<string, number> = {}; // ✅ 중복 방지

        elements.forEach((el, index) => {
          let baseId = el.textContent?.trim().replace(/\s+/g, "-").toLowerCase() || `heading-${index}`;
          if (!baseId) return;

          // ✅ 동일한 제목이 있을 경우 번호 추가
          const count = (headingCount[baseId] || 0) + 1;
          headingCount[baseId] = count;
          const uniqueId = count > 1 ? `${baseId}-${count}` : baseId;

          el.id = uniqueId; // ✅ 고유한 id 부여
          tocItems.push({ id: uniqueId, text: el.textContent?.trim() || "", level: Number(el.tagName[1]) });
        });

        setHeadings(tocItems);
      });
    };

    updateHeadings(); // ✅ 초기에 실행

    // ✅ DOM 변경 감지하여 제목 업데이트
    const observer = new MutationObserver(updateHeadings);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleTocVisibility = () => {
    setIsTocVisible(!isTocVisible);
  };

  return (
    <>
      <button className={styles.tocButton} onClick={toggleTocVisibility} aria-label="Toggle Table of Contents">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="4" width="20" height="16" rx="3" stroke="#CCCCCC" strokeWidth="1.5" />
          <circle cx="6" cy="8" r="1.5" fill="#CCCCCC" />
          <circle cx="6" cy="12" r="1.5" fill="#CCCCCC" />
          <circle cx="6" cy="16" r="1.5" fill="#CCCCCC" />
          <line x1="9" y1="8" x2="18" y2="8" stroke="#CCCCCC" strokeWidth="1.5" />
          <line x1="9" y1="12" x2="18" y2="12" stroke="#CCCCCC" strokeWidth="1.5" />
          <line x1="9" y1="16" x2="18" y2="16" stroke="#CCCCCC" strokeWidth="1.5" />
        </svg>
      </button>
      {isTocVisible && (
        <div
          className={`${styles.tocWrapper} ${isVisible ? styles.visible : ""}`}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className={styles.tocBox}>
            <div className={styles.tocHeader}>
              <span className={styles.tocText}>Table of Contents</span>
            </div>
            <ul>
              {headings.map((heading) => (
                <li key={heading.id} className={styles[`level${heading.level}`]}>
                  <a onClick={() => handleClick(heading.id)}>{heading.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}