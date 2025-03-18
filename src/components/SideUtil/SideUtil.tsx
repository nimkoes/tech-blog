import { useState } from "react";
import TableOfContents from "@/components/SideUtil/TableOfContents/TableOfContents";
import GoToHome from "@/components/SideUtil/GoToHome/GoToHome";
import ScrollToTop from "@/components/SideUtil/ScrollToTop/ScrollToTop";
import styles from "./SideUtil.module.scss";

export default function SideUtil() {
  const [isTocVisible, setIsTocVisible] = useState(false);

  const toggleTocVisibility = () => {
    setIsTocVisible(!isTocVisible);
  };

  return (
    <div className={styles.sideUtil}>
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
      {isTocVisible && <TableOfContents />}
      <GoToHome />
      <ScrollToTop />
    </div>
  );
} 