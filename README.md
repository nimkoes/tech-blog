# Nimkoes Tech Blog

프로그래밍/개발 지식과 경험을 마크다운으로 기록하고, 웹에서 편리하게 열람할 수 있도록 만든 **Next.js 기반의 정적 기술 블로그**입니다.

---

## 주요 특징

- **JetBrains Mono 기반의 일관된 프로그래밍 친화 폰트 시스템**
- **폰트 크기, 줄간격, 문단 너비 등 타이포그래피 변수 집중 관리**
- **마크다운 기반 문서 관리 및 자동 렌더링**
- **카테고리/태그 기반 분류 및 검색**
- **반응형 디자인(PC/모바일 최적화)**
- **SEO, sitemap, robots.txt 자동화**
- **GitHub Actions 기반 자동 배포**

---

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, SCSS Modules
- **타이포그래피**: JetBrains Mono (기본), Fira Code, Consolas, Menlo (대체)
- **Markdown**: Remark, Rehype, Gray Matter, Highlight.js
- **상태관리**: Zustand
- **SEO/Sitemap**: next-sitemap, 메타 태그 자동화

---

## 폰트/타이포그래피/문단 시스템

### 폰트 시스템
- JetBrains Mono를 기본 폰트로 사용하여 l/I/1/0/O 등 혼동되는 글자도 명확하게 구분됩니다.
- `src/styles/variables/_typography.scss`에서 폰트 패밀리, 크기, 줄간격 등 모든 타이포그래피 변수를 집중 관리합니다.
- 코드, 마크다운, 본문, UI 등 모든 텍스트가 동일한 폰트 시스템을 사용합니다.

### 폰트 크기/줄간격 시스템
- 폰트 크기(`--body-base`, `--heading-1` 등)와 줄간격(`--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`)을 의미 있는 변수로 관리합니다.
- 모바일/반응형에서도 변수 기반으로 자동 대응합니다.
- 하드코딩된 값 없이, 변수만 수정하면 전체 UI에 반영됩니다.

### 본문(문단) 너비 최적화
- PC에서는 본문/마크다운/상세 영역의 최대 너비를 **850px**로 통일하여 가독성을 최적화했습니다.
- 모바일에서는 max-width: 100%로 자동 해제되어 작은 화면에서도 최적의 가독성을 제공합니다.

### 관련 문서
- [FONT_SYSTEM_GUIDE.md](./FONT_SYSTEM_GUIDE.md): 폰트 시스템 사용 가이드
- [LINE_HEIGHT_SYSTEM_GUIDE.md](./LINE_HEIGHT_SYSTEM_GUIDE.md): 줄간격 시스템 사용 가이드

---

## 폴더 구조

```
tech-blog/
├── public/
│   └── resources/         # 마크다운 문서, 이미지, 다이어그램 등
├── src/
│   ├── app/               # Next.js App Router 구조
│   ├── components/        # UI 컴포넌트
│   ├── styles/            # SCSS, 타이포그래피 변수 등
│   └── resources/         # 카테고리/태그 등 데이터
├── FONT_SYSTEM_GUIDE.md   # 폰트 시스템 가이드
├── LINE_HEIGHT_SYSTEM_GUIDE.md # 줄간격 시스템 가이드
└── ...
```

---

## 시작하기

### 사전 요구사항
- Node.js 18.0.0 이상
- npm, yarn, 또는 pnpm

### 설치 및 실행

```bash
git clone https://github.com/nimkoes/tech-blog.git
cd tech-blog
npm install
npm run dev
```

### 빌드 및 배포

```bash
npm run build
npm run start
```

---

## 마크다운 문서 작성

1. `public/resources` 디렉토리에 `.md` 파일을 생성합니다.
2. 파일 상단에 다음과 같은 frontmatter를 추가합니다:

```markdown
---
title: 문서 제목
description: 문서 설명
author: 작성자
date: YYYY-MM-DD
---
```

3. 카테고리/태그는 `src/resources/category.json`에서 관리합니다.

---

## SEO 및 Sitemap 관리

- `next-sitemap`을 사용하여 자동으로 sitemap.xml, robots.txt를 생성합니다.
- 메타 태그, Open Graph, Twitter Card, 구조화 데이터(JSON-LD) 자동 지원

---

## 반응형 디자인

- PC(1024px 이상): 본문 최대 850px, 넓은 레이아웃
- 모바일(768px 미만): 본문 100% 폭, 터치 최적화

---

## 배포

- GitHub Actions를 통한 자동 배포
- 빌드 시 sitemap, robots.txt 자동 생성

---

## 환경 변수

```env
NEXT_PUBLIC_SITE_URL=https://nimkoes.github.io
NEXT_PUBLIC_SITE_NAME=Nimkoes Tech Blog
```

---

## 라이선스

MIT 라이선스. 자세한 내용은 [LICENSE](LICENSE) 파일 참조.

---

## 기여하기

- 버그 리포트, 기능 제안, 풀 리퀘스트 등 모든 기여를 환영합니다.
- 기여 가이드:
  1. 저장소를 포크합니다.
  2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/your-feature`).
  3. 변경사항을 커밋합니다 (`git commit -m '설명'`).
  4. 브랜치에 푸시합니다 (`git push origin feature/your-feature`).
  5. Pull Request를 생성합니다.

---

## 변경 이력

- 2025-01~: 폰트/타이포그래피/줄간격/문단너비 시스템 통합, 본문 max-width 850px로 최적화, 변수 기반 집중 관리 등 대규모 리팩토링
- 2025-01-27: Next.js 14 기반 블로그 시스템 구축, 마크다운 문서 처리, 자동 sitemap, 반응형, SEO 등 초기 구축 

