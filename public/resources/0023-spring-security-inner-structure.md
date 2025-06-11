---
title: "Spring Security 내부 구조 네 번째 시간"
author: "nimkoes"
date: "2025-03-08"
---

# SecurityContextHolder

## SecurityFilterChain 에서 작업 상태 저장 필요

- `SecurityFilterChain` 내부의 각 필터는 시큐리티 관련 작업을 수행한다.
- 모든 필터는 각기 다른 기능을 수행하며, 앞단에서 수행된 작업의 결과를 뒷단 필터에서 확인할 수 있어야 한다.
- 예를 들어, 인가(Authorization) 필터는 요청을 허용할지 결정하기 위해 인증(Authentication) 필터가 설정한 사용자 권한(ROLE) 정보를 확인해야 한다.

## SecurityContext 와 Authentication 객체

![0023-01](/tech-blog/resources/images/spring-security-inner-structure/0023-01.png)

- `SecurityContextHolder` 는 현재 요청의 보안 컨텍스트(`SecurityContext`)를 관리하는 클래스이다.
- `SecurityContext` 내부에는 인증(Authentication) 객체 가 포함되며, 사용자의 인증 정보와 권한(ROLE) 정보를 저장한다.
- 하나의 `SecurityContextHolder` 는 각 요청(스레드) 마다 하나의 `SecurityContext` 를 관리한다.
- 멀티 스레드 환경에서 각 요청이 개별적인 `SecurityContext` 를 가질 수 있지만, 단일 요청 내에서는 오직 하나의 `SecurityContext` 만 유지된다.
- 하나의 `SecurityContext` 내부에는 하나의 `Authentication` 객체만 저장 된다.

### Authentication 객체의 구성 요소

- `Principal` : 사용자 정보 (ID, 계정 정보 등)
- `Credentials` : 사용자 인증 정보 (비밀번호, 토큰 등)
- `Authorities` : 사용자 권한 목록 (ROLE_USER, ROLE_ADMIN 등)

`SecurityContextHolder` 에서 Authentication 객체 조회 예제

```java
SecurityContextHolder.getContext().getAuthentication().getAuthorities();
```

- `SecurityContextHolder.getContext()` : 현재 스레드의 `SecurityContext` 반환
- `getAuthentication()` : 현재 사용자 인증 정보 반환
- `getAuthorities()` : 사용자 권한(ROLE) 목록 반환

## SecurityContextHolder 의 구조

- `SecurityContextHolder` 는 `static` 메서드로 제공되기 때문에 어디서든 쉽게 접근할 수 있다.
- 하지만 멀티 쓰레드 환경에서는 각 사용자(스레드)마다 개별적인 `SecurityContext` 를 제공해야 한다.
- 이를 위해 `SecurityContextHolder` 는 `SecurityContextHolderStrategy` 인터페이스를 활용하여 `SecurityContext` 의 저장 방식(전략)을 결정한다.

### SecurityContextHolder 기본 구조

```java
public class SecurityContextHolder {
  private static SecurityContextHolderStrategy strategy;

  public static SecurityContext getContext() {
    return strategy.getContext();
  }

  public static void setContext(SecurityContext context) {
    strategy.setContext(context);
  }
}
```

- 내부적으로 `SecurityContextHolderStrategy` 가 `SecurityContext` 를 관리함.

## SecurityContextHolder 의 관리 전략

- `SecurityContextHolder` 는 멀티 쓰레드 환경에서 `SecurityContext` 를 관리하는 전략(`SecurityContextHolderStrategy`)을 위임한다.
- 즉, 사용자별로 독립적인 `SecurityContext` 저장소를 제공해야 하며, 이를 위해 `ThreadLocal` 전략을 기본적으로 사용한다.

### SecurityContextHolderStrategy 구현 종류

- `SecurityContextHolderStrategy` 는 `SecurityContext` 를 저장하는 방식을 결정하는 인터페이스이다.
- `SecurityContextHolder` 는 아래 3가지 전략을 제공한다.

| 전략                                                    | 설명                                     |
|-------------------------------------------------------|----------------------------------------|
| `ThreadLocalSecurityContextHolderStrategy`            | 기본 전략, 요청별(스레드별) 개별 SecurityContext 유지 |
| `InheritableThreadLocalSecurityContextHolderStrategy` | 부모-자식 스레드 간 SecurityContext 상속         |
| `GlobalSecurityContextHolderStrategy`                 | 모든 요청이 동일한 SecurityContext 공유          |

### 전략을 변경하는 코드 예제

```java
SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
```

- 위 설정을 하면, 부모 스레드의 `SecurityContext` 를 자식 스레드에서 상속받아 사용할 수 있다.

## ThreadLocal 방식에서 SecurityContext 관리

- `ThreadLocalSecurityContextHolderStrategy` 는 `ThreadLocal` 을 사용하여 각 요청(스레드) 별로 독립적인 `SecurityContext` 를 유지한다.

## SecurityContext 의 생명주기

- `SecurityContext` 는 사용자의 요청이 들어올 때 생성되며, 응답이 완료되면 초기화(삭제) 된다.
- 즉, 요청-응답 단위로 `SecurityContext` 가 생성되고 제거 된다.
- 필터 체인이 끝난 후에도 `SecurityContext` 가 유지되려면 세션 기반 인증을 사용해야 한다.

### SecurityContext 생성 및 삭제 예제

```java
SecurityContextHolder.getContext().setAuthentication(authentication); // 생성
SecurityContextHolder.clearContext(); // 삭제 (로그아웃 시)
```

- `SecurityContextHolder.clearContext()` 를 호출하면, `SecurityContext` 가 초기화 된다.

## SecurityContextHolder 를 static 으로 제공하는 이유

1. `SecurityContext`는 요청(스레드) 단위로 관리되어야 한다.
   - `Spring Bean` 은 싱글톤(Singleton)으로 관리되므로, 모든 요청에서 동일한 `SecurityContext` 를 공유하게 되어 문제가 발생 한다.
   - `ThreadLocal` 을 사용하면, 요청(스레드) 별로 독립적인 `SecurityContext` 를 유지할 수 있다.
2. `Spring Security` 는 `Servlet Filter` 기반으로 동작한다.
   - `Servlet Filter` 는 `Spring` 의 `@Bean` 기반 의존성 주입을 받지 않기 때문에, `SecurityContext` 를 `static` 으로 관리하여 어디서든 접근할 수 있도록 설계되었다.

## SecurityContextHolder 의 활용 예시

### 로그인 필터

- 로그인 필터에서 사용자 인증이 완료되면 `SecurityContext` 에 `Authentication` 객체를 저장한다.

### 로그인 필터 예제

```java
Authentication authentication = new UsernamePasswordAuthenticationToken(user, password, authorities);
SecurityContextHolder.getContext().setAuthentication(authentication);
```

- 로그인 성공 시, `SecurityContext` 에 `Authentication` 객체를 저장 한다.

### 로그아웃 필터

- 로그아웃 시 `SecurityContext` 를 초기화 하여 사용자 인증 정보를 제거한다.

### 로그아웃 필터 예제

```java
SecurityContextHolder.clearContext();
```

- SecurityContext를 초기화하여 사용자 인증 정보를 삭제 한다.
