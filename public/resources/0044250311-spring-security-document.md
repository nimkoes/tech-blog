---
title: "Spring Security 6.4.3 Document 읽기"
description: "Overview"
author: "nimkoes"
date: "2025-03-11"
tags: [ "study", "document", "spring security" ]
---

# Overview

`Spring Security` 는 인증, 인가 및 일반적인 공격에 대한 보호를 제공하는 프레임워크입니다.  
명령형 및 반응형 애플리케이션 보안을 최고 수준으로 지원하며, `Spring` 기반 애플리케이션을 보호하는 사실상의 표준입니다.

전체 기능 목록은 참조 문서의 Features 섹션에서 확인할 수 있습니다.

# Getting Started

애플리케이션 보안을 적용할 준비가 되었다면, 서블릿(`Servlet`) 및 리액티브(`Reactive`) 애플리케이션을 위한 `Getting Started` 섹션을 확인하세요.  
이 섹션에서는 첫 번째 Spring Security 애플리케이션을 만드는 과정을 안내합니다.

`Spring Security` 의 동작 방식이 궁금하다면, `Architecture` 섹션을 참고하세요.

이미 `Spring Security` 를 알고 있거나 버전 업그레이드를 고려하고 있다면, 최신 릴리스의 변경 사항을 확인하세요.

질문이 있다면 도움을 줄 수 있는 훌륭한 커뮤니티가 있습니다.

# Prerequisites

## Java 런타임 환경 요구 사항

`Spring Security` 는 `Java 17` 이상의 런타임 환경이 필요합니다.

`Spring Security` 는 자체적으로 동작하도록 설계되었기 때문에, `Java` 런타임 환경에 별도의 구성 파일을 배치할 필요가 없습니다.  
특히, `Java` 인증 및 인가 서비스(`Java Authentication and Authorization Service`, `JAAS`) 정책 파일을 설정할 필요가 없으며, `Spring Security` 를 공용 클래스 경로(`common classpath`) 위치에 배치할 필요도 없습니다.

마찬가지로, `EJB` 컨테이너 또는 서블릿 컨테이너를 사용하는 경우에도 특정한 구성 파일을 배치할 필요가 없으며, `Spring Security` 를 서버 클래스 로더(`server classloader`)에 포함할 필요도 없습니다.  
`Spring Security` 가 동작하는 데 필요한 모든 파일은 애플리케이션 내부에 포함되어 있습니다.

이러한 설계 방식은 배포 시 유연성을 극대화할 수 있도록 합니다.  
즉, `JAR`, `WAR`, `EAR` 등의 최종 산출물을 한 시스템에서 다른 시스템으로 복사하면 즉시 동작할 수 있습니다.

# Spring Security Community

Spring Security 커뮤니티에 오신 것을 환영합니다! 이 섹션에서는 `Spring Security` 커뮤니티를 최대한 활용하는 방법에 대해 설명합니다.

## Getting Help

`Spring Security` 와 관련하여 도움이 필요하다면, 커뮤니티에서 지원하고 있습니다.  
다음은 도움을 받을 수 있는 가장 좋은 방법들입니다.

- 이 문서를 자세히 읽어보세요.
- 제공되는 여러 샘플 애플리케이션을 사용해 보세요.
- [`Stack Overflow`](https://stackoverflow.com) 에서 `spring-security` 태그를 사용하여 질문하세요.
- 버그나 기능 개선 요청은 [`GitHub` 이슈 페이지](github.com/spring-projects/spring-security/issues) 에 등록하세요.

## Becoming Involved

Spring Security 프로젝트에 참여해 주세요.

Spring Security 프로젝트에 참여하는 것을 환영합니다. 다양한 방법으로 기여할 수 있으며, 다음과 같은 방식이 있습니다.

- `Stack Overflow` 에서 질문에 답변하는 것
- 새로운 코드를 작성하는 것
- 기존 코드를 개선하는 것
- 문서 작업을 돕는 것
- 샘플 애플리케이션이나 튜토리얼을 개발하는 것
- 버그를 보고하는 것
- 개선 사항을 제안하는 것

자세한 내용은 [`Contributing` 문서](https://github.com/spring-projects/spring-security/blob/main/CONTRIBUTING.adoc) 를 참고하십시오.

## Source Code

`Spring Security` 의 소스 코드는 [`GitHub` 에서 확인](https://github.com/spring-projects/spring-security/) 할 수 있습니다.

## Apache 2 License

`Spring Security` 는 [`Apache 2.0 라이선스`](https://www.apache.org/licenses/LICENSE-2.0.html) 하에 배포되는 오픈 소스 소프트웨어입니다.

## Social Media

최신 소식을 확인하려면 `Twitter` 에서 [`@SpringSecurity`](https://x.com/SpringSecurity) 및 [`Spring Security` 팀](https://x.com/SpringSecurity/lists/team)을 팔로우하세요.  
`Spring` 프레임워크 전체에 대한 소식을 확인하려면 [`@SpringCentral`](https://x.com/SpringCentral) 을 팔로우하세요.

# Getting Spring Security

이 섹션에서는 `Spring Security` 바이너리를 얻는 방법을 설명합니다. 소스 코드를 얻는 방법은 Source Code 섹션을 참고하세요.

## Release Numbering

`Spring Security` 의 버전 형식은 `MAJOR`.`MINOR`.`PATCH` 형태로 구성됩니다.

- `MAJOR`
  - 기존 코드와 호환되지 않을 수 있는 변경 사항이 포함될 수 있습니다.
  - 일반적으로 최신 보안 관행을 반영하여 보안을 강화하기 위해 변경됩니다.
- `MINOR`
  - 새로운 기능이 추가되지만, 기존 기능에 영향을 주지 않는 수동적 업데이트(`passive update`) 로 간주됩니다.
- `PATCH`
  - 기존 버전과 완벽하게 호환되어야 합니다.
  - 단, 버그 수정으로 인해 일부 동작이 변경될 가능성이 있습니다.

## Usage

대부분의 오픈 소스 프로젝트와 마찬가지로, `Spring Security` 는 `Maven` 아티팩트로 의존성을 배포합니다. 따라서 `Maven` 과 `Gradle` 모두에서 사용할 수 있습니다.  
다음 섹션에서는 `Spring Boot` 및 독립 실행형(`Standalone`) 환경에서 `Spring Security` 를 빌드 도구와 통합하는 방법을 예제로 설명합니다.

### Spring Boot

`Spring Boot` 는 `spring-boot-starter-security` 스타터를 제공하며, 이는 `Spring Security` 와 관련된 의존성을 모아둔 스타터입니다.  
`Spring Security` 를 가장 간단하고 권장되는 방식으로 사용하려면, `Spring Initializr` 를 이용하는 것이 좋습니다.  
`Spring Initializr` 는 다음 방법을 통해 사용할 수 있습니다.

- IDE 연동을 통해 생성 (`Eclipse`, `IntelliJ`, `NetBeans`)
- 웹 사이트에서 직접 생성 (`start.spring.io`)

또는, 아래 예제와 같이 스타터를 수동으로 추가할 수도 있습니다.

```xml

<dependencies>
  <!-- ... other dependency elements ... -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
</dependencies>
```

```yml
dependencies {
  implementation "org.springframework.boot:spring-boot-starter-security"
}
```

`Spring Boot` 는 `Maven BOM`(Bill of Materials) 을 제공하여 의존성 버전을 자동으로 관리합니다.  
따라서 `Spring Security` 의존성을 추가할 때 버전을 명시할 필요가 없습니다.  
만약 `Spring Security` 의 버전을 변경하려면, 아래와 같이 빌드 속성(`build property`) 을 사용하여 오버라이드할 수 있습니다.  

```xml

<properties>
  <!-- ... -->
  <spring-security.version>6.4.3</spring-security.version>
</properties>
```

```yml
ext['spring-security.version']='6.4.3'
```

`Spring Security` 는 `Major` 버전에서만 기존 기능과 호환되지 않는 변경 사항을 적용합니다.  
따라서 `Spring Boot` 는 호환성이 유지되는 범위 내에서 최신 버전의 `Spring Security` 를 안전하게 사용할 수 있도록 관리합니다.  
그러나 경우에 따라 `Spring Framework` 의 버전도 함께 업데이트해야 할 수도 있습니다.  
이 경우, 아래와 같이 빌드 속성(`build property`) 을 추가하여 `Spring Framework` 버전을 변경할 수 있습니다.  

```xml

<properties>
  <!-- ... -->
  <spring.version>6.2.3</spring.version>
</properties>
```

```yml
ext['spring.version']='6.2.3'
```

`LDAP`, `OAuth 2.0` 등의 추가 기능을 사용하려는 경우, 해당 기능과 관련된 프로젝트 모듈(`Project Modules`) 및 의존성(`Dependencies`) 을 함께 포함해야 합니다.  

### Standalone Usage (Without Spring Boot)

'Spring Boot' 없이 'Spring Security' 를 단독으로 사용하는 경우, 'Spring Security' 의 'BOM'(Bill of Materials) 을 사용하는 것이 권장됩니다.  
이를 통해 프로젝트 전반에서 일관된 버전의 'Spring Security' 를 유지할 수 있습니다.  

```xml
<dependencyManagement>
	<dependencies>
		<!-- ... other dependency elements ... -->
		<dependency>
			<groupId>org.springframework.security</groupId>
			<artifactId>spring-security-bom</artifactId>
			<version>{spring-security-version}</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>
	</dependencies>
</dependencyManagement>
```

```yml
plugins {
	id "io.spring.dependency-management" version "1.0.6.RELEASE"
}

dependencyManagement {
	imports {
		mavenBom 'org.springframework.security:spring-security-bom:6.4.3'
	}
}
```

최소한의 'Spring Security' 'Maven' 의존성 구성은 일반적으로 다음 예제와 같습니다.  

```xml
<dependencies>
	<!-- ... other dependency elements ... -->
	<dependency>
		<groupId>org.springframework.security</groupId>
		<artifactId>spring-security-web</artifactId>
	</dependency>
	<dependency>
		<groupId>org.springframework.security</groupId>
		<artifactId>spring-security-config</artifactId>
	</dependency>
</dependencies>
```

```yml
dependencies {
	implementation "org.springframework.security:spring-security-web"
	implementation "org.springframework.security:spring-security-config"
}
```

'LDAP', 'OAuth 2.0' 등의 추가 기능을 사용하려면, 해당 기능에 맞는 프로젝트 모듈('Project Modules') 및 의존성('Dependencies') 을 추가해야 합니다.  
'Spring Security' 는 'Spring Framework 6.2.3' 버전을 기준으로 빌드되었지만, 일반적으로 'Spring Framework 5.x' 의 최신 버전과도 호환됩니다.  
그러나 'Spring Security'의 전이적('transitive') 의존성 때문에 'Spring Framework 6.2.3' 이 자동으로 포함될 수 있으며, 이로 인해 클래스 경로('Classpath') 문제가 발생할 수 있습니다.  
이를 해결하는 가장 쉬운 방법은 'spring-framework-bom' 을 'pom.xml' 의 '<dependencyManagement>' 섹션이나, 'build.gradle' 의 'dependencyManagement' 섹션에 추가하는 것입니다.  

```xml

<dependencyManagement>
  <dependencies>
    <!-- ... other dependency elements ... -->
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-framework-bom</artifactId>
      <version>6.2.3</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

```yml
plugins {
	id "io.spring.dependency-management" version "1.0.6.RELEASE"
}

dependencyManagement {
	imports {
		mavenBom 'org.springframework:spring-framework-bom:6.2.3'
	}
}
```

위의 예제는 'Spring Security' 의 모든 전이적('transitive') 의존성이 'Spring Framework 6.2.3' 모듈을 사용하도록 보장합니다.  


### Maven Repositories

모든 'GA'(General Availability) 릴리스 는 'Maven Central' 에 배포되므로, 빌드 설정에서 추가적인 'Maven' 저장소를 선언할 필요가 없습니다.  
'Gradle' 을 사용하는 경우, 'mavenCentral()' 저장소 를 설정하면 'GA' 릴리스를 가져오는 데 충분합니다.  

```yml
repositories {
	mavenCentral()
}
```

'SNAPSHOT' 버전을 사용하는 경우, 'Spring Snapshot' 저장소를 정의해야 합니다.  

```xml
<repositories>
	<!-- ... possibly other repository elements ... -->
	<repository>
		<id>spring-snapshot</id>
		<name>Spring Snapshot Repository</name>
		<url>https://repo.spring.io/snapshot</url>
	</repository>
</repositories>
```

```yml
repositories {
	maven { url 'https://repo.spring.io/snapshot' }
}
```

'Milestone' 또는 'RC' (Release Candidate) 버전을 사용하는 경우, 'Spring Milestone' 저장소를 정의해야 합니다.  

```xml
<repositories>
	<!-- ... possibly other repository elements ... -->
	<repository>
		<id>spring-milestone</id>
		<name>Spring Milestone Repository</name>
		<url>https://repo.spring.io/milestone</url>
	</repository>
</repositories>
```

```yml
repositories {
	maven { url 'https://repo.spring.io/milestone' }
}
```

https://docs.spring.io/spring-security/reference/features/index.html
