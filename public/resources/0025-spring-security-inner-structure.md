# GenericFilterBean 과 OncePerRequestFilter

## GenericFilterBean vs OncePerRequestFilter

- `SecurityFilterChain` 에 등록된 필터는 GenericFilterBean 기반과 OncePerRequestFilter 기반으로 나뉜다.
- 두 방식의 차이는 "한 번의 클라이언트 요청" 기준에서 동작 방식이 다르다는 점이다.

| 필터 종류                | 실행 방식                 |
|----------------------|-----------------------|
| GenericFilterBean    | 같은 요청에서 여러 번 실행될 수 있음 |
| OncePerRequestFilter | 같은 요청에서 한 번만 실행됨      |

---

### GenericFilterBean 의 동작 방식

- 요청이 같은 필터를 여러 번 통과할 경우, 통과한 횟수만큼 실행된다.
- 즉, 클라이언트의 한 번 요청에 대해 여러 번 필터가 실행될 수 있다.

### Custom GenericFilterBean 예제

```java
package io.github.nimkoes.ssis.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

public class CustomGenericFilter extends GenericFilterBean {
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    System.out.println("CustomGenericFilter");
    chain.doFilter(request, response);
  }
}

```

### OncePerRequestFilter 의 동작 방식

- 요청이 같은 필터를 여러 번 통과하더라도, 첫 번째 요청에서만 실행됨.
- 중복 실행을 방지하고 한 번만 실행되도록 보장하는 필터.

### Custom OncePerRequestFilter 예제

```java
package io.github.nimkoes.ssis.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class CustomOnceFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    System.out.println("CustomOnceFilter");
    filterChain.doFilter(request, response);
  }
}

```

같은 요청에서 여러 번 필터를 통과하더라도, 한 번만 실행됨.

## 대부분의 블로그가 잘못 적은 내용

- 많은 블로그에서 `OncePerRequestFilter` 가 리디렉트(302 응답)에서도 한 번만 실행된다고 설명하지만, 이는 잘못된 정보다.
- 리디렉트(302 응답)와 Forward 의 차이를 이해해야 한다.

| 상태                | OncePerRequestFilter 실행 여부 |
|-------------------|----------------------------|
| Forward           | 한 번만 실행됨                   |
| Redirect (302 응답) | 새 요청이므로 다시 실행됨             |

## 각 상태에서 필터의 동작 방식

### 예제 코드

`SecurityConfig.java`

```java
package io.github.nimkoes.ssis.config;

import io.github.nimkoes.ssis.filter.CustomGenericFilter;
import io.github.nimkoes.ssis.filter.CustomOnceFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutFilter;

@Configuration
@EnableWebSecurity(debug = true)
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
      .addFilterAfter(new CustomGenericFilter(), LogoutFilter.class)
      .addFilterAfter(new CustomOnceFilter(), LogoutFilter.class);

    return http.build();
  }
}

```

`SampleController.java`

```java
package io.github.nimkoes.ssis.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class SampleController {

  @GetMapping("/test-filter-before-forward")
  public String beforeForward() {
    return "forward:/test-filter-after";
  }

  @GetMapping("/test-filter-before-redirect")
  public String beforeRedirect() {
    return "redirect:/test-filter-after";
  }

  @GetMapping("/test-filter-after")
  @ResponseBody
  public String after() {
    return "hello security!";
  }
}
```

## Forward 상태

- Forward 는 서버 내부에서 다른 URL로 요청을 넘기는 방식이다.
- 클라이언트의 요청은 여전히 한 번이므로, `OncePerRequestFilter` 도 한 번만 실행된다.

![0025-01](/tech-blog/resources/images/spring-security-inner-structure/0025-01.png)

```http request
### forward
GET localhost:8080/test-filter-before-forward
```

```shell
2025-03-09T13:38:45.081+09:00  INFO 93807 --- [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2025-03-09T13:38:45.081+09:00  INFO 93807 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2025-03-09T13:38:45.082+09:00  INFO 93807 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 1 ms
2025-03-09T13:38:45.088+09:00 DEBUG 93807 --- [nio-8080-exec-1] o.s.security.web.FilterChainProxy        : Securing GET /test-filter-before-forward
CustomGenericFilter
CustomOnceFilter
2025-03-09T13:38:45.091+09:00 DEBUG 93807 --- [nio-8080-exec-1] o.s.security.web.FilterChainProxy        : Secured GET /test-filter-before-forward
2025-03-09T13:38:45.112+09:00 DEBUG 93807 --- [nio-8080-exec-1] o.s.security.web.FilterChainProxy        : Securing GET /test-filter-after
CustomGenericFilter
2025-03-09T13:38:45.112+09:00 DEBUG 93807 --- [nio-8080-exec-1] o.s.security.web.FilterChainProxy        : Secured GET /test-filter-after
2025-03-09T13:38:45.118+09:00 DEBUG 93807 --- [nio-8080-exec-1] o.s.s.w.a.AnonymousAuthenticationFilter  : Set SecurityContextHolder to anonymous SecurityContext
```

## Redirect 상태

- Redirect(302 응답)는 서버가 클라이언트에게 새로운 요청을 보내도록 지시하는 방식이다.
- 클라이언트가 다시 요청을 보내므로, `OncePerRequestFilter` 가 다시 실행된다.

![0025-02](/tech-blog/resources/images/spring-security-inner-structure/0025-02.png)

```http request
### forward
GET localhost:8080/test-filter-before-redirect
```

```shell
2025-03-09T13:38:50.952+09:00 DEBUG 93807 --- [nio-8080-exec-2] o.s.security.web.FilterChainProxy        : Securing GET /test-filter-before-redirect
CustomGenericFilter
CustomOnceFilter
2025-03-09T13:38:50.952+09:00 DEBUG 93807 --- [nio-8080-exec-2] o.s.security.web.FilterChainProxy        : Secured GET /test-filter-before-redirect
2025-03-09T13:38:50.955+09:00 DEBUG 93807 --- [nio-8080-exec-2] o.s.s.w.a.AnonymousAuthenticationFilter  : Set SecurityContextHolder to anonymous SecurityContext
2025-03-09T13:38:50.971+09:00 DEBUG 93807 --- [nio-8080-exec-3] o.s.security.web.FilterChainProxy        : Securing GET /test-filter-after
CustomGenericFilter
CustomOnceFilter
2025-03-09T13:38:50.971+09:00 DEBUG 93807 --- [nio-8080-exec-3] o.s.security.web.FilterChainProxy        : Secured GET /test-filter-after
2025-03-09T13:38:50.972+09:00 DEBUG 93807 --- [nio-8080-exec-3] o.s.s.w.a.AnonymousAuthenticationFilter  : Set SecurityContextHolder to anonymous SecurityContext
```
