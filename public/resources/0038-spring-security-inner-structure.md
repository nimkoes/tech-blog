# SecurityContextHolderAwareRequestFilter

## SecurityContextHolderAwareRequestFilter 목적

- 이 필터는 `DefaultSecurityFilterChain` 에 기본적으로 등록되는 필터이며, 열세 번째에 위치한다.
- `ServletRequest` 에 `Spring Security` 관련 메소드들을 추가하는 역할을 한다.

### 주요 특징

- `DefaultSecurityFilterChain` 에 기본 등록
- 커스텀 `SecurityFilterChain` 에도 자동 등록
- `ServletRequest` 확장 기능 제공

## 구현 구조

### 기본 클래스 구조

```java
public class SecurityContextHolderAwareRequestFilter extends GenericFilterBean {
  // 필터 구현
}
```

## 제공하는 보안 API 메소드

### authenticate()

- 사용자 인증 상태 확인
- 현재 요청의 인증 여부 검증
- `SecurityContext` 내 `Authentication` 객체 확인

### login()

- `AuthenticationManager` 를 통한 인증 처리
- 사용자 크리덴셜 검증
- 인증 성공 시 `SecurityContext` 업데이트

### logout()

- 로그아웃 핸들러 호출
- `SecurityContext` 초기화
- 세션 무효화
- 관련 쿠키 삭제

### AsyncContext.start()

- 비동기 작업 시 `SecurityContext` 전파
- `Callable` 인터페이스 지원
- 스레드 간 보안 컨텍스트 유지

## 활용 사례

### 컨트롤러에서의 활용

```java

@RestController
public class SecurityController {

  @GetMapping("/check")
  public String checkSecurity(HttpServletRequest request) {
    if (request.authenticate(response)) {
      return "인증된 사용자";
    }
    return "인증되지 않은 사용자";
  }
}
```

### 비동기 처리에서의 활용

```java

@GetMapping("/async")
public Callable<String> asyncProcess(HttpServletRequest request) {
  return () -> {
    // SecurityContext 가 전파된 상태로 비동기 처리
    return "비동기 처리 완료";
  };
}
```

## 주요 특징

### 보안 통합

- `Servlet API` 와 `Spring Security` 통합
- 표준 서블릿 스펙 준수
- 보안 관련 메소드의 일관된 인터페이스 제공

### 확장성

- 기존 `ServletRequest` 기능 확장
- 커스텀 보안 로직 통합 용이
- 표준 서블릿 컨테이너와의 호환성

### 사용 편의성

- 직관적인 API 제공
- 보안 관련 작업의 캡슐화
- 컨트롤러 레벨에서 쉬운 보안 처리
