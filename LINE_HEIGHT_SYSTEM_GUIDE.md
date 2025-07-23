# 줄간격(Line-height) 시스템 사용 가이드

## 개요

이 프로젝트는 통합된 줄간격(line-height) 시스템을 사용하여 일관성 있는 행간과 가독성을 관리합니다.

## 변수 정의 위치

- `src/styles/variables/_typography.scss`에서 모든 줄간격 변수를 집중 관리합니다.

### 기본 변수
- `--line-height-tight`: 1.25 (제목, 태그, 버튼 등 타이트한 줄간격)
- `--line-height-normal`: 1.5 (일반 본문, UI 기본)
- `--line-height-relaxed`: 1.75 (마크다운, 긴 본문 등 여유 있는 줄간격)

### 모바일(반응형) 변수
- `--line-height-tight-mobile`: 1.15
- `--line-height-normal-mobile`: 1.35
- `--line-height-relaxed-mobile`: 1.5

모바일에서는 미디어 쿼리로 자동으로 더 타이트한 줄간격이 적용됩니다.

```scss
@media (max-width: 768px) {
  :root {
    --line-height-tight: var(--line-height-tight-mobile);
    --line-height-normal: var(--line-height-normal-mobile);
    --line-height-relaxed: var(--line-height-relaxed-mobile);
  }
}
```

---

## 사용법

### 1. CSS 변수 직접 사용
```scss
.title {
  font-size: var(--heading-2);
  line-height: var(--line-height-tight);
}

.body-text {
  font-size: var(--body-base);
  line-height: var(--line-height-normal);
}

.markdown {
  font-size: var(--body-base);
  line-height: var(--line-height-relaxed);
}
```

### 2. 용도별 권장 매핑
- **제목/헤더**: `--line-height-tight`
- **본문/일반 텍스트**: `--line-height-normal`
- **마크다운/긴 본문**: `--line-height-relaxed`
- **코드/태그/버튼 등**: 상황에 따라 `tight` 또는 `normal`

---

## 마이그레이션 가이드

### Before (하드코딩된 줄간격)
```scss
.title {
  font-size: 2rem;
  line-height: 1.2;
}
.body {
  font-size: 1rem;
  line-height: 1.6;
}
```

### After (변수 기반)
```scss
.title {
  font-size: var(--heading-2);
  line-height: var(--line-height-tight);
}
.body {
  font-size: var(--body-base);
  line-height: var(--line-height-normal);
}
```

---

## 장점

1. **일관성**: 모든 줄간격이 중앙에서 관리되어 UI 전체의 가독성이 향상됩니다.
2. **유지보수성**: 줄간격 변경 시 한 곳만 수정하면 전체에 반영됩니다.
3. **반응형**: 모바일에서 자동으로 더 타이트한 줄간격이 적용됩니다.
4. **확장성**: 새로운 줄간격 스타일을 쉽게 추가할 수 있습니다.
5. **의미론적**: 용도에 맞는 변수명을 사용하여 코드 가독성이 높아집니다.

---

## 실제 적용 예시

### 헤더/제목
```scss
h1, h2, h3, h4, h5, h6 {
  line-height: var(--line-height-tight);
}
```

### 본문
```scss
p, li {
  line-height: var(--line-height-normal);
}
```

### 마크다운/긴 본문
```scss
.markdown {
  line-height: var(--line-height-relaxed);
}
```

### 코드/태그/버튼
```scss
.code-block {
  line-height: var(--line-height-tight);
}
.tagPill {
  line-height: var(--line-height-tight);
}
```

---

## 참고
- normalize, reset 등 브라우저 기본 리셋용 line-height는 예외적으로 하드코딩될 수 있습니다.
- 실제 UI/UX에 따라 변수 값을 조정하면 전체 사이트에 일관되게 반영됩니다. 