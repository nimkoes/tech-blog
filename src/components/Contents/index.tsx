"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
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
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={styles.inlineCode} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <p>선택된 문서가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Contents;