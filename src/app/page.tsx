"use client";

import {useEffect, useRef, useState} from "react";
import categoryData from "@resources/category.json";
import styles from "./page.module.scss";

const HomePage = () => {

  const [selectedMd, setSelectedMd] = useState(""); // 선택한 Markdown 파일 경로 저장
  const [content, setContent] = useState<string>(""); // Markdown 내용 저장
  const [logs, setLogs] = useState<string[]>([]); // 로그 저장
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); // 카테고리 열림 여부
  const [isLogOpen, setIsLogOpen] = useState(true); // 로그 열림 여부
  const logEndRef = useRef<HTMLDivElement | null>(null); // 스크롤을 맨 아래로 내리기 위한 Ref

  // 선택한 파일을 가져와서 업데이트하는 함수
  useEffect(() => {
    if (!selectedMd) return;

    fetch(selectedMd)
      .then((res) => res.text())
      .then(setContent)
      .catch(() => setContent("⚠️ 파일을 불러올 수 없습니다."));
  }, [selectedMd]);

  // 로그가 추가될 때 스크롤을 맨 아래로 이동
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
          {/* 📂 카테고리 토글 버튼 */}
          <button className={styles.navButton} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
            📂
          </button>
          {/* 🖥 로그 토글 버튼 */}
          <button className={styles.navButton} onClick={() => setIsLogOpen(!isLogOpen)}>
            🖥
          </button>
        </div>
      </aside>

      <div className={styles.page}>
        <div className={styles.subPage}>

          {/* 카테고리 영역 */}
          <div className={`${styles.categoryView} ${isCategoryOpen ? styles.show : styles.hide}`}>
            <CategoryTree data={categoryData} depth={0} onFileSelect={handleFileSelect}/>
          </div>

          {/* 콘텐츠 영역 */}
          <div className={styles.contentsView}>
            {content ? <pre>{content}</pre> : <p>📄 Markdown 파일을 선택하세요.</p>}
          </div>
        </div>

        {/* 로그 영역 */}
        <div className={`${styles.logView} ${isLogOpen ? styles.show : styles.hide}`}>
          <div className={styles.logContainer}>
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            <div ref={logEndRef}/>
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
  onFileSelect: (mdPath: string, fileName: string) => void;
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
    <ul style={{paddingLeft: depth * 20 + "px"}}>
      {data.map((item) => (
        <li key={item.id}>
          {item.children ? (
            <span onClick={() => toggleFolder(item.id)} style={{cursor: "pointer"}}>
              {openFolders[item.id] ? "📂 " : "📁 "} {item.name}
            </span>
          ) : (
            <span onClick={() => onFileSelect(item.mdPath, item.name)} style={{cursor: "pointer"}}>
              📄 {item.name}
            </span>
          )}
          {item.children && openFolders[item.id] && (
            <CategoryTree data={item.children} depth={depth + 1} onFileSelect={onFileSelect}/>
          )}
        </li>
      ))}
    </ul>
  );
};

export default HomePage;
