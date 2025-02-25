"use client";

import styles from "./LogTerminal.module.scss";

const LogTerminal: React.FC<{ logs: string[] }> = ({ logs }) => {
  return (
    <div className={styles.terminal}>
      {logs.length > 0 ? (
        logs.map((log, index) => <div key={index}>{log}</div>)
      ) : (
        <p>열람한 문서 기록이 없습니다.</p>
      )}
    </div>
  );
};

export default LogTerminal;