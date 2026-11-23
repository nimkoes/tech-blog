'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import styles from './page.module.scss';

interface ShareButtonProps {
  title: string;
  /** basePath 를 뺀 글 경로(예: /post/0006-kubernetes/). 없으면 현재 페이지를 공유한다. */
  path?: string;
}

type Status = 'idle' | 'copied' | 'failed';

/** 터치 기기에서는 기기 공유 창(카카오톡 등), 그 밖에서는 링크 복사. */
export default function ShareButton({ title, path }: ShareButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (next: Status) => {
    setStatus(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), 1600);
  };

  const onClick = async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/tech-blog';
    const url = path
      ? `${window.location.origin}${basePath}${path}`
      : `${window.location.origin}${window.location.pathname}`;
    const useNativeShare =
      typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;

    if (useNativeShare) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // 사용자가 공유 창을 닫은 경우는 실패가 아니다.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      flash('copied');
    } catch {
      flash('failed');
    }
  };

  const label = status === 'copied' ? '링크 복사됨' : status === 'failed' ? '복사 실패' : '공유';

  return (
    <button type="button" className={styles.shareButton} onClick={onClick} aria-label={`${title} 공유하기`}>
      {status === 'copied' ? <Check size={14} aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
      <span aria-live="polite">{label}</span>
    </button>
  );
}
