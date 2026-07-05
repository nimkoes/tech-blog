export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-') // 공백·슬래시·& 등 URL에 부적합한 문자를 하이픈으로
    .replace(/^-+|-+$/g, '');
}
