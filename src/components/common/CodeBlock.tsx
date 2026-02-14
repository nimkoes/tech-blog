'use client';

import React, { useState } from 'react';
import styles from './CodeBlock.module.scss';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

interface LanguageInfo {
  key: string;
  label: string;
  extension?: string;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) return extractText(node.props.children);
  return '';
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  yml: 'yaml',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  csharp: 'cs',
  'c#': 'cs',
  cpp: 'c++',
  cxx: 'c++',
};

const LANGUAGE_INFO: Record<string, { label: string; extension: string }> = {
  bash: { label: 'Bash', extension: '.sh' },
  css: { label: 'CSS', extension: '.css' },
  go: { label: 'Go', extension: '.go' },
  html: { label: 'HTML', extension: '.html' },
  java: { label: 'Java', extension: '.java' },
  javascript: { label: 'JavaScript', extension: '.js' },
  json: { label: 'JSON', extension: '.json' },
  kotlin: { label: 'Kotlin', extension: '.kt' },
  markdown: { label: 'Markdown', extension: '.md' },
  md: { label: 'Markdown', extension: '.md' },
  python: { label: 'Python', extension: '.py' },
  rust: { label: 'Rust', extension: '.rs' },
  scss: { label: 'SCSS', extension: '.scss' },
  sql: { label: 'SQL', extension: '.sql' },
  swift: { label: 'Swift', extension: '.swift' },
  text: { label: 'Plain Text', extension: '.txt' },
  typescript: { label: 'TypeScript', extension: '.ts' },
  xml: { label: 'XML', extension: '.xml' },
  yaml: { label: 'YAML', extension: '.yaml' },
  'c++': { label: 'C++', extension: '.cpp' },
  c: { label: 'C', extension: '.c' },
  cs: { label: 'C#', extension: '.cs' },
};

const toTitleCase = (value: string) =>
  value
    .split(/[-_]/g)
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');

const parseLanguageKey = (className?: string) => {
  if (!className) return 'text';

  const langMatch = className.match(/language-([a-z0-9#+.-]+)/i);
  if (langMatch?.[1]) {
    return langMatch[1].toLowerCase();
  }

  const hljsMatch = className.match(/\bhljs\s+([a-z0-9#+.-]+)/i);
  if (hljsMatch?.[1]) {
    return hljsMatch[1].toLowerCase();
  }

  const firstToken = className
    .split(/\s+/)
    .map(token => token.trim())
    .find(token => token && token.toLowerCase() !== 'hljs');

  if (firstToken && /^[a-z0-9#+.-]+$/i.test(firstToken)) {
    return firstToken.toLowerCase();
  }

  return 'text';
};

const getLanguageInfo = (className?: string): LanguageInfo => {
  const rawKey = parseLanguageKey(className);
  const primaryKey = rawKey.replace(/^\./, '').split('.')[0];
  const normalizedKey = LANGUAGE_ALIASES[primaryKey] || primaryKey;
  const info = LANGUAGE_INFO[normalizedKey];

  if (info) {
    return {
      key: normalizedKey,
      label: info.label,
      extension: info.extension,
    };
  }

  return {
    key: normalizedKey,
    label: toTitleCase(normalizedKey),
  };
};

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children }) => {
  const [copied, setCopied] = useState(false);
  const language = getLanguageInfo(className);
  const lowerLabel = language.label.toLowerCase();
  const lowerExt = language.extension?.toLowerCase();
  const shouldShowExtension = Boolean(
    lowerExt &&
      !lowerLabel.includes(lowerExt) &&
      !lowerLabel.endsWith(lowerExt.replace(/^\./, ''))
  );

  const handleCopy = async () => {
    const text = extractText(children);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={styles['custom-codeblock-root']}>
      <div className={styles['custom-codeblock-header']}>
        <span className={styles['custom-codeblock-lang']}>
          {language.label}
          {shouldShowExtension && language.extension && <em>{language.extension}</em>}
        </span>
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
