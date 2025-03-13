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

  // displayName으로 카테고리 경로와 fileName 찾기
  const findCategoryPathAndFileName = (
    displayName: string, 
    items: CategoryItem[], 
    parentPath: string[] = []
  ): { path: string[], fileName: string | null } | null => {
    for (const item of items) {
      const currentPath = [...parentPath, item.displayName];
      
      if (item.displayName === displayName) {
        return { 
          path: currentPath,
          fileName: item.fileName || null 
        };
      }
      
      if (item.children) {
        const found = findCategoryPathAndFileName(displayName, item.children, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  // 카테고리 경로를 Spring Boot 스타일로 변환
  const formatServerLogStyle = (path: string[]): string => {
    // 마지막 항목(파일명)을 제외한 경로를 처리
    const packagePath = path.slice(0, -1)
      .map(segment => segment.charAt(0).toLowerCase())
      .join('.');

    // 마지막 항목은 그대로 사용
    const fileName = path[path.length - 1];

    return packagePath ? `${packagePath}.${fileName}` : fileName;
  };

  return (
    <div className={styles.logContainer}>
      {logs.map((log, index) => {
        const displayName = extractDisplayName(log);
        const timestamp = log.split(" - ")[0];
        const categoryInfo = displayName ? findCategoryPathAndFileName(displayName, categoryData) : null;
        
        const formattedName = categoryInfo 
          ? formatServerLogStyle(categoryInfo.path)
          : displayName;

        return (
          <div key={index} className={styles.logItem}>
            <span className={styles.timestamp}>{timestamp}</span>
            {" - "}
            {displayName && categoryInfo?.fileName ? (
              <Link 
                href={`/post/${categoryInfo.fileName}`}
                className={styles.fileLink}
              >
                {formattedName}
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