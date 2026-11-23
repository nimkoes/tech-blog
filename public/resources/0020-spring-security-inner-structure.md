---
title: '[chap.01] Spring Security 동작 원리 개요'
description: >-
  Spring Security가 WAS 필터에서 요청을 가로채는 원리를 DelegatingFilterProxy, FilterChainProxy, SecurityFilterChain의 역할과 구조로 정리했다.
publishedAt: '2025-03-08'
updatedAt: '2025-03-08'
tags:
  - Spring Security
  - introduce
status: published
---
# Spring Security 동작 원리 개요

- 클라이언트의 요청은 `WAS`(Web Application Server / ex> `tomcat`) 의 `filter` 를 통과한 다음 `Spring Container`의 `Controller`에 도달한다.
- `WAS` 의 `filter` 에 새로운 `filter` 를 추가하여 요청을 가로챈다.
- 가로챈 요청은 `Spring Container` 내부에 정의한 로직을 통과 한다.
- `Spring Security` 의 로직을 처리한 다음 다시 `WAS` 의 다음 `filter` 로 복귀하여 요청을 처리 한다.

![DelegatingFilterProxy 안 FilterChainProxy가 URL 패턴별 SecurityFilterChain을 골라 위임하는 구조도](/tech-blog/resources/images/spring-security-inner-structure/0020-01.png)

- `DelegatingFilterProxy`
  - `Spring Security` 의 필터 체인을 `WAS` 의 `Servlet Filter` 로 등록하기 위한 `Spring` 제공 클래스 이다.
  - `WAS`(`Tomcat` 등)에서 `DelegatingFilterProxy` 를 실행하면 `Spring Container` 내부에서 관리하는 필터(`SecurityFilterChain`)로 요청을 위임
    한다,
  - `Spring Context` 내부의 `FilterChainProxy` 를 찾아 실행하는 역할을 한다.
- `FilterChainProxy`
  - `Spring Security` 의 핵심 필터 이다.
  - `DelegatingFilterProxy` 에 의해 실행되며, 내부적으로 여러 개의 `SecurityFilterChain` 을 관리 한다.
- `SecurityFilterChain`
  - 특정 요청(URL 패턴 등)에 대한 보안 규칙을 포함한 필터 모음 이다.
  - `Spring Security Filter` 들의 묶음으로, 실제 로직이 처리 되는 부분 이다.
  - 여러 개의 `SecurityFilterChain` 을 생성하여 URL 패턴별로 다르게 보안 규칙을 적용 할 수 있다.
