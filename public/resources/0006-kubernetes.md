![0006-01](/tech-blog/resources/images/kubernetes/0006-01.png)

# ClusterIP

Service 는 기본적으로 아래 그림과 같이 자신의 ClusterIp 를 가지고 있다.

![0006-02](/tech-blog/resources/images/kubernetes/0006-02.png)

그리고 이 Service 를 Pod 에 연결시켜두면 Service 의 IP 를 통해 Pod 에 접근할 수 있게 된다.

앞서 Pod 에도 동일하게 Cluster 내에서 접근할 수 있는 IP 가 존재함에도 불구하고 굳이 Service 를 붙여서 접근하는지 의문이 생긴다. 이렇게 하는 이유는 Pod 는 k8s 에서 다양한 이유로 언제든
다운될 수 있으며 언제든 다시 생성될 수 있는 오브젝트이기 때문이다. (다시 생성 될 경우 Pod 의 IP 는 매번 달라진다.)

반면 Service 의 경우 사용자가 직접 명령을 하지 않는 한 스스로 삭제 되거나 다시 생성되지 않는다. 즉, 이 Service IP 를 사용하면 항상 연결 되어있는 Pod 에 접근할 수 있게 된다.

Service 에는 다양한 종류가 있고 각 Service 마다 Pod 에 접근하는 방식이 다르다. 그 중 가장 기본적인 방식이 ClusterIP 방식 이다. 이 IP 는 k8s Cluster 내에서만 접근이 가능한
IP 이다. Pod 에 있는 IP 와 특징이 동일하다. 즉, 이 IP 에는 Cluster 내의 다양한 오브젝트들이 접근할 수 있지만 외부에서는 접근이 불가능 하다. 또한 다수의 Pod 를 연결할 수 있는데
Service 는 트래픽을 분산해서 Pod 에 전달 한다.

```yml
apiVersion: v1
kind: Service
metadata:
  name: svc-1
spec:
  selector: # Pod 와 연결하기 위한 selector
    app: pod
  ports:
    - port: 9000         # 9000 port 로 Service 에 접근하면
      targetPort: 8080   # 8080 port 의 Pod 로 연결
  type: ClusterIP      # optional 값으로 default(ClusterIP)
```

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-1
  labels: # Service 에 연결하기 위한 lebel
    app: pod
spec:
  nodeSelector:
    kubernetes.io/hostname: k8s-node1
  containers:
    - name: container
      image: kubetm/app
      ports:
        - containerPort: 8080
```

# NodePort

NodePort 타입의 Service 에도 기본적으로 ClusterIP 가 할당 되고 ClusterIP 와 같은 기능을 포함하고 있다.

![0006-03](/tech-blog/resources/images/kubernetes/0006-03.png)

NodePort 타입이 가지는 특징은 k8s Cluster 에 연결되어 있는 모든 Node 에 동일한 Port 가 할당 되어 외부로부터 어떤 Node 든 그 IP 에 port 로 접속하면 Service 에 연결이
된다. 연결 된 Service 는 기본 기능인 자신과 연결된 Pod 에 트래픽을 전달 한다.

주의할 점은 Pod 가 있는 Node 에만 port 가 할당 되는 것이 아니라 모든 Node 에 port 가 만들어 진다.

```yml
apiVersion: v1
kind: Service
metadata:
  name: svc-2
spec:
  selector:
    app: pod
  ports:
    - port: 9000
      targetPort: 8080
      nodePort: 30000    # optional 값으로 30000~32767 값
  type: NodePort       # NodePort 타입의 Service
  externalTrafficPolicy: Local
```

추가로 위 그림 기준으로 Node1 (192.168.0.11:30000) 에 접근을 하더라도 Service 는 Node2 에 있는 Pod 에 트래픽을 전달할 수 있다. Service 입장에서는 어떤 Node 로부터
들어온 트래픽인지 상관 없이 자신에 연결되어 있는 Pod 들에게 트래픽을 전달해 주기 때문이다.

하지만 Service 생성시 `externalTrafficPolicy` 값을 Local 로 주게 되면, 특정 Node port 의 IP 로 접근하는 트래픽은 Service 가 해당 Node 에 있는 Pod 에게만
트래픽을 전달 해준다.

# Load Balancer

Local Balancer 타입으로 Service 를 만들면 NodePort 의 성격을 그대로 가지게 된다.

![0006-04](/tech-blog/resources/images/kubernetes/0006-04.png)

추가로 Local Balancer 가 생성되어 각각의 Node 에 트래픽을 분산시켜주는 역할을 한다.

한가지 문제가 있는데, 이 Load Balancer 에 접속하기 위한 외부 IP 는 k8s 를 개별 설치했을 경우 자동으로 생성되지 않기 때문에 별도로 외부 접속 IP 를 할당해 주는 plugin 이 설치 되어
있어야 IP 가 생성 된다.

GCP, AWS, Azure, OpenStack 등과 같은 k8s platform 을 사용 할 경우 외부 IP 를 지원해주는 plugin 이 설치되어 있어 Load Balancer 타입의 Service 를 생성 할
경우 알아서 외부에서 접속 할 IP 를 만들어 준다.

```yml
apiVersion: v1
kind: Service
metadata:
  name: svc-3
spec:
  selector:
    app: pod
  ports:
    - port: 9000
      targetPort: 8080
  type: LoadBalancer     # 특별한 설정 없이 타입만 지정
```

# 정리

ClusterIP 는 외부에서 접근할 수 없고 Cluster 내에서만 사용하는 IP 이다. 그렇기 때문에 이 IP 에 접근 가능한 대상은 Cluster 내부에 접근할 수 있는 운영자와 같은 인가된 사람일 수 밖에
없다. 주된 작업은 k8s 대시보드 관리 또는 각 Pod 의 서비스 상태를 디버깅하는 작업을 할 때 사용 한다.

NodePort 는 물리적인 host IP 를 통해 Pod 에 접근이 가능하다는 특징이 있다. 대부분 host IP 는 보안상 내부 망에서만 접근이 가능하도록 네트워크를 구성하기 때문에 NodePort 는
Cluster 밖에는 있지만 내부 망에서 접근해야 할 때 사용 한다. 또한 일시적인 외부 연동 용도로 사용 하는데, 예를 들면 내부에서 개발을 하다가 외부에 대모를 하는 경우 네트워크 장비에 포트 포워딩을 할 경우
사용할 수 있다.

Load Balancer 는 실제로 외부에 서비스를 노출 시키려면 Load Balancer 를 이용해야 한다. 그래야 내부 IP 가 노출되지 않고 외부 IP 를 통해 안정적으로 서비스를 노출시킬 수 있다. 다시
말해서 Load Balnacer 의 IP 는 외부에 시스템을 노출시킬 때 사용한다.

```yml
apiVersion: v1
kind: Service
metadata:
  name: svc-3
spec:
  selector: # Pod의 Label과 매칭
    app: pod
  ports:
    - port: 9000          # Service 자체 Port
      targetPort: 8080    # Pod의 Container Port
  type: ClusterIP, NodePort, LoadBalancer  # 생략시 ClusterIP
  externalTrafficPolicy: Local, Cluster    # 트래픽 분배 역할
```
