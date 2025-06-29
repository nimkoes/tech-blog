# Tech Blog V2 리뉴얼 계획

## 1. 목적
- UI/UX에 친화적인 기술 블로그로 리뉴얼
- 불필요한 기능 제거 및 핵심 기능 강화
- 사용자 경험 최적화

## 2. 핵심 기능
### 2.1 필수 기능
- MDX 문서 렌더링 (본문)
- 카테고리 네비게이션 (글 찾기)
- 검색 기능 (태그 + 텍스트)
- 다크모드 (가독성)
- 코드 하이라이팅 (기술 블로그 필수)

### 2.2 제거할 기능
- 복잡한 로그 시스템
- 과도한 사이드바 요소들
- 복잡한 네비게이션 구조
- 불필요한 이미지 팝업


## 3. 주요 변경사항

### 3.1 헤더
- 로고
- 다크모드 토글
- 카테고리 메뉴
- 불필요한 요소 제거로 심플화

### 3.2 검색 사이드바
- 태그 기반 검색
- 텍스트 기반 검색
- 검색 결과 실시간 표시
- 플로팅 형태로 구현

### 3.3 본문 영역
- MDX 렌더링 유지
- 코드 하이라이팅
- 가독성 최적화
- 여백과 타이포그래피 개선

### 3.4 푸터
- 카테고리 링크
- 태그 링크
- 저작권 정보
- 간단한 링크 모음

## 4. 반응형 디자인
### 4.1 데스크톱
- 헤더 고정
- 플로팅 검색 사이드바
- 넓은 본문 영역

### 4.2 태블릿
- 헤더 고정
- 검색 사이드바 하단 고정
- 본문 영역 최적화

### 4.3 모바일
- 심플한 헤더
- 검색 사이드바 드로어 형태
- 본문 영역 전체 폭 사용

## 5. SEO 최적화
- 시맨틱 HTML 구조
- 메타 태그 최적화
- 내부 링크 구조
- 사이트맵
- 구조화된 데이터 (Schema.org)

## 6. 광고 배치
- 본문 상단/하단
- 검색 사이드바 내
- 자연스러운 배치로 가독성 해치지 않기

## 7. 구현 우선순위
1. 기본 레이아웃 구조 구현
2. 검색 기능 구현
3. 다크모드 구현
4. 반응형 디자인 적용
5. SEO 최적화
6. 광고 배치
7. 성능 최적화

## 8. 기술 스택
- Next.js
- TypeScript
- SCSS
- MDX
- Zustand (상태 관리)

## 9. 성능 목표
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse 점수 90+ (모바일/데스크톱) 