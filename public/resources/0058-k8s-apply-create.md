# kubectl apply

`kubectl apply`는 선언적(Declarative) 방식으로 리소스를 생성하거나 업데이트한다.  
사용자가 작성한 YAML/JSON 매니페스트 파일을 기반으로 클러스터 상태를 **원하는 상태**(desired state)로 맞춘다.  
이미 존재하는 리소스가 있으면 매니페스트와 비교하여 변경된 부분만 패치(patch)하고, 없으면 생성(create)한다.  
이 방식은 매니페스트에 정의된 원하는 상태를 etcd에 저장한 뒤, 컨트롤러가 주기적으로 클러스터의 실제 상태와 비교하여 자동으로 조치하는 지속적 동기화(continuous reconciliation) 모델이다.

```bash
# 예제: 선언적 매니페스트를 적용
kubectl apply -f deployment.yaml
```

```yaml
# deployment.yaml 예시
apiVersion: apps/v1         # API 그룹 및 버전
kind: Deployment            # 생성할 리소스 종류
metadata:
  name: nginx-deployment    # 객체 이름
spec:
  replicas: 2               # 파드 개수
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.21
```

```text
# 실행 결과 예시
deployment.apps/nginx-deployment created
# 이후 매니페스트를 수정하고 재실행하면 "configured" 메시지가 출력된다.
```

# kubectl create

`kubectl create`는 즉시(Imperative) 방식으로 리소스를 생성(create)만 수행한다.  
YAML 없이도 커맨드 옵션을 통해 리소스를 스펙(Specification)을 지정할 수 있으며, 한 번 생성 후에는 매니페스트와의 동기화 기능이 없다.  
업데이트할 때는 다시 `create` 명령으로는 할 수 없으며, `replace` 또는 `apply`를 사용해야 한다.  
이 방식은 명령 실행 시점에만 리소스를 생성하며, 이후에는 클러스터 상태와 매니페스트 간 동기화를 수행하지 않으므로 리소스를 업데이트하려면 `kubectl replace`, `kubectl patch` 또는 삭제 후 재생성(delete & create) 과정을 거쳐야 한다.
같은 이름으로 스펙을 변경해 `kubectl create`를 다시 실행하면 “AlreadyExists” 오류가 발생하며, 기존 리소스는 수정되지 않는다.

```bash
# 예제: 명령어만으로 Deployment 생성
kubectl create deployment nginx-deploy --image=nginx:1.21 --replicas=2
```

```text
# 실행 결과 예시
deployment.apps/nginx-deploy created
```

### -f 옵션

`kubectl create`는 `-f` 옵션으로 매니페스트 파일을 통해 리소스를 생성할 수 있다. 이 경우 매니페스트에 정의된 스펙 그대로 생성하며, 이미 존재하는 리소스가 있으면 오류를 반환한다.

```bash
# 예제: 매니페스트 파일로 Deployment 생성
kubectl create -f deployment.yaml
```

```text
# 실행 결과 예시
deployment.apps/nginx-deploy created
```

# 비교 정리

| 구분     | kubectl apply                 | kubectl create       |
|--------|-------------------------------|----------------------|
| 방식     | 선언적(Declarative)              | 명령적(Imperative)      |
| 입력     | YAML/JSON 매니페스트 파일            | CLI 옵션 또는 `-f` 매니페스트 |
| 생성     | 리소스가 없으면 생성                   | 항상 생성                |
| 업데이트   | 매니페스트와 비교하여 변경된 부분 반영         | 지원하지 않음 (재생성 필요)     |
| 동기화 관리 | 매니페스트와 클러스터 간 상태 동기화          | 없음                   |
| 롤백 지원  | `apply` 버전 히스토리에 기반한 간단 롤백    | 없음                   |
| 사용 예시  | CI/CD 파이프라인, GitOps 워크플로우에 적합 | 테스트나 일회성 생성에 적합      |

---

# 용어 정의

## 선언적(Declarative)

사용자가 원하는 최종 상태를 정의하고, 시스템이 해당 상태로 수렴하도록 자동으로 적용·관리하는 방식이다.

## 명령적(Imperative)

사용자가 수행할 작업(명령)을 순차적으로 지시하는 방식으로, 각 명령 실행 시점에 즉시 효과가 발생한다.

## 매니페스트(Manifest)

Kubernetes 리소스의 구조와 설정을 정의한 YAML 또는 JSON 파일이다.

## Patch

기존 리소스의 일부 속성을 변경하기 위한 차이(diff) 기반 업데이트 방식이다.

## etcd

Kubernetes의 분산 키-값 저장소로, 클러스터의 전체 상태를 저장·관리한다.
