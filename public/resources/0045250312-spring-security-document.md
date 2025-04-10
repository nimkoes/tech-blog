---
title: "Spring Security 6.4.3 Document 읽기"
description: "Features > Authentication"
author: "nimkoes"
date: "2025-03-12"
---

# Features

`Spring Security` 는 인증(`Authentication`), 인가(`Authorization`), 그리고 일반적인 보안 공격에 대한 보호를 포괄적으로 지원합니다.  
또한, 다른 라이브러리와의 통합을 제공하여 사용을 더욱 쉽게 할 수 있도록 지원합니다.

# Authentication

`Spring Security` 는 인증(`Authentication`) 을 포괄적으로 지원합니다. 인증은 특정 리소스에 접근하려는 사용자의 신원을 확인하는 과정입니다.
일반적인 인증 방식은 사용자에게 아이디(`username`) 와 비밀번호(`password`) 를 입력하도록 요구하는 것입니다.
인증이 완료되면, 사용자의 신원을 확인할 수 있으며, 이후 인가(`Authorization`) 를 수행할 수 있습니다.

`Spring Security` 는 사용자 인증을 위한 기본적인 기능을 내장하고 있습니다. 이 섹션에서는 `Servlet` 환경과 `WebFlux` 환경에서 공통적으로 적용되는 일반적인 인증 지원을 다룹니다.
각 스택(`Servlet` 및 `WebFlux`)에서 지원하는 구체적인 인증 방식에 대한 자세한 내용은 각각의 인증 관련 섹션을 참고하세요.

# Password Storage

`Spring Security` 의 `PasswordEncoder` 인터페이스 는 비밀번호를 단방향(`one-way`)으로 변환하여 안전하게 저장할 수 있도록 해줍니다.
`PasswordEncoder` 는 단방향 변환을 수행하기 때문에, 비밀번호 변환이 양방향(`two-way`) 이어야 하는 경우 (예를 들면 데이터베이스 인증을 위한 자격 증명 저장)에는 사용할 수 없습니다.
일반적으로, `PasswordEncoder` 는 비밀번호를 저장할 때 사용되며, 사용자가 입력한 비밀번호와 저장된 비밀번호를 비교하는 데 활용됩니다.

## Password Storage History

시간이 지나면서 비밀번호를 저장하는 표준 방식은 발전해 왔습니다.
초기에는 비밀번호를 평문(`plaintext`) 으로 저장하는 방식이 사용되었습니다.
당시에는 비밀번호가 저장된 데이터 저장소 자체에 접근하려면 자격 증명이 필요하기 때문에 안전하다고 여겨졌습니다.
그러나 SQL 인젝션(`SQL Injection`) 과 같은 공격 기법을 이용해 대량의 사용자명(`username`)과 비밀번호(`password`) 데이터를 탈취하는 사례가 발생했습니다.
이처럼 많은 사용자의 자격 증명이 외부에 공개되면서, 보안 전문가들은 비밀번호 보호를 더욱 강화해야 한다는 필요성을 인식하게 되었습니다.

이후, 개발자들은 `SHA-256`과 같은 단방향 해시 함수를 사용하여 비밀번호를 변환한 후 저장하도록 권장되었습니다.
인증 과정에서 사용자가 비밀번호를 입력하면, 입력한 비밀번호를 해시 처리한 값과 저장된 해시 값을 비교하여 인증을 수행했습니다.
이 방식에서는 비밀번호 자체가 아니라, 단방향 해시 값만 저장되었기 때문에, 만약 데이터 유출이 발생하더라도 비밀번호 원문이 직접 노출되지 않는 장점이 있었습니다.

또한, 단방향 해시 함수는 역산이 어렵고 계산 비용이 높기 때문에, 공격자가 해시 값을 통해 원래 비밀번호를 유추하는 것은 매우 어려웠습니다.
하지만 악의적인 공격자들은 이를 우회하기 위해 레인보우 테이블(`Rainbow Table`) 이라는 사전(`Lookup Table`) 을 만들었습니다.
레인보우 테이블은 미리 계산된 해시 값과 원래 비밀번호를 매핑한 테이블입니다.
공격자는 시스템에서 해시 값이 유출되었을 때, 레인보우 테이블을 이용해 해시 값과 일치하는 비밀번호를 빠르게 찾아낼 수 있었습니다.
이러한 공격이 가능해지면서, 비밀번호 보안을 더욱 강화하기 위한 추가적인 보호 기법이 필요하게 되었습니다.

레인보우 테이블의 효과를 완화하기 위해, 개발자들은 `salted password`를 사용할 것을 권장받았습니다.
비밀번호만을 해시 함수의 입력으로 사용하는 대신, 각 사용자의 비밀번호마다 무작위 바이트(`salt` 라고 알려진 값)가 생성되었습니다.
`salt` 와 사용자의 비밀번호는 해시 함수를 통해 처리되어 고유한 해시를 생성하게 됩니다.
`salt` 는 사용자의 비밀번호와 함께 평문으로 저장되었습니다.
이후 사용자가 인증을 시도하면, 해시된 비밀번호는 저장된 `salt` 와 사용자가 입력한 비밀번호를 해싱한 값과 비교되었습니다.
고유한 `salt` 값으로 인해, 레인보우 테이블은 더 이상 효과적이지 않았습니다.
그 이유는 `salt` 와 비밀번호 조합마다 해시 값이 달라지기 때문입니다.

요즘 우리는 `SHA-256`과 같은 암호학적 해시 함수가 더 이상 안전하지 않다는 것을 인식하게 되었습니다.
그 이유는 최신 하드웨어를 사용하면 초당 수십억 개의 해시 연산을 수행할 수 있기 때문입니다.
이는 개별 비밀번호를 쉽게 크랙할 수 있다는 것을 의미합니다.

개발자들은 이제 적응형(`adaptive`) 단방향 함수를 활용하여 비밀번호를 저장할 것을 권장받고 있습니다.
적응형 단방향 함수를 사용하면 비밀번호 검증 과정이 의도적으로 높은 리소스를 소모하도록 설계됩니다 (즉, CPU, 메모리 또는 기타 리소스를 많이 사용하도록 설계됩니다).
적응형 단방향 함수는 “작업 계수(`work factor`)” 를 설정할 수 있으며, 이 값은 하드웨어 성능이 향상됨에 따라 조정할 수 있습니다.
우리는 작업 계수가 시스템에서 비밀번호 검증에 약 1초가 걸리도록 조정할 것을 권장합니다.
이러한 설정은 공격자가 비밀번호를 크랙하는 것을 어렵게 만드는 반면, 너무 높은 부하를 초래하여 시스템에 과도한 부담을 주거나 사용자 경험을 해치지 않도록 하기 위한 절충안입니다.
`Spring Security` 는 기본적으로 적절한 작업 계수를 제공하지만, 시스템 성능은 환경마다 크게 다를 수 있으므로 사용자가 직접 조정할 것을 권장합니다.
사용해야 할 적응형 단방향 함수의 예제는 다음과 같습니다. `bcrypt`, `PBKDF2`, `scrypt`, `argon2`

적응형 단방향 함수는 의도적으로 높은 리소스를 소모하도록 설계되었기 때문에, 모든 요청마다 사용자명과 비밀번호를 검증하면 애플리케이션 성능이 크게 저하될 수 있습니다.
비밀번호 검증이 리소스를 많이 소모하도록 설계된 이유는 보안을 강화하기 위함이므로, `Spring Security` 를 포함한 어떠한 라이브러리도 이 검증 속도를 높일 수 없습니다.
사용자에게는 장기 자격 증명(예를 들어 사용자명과 비밀번호) 을 단기 자격 증명(예를 들어 세션, OAuth 토큰 등) 으로 교환하는 것이 권장됩니다.
단기 자격 증명은 빠르게 검증할 수 있으며, 보안성을 잃지 않고 성능 저하를 방지할 수 있습니다.

## DelegatingPasswordEncoder

Spring Security 5.0 이전에는 기본 `PasswordEncoder` 가 `NoOpPasswordEncoder` 였으며, 이 경우 평문(plain-text) 비밀번호를 사용해야 했습니다.

`Password Storage History` 섹션을 참고하면, 현재 기본 `PasswordEncoder` 가 `BCryptPasswordEncoder` 와 같은 방식일 것이라고 예상할 수도 있습니다.
그러나, 이는 다음과 같은 세 가지 현실적인 문제를 고려하지 않은 것입니다.

- 많은 애플리케이션이 이전 방식의 비밀번호 인코딩을 사용하고 있으며, 이를 쉽게 마이그레이션할 수 없습니다.
- 비밀번호 저장의 모범 사례는 시간이 지나면서 계속 변화할 것입니다.
- `Spring Security` 는 프레임워크로서 자주 하위 호환성을 깨는 변경을 할 수 없습니다.

이러한 문제를 해결하기 위해, `Spring Security` 는 `DelegatingPasswordEncoder` 를 도입했습니다. 이 방식은 다음과 같은 이점을 제공합니다.

- 현재 권장되는 비밀번호 저장 방식을 사용하여 인코딩을 보장합니다.
- 기존(레거시) 포맷과 최신 포맷을 모두 검증할 수 있습니다.
- 향후 더 안전한 방식이 나오면, 인코딩 방식을 업그레이드할 수 있습니다.

`Spring Security` 에서는 `PasswordEncoderFactories` 를 사용하여 `DelegatingPasswordEncoder` 인스턴스를 쉽게 생성할 수 있습니다.

**Create Default DelegatingPasswordEncoder**

```java
PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
```

```kotlin
val passwordEncoder: PasswordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder()
```

또는, 직접 사용자 정의 인스턴스를 생성할 수도 있습니다.

**Create Custom DelegatingPasswordEncoder**


```java
String idForEncode = "bcrypt";
Map encoders = new HashMap<>();
encoders.put(idForEncode, new BCryptPasswordEncoder());
encoders.put("noop", NoOpPasswordEncoder.getInstance());
encoders.put("pbkdf2", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_5());
encoders.put("pbkdf2@SpringSecurity_v5_8", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8());
encoders.put("scrypt", SCryptPasswordEncoder.defaultsForSpringSecurity_v4_1());
encoders.put("scrypt@SpringSecurity_v5_8", SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8());
encoders.put("argon2", Argon2PasswordEncoder.defaultsForSpringSecurity_v5_2());
encoders.put("argon2@SpringSecurity_v5_8", Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8());
encoders.put("sha256", new StandardPasswordEncoder());

PasswordEncoder passwordEncoder = new DelegatingPasswordEncoder(idForEncode, encoders);
```

```kotlin
val idForEncode = "bcrypt"
val encoders: MutableMap<String, PasswordEncoder> = mutableMapOf()
encoders[idForEncode] = BCryptPasswordEncoder()
encoders["noop"] = NoOpPasswordEncoder.getInstance()
encoders["pbkdf2"] = Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_5()
encoders["pbkdf2@SpringSecurity_v5_8"] = Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8()
encoders["scrypt"] = SCryptPasswordEncoder.defaultsForSpringSecurity_v4_1()
encoders["scrypt@SpringSecurity_v5_8"] = SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8()
encoders["argon2"] = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_2()
encoders["argon2@SpringSecurity_v5_8"] = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8()
encoders["sha256"] = StandardPasswordEncoder()

val passwordEncoder: PasswordEncoder = DelegatingPasswordEncoder(idForEncode, encoders)
```


https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html#authentication-password-storage-dpe-format

