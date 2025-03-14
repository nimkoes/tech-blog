---
title: "Spring Security 내부 구조 아홉 번째 시간"
author: "nimkoes"
date: "2025-03-09"
---

# SecurityContextHolderFilter

## SecurityContextHolderFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되며, 세 번째에 위치한다.
- Security session 방식에서 주로 사용 된다.
- 이전 요청을 통해 인증된 사용자 정보를 현재 요청의 `SecurityContextHolder` 의 `SecurityContext` 에 할당한다.
- 현재 요청이 끝나면 `SecurityContext` 를 초기화하여 다음 요청에서 불필요한 인증 정보를 제거한다.
- 커스텀 `SecurityFilterChain` 을 생성해도 기본적으로 등록되며, 비활성화하려면 아래와 같이 설정하면 된다.

```java

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http.securityContext((context) -> context.disable());
  return http.build();
}
```

- session 방식에서는 중요하게 사용 되고, JWT 토큰을 사용한 방식에서도 직접 사용하지 않더라도 마지막에 `SecurityContext` 를 초기화 하는 구문이 있기 때문에 되도록 disable 하지 않는 게 좋다.

## SecurityContextHolderFilter 클래스

```java
public class SecurityContextHolderFilter extends GenericFilterBean {
  
  // ...
  
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
    throws ServletException, IOException {
    if (request.getAttribute(FILTER_APPLIED) != null) {
      chain.doFilter(request, response);
      return;
    }
    request.setAttribute(FILTER_APPLIED, Boolean.TRUE);
    Supplier<SecurityContext> deferredContext = this.securityContextRepository.loadDeferredContext(request);
    try {
      this.securityContextHolderStrategy.setDeferredContext(deferredContext);
      chain.doFilter(request, response);
    }
    finally {
      this.securityContextHolderStrategy.clearContext();
      request.removeAttribute(FILTER_APPLIED);
    }
  }
  
  // ...
  
}
```

### 기본 동작

1. 사용자가 로그인하고 상태가 `STATELESS` 가 아니라면, 서버의 세션 또는 외부 저장소(예: Redis)에 사용자 정보가 저장됨.
2. 저장된 사용자 정보를 `SecurityContextRepository` 의 `loadDeferredContext()` 메서드를 통해 로드함.
3. 로드된 `SecurityContext` 를 `SecurityContextHolder` 에 저장하고 다음 필터로 넘김.
4. 요청 처리가 완료되면 `finally` 블록에서 `SecurityContextHolder` 를 초기화하여 인증 정보를 제거함.
5. 이전 필터에서 `SecurityContext` 를 설정한 경우, 이를 유지하면서 필터 체인을 실행함.

## SecurityContextRepository 인터페이스와 구현체

- `SecurityContextRepository` 는 사용자 정보를 저장 매체(세션, Redis 등)에서 불러오는 인터페이스다.
- 구현체는 아래와 같다.

| 구현체                                         | 설명                                          |
|---------------------------------------------|---------------------------------------------|
| `HttpSessionSecurityContextRepository`      | 서버 세션 기반 저장소                                |
| `NullSecurityContextRepository`             | 아무 작업을 수행하지 않음 (JWT 기반 `STATELESS` 관리 시 사용) |
| `RequestAttributeSecurityContextRepository` | `HttpServletRequest` 속성 기반 저장소              |
| 기타                                          | 직접 구현 가능                                    |

### 커스텀 `SecurityContextRepository` 등록 방법

- 기본적으로 `HttpSessionSecurityContextRepository` 가 사용되지만, 아래와 같이 설정하여 변경할 수 있다.

```java

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http
    .securityContext((context) -> context
      .securityContextRepository(new RequestAttributeSecurityContextRepository()));

  return http.build();
}
```

- JWT 기반 `STATELESS` 방식에서는 `NullSecurityContextRepository` 를 사용할 수도 있다.

## SecurityContextPersistenceFilter vs SecurityContextHolderFilter 차이

- `SecurityContextPersistenceFilter` 는 `SecurityContextHolderFilter` 의 이전 버전이다.
- Spring Security 5.8 버전부터 `SecurityContextHolderFilter` 로 변경되었으며, 기존 클래스는 `deprecated` 되었다.

### 변경된 부분

| 필터                                 | 설명                                         |
|------------------------------------|--------------------------------------------|
| `SecurityContextPersistenceFilter` | 요청이 끝난 후 변경된 `SecurityContext` 를 저장소에 반영함. |
| `SecurityContextHolderFilter`      | `SecurityContext` 변경 사항을 저장하지 않음.          |

### 변경된 코드 비교

#### SecurityContextPersistenceFilter

```java
finally{
  SecurityContext contextAfterChainExecution = this.securityContextHolderStrategy.getContext();
  this.securityContextHolderStrategy.clearContext();
  this.repo.saveContext(contextAfterChainExecution, holder.getRequest(),holder.getResponse());
  request.removeAttribute(FILTER_APPLIED);
  this.logger.debug("Cleared SecurityContextHolder to complete request");
}
```

- `SecurityContext` 가 변경된 경우, `SecurityContextRepository` 를 통해 저장소에 반영한다.

#### SecurityContextHolderFilter

```java
finally{
  this.securityContextHolderStrategy.clearContext();
  request.removeAttribute(FILTER_APPLIED);
}
```

- 요청이 끝나면 `SecurityContext` 를 초기화하지만, 변경 사항을 저장하지 않는다.

### 변경에 따른 영향

- `SecurityContextHolderFilter` 는 `SecurityContext` 변경 사항을 저장하지 않으므로, 요청 중 `SecurityContext` 가 수정되면 세션이나 Redis 등의 저장소에는 반영되지 않는다.
- 인증 상태를 지속적으로 유지하려면, 별도의 저장 로직을 구현해야 한다.


