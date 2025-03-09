---
title: "Spring Security 내부 구조 열 다섯 번째 시간"
author: "nimkoes"
date: "2025-03-09"
tags: [ "study", "spring", "spring security" ]
---

# DefaultLoginPageGeneratingFilter

## DefaultLoginPageGeneratingFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터로 아홉 번째에 위치한다.
- 이 필터가 등록되는 목적은 `GET /login` 경로에 기본 로그인 페이지를 응답하는 역할을 수행한다.
- 이 필터는 여러 로그인 설정에 의존한다.
- `formLogin` 설정에서는 커스텀 `SecurityFilterChain` 등록 시 아래와 같은 설정으로 사용할 수 있다.
- 단, 커스텀 로그인 페이지를 사용할 경우에는 제외된다.

```java
// 기본 사용
http.formLogin(Customizer.withDefaults());
    
// 커스텀 하더라도 아래와 같이 loginPage() 메소드를 다루지 않으면 기본 로그인 페이지가 활성화된다
http.formLogin((login) -> login.loginPage("/커스텀경로"));
```

## DefaultLoginPageGeneratingFilter 클래스

```java
public class DefaultLoginPageGeneratingFilter extends GenericFilterBean {

}
```

### 주요 로직 : doFilter

```java
private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws IOException, ServletException {
    
    // Error 파라미터가 있는 경우를 확인한다
    boolean loginError = isErrorPage(request);
    
    // 로그아웃 성공 여부를 확인한다
    boolean logoutSuccess = isLogoutSuccess(request);
    
    // 조건에 맞으면 로그인 페이지 생성 로직을 실행한다
    if (isLoginUrlRequest(request) || loginError || logoutSuccess) {
    
        // 로그인 페이지를 생성한다
        String loginPageHtml = generateLoginPageHtml(request, loginError, logoutSuccess);
        // 헤더 값을 설정하고 응답 본문을 추가한다
        response.setContentType("text/html;charset=UTF-8");
        response.setContentLength(loginPageHtml.getBytes(StandardCharsets.UTF_8).length);
        response.getWriter().write(loginPageHtml);
        return;
    }
    
    // 조건이 아닌 경우 다음 필터를 실행한다
    chain.doFilter(request, response);
}
```

### 로그인 방식에 따라 기본 로그인 페이지가 활성화된다
- form 로그인
- oauth2 로그인
- saml2 로그인

## form 로그인 페이지

### 기본 설정은 GET /login 경로이다. 이 페이지는 다음과 같은 특징을 가진다

- 사용자 이름과 비밀번호 입력 필드를 제공한다.
- 로그인 실패 시 에러 메시지를 표시한다.
- 로그아웃 성공 시 성공 메시지를 표시한다.
- CSRF 토큰이 자동으로 포함된다.

## 필터단에서 페이지를 응답하는 이유

- 컨트롤러와 같은 프레젠테이션 레이어가 아닌 필터단에서 VIEW 를 응답하는 이유는 시큐리티 의존성의 한계 때문이다.
- 시큐리티 의존성 내에서 컨트롤러에 디폴트 페이지가 존재한다면, 커스텀 컨트롤러가 디폴트 컨트롤러를 고려하면서 구현해야 하는 복잡성이 발생한다. 이러한 이유로 필터단에서 직접 구현되어 있다.

### 장점
1. 의존성 분리가 명확하다.
2. 커스텀 구현이 용이하다.
3. 보안 관련 설정이 한 곳에서 관리된다.
