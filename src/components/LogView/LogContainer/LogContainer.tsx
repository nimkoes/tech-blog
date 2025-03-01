"use client";

import {useEffect, useRef} from "react";
import styles from "./LogContainer.module.scss";

interface LogContainerProps {
  logs: string[];
}

const LogContainer = ({logs}: LogContainerProps) => {
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [logs]);

  return (
    <div className={styles.logContainer}>
      {logs.map((log, index) => (
        <div key={index} className={styles.logItem}>
          {log}
        </div>
      ))}
      <div ref={logEndRef}/>
    </div>
  );
};

export default LogContainer;