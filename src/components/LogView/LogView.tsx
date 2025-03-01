"use client";

import styles from "./LogView.module.scss";
import LogContainer from "./LogContainer/LogContainer";

interface LogViewProps {
  logs: string[];
  onClose: () => void;
}

const LogView = ({logs, onClose}: LogViewProps) => {
  return (
    <div className={styles.logView}>
      <div className={styles.logHeader}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
          </svg>
        </button>
      </div>

      <LogContainer logs={logs}/>
    </div>
  );
};

export default LogView;