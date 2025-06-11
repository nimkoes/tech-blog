# CsrfFilter

## CSRF 공격

- `CSRF`(Cross-Site Request Forgery)는 사용자의 의지와 무관하게 해커가 사용자의 브라우저를 통해 서버로 특정 요청을 보내도록 하는 공격 방식이다.
- 예를 들어 사용자가 로그인된 상태에서 악성 웹사이트에 방문하면, 해당 사이트가 사용자의 세션을 이용하여 특정 요청을 실행할 수 있다.
- 주로 서버가 session 방식으로 운영 중일 때 사용 된다.
- session 방식은 브라우저의 쿠키 값을 가지고 서버 측에 요청을 하면, 별다른 인증 절차 없이 요청을 처리하기 때문이다.
- JWT 토큰을 사용 할 경우 해커가 `header` 의 JWT 토큰을 삽입하기가 어렵지만, session 방식에서는 데이터 변조 요청만 보내면 된다. 

## CsrfFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되며, 여섯 번째에 위치한다.
- CSRF 공격을 방어하기 위해 HTTP 메소드 중 `GET`, `HEAD`, `TRACE`, `OPTIONS` 를 제외한 요청에 대해 검증을 수행한다.
- Spring Security 는 CSRF 보호를 위해 토큰 방식 을 사용한다.
- 서버는 요청 시 CSRF 토큰을 저장한 후 클라이언트에게 전달하며, 이후 요청이 들어오면 저장된 토큰과 비교하여 검증을 수행한다.
- 커스텀 `SecurityFilterChain` 을 생성해도 기본적으로 등록되며, 비활성화하려면 아래와 같이 설정할 수 있다.

```java
http.csrf((csrf) ->csrf.disable());
```

- 하지만 보안 취약점이 발생할 수 있기 때문에 필요하지 않은 경우에만 비활성화해야 한다.

## CsrfFilter 클래스

```java
public final class CsrfFilter extends OncePerRequestFilter {

}
```

### 주요 로직: doFilterInternal

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
  throws ServletException, IOException {

  // 1. CSRF 토큰을 저장소(tokenRepository)에서 로드 (이전 요청에서 저장된 토큰을 가져옴)
  DeferredCsrfToken deferredCsrfToken = this.tokenRepository.loadDeferredToken(request, response);

  // 2. 로드한 CSRF 토큰을 request 객체의 속성(Attribute)으로 저장
  //      → 이후의 필터나 컨트롤러에서 CSRF 토큰에 접근할 수 있도록 함
  request.setAttribute(DeferredCsrfToken.class.getName(), deferredCsrfToken);

  // 3. CSRF 요청 처리 핸들러(requestHandler)를 사용하여 요청을 수정
  //      → 예를 들어, 요청에 CSRF 토큰을 추가하거나 다른 설정을 적용할 수 있음
  this.requestHandler.handle(request, response, deferredCsrfToken::get);

  // 4. 현재 요청이 CSRF 보호가 필요 없는 HTTP 메소드인지 확인
  //      (예: GET, HEAD, OPTIONS 같은 안전한 요청이면 보호할 필요 없음)
  if (!this.requireCsrfProtectionMatcher.matches(request)) {
    // 4-1. 디버깅을 위한 로그 출력 (TRACE 레벨 로그가 활성화된 경우만 실행)
    if (this.logger.isTraceEnabled()) {
      this.logger.trace("Did not protect against CSRF since request did not match "
        + this.requireCsrfProtectionMatcher);
    }

    // 4-2. CSRF 검증을 하지 않고 필터 체인의 다음 단계로 진행
    filterChain.doFilter(request, response);
    return; // CSRF 보호가 필요 없으므로 여기서 종료
  }

  // 5. 클라이언트가 보낸 CSRF 토큰과 서버가 저장한 CSRF 토큰 가져오기
  CsrfToken csrfToken = deferredCsrfToken.get(); // 서버가 저장한 CSRF 토큰
  String actualToken = this.requestHandler.resolveCsrfTokenValue(request, csrfToken); // 클라이언트가 보낸 CSRF 토큰 값

  // 6. 서버가 저장한 CSRF 토큰과 클라이언트가 보낸 토큰을 비교 (CSRF 공격 방지)
  if (!equalsConstantTime(csrfToken.getToken(), actualToken)) {
    // 6-1. 클라이언트가 CSRF 토큰을 아예 보내지 않았을 경우
    boolean missingToken = deferredCsrfToken.isGenerated();

    // 6-2. CSRF 토큰이 유효하지 않다는 디버깅 로그 출력
    this.logger.debug(LogMessage.of(() ->
      "Invalid CSRF token found for " + UrlUtils.buildFullRequestUrl(request)));

    // 6-3. 클라이언트가 보낸 토큰이 아예 없는 경우 (새로 생성된 토큰)
    //      → `MissingCsrfTokenException` 발생
    //      그렇지 않다면 `InvalidCsrfTokenException` 발생 (값은 있지만 잘못된 경우)
    AccessDeniedException exception = (!missingToken)
      ? new InvalidCsrfTokenException(csrfToken, actualToken)
      : new MissingCsrfTokenException(actualToken);

    // 6-4. 접근 거부 예외를 처리 (403 Forbidden 응답 반환)
    this.accessDeniedHandler.handle(request, response, exception);
    return; // CSRF 검증 실패로 요청 차단
  }

  // 7. CSRF 검증이 통과되었으면 다음 필터로 요청을 전달
  filterChain.doFilter(request, response);
}
```

### 동작 방식

1. `CsrfFilter` 가 실행되면 `CsrfTokenRepository` 에서 CSRF 토큰을 로드한다.
2. `GET`, `HEAD`, `TRACE`, `OPTIONS` 요청이면 필터를 통과시킨다.
3. 클라이언트가 보낸 CSRF 토큰과 서버에 저장된 토큰을 비교하여 검증을 수행한다.
4. 토큰이 일치하지 않으면 `AccessDeniedException` 을 발생시킨다.
5. 검증이 통과되면 다음 필터로 요청을 전달한다.

## CsrfTokenRepository

- CSRF 토큰의 생성 및 관리는 `CsrfTokenRepository` 인터페이스를 구현한 클래스에 의해 수행된다.

| 구현체                              | 설명                       |
|----------------------------------|--------------------------|
| `HttpSessionCsrfTokenRepository` | 서버 세션에 CSRF 토큰을 저장 (기본값) |
| `CookieCsrfTokenRepository`      | 쿠키에 CSRF 토큰을 저장          |
| 직접 구현 가능                         | 필요에 따라 커스텀 저장소 구현 가능     |

### 토큰 저장소 설정

```java
http.csrf((csrf) ->csrf.csrfTokenRepository(new HttpSessionCsrfTokenRepository()));
```

## CSRF 토큰 클라이언트로 발급

- 기본적으로 Spring Security 는 SSR 기반의 세션 방식 에서 CSRF 토큰을 자동으로 처리한다.
- `STATELESS REST API` 에서는 CSRF 토큰을 사용할 일이 거의 없다.
- CSRF 토큰을 사용하려면 HTML `form` 내부에 `_csrf` 값을 포함해야 한다.

```html

<form action="/submit" method="POST">
  <input type="hidden" name="_csrf" value="서버에서 발급한 CSRF 토큰">
  <button type="submit">전송</button>
</form>
```

## CSRF Referer 방식

- `STATELESS` 한 API 서버에서는 `JSESSIONID` 와 같은 세션이 없기 때문에 CSRF 공격의 위험이 상대적으로 낮다.
- 따라서 일반적으로 API 서버에서는 CSRF 보호를 비활성화한다.
- 하지만 JWT 토큰을 쿠키에 저장 하는 경우, CSRF 공격의 위험이 존재할 수 있다.
- 이를 방지하기 위해 토큰 방식 대신 HTTP Referer 검증 방식 을 사용할 수 있다.
- HTTP Referer 헤더를 통해 요청의 출발점을 검증하여 CSRF 공격을 방어한다.
