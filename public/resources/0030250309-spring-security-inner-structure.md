---
title: "Spring Security 내부 구조 열 한 번째 시간"
author: "nimkoes"
date: "2025-03-09"
---

# CorsFilter

## 들어가며

- API 서버를 구축할 때 프론트엔드와 백엔드의 오리진이 다르면 CORS 문제가 발생한다.
- 실무에서도 CORS 문제를 해결하기 위해 `SecurityFilterChain` 에 `CorsConfigurationSource` 값을 설정하는 것이 중요하다.
- `CorsFilter` 자체는 복잡한 로직을 수행하지 않으며, CORS 설정이 더 중요한 개념이다.
- 그래도 `CorsFilter` 가 어떤 방식으로 동작하는지 알아두는 것이 좋다.

## CorsFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되며, 다섯 번째에 위치한다.
- CORS 정책을 적용하여 브라우저에서 발생하는 CORS 차단 문제를 해결하는 역할을 한다.
- `CorsConfigurationSource` 에 설정된 값을 기반으로 필터 단에서 응답 헤더를 추가한다.
- 커스텀 `SecurityFilterChain` 을 생성해도 기본적으로 등록되며, 비활성화하려면 아래와 같이 설정할 수 있다.

```java
http.cors((cors) -> cors.disable());
```

- 하지만 보안상의 이유로 완전히 비활성화하는 것은 권장되지 않는다.

## GenericFilter

### CorsFilter 의 부모 클래스

- `CorsFilter` 는 일반적인 Spring Security 필터들과 다르게 `GenericFilterBean` 이 아닌 `GenericFilter` 를 상속받는다.
- `GenericFilterBean` 과 `GenericFilter` 는 모두 `Filter` 인터페이스를 구현한다는 공통점을 가지고 있다.

### GenericFilter vs GenericFilterBean 차이점

| 비교 항목        | GenericFilter          | GenericFilterBean           |
|--------------|------------------------|-----------------------------|
| 부모 클래스       | `javax.servlet.Filter` | `GenericFilter` (Spring 제공) |
| Spring과의 연관성 | Spring과 직접적인 연관 없음     | Spring에서 `Bean` 으로 관리됨      |
| 사용 목적        | 일반적인 Servlet 필터        | Spring Security 필터로 사용됨     |

### 왜 CorsFilter 는 GenericFilter 를 사용하는가?

- `CorsFilter` 는 Spring Security 의 일부로 포함되었지만, 원래는 Java Servlet 환경에서 사용되던 필터다.
- 따라서 본래의 특성을 유지하기 위해 Spring 의 `GenericFilterBean` 이 아닌 `GenericFilter` 를 기반으로 구현되었다.

## CorsFilter 클래스

```java
public class CorsFilter extends GenericFilter {

  private final CorsConfigurationSource configSource;

  public CorsFilter(CorsConfigurationSource configSource) {
    this.configSource = configSource;
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    HttpServletRequest req = (HttpServletRequest) request;
    HttpServletResponse res = (HttpServletResponse) response;

    // 요청 유형에 따른 CORS 처리 로직
    CorsConfiguration config = this.configSource.getCorsConfiguration(req);
    if (config != null) {
      // CORS 관련 응답 헤더 설정
    }

    chain.doFilter(request, response);
  }
}
```

### 동작 방식

1. `CorsFilter` 가 실행되면서 `CorsConfigurationSource` 에 설정된 CORS 정책을 가져온다.
2. HTTP 요청의 타입을 검사하여 CORS 요청인지 확인한다.
3. CORS 요청이라면, 적절한 응답 헤더를 추가한다.
4. 다음 필터로 요청을 전달한다.

## CorsConfigurationSource 설정 방법

- CORS 정책을 설정하는 가장 일반적인 방법은 `CorsConfigurationSource` 를 직접 정의하는 것이다.

```java

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http
    .cors(cors -> cors.configurationSource(new CorsConfigurationSource() {
      @Override
      public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Collections.singletonList("http://localhost:3000"));
        configuration.setAllowedMethods(Collections.singletonList("*"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Collections.singletonList("*"));
        configuration.setMaxAge(3600L);
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie", "Authorization"));

        return configuration;
      }
    }));

  return http.build();
}
```

### 주요 설정 옵션

| 설정 항목                 | 설명                                                |
|-----------------------|---------------------------------------------------|
| `setAllowedOrigins`   | 허용할 오리진 설정 (`*` 은 모든 오리진 허용)                      |
| `setAllowedMethods`   | 허용할 HTTP 메서드 (`GET`, `POST`, `DELETE`, `PUT` 등)   |
| `setAllowCredentials` | `true` 로 설정하면 쿠키 포함 요청 허용 (`Authorization` 헤더 포함) |
| `setAllowedHeaders`   | 요청 시 허용할 헤더 목록 (`*` 사용 시 모든 헤더 허용)                |
| `setMaxAge`           | CORS preflight 요청 결과를 브라우저에서 캐시하는 시간 (초 단위)       |
| `setExposedHeaders`   | 클라이언트에서 접근할 수 있는 응답 헤더 목록                         |
