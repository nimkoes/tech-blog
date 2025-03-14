---
title: "Spring Security 내부 구조 스물 두 번째 시간"
author: "nimkoes"
date: "2025-03-09"
---

# AuthorizationFilter

## AuthorizationFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터이며, 마지막에 위치한다.
- `SecurityFilterChain`의 authorizeHttpRequests() 설정에 따른 최종 인가 처리를 한다.
- 요청에 대한 접근 권한 검증을 한다.
- 인가 결정에 따른 접근 제어 실행 한다.

### 기본 설정 예시

- 커스텀 `SecurityFilterChain` 에서는 다음과 같이 인가 규칙을 설정할 수 있다

```java
http
  .authorizeHttpRequests((auth) -> auth
  .requestMatchers("/").permitAll()      // 루트 경로는 모든 사용자 접근 가능
  .requestMatchers("/admin/**").hasRole("ADMIN")  // admin 경로는 ADMIN 역할 필요
  .requestMatchers("/user/**").authenticated()    // user 경로는 인증 필요
  .anyRequest().permitAll());            // 그 외 경로는 모든 사용자 접근 가능
```

## AuthorizationFilter 클래스

```java
public class AuthorizationFilter extends GenericFilterBean {
  private final AuthorizationManager<HttpServletRequest> authorizationManager;
  private final AuthorizationEventPublisher eventPublisher;
  private final boolean observeOncePerRequest;

  // 생성자 및 기타 메서드
}
```

### 주요 로직: doFilter

```java
public void doFilter(ServletRequest servletRequest,
                     ServletResponse servletResponse,
                     FilterChain chain)
  throws ServletException, IOException {

  HttpServletRequest request = (HttpServletRequest) servletRequest;
  HttpServletResponse response = (HttpServletResponse) servletResponse;

  // 1. 중복 실행 방지, 특정 설정이 enable 이고 이 필터가 이번 요청에서 이미 사용 되었다면 건너 뛴다.
  if (this.observeOncePerRequest && isApplied(request)) {
    chain.doFilter(request, response);
    return;
  }

  // 2. 비동기 요청 등 특수 상황 처리
  if (skipDispatch(request)) {
    chain.doFilter(request, response);
    return;
  }

  // 3. 필터 실행 표시, 현재 필터가 이미 사용되었다면 값을 추가
  String alreadyFilteredAttributeName = getAlreadyFilteredAttributeName();
  request.setAttribute(alreadyFilteredAttributeName, Boolean.TRUE);

  try {
    // 4. 인가 결정 처리
    AuthorizationDecision decision = this.authorizationManager.check(this::getAuthentication, request);

    // 5. 인가 이벤트 발행
    this.eventPublisher.publishAuthorizationEvent(this::getAuthentication, request, decision);

    // 6. 인가 결정에 따른 처리
    if (decision != null && !decision.isGranted()) {
      throw new AccessDeniedException("Access Denied");
    }

    // 7. 다음 필터 체인 실행
    chain.doFilter(request, response);
  } finally {
    // 8. 필터 실행 표시 제거
    request.removeAttribute(alreadyFilteredAttributeName);
  }
}
```

## 상세 동작 프로세스

### 1. 중복 실행 방지

- `observeOncePerRequest` 설정에 따라 필터의 중복 실행 검사
- 이미 실행된 경우 추가 인가 처리 없이 다음 필터로 진행

### 2. 특수 상황 처리

- 비동기 요청, 오류 페이지 요청 등 특수한 상황 확인
- skipDispatch() 메서드를 통해 인가 처리 건너뛰기 여부 결정

### 3. 인가 처리

1. 인가 매니저 실행
   - `AuthorizationManager` 를 통한 접근 권한 확인
   - 현재 인증 정보와 요청 정보를 기반으로 판단
2. 이벤트 처리
   - 인가 결정에 대한 이벤트 발행
   - 모니터링 및 감사 로그 목적으로 활용
3. 접근 제어
   - 인가 거부 시 `AccessDeniedException` 발생
   - `ExceptionTranslationFilter` 에서 최종 처리

## 활용 예시

### 1. 기본 인가 설정

```java
@Configuration
public class SecurityConfig {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) {
    http.authorizeHttpRequests(auth -> auth
      .requestMatchers("/public/**").permitAll()
      .requestMatchers("/api/**").hasRole("USER")
      .requestMatchers("/admin/**").hasRole("ADMIN")
      .anyRequest().authenticated()
    );
    return http.build();
  }
}
```

### 2. 커스텀 인가 규칙

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) {
  http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/**").access(new CustomAuthorizationManager())
    .anyRequest().authenticated()
  );
  return http.build();
}
```
