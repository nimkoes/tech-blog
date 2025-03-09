---
title: "Spring Security 내부 구조 열 네 번째 시간"
author: "nimkoes"
date: "2025-03-09"
tags: [ "study", "spring", "spring security" ]
---

# UsernamePasswordAuthenticationFilter

## UsernamePasswordAuthenticationFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터로 여덟 번째에 위치한다.
- 이 필터는 username, password 기반 로그인 기능의 뼈대가 되는 필터이다.
- 이 필터는 `application/x-www-form-urlencoded` 형식의 username/password 데이터를 처리하며, 기본적으로 `POST /login` 요청을 가로채어 인증을 수행한다. 만약 JSON 기반 인증을 원한다면, 커스텀 필터를 만들어야 한다.
- 커스텀 `SecurityFilterChain` 을 생성하면 자동 등록이 안되기 때문에 아래 구문을 통해서 필터를 활성화시켜야 한다.

```java
http.formLogin(Customizer.withDefaults());
```

## UsernamePasswordAuthenticationFilter 클래스

```java
public class UsernamePasswordAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

}
```

### doFilter 가 없다 doFilter 는?

- 다른 필터들과 달리 `UsernamePasswordAuthenticationFilter` 에는 doFilter 메서드가 보이지 않는다.
- 부모 클래스인 `AbstractAuthenticationProcessingFilter` 에 정의되어 있다.
- `UsernamePasswordAuthenticationFilter` 는 Form 로그인 방식을 처리하는 필터로, 인증 과정은 다음과 같이 진행된다.
  1. 사용자로부터 username 과 password 데이터를 받음
  2. 인증 시도 (`attemptAuthentication` 메서드 호출)
  3. 인증 성공 또는 실패 처리
- 데이터 전송 방식(Form vs. JSON 등)이 달라도 이 과정은 동일하다.
- 단, 전송 방식(JSON 등)이 다르면 이를 처리하는 필터가 달라질 수 있다.
- 따라서, `Spring Security` 는 인증 방식에 따라 공통 로직을 `AbstractAuthenticationProcessingFilter` 라는 추상 클래스로 정의하고, 각각의 방식에 맞는 필터(`UsernamePasswordAuthenticationFilter`, `OAuth2LoginAuthenticationFilter` 등)를 구현하여 사용한다.

## AbstractAuthenticationProcessingFilter

```java
public abstract class AbstractAuthenticationProcessingFilter extends GenericFilterBean
  implements ApplicationEventPublisherAware, MessageSourceAware {

}
```

### 주요 로직 : doFilter

```java
private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
  throws IOException, ServletException {

  // 로그인 경로 요청인지 확인
  if (!requiresAuthentication(request, response)) {
    chain.doFilter(request, response);
    return;
  }

  // 로그인 과정 시도
  try {
    // 사용자로 부터 데이터를 받아 상황에 맞는 인증을 진행 (이 부분을 구현)
    Authentication authenticationResult = attemptAuthentication(request, response);

    if (authenticationResult == null) {
      return;
    }
    // 인증 결과가 존재하면 세션 전략에 따라 SecurityContext 에 저장
    this.sessionStrategy.onAuthentication(authenticationResult, request, response);

    // 아래 값이 설정되어 있으면 다음 필터로 넘김
    if (this.continueChainBeforeSuccessfulAuthentication) {
      chain.doFilter(request, response);
    }

    // 로그인 성공 핸들러
    successfulAuthentication(request, response, chain, authenticationResult);
  }
  // 로그인 실패 핸들러
  catch (InternalAuthenticationServiceException failed) {
    this.logger.error("An internal error occurred while trying to authenticate the user.", failed);
    unsuccessfulAuthentication(request, response, failed);
  } catch (AuthenticationException ex) {
    unsuccessfulAuthentication(request, response, ex);
  }
}
```

### attemptAuthentication 추상 메소드

```java
public abstract Authentication attemptAuthentication(HttpServletRequest request,
                                                     HttpServletResponse response) throws AuthenticationException, IOException, ServletException;
```

- 위와 같이 데이터를 받아 인증을 진행하는 부분을 추상화하여 상황에 따라 구현할 수 있도록 만들어 두었다.

### AbstractAuthenticationProcessingFilter 추상 클래스

  - UsernamePasswordAuthenticationFilter
  - OAuth2LoginAuthenticationFilter
  - Saml2WebSsoAuthenticationFilter
  - CasAuthenticationFilter

## UsernamePasswordAuthenticationFilter 에서 attemptAuthentication() 메소드

```java

@Override
public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
  throws AuthenticationException {

  // 로그인 경로 요청인지 확인
  if (this.postOnly && !request.getMethod().equals("POST")) {
    throw new AuthenticationServiceException("Authentication method not supported: "
      + request.getMethod());
  }

  // 요청으로부터 multipart/form-data 로 전송되는 username, password 획득
  String username = obtainUsername(request);
  username = (username != null) ? username.trim() : "";
  String password = obtainPassword(request);
  password = (password != null) ? password : "";

  // 인증을 위해 위 데이터를 인증 토큰에 넣음
  UsernamePasswordAuthenticationToken authRequest =
    UsernamePasswordAuthenticationToken.unauthenticated(username, password);
  setDetails(request, authRequest);

  // username/password 기반 인증을 진행하는 AuthenticationManager 에게 인증을 요청 후 응답
  return this.getAuthenticationManager().authenticate(authRequest);
}
```

## 기타

### AuthenticationManager 인터페이스
[AuthenticationManager 스프링 시큐리티 공식 API 문서](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/authentication/AuthenticationManager.html)

### ProviderManager 구현
[ProviderManager 스프링 시큐리티 공식 API 문서](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/authentication/ProviderManager.html)

### AuthenticationProvider 인터페이스
[AuthenticationProvider 스프링 시큐리티 공식 API 문서](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/authentication/AuthenticationProvider.html)

### DaoAuthenticationProvider 구현
[DaoAuthenticationProvider 스프링 시큐리티 공식 API 문서](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/authentication/dao/DaoAuthenticationProvider.html)

