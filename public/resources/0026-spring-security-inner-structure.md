---
title: "Spring Security 내부 구조 일곱 번째 시간"
author: "nimkoes"
date: "2025-03-09"
---

# DisableEncodeUrlFilter

## DisableEncodeUrlFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터이며, 가장 첫 번째에 위치한다.
- `DisableEncodeUrlFilter` 의 목적은 URL 파라미터에 세션 ID가 포함되어 로그로 유출되는 것을 방지하는 것이다.
- 커스텀 `SecurityFilterChain` 을 생성하더라도 기본적으로 등록된다.
- 필요하지 않은 경우 아래와 같이 `sessionManagement` 설정을 `disable()` 하면 비활성화할 수 있다.

```java
http.sessionManagement((manage) -> manage.disable());
```

## DisableEncodeUrlFilter 클래스

- `DisableEncodeUrlFilter` 는 `OncePerRequestFilter` 를 상속하여 한 번의 요청에 대해 한 번만 실행되도록 설계되어 있다.
- 이 필터는 `HttpServletResponseWrapper` 를 활용하여 URL 인코딩을 방지한다.

```java
public class DisableEncodeUrlFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {

    filterChain.doFilter(request, new DisableEncodeUrlResponseWrapper(response));
  }

  private static final class DisableEncodeUrlResponseWrapper extends HttpServletResponseWrapper {

    private DisableEncodeUrlResponseWrapper(HttpServletResponse response) {
      super(response);
    }

    @Override
    public String encodeRedirectURL(String url) {
      return url;
    }

    @Override
    public String encodeURL(String url) {
      return url;
    }
  }
}
```

### 필터의 주요 동작 방식

- `DisableEncodeUrlResponseWrapper` 내부에서 `encodeRedirectURL()` 및 `encodeURL()` 메소드를 오버라이딩하여 원래 URL을 그대로 반환하도록 구현되었다.
- 즉, 기존의 URL 인코딩 로직을 무력화하여 세션 ID가 URL 파라미터에 포함되지 않도록 한다.

## 기존 메소드와 비교

- 기존의 `HttpServletResponse` 인터페이스를 구현한 `org.apache.catalina.connector.Response` 클래스의 `encodeRedirectURL()` 및 `encodeURL()` 메소드는 세션 ID를 인코딩하여 URL에 포함시키는 로직을 가지고 있다.

```java
@Override
public String encodeRedirectURL(String url) {
  if (isEncodeable(toAbsolute(url))) {
    return toEncoded(url, request.getSessionInternal().getIdInternal());
  } else {
    return url;
  }
}

@Override
public String encodeURL(String url) {
  String absolute;
  try {
    absolute = toAbsolute(url);
  } catch (IllegalArgumentException iae) {
    return url; // 상대 경로 URL
  }

  if (isEncodeable(absolute)) {
    if (url.equalsIgnoreCase("")) {
      url = absolute;
    } else if (url.equals(absolute) && !hasPath(url)) {
      url += '/';
    }
    return toEncoded(url, request.getSessionInternal().getIdInternal());
  } else {
    return url;
  }
}
```

### 기존 방식의 문제점

1. 기존의 `encodeRedirectURL()` 및 `encodeURL()` 메소드는 `request.getSessionInternal().getIdInternal()` 을 호출하여 세션 ID를 URL에 포함시킨다.
2. 이로 인해 세션 ID가 URL을 통해 노출될 위험이 있다.
3. `DisableEncodeUrlFilter` 는 이러한 문제를 해결하기 위해 기본적으로 모든 요청에서 URL 인코딩을 무효화하도록 동작한다.
