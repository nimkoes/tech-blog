![0005-01](/tech-blog/resources/images/kubernetes/0005-01.png)

# Pod

Pod 안에는 하나의 독립 된 서비스를 구동할 수 있는 Container 들이 있다. 그리고 각 Container 들은 서비스가 연결될 수 있도록 port 를 가지고 있다. 하나의 Container 는 하나 이상의
port 를 가질 수 있지만, 하나의 Pod 내에서 같은 port 를 가지는 Container 는 존재할 수 없다.

![0005-02](/tech-blog/resources/images/kubernetes/0005-02.png)

Container1 과 Container2 는 하나의 host 로 묶여 있다고 볼 수 있기 때문에, 만약 Container1 에서 Container2 로 접속을 할
때 [localhost:8080](http://localhost:8080) 으로 접근할 수 있다.

Pod 가 생성될 때 IP 주소가 할당 되는데 k8s Cluster 내에서 Pod 에 접근할 때 사용하는 것으로 외부에서는 이 IP 로 접근이 불가능 하다. 만약 Pod 에 문제가 생기면 시스템이 이것을 감지하고
Pod 를 재생성 하게 되는데 이 때 IP 주소는 바뀐다.

```yml
# 그림과 같은 Pod 를 생성하기 위한 YAML 파일
apiVersion: v1
kind: Pod                       # Pod 를 생성
metadata:
  name: pod-1                   # Pod 의 이름
spec:
  containers: # Container 에 Container1 과 Container2 를 생성
    - name: container1
      image: kubetm/p8000         # Container1 은 이미지의 이름이 p8000
      ports:
        - containerPort: 8000       # Container1 은 8000 번 port 에 노출
    - name: container2
      image: kubetm/p8080         # Container2 는 이미지의 이름이 p8080
      ports:
        - containerPort: 8080       # Container2 는 8080 번 port 에 노출
```

# Label

Label 은 Pod 뿐만 아니라 모든 오브젝트에 붙일 수 있는데, Pod 에 가장 많이 사용 한다.

![0005-03](/tech-blog/resources/images/kubernetes/0005-03.png)

Label 을 사용하는 이유는 목적에 따라 오브젝트들을 분류하고, 분류 된 오브젝트들만 선별하여 연결하기 위함이다.

Label 의 구성은 key 와 value 가 한 쌍이고 하나의 Pod 에는 다수의 Label 을 붙일 수 있다. 위와 같이 Label 이 작성 된 상태에서

1. 웹 개발자가 웹 화면만 보고싶은 경우 type 이 web 인 Label 을 가진 Pod 들을 Service 에 연결해서 이 Service 정보를 공유
2. 서비스 운영자에게는 lo 가 production 인 Lebel 을 가진 Pod 들을 Service 에 연결해서 이 Service 정보를 공유하면 된다.

```yml
# Pod 생성시 label 정보 추가
apiVersion: v1
kind: Pod
metadata:
  name: pod-2
  labels: # label 정보를 추가할 때 k-v 형식을 사용
    type: web
    lo: dev
spec:
  containers:
    - name: container
      image: kubetm/init
```

```yml
# 서비스 생성시 연결 할 label 정보 추가
apiVersion: v1
kind: Service
metadata:
  name: svc-1
spec:
  selector: # selector 에 label 의 k-v 를 넣으면 매칭되는 Pod 에 연결
    type: web
  ports:
    - port: 8080
```

# NodeSchedule

Pod 는 결국 다수의 Node 중 하나의 Node 에 올라가야 한다. 이 때 사용자가 직접 Node 를 선택하는 방법과 k8s 가 자동으로 선택하는 방법이 있다.

![0005-04](/tech-blog/resources/images/kubernetes/0005-04.png)

직접 선택하는 경우 Pod 에 Lebel 을 붙인 것과 같이 Node 에 Label 을 붙이고 Pod 를 생성할 때 Node 를 지정할 수 있다.

```yml
# 3-1 Node 를 직접 선택하는 경우
apiVersion: v1
kind: Pod
metadata:
  name: pod-3
spec:
  nodeSelector: # Pod 생성시 Node 의 Label 과 매칭하는 k-v 를 작성
    hostname: node1
  containers:
    - name: container
      image: kubetm/init
```

k8s 의 Scheduler 가 판단해서 지정해주는 경우 Node 의 가용 자원을 보고 판단 한다. Node1 과 Node2 는 각각 1 기가와 3.7 기가의 메모리가 남아있는 상황이다. 이 때 새로 생성 할 Pod
가 필요한 메모리가 3 기가이기 때문에 k8s 가 Pod 를 Node2 쪽으로 Scheduling 해준다. 추가로 리소스 사용량을 명시하는 이유는 Pod 내의 애플리케이션에 부하가 생길 경우 Node 자원을 무한정
사용하려 하기 때문이다. 이런 경우 같은 Node 의 모든 Pod 가 죽게 된다.

```yml
# Pod 생성시 리소스 사용량 제한 설정
apiVersion: v1
kind: Pod
metadata:
  name: pod-4
spec:
  containers:
    - name: container
      image: kubetm/init
      resources:
        requests: # Pod 에서 사용 할 리소스는
          memory: 2Gi       # 2 기가의 메모리를 요구하고
        limits:
          memory: 3Gi       # 최대 허용 메모리는 3 기가 이다
```

limits 설정에 대해 Memory 사용량 초과시 Pod 를 종료시키고, cpu 의 경우 사용량 초과시 request 수치로 리소스 양을 낮추기는 해도 직접 Pod 를 종료 시키지는 않는다. 이렇게 Memory 와
cpu 가 다르게 동작하는 이유는 각 자원에 대한 특성 때문이다.
