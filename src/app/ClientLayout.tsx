"use client";

import "~/styles/index.scss";
import styles from "./layout.module.scss";
import NavigationView from "~/components/NavigationView/NavigationView";
import CategoryView from "~/components/CategoryView/CategoryView";
import LogView from "~/components/LogView/LogView";
import ImagePopup from "~/components/ImagePopup/ImagePopup";
import TagModal from "~/components/TagModal/TagModal";
import { useState, useEffect } from "react";
import useNavigationStore from "~/store/navigationStore";
import categoryData from '../resources/category.json';
import { useLogStore } from "~/store/logStore";

const STORAGE_KEY = 'nktbsdb';
const MAX_LOGS = 30;

interface Document {
  title: string;
  tags: string[];
  fileName: string;
}

function extractDocuments(categories: any[]): Document[] {
  let documents: Document[] = [];

  categories.forEach(category => {
    if (category.children) {
      category.children.forEach((child: any) => {
        if (child.fileName) {
          documents.push({
            title: child.displayName,
            tags: child.tags || [],
            fileName: child.fileName,
          });
        }
        if (child.children) {
          documents = documents.concat(extractDocuments([child]));
        }
      });
    }
  });

  return documents;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { logs, addLog, clearLogs, setLogs } = useLogStore();
  const { isLogOpen, isTagModalOpen, toggleTagModal } = useNavigationStore();
  const [logViewHeight, setLogViewHeight] = useState(250);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // 문서와 태그 정보 로드
  useEffect(() => {
    const docs = extractDocuments(categoryData);
    setDocuments(docs);
    
    // 모든 태그 추출 및 중복 제거
    const tags = new Set<string>();
    docs.forEach(doc => {
      doc.tags?.forEach(tag => tags.add(tag));
    });
    const allTagsArray = Array.from(tags);
    setAllTags(allTagsArray);
  }, []);

  // LocalStorage에서 로그 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLogs = localStorage.getItem(STORAGE_KEY);
      if (savedLogs) {
        try {
          const parsedLogs = JSON.parse(savedLogs);
          clearLogs();
          setLogs(parsedLogs.slice(-MAX_LOGS));
        } catch (e) {
          console.error('Failed to parse saved logs:', e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [clearLogs, setLogs]);

  // 로그가 변경될 때마다 LocalStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && logs.length > 0) {
      const logsToStore = logs.slice(-MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToStore));
    }
  }, [logs]);

  useEffect(() => {
    const updateLogViewHeight = () => {
      const width = window.innerWidth;
      let height = 250;

      if (width <= 768) {
        height = 0;
      } else if (width <= 1024) {
        height = 200;
      }

      setLogViewHeight(height);
    };

    updateLogViewHeight();
    window.addEventListener('resize', updateLogViewHeight);

    return () => {
      window.removeEventListener('resize', updateLogViewHeight);
    };
  }, []);

  const handleFileSelect = (fileName: string) => {
    const timestamp = new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    addLog(`${timestamp} - ${fileName}`);
  };

  const handleClearLogs = () => {
    clearLogs();
  };

  return (
    <>
      <div className={styles.home}>
        <NavigationView />
        <div className={styles.page} style={{ height: isLogOpen ? `calc(100vh - ${logViewHeight}px)` : "100vh" }}>
          <div className={styles.subPage}>
            <CategoryView onFileSelect={handleFileSelect} />
            <div className={`${styles.contentsView} contentsView`}>{children}</div>
          </div>
          <LogView logs={logs} onClearLogs={handleClearLogs} />
        </div>
        <ImagePopup />
        <TagModal
          isOpen={isTagModalOpen}
          onClose={toggleTagModal}
          documents={documents}
          currentTags={[]}
          allTags={allTags}
          onLogMessage={handleFileSelect}
        />
      </div>
    </>
  );
} 