---
title: "Spring Security 내부 구조 스무 번째 시간"
author: "nimkoes"
date: "2025-03-09"
tags: [ "study", "spring", "spring security" ]
---

# AnonymousAuthenticationFilter

## AnonymousAuthenticationFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터이며, 열네 번째에 위치한다.
- `SecurityContext` 가 비어있는 경우 익명 사용자 인증 정보를 제공하는 역할을 한다.

### 주요 특징

- `DefaultSecurityFilterChain` 에 기본 등록
- 커스텀 `SecurityFilterChain` 에도 자동 등록
- `SecurityContext` 가 `null` 일 때 `Anonymous` 인증 정보 생성

## 구현 구조

### 기본 클래스 구조

```java
public class AnonymousAuthenticationFilter extends GenericFilterBean
  implements InitializingBean {
  // 필터 구현
}
```

## 동작 방식

### 1. SecurityContext 확인

- 이전 필터들을 거치면서 인증되지 않은 경우
- `SecurityContext` 가 `null` 인 상황 감지

### 2. 익명 인증 정보 생성

- `AnonymousAuthenticationToken` 생성
- 기본 권한 부여 (보통 `ROLE_ANONYMOUS`)
- `SecurityContext` 에 저장

## 익명 사용자 확인 방법

### 코드 예제

```java
String username = SecurityContextHolder.getContext().getAuthentication().getName();
String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().toString();

System.out.println(username);  // anonymousUser
System.out.println(role);      // [ROLE_ANONYMOUS]
```

## 활용 사례

### 1. 공개 접근 페이지

- 로그인하지 않은 사용자의 접근 허용
- 기본 권한이 필요한 리소스 접근

### 2. 조건부 콘텐츠 표시

- 인증된 사용자와 익명 사용자 구분
- UI 요소의 선택적 표시

## 주요 특징

### 보안 관점

- 모든 요청에 대한 인증 정보 보장
- 익명 사용자에 대한 일관된 처리
- 보안 감사(audit) 지원

### 구현 이점

- null 체크 불필요
- 일관된 인증 객체 처리
- 명확한 익명 사용자 구분

## 실제 구현 예시

### 1. 컨트롤러에서의 활용

```java

@GetMapping("/public")
public String publicPage(Authentication authentication) {
  if (authentication instanceof AnonymousAuthenticationToken) {
    return "익명 사용자 접근";
  }
  return "인증된 사용자 접근";
}
```

### 2. 보안 설정에서의 활용

```java
http
  .authorizeRequests()
    .antMatchers("/public/**").permitAll()
    .antMatchers("/private/**").authenticated().anyRequest().anonymous();
```
