import { describe, expect, it } from 'vitest';
import { generateTOC } from '~/utils/generateTOC';

describe('generateTOC', () => {
  it('h2와 h3만 목차에 포함한다', () => {
    const markdown = '# h1\n## h2 제목\n### h3 제목\n#### h4 제목';
    const { toc } = generateTOC(markdown);

    expect(toc).toHaveLength(2);
    expect(toc[0]).toMatchObject({ level: 2, text: 'h2 제목' });
    expect(toc[1]).toMatchObject({ level: 3, text: 'h3 제목' });
  });

  it('같은 텍스트의 헤딩이 반복되면 각각 고유 id를 부여한다', () => {
    const markdown = '## Section\n본문\n## Section';
    const { toc, idMap } = generateTOC(markdown);

    expect(toc).toHaveLength(2);
    expect(toc[0].id).not.toBe(toc[1].id);
    expect(idMap['2_Section__1']).toBe(toc[0].id);
    expect(idMap['2_Section__2']).toBe(toc[1].id);
  });

  it('인라인 코드와 강조를 포함한 헤딩의 텍스트를 이어붙인다', () => {
    const markdown = '## `useEffect` 와 **의존성** 배열';
    const { toc } = generateTOC(markdown);

    expect(toc[0].text).toBe('useEffect 와 의존성 배열');
  });

  it('빈 문서는 빈 목차를 반환한다', () => {
    const { toc, idMap } = generateTOC('본문만 있는 문서');

    expect(toc).toEqual([]);
    expect(idMap).toEqual({});
  });
});
