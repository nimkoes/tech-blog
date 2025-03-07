---
title: "Spring Security 내부 구조"
description: "내부 구조를 탐구 하면서 알게된 것들"
author: "nimkoes"
date: "2025-03-08"
tags: [ "study", "spring", "spring security" ]
---

# Spring Security 동작 원리 개요

- 클라이언트의 요청은 `WAS`(Web Application Server / ex> `tomcat`) 의 `filter` 를 통과한 다음 `Spring Container`의 `Controller`에 도달한다.
- `WAS` 의 `filter` 에 새로운 `filter` 를 추가하여 요청을 가로챈다.
- 가로챈 요청은 `Spring Container` 내부에 정의한 로직을 통과 한다.
- `Spring Security` 의 로직을 처리한 다음 다시 `WAS` 의 다음 `filter` 로 복귀하여 요청을 처리 한다.

![0020-01](/tech-blog/resources/images/spring-security-inner-structure/0020-01.png)

- `DelegatingFilterProxy`
  - `Spring Security` 의 필터 체인을 `WAS` 의 `Servlet Filter` 로 등록하기 위한 `Spring` 제공 클래스 이다.
  - `WAS`(`Tomcat` 등)에서 `DelegatingFilterProxy` 를 실행하면 `Spring Container` 내부에서 관리하는 필터(`SecurityFilterChain`)로 요청을 위임
    한다,
  - `Spring Context` 내부의 `FilterChainProxy` 를 찾아 실행하는 역할을 한다.
- `FilterChainProxy`
  - `Spring Security` 의 핵심 필터 이다.
  - `DelegatingFilterProxy` 에 의해 실행되며, 내부적으로 여러 개의 `SecurityFilterChain` 을 관리 한다.
- `SecurityFilterChain`
  - 특정 요청(URL 패턴 등)에 대한 보안 규칙을 포함한 필터 모음 이다.
  - `Spring Security Filter` 들의 묶음으로, 실제 로직이 처리 되는 부분 이다.
  - 여러 개의 `SecurityFilterChain` 을 생성하여 URL 패턴별로 다르게 보안 규칙을 적용 할 수 있다.

# SecurityFilterChain 등록

- `Spring Boot` 에서 `spring-boot-starter-security` 의존성을 추가하면 기본적으로 `DefaultSecurityFilterChain` 이 자동으로 생성된다.
- 기본 설정은 모든 요청을 인증해야 하며, `form-based` 로그인 페이지를 제공하는 방식 이다.
- 개발자가 직접 `SecurityFilterChain` 을 등록하지 않으면 `Spring Boot` 의 `SecurityAutoConfiguration` 이 자동으로 적용 된다.
- `SecurityFilterChain` 을 등록하기 위해서는 `SecurityFilterChain` 을 리턴하는 `@Bean` 메소드를 등록 한다.

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Bean
  public SecurityFilterChain securityFilterChain1(HttpSecurity http) throws Exception {
    return http.build();
  }
}
```

- 다수의 `SecurityFilterChain` 을 설정할 때 주의 사항
  - `securityMatchers` 를 서로 다르게 적용하여 중복 되는 경로 매핑이 없도록 해야 한다.
  - 그렇지 않으면 `Spring Boot`가 `anyRequest()` 를 가진 필터 체인을 여러 개 등록하려고 시도하며, 충돌이 발생 한다.
    ```java
      import org.springframework.context.annotation.Bean;
      import org.springframework.context.annotation.Configuration;
      import org.springframework.security.config.annotation.web.builders.HttpSecurity;
      import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
      import org.springframework.security.web.SecurityFilterChain;
    
      @Configuration
      @EnableWebSecurity
      public class SecurityConfig {
      
          @Bean
          public SecurityFilterChain securityFilterChain1(HttpSecurity http) throws Exception {
              return http.build();
          }
      
          @Bean
          public SecurityFilterChain securityFilterChain2(HttpSecurity http) throws Exception {
              return http.build();
          }
      }
    ```

  - application 구동 결과 오류 메시지 일부 발췌
    ```shell
    org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'springSecurityFilterChain': Cannot create inner bean '(inner bean)#665c79a2' while setting constructor argument with key [1]
    ...
    Caused by: org.springframework.beans.factory.BeanCreationException: 
      Error creating bean with name '(inner bean)#665c79a2' defined in
      class path resource [org/springframework/security/config/annotation/web/configuration/WebSecurityConfiguration.class]: 
      Failed to instantiate [jakarta.servlet.Filter]: Factory method 'springSecurityFilterChain' threw exception with message:
     
      A filter chain that matches any request [DefaultSecurityFilterChain defined as 'securityFilterChain1'
      in [class path resource [com/nimkoes/security/config/SecurityConfig.class]] matching [any request] 
      and having filters [DisableEncodeUrl, WebAsyncManagerIntegration, SecurityContextHolder, HeaderWriter, Csrf, Logout, RequestCacheAware, SecurityContextHolderAwareRequest, AnonymousAuthentication, ExceptionTranslation]]
      has already been configured,
    
      which means that this filter chain [DefaultSecurityFilterChain defined as 'securityFilterChain2'
      in [class path resource [com/nimkoes/security/config/SecurityConfig.class]] matching [any request]
      and having filters [DisableEncodeUrl, WebAsyncManagerIntegration, SecurityContextHolder, HeaderWriter, Csrf, Logout, RequestCacheAware, SecurityContextHolderAwareRequest, AnonymousAuthentication, ExceptionTranslation]]
      will never get invoked.
    
      Please use `HttpSecurity#securityMatcher` to ensure that there is only one filter chain configured
      for 'any request' and that the 'any request' filter chain is published last.
    ```
  - 다음과 같이 서로 다른 경로를 매핑 해줘야 애플리케이션이 정상적으로 구동 된다.
  - `securityMatcher` 를 반드시 설정 해야 하는 것은 아니지만, 중복 된 매핑 경로를 사용할 수 없다.
    ```java
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.security.config.annotation.web.builders.HttpSecurity;
    import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
    import org.springframework.security.web.SecurityFilterChain;
    
    @Configuration
    @EnableWebSecurity
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

# SecurityFilterChain 구조

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
- application 구동 후 요청한 결과
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
- 개발자가 `SecurityFilterChain` 을 등록하지 않았을 때 사용하는 기본 `filter`
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
    - URL 인코딩 방지를 위한 필터 (주로 사용되지 않는다.)
  - `WebAsyncManagerIntegrationFilter`
    - 비동기 요청을 처리할 때 `SecurityContext` 를 유지하는 필터
  - `SecurityContextHolderFilter`
    - `SecurityContextHolder` 를 초기화 및 정리하는 필터
  - `HeaderWriterFilter`
    - 보안 관련 HTTP header (`X-Frame-Options`, `X-Content-Type-Options` 등) 를 추가하는 필터
  - `CorsFilter`
    - `Cross-Origin` 요청을 허용하거나 차단하는 `CORS` 정책을 적용하는 필터
  - `CsrfFilter`
    - `CSRF` (Cross-Site Request Forgery) 공격을 방지하는 필터
  - `LogoutFilter`
    - `/logout` 요청을 감지하고, 세션을 무효화하는 로그아웃 처리 필터
  - `UsernamePasswordAuthenticationFilter`
    - 폼 기반 로그인 요청을 처리하는 필터 (`/login`)
  - `DefaultResourcesFilter`
    - 정적 리소스 요청을 보안 정책에 맞게 필터링하는 필터
  - `DefaultLoginPageGeneratingFilter`
    - 기본 로그인 페이지를 자동으로 생성하는 필터
  - `DefaultLogoutPageGeneratingFilter`
    - 기본 로그아웃 페이지를 자동으로 생성하는 필터
  - `BasicAuthenticationFilter`
    - `HTTP basic` 인증을 처리하는 필터
  - `RequestCacheAwareFilter`
    - 보안 컨텍스트에서 이전 요청을 캐싱하여, 인증 후 원래 요청으로 리다이렉트하는 필터
  - `SecurityContextHolderAwareRequestFilter`
    - `HttpServletRequest` 를 보안 컨텍스트 인식 요청 객체로 변환하는 필터
  - `AnonymousAuthenticationFilter`
    - 인증되지 않은 사용자를 자동으로 "익명 사용자" 로 등록하는 필터
  - `ExceptionTranslationFilter`
    - 인증 및 인가 예외를 처리하고, 적절한 응답을 반환하는 필터
  - `AuthorizationFilter`
    - 요청에 대한 권한을 확인하고 접근을 허용 또는 차단 하는 필터
- `SecurityFilterChain` 에 사용자 정의 필터 등록
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

# SecurityContextHolder

# 필터 상속과 요청 전파

# GenericFilterBean, OncePerRequestFilter

# DisableEncodeUrlFilter

# WebAsyncManagerIntegrationFilter

# SecurityContextHolderFilter

# HeaderWriterFilter

# CorsFilter

# CsrfFilter

# LogoutFilter

# UsernamePasswordAuthenticationFilter

# DefaultLoginPageGeneratingFilter

# DefaultLogoutPageGeneratingFilter

# BasicAuthenticationFilter

# RequestCacheAwareFilter

# SecurityContextHolderAwareRequestFilter

# AnonymousAuthenticationFilter

# ExceptionTranslationFilter

# AuthorizationFilter

# SessionManagementConfigurer

