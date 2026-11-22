# Nimkoes Tech Blog

개발 지식과 문제 해결 과정을 마크다운으로 기록하는 정적 기술 블로그입니다.

## 주요 기능

- 제목, 설명, 본문, 소제목을 대상으로 하는 전체 검색
- 태그 탐색과 주요 토픽 분류
- 글별 목차, 시리즈 이동, 이전·다음 글 이동
- 읽기 시간, 작성일, 수정일, 콘텐츠 검수 상태 표시
- 다크 모드와 반응형 화면
- 글별 Open Graph 이미지, sitemap, RSS, JSON-LD 생성
- 키보드 탐색, 본문 바로가기, 모달 포커스 제어

## 기술 구성

- Next.js 16 App Router, React 19, TypeScript
- SCSS Modules
- React Markdown, Remark GFM, Rehype
- Highlight.js
- Vitest
- GitHub Pages 정적 배포

## 로컬 실행

Node.js 22 이상을 권장합니다.

```bash
npm install
npm run dev
```

운영 결과물을 확인하려면 다음 명령을 사용합니다.

```bash
npm run build
npm run start
```

정적 결과물은 `out` 디렉터리에 생성됩니다.

## 콘텐츠 관리

- 원본 글과 이미지는 `public/resources`에 둡니다.
- 분류 정보는 `src/resources/category.json`에서 관리합니다.
- 검색 색인, 이미지 크기 정보, 글별 OG 이미지는 빌드 전에 자동 생성됩니다.
- 자세한 작성·검수 기준은 [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)를 참고합니다.

글의 frontmatter 예시는 다음과 같습니다.

```yaml
---
title: 글 제목
description: 글의 핵심을 설명하는 문장
publishedAt: 2026-11-22
updatedAt: 2026-11-22
tags:
  - Kubernetes
status: published
reviewedAt: 2026-11-22
sources:
  - https://kubernetes.io/docs/example
---
```

## 품질 확인

```bash
npm run lint
npm test
npm run check:content
npm run build
npm run check:seo
```

전체 검증은 `npm run check`로 실행할 수 있습니다.

## 주요 디렉터리

```text
public/resources/       마크다운 원본과 본문 이미지
public/og/              자동 생성한 글별 공유 이미지
scripts/                색인 생성과 품질 검증 스크립트
src/app/                페이지와 화면 컴포넌트
src/components/         공통 UI 컴포넌트
src/resources/          카테고리와 생성된 콘텐츠 메타데이터
src/styles/             전역 스타일과 디자인 변수
```

## 배포

`main` 브랜치에 반영되면 GitHub Actions가 빌드와 검증을 수행한 뒤 GitHub Pages에 배포합니다.

기본 공개 주소는 `https://nimkoes.github.io/tech-blog`입니다.
