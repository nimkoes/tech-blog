---
title: "Namespace, ResourceQuota, LimitRange"
description: ""
author: "nimkoes"
date: "2021-03-02"
---

본격적인 사용 방법을 알아보기에 앞서 Namespace, ResourceQuota, LimitRange 를 왜 사용해야 하는지 먼저 정리한다.

![0009-01](/tech-blog/resources/images/kubernetes/0009-01.png)

k8s Cluster 라고 해서 전체 사용할 수 있는 자원이 있다. 일반적으로 Memory, CPU 가 있고 Cluster 안에는 다수의 Namespace 를 Namespace 안에는 다수의 Pod 를 만들 수
있다. 각 Pod 는 필요한 자원을 Cluster 자원을 공유하여 사용하는데, 만약 한 Namespace 안에 있는 Pod 가 Cluster 에 남은 자원을 모두 사용해버리면 다른 Pod 입장에서는 더 이상 사용할
수 있는 자원이 없어서 자원이 필요할 때 문제가 생기게 된다.

이런 문제를 해결하기 위해 ResourceQuota 가 존재하는데 이것은 Namespace 마다 최대 한계를 설정할 수 있다. Pod 가 사용할 수 있는 자원은 ResourceQuota 에 설정된 값을 넘을 수 없기
때문에 한 Pod 가 더 많은 자원을 사용하지 못해 문제가 될 수는 있지만 다른 Namespace 에 있는 Pod 에는 영향을 주지 않도록 한다.

그림의 가장 오른쪽에 있는 Namespace 와 같이 한 Pod 가 너무 많은 자원을 사용하면 다른 Pod 가 이 Namespace 에 더 이상 들어올 수 없게 된다. 그렇게 하지 못하도록 하기 위해
LimitRange 를 주어 Namespace 에 들어오는 Pod 의 크기를 제한할 수 있다. 한 Pod 의 자원 사용량이 LimitRange 에 설정 된 값보다 작아야 Namespace 에 들어올 수 있다.

추가로 ReourceQuota, LimitRange 는 Namespace 에만 적용할 수 있는 것은 아니고 Cluster 에 설정하여 전체 자원에 대한 제한을 할 수 있다.

# Namespace

![0009-02](/tech-blog/resources/images/kubernetes/0009-02.png)

한 Namespace 안에는 같은 타입의 오브젝트에 대해 같은 이름을 사용할 수 없다. 오브젝트마다 UUID 가 존재 하지만 한 Namespace 안에서는 같은 종류의 오브젝트라면 이름도 UUID 와 같이 유일한
key 역할을 할 수 있다.

Namespace 의 대표적인 특징으로 자신과 다른 Namespace 의 자원과 분리되어 관리 된다는 것인데, Pod 에 Label 을 붙이고 Service 에는 Selector 를 설정하여 연결하는데 서로 다른
Namespace 라면 연결되지 않는다. Node 나 PV 와 같이 모든 Namespace 에서 공유해서 사용할 수 있는 자원도 있지만 지금까지 살펴본 대부분의 자원은 Namespace 단위로 공유해서 사용 된다.

추가로 Namespace 안에 있는 자원을 삭제하게 되면 그 아에 있던 자원들도 모두 삭제되기 때문에 Namespace 를 삭제할 때는 유의해야 한다.

```yml
# Namespace 생성 예시
apiVersion: v1
kind: Namespace
metadata:
  name: nm-1      # 이름 외에 특별한 설정값 없음
```

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-1
  namespace: nm-1       # Pod 를 만들 때 속할 Namespace 를 지정
  labels:
    app: pod
spec:
  containers:
    - name: container
      image: kubetm/app
      ports:
        - containerPort: 8080
```

```yml
apiVersion: v1
kind: Service
metadata:
  name: svc-1
  namespace: nm-1
spec:
  selector:
    app: pod
  ports:
    - port: 9000
      targetPort: 8080
```

# ResourceQuota

![0009-03](/tech-blog/resources/images/kubernetes/0009-03.png)

ResourceQuota 는 namespace 의 자원 한계를 설정하는 오브젝트 이다. namespace 에 제한하고 싶은 자원을 명시할 수 있는데, (2-2) 를 보면 namespace 에 속할 Pod 들의 전체
request 자원과 memory 의 최대 값을 각각 1 기가로 하겠다는 설정 이다.

한 가지 기억할 것은 ResourceQuota 가 지정 된 namespace 에 Pod 를 만들 때 (2-4) 와 같이 무조건 동일한 스펙을 명시해야 한다. 만약 (2-3) 과 같이 스펙을 명시하지 않으면 이 Pod
는 (2-1) namespace 에 만들어지지 않는다.

또한 각 Pod 에 명시한 제한 값의 총 합이 namespace 에 설정한 최대 값보다 클 경우 나중에 만드는 Pod 는 생성되지 않는다.

```yml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: rq-1
  namespace: nm-1          # 할당 할 namespace 설정
spec:
  hard: # hard 라는 속성에
    requests.memory: 3Gi   # 제한 할 자원의 종류와 한계치를 설정
    limits.memory: 6Gi
```

제한 가능한 자원 종류 : cpu, memory, storage
오브젝트 생성 개수 제한 : Pod, Service, ConfigMap, PVC ...

# LimitRange

![0009-04](/tech-blog/resources/images/kubernetes/0009-04.png)

LimitRange 의 기능은 각 Pod 마다 namespace 에 들어갈 수 있는지 자원 체크를 해준다.

체크하는 항목

- min
  - Pod 에서 설정 되는 memory 의 제한 값이 0.1 기가가 넘어야 한다.
- max
  - Pod 에서 설정되는 memory 의 제한 값이 0.4 기가를 넘을 수 없다.
- maxLimitRequestRatio
  - request 값과 limit 값의 비율이 최대 3 배를 넘을 수 없다.

(3-3) Pod 의 경우 설정 된 max memory 가 0.4 기가 인데 0.5 기가를 설정 하였으므로 namespace 에 속할 수 없다.

추가로 defaultRequest 와 default 속성이 있는데, (3-3') 와 같이 Pod 에 아무 설정을 하지 않았을 경우 자동으로 request 값과 limit 값이 할당 된다.

```yml
apiVersion: v1
kind: LimitRange
metadata:
  name: nm-1               # 할당 할 namespace 명시
spec:
  limits: # limit 속성에
    - type: Container        # type 을 Container 별로 제한
      min:
        memory: 1Gi
      max:
        memory: 4Gi
      maxLimitRequestRatio:
        memory: 3
      defaultRequest:
        memory: 1Gi
      default:
        memory: 2Gi
```
