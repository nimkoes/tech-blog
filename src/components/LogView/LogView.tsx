"use client";

import styles from "./LogView.module.scss";
import LogContainer from "./LogContainer/LogContainer";
import Button from "../common/Button/Button";
import CloseIcon from "../common/icons/CloseIcon";
import useNavigationStore from "../../store/navigationStore";

interface LogViewProps {
  logs: string[];
  onClearLogs: () => void;
}

const LogView = ({logs, onClearLogs}: LogViewProps) => {
  const { isLogOpen, toggleLog } = useNavigationStore();

  if (!isLogOpen) return null;

  return (
    <div className={styles.logView}>
      <div className={styles.logHeader}>
        <Button
          variant="icon"
          className={styles.clearButton}
          onClick={onClearLogs}
          aria-label="로그 기록 삭제"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path fill="#cccccc" d="M6 2V1h4v1h4v1H2V2h4zm1 3v8h2V5H7zM4 5v8h2V5H4zm6 0v8h2V5h-2zM3 4h10v10H3V4z"/>
          </svg>
        </Button>

        <Button
          variant="icon"
          className={styles.closeButton}
          onClick={toggleLog}
          aria-label="로그 창 닫기"
        >
          <CloseIcon />
        </Button>
      </div>

      <LogContainer logs={logs}/>
    </div>
  );
};

export default LogView;