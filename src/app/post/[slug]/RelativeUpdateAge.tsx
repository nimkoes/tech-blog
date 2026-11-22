'use client';

import { useEffect, useState } from 'react';
import { formatRelativeDate } from '~/utils/relativeDate';
import styles from './page.module.scss';

interface RelativeUpdateAgeProps {
  date: string;
}

export default function RelativeUpdateAge({ date }: RelativeUpdateAgeProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    const updateAtLocalMidnight = () => {
      const now = new Date();
      setLabel(formatRelativeDate(date, now));

      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1
      );
      timer = window.setTimeout(
        updateAtLocalMidnight,
        Math.max(1000, nextMidnight.getTime() - now.getTime())
      );
    };

    updateAtLocalMidnight();
    return () => window.clearTimeout(timer);
  }, [date]);

  if (!label) return null;

  return (
    <span className={styles.relativeUpdate} aria-label={`조회일 기준 ${label}`}>
      <span aria-hidden="true">·</span> {label}
    </span>
  );
}
