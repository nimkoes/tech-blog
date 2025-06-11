# DefaultLogoutPageGeneratingFilter

## DefaultLogoutPageGeneratingFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터로 열 번째에 위치한다.
- 이 필터가 등록되는 목적은 `GET /logout` 경로에 대해 기본 로그아웃 페이지를 응답하는 역할을 수행한다.
- 이 필터는 여러 로그인 설정에 의존한다. `formLogin` 설정에서는 커스텀 `SecurityFilterChain` 등록 시 아래와 같은 설정으로 사용할 수 있다.

```java
// 기본 사용
http.formLogin(Customizer.withDefaults());
```

## DefaultLogoutPageGeneratingFilter 클래스

```java
public class DefaultLogoutPageGeneratingFilter extends OncePerRequestFilter {

}
```

### 주요 로직 : doFilterInternal

```java
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain)
  throws ServletException, IOException {
  if (this.matcher.matches(request)) {
    renderLogout(request, response);
  } else {
    if (logger.isTraceEnabled()) {
      logger.trace(LogMessage.format(
        "Did not render default logout page since request did not match [%s]",
        this.matcher));
    }
    filterChain.doFilter(request, response);
  }
}
```

## 로그아웃 페이지

### 기본 설정은 GET /logout 경로이다. 이 페이지는 다음과 같은 특징을 가진다

- Bootstrap 기반의 반응형 디자인을 사용한다.
- CSRF 토큰이 자동으로 포함된다.
- 로그아웃 확인 메시지를 표시한다.
- POST 방식으로 로그아웃을 처리한다.

## 성능 최적화를 위한 구현

### DefaultLogoutPageGeneratingFilter 는 HTML 페이지 생성 시 성능을 고려하여 StringBuilder 를 사용한다.

- 문자열 연산의 효율성 향상
- 메모리 사용량 최적화
- GC 부하 감소

```java
private void renderLogout(HttpServletRequest request, HttpServletResponse response)
  throws IOException {
  StringBuilder sb = new StringBuilder();
  sb.append("<!DOCTYPE html>\n");
  sb.append("<html lang=\"en\">\n");
  sb.append("  <head>\n");
  sb.append("    <meta charset=\"utf-8\">\n");
  // ... 중략 ...
  sb.append("</html>");

  response.setContentType("text/html;charset=UTF-8");
  response.getWriter().write(sb.toString());
}
```

### 구현상의 특징

- Bootstrap 프레임워크 활용
  - 반응형 디자인 지원
  - CDN을 통한 리소스 제공
- 보안 설정
  - CSRF 토큰 자동 포함
  - POST 방식의 로그아웃 처리
  - XSS 방지를 위한 적절한 인코딩
- 사용자 경험
  - 직관적인 UI 제공
  - 명확한 로그아웃 확인 메시지
  - 모바일 환경 지원
