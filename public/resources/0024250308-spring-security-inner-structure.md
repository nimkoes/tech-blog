---
title: "Spring Security 내부 구조 다섯 번째 시간"
author: "nimkoes"
date: "2025-03-08"
---

# 필터 상속과 요청 전파

## SecurityFilterChain 의 필터

- `SecurityFilterChain` 에 속한 각각의 필터를 이해하기 전에, 필터의 구조를 먼저 살펴보자.
- 모든 필터는 공통된 부모 필터 클래스를 상속받아 구현되며, 이를 통해 중복 코드 방지 및 역할 분리가 가능하다.

## 필터의 상속

![0024-01](/tech-blog/resources/images/spring-security-inner-structure/0024-01.png)

- `Spring Security` 의 필터들은 계층적으로 구성되어 있으며, 공통적인 기능을 가진 부모 필터를 상속하여 구현된다.
- 필터는 최상위 `Filter` 인터페이스를 기반으로 하며, 이를 확장하여 여러 필터가 존재한다.

### SecurityFilterChain 에서의 필터 계층 구조

![0024-02](/tech-blog/resources/images/spring-security-inner-structure/0024-02.png)

- `SecurityFilterChain` 에서 필터들은 체인 형태로 연결되며, 각 필터가 특정 보안 로직을 수행한 후 다음 필터로 요청을 전달한다.

### 상속의 이점

- 중복 코드 제거: 공통된 기능을 상위 클래스에서 정의하여 중복을 최소화할 수 있다.
- 역할 분리: 부모 클래스는 공통적인 구조만 정의하고, 구체적인 기능은 하위 클래스에서 구현할 수 있다.
- 유지보수 용이: 새로운 필터를 추가할 때 공통된 로직을 재사용할 수 있어 코드 변경이 용이하다.

### 예제: 로그인 필터의 계층 구조

```plaintext
Filter
   ├──GenericFilterBean (Spring Security 필터 기반)
        ├── AbstractAuthenticationProcessingFilter (기본 로그인 처리)
        │    ├── UsernamePasswordAuthenticationFilter (기본 폼 로그인)
        ├── LogoutFilter
        ├── OncePerRequestFilter
        │    ├── CsrfFilter
```

이처럼 공통 로직을 분리하고, 로그인 방식에 따라 다른 필터를 구현할 수 있다.

## GenericFilterBean 과 OncePerRequestFilter

`Spring Security` 의 필터는 `Servlet Filter` 인터페이스를 기반으로 동작하며, 이를 확장한 두 가지 중요한 추상 클래스가 있다.

### GenericFilterBean

- `GenericFilterBean` 은 `javax.servlet.Filter` 인터페이스를 구현한 추상 클래스이다.
- Spring 환경과의 통합을 쉽게 하기 위해 사용되며, `Spring Bean` 으로 등록 가능하다.

GenericFilterBean 코드 구조

```java
public abstract class GenericFilterBean implements Filter, BeanNameAware, EnvironmentAware,
  EnvironmentCapable, ServletContextAware, InitializingBean, DisposableBean {

}
```

서블릿 기반의 필터 인터페이스를 확장하여 Spring 환경에서 사용 가능하도록 설계 되었다.

---

### OncePerRequestFilter

- `OncePerRequestFilter` 는 `GenericFilterBean` 을 확장한 추상 클래스이다.
- 한 번의 요청 당 한 번만 실행되도록 설계된 필터이다.
- 동일한 요청에서 여러 번 필터를 거칠 가능성이 있는 경우, 중복 실행을 방지할 수 있다.

OncePerRequestFilter 코드 구조

```java
public abstract class OncePerRequestFilter extends GenericFilterBean {

  protected abstract void doFilterInternal(
    HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException;
}
```

`doFilterInternal()` 메서드를 구현하여 한 번의 요청 당 한 번만 필터를 실행할 수 있도록 함.

`OncePerRequestFilter` 를 활용한 커스텀 필터 예제

```java

@Component
public class CustomFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {
    System.out.println("Custom Filter 실행됨: " + request.getRequestURI());
    filterChain.doFilter(request, response);
  }
}
```

이 필터는 한 번의 요청에 대해서만 실행되며, 이후 필터 체인으로 요청을 전달함.

## 필터 인터페이스와 주요 메서드

`Filter` 인터페이스는 필터의 기본적인 동작을 정의하는 3가지 메서드를 제공한다.

Filter 인터페이스 코드

```java
public interface Filter {

  default void init(FilterConfig filterConfig) throws ServletException {
  }

  void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException;

  default void destroy() {
  }
}
```

### 주요 메서드

| 메서드          | 설명                   |
|--------------|----------------------|
| `init()`     | 필터가 생성될 때 초기화 작업을 수행 |
| `doFilter()` | 요청을 처리하고, 다음 필터로 전달  |
| `destroy()`  | 필터가 제거될 때 정리 작업 수행   |

## FilterChain 에서 다음 필터 호출

- 필터 체인 내에서 요청을 처리한 후 다음 필터를 실행해야 한다.
- 이를 위해 `FilterChain.doFilter(request, response);` 를 호출한다.

`LogoutFilter` 의 `doFilter()` 예제

```java
public class LogoutFilter extends GenericFilterBean {

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
    throws IOException, ServletException {

    // 로그아웃 처리 로직
    System.out.println("로그아웃 필터 실행됨");

    // 다음 필터 호출
    chain.doFilter(request, response);

    // 요청이 돌아와 다시 필터를 통과할 때 실행되는 로직
    System.out.println("로그아웃 필터 종료됨");
  }
}
```

위 코드에서 `chain.doFilter(request, response);` 를 호출하면 다음 필터가 실행된다.  
이후 요청이 돌아올 때(응답 시점) 다시 실행될 수 있다.
