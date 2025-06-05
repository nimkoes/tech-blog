# Nimkoes Tech Blog

마크다운으로 작성된 기술 문서를 웹에서 편리하게 볼 수 있도록 구현된 Next.js 기반의 정적 블로그 프로젝트입니다.

## 기술 스택

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

## 시작하기

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

3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

4. 빌드 및 프로덕션 실행

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
      "tags": [
        "Kubernetes",
        "Container Orchestration"
      ]
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

## 반응형 디자인

- Desktop (1024px 이상)
- Mobile (768px 미만)

각 디바이스 환경에 최적화된 UI/UX를 제공합니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여하기

버그 리포트, 기능 제안, 풀 리퀘스트 등 모든 기여를 환영합니다. 

