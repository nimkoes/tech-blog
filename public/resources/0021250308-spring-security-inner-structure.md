---
title: "Spring Security 내부 구조 두 번째 시간"
author: "nimkoes"
date: "2025-03-08"
tags: [ "study", "spring", "spring security" ]
---

## SecurityFilterChain 등록

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

## 다수의 SecurityFilterChain 을 설정할 때 주의 사항

- `securityMatchers` 를 서로 다르게 적용하여 중복되는 경로 매핑이 없도록 해야 한다.
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

### Application 구동 결과 오류 메시지

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

### 해결 방법
  - 서로 다른 경로를 매핑 해줘야 애플리케이션이 정상적으로 구동된다.
  - `securityMatcher` 를 반드시 설정해야 하는 것은 아니지만, 중복된 매핑 경로를 사용할 수 없다.

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