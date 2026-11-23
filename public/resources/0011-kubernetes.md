---
title: '[chap.10] Deployment (Recreate, RollingUpdate)'
description: >-
  Kubernetes 업그레이드 방식 ReCreate, Rolling Update, Blue/Green, Canary의 Downtime과 자원 사용을 비교하고 Deployment의 배포 과정을 YAML로 정리했다.
publishedAt: '2025-03-03'
updatedAt: '2025-03-03'
tags:
  - Kubernetes
  - Deployment
  - ReCreate
  - RollingUpdate
status: published
---
Deployment 는 하나의 운영 중인 서비스를 업데이트 하여 다시 배포해야 할 때 도움을 주는 Controller 이다.

Deployment 에 대해 알아보기에 앞서 k8s 에서 사용하는 몇 가지 업그레이드 방법에 대해 알아 본다.

![ReCreate, Rolling Update, Blue/Green, Canary 네 가지 업그레이드 방식에서 Controller와 v1·v2 Pod, Service의 관계를 비교한 구조](/tech-blog/resources/images/kubernetes/redraw/0011-01.svg)

업그레이드 방법에는 크게 ReCreate, Rolling Update, Bule/Green, Canary 등이 있다.

# ReCreate

Deployment 를 만들면 v1 의 Pod 들이 만들어 진다. 그리고 각 Pod 마다 각자의 자원을 사용 한다고 할 때 ReCreate 방법으로 를 업그레이드를 하게 되면 Deployment 는 먼저 기존의
Pod 들을 삭제 한다. 그렇기 때문에 서비스에 대한 Downtime 이 발생 하고 자원도 사용하지 않게 된다. 그리고 나서 v2 의 Pod 들을 만들어 준다.

![ReCreate 방식에서 Deployment가 v1 Pod를 모두 삭제한 뒤 v2 Pod를 만들어 그 사이 자원이 비는 Downtime이 생기는 과정](/tech-blog/resources/images/kubernetes/redraw/0011-02.svg)

이 방법의 단점은 Downtime 이 발생하기 때문에 일시적으로 서비스를 중단할 수 있는 경우에만 사용할 수 있다.

# Rolling Update

Rolling Update 를 하면 Deployment 는 v2 의 Pod 를 먼저 만들어 준다. v1 의 Pod 를 중지하지 않고 v2 의 Pod 를 만들기 때문에 그만큼 자원을 추가 사용하게 된다. 그리고 v1
과 v2 모두 동작하기 때문에 일시적으로 서로 다른 버전의 서비스를 동시에 사용하게 된다.

![Rolling Update 방식에서 Deployment가 v2 Pod를 먼저 만들고 v1 Pod를 삭제해 Downtime 없이 자원을 일시적으로 더 쓰는 과정](/tech-blog/resources/images/kubernetes/redraw/0011-03.svg)

v2 의 Pod 를 만들고 v1 의 Pod 하나를 삭제하고, 다시 v2 의 Pod 를 만들고 v1 의 Pod 를 삭제 하는 순서로 처리 된다. 다시 말해서 추가 자원을 사용 한다는 단점이 있지만 서비스
Downtime 이 없다는 장점이 있는 방법 이다.

# Blue/Green

이 방법은 Deployment 자체로 제공되는 기능은 아니고 Deployment 를 사용 할 수도 있지만 ReplicaSet 과 같이 Replicas 를 관리하는 모든 Controller 를 이용해서 처리할 수
있다.

![Blue/Green 방식에서 Service의 Label을 ver:v2로 바꿔 v1 Pod와의 연결을 끊고 v2 Pod로 즉시 전환하며 자원을 2배로 쓰는 구조](/tech-blog/resources/images/kubernetes/redraw/0011-04.svg)

Controller 를 만들어서 Pod 가 만들어 지면 Pod 에는 Label 이 있기 때문에 Service 의 Selector 와 연결 된다. 이렇게 운영 중인 상태에서 Controller 를 하나 더 만드는데
v2 에 대한 Pod 를 만들고 Label 도 v2 를 사용 한다.

이 때 자원 사용량은 기존의 2배가 된 상태에서 Service 에 있는 Label 만 수정하면, 기존 Pod 와 연결을 끊고 v2 의 Pod 와 바로 연결 된다. 이 연결은 순간적으로 바뀌기 때문에 서비스에 대한
Downtime 은 없다. 그런데 만약 v2 에 문제가 발생할 경우 Service 의 Label 을 v1 으로 바꿔 줌으로 기존 서비스로 전환하여 롤백이 쉽게 가능하다. 문제가 없을 경우에는 v1 에 대한 내용을
삭제하면 된다.

여러 방법 중 많이 사용하는 방법이고 안정적인 방법 이지만, 2배의 자원이 필요하다는 점이 단점 이다.

# Canary

v1 에 대한 Pod 가 있고 Label 이 작성 된 상태에서 Service 를 만드는데, ver:v1 이 아닌 ty:app 을 만들어 연결 한다. 이렇게 운영 중인 상태에서 테스트 목적으로 Controller 를
만들 때 Replicas 를 1로 하여 v2 에 대한 Pod 를 하나 만들고, 동일하게 ty:app 이라고 Label 을 작성하면 Service 에 자동으로 연결 된다.

![Canary 방식에서 ty:app Label을 가진 Service가 v1 Pod 두 개와 테스트용 v2 Pod 하나에 함께 트래픽을 보내는 구조](/tech-blog/resources/images/kubernetes/redraw/0011-05.svg)

Service 로 유입되는 트래픽 중에 일부는 v2 에 접근이 되고 자연스럽게 새로운 버전에 대한 테스트가 된다. 이후 문제가 발생할 경우 새로 만든 Controller 의 Replicas 만 0으로 만들면 된다.
이 방법은 불특정한 사용자에 대해 테스트 하는 방법 이다.

또 다른 방법으로 v1 과 v2 에 대한 Service 를 각각 만들고, Ingress Controller 라는 유입되는 트래픽을 url path 에 따라 Service 에 연결해주는 역할을 하는 Controller
를 사용하는 것이다.

![Ingress Controller가 /app 경로는 v1 Service로, /v2/app 경로는 v2 Service로 나눠 보내는 Canary 구조](/tech-blog/resources/images/kubernetes/redraw/0011-06.svg)

이후 문제 없이 테스트가 완료 되면 v2 에 대한 Pod 를 증가하고 Ingress Controller 에 설정을 변경한 다음 v1 에 대한 내용을 삭제하면 된다.

![v2 Pod를 늘리고 Ingress Controller의 /app 경로를 v2 Service로 바꾼 뒤 v1 Controller와 Pod를 삭제해 Downtime 없이 전환하는 과정](/tech-blog/resources/images/kubernetes/redraw/0011-07.svg)

이렇게 하면 역시 DownTime 이 발생하지 않는데 자원 사용량은 테스트 할 Pod 의 수나 v2 Pod 를 얼마나 만들어 두고 v1 의 Pod 를 다운 시키냐에 따라 증가하게 된다.

---

# Deployment

## ReCreate

Deployment 를 만들 때 Replica 에서 넣었던 selector 와 replicas 그리고 template 값을 똑같이 설정 한다. 하지만 이 값들은 Deployment 가 Pod 를 만들어서 관리하기
위한 값은 아니고 ReplicaSet 을 만들 때 사용하는 설정 값을 지정하기 위함 이다.

![Deployment의 selector, replicas, template 값으로 ReplicaSet이 만들어지고 ReplicaSet이 v1 Pod 두 개를 만들어 Service와 연결되는 구조](/tech-blog/resources/images/kubernetes/redraw/0011-08.svg)

이렇게 만들어진 ReplicaSet 은 설정 내용을 바탕으로 Pod 들을 만들게 된다. 그리고 Service 를 만들어 Label 값을 기반으로 Pod 를 연결 하면 이 Service 를 통해 Pod 에 접근할 수
있게 된다.

![Deployment의 template을 Pod v2로 업데이트한 상태로 기존 ReplicaSet과 v1 Pod는 아직 그대로인 구조](/tech-blog/resources/images/kubernetes/redraw/0011-09.svg)

이후 ReCreate 방법으로 v2 로 업그레이드 하려면 Deployment 의 template 을 v2 버전으로 업데이트 해주면 되는데, 먼저 ReplicaSet 의 replicas 를 0으로 변경 한다. 그러면
ReplicaSet 은 Pod 들을 제거하고 Service 도 연결 대상이 없어지기 때문에 DownTime 이 발생 한다.

![ReCreate 방식으로 기존 ReplicaSet의 replicas를 0으로 줄이고 새 ReplicaSet이 v2 Pod 두 개를 만들어 Service와 연결되는 구조](/tech-blog/resources/images/kubernetes/redraw/0011-10.svg)

그리고 새로운 ReplicaSet 을 만드는데 이 template 에는 변경 된 v2 의 Pod 를 넣기 때문에 Pod 들도 v2 버전으로 만들어지고 Service 는 Label 정보에 따라 Pod 와 연결 된다.

```yml
apiVersion: apps/v1
kind: Deployment                 # Deployment 를 만들 때
metadata:
  name: deployment-1
spec: # selector, replicas, template 이 포함 되고
  selector:
    matchLabels:
      type: app
  replicas: 2
  strategy:
    type: Recreate               # 배포 방식으로 Recreate 를 사용 하고
  revisionHistoryLimit: 1        # 새로운 ReplicaSet 을 만들 때 replicas 가 0이 된
  template: # ReplicaSet 을 1개만 남기겠다.
    metadata: # default 값이 10 인 optional 값
      labels:
        type: app
    spec:
      containers:
        - name: container
          image: kubetm/app:v1
      terminationGracePeriodSeconds: 10
```

## Rolling Update (default)

서비스가 운영중인 상태에서 새로운 버전으로 template 을 교체하면서 Rolling Update 가 시작 된다. 먼저 Replicas 가 1인 ReplicaSet 을 만들고 Label 값을 기반으로 Service
와 연결 된다.

![Rolling Update 중 replicas 1인 새 ReplicaSet이 v2 Pod를 만들어 Service가 v1 Pod 두 개와 v2 Pod 하나에 트래픽을 나누는 구조](/tech-blog/resources/images/kubernetes/redraw/0011-11.svg)

이후부터는 v1 과 v2 에 트래픽이 분산 된다. 그리고 기존의 ReplicaSet 의 replicas 를 1로 수정 해서 Pod 를 하나 삭제하고 v2 의 ReplicaSet 의 replicas 를 2로 바꿔 v2
의 Pod 를 하나 만든다. 마지막으로 기존 ReplicaSet 의 replicas 를 0으로 만들어 남아있는 Pod 를 모두 삭제 한다.

![Rolling Update가 끝나 기존 ReplicaSet의 replicas는 0, 새 ReplicaSet은 2가 되어 Service가 v2 Pod 두 개에만 연결되는 구조](/tech-blog/resources/images/kubernetes/redraw/0011-12.svg)

이 방법도 마찬가지로 ReplicaSet 을 제거하지 않고 배포를 종료 한다.

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deployment-2
spec:
  selector:
    matchLabels:
      type: app2
  replicas: 2
  strategy:
    type: RollingUpdate      # 배포 방식으로 RollingUpdate 를 사용 하고
  minReadySeconds: 10        # 값을 설정하지 않으면 순식간에 진행되어
  template: # 변하는 상황을 보고 싶을 경우 값을 설정
    metadata:
      labels:
        type: app2
    spec:
      containers:
        - name: container
          image: kubetm/app:v1
      terminationGracePeriodSeconds: 0
```

