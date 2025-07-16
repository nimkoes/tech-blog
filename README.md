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

### SEO 및 검색 엔진 최적화

- next-sitemap (자동 sitemap 생성)
- robots.txt 자동 생성
- 메타 태그 최적화
- 구조화된 데이터 지원

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

## SEO 및 Sitemap 관리

### 자동 Sitemap 생성

이 프로젝트는 `next-sitemap`을 사용하여 자동으로 sitemap을 생성합니다.

#### 설정 파일

`next-sitemap.config.js` 파일에서 sitemap 생성 옵션을 설정할 수 있습니다:

```javascript
module.exports = {
  siteUrl: 'https://nimkoes.github.io',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: './public',
  exclude: ['/admin/*', '/api/*'],
  additionalPaths: async (config) => {
    // resources 디렉토리의 모든 .md 파일을 자동으로 포함
    const result = [];
    const fs = require('fs');
    const path = require('path');
    
    const resourcesDir = path.join(process.cwd(), 'public', 'resources');
    if (fs.existsSync(resourcesDir)) {
      const files = fs.readdirSync(resourcesDir);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const fileName = file.replace('.md', '');
          result.push({
            loc: `/tech-blog/post/${fileName}`,
            lastmod: new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.7,
          });
        }
      });
    }
    
    return result;
  },
}
```

#### 사용 방법

```bash
# 빌드 시 자동으로 sitemap 생성
npm run build

# 수동으로 sitemap 생성
npm run postbuild
```

#### 생성되는 파일들

- `public/sitemap.xml`: 메인 sitemap 파일
- `public/robots.txt`: 검색 엔진 크롤링 가이드

#### 포함되는 URL들

- 모든 포스트 페이지 (`/post/*`)
- 모든 리소스 파일 (`/tech-blog/resources/*`)
- 메인 페이지 및 정적 페이지
- 자동으로 업데이트되는 lastmod 날짜

### 검색 엔진 최적화

- 메타 태그 자동 생성
- Open Graph 태그 지원
- Twitter Card 지원
- 구조화된 데이터 (JSON-LD) 지원

## 반응형 디자인

- Desktop (1024px 이상)
- Mobile (768px 미만)

각 디바이스 환경에 최적화된 UI/UX를 제공합니다.

## 배포

### GitHub Pages 배포

1. GitHub 저장소에 코드를 푸시합니다.
2. GitHub Actions를 통해 자동 배포가 설정되어 있습니다.
3. 빌드 시 자동으로 sitemap이 생성됩니다.

### 환경 변수

프로덕션 환경에서 필요한 환경 변수:

```env
NEXT_PUBLIC_SITE_URL=https://nimkoes.github.io
NEXT_PUBLIC_SITE_NAME=Nimkoes Tech Blog
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여하기

버그 리포트, 기능 제안, 풀 리퀘스트 등 모든 기여를 환영합니다.

### 기여 방법

1. 이 저장소를 포크합니다.
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.

## 변경 이력

### v0.1.0 (2025-01-27)

- Next.js 14 기반 블로그 시스템 구축
- 마크다운 문서 처리 시스템 구현
- 자동 sitemap 생성 기능 추가
- 반응형 디자인 적용
- SEO 최적화 기능 추가 

