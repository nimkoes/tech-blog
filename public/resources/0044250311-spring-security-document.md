---
title: "Spring Security 6.4.3 Document 읽기"
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

