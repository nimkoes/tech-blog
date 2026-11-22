import { describe, expect, it } from 'vitest';
import { formatRelativeDate } from '~/utils/relativeDate';

describe('formatRelativeDate', () => {
  const now = new Date(2026, 10, 22, 15, 30);

  it('오늘과 어제를 자연어로 표시한다', () => {
    expect(formatRelativeDate('2026-11-22', now)).toBe('오늘');
    expect(formatRelativeDate('2026-11-21', now)).toBe('어제');
  });

  it('이틀 이상 지난 날짜는 일수로 표시한다', () => {
    expect(formatRelativeDate('2026-11-10', now)).toBe('12일 전');
  });

  it('미래 또는 잘못된 날짜는 표시하지 않는다', () => {
    expect(formatRelativeDate('2026-11-23', now)).toBeNull();
    expect(formatRelativeDate('2026-02-30', now)).toBeNull();
    expect(formatRelativeDate('not-a-date', now)).toBeNull();
  });
});
