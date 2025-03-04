"use client";

import styles from "./LogView.module.scss";
import LogContainer from "./LogContainer/LogContainer";
import Button from "../common/Button/Button";
import CloseIcon from "../common/icons/CloseIcon";
import useNavigationStore from "../../store/navigationStore";

interface LogViewProps {
  logs: string[];
}

const LogView = ({logs}: LogViewProps) => {
  const { isLogOpen, toggleLog } = useNavigationStore();

  if (!isLogOpen) return null;

  return (
    <div className={styles.logView}>
      <div className={styles.logHeader}>
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