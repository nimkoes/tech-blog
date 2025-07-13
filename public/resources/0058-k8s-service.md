# Kubernetes Service란?

쿠버네티스(Kubernetes)에서 **Service**는 '네트워크에서 Pod를 안정적으로 접근할 수 있도록 해주는 객체'이다.

## 왜 Service가 필요한가?

쿠버네티스에서는 Pod가 생성될 때마다 이름이 바뀌고, IP 주소도 매번 달라진다. 예를 들어, `my-app`이라는 애플리케이션을 여러 개의 Pod로 실행한다면 이 Pod들은 시간이 지남에 따라 죽었다가 다시 만들어지며 IP 주소가 바뀐다. 따라서 `서비스` 없이 직접 Pod에 접근하려고 하면 문제가 생긴다. IP가 바뀌기 때문이다. 이 문제를 해결하기 위해 쿠버네티스는 **Service**를 제공한다.

### 실생활 비유로 이해하기

**아파트 관리실 비유**

- Pod = 아파트의 각 세대 (101호, 102호, 103호...)
- 각 세대는 입주자가 바뀔 때마다 전화번호를 바뀐다
- Service = 아파트 관리실
- 외부에서 아파트에 연락하려면 각 세대의 전화번호를 기억할 필요 없이, 관리실 전화번호만 알면 된다
- 관리실이 알아서 현재 입주 중인 세대에게 연결해준다

## Service는 어떤 역할을 하나?

Service는 내부적으로 다음과 같은 역할을 한다.

- Pod들의 집합에 **고정된 IP와 DNS 이름**을 부여한다.
- Service에 연결하면, 내부적으로 연결할 수 있는 Pod 중 하나로 트래픽을 라우팅해준다.
- **로드 밸런싱** 기능도 내장되어 있다.

### DNS란?

**DNS (Domain Name System)**

- 인터넷에서 도메인 이름을 IP 주소로 변환해주는 시스템
- 예: `www.google.com` → `142.250.191.78`
- 사람이 기억하기 쉬운 도메인 이름을 컴퓨터가 이해하는 IP 주소로 바꿔주는 역할

**일반적인 DNS 작동 방식**

- 사용자가 `www.example.com`에 접속하려고 함
- 브라우저가 DNS 서버에 "www.example.com의 IP 주소가 뭐야?"라고 질문
- DNS 서버가 "192.168.1.100입니다"라고 답변
- 브라우저가 192.168.1.100으로 접속

**쿠버네티스 내부 DNS**

- 쿠버네티스 클러스터 내부에도 자체 DNS 시스템이 있음
- `kube-dns` 또는 `CoreDNS`라는 컴포넌트가 담당
- 클러스터 내부의 서비스들을 도메인 이름으로 찾을 수 있게 해줌

**쿠버네티스 Service의 DNS**

- Service를 만들면 자동으로 DNS 이름이 생성됨
- 형식: `<서비스이름>.<네임스페이스>.svc.cluster.local`
- 예: `nginx-service.default.svc.cluster.local`
- 같은 네임스페이스에서는 `<서비스이름>`만으로도 접근 가능
- 예: `nginx-service`로 바로 접근 가능

**실제 사용 예시**

```bash
# Pod 내부에서 다른 Service에 접근할 때
curl http://nginx-service/health
# 실제로는 nginx-service.default.svc.cluster.local로 변환되어 접근
```

### 로드 밸런싱이란?

**로드 밸런싱 (Load Balancing)**

- 여러 Pod에 요청을 균등하게 분배하는 기능
- 예: 웹사이트에 100명이 동시 접속하면, 3개의 Pod가 있다면 각각 33-34명씩 분배
- 하나의 Pod가 과부하되는 것을 방지하고 전체 성능을 향상시킨다

## 핵심 구성 요소

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app   # 어떤 Pod를 연결할지 선택
  ports:
    - protocol: TCP
      port: 80          # 서비스가 노출할 포트
      targetPort: 8080  # 실제 Pod가 열고 있는 포트
```

### 구성 해석

- `selector`: 라벨이 `app: my-app`인 Pod들을 찾아 연결한다.
- `port`: 클러스터 외부에서 서비스에 접속할 때 사용할 포트
- `targetPort`: 실제 Pod 내부 애플리케이션이 사용하는 포트

### 포트 개념 쉽게 이해하기

**포트 (Port) 비유**

- 포트 = 건물의 출입문
- `port: 80` = 건물 정문 (외부에서 들어오는 문)
- `targetPort: 8080` = 실제 사무실 문 (내부에서 일하는 곳)
- 방문자가 정문(80번 포트)으로 들어오면, 관리자가 알아서 사무실(8080번 포트)로 안내해준다

## 서비스 타입 (type)

쿠버네티스(Kubernetes) 클러스터는 여러 노드(Node)들로 구성된 환경으로, 그 내부에서는 Pod들이 상호 통신할 수 있다. 하지만 외부에서 이들 Pod에 접근하려면 **Service**가 필요하다. 서비스는 Pod에 **고정된 IP (Cluster 내 가상 IP)** 와 **DNS 이름**을 부여하여, 애플리케이션의 IP가 변경되더라도 항상 같은 경로로 접근할 수 있도록 한다. 이 고정된 주소는 쿠버네티스 클러스터 내부에서 자동으로 관리된다.

쿠버네티스는 서비스의 **노출 범위(접근 가능한 범위)**에 따라 아래와 같은 네 가지 타입을 제공한다.

| 타입              | 외부 접근 가능 여부                     | 설명                                                                                                                                                   | 예시 구성                                                    | 접속 예시 (GET /health)                                        |
|-----------------|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|------------------------------------------------------------|
| ClusterIP (기본값) | ✕ 내부에서만 가능                      | 클러스터 내부에서만 접근 가능한 가상 IP 부여                                                                                                                           | `type: ClusterIP`                                        | `kubectl exec -it POD -- curl http://nginx-service/health` |
| NodePort        | ◯ 외부 접근 가능 (Node IP + Port)     | 각 노드의 고정된 포트를 통해 외부에서 접근 가능                                                                                                                          | `type: NodePort`, 포트 예: 30080                            | `curl http://<NodeIP>:30080/health`                        |
| LoadBalancer    | ◎ 외부 접근 가능 (Cloud LoadBalancer) | 클라우드 제공자의 로드 밸런서를 통해 외부에 공개                                                                                                                          | `type: LoadBalancer`                                     | `curl http://<EXTERNAL-IP>/health`                         |
| ExternalName    | ◯ 외부 DNS 이름으로 연결                | 클러스터 내부에서 외부 DNS 이름으로 라우팅되도록 설정한다. 이 서비스는 내부 DNS 질의를 외부 도메인으로 포워딩할 뿐 Pod과의 연결이나 로드밸런싱 기능은 없다. 주로 외부 API 서버나 서드파티 서비스를 클러스터 내부에서 고정된 이름으로 접근할 때 사용한다. | `type: ExternalName`, 예: `externalName: api.example.com` | `curl http://external-api/health`                          |

### 서비스 타입을 실생활로 이해하기

**건물 접근 방식 비유**

1. **ClusterIP** = 사내 전화망
  - 건물 내부 직원들만 사용 가능
  - 외부에서는 접근 불가

2. **NodePort** = 건물 정문
  - 누구나 건물 주소 + 문 번호로 접근 가능
  - 예: "서울시 강남구 테헤란로 123번지, 1층 정문"

3. **LoadBalancer** = 건물 로비 + 안내 데스크
  - 외부에서 건물 주소만 알면 접근 가능
  - 안내 데스크가 알아서 적절한 층으로 안내

4. **ExternalName** = 건물 내부에서 외부 건물로 연결하는 전화
  - 내부에서 외부 번호를 내부 번호로 저장해서 사용

## 각 타입별 구성 예시

### ClusterIP 예시 (기본 내부 통신용)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: clusterip-svc
spec:
  selector:
    app: demo-app
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
```

**접속 방법 (내부 Pod에서 실행)**

```bash
kubectl exec -it <pod-name> -- curl http://clusterip-svc/health
```

**언제 사용하나요?**

- 데이터베이스 서비스 (외부에서 직접 접근하면 안 되는 경우)
- 내부 API 서버
- 마이크로서비스 간 통신

### NodePort 예시 (외부에서 접근 가능한 고정 포트)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nodeport-svc
spec:
  selector:
    app: demo-app
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080
  type: NodePort
```

**접속 방법 (외부 브라우저 또는 CLI)**

```bash
curl http://<NodeIP>:30080/health
```

**언제 사용하나요?**

- 개발 환경에서 빠른 테스트
- 클라우드 로드밸런서가 없는 환경
- 임시 외부 접근이 필요한 경우

### LoadBalancer 예시 (클라우드에서 외부 노출)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: lb-svc
spec:
  selector:
    app: demo-app
  ports:
    - port: 80
      targetPort: 8080
  type: LoadBalancer
```

**접속 방법**

```bash
kubectl get svc lb-svc
# EXTERNAL-IP 확인 후
curl http://<EXTERNAL-IP>/health
```

**언제 사용하나요?**

- 프로덕션 환경의 웹 애플리케이션
- 외부 사용자가 접근해야 하는 서비스
- 클라우드 환경 (AWS, GCP, Azure 등)

### ExternalName 예시 (외부 도메인 사용)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-svc
spec:
  type: ExternalName
  externalName: api.example.com
```

**접속 방법**

```bash
curl http://external-svc/health
```

**언제 사용하나요?**

- 외부 API 서버 연결 (예: 결제 API, 지도 API)
- 서드파티 서비스 연결
- 클러스터 내부에서 외부 서비스를 고정 이름으로 접근하고 싶을 때

이 타입은 실제로는 외부 도메인을 내부 이름으로 매핑하는 역할만 수행하며, 포트 포워딩이나 로드밸런싱은 하지 않는다.

## 예시: 간단한 nginx 서비스 구성

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx
      ports:
        - containerPort: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

- 위 구성은 `app=nginx` 라벨이 있는 Pod들과 연결하는 `nginx-service`를 만든다.
- 이 서비스는 클러스터 내부에서만 접근할 수 있다 (ClusterIP).

### 이 예시를 단계별로 이해하기

1. **Pod 생성**: nginx 웹서버가 80번 포트로 실행됨
2. **라벨 설정**: `app: nginx` 라벨로 이 Pod를 식별
3. **Service 생성**: 같은 라벨을 가진 Pod들을 찾아서 연결
4. **접근 방법**: `nginx-service`라는 이름으로 접근하면 자동으로 nginx Pod로 연결

## 용어 정리

### Pod

쿠버네티스에서 컨테이너가 실행되는 최소 단위이다.

**쉽게 이해하기**

- Pod = 하나의 독립적인 컴퓨터
- 여러 개의 컨테이너를 포함할 수 있음
- 각 Pod는 고유한 IP 주소를 가짐 (하지만 재시작하면 바뀜)

### Service

여러 Pod를 묶어 하나의 네트워크 접근 지점을 만들어주는 리소스이다.

**쉽게 이해하기**

- Service = 여러 컴퓨터(Pod)를 하나의 가상 컴퓨터로 묶어주는 역할
- 외부에서는 하나의 주소로 접근하지만, 내부적으로는 여러 Pod에 분산

### Label

Pod를 식별하기 위한 메타데이터이며, 서비스는 이를 이용해 연결할 대상 Pod를 찾는다.

**쉽게 이해하기**

- Label = 물건에 붙이는 스티커
- 예: `app: nginx`, `env: production`, `version: v1.0`
- Service는 특정 스티커가 붙은 Pod들만 찾아서 연결

### ClusterIP

클러스터 내부에서만 접근 가능한 가상의 IP이다.

**쉽게 이해하기**

- ClusterIP = 사내 전화번호
- 외부에서는 전화할 수 없고, 사내에서만 사용 가능
- 예: 192.168.1.100 같은 내부 IP

### NodePort

각 노드에서 고정된 포트를 열어 외부 접근을 가능하게 한다.

**쉽게 이해하기**

- NodePort = 건물의 정문 번호
- 모든 건물(노드)에 같은 번호의 문이 열려있음
- 외부에서 건물 주소 + 문 번호로 접근 가능

### LoadBalancer

클라우드에서 외부 로드 밸런서를 자동으로 연결해주는 방식이다.

**쉽게 이해하기**

- LoadBalancer = 건물의 안내 데스크
- 외부에서 건물 주소만 알면 접근 가능
- 안내 데스크가 알아서 적절한 층(노드)으로 안내
- 클라우드 제공자가 자동으로 만들어줌
