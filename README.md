# Nimkoes Tech Blog

IntelliJ 스타일의 모던한 기술 블로그입니다. 마크다운으로 작성된 기술 문서를 웹에서 편리하게 볼 수 있도록 구현된 Next.js 기반의 정적 블로그 프로젝트입니다.

## 📚 프로젝트 개요

이 블로그는 개발자들이 익숙한 IDE 스타일의 인터페이스를 제공하여, 기술 문서를 보다 편안하게 읽을 수 있는 환경을 제공합니다. 특히 다크 테마와 코드 하이라이팅, 직관적인 네비게이션 등을 통해 개발자 친화적인 읽기 경험을 제공합니다.

### 동작 과정

#### 간단한 버전
```mermaid
sequenceDiagram
    actor User
    participant Client
    participant Server
    participant FileSystem

    User->>Client: 페이지 접근
    Client->>Server: 페이지 요청
    Server->>FileSystem: Markdown 파일 로드
    FileSystem-->>Server: 파일 내용 반환
    Server-->>Client: 렌더링된 컨텐츠
    Client-->>User: 페이지 표시
```

#### 상세 버전
```mermaid
sequenceDiagram
    actor User
    participant Client
    participant Router
    participant Store
    participant Server
    participant Parser
    participant FileSystem
    participant Cache

    User->>Client: 1. 페이지 접근
    
    note right of Client: 초기화 프로세스
    Client->>Router: 2. 라우트 분석
    Router->>Store: 3. 상태 초기화
    Store-->>Client: 4. 초기 상태 제공

    note right of Client: 문서 로드 프로세스
    Client->>Server: 5. 문서 요청
    Server->>FileSystem: 6. Markdown 파일 요청
    FileSystem-->>Server: 7. Raw 파일 반환
    Server->>Parser: 8. Frontmatter 파싱
    Parser->>Parser: 9. Markdown → HTML 변환
    Parser->>Parser: 10. 코드 하이라이팅
    Parser-->>Server: 11. 변환된 컨텐츠
    Server->>Cache: 12. 결과 캐싱

    note right of Client: UI 업데이트 프로세스
    Server-->>Client: 13. 렌더링 데이터 전송
    Client->>Store: 14. 상태 업데이트
    Store-->>Client: 15. UI 업데이트 트리거
    Client->>Client: 16. 목차 생성
    Client->>Store: 17. 열람 기록 저장

    Client-->>User: 18. 최종 페이지 표시
```

### 주요 기능
- 폴더 구조의 카테고리 탐색
- 문서 제목 검색 기능
- 문서 태그 검색 기능
- 열람 기록 저장
- 스크롤 이동 (목차 기반 이동, 최상단 이동)
- 반응형 디자인
- 이미지 팝업 뷰어
- 마크다운 렌더링
- 문서 목차 자동 생성

## 🛠 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- SCSS Modules
- font
    - JetBrains Mono (주 폰트)
    - Fira Code, Consolas, Menlo (대체 폰트)

### Markdown Processing
- Remark
- Rehype
- Gray Matter
- Highlight.js

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/nimkoes/tech-blog.git
cd tech-blog
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정합니다:
```env
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_KAKAO_ADFIT_ID=your-kakao-adfit-id
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=your-google-adsense-id
```

4. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

5. 빌드 및 프로덕션 실행
```bash
npm run build
npm run start
# 또는
yarn build
yarn start
```

### 문서 작성 방법

1. `public/resources` 디렉토리에 마크다운 파일을 생성합니다.
2. 파일 상단에 다음과 같은 frontmatter를 추가합니다:
```markdown
---
title: 문서 제목
description: 문서 설명
author: 작성자
date: YYYY-MM-DD
---
```

### 문서 구조 및 카테고리 관리

#### 파일 구조
```
public/resources/
├── images/          # 이미지 파일 저장
├── mermaid/         # Mermaid 다이어그램 이미지
└── *.md             # 마크다운 문서 파일
```

#### 카테고리 관리
- `src/resources/category.json` 파일에서 논리적 카테고리 구조를 정의합니다.
- 실제 파일은 평면적으로 저장되어 있지만, JSON 파일을 통해 계층적 구조를 구현합니다.
- 카테고리 구조 예시:
```json
{
  "id": "10",
  "displayName": "kubernetes",
  "children": [
    {
      "id": "10-1",
      "displayName": "[chap.01] Kubernetes 사용 이유",
      "fileName": "0002250303-kubernetes",
      "tags": ["Kubernetes", "Container Orchestration"]
    }
  ]
}
```

#### 파일 명명 규칙
- 파일명 형식: `{일련번호}{날짜}-{주제}.md`
- 예시: `0045250312-spring-security-document.md`
- 일련번호는 문서의 순서를 나타냅니다.
- 날짜는 YYMMDD 형식입니다.

#### 장점
- 단순한 파일 구조로 관리가 용이합니다.
- 카테고리 구조 변경 시 실제 파일을 이동할 필요가 없습니다.
- 파일 접근이 빠르고 효율적입니다.
- 태그 기반 검색이 용이합니다.

## 📱 반응형 디자인

- Desktop (1024px 이상)
- Tablet (768px ~ 1024px)
- Mobile (768px 미만)

각 디바이스 환경에 최적화된 UI/UX를 제공합니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🤝 기여하기

버그 리포트, 기능 제안, 풀 리퀘스트 등 모든 기여를 환영합니다. 

