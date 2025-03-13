"use client";

import {useEffect, useRef} from "react";
import Link from "next/link";
import styles from "./LogContainer.module.scss";
import categoryData from "@resources/category.json";

interface LogContainerProps {
  logs: string[];
}

interface CategoryItem {
  id: string;
  displayName: string;
  fileName?: string;
  children?: CategoryItem[];
}

const LogContainer = ({logs}: LogContainerProps) => {
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [logs]);

  // 로그 메시지에서 displayName 추출
  const extractDisplayName = (log: string): string | null => {
    const match = log.match(/- (.+)$/);
    return match ? match[1] : null;
  };

  // displayName으로 fileName 찾기
  const findFileNameByDisplayName = (displayName: string, items: CategoryItem[]): string | null => {
    for (const item of items) {
      if (item.displayName === displayName) {
        return item.fileName || null;
      }
      if (item.children) {
        const found = findFileNameByDisplayName(displayName, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className={styles.logContainer}>
      {logs.map((log, index) => {
        const displayName = extractDisplayName(log);
        const timestamp = log.split(" - ")[0];
        const fileName = displayName ? findFileNameByDisplayName(displayName, categoryData) : null;

        return (
          <div key={index} className={styles.logItem}>
            <span className={styles.timestamp}>{timestamp}</span>
            {" - "}
            {displayName && fileName ? (
              <Link 
                href={`/post/${fileName}`}
                className={styles.fileLink}
              >
                {displayName}
              </Link>
            ) : (
              log
            )}
          </div>
        );
      })}
      <div ref={logEndRef}/>
    </div>
  );
};

export default LogContainer;