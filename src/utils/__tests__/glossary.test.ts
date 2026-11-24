import { describe, expect, it } from 'vitest';
import { extractGlossary, findGlossaryMatches } from '~/utils/glossary';

describe('extractGlossary', () => {
  it('목록형 용어 정의를 읽는다', () => {
    const markdown = [
      '# 본문',
      '모델은 입력을 처리한다.',
      '# 용어 정의',
      '- **모델(model)**: 입력을 받아 출력을 계산하는 구조다.',
      '- **추론**: 학습한 모델로 결과를 계산하는 과정이다.',
    ].join('\n\n');

    expect(extractGlossary(markdown)).toEqual([
      {
        term: '모델(model)',
        aliases: ['모델(model)', 'model', '모델'],
        definition: '입력을 받아 출력을 계산하는 구조다.',
      },
      {
        term: '추론',
        aliases: ['추론'],
        definition: '학습한 모델로 결과를 계산하는 과정이다.',
      },
    ]);
  });

  it('제목형 용어 정의를 읽는다', () => {
    const markdown = [
      '# 본문',
      'DNS가 이름을 변환한다.',
      '# 용어 정의',
      '## DNS (Domain Name System)',
      '도메인 이름을 IP 주소로 변환한다.',
      '## IP 주소',
      '네트워크에서 기기를 식별하는 주소다.',
    ].join('\n\n');

    expect(extractGlossary(markdown)).toEqual([
      {
        term: 'DNS (Domain Name System)',
        aliases: ['DNS (Domain Name System)', 'Domain Name System', 'DNS'],
        definition: '도메인 이름을 IP 주소로 변환한다.',
      },
      {
        term: 'IP 주소',
        aliases: ['IP 주소'],
        definition: '네트워크에서 기기를 식별하는 주소다.',
      },
    ]);
  });
});

describe('findGlossaryMatches', () => {
  const entries = extractGlossary([
    '# 용어 정의',
    '- **모델**: 입력을 받아 출력을 계산하는 구조다.',
    '- **API**: 프로그램 사이의 호출 규칙이다.',
    '- **AI**: 컴퓨터가 판단하도록 만드는 기술이다.',
  ].join('\n\n'));

  it('한글 조사와 붙은 용어를 찾는다', () => {
    expect(findGlossaryMatches('모델은 API를 사용한다.', entries).map(match => match.text))
      .toEqual(['모델', 'API']);
  });

  it('다른 단어의 일부인 문자열은 제외한다', () => {
    expect(findGlossaryMatches('모델링과 OpenAI를 비교한다.', entries)).toEqual([]);
  });
});
