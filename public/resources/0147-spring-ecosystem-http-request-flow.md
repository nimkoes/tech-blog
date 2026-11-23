---
title: Spring 생태계와 HTTP 요청은 어떻게 처리되는가
description: >-
  Spring Framework와 Spring Boot의 관계, 주요 Spring 프로젝트의 역할을 정리한다. HTTP 요청이 내장 Tomcat, 필터, DispatcherServlet, 컨트롤러와 서비스를 거쳐 응답으로 돌아오는 흐름을 Java와 Kotlin 예제로 확인한다.
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
tags:
  - Spring
  - Spring Boot
  - Spring Framework
  - Spring MVC
  - WebFlux
status: needs-review
sources:
  - 'https://docs.spring.io/spring-framework/reference/overview.html'
  - 'https://docs.spring.io/spring-framework/reference/7.0/core/beans/basics.html'
  - 'https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html'
  - 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html'
  - 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html'
  - 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html'
  - 'https://docs.spring.io/spring-boot/4.0/index.html'
  - 'https://docs.spring.io/spring-boot/4.0/system-requirements.html'
  - 'https://docs.spring.io/spring-boot/4.0/reference/features/kotlin.html'
  - 'https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide'
  - 'https://spring.io/projects'
  - 'https://start.spring.io'
---
# 개요

Spring을 처음 접하면 Spring Framework, Spring Boot, Spring Data, Spring Security 같은 이름이 한꺼번에 등장한다. 각 이름이 어떤 관계인지 모르면 의존성을 고르거나 오류가 발생한 위치를 찾기 어렵다.

Spring은 하나의 라이브러리가 아니다. Spring Framework를 기반으로 여러 프로젝트가 함께 동작하는 생태계다. Spring Boot는 이 생태계의 기술을 빠르게 조립하고 실행할 수 있게 돕는다.

이 글은 Spring을 처음 배우는 백엔드 개발자를 대상으로 다음 내용을 다룬다.

1. Spring Framework와 Spring Boot의 관계
2. Spring 컨테이너, 빈, 제어의 역전과 의존성 주입
3. Spring Data, Security, AI, Cloud 같은 주요 프로젝트의 역할
4. HTTP 요청이 Spring MVC 애플리케이션을 통과하는 순서
5. Spring MVC와 WebFlux의 차이
6. Java와 Kotlin으로 실행하는 작은 Spring Boot 애플리케이션

예제는 2026년 11월 23일에 확인한 Spring Boot 4.0.10, Spring Framework 7.0.11, Java 21을 기준으로 한다. Spring Boot 4.0 계열은 Java 17 이상이 필요하다. 최신 Spring Boot 계열은 달라질 수 있으므로 새 프로젝트를 시작할 때는 공식 문서를 다시 확인해야 한다.

# Spring은 하나의 라이브러리가 아니다

Spring이라는 말은 문맥에 따라 Spring Framework 하나를 뜻하기도 하고, Spring 프로젝트 전체를 뜻하기도 한다.

Spring Framework는 생태계의 기반이다. 객체 생성과 연결, 트랜잭션, 웹 요청 처리, 데이터 접근 같은 공통 기능을 제공한다. Spring Boot는 Spring Framework를 대신하는 제품이 아니다. Spring Framework와 관련 라이브러리를 실행 가능한 애플리케이션으로 빠르게 구성하는 도구다.

```text
Spring 생태계
├── Spring Framework: 컨테이너, AOP, 트랜잭션, MVC, WebFlux
├── Spring Boot: 스타터, 자동 설정, 내장 서버, 실행 가능한 jar
├── Spring Data: 데이터 저장소 접근
├── Spring Security: 인증과 인가
├── Spring AI: AI 모델과 벡터 저장소 연동
├── Spring Cloud: 분산 시스템 구성
└── 그 밖의 프로젝트: Batch, Integration, Modulith 등
```

## Spring Framework가 맡는 일

서버 애플리케이션에는 반복되는 작업이 많다.

- 객체를 만들고 서로 연결한다.
- 요청을 적절한 코드로 보낸다.
- 데이터베이스 작업을 하나의 트랜잭션으로 묶는다.
- 로그, 보안, 오류 처리 같은 공통 기능을 적용한다.
- 테스트에서 실제 의존성을 가짜 구현으로 바꾼다.

Spring Framework는 이 공통 작업을 맡는다. 개발자는 주문, 결제, 회원 같은 업무 규칙에 더 집중할 수 있다.

Spring Framework의 주요 기능은 모듈로 나뉜다.

| 영역 | 주요 역할 |
|---|---|
| Core Container | 객체 생성, 빈 관리, 의존성 주입 |
| AOP | 트랜잭션과 로그 같은 공통 기능 적용 |
| Data Access | JDBC, ORM 연동, 트랜잭션 관리 |
| Spring MVC | 서블릿 기반 웹 요청 처리 |
| Spring WebFlux | 리액티브 웹 요청 처리 |
| Test | 단위 테스트와 통합 테스트 지원 |

필요한 기능만 선택할 수 있다. 웹 서버가 필요 없는 배치 프로그램도 Spring 컨테이너와 데이터 접근 기능만 사용할 수 있다.

## 제어의 역전과 의존성 주입

일반적인 라이브러리는 개발자 코드가 필요할 때 호출한다. 프레임워크에서는 프레임워크가 전체 흐름을 관리하고 필요한 시점에 개발자 코드를 호출한다. 이처럼 실행 흐름의 주도권이 뒤집히는 것을 제어의 역전(IoC, Inversion of Control)이라고 한다.

의존성 주입(DI, Dependency Injection)은 IoC를 구현하는 대표적인 방법이다. 객체가 필요한 협력 객체를 직접 만들지 않고 외부에서 받는다.

```java
class OrderService {
    private final OrderRepository orderRepository;

    OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
}
```

`OrderService`는 `new OrderRepository()`를 호출하지 않는다. 생성자를 통해 필요한 객체를 받는다. Spring 컨테이너가 두 객체를 만들고 연결할 수 있다. 테스트에서는 같은 자리에 가짜 저장소를 넣을 수도 있다.

## Spring 컨테이너와 빈

Spring 컨테이너는 애플리케이션 객체를 만들고 연결하고 관리한다. 대표 인터페이스는 `ApplicationContext`다. Spring 컨테이너가 관리하는 객체를 빈(Bean)이라고 한다.

![개발자 코드의 애노테이션을 읽은 Spring 컨테이너가 OrderController, OrderService, OrderRepository 빈을 만들고 생성자 의존 관계로 연결하는 구조](/tech-blog/resources/images/spring-ecosystem/redraw/0147-01.svg)

`@Component`, `@Service`, `@Controller`, `@Repository` 같은 애노테이션을 붙이면 컴포넌트 스캔이 클래스를 찾아 빈으로 등록한다. 생성자에 다른 빈이 필요하면 Spring 컨테이너가 알맞은 빈을 찾아 넣는다.

Spring 빈의 기본 범위는 싱글톤이다. 애플리케이션에서 빈 하나를 만들어 여러 요청이 함께 사용한다. 따라서 서비스 빈의 필드에 현재 사용자처럼 요청마다 바뀌는 값을 저장하면 안 된다.

## Spring Boot가 맡는 일

Spring Framework만으로도 애플리케이션을 만들 수 있다. 그러나 필요한 라이브러리의 버전을 맞추고, 웹 서버와 JSON 변환기 같은 기반 객체를 직접 설정하는 데 시간이 든다.

Spring Boot는 이 준비 작업을 줄인다.

| 기능 | 설명 |
|---|---|
| 스타터 | 특정 기능에 필요한 의존성을 한 번에 가져온다. |
| 자동 설정 | 클래스패스와 설정값을 보고 필요한 빈을 등록한다. |
| 내장 서버 | Tomcat 같은 서버를 애플리케이션과 함께 실행한다. |
| 실행 가능한 jar | `java -jar` 명령으로 실행할 수 있는 파일을 만든다. |
| 운영 지원 | 상태 확인, 메트릭, 설정 바인딩 같은 기능을 제공한다. |

예를 들어 `spring-boot-starter-webmvc`를 추가하면 Spring MVC, 내장 Tomcat, JSON 변환에 필요한 라이브러리가 함께 들어온다. Spring Boot는 이 라이브러리가 있는 것을 보고 `DispatcherServlet`과 요청 매핑에 필요한 빈을 자동으로 설정한다.

# Spring 생태계는 문제별 프로젝트로 나뉜다

Spring Framework와 Spring Boot 위에는 특정 문제를 해결하는 프로젝트가 있다.

![Spring Framework를 기반으로 Spring Boot가 실행 환경을 만들고 Spring Data, Security, WebFlux, AI, Kafka, Cloud, Modulith 프로젝트가 목적에 따라 연결되는 생태계 지도](/tech-blog/resources/images/spring-ecosystem/redraw/0147-02.svg)

| 프로젝트 | 해결하는 문제 |
|---|---|
| Spring Data JPA | JPA 기반 데이터 접근과 반복적인 저장소 코드 축소 |
| Spring Security | 인증, 인가, 일반적인 웹 보안 |
| Spring WebFlux | 논블로킹 방식의 리액티브 웹 처리 |
| Spring AI | 언어 모델, 임베딩, 벡터 저장소 연동 |
| Spring for Apache Kafka | Kafka 메시지 발행과 소비 |
| Spring Cloud | 외부 설정, 게이트웨이, 서비스 간 통신 지원 |
| Spring Modulith | 모듈형 모놀리스의 경계와 이벤트 흐름 검증 |
| Spring Batch | 많은 데이터를 일정 단위로 읽고 처리하고 저장하는 작업 |
| Spring Integration | 서로 다른 시스템을 메시지 흐름으로 연결 |

모든 프로젝트를 한 애플리케이션에 넣을 필요는 없다. 해결할 문제에 맞는 프로젝트만 선택한다. Spring Boot 스타터와 자동 설정은 선택한 프로젝트를 Spring 애플리케이션에 연결하는 일을 줄여 준다.

# HTTP 요청은 어떤 순서로 처리되는가

`GET /orders/1` 요청을 처리하는 일반적인 Spring MVC 애플리케이션을 생각해 보자.

![클라이언트의 GET orders 1 요청이 Tomcat, 필터 체인, DispatcherServlet, 인터셉터, 컨트롤러, 서비스, 리포지토리, 데이터베이스를 거쳐 JSON 응답으로 돌아오는 순서](/tech-blog/resources/images/spring-ecosystem/redraw/0147-03.svg)

서비스와 리포지토리는 Spring MVC가 강제하는 계층이 아니다. 애플리케이션 코드를 역할별로 나눈 일반적인 예다. 데이터베이스를 사용하지 않는 요청이라면 리포지토리와 데이터베이스 단계는 없다.

## 1. 내장 Tomcat이 연결을 받는다

Spring MVC 스타터는 기본으로 내장 Tomcat을 사용한다. 애플리케이션이 시작되면 Tomcat이 기본 포트 8080에서 HTTP 연결을 기다린다.

요청이 들어오면 서블릿 컨테이너가 요청과 응답 객체를 만들고 필터 체인으로 전달한다. Spring MVC의 일반적인 동기 처리에서는 요청을 받은 스레드가 응답을 만들 때까지 작업을 이어 간다.

## 2. 필터 체인을 통과한다

필터는 서블릿보다 앞에서 요청과 응답을 검사하거나 바꾼다. 여러 필터가 연결된 구조를 필터 체인이라고 한다.

필터는 다음과 같은 작업에 적합하다.

- 요청과 응답 로그 기록
- 문자 인코딩 설정
- 요청 본문이나 헤더 검사
- Spring Security를 이용한 인증과 인가

Spring Security를 추가했다면 보안 필터도 이 단계에서 동작한다. 인증되지 않은 요청을 여기서 거절하면 컨트롤러는 실행되지 않는다.

## 3. DispatcherServlet이 처리할 코드를 찾는다

`DispatcherServlet`은 Spring MVC의 프런트 컨트롤러다. 웹 요청을 한곳에서 받은 뒤 실제 처리할 컨트롤러로 보낸다.

이 과정에서 여러 부품이 협력한다.

- `HandlerMapping`은 URL과 HTTP 메서드에 맞는 핸들러를 찾는다.
- `HandlerAdapter`는 찾은 컨트롤러 메서드를 실제로 호출한다.
- `HandlerExceptionResolver`는 처리 중 발생한 예외를 HTTP 응답으로 바꾼다.
- `HttpMessageConverter`는 요청과 응답 본문을 Java 객체로 변환한다.

`@GetMapping("/orders/{id}")`이 붙은 메서드는 `RequestMappingHandlerMapping`이 관리한다. `GET /orders/1` 요청이 오면 URL과 HTTP 메서드가 일치하는 메서드를 찾는다.

## 4. 인터셉터가 컨트롤러 호출 전후에 동작한다

인터셉터는 `DispatcherServlet` 안에서 컨트롤러 호출 전후에 동작한다. 어떤 컨트롤러 메서드가 선택됐는지 알 수 있다.

| 구분 | 필터 | 인터셉터 |
|---|---|---|
| 소속 | Jakarta Servlet | Spring MVC |
| 위치 | `DispatcherServlet` 앞 | `DispatcherServlet` 안 |
| 알 수 있는 정보 | HTTP 요청과 응답 | 요청, 응답, 선택된 핸들러 |
| 대표 용도 | 보안, 인코딩, 공통 요청 로그 | 핸들러 실행 시간, 컨트롤러 공통 처리 |

보안 규칙은 인터셉터보다 Spring Security 필터 체인에 두는 것이 안전하다. 인터셉터는 정적 자원이나 다른 방식으로 등록한 핸들러와 정확히 맞지 않을 수 있다.

## 5. 컨트롤러와 서비스가 요청을 처리한다

컨트롤러는 HTTP 요청을 애플리케이션이 사용할 값으로 바꾸고 서비스에 일을 맡긴다. 서비스는 업무 규칙과 처리 순서를 담당한다.

```java
@RestController
class OrderController {
    private final OrderService orderService;

    OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders/{id}")
    Order get(@PathVariable long id) {
        return orderService.findOrder(id);
    }
}
```

컨트롤러에 업무 규칙을 모두 넣으면 HTTP 없이 서비스를 테스트하기 어렵다. 컨트롤러는 요청과 응답에 집중하고 업무 규칙은 서비스로 분리하는 편이 좋다.

## 6. 리포지토리가 데이터 저장소와 통신한다

데이터가 필요하면 서비스가 리포지토리를 호출한다. Spring Data JPA를 사용하면 리포지토리 인터페이스의 구현을 Spring Data가 생성할 수 있다.

JPA 구현체는 객체 작업을 SQL로 바꾸고 JDBC를 통해 데이터베이스에 전달한다. 데이터베이스 연결은 커넥션 풀에서 빌리고 사용이 끝나면 돌려준다.

## 7. 반환값이 HTTP 응답으로 바뀐다

`@RestController` 메서드가 객체를 반환하면 `HttpMessageConverter`가 응답 본문으로 변환한다. Spring Boot 4.0은 기본 JSON 라이브러리로 Jackson 3을 사용한다.

```json
{"id":1,"item":"아메리카노","price":4500}
```

변환된 본문과 상태 코드, 헤더는 필터 체인과 Tomcat을 거쳐 클라이언트로 돌아간다.

# Spring MVC와 WebFlux는 처리 방식이 다르다

Spring은 두 가지 웹 스택을 제공한다.

| 구분 | Spring MVC | Spring WebFlux |
|---|---|---|
| 기반 | Servlet API | Reactive Streams, Reactor |
| 기본 서버 | Tomcat | Reactor Netty |
| 일반적인 코드 흐름 | 동기·명령형 | 비동기·리액티브 |
| 대표 반환 타입 | 객체, `ResponseEntity` | `Mono`, `Flux` |
| 잘 맞는 상황 | 일반적인 웹 API와 블로킹 데이터 접근 | 많은 동시 연결과 논블로킹 I/O |

WebFlux를 사용한다고 모든 요청이 자동으로 빨라지는 것은 아니다. JDBC처럼 블로킹하는 라이브러리를 그대로 사용하면 리액티브 처리의 이점을 얻기 어렵다. 일반적인 CRUD API와 블로킹 데이터베이스를 사용한다면 Spring MVC가 단순하다. 외부 호출이 많고 전체 호출 경로를 논블로킹으로 구성할 수 있을 때 WebFlux를 검토한다.

# 가장 작은 Spring Boot 애플리케이션 실행하기

Spring Initializr에서 Java 21, Gradle Kotlin, Spring Boot 4.0.10, Spring Web을 선택하면 다음과 같은 프로젝트를 만들 수 있다.

## Java 프로젝트 설정

```kotlin
// build.gradle.kts
plugins {
    java
    id("org.springframework.boot") version "4.0.10"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

Spring Boot 3.x까지 널리 사용한 `spring-boot-starter-web`은 Spring Boot 4.0에서 `spring-boot-starter-webmvc`로 이름이 바뀌었다. 이전 이름도 당분간 사용할 수 있지만 공식 마이그레이션 가이드는 새 이름 사용을 권장한다.

## Java 코드

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

@RestController
class HelloController {
    @GetMapping("/hello")
    String hello() {
        return "안녕하세요, Spring";
    }
}
```

`@SpringBootApplication`은 다음 역할을 묶은 애노테이션이다.

- 현재 클래스가 Spring Boot 설정의 시작점임을 알린다.
- 자동 설정을 활성화한다.
- 현재 패키지와 하위 패키지에서 컴포넌트를 찾는다.

시작 클래스는 애플리케이션의 최상위 패키지에 두는 것이 좋다. 컨트롤러가 시작 클래스보다 위나 옆 패키지에 있으면 기본 컴포넌트 스캔에서 빠질 수 있다.

## Kotlin 프로젝트 설정

Kotlin 프로젝트는 Spring Initializr가 생성한 설정을 사용하는 것이 안전하다.

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.2.21"
    kotlin("plugin.spring") version "2.2.21"
    id("org.springframework.boot") version "4.0.10"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("tools.jackson.module:jackson-module-kotlin")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll(
            "-Xjsr305=strict",
            "-Xannotation-default-target=param-property",
        )
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

Kotlin 클래스는 기본으로 상속할 수 없는 `final`이다. `kotlin("plugin.spring")` 플러그인은 Spring 애노테이션이 붙은 클래스를 프록시로 감쌀 수 있게 자동으로 열어 준다.

## Kotlin 코드

```kotlin
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}

@RestController
class HelloController {
    @GetMapping("/hello")
    fun hello(): String = "안녕하세요, Spring"
}
```

## 실행 결과 확인

애플리케이션을 실행한다.

```bash
./gradlew bootRun
```

시작 로그에서 버전과 포트를 확인할 수 있다.

```text
:: Spring Boot ::               (v4.0.10)

Tomcat started on port 8080 (http) with context path '/'
Started DemoApplication
```

다른 터미널에서 요청을 보낸다.

```bash
curl -i http://localhost:8080/hello
```

```text
HTTP/1.1 200
Content-Type: text/plain;charset=UTF-8

안녕하세요, Spring
```

# 필터와 인터셉터의 실행 순서 확인하기

필터, 인터셉터, 컨트롤러, 서비스에 로그를 넣으면 요청의 흐름을 직접 확인할 수 있다.

## Java 예제

```java
package com.example.demo;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Component
class TraceFilter implements Filter {
    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {
        System.out.println("[1] Filter 진입");
        chain.doFilter(request, response);
        System.out.println("[7] Filter 나감");
    }
}

@Component
class TraceInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) {
        System.out.println("[2] Interceptor preHandle -> " + handler);
        return true;
    }

    @Override
    public void postHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            ModelAndView modelAndView
    ) {
        System.out.println("[5] Interceptor postHandle");
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception exception
    ) {
        System.out.println("[6] Interceptor afterCompletion");
    }
}

@Configuration
class WebConfig implements WebMvcConfigurer {
    private final TraceInterceptor traceInterceptor;

    WebConfig(TraceInterceptor traceInterceptor) {
        this.traceInterceptor = traceInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(traceInterceptor);
    }
}

record Order(long id, String item, int price) {}

@Service
class OrderService {
    Order findOrder(long id) {
        System.out.println("[4] Service findOrder(" + id + ")");
        return new Order(id, "아메리카노", 4500);
    }
}

@RestController
class OrderController {
    private final OrderService orderService;

    OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders/{id}")
    Order get(@PathVariable long id) {
        System.out.println("[3] Controller get(" + id + ")");
        return orderService.findOrder(id);
    }
}
```

## Kotlin 예제

```kotlin
package com.example.demo

import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.ModelAndView
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Component
class TraceFilter : Filter {
    override fun doFilter(
        request: ServletRequest,
        response: ServletResponse,
        chain: FilterChain,
    ) {
        println("[1] Filter 진입")
        chain.doFilter(request, response)
        println("[7] Filter 나감")
    }
}

@Component
class TraceInterceptor : HandlerInterceptor {
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        println("[2] Interceptor preHandle -> $handler")
        return true
    }

    override fun postHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        modelAndView: ModelAndView?,
    ) {
        println("[5] Interceptor postHandle")
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        exception: Exception?,
    ) {
        println("[6] Interceptor afterCompletion")
    }
}

@Configuration
class WebConfig(private val traceInterceptor: TraceInterceptor) : WebMvcConfigurer {
    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(traceInterceptor)
    }
}

data class Order(val id: Long, val item: String, val price: Int)

@Service
class OrderService {
    fun findOrder(id: Long): Order {
        println("[4] Service findOrder($id)")
        return Order(id, "아메리카노", 4500)
    }
}

@RestController
class OrderController(private val orderService: OrderService) {
    @GetMapping("/orders/{id}")
    fun get(@PathVariable id: Long): Order {
        println("[3] Controller get($id)")
        return orderService.findOrder(id)
    }
}
```

요청을 보낸다.

```bash
curl -s http://localhost:8080/orders/1
```

클라이언트는 JSON을 받는다.

```json
{"id":1,"item":"아메리카노","price":4500}
```

서버 로그에는 요청이 들어갔다가 나오는 순서가 표시된다.

```text
[1] Filter 진입
[2] Interceptor preHandle -> com.example.demo.OrderController#get(long)
[3] Controller get(1)
[4] Service findOrder(1)
[5] Interceptor postHandle
[6] Interceptor afterCompletion
[7] Filter 나감
```

필터가 가장 바깥에서 요청을 감싼다. 인터셉터는 컨트롤러 실행 전후에 동작한다. 컨트롤러가 반환한 `Order` 객체는 메시지 변환기를 통해 JSON이 된다.

# Spring 컨테이너가 만든 빈 확인하기

`ApplicationContext`를 사용하면 컨테이너가 만든 빈을 확인할 수 있다.

```java
package com.example.demo;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
class BeanInspector implements CommandLineRunner {
    private final ApplicationContext context;

    BeanInspector(ApplicationContext context) {
        this.context = context;
    }

    @Override
    public void run(String... args) {
        System.out.println("등록된 빈 개수: " + context.getBeanDefinitionCount());

        List.of(
                "dispatcherServlet",
                "orderController",
                "orderService",
                "requestMappingHandlerMapping"
        ).forEach(name ->
                System.out.printf("%-30s 있음? %s%n", name, context.containsBean(name))
        );

        OrderService first = context.getBean(OrderService.class);
        OrderService second = context.getBean(OrderService.class);
        System.out.println("두 조회 결과가 같은 객체인가? " + (first == second));
    }
}
```

빈 개수는 의존성과 자동 설정에 따라 달라진다. `dispatcherServlet`과 `requestMappingHandlerMapping`은 Spring Boot 자동 설정이 만든 대표적인 빈이다. `OrderService`를 두 번 조회한 결과는 같은 객체다. 기본 빈 범위가 싱글톤이기 때문이다.

# 버전에 따라 달라지는 부분

Spring Boot 2.x나 3.x 프로젝트를 함께 관리한다면 다음 차이를 알아야 한다.

| 항목 | Spring Boot 2.7 | Spring Boot 3.x | Spring Boot 4.0 |
|---|---|---|---|
| 최소 Java | 8 | 17 | 17 |
| 서블릿 패키지 | `javax.servlet` | `jakarta.servlet` | `jakarta.servlet` |
| Spring MVC 스타터 | `spring-boot-starter-web` | `spring-boot-starter-web` | `spring-boot-starter-webmvc` 권장 |
| JSON 라이브러리 | Jackson 2 | Jackson 2 | Jackson 3 우선 |
| 내장 서블릿 서버 | Tomcat 9 계열 등 | Tomcat 10 계열 등 | Tomcat 11, Jetty 12.1 |

Spring Boot 4.0.10은 Tomcat 11과 Jetty 12.1을 지원하며 Servlet 6.1 이상이 필요하다. 기존 프로젝트를 4.0으로 올릴 때는 먼저 3.5로 이동한 뒤 4.0 마이그레이션 가이드를 따르는 것이 공식 권장 경로다.

Jackson 3에서는 주요 패키지가 `com.fasterxml.jackson`에서 `tools.jackson`으로 바뀌었다. 다만 Jackson 애노테이션 패키지는 기존 `com.fasterxml.jackson.annotation`을 유지한다. 기존 `ObjectMapper` 설정을 직접 사용한다면 `JsonMapper` 기반 자동 설정과 충돌하지 않는지 확인해야 한다.

# 자주 발생하는 문제

| 증상 | 원인 | 확인할 내용 |
|---|---|---|
| 컨트롤러를 만들었지만 404가 반환된다 | 컴포넌트 스캔 범위 밖에 클래스가 있다 | 시작 클래스를 최상위 패키지에 둔다. |
| `Port 8080 was already in use`가 발생한다 | 다른 프로세스가 포트를 사용한다 | 기존 프로세스를 종료하거나 `server.port`를 바꾼다. |
| 인터셉터가 실행되지 않는다 | 빈만 만들고 MVC 설정에 등록하지 않았다 | `WebMvcConfigurer#addInterceptors`를 확인한다. |
| 직접 만든 서비스에서 트랜잭션이 동작하지 않는다 | `new`로 만든 객체는 Spring 빈이 아니다 | 컨테이너가 만든 빈을 주입받는다. |
| 오래된 코드의 `javax.servlet` import가 실패한다 | Boot 3부터 Jakarta 패키지를 사용한다 | `jakarta.servlet`로 변경한다. |
| Kotlin에서 프록시 기반 기능이 동작하지 않는다 | 클래스가 기본으로 `final`이다 | `kotlin("plugin.spring")`을 적용한다. |

오류를 볼 때는 요청 처리 단계 중 어디까지 도달했는지 먼저 확인한다. 필터 로그도 없다면 서버 연결과 필터 등록을 본다. 필터는 실행됐지만 컨트롤러가 실행되지 않았다면 보안, URL 매핑, 인터셉터를 확인한다. 컨트롤러 이후에 실패했다면 서비스와 데이터 접근 계층으로 범위를 좁힌다.

# 이해 확인

1. Spring Framework와 Spring Boot는 어떤 관계인가?
2. Spring 컨테이너가 관리하는 객체를 무엇이라고 부르는가?
3. 인증되지 않은 요청이 Spring Security 필터에서 거절되면 컨트롤러가 실행되는가?
4. 필터와 인터셉터는 `DispatcherServlet`을 기준으로 어디에서 동작하는가?
5. 싱글톤 서비스 빈의 필드에 현재 사용자 정보를 저장하면 왜 위험한가?

<details>
<summary>정답 확인</summary>

1. Spring Framework는 컨테이너, 트랜잭션, MVC 같은 기반 기능을 제공한다. Spring Boot는 스타터, 자동 설정, 내장 서버로 Spring Framework 애플리케이션을 빠르게 구성하고 실행하게 돕는다.
2. 빈(Bean)이라고 부른다.
3. 실행되지 않는다. 요청이 `DispatcherServlet`에 도달하기 전에 종료된다.
4. 필터는 `DispatcherServlet` 앞에서, 인터셉터는 그 안에서 컨트롤러 호출 전후에 동작한다.
5. 여러 요청이 같은 객체를 공유하므로 한 요청이 저장한 값을 다른 요청이 읽거나 덮어쓸 수 있다.

</details>

# 정리

Spring은 Spring Framework를 중심으로 여러 프로젝트가 모인 생태계다. Spring Framework는 객체 생성과 연결, 트랜잭션, 웹 요청 처리 같은 기반 기능을 제공한다. Spring Boot는 스타터, 자동 설정, 내장 서버로 이 기능을 빠르게 사용할 수 있게 한다.

Spring MVC 요청은 일반적으로 Tomcat, 필터 체인, `DispatcherServlet`, 인터셉터, 컨트롤러 순서로 들어간다. 애플리케이션 구조에 따라 서비스와 리포지토리가 이어지고, 반환값은 메시지 변환기를 거쳐 HTTP 응답이 된다.

오류가 발생하면 요청 처리 흐름에서 어디까지 실행됐는지 확인한다. 이 기준을 알고 있으면 401, 404, 500 오류를 무작정 찾지 않고 범위를 단계적으로 좁힐 수 있다.

# 용어 정의

- **Spring Framework**: Spring 생태계의 기반이다. IoC 컨테이너, AOP, 트랜잭션, MVC, WebFlux 등을 제공한다.
- **Spring Boot**: Spring 애플리케이션을 빠르게 구성하고 실행하게 돕는 프로젝트다. 스타터, 자동 설정, 내장 서버가 핵심 기능이다.
- **IoC**: 객체 생성과 실행 흐름의 주도권을 개발자 코드가 아닌 컨테이너가 갖는 방식이다.
- **DI**: 객체가 필요한 의존성을 직접 만들지 않고 외부에서 받는 방식이다.
- **빈**: Spring 컨테이너가 생성하고 연결하고 관리하는 객체다.
- **필터**: 서블릿 앞에서 요청과 응답을 검사하거나 바꾸는 Jakarta Servlet 부품이다.
- **DispatcherServlet**: Spring MVC의 프런트 컨트롤러다. 요청에 맞는 핸들러를 찾고 호출한다.
- **인터셉터**: Spring MVC 안에서 컨트롤러 호출 전후에 동작하는 부품이다.
- **스타터**: 특정 기능에 필요한 의존성을 함께 제공하는 Spring Boot 의존성이다.
- **자동 설정**: 클래스패스와 설정값을 보고 Spring Boot가 필요한 빈을 등록하는 기능이다.

# 참고 자료

- [Spring Framework Overview](https://docs.spring.io/spring-framework/reference/overview.html) — 공식 문서
- [Spring IoC Container](https://docs.spring.io/spring-framework/reference/7.0/core/beans/basics.html) — 공식 문서
- [Spring Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html) — 공식 문서
- [Spring MVC DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html) — 공식 문서
- [DispatcherServlet 요청 처리 순서](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html) — 공식 문서
- [Spring MVC Interception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html) — 공식 문서
- [Spring Boot 4.0 Reference](https://docs.spring.io/spring-boot/4.0/index.html) — 공식 문서
- [Spring Boot 4.0 System Requirements](https://docs.spring.io/spring-boot/4.0/system-requirements.html) — 공식 문서
- [Spring Boot Kotlin Support](https://docs.spring.io/spring-boot/4.0/reference/features/kotlin.html) — 공식 문서
- [Spring Boot 4.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide) — 공식 마이그레이션 가이드
- [Spring Projects](https://spring.io/projects) — 공식 프로젝트 목록
- [Spring Initializr](https://start.spring.io) — 공식 프로젝트 생성 도구
