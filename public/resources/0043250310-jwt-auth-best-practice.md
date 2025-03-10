---
title: "JWT 기반 인증 서버 개발의 best practice"
author: "nimkoes"
date: "2025-03-10"
tags: [ "study", "nuggets", "authorization", "authentication", "best practice" ]
---

## 토큰 설계 원칙

### 토큰 수명(TTL) 설정

토큰의 수명은 보안과 사용자 경험 사이의 균형을 고려하여 설정해야 합니다.

1. Access Token
   - 일반적으로 15-30분으로 설정
   - 최대 2시간을 넘지 않도록 권장
   - 민감한 서비스의 경우 5-15분으로 설정
2. Refresh Token
   - 보통 2주-1개월로 설정
   - 최대 3개월을 넘지 않도록 권장
   - Remember Me 기능 사용 시에도 최대 1년으로 제한

```java
public class JwtProperties {
  // 일반적인 토큰 수명 설정 예시
  public static final long ACCESS_TOKEN_VALIDITY = 30 * 60 * 1000L;  // 30분
  public static final long REFRESH_TOKEN_VALIDITY = 14 * 24 * 60 * 60 * 1000L;  // 2주
}
```

### 토큰 페이로드 구성

JWT 페이로드는 필요한 최소한의 정보만 포함해야 합니다.

1. 필수 포함 정보
   - sub (subject): 사용자 식별자
   - iat (issued at): 토큰 발급 시간
   - exp (expiration): 만료 시간
   - jti (JWT ID): 토큰 식별자 (선택적)
2. 권장 포함 정보
   - type: 토큰 유형 (ACCESS/REFRESH)
   - roles/authorities: 사용자 권한 정보
3. 포함하지 말아야 할 정보
   - 패스워드 등 민감 정보
   - 개인식별정보 (주민번호, 전화번호 등)
   - 과도한 사용자 정보

```java
// 권장되는 페이로드 구성 예시
Claims claims = Jwts.claims()
    .setSubject(userId)
    .setIssuedAt(new Date())
    .setExpiration(expiryDate);
claims.

put("type","ACCESS");
claims.

put("roles",roles);
```

## 쿠키 기반 토큰 관리

### 쿠키 설정 원칙

보안을 고려한 쿠키 설정이 중요합니다.

1. HttpOnly 플래그
   - 필수적으로 활성화
   - XSS 공격으로부터 보호
   - JavaScript를 통한 쿠키 접근 차단
2. Secure 플래그
   - HTTPS 환경에서 필수 활성화
   - 개발 환경에서도 가능한 활성화 권장
3. SameSite 설정
   - Strict 또는 Lax 사용 권장
   - Strict: 가장 엄격한 보안 (동일 도메인만 허용)
   - Lax: 일반적인 웹 애플리케이션에 권장
4. Domain 설정
   - 가능한 구체적인 도메인 지정
   - 서브도메인 사용 시 주의 필요

```java
// 보안 쿠키 설정 예시
ResponseCookie.from("access_token",token)
    .httpOnly(true)
    .secure(true)
    .sameSite("Strict")
    .domain("api.example.com")
    .path("/")
    .maxAge(Duration.ofMinutes(30))
  .build();
```

### 토큰 저장 전략

1. Access Token
   - 메모리(JavaScript)에 저장 가능
   - HttpOnly 쿠키 사용 권장
   - Authorization 헤더로 전송 가능
2. Refresh Token
   - 반드시 HttpOnly 쿠키로 저장
   - 클라이언트 측 JavaScript에서 접근 불가
   - 서버 측 데이터베이스에도 저장 권장

## 보안 강화 전략

### 토큰 갱신 전략

1. Silent Refresh
   - Access Token 만료 전 자동 갱신
   - 보통 만료 1-2분 전에 수행
   - 백그라운드에서 처리하여 사용자 경험 유지
2. Refresh Token Rotation
   - Refresh Token 사용 시마다 새로운 토큰 발급
   - 토큰 탈취 위험 감소
   - 이전 토큰 자동 무효화

```java
// Refresh Token Rotation 예시
public TokenDto rotateRefreshToken(String oldRefreshToken) {
  // 기존 토큰 검증
  validateRefreshToken(oldRefreshToken);

  // 새 토큰 발급
  String newRefreshToken = generateNewRefreshToken();

  // 이전 토큰 즉시 무효화
  invalidateRefreshToken(oldRefreshToken);

  return new TokenDto(newAccessToken, newRefreshToken);
}
```

### 토큰 무효화 전략

1. 블랙리스트 관리
   - 로그아웃된 토큰 관리
   - Redis 등 인메모리 데이터베이스 사용 권장
   - 토큰 만료 시간까지만 보관
2. 화이트리스트 관리
   - 유효한 Refresh Token 만 관리
   - 데이터베이스에 저장
   - 주기적인 만료 토큰 정리

## 예외 처리 전략

### 토큰 관련 예외

1. 만료된 토큰
   - 401 Unauthorized 응답
   - 명확한 에러 메시지 제공
   - Refresh Token 으로 갱신 유도
2. 잘못된 토큰
   - 400 Bad Request 응답
   - 재로그인 유도
   - 보안 로그 기록
3. 토큰 탈취 의심
   - 즉시 모든 관련 토큰 무효화
   - 사용자에게 알림
   - 보안 이벤트 로깅

```java
// 예외 응답 예시
@ExceptionHandler(TokenExpiredException.class)
public ResponseEntity<ErrorResponse> handleExpiredToken() {
  return ResponseEntity
    .status(HttpStatus.UNAUTHORIZED)
    .body(new ErrorResponse(
      "TOKEN_EXPIRED",
      "인증이 만료되었습니다. 다시 로그인해주세요."
    ));
}
```

## 모니터링 및 로깅

### 보안 이벤트 로깅

1. 필수 로깅 항목
   - 토큰 발급/갱신 이벤트
   - 로그인/로그아웃 시도
   - 토큰 검증 실패
   - 비정상적인 접근 시도
2. 로그 포맷
   - 타임스탬프
   - 이벤트 유형
   - 사용자 식별 정보
   - IP 주소
   - 요청 경로
3. 모니터링 지표
   - 토큰 발급 빈도
   - 실패한 검증 시도
   - 비정상적인 패턴
   - 동시 접속 수
