---
title: "Spring Security 내부 구조 세 번째 시간"
author: "nimkoes"
date: "2025-03-08"
---

## SecurityFilterChain 구조

- `@EnableWebSecurity` 에 `debug` 모드를 `true` 로 설정하면, 요청이 통과하는 `SecurityFilterChain` 의 `filter` 목록이 출력 된다.
- `Spring Security` 디버깅을 활성화하는 옵션으로, 개발 환경에서만 사용해야 한다.
- `debug` 모드의 기본값은 `false` 이다.

```java
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.security.config.annotation.web.builders.HttpSecurity;
  import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
  import org.springframework.security.web.SecurityFilterChain;
  
  @Configuration
  @EnableWebSecurity(debug = true)
  public class SecurityConfig {
  @Bean
  public SecurityFilterChain securityFilterChain1(HttpSecurity http) throws Exception {
  http.securityMatcher("/user");
  return http.build();
  }
  
      @Bean
      public SecurityFilterChain securityFilterChain2(HttpSecurity http) throws Exception {
          http.securityMatcher("/admin");
          return http.build();
      }
  }
```

### application 구동 후 요청한 결과

```shell
  2025-03-08T00:46:21.148+09:00  INFO 44398 --- [] [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 1 endpoint beneath base path '/actuator'
  2025-03-08T00:46:21.184+09:00  WARN 44398 --- [] [           main] o.s.s.c.a.web.builders.WebSecurity       :
    
  ********************************************************************
  **********        Security debugging is enabled.       *************
  **********    This may include sensitive information.  *************
  **********      Do not use in a production system!     *************
  ********************************************************************
    
    
  2025-03-08T00:46:21.391+09:00  INFO 44398 --- [] [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path '/'
  2025-03-08T00:46:21.398+09:00  INFO 44398 --- [] [           main] com.nimkoes.security     : Started Application in 1.704 seconds (process running for 2.058)
  2025-03-08T00:46:21.557+09:00  INFO 44398 --- [] [on(2)-127.0.0.1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
  2025-03-08T00:46:21.557+09:00  INFO 44398 --- [] [on(2)-127.0.0.1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
  2025-03-08T00:46:21.558+09:00  INFO 44398 --- [] [on(2)-127.0.0.1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 1 ms
  2025-03-08T00:48:50.772+09:00  INFO 44398 --- [] [nio-8080-exec-1] Spring Security Debugger                 :
    
  ************************************************************
    
  Request received for GET '/user':
    
  org.apache.catalina.connector.RequestFacade@9fc0b4c
    
  servletPath:/user
  pathInfo:null
  headers:
  user-agent: IntelliJ HTTP Client/IntelliJ IDEA 2024.3.1
  accept-encoding: br, deflate, gzip, x-gzip
  accept: */*
  host: localhost:8080
    
    
  Security filter chain: [
  DisableEncodeUrlFilter
  WebAsyncManagerIntegrationFilter
  SecurityContextHolderFilter
  HeaderWriterFilter
  CsrfFilter
  LogoutFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  AnonymousAuthenticationFilter
  ExceptionTranslationFilter
  ]
    
    
  ************************************************************
```

### SecurityFilterChain 을 등록하지 않았을 때 사용하는 기본 filter

```shell
  Security filter chain: [
  DisableEncodeUrlFilter
  WebAsyncManagerIntegrationFilter
  SecurityContextHolderFilter
  HeaderWriterFilter
  CorsFilter
  CsrfFilter
  LogoutFilter
  UsernamePasswordAuthenticationFilter
  DefaultResourcesFilter
  DefaultLoginPageGeneratingFilter
  DefaultLogoutPageGeneratingFilter
  BasicAuthenticationFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  AnonymousAuthenticationFilter
  ExceptionTranslationFilter
  AuthorizationFilter
  ]
```

- `DisableEncodeUrlFilter`
URL 인코딩 방지를 위한 필터 (주로 사용되지 않는다.)
- `WebAsyncManagerIntegrationFilter`
 비동기 요청을 처리할 때 `SecurityContext` 를 유지하는 필터
- `SecurityContextHolderFilter`
 `SecurityContextHolder` 를 초기화 및 정리하는 필터
- `HeaderWriterFilter`
 보안 관련 HTTP header (`X-Frame-Options`, `X-Content-Type-Options` 등) 를 추가하는 필터
- `CorsFilter`
 `Cross-Origin` 요청을 허용하거나 차단하는 `CORS` 정책을 적용하는 필터
- `CsrfFilter`
 `CSRF` (Cross-Site Request Forgery) 공격을 방지하는 필터
- `LogoutFilter`
 `/logout` 요청을 감지하고, 세션을 무효화하는 로그아웃 처리 필터
- `UsernamePasswordAuthenticationFilter`
 폼 기반 로그인 요청을 처리하는 필터 (`/login`)
- `DefaultResourcesFilter`
 정적 리소스 요청을 보안 정책에 맞게 필터링하는 필터
- `DefaultLoginPageGeneratingFilter`
 기본 로그인 페이지를 자동으로 생성하는 필터
- `DefaultLogoutPageGeneratingFilter`
 기본 로그아웃 페이지를 자동으로 생성하는 필터
- `BasicAuthenticationFilter`
 `HTTP basic` 인증을 처리하는 필터
- `RequestCacheAwareFilter`
 보안 컨텍스트에서 이전 요청을 캐싱하여, 인증 후 원래 요청으로 리다이렉트하는 필터
- `SecurityContextHolderAwareRequestFilter`
 `HttpServletRequest` 를 보안 컨텍스트 인식 요청 객체로 변환하는 필터
- `AnonymousAuthenticationFilter`
 인증되지 않은 사용자를 자동으로 "익명 사용자" 로 등록하는 필터
- `ExceptionTranslationFilter`
 인증 및 인가 예외를 처리하고, 적절한 응답을 반환하는 필터
- `AuthorizationFilter`
 요청에 대한 권한을 확인하고 접근을 허용 또는 차단 하는 필터


## SecurityFilterChain 에 사용자 정의 필터 등록

  ```java
  package com.nimkoes.security.config;
  
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.security.config.annotation.web.builders.HttpSecurity;
  import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
  import org.springframework.security.web.SecurityFilterChain;
  
  @Configuration
  @EnableWebSecurity(debug = true)
  public class SecurityConfig {
      @Bean
      public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // 특정 필터 이전에 사용자 정의 필터 추가
        http.addFilterBefore(new CustomFilter(), UsernamePasswordAuthenticationFilter.class);

        // 특정 필터 위치에 사용자 정의 필터 추가
        http.addFilterAt(new CustomFilter(), BasicAuthenticationFilter.class);

        // 특정 필터 이후에 사용자 정의 필터 추가
        http.addFilterAfter(new CustomFilter(), ExceptionTranslationFilter.class);
  
        return http.build();
      }
  }
  ```
