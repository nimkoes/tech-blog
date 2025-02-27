"use client";

import { useEffect, useRef } from "react";
import styles from "./LogTerminal.module.scss";

const LogTerminal: React.FC<{ logs: string[] }> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement | null>(null); // 📌 스크롤 위치를 조절하기 위한 ref

  useEffect(() => {
    // 📌 logs가 변경될 때마다 실행 → 스크롤을 맨 아래로 이동
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]); // logs 배열이 변경될 때 실행

  return (
    <div className={styles.terminal}>
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))
      ) : (
        <p>열람한 문서 기록이 없습니다.</p>
      )}
      {/* 📌 이 div가 마지막 로그의 위치를 유지하도록 함 */}
      <div ref={logEndRef}></div>
    </div>
  );
};

export default LogTerminal;