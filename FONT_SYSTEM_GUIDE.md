# 폰트 시스템 사용 가이드

## 개요

이 프로젝트는 통합된 타이포그래피 시스템을 사용하여 일관성 있는 폰트 크기와 스타일을 관리합니다.

## 사용법

### 1. CSS 변수 사용 (권장)

```scss
// 제목
.title {
  font-size: var(--heading-2);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

// 본문
.body-text {
  font-size: var(--body-base);
  line-height: var(--line-height-normal);
}

// 작은 텍스트
.small-text {
  font-size: var(--body-small);
  color: var(--text-secondary);
}

// 코드
.code-block {
  font-size: var(--code-base);
  font-family: 'JetBrains Mono', monospace;
}

// UI 요소
.button {
  font-size: var(--ui-base);
  font-weight: var(--font-weight-medium);
}
```

### 2. 유틸리티 클래스 사용

```html
<h1 class="heading-1">제목</h1>
<p class="body-base">본문 텍스트</p>
<span class="body-small">작은 텍스트</span>
<code class="code-small">코드</code>
```

## 폰트 크기 시스템

### 기본 크기
- `--font-size-xs`: 0.75rem (12px) - 매우 작은 텍스트
- `--font-size-sm`: 0.875rem (14px) - 작은 텍스트
- `--font-size-base`: 1rem (16px) - 기본 텍스트
- `--font-size-lg`: 1.125rem (18px) - 큰 텍스트
- `--font-size-xl`: 1.25rem (20px) - 매우 큰 텍스트
- `--font-size-2xl`: 1.5rem (24px) - 제목
- `--font-size-3xl`: 1.875rem (30px) - 큰 제목
- `--font-size-4xl`: 2.25rem (36px) - 매우 큰 제목

### 용도별 변수

#### 제목
- `--heading-1`: 가장 큰 제목
- `--heading-2`: 큰 제목
- `--heading-3`: 중간 제목
- `--heading-4`: 작은 제목
- `--heading-5`: 매우 작은 제목
- `--heading-6`: 가장 작은 제목

#### 본문
- `--body-large`: 큰 본문
- `--body-base`: 기본 본문
- `--body-small`: 작은 본문
- `--body-xs`: 매우 작은 본문

#### 코드
- `--code-large`: 큰 코드
- `--code-base`: 기본 코드
- `--code-small`: 작은 코드
- `--code-xs`: 매우 작은 코드

#### UI 요소
- `--ui-large`: 큰 UI 요소
- `--ui-base`: 기본 UI 요소
- `--ui-small`: 작은 UI 요소
- `--ui-xs`: 매우 작은 UI 요소

## 행간

- `--line-height-tight`: 1.25 - 제목용
- `--line-height-normal`: 1.5 - 기본
- `--line-height-relaxed`: 1.75 - 본문용

## 폰트 가중치

- `--font-weight-light`: 300
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

## 반응형

모바일 (768px 이하)에서는 자동으로 폰트 크기가 조정됩니다:

```scss
@media (max-width: 768px) {
  :root {
    --font-size-xs: 0.625rem;   // 10px
    --font-size-sm: 0.75rem;    // 12px
    --font-size-base: 0.875rem; // 14px
    --font-size-lg: 1rem;       // 16px
    --font-size-xl: 1.125rem;   // 18px
    --font-size-2xl: 1.25rem;   // 20px
    --font-size-3xl: 1.5rem;    // 24px
    --font-size-4xl: 1.875rem;  // 30px
  }
}
```

## 실제 사용 예시

### 헤더
```scss
.logo {
  font-size: var(--ui-large);
  font-weight: var(--font-weight-semibold);
}
```

### 포스트 제목
```scss
.postTitle {
  font-size: var(--heading-3);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
```

### 본문
```scss
.markdown {
  font-size: var(--body-base);
  line-height: var(--line-height-relaxed);
}
```

### 코드
```scss
code {
  font-size: var(--code-small);
  font-family: 'JetBrains Mono', monospace;
}
```

### 태그
```scss
.tagPill {
  font-size: var(--ui-xs);
  font-weight: var(--font-weight-medium);
}
```

## 마이그레이션 가이드

기존 하드코딩된 폰트 크기를 새로운 시스템으로 변경:

### Before
```scss
.title {
  font-size: 1.2rem;
  font-weight: 600;
}
```

### After
```scss
.title {
  font-size: var(--ui-large);
  font-weight: var(--font-weight-semibold);
}
```

## 장점

1. **일관성**: 모든 폰트 크기가 중앙에서 관리됩니다
2. **유지보수성**: 폰트 크기 변경 시 한 곳만 수정하면 됩니다
3. **반응형**: 모바일에서 자동으로 크기가 조정됩니다
4. **의미론적**: 용도에 맞는 변수명을 사용합니다
5. **확장성**: 새로운 크기나 스타일을 쉽게 추가할 수 있습니다 