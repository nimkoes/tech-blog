"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from '~/context/ThemeContext';

interface GiscusProps {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  strict: string;
  reactionsEnabled: string;
  emitMetadata: string;
  inputPosition: string;
  theme: string;
  lang: string;
  loading: string;
}

const Giscus: React.FC<GiscusProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); // ThemeContext에서 현재 테마를 가져옴
  const giscusTheme = theme === 'dark' ? 'dark_dimmed' : 'light';

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    Object.entries({
      'data-repo': props.repo,
      'data-repo-id': props.repoId,
      'data-category': props.category,
      'data-category-id': props.categoryId,
      'data-mapping': props.mapping,
      'data-strict': props.strict,
      'data-reactions-enabled': props.reactionsEnabled,
      'data-emit-metadata': props.emitMetadata,
      'data-input-position': props.inputPosition,
      'data-theme': giscusTheme, // 동적 테마 적용
      'data-lang': props.lang,
      'data-loading': props.loading,
    }).forEach(([key, value]) => script.setAttribute(key, value));

    ref.current.appendChild(script);
  }, [giscusTheme, props]);

  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme } } },
      'https://giscus.app'
    );
  }, [giscusTheme]);

  return <div ref={ref} className="giscus-container" />;
};

export default Giscus;
