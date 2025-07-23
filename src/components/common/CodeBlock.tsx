import React, { useState } from 'react';
import styles from './CodeBlock.module.scss';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) return extractText(node.props.children);
  return '';
}

const getLanguage = (className?: string) => {
  if (!className) return '';
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : '';
};

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children }) => {
  const [copied, setCopied] = useState(false);
  const language = getLanguage(className);

  const handleCopy = async () => {
    const text = extractText(children);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={styles['custom-codeblock-root']}>
      <div className={styles['custom-codeblock-header']}>
        <span className={styles['custom-codeblock-lang']}>{language || 'Code'}</span>
        <button className={styles['custom-codeblock-copy']} onClick={handleCopy} type="button">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock; 