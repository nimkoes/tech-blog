---
title: '[chap.14] Pod - QoS Classes'
description: >-
  리소스를 균등하게 사용하고 있는 3개의 Pod 를 가진 Node 가 있다. 0015-02 각 Pod 가 Node 의 리소스를 균등하게
  사용하고 있기 때문에 특정 Pod 에 추가 리소스를 할당 할 수 없는 상황에서 Pod1 이 추가 리소스를 필요로 하는 상황이 발생 했다.
  그럼 Pod1 이 리소스 부족으로 에러가 발생하고 다운 되어야 할까?
publishedAt: '2025-03-03'
updatedAt: '2025-03-03'
tags:
  - Kubernetes
  - Pod
  - QoS Classes
status: published
---
![Node 리소스를 Pod1, Pod2, Pod3가 균등하게 나눠 사용하는 상태](/tech-blog/resources/images/kubernetes/redraw/0015-01.svg)

리소스를 균등하게 사용하고 있는 3개의 Pod 를 가진 Node 가 있다.
![Node에 남은 리소스가 없는 상태에서 Pod1이 추가 리소스를 필요로 하는 상황](/tech-blog/resources/images/kubernetes/redraw/0015-02.svg)

각 Pod 가 Node 의 리소스를 균등하게 사용하고 있기 때문에 특정 Pod 에 추가 리소스를 할당 할 수 없는 상황에서 Pod1 이 추가 리소스를 필요로 하는 상황이 발생 했다. 그럼 Pod1 이 리소스 부족으로
에러가 발생하고 다운 되어야 할까? 아니면 다른 Pod2 나 Pod3 을 다운시키고 Pod1 에 추가 리소스를 할당 해야 할까?

![QoS Classes가 Pod1은 Guaranteed, Pod2는 Burstable, Pod3는 BestEffort이며 BestEffort인 Pod3가 가장 먼저 리소스를 반환하는 구조](/tech-blog/resources/images/kubernetes/redraw/0015-03.svg)

k8s 에는 Application 의 중요도에 따라 이런 상황을 핸들링 할 수 있도록 세 가지 단계로 Quality of Service 를 지원해주고 있다. 지금 상황에서는 BestEffort 가 부여 된 Pod 가
가장 먼저 다운이 되고 리소스가 반환 되고 Pod1 은 필요한 리소스를 제공받아 사용할 수 있게 된다.

![BestEffort Pod3 다음으로 Burstable Pod2가 두 번째로 다운되어 리소스를 반환하고 Guaranteed Pod1이 끝까지 유지되는 순서](/tech-blog/resources/images/kubernetes/redraw/0015-04.svg)

Node 에 어느정도 자원이 남아 있지만 Pod2 에서 그보다 많은 자원을 필요로 한다면 Burstable 이 적용 된 Pod 가 다음으로 다운 되면서 리소스가 반환 된다. 그래서 Guaranteed 가 마지막까지
Pod 를 안정적으로 유지시켜주는 Class 이다.

```yml
kind: Pod
spec:
  containers:
    - resources:
        requests:
          memory: 1G
          cpu: 2
        limits:
          memory: 2G
          cpu: 4
```

QoS 는 특별한 속성이 있어서 설정할 수 있는 것은 아니다. Container 의 resource 설정이 있는데, 여기에 requests 와 limits 에 따라 memory 와 cpu 를 어떻게 설정 할지 결정
한다.

# Guaranteed

![Guaranteed는 모든 Container에 Memory와 CPU의 Request와 Limit가 같은 값으로 설정된 경우](/tech-blog/resources/images/kubernetes/redraw/0015-06.svg)
Pod 에 다수의 Container 가 있을 경우 각각의 Container 마다 Request 와 Limit 가 있어야 한다. 그리고 그 안에 memory 와 cpu 둘 다 설정 되어 있어야 하고, 각
Container 안에 설정 된 memory 와 cpu 값은 request 와 limit 가 같아야 한다. 이 모든 규칙은 만족 해야 k8s 가 이 Pod 를 Guaranteed Class 로 판단하고 Pod 의
어떤 Container 에도 request 와 limit 가 설정되어있지 않다면 BestEffort 가 된다.

# Burstable

![Burstable은 Request가 Limit보다 작거나 Request만 있거나 일부 Container만 설정된 경우](/tech-blog/resources/images/kubernetes/redraw/0015-07.svg)
Guaranteed 와 BestEffort 의 중간이라고 생각하면 된다.

가령 Container 마다 request 와 limit 는 설정되어 있지만 request 의 값이 더 작다던가, request 만 설정 되었다던가 또는 Pod 의 Container 가 두 개인데 하나만 완벽하게
설정 되어 있는 경우 모두 Bustable Class 가 된다.

추가로 Bustable Class 에 다수의 Pod 가 있을 경우 어떤 Pod 가 먼저 다운 되어 리소스를 반환하는지에 대해서도 알 필요가 있다. 이것은 OOM(Out Of Memory) Score 에 따라 결정
된다.

![Burstable Pod 간에는 Request 대비 실제 Memory 사용량(OOM Score)이 높은 Pod2가 Pod3보다 먼저 제거되는 기준](/tech-blog/resources/images/kubernetes/redraw/0015-08.svg)

현재 Pod2 와 Pod3 의 request memory 가 각각 5G, 8G 로 설정 되어 있는데, 그 안의 Application 의 실제 memory 가 똑같이 4G 만큼 사용되고 있다고 하면 Pod2 의
memory 사용량은 80% 이고 Pod3 는 50% 이다. OOM Score 는 Pod2 가 80% 로 더 크기 때문에 k8s 는 Pod2 를 먼저 제거 한다.

# BestEffort

![BestEffort는 어떤 Container에도 Request와 Limit가 설정되지 않은 경우](/tech-blog/resources/images/kubernetes/redraw/0015-09.svg)

이렇게 세 가지 Class 는 Container 에 request 와 limit 를 어떻게 설정 하느냐에 따라 결정 된다.
