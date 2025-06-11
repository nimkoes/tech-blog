# ExceptionTranslationFilter

## ExceptionTranslationFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터이며, 열다섯 번째에 위치한다.
- 보안 관련 예외를 처리하는 핵심 필터이다.
- 이 필터 이후에 발생하는 인증, 인가 예외를 핸들링하기 위해 사용된다.

### 주요 특징

- `DefaultSecurityFilterChain` 에 기본 등록
- 커스텀 `SecurityFilterChain` 에도 자동 등록
- 인증/인가 예외 처리 담당

## ExceptionTranslationFilter 클래스

```java
public class ExceptionTranslationFilter extends GenericFilterBean
  implements MessageSourceAware {
  // 필터 구현
}
```

### 주요 로직 : doFilter

```java
private void doFilter(HttpServletRequest request,
                      HttpServletResponse response,
                      FilterChain chain) {
  try {
    chain.doFilter(request, response);
  } catch (Exception ex) {
    // 스프링 시큐리티 예외 추출
    RuntimeException securityException = extractSecurityException(ex);
    if (securityException != null) {
      handleSpringSecurityException(request, response,
        chain, securityException);
    }
  }
}
```

### 예외 처리 분기

```java
private void handleSpringSecurityException(HttpServletRequest request,
                                           HttpServletResponse response,
                                           FilterChain chain,
                                           RuntimeException exception) {
  if (exception instanceof AuthenticationException) {
    handleAuthenticationException(request, response,
      chain, (AuthenticationException) exception);
  } else if (exception instanceof AccessDeniedException) {
    handleAccessDeniedException(request, response,
      chain, (AccessDeniedException) exception);
  }
}
```

## 주요 예외 처리

### 인증 예외 처리

- `AuthenticationException` 발생 시 처리
- 로그인 페이지로 리다이렉션
- 인증 시작점(`AuthenticationEntryPoint`) 호출

### 인가 예외 처리

1. 익명 사용자 또는 Remember-Me 사용자의 경우

- 인증 시작점으로 리다이렉션
- 로그인 요청 처리

2. 인증된 사용자의 경우

- `AccessDeniedHandler` 로 처리
- `403 Forbidden` 응답 또는 에러 페이지 표시

## 중요 고려사항

### 필터 순서의 중요성

1. 예외 처리 범위

- `ExceptionTranslationFilter` 이후 발생하는 예외만 처리
- 이전 필터에서 발생하는 예외는 처리 불가

2. 예시

- `UsernamePasswordAuthenticationFilter` 의 예외는 처리 불가
- 해당 필터가 `ExceptionTranslationFilter` 보다 앞에 위치

### 실제 구현 예시

```java

@Configuration
public class SecurityConfig {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) {
    http
      .exceptionHandling(exceptions -> exceptions
        .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
        .accessDeniedHandler(new CustomAccessDeniedHandler())
      );
    return http.build();
  }
}
```

## 문제 해결 가이드

### 일반적인 문제 상황

1. 이전 필터의 예외 처리
   - 각 필터에서 자체적으로 예외 처리 구현
   - `ErrorController` 활용
2. 커스텀 필터 예외 처리
   - `ExceptionTranslationFilter` 이후에 필터 배치
   - 예외 처리 로직 포함

### 참고 자료

- [Spring Security ExceptionTranslationFilter 예외 처리 관련 스택 오버플로우](https://stackoverflow.com/questions/77694705/spring-security-exceptiontranslationfilter-doest-handle-thrown-in-custom-filter)

