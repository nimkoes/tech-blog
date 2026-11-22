const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function parseDateOnly(date: string): [number, number, number] | null {
  const matched = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return null;

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return [year, month, day];
}

export function formatRelativeDate(date: string, now: Date): string | null {
  const parsed = parseDateOnly(date);
  if (!parsed || Number.isNaN(now.getTime())) return null;

  const [year, month, day] = parsed;
  const targetDay = Date.UTC(year, month - 1, day);
  const currentDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const elapsedDays = Math.round((currentDay - targetDay) / DAY_IN_MILLISECONDS);

  if (elapsedDays < 0) return null;
  if (elapsedDays === 0) return '오늘';
  if (elapsedDays === 1) return '어제';
  return `${elapsedDays}일 전`;
}
