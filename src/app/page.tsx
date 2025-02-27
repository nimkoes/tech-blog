"use client";

import {useEffect, useRef, useState} from "react";
import categoryData from "@resources/category.json";
import styles from "./page.module.scss";

const HomePage = () => {

  const [selectedMd, setSelectedMd] = useState(""); // 선택한 Markdown 파일 경로 저장
  const [content, setContent] = useState<string>(""); // Markdown 내용 저장
  const [logs, setLogs] = useState<string[]>([]); // 로그 저장
  const logEndRef = useRef<HTMLDivElement | null>(null); // 스크롤을 맨 아래로 내리기 위한 Ref

  // 선택한 파일을 가져와서 업데이트하는 함수
  useEffect(() => {
    if (!selectedMd) return; // 선택된 파일이 없으면 fetch 실행 안 함

    fetch(selectedMd)
      .then((res) => res.text())
      .then(setContent)
      .catch(() => setContent("⚠️ 파일을 불러올 수 없습니다."));
  }, [selectedMd]); // `selectedMd`가 변경될 때마다 실행됨

  // 로그가 추가될 때 스크롤을 맨 아래로 이동하는 함수
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({behavior: "smooth"});
    }
  }, [logs]);

  // 파일 선택 시 실행되는 함수 (파일명과 시간 로그 출력)
  const handleFileSelect = (mdPath: string, fileName: string) => {
    setSelectedMd(mdPath);

    const timestamp = new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 로그 추가
    setLogs((prevLogs) => [...prevLogs, `${timestamp} : ${fileName}`]);
  };

  return (
    <main className={styles.home}>

      {/* 네비게이션 영역 */}
      <aside className={styles.navigationView}>
        <div className={styles.navigation}>
          <button className={styles.navButton}>📂</button>
          <button className={styles.navButton}>🖥</button>
        </div>
      </aside>

      <div className={styles.page}>
        <div className={styles.subPage}>

          {/* 카테고리 영역 */}
          <div className={styles.categoryView}>
            <CategoryTree data={categoryData} depth={0} onFileSelect={handleFileSelect}/>
          </div>

          {/* 콘텐츠 영역 (Markdown 내용 출력) */}
          <div className={styles.contentsView}>
            {content ? <pre>{content}</pre> : <p>📄 Markdown 파일을 선택하세요.</p>}
          </div>
        </div>

        {/* 로그 영역 */}
        <div className={styles.logView}>
          <div className={styles.logContainer}>
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            <div ref={logEndRef}/>
            {/* 로그가 추가될 때마다 스크롤을 맨 아래로 이동 */}
          </div>
        </div>
      </div>
    </main>
  );
};

// ✅ 폴더 & 파일을 depth(계층)에 따라 들여쓰기하며 표시하는 컴포넌트
const CategoryTree: React.FC<{
  data: any[];
  depth: number;
  onFileSelect: (mdPath: string, fileName: string) => void
}> = ({data, depth, onFileSelect}) => {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});

  // 📂 폴더 클릭 시 하위 항목 표시/숨김 전환
  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ul style={{paddingLeft: depth * 20 + "px"}}> {/* 들여쓰기 적용 */}
      {data.map((item) => (
        <li key={item.id}>
          {/* 폴더 아이콘과 파일 아이콘 구분 */}
          {item.children ? (
            <span onClick={() => toggleFolder(item.id)} style={{cursor: "pointer"}}>
              {openFolders[item.id] ? "📂 " : "📁 "} {item.name}
            </span>
          ) : (
            <span onClick={() => onFileSelect(item.mdPath, item.name)} style={{cursor: "pointer"}}>
              📄 {item.name}
            </span>
          )}

          {/* 하위 폴더 및 파일이 있을 경우 재귀 호출 */}
          {item.children && openFolders[item.id] && (
            <CategoryTree data={item.children} depth={depth + 1} onFileSelect={onFileSelect}/>
          )}
        </li>
      ))}
    </ul>
  );
};

export default HomePage;
