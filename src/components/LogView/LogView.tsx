"use client";

import styles from "./LogView.module.scss";
import LogContainer from "./LogContainer/LogContainer";
import Button from "../common/Button/Button";
import CloseIcon from "../common/icons/CloseIcon";

interface LogViewProps {
  logs: string[];
  onClose: () => void;
}

const LogView = ({logs, onClose}: LogViewProps) => {
  return (
    <div className={styles.logView}>
      <div className={styles.logHeader}>
        <Button
          variant="icon"
          className={styles.closeButton}
          onClick={onClose}
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