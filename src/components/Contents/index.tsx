"use client";

import { useEffect, useState } from "react";
import styles from "./Contents.module.scss";

const Contents: React.FC<{ mdPath: string }> = ({ mdPath }) => {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (mdPath) {
      fetch(mdPath)
        .then((res) => res.text())
        .then(setContent)
        .catch(() => setContent("파일을 불러오는 데 실패했습니다."));
    } else {
      setContent("");
    }
  }, [mdPath]);

  return (
    <div className={styles.activity}>
      <h2>CONTENTS</h2>
      <div className={styles.contentWrapper}>
        {content ? <pre className={styles.mdContent}>{content}</pre> : <p>선택된 문서가 없습니다.</p>}
      </div>
    </div>
  );
};

export default Contents;