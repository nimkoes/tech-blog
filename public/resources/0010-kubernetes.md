---
title: '[chap.09] Replication Controller, ReplicaSet (Template, Replicas, Selector)'
description: >-
  Kubernetes ReplicationController와 ReplicaSet의 template, replicas, selector 동작을 YAML로 정리하고 matchExpressions 연산자별 Pod 선택 차이를 비교했다.
publishedAt: '2025-03-03'
updatedAt: '2025-03-03'
tags:
  - Kubernetes
  - Controller
  - ReplicaSet
status: published
---
![Controller가 장애 Pod를 다른 Node에 다시 만드는 Auto Healing, Pod 버전을 v1에서 v2로 바꾸고 되돌리는 Software Update, 부하 Pod를 늘리는 Auto Scaling](/tech-blog/resources/images/kubernetes/redraw/0010-01.svg)

k8s 의 Controller 는 서비스를 관리하고 운영하는데 큰 도움을 준다.

# Auto Healing

Node 위에 Pod 가 있는데 이 Pod 가 갑자기 다운 되거나 이 Pod 가 Scheduling 되어 있는 Node 가 다운 될 경우 Controller 는 장애를 바로 인지하고 Pod 를 다른 Node 에 새로
만들어 준다.

# Software Update

다수의 Pod 에 대한 버전을 upgrade 해야 할 경우 Controller 를 통해 한 번에 쉽게 할 수 있고, upgrade 도중에 문제가 생기면 rollback 할 수 있는 기능을 제공 한다.

# Auto Scaling

Pod 의 리소스가 최대치에 다다랐을 경우 Controller 는 이 상태를 파악하고 Pod 를 하나 더 만들어 줌으로 부하를 분산 시키고 Pod 가 다운되지 않도록 하여 서비스 장애 없이 안정적으로 운영할 수
있다.

# Job

일시적인 작업을 해야하는 경우 Controller 가 필요한 순간 Pod 를 만들어서 해당 작업을 수행하고 삭제 한다.

![Job Controller가 필요할 때만 Pod를 만들어 자원을 쓰고 작업이 끝나면 Pod를 삭제해 자원을 반환하는 흐름](/tech-blog/resources/images/kubernetes/redraw/0010-02.svg)

이렇게 하면 그 순간에만 자원을 사용 하고, 작업 후에 반환 하기 때문에 효율적인 자원 활용이 가능해 진다.

k8s 의 다양한 오브젝트들이 이러한 Controller 의 기능을 지원 한다.

현재 Replication Controller 는 deprecated 되었고 이것을 대체하는 것이 ReplicaSet 이다. Template 과 Replicas 는 Replication Controller 와
ReplicaSet 모두 가지고 있고 Selector 는 ReplicaSet 에만 존재 한다.

# Template

![Replication의 selector가 type:web Pod와 연결되고 template을 Pod:v2로 바꾼 뒤 기존 Pod가 삭제되면 Pod:v2로 다시 만들어지는 흐름](/tech-blog/resources/images/kubernetes/redraw/0010-03.svg)

Controller 와 Pod 는 Service 와 Pod 처럼 Label 과 Selector 로 연결 된다. 1-1 의 Pod 와 같이 type:web 이라는 Label 이 붙어 있고 1-2 와 같이 매핑되는
Selector 를 만들면 연결이 된다. 그리고 Controller 를 만들 때 template 으로 Pod 의 내용을 넣게 되는데, Controller 는 Pod 가 다운되면 template 을 사용해서 Pod 를
새로 만들어 준다. 이런 특성을 사용해서 애플리케이션을 업그레이드 할 수 있는데, template 에 V2 에 대한 Pod 를 업데이트 하고 기존에 연결 되어 있던 Pod 를 다운 시키면 Controller 는
template 을 가지고 새로 업그레이드 된 Pod 를 새로 만들면서 버전이 업그레이드 된다.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-1
  labels:
    type: web       # Pod 에 Label 을 작성
spec:
  containers:
    - name: container
      image: kubetm/app:v1
```

```yml
apiVersion: v1
kind: ReplicationController    # ReplicationController 를 만들 때
metadata:
  name: replication-1
spec:
  replicas: 1
  selector:
    type: web                  # selector 를 설정하면 Pod 와 연결 된다
  template: # template 으로 Pod 의 내용이 들어가는데
    metadata:
      name: pod-1
    labels: # 이곳에도 동일하게 label 을 지정해줘야
      type: web                # 새로 만들어질 때 이 Controller 와 연결 된다.
    spec:
      containers:
        - name: container
          image: kubetm/app:v2
```

# Replicas

![replicas를 3으로 늘리면 Pod가 Scale Out 되고 Pod 없이 replicas 2와 template만 있으면 Controller가 Pod 2개를 만드는 구조](/tech-blog/resources/images/kubernetes/redraw/0010-04.svg)

기능은 간단하다. replicas 에 적은 수 만큼 Pod 가 관리 된다. replicas 의 수를 늘리면 scale out, 줄이면 scale in 이 발생 한다.

Template 와 Replicas 기능을 통해 Pod 와 Controller 를 따로 만들지 않고 한 번에 만들 수 있다. 오른쪽과 같이 replicas 와 template 에 대한 내용을 담아서 Pod 없이
Controller 만 만들 경우 Controller 는 replicas 가 2 인데 현재 연결 되어 있는 Pod 가 없기 때문에 template 에 있는 Pod 의 내용을 기반으로 2 개의 Pod 를 만든다.

# Selector

![Replication은 type:web label이 같은 Pod1, Pod2만 연결하고, ReplicaSet도 matchLabels(type:web)와 matchExpressions(key ver, Exists)를 모두 만족하는 Pod1, Pod2만 선택하는 구조](/tech-blog/resources/images/kubernetes/redraw/0010-05.svg)

ReplicationController 의 Selector 는 key 와 value 가 같은 label 을 연결 해준다. Pod3 과 같은 경우 Replication 의 label 과 value 가 다르기 때문에
연결해 주지 않는다.

반면 ReplicaSet 은 Selector 에 두 개의 추가 속성이 있는데 matchLabels 와 matchExpressions 가 있다.

matchLabels 는 ReplicationController 와 같이 key 와 value 가 모두 같아야 연결을 해주고, matchExpressions 는 key 와 value 를 좀 더 정교하게 다룰 수
있다. 예를 들어 그림과 같이 key: ver 을 넣고 operator: Exists 라고 넣으면 value 는 다르지만 label 의 key 가 ver 인 모든 Pod 를 선택 하게 된다.
단, matchLabels 와 matchExpressions 를 함께 쓰면 두 조건을 모두 만족해야 하므로, 그림에서는 type: web 이면서 ver key 를 가진 Pod1, Pod2 만 선택 되고
type: db 인 Pod3 은 선택 되지 않는다.

```yml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: replica-1
spec:
  replicas: 3
  selector: # selector 에 바로 key-value 가 들어가지 않는다.
    matchLabels:
      type: web                     # matchLabels 에는 key-value 가 들어가고
    matchExpressions: # matchExpression 에는
      - { key: ver, operator: Exists }  # 상세 설정이 들어간다.
  template:
    metadata:
      name: pod
... 이하 생략
```

operator 에 사용할 수 있는 값

## Exists

![Exists 연산자로 key A를 가진 Pod1, Pod2만 ReplicaSet에 연결되는 예](/tech-blog/resources/images/kubernetes/redraw/0010-06.svg)
사용자가 key 를 정하고 이 key 값을 가지고 있는 Pod 들을 연결

## DoesNotExists

![DoesNotExist 연산자로 key A가 없는 Pod3만 ReplicaSet에 연결되는 예](/tech-blog/resources/images/kubernetes/redraw/0010-07.svg)
key 에 똑같이 A 라고 설정하면 key 에 A 가 들어가지 않은 Pod 들을 연결

## In

![In 연산자로 key A의 값이 2 또는 3인 Pod2, Pod3이 ReplicaSet에 연결되는 예](/tech-blog/resources/images/kubernetes/redraw/0010-08.svg)
key 와 values 를 지정할 수 있는데, key 와 values 의 값들 중 일치하는 Pod 들을 연결

## NotIn

![NotIn 연산자로 key A의 값이 2, 3이 아닌 Pod1만 ReplicaSet에 연결되는 예](/tech-blog/resources/images/kubernetes/redraw/0010-09.svg)
key 와 values 를 지정할 수 있는데, key 와 values 의 값들 중 일치하지 않는 Pod 들을 연결

















