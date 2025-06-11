---
title: "Spring Security 내부 구조 열 여덟 번째 시간"
author: "nimkoes"
date: "2025-03-09"
---

# RequestCacheAwareFilter

## RequestCacheAwareFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터이며, 열두 번째에 위치한다.
- 이전 HTTP 요청에서 처리하지 못한 작업을 현재 요청에서 처리하기 위한 필터이다.

### 필터 설정

커스텀 `SecurityFilterChain` 에서는 기본적으로 활성화되어 있으며, 필요한 경우 다음과 같이 비활성화할 수 있다

```java
http.requestCache((cache) -> cache.disable());
```

## 동작 프로세스

### 기본 동작 시나리오

1. 미인증 사용자의 보호된 리소스 접근
   - 사용자가 인증이 필요한 "/my" 경로 접근
   - 권한 없음 예외 발생
2. 요청 정보 저장
   - 핸들러가 "/my" 경로 정보를 캐시에 저장
   - 로그인 페이지로 리다이렉트
3. 인증 처리
   - 사용자가 로그인 진행
   - 인증 성공 후 처리
4. 원래 요청 복원
   - 저장된 "/my" 경로 요청 복원
   - 원래 요청한 리소스로 이동

### 예외 처리 과정

- `ExceptionTranslationFilter` 에서 특정 예외 발생 시 `sendStartAuthentication()` 메소드를 통해 요청을 캐시한다

```java
protected void sendStartAuthentication(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain chain,
                                    AuthenticationException reason) 
        throws ServletException, IOException {

    SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();
    this.securityContextHolderStrategy.setContext(context);
    this.requestCache.saveRequest(request, response);
    this.authenticationEntryPoint.commence(request, response, reason);
}
```

## 구현 상세

### RequestCacheAwareFilter 클래스 구조

```java
public class RequestCacheAwareFilter extends GenericFilterBean {

    private RequestCache requestCache;

    public RequestCacheAwareFilter() {
        this(new HttpSessionRequestCache());
    }

    public RequestCacheAwareFilter(RequestCache requestCache) {
        Assert.notNull(requestCache, "requestCache cannot be null");
        this.requestCache = requestCache;
    }
}
```

### 핵심 필터 로직

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, 
                    FilterChain chain)
        throws IOException, ServletException {
    
    // 저장된 요청 조회
    HttpServletRequest wrappedSavedRequest = 
        this.requestCache.getMatchingRequest((HttpServletRequest) request, (HttpServletResponse) response);
    
    // 저장된 요청이 있다면 해당 요청으로 교체
    chain.doFilter((wrappedSavedRequest != null) ? wrappedSavedRequest : request, response);
}
```

## 주요 특징

### 요청 캐시 관리
- `HttpSessionRequestCache` 를 기본 구현체로 사용
- 세션을 통한 요청 정보 저장
- 인증 후 원래 요청 복원 기능

### 동작 시점
- `ExceptionTranslationFilter` 이후 발생하는 예외 처리
- `AccessDeniedException` 등 특정 예외 발생 시 동작
- 인증 성공 후 자동으로 원래 요청 복원

### 활용 사례
- 로그인 페이지 리다이렉션 처리
- 권한 없는 접근 처리
- 인증 후 원래 페이지 복원
