import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateTOC } from '~/utils/generateTOC';

describe('generateTOC', () => {
  it('원문 h1과 h2를 상위·하위 목차로 포함한다', () => {
    const markdown = '# h1\n## h2 제목\n### h3 제목\n#### h4 제목';
    const { toc, idMap } = generateTOC(markdown);

    expect(toc).toHaveLength(2);
    expect(toc[0]).toMatchObject({ level: 2, text: 'h1' });
    expect(toc[1]).toMatchObject({ level: 3, text: 'h2 제목' });
    expect(idMap['3_h3 제목__1']).toBeUndefined();
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
    const { toc, idMap, definitionHeadingMap } = generateTOC('본문만 있는 문서');

    expect(toc).toEqual([]);
    expect(idMap).toEqual({});
    expect(definitionHeadingMap).toEqual({});
  });

  it('용어 구역 제목만 목차에 포함하고 개별 정의어는 제외한다', () => {
    const markdown = [
      '## 처리 과정',
      '### DNS 질의',
      '## 관련 기술 용어',
      '### DNS (Domain Name System)',
      '도메인 이름을 IP 주소로 변환한다.',
      '### IP 주소',
      '기기를 식별하는 주소다.',
      '## 참고 자료',
    ].join('\n\n');
    const { toc, idMap, definitionHeadingMap } = generateTOC(markdown);

    expect(toc.map(item => item.text)).toEqual(['처리 과정', '관련 기술 용어', '참고 자료']);
    expect(idMap['2_관련 기술 용어__1']).toBeDefined();
    expect(idMap['3_DNS (Domain Name System)__1']).toBeUndefined();
    expect(definitionHeadingMap['2_관련 기술 용어__1']).toBeUndefined();
    expect(definitionHeadingMap['3_DNS (Domain Name System)__1']).toBe(true);
    expect(definitionHeadingMap['3_IP 주소__1']).toBe(true);
  });

  it('역할을 나열하는 구역의 항목도 정의어로 처리한다', () => {
    const markdown = '## 네트워크 장비별 역할\n\n### 라우터\n\n패킷을 전달한다.';
    const { toc, definitionHeadingMap } = generateTOC(markdown);

    expect(toc.map(item => item.text)).toEqual(['네트워크 장비별 역할']);
    expect(definitionHeadingMap['2_네트워크 장비별 역할__1']).toBeUndefined();
    expect(definitionHeadingMap['3_라우터__1']).toBe(true);
  });

  it('h1 용어 정의 아래의 h2 용어는 목차와 제목에서 제외한다', () => {
    const markdown = [
      '# 정리',
      '본문',
      '# 용어 정의',
      '## 데이터베이스 스키마 (Database Schema)',
      '데이터베이스 구조를 정의한다.',
      '## 오브젝트 마더 (Object Mother)',
      '테스트 객체를 생성한다.',
    ].join('\n\n');
    const { toc, idMap, definitionHeadingMap } = generateTOC(markdown);

    expect(toc.map(item => item.text)).toEqual(['정리', '용어 정의']);
    expect(idMap['1_용어 정의__1']).toBeDefined();
    expect(idMap['2_데이터베이스 스키마 (Database Schema)__1']).toBeUndefined();
    expect(definitionHeadingMap['2_데이터베이스 스키마 (Database Schema)__1']).toBe(true);
    expect(definitionHeadingMap['2_오브젝트 마더 (Object Mother)__1']).toBe(true);
  });

  it('모든 포스트의 용어 구역 하위 제목을 정의 라벨로 처리한다', () => {
    const resourcesDir = path.join(process.cwd(), 'public/resources');
    const markdownFiles = fs.readdirSync(resourcesDir).filter(file => file.endsWith('.md'));
    let checkedDefinitionCount = 0;

    for (const file of markdownFiles) {
      const markdown = fs.readFileSync(path.join(resourcesDir, file), 'utf8');
      const { idMap, definitionHeadingMap } = generateTOC(markdown);
      const definitionKeys = Object.keys(definitionHeadingMap);
      const navigationKeys = Object.keys(idMap);
      let definitionSectionLevel: number | null = null;
      const seenByKey: Record<string, number> = {};

      for (const line of markdown.split(/\r?\n/)) {
        const heading = /^(#{1,6})\s+(.+)$/.exec(line);
        if (!heading) continue;

        const level = heading[1].length;
        const text = heading[2]
          .replace(/[*_`]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/^[`"'“”‘’]+|[`"'“”‘’]+$/g, '')
          .trim();
        const baseKey = `${level}_${text}`;
        const occurrence = (seenByKey[baseKey] || 0) + 1;
        seenByKey[baseKey] = occurrence;
        const headingKey = `${baseKey}__${occurrence}`;

        if (definitionSectionLevel !== null && level <= definitionSectionLevel) {
          definitionSectionLevel = null;
        }

        if (text.includes('용어')) {
          definitionSectionLevel = level;
          continue;
        }

        if (definitionSectionLevel === null || level <= definitionSectionLevel) continue;

        expect(definitionKeys.includes(headingKey), `${file}: ${text}`).toBe(true);
        expect(navigationKeys.includes(headingKey), `${file}: ${text}`).toBe(false);
        checkedDefinitionCount += 1;
      }
    }

    expect(checkedDefinitionCount).toBeGreaterThan(100);
  });
});
