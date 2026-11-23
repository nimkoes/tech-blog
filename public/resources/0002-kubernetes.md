---
title: '[chap.01] Kubernetes 사용 이유'
description: >-
  Kubernetes를 쓰는 이유를, 서버 자원을 최대 부하에 맞춰 고정해 두던 As-Is 구조와 Auto Scaling, Auto Healing, Deployment로 자원과 배포를 자동화하는 To-Be 구조를 비교해 정리했다.
publishedAt: '2025-03-03'
updatedAt: '2025-03-03'
tags:
  - Kubernetes
  - introduce
status: published
---
원활한 서비스 제공을 위해 필요한 자원을 미리 준비하는 것은 비용과 관리 측면에서 어려움이 있다.

![As-Is는 시간대별 최대 부하에 맞춰 A·B·C 서비스 서버와 백업 서버를 고정으로 두고 Blue Green·Canary로 배포하며, To-Be는 Auto Scaling·Auto Healing·Deployment로 서버 자원을 자동 조절하는 구조](/tech-blog/resources/images/kubernetes/redraw/0002-01.svg)

## As-Is

A, B, C 각 서비스는 시간대 별로 필요한 자원이 유동적으로 바뀌지만, 서버 자원을 동적으로 변경할 수 없어 최대 부하를 견딜 수 있는 자원을 미리 준비시켜야 한다.
각 서비스별 장애 상황에 대비해 최소 하나의 백업 서버가 필요하기 때문에 3대의 서버가 추가로 필요하다.
무중단 서비스를 제공하기 위해 운영 배포시 한 번에 한 대씩 서버 작업을 해야 한다.

## To-Be

A, B, C 각 서비스는 auto scaling 기술을 통해 CPU, 메모리, 디스크, 네트워크 트래픽과 같은 시스템 자원들의 메트릭(metric) 값을 모니터링하여 서버 자원을 자동으로 조절한다.
장애가 발생한 서버에 있는 서비스들이 자동으로 다른 서버로 이동하는 auto healing 기능을 사용하기 때문에 다수의 백업 서버가 필요하지 않다.
deployment 오브젝트를 사용하여 무중단 배포가 가능하다.







