---
title: "Spring Security 내부 구조 열 번째 시간"
author: "nimkoes"
date: "2025-03-09"
tags: [ "study", "spring", "spring security" ]
---

# HeaderWriterFilter

## HeaderWriterFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되며, 네 번째에 위치한다.
- HTTP 응답 헤더에 보안 관련 헤더를 추가하여 클라이언트를 보호한다.
- 기본적으로 다양한 보안 헤더가 자동으로 추가되며, 이를 통해 XSS, MIME 스니핑, `Clickjacking` 등의 공격을 방지할 수 있다.
- 커스텀 `SecurityFilterChain` 을 생성해도 기본적으로 등록되며, 비활성화하려면 아래와 같이 설정할 수 있다.

```java
http.headers((headers) ->headers.disable());
```

- 하지만 보안상의 이유로 비활성화하지 않는 것이 권장된다. 필요에 따라 특정 헤더만 비활성화하는 것이 좋다.

## HeaderWriterFilter 클래스

```java
public class HeaderWriterFilter extends OncePerRequestFilter {

  private final List<HeaderWriter> headerWriters;
  private final boolean shouldWriteHeadersEagerly;

  // 생성자 및 로직 생략...

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {
    if (this.shouldWriteHeadersEagerly) {
      for (HeaderWriter writer : this.headerWriters) {
        writer.writeHeaders(request, response);
      }
    }

    filterChain.doFilter(request, response);
  }
}
```

### 동작 방식

- `HeaderWriterFilter` 는 요청이 들어오면 `headerWriters` 목록을 순회하며 응답 헤더를 추가한다.
- 기본적으로 서블릿이 응답을 보내는 시점에 헤더가 추가되지만, 설정에 따라 필터가 실행되는 즉시 헤더를 추가할 수도 있다.

## HeaderWriterFilter 로 추가되는 기본 헤더

| 헤더명                         | 설명                                               |
|-----------------------------|--------------------------------------------------|
| `X-Content-Type-Options`    | MIME 스니핑 방지 (`nosniff`)                          |
| `X-XSS-Protection`          | XSS 공격 감지 시 페이지 로딩 차단 (기본값: `1; mode=block`)     |
| `Cache-Control`             | 캐싱 관련 정책 (`no-cache, no-store, must-revalidate`) |
| `Pragma`                    | HTTP/1.0 방식의 캐시 정책 (`no-cache`)                  |
| `Expires`                   | 캐시 만료 시간 (기본적으로 `0`으로 설정)                        |
| `X-Frame-Options`           | Clickjacking 방지 (`DENY` 또는 `SAMEORIGIN`)         |
| `Strict-Transport-Security` | HSTS 활성화 (`max-age=31536000; includeSubDomains`) |
| `Content-Security-Policy`   | 콘텐츠 보안 정책 (XSS 및 데이터 인젝션 방어)                     |
| `Referrer-Policy`           | 리퍼러 정보 노출 정책 (`no-referrer-when-downgrade`)      |
| `Permissions-Policy`        | 특정 기능 사용 제한 (`geolocation=(), microphone=()`)    |

### 적용된 헤더 확인 방법

- 브라우저 개발자 도구 (F12) → 네트워크 탭 → 요청 선택 → 응답 헤더 확인

## 커스텀 헤더 설정 방법

- 기본 제공되는 헤더 외에 추가적인 헤더를 설정하거나 특정 헤더를 비활성화할 수 있다.

### 특정 보안 헤더 수정

```java
http
  .headers(headers -> headers
    .frameOptions(frameOptions -> frameOptions.sameOrigin()) // iframe 사용 허용 (같은 출처)
    .cacheControl(cache -> cache.disable()) // 캐시 비활성화
    .contentTypeOptions(contentTypeOptions -> contentTypeOptions.disable()) // MIME 스니핑 방지 해제
  );
```

### 사용자 정의 헤더 추가

```java
http
  .headers(headers -> headers
    .addHeaderWriter((request, response) -> {
      response.setHeader("X-Custom-Header", "MyHeaderValue");
    })
  );
```

