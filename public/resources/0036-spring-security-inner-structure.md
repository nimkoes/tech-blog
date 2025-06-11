# BasicAuthenticationFilter

## BasicAuthenticationFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터이며, 열한 번째에 위치한다.
- HTTP Basic 인증을 처리하는 핵심 필터이다.
- Basic 인증은 `RFC 7617`에서 정의된 표준 인증 방식으로, 간단하면서도 효과적인 인증 메커니즘을 제공한다.

### 필터 활성화 방법

```java
http.httpBasic(Customizer.withDefaults());
```

## Basic 인증의 특징과 동작 방식

### Form 인증과의 차이점

Form 인증

- 사용자가 웹 폼에 직접 입력
- 세션 또는 JWT 기반의 상태 유지
- 일회성 인증 후 토큰/세션으로 관리

Basic 인증

- 브라우저 기본 제공 대화상자 사용
- 매 요청마다 인증 정보 전송
- Base64 인코딩된 credentials 사용
- 헤더 기반 인증 방식

### 인증 헤더 구조

기본 형식

```plaintext
Authorization: Basic {Base64Encoded(username:password)}
```

예시

```plaintext
// username: user, password: pass123 인 경우
Authorization: Basic dXNlcjpwYXNzMTIz
```

## Spring Security 의 Basic 인증 구현

### 최적화된 기능

- 세션 통합
  - 인증 정보를 세션에 캐싱
  - 불필요한 재인증 방지
- Remember-Me 서비스
  - 장기간 인증 유지 가능
  - 사용자 편의성 향상

## BasicAuthenticationFilter 클래스

```java
public class BasicAuthenticationFilter extends OncePerRequestFilter {
  
}
```

### 주요 로직 : doFilterInternal

```java
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
  throws IOException, ServletException {

  try {

    // HTTP Authorization 헤더에서 값을 꺼냄
    Authentication authRequest = this.authenticationConverter.convert(request);
    if (authRequest == null) {
      this.logger.trace("Did not process authentication request since failed to find "
        + "username and password in Basic Authorization header");
      chain.doFilter(request, response);
      return;
    }

    // username 값을 가져옴
    String username = authRequest.getName();
    this.logger.trace(LogMessage.format("Found username '%s' in Basic Authorization header", username));

    // Security Context에 해당 username이 이미 존재하는지 확인
    if (authenticationIsRequired(username)) {
      // 인증 진행
      Authentication authResult = this.authenticationManager.authenticate(authRequest);
      // 인증 결과를 Security Context에 저장
      SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();
      context.setAuthentication(authResult);
      this.securityContextHolderStrategy.setContext(context);
      if (this.logger.isDebugEnabled()) {
        this.logger.debug(LogMessage.format("Set SecurityContextHolder to %s", authResult));
      }
      // Remember Me 서비스에 등록
      this.rememberMeServices.loginSuccess(request, response, authResult);
      // Security Context Repository에 저장
      this.securityContextRepository.saveContext(context, request, response);
      // 로그인 성공 핸들러
      onSuccessfulAuthentication(request, response, authResult);
    }
  } catch (AuthenticationException ex) {
    this.securityContextHolderStrategy.clearContext();
    this.logger.debug("Failed to process authentication request", ex);
    this.rememberMeServices.loginFail(request, response);
    onUnsuccessfulAuthentication(request, response, ex);
    if (this.ignoreFailure) {
      chain.doFilter(request, response);
    } else {
      this.authenticationEntryPoint.commence(request, response, ex);
    }
    return;
  }

  chain.doFilter(request, response);
}
```

### 주요 처리 단계

- 헤더 검증 단계
  - Authorization 헤더 존재 확인
  - Basic 인증 방식 확인
  - Base64 디코딩 및 유효성 검사
- 인증 처리 단계
  - SecurityContext 확인
  - AuthenticationManager를 통한 인증
  - 인증 결과 처리
- 보안 컨텍스트 관리
  - SecurityContext 업데이트
  - Remember-Me 서비스 연동
  - 세션 관리

### 예외 처리 로직

```java
try{
  // 인증 로직
  }catch(AuthenticationException ex){
  securityContextHolderStrategy.

clearContext();
    rememberMeServices.

loginFail(request, response);

onUnsuccessfulAuthentication(request, response, ex);
// ... 추가 예외 처리
}
```

## 보안 고려사항

### 전송 계층 보안

- HTTPS 사용 필수
- 평문 전송 위험 존재
- TLS/SSL 적용 권장

### 인증 정보 보호

- Base64는 인코딩일 뿐, 암호화가 아님
- 네트워크 스니핑 위험 존재
- 추가적인 보안 계층 필요

### 브라우저 호환성

- 브라우저별 다른 UI/UX
- 모바일 환경 고려 필요
- 사용자 경험 최적화 필요

## 실제 활용 시나리오

### API 서버 인증

- REST API 엔드포인트 보호
- 서비스 간 통신 인증
- 마이크로서비스 아키텍처 적용

### 개발 및 테스트 환경

- 빠른 프로토타입 구현
- 테스트 자동화 용이
- 개발 생산성 향상

## 참고 자료

- [Spring Security Basic Authentication 공식 문서](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/basic.html)
- [RFC 7617 - The 'Basic' HTTP Authentication Scheme](https://tools.ietf.org/html/rfc7617)
