"use client";

import {useEffect, useState} from "react";
import styles from "./TableOfContents.module.scss";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll("article.markdown h1, h2, h3");
    const tocItems: TocItem[] = [];

    elements.forEach((el) => {
      const id = el.textContent?.replace(/\s+/g, "-").toLowerCase() || "";
      el.id = id; // 각 heading에 id 부여
      tocItems.push({id, text: el.textContent || "", level: Number(el.tagName[1])});
    });

    setHeadings(tocItems);
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({behavior: "smooth", block: "start"});
    }
  };

  return (
    <div
      className={`${styles.tocWrapper} ${isVisible ? styles.visible : ""}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className={styles.tocBox}>
        <div className={styles.tocHeader}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="#CCCCCC" strokeWidth="1.5"/>
            <circle cx="6" cy="8" r="1.5" fill="#CCCCCC"/>
            <circle cx="6" cy="12" r="1.5" fill="#CCCCCC"/>
            <circle cx="6" cy="16" r="1.5" fill="#CCCCCC"/>
            <line x1="9" y1="8" x2="18" y2="8" stroke="#CCCCCC" strokeWidth="1.5"/>
            <line x1="9" y1="12" x2="18" y2="12" stroke="#CCCCCC" strokeWidth="1.5"/>
            <line x1="9" y1="16" x2="18" y2="16" stroke="#CCCCCC" strokeWidth="1.5"/>
          </svg>
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
  );
}