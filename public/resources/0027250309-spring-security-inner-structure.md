---
title: "Spring Security 내부 구조 여덟 번째 시간"
author: "nimkoes"
date: "2025-03-09"
tags: [ "study", "spring", "spring security" ]
---

# WebAsyncManagerIntegrationFilter

## WebAsyncManagerIntegrationFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터이며, 두 번째에 위치한다.
- 비동기 요청이 발생할 경우, 기존의 `SecurityContext` 를 새로운 비동기 쓰레드에서도 동일하게 유지할 수 있도록 도와준다.
- 기본적으로 `SecurityContextHolder` 는 `ThreadLocal` 전략을 사용하여 동일한 쓰레드에서만 `SecurityContext` 를 공유할 수 있다.
- 하지만 비동기 방식에서는 하나의 작업을 두 개의 쓰레드에서 수행하기 때문에, 기존 `SecurityContext` 를 유지하는 추가적인 처리가 필요하다.
- `WebAsyncManagerIntegrationFilter` 는 비동기 작업을 수행하는 쓰레드에서도 `SecurityContext` 를 유지하도록 보장한다.

## ThreadLocal 전략이 필요한 이유

- `SecurityContextHolder` 는 기본적으로 `ThreadLocal` 전략을 사용하여 각 요청(쓰레드)마다 독립적인 `SecurityContext` 를 관리한다.
- `ThreadLocal` 은 현재 쓰레드에 데이터를 저장할 수 있지만, 새로운 쓰레드에서는 기존 데이터를 참조할 수 없다.
- 즉, 비동기 작업을 수행하는 새로운 쓰레드는 기존의 `SecurityContext` 를 사용할 수 없다.
- 이를 해결하기 위해 `WebAsyncManagerIntegrationFilter` 가 동작하여 비동기 쓰레드에서도 `SecurityContext` 를 유지한다.

## Callable 사용 시 쓰레드 동작 방식

- `Callable` 인터페이스를 사용하면 일부 로직이 새로운 쓰레드에서 실행된다.
- 아래 코드에서 `return () -> { ... }` 부분이 새로운 쓰레드에서 실행된다.

```java
@GetMapping("/async")
@ResponseBody
public Callable<String> asyncPage() {
  System.out.println("start: " + SecurityContextHolder.getContext().getAuthentication().getName());

  return () -> {
    Thread.sleep(4000);
    System.out.println("end: " + SecurityContextHolder.getContext().getAuthentication().getName());
    return "async";
  };
}
```

### 동작 방식

1. 컨트롤러가 실행되면서 현재 쓰레드에서 `SecurityContext` 를 참조 한다.
2. `Callable` 내부의 코드가 실행될 때, 새로운 쓰레드에서 수행 된다.
3. 기본적으로 `ThreadLocal` 전략을 사용하는 `SecurityContextHolder` 는 새로운 쓰레드에서 기존 `SecurityContext` 를 참조할 수 없다.
4. `WebAsyncManagerIntegrationFilter` 가 이 문제를 해결하여 새로운 쓰레드에서도 기존 `SecurityContext` 를 유지하도록 보장 한다.

## 서블릿에서 비동기 요청이 발생할 때 필터는 어떻게 판단하는가?

- `WebAsyncManagerIntegrationFilter` 는 필터 체인의 일부로 실행되지만, 비동기 처리는 컨트롤러 내부에서 이루어진다.
- 그러면 필터는 어떻게 컨트롤러 내부에서 발생하는 비동기 작업을 감지하고 처리할 수 있을까?

### 해결 방법

- `WebAsyncManagerIntegrationFilter` 는 실제로 `SecurityContext` 를 유지하는 인터셉터(`SecurityContextCallableProcessingInterceptor`)를 `WebAsyncManager` 에 등록하는 역할을 한다.
- 이후 서블릿 컨테이너가 비동기 요청을 처리할 때 `WebAsyncManager` 가 기존 `SecurityContext` 를 새로운 쓰레드로 전달하게 된다.

## WebAsyncManagerIntegrationFilter 내부 동작 방식

- 이 필터는 `SecurityContextCallableProcessingInterceptor` 를 `WebAsyncManager` 에 등록한다.

```java
public final class WebAsyncManagerIntegrationFilter extends OncePerRequestFilter {

  private static final Object CALLABLE_INTERCEPTOR_KEY = new Object();

  private SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder
    .getContextHolderStrategy();

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {

    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
    SecurityContextCallableProcessingInterceptor securityProcessingInterceptor =
      (SecurityContextCallableProcessingInterceptor) asyncManager.getCallableInterceptor(CALLABLE_INTERCEPTOR_KEY);

    if (securityProcessingInterceptor == null) {
      SecurityContextCallableProcessingInterceptor interceptor = new SecurityContextCallableProcessingInterceptor();
      interceptor.setSecurityContextHolderStrategy(this.securityContextHolderStrategy);
      asyncManager.registerCallableInterceptor(CALLABLE_INTERCEPTOR_KEY, interceptor);
    }

    filterChain.doFilter(request, response);
  }
}
```

### 핵심 동작 과정

1. `WebAsyncManager` 를 가져와 `SecurityContextCallableProcessingInterceptor` 가 이미 등록되어 있는지 확인.
2. 등록되어 있지 않다면 현재 쓰레드의 `SecurityContext` 를 유지할 수 있도록 인터셉터를 추가.
3. 이후 `WebAsyncManager` 는 새로운 비동기 쓰레드에서도 기존 `SecurityContext` 를 유지할 수 있도록 처리.

## Callable 의 동작 방식과 DispatcherServlet

- 사용자의 요청이 들어오면 필터 체인을 통과한 후 `DispatcherServlet` 이 컨트롤러로 전달한다.
- 컨트롤러에서 `Callable` 을 반환하면 `DispatcherServlet` 은 이를 `WebAsyncManager` 로 넘긴다.
- 이후 `WebAsyncManager` 가 새로운 쓰레드를 할당하여 `Callable` 내부의 로직을 실행한다.

### Callable 수행 과정

1. `DispatcherServlet` 이 알맞은 컨트롤러를 찾아 요청을 전달 한다.
2. 컨트롤러가 `Callable` 을 반환 한다.
3. `DispatcherServlet` 은 `Callable` 객체를 `WebAsyncManager` 에게 전달 한다.
4. `WebAsyncManager` 가 새로운 쓰레드를 생성하여 `Callable` 을 실행 한다.
5. `WebAsyncManagerIntegrationFilter` 가 등록한 `SecurityContextCallableProcessingInterceptor` 가 기존 `SecurityContext` 를 새로운 쓰레드로 전달 한다.
6. 새로운 쓰레드에서도 기존 `SecurityContext` 를 유지 한다.

```java
@GetMapping("/async")
@ResponseBody
public Callable<String> asyncPage() {
  System.out.println("start: " + SecurityContextHolder.getContext().getAuthentication().getName());

  return () -> {
    Thread.sleep(4000);
    System.out.println("end: " + SecurityContextHolder.getContext().getAuthentication().getName());
    return "async";
  };
}
```

## @Async 사용 시 SecurityContext 유지 문제

- `@Async` 어노테이션을 사용하면 내부적으로 새로운 쓰레드에서 작업이 실행되는데, 이때도 `SecurityContext` 가 유지되지 않는다.
- `SecurityContext` 를 유지하려면 `SecurityContextExecutor` 를 사용하거나, `SecurityContext` 를 수동으로 복사해야 한다.

```java
@Async
public void asyncMethod() {
  SecurityContext context = SecurityContextHolder.getContext(); // 현재 SecurityContext 저장

  new Thread(() -> {
    SecurityContextHolder.setContext(context); // 새로운 쓰레드에서도 SecurityContext 유지
    System.out.println(SecurityContextHolder.getContext().getAuthentication().getName());
  }).start();
}
```
