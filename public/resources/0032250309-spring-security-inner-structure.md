---
title: "Spring Security 내부 구조 열 세 번째 시간"
author: "nimkoes"
date: "2025-03-09"
tags: [ "study", "spring", "spring security" ]
---

# LogoutFilter

## LogoutFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터로 일곱 번째에 위치한다.
- 이 필터가 등록되는 목적은 인증 후 생성되는 사용자 식별 정보에 대해 로그아웃 핸들러를 돌며 로그아웃을 수행하는 필터이다.
- 기본적으로 세션 방식에 대한 로그아웃 설정이 되어 있기 때문에 JWT 방식이나 추가할 로직이 많을 경우 커스텀해야 한다.
- 커스텀 `SecurityFilterChain` 을 생성해도 기본적으로 등록되며, 비활성화하려면 아래와 같이 설정할 수 있다.

```java
http.logout((logout) ->logout.disable());
```

- 커스텀한 `LogoutFilter` 가 있는 경우 기본 제공되는 필터를 비활성화 처리 해야 한다.

## LogoutFilter 클래스

```java
public class LogoutFilter extends GenericFilterBean {

}
```

### 주요 로직 : doFilter

```java
private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
  throws IOException, ServletException {

  // 로그아웃 요청인지 확인
  if (requiresLogout(request, response)) {
    Authentication auth = this.securityContextHolderStrategy.getContext().getAuthentication();
    if (this.logger.isDebugEnabled()) {
      this.logger.debug(LogMessage.format("Logging out [%s]", auth));
    }

    // 등록된 로그아웃 핸들러들을 동작
    this.handler.logout(request, response, auth);

    // 로그아웃 핸들러 수행 후 성공 핸들러 동작
    this.logoutSuccessHandler.onLogoutSuccess(request, response, auth);

    // 종료
    return;
  }
  // 로그아웃 요청이 아니면 다음 필터로
  chain.doFilter(request, response);
}
```

## handler 는?

- `CompositeLogoutHandler` 클래스에서 등록되어 있는 모든 로그아웃 핸들러는 순회하면서 로그아웃을 수행한다.
- 

```java
public final class CompositeLogoutHandler implements LogoutHandler {

  private final List<LogoutHandler> logoutHandlers;

  public CompositeLogoutHandler(LogoutHandler... logoutHandlers) {
    Assert.notEmpty(logoutHandlers, "LogoutHandlers are required");
    this.logoutHandlers = Arrays.asList(logoutHandlers);
  }

  public CompositeLogoutHandler(List<LogoutHandler> logoutHandlers) {
    Assert.notEmpty(logoutHandlers, "LogoutHandlers are required");
    this.logoutHandlers = logoutHandlers;
  }

  @Override
  public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
    for (LogoutHandler handler : this.logoutHandlers) {
      handler.logout(request, response, authentication);
    }
  }
}
```

## Logout 핸들러

```java
public interface LogoutHandler {
  void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication);
}
```

- 로그아웃 핸들러들은 위와 같은 LogoutHandler 인터페이스를 구현한 구현 클래스들로 이루어져 있으며 커스텀 핸들러 생성시에도 위 인터페이스 기반으로 작성해야 한다.

 ### 기본 제공 핸들러

- `SecurityContextLogoutHandler` : `SecurityContextHolder` 에 존재하는 `SecurityContext` 초기화
- `CookieClearingLogoutHandler` : `SecurityFilterChain` 의 logout 메소드에서 지정한 쿠키 삭제
- `HeaderWriterLogoutHandler` : 클라이언트에게 반환될 헤더 조작
- `LogoutSuccessEventPublishingLogoutHandler` : 로그아웃 성공 후 특정 이벤트 실행

## 커스텀 Logout 핸들러

- 기본적으로 제공하지만 등록되어 있지 않거나, 커스텀해서 만든 핸들러를 등록하는 방법은 아래 메소드를 활용한다.

```java
CookieClearingLogoutHandler cookies = new CookieClearingLogoutHandler("our-custom-cookie");
http.logout((logout) ->logout.addLogoutHandler(cookies));
```

## Logout 성공 핸들러

- 로그아웃이 성공한 뒤 URL 리디렉션과 같은 특정 작업을 수행하기 위한 핸들러로 위의 Logout 핸들러와 다르다.

```java
public interface LogoutSuccessHandler {
  void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
    throws IOException, ServletException;
}
```
