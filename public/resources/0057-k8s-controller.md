# 개요

- Kubernetes에서 Controller는 클러스터 상태를 원하는 상태로 유지하는 제어 루프이다.
- 각 Controller는 특정 리소스를 관찰하며, 정의된 스펙과 실제 상태를 비교하여 부족한 부분을 보완한다.
- 이 글에서는 주요 Controller 종류와 배경, 사용 방법, 예시 등을 차례로 살펴본다.

# 개념 설명

## ReplicationController

- 정의
    - `ReplicationController`는 지정된 수의 Pod가 항상 실행되도록 보장하는 Controller이다.
- 등장 배경
    - Pod는 일시적으로 죽거나 재시작될 수 있다.
    - 안정적인 가용성을 위해 동일한 Pod 복제본을 지속 관리할 필요가 있어 생성되었다.
- 사용 방법
    - CLI: `kubectl create rc nginx --image=nginx --replicas=3`
    - YAML
      ```yaml
      apiVersion: v1
      kind: ReplicationController
      metadata:
        name: nginx-rc
      spec:
        replicas: 3
        selector:
          app: nginx
        template:
          metadata:
            labels:
              app: nginx
          spec:
            containers:
            - name: nginx
              image: nginx
      ```
- 상세 설명
    - 레이블 셀렉터는 RC가 관리할 Pod의 기준을 정의한다.
    - 예: selector 필드에 `app: nginx`, `env: production`과 같이 설정하면 해당 라벨을 가진 Pod만 RC가 생성하고 관리된다.
    - 레이블이 일치하지 않는 Pod는 RC 범위 밖이므로 영향을 받지 않는다.
    - 업데이트 전략이 없어 RollingUpdate를 지원하지 않는다.
    - Pod 템플릿(spec.template)을 변경하려면 새로운 ReplicationController를 정의하고, 새 RC가 원하는 상태(replica 수)를 충족한 뒤 기존 RC를 삭제하는 순서로 배포해야 한다.
    - 예시: nginx 버전을 1.18로 업데이트하려면
        - `nginx-rc-v2`라는 새로운 RC 정의 파일 생성 (template.spec.containers.image: nginx:1.18)
        - `kubectl apply -f nginx-rc-v2.yaml`
        - 새 RC가 Ready 상태(replica 수 충족) 확인 후, `kubectl delete rc nginx-rc`로 기존 RC 제거
- 구체적인 예시
    - CLI로 스케일링: `kubectl scale rc nginx-rc --replicas=5`
    - 상태 확인: `kubectl get rc nginx-rc -o wide`

## ReplicaSet

- 정의
    - `ReplicaSet`은 `ReplicationController`의 후속 버전이며, 레이블 셀렉터에서 셋 연산을 지원한다.
- 등장 배경
    - 복잡한 셀렉터 요구사항을 충족하기 위해 도입되었다.
- 사용 방법
    - CLI: `kubectl create rs nginx-rs --image=nginx --replicas=3`
    - YAML
      ```yaml
      apiVersion: apps/v1
      kind: ReplicaSet
      metadata:
        name: nginx-rs
      spec:
        replicas: 3
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
              image: nginx
      ```
- 심화 사용 방법
    - `matchExpressions`로 복합 셀렉터 구성
    - `rolling update`는 `Deployment`가 사용하므로 직접 사용은 드물다.
- 상세 설명
    - `matchExpressions`는 복잡한 셀렉터 조건을 지정할 때 유용하다.
      ```yaml
      selector:
        matchExpressions:
        - key: tier
          operator: In
          values:
          - frontend
      ```
      위 설정은 `tier` 레이블이 `frontend`인 Pod만 관리한다.
    - ReplicaSet 자체에는 롤링 업데이트 전략이 없다.
    - 직접 Pod 템플릿을 변경하려면 새로운 ReplicaSet 정의를 생성하고, 새 ReplicaSet이 Ready 상태가 된 후 기존 ReplicaSet을 삭제해야 한다.
    - 레이블 셀렉터 종류 비교
        - matchLabels: 단순 key=value 일치만 지원
        - matchExpressions: In, NotIn, Exists, DoesNotExist 연산 지원(셋 연산)
- 구체적인 예시
    - 셀렉터 예시
      ```yaml
      selector:
        matchExpressions:
        - key: tier
          operator: In
          values:
          - frontend
      ```

## Deployment

- 정의
    - `Deployment`는 `ReplicaSet`을 관리하며, 선언적 롤링 업데이트와 롤백 기능을 제공한다.
- 등장 배경
    - 무중단 배포와 버전 관리 요구를 해결하기 위해 만들어졌다.
- 사용 방법
    - CLI: `kubectl create deployment nginx --image=nginx --replicas=3`
    - YAML
      ```yaml
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: nginx-deploy
      spec:
        replicas: 3
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
              image: nginx:1.16
      ```
- 심화 사용 방법
    - `strategy` 필드로 `Recreate` 또는 `RollingUpdate` 구성
    - `progressDeadlineSeconds`, `maxSurge`, `maxUnavailable`로 배포 안정성 세부 조정
- 상세 설명
    - `strategy.type`으로 `RollingUpdate`(기본) 또는 `Recreate`를 선택할 수 있다.
    - `rollingUpdate` 옵션의 `maxSurge`는 추가 생성 가능한 최대 Pod 수, `maxUnavailable`은 비가용 상태로 둘 수 있는 최대 Pod 수를 의미한다.
    - `progressDeadlineSeconds`를 지정하면 지정 시간 내에 업데이트가 완료되지 않을 때 실패로 간주된다.
- 구체적인 예시
    - 이미지 버전 업데이트
      ```bash
      kubectl set image deployment/nginx-deploy nginx=nginx:1.17
      ```
    - 롤백: `kubectl rollout undo deployment/nginx-deploy`

## DaemonSet

- 정의
    - `DaemonSet`은 클러스터의 모든 노드(또는 선택된 노드)에 지정한 Pod를 실행한다.
- 등장 배경
    - 노드별 로그 수집, 모니터링 에이전트 등을 배포하기 위해 필요했다.
- 사용 방법
    - CLI: `kubectl create daemonset fluentd --image=fluentd`
    - YAML
      ```yaml
      apiVersion: apps/v1
      kind: DaemonSet
      metadata:
        name: fluentd
      spec:
        selector:
          matchLabels:
            app: fluentd
        template:
          metadata:
            labels:
              app: fluentd
          spec:
            containers:
            - name: fluentd
              image: fluentd
      ```
- 심화 사용 방법
    - `nodeSelector`, `tolerations`로 특정 노드 그룹에만 배포
    - 업데이트 전략 변경: `OnDelete` 또는 `RollingUpdate`
- 상세 설명
    - `nodeSelector`로 특정 노드 레이블에만 배포할 수 있다.
      ```yaml
      spec:
        template:
          spec:
            nodeSelector:
              kubernetes.io/os: linux
      ```
    - `tolerations`를 사용하여 taint가 있는 노드에도 Pod를 스케줄할 수 있다.
    - taint와 toleration
      - taint: 노드에 "key=value:effect" 형태로 지정하여 해당 조건을 만족하지 않는 Pod의 스케줄을 방지하는 기능이다. 예: kubectl taint nodes node1 key=value:NoSchedule
      - toleration: Pod의 spec.tolerations 필드에 해당 taint를 허용하도록 설정하는 기능이다. 이 설정이 없는 Pod는 해당 taint가 있는 노드에 스케줄되지 않는다.
      - 예시:
        ```yaml
        spec:
          tolerations:
          - key: "key"
            operator: "Equal"
            value: "value"
            effect: "NoSchedule"
        ```
      - effect 종류:
        - NoSchedule: toleration이 없으면 스케줄 차단
        - PreferNoSchedule: toleration이 없으면 우선 배제하되, 필요 시 스케줄 허용
        - NoExecute: toleration이 없으면 이미 실행 중인 Pod도 즉시 퇴출
    - `updateStrategy.type`으로 `OnDelete`(수동 재시작 시만 업데이트) 또는 `RollingUpdate`(노드별 순차적 업데이트)를 설정할 수 있다.
- 구체적인 예시
    - 특정 OS 노드에서만 실행
      ```yaml
      spec:
        template:
          spec:
            nodeSelector:
              kubernetes.io/os: linux
      ```

## StatefulSet

- 정의
    - `StatefulSet`은 상태가 있는 애플리케이션 관리를 위해 안정적 네트워크 ID와 지속 스토리지를 제공한다.
- 등장 배경
    - 데이터베이스, 분산 스토리지처럼 순서와 식별자가 중요한 워크로드를 위해 도입되었다.
- 사용 방법
    - CLI: `kubectl create statefulset web --image=nginx` (별도 YAML 권장)
    - YAML
      ```yaml
      apiVersion: apps/v1
      kind: StatefulSet
      metadata:
        name: web
      spec:
        serviceName: "nginx"
        replicas: 3
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
              image: nginx
        volumeClaimTemplates:
        - metadata:
            name: www
          spec:
            accessModes: ["ReadWriteOnce"]
            resources:
              requests:
                storage: 1Gi
      ```
- 심화 사용 방법
    - `podManagementPolicy`로 순차적 또는 병렬적 업데이트 제어
    - `partition` 전략으로 단계별 롤링 업데이트
- 상세 설명
    - `podManagementPolicy`의 기본값 `OrderedReady`는 Pod를 순차적으로 생성/삭제한다. `Parallel`을 사용하면 동시에 처리할 수 있다.
    - `updateStrategy.rollingUpdate.partition`으로 업데이트할 Pod를 부분적으로 지정할 수 있다.
    - 예: `partition: 1` 설정 시 인덱스 1 이상의 Pod부터 업데이트한다.
- 구체적인 예시
    - 파티션 롤링 업데이트
      ```yaml
      spec:
        updateStrategy:
          type: RollingUpdate
          rollingUpdate:
            partition: 1
      ```

## Job

- 정의
    - `Job`은 일회성 배치 작업을 정의하고 완료 시까지 Pod를 관리한다.
- 등장 배경
    - 백업, 데이터 마이그레이션 같은 일회성 작업 자동화 필요성에 의해 만들어졌다.
- 사용 방법
    - CLI: `kubectl create job pi --image=perl -- perl -Mbignum -wle 'print pi(2000)'`
    - YAML
      ```yaml
      apiVersion: batch/v1
      kind: Job
      metadata:
        name: pi
      spec:
        template:
          spec:
            containers:
            - name: pi
              image: perl
              command: ["perl", "-Mbignum", "-wle", "print pi(2000)"]
            restartPolicy: OnFailure
      ```
- 심화 사용 방법
    - `backoffLimit`으로 재시도 횟수 제어
    - `completions`, `parallelism`으로 동시 작업 수 조정
- 상세 설명
    - `backoffLimit`은 실패 시 재시도할 최대 횟수를 지정한다.
    - `completions`는 완료 목표 수, `parallelism`은 동시에 생성할 Pod 수를 설정하여 작업 병렬도를 조절한다.
- 구체적인 예시
    - 동시 작업 5개
      ```yaml
      spec:
        parallelism: 5
        completions: 10
      ```

## CronJob

- 정의
    - `CronJob`은 지정된 스케줄에 따라 `Job`을 생성하는 Controller다.
- 등장 배경
    - 정기적인 배치 작업 자동화를 위해 도입되었다.
- 사용 방법
    - CLI: `kubectl create cronjob hello --image=busybox --schedule="*/1 * * * *" -- /bin/sh -c 'date; echo Hello'`
    - YAML
      ```yaml
      apiVersion: batch/v1
      kind: CronJob
      metadata:
        name: hello
      spec:
        schedule: "*/1 * * * *"
        jobTemplate:
          spec:
            template:
              spec:
                containers:
                - name: hello
                  image: busybox
                  args:
                  - /bin/sh
                  - -c
                  - date; echo Hello
                restartPolicy: OnFailure
      ```
- 심화 사용 방법
    - `startingDeadlineSeconds`, `concurrencyPolicy`로 스케줄 제어
    - `successfulJobsHistoryLimit`, `failedJobsHistoryLimit`로 기록 유지 관리
- 상세 설명
    - `startingDeadlineSeconds`는 스케줄 시간 이후 잡이 시작될 수 있는 최대 지연 시간(초)이다.
    - `concurrencyPolicy`는 `Allow`, `Forbid`, `Replace` 중 선택하며, 이전 실행 중 중첩 허용 여부를 결정한다.
    - `successfulJobsHistoryLimit` 및 `failedJobsHistoryLimit`로 보관할 잡 기록 수를 제한할 수 있다.
- 구체적인 예시
    - 이전 실패 작업 무시
      ```yaml
      spec:
        concurrencyPolicy: Forbid
      ```

## HorizontalPodAutoscaler

- 정의
    - `HorizontalPodAutoscaler`는 CPU나 메모리 사용량을 기준으로 `Deployment`나 `ReplicaSet`의 Replica 수를 자동 조정한다.
- 등장 배경
    - 애플리케이션 부하 변화에 동적으로 대응하기 위해 설계되었다.
- 사용 방법
    - CLI: `kubectl autoscale deployment nginx --cpu-percent=50 --min=1 --max=10`
    - YAML
      ```yaml
      apiVersion: autoscaling/v2
      kind: HorizontalPodAutoscaler
      metadata:
        name: nginx-hpa
      spec:
        scaleTargetRef:
          apiVersion: apps/v1
          kind: Deployment
          name: nginx-deploy
        minReplicas: 1
        maxReplicas: 10
        metrics:
        - type: Resource
          resource:
            name: cpu
            target:
              type: Utilization
              averageUtilization: 50
      ```
- 심화 사용 방법
    - 커스텀 메트릭스 연동
    - `behavior` 필드로 확장/축소 속도 제한
- 상세 설명
    - 커스텀 메트릭스(External, Object)를 사용하여 CPU/메모리 외 다른 지표로 자동 확장이 가능하다.
    - `behavior`에서 `scaleUp`과 `scaleDown` 정책을 정의할 수 있다. 예:
      ```yaml
      behavior:
        scaleUp:
          policies:
          - type: Percent
            value: 50
            periodSeconds: 60
      ```
- 구체적인 예시
    - 확장 속도 제한
      ```yaml
      spec:
        behavior:
          scaleUp:
            policies:
            - type: Percent
              value: 50
              periodSeconds: 60
      ```

# 용어

## Controller

클러스터 상태를 관찰하고 원하는 상태로 유지하도록 조치하는 제어 루프다.

## 레벨 셀렉터

리소스의 `metadata.labels` 값을 기준으로 대상 리소스를 선택하는 필터링 메커니즘입니다.

## matchLabels

단일 `key=value` 형태로 레이블 값을 정확히 일치시켜 리소스를 선택하는 셀렉터 방법입니다.

## matchExpressions

레이블 값이 특정 값의 집합에 포함되는지 등을 지정해 더 유연한 셀렉터를 제공하는 방법입니다.

## RollingUpdate

기존 Pod를 점진적으로 교체하면서 새 Pod를 생성해 무중단으로 업데이트를 수행하는 전략입니다.

## Recreate

기존 Pod를 모두 삭제한 후 새 Pod를 한 번에 생성하는 업데이트 전략입니다.

## taint

노드에 `key=value:effect` 형태로 표시해 해당 조건을 만족하지 않는 Pod의 스케줄을 차단하는 기능입니다.

## toleration

Pod에 설정해 특정 `taint`를 허용함으로써 taint가 있는 노드에도 스케줄되도록 하는 설정입니다.

## nodeSelector

Pod 스펙에 지정된 레이블을 가진 노드에서만 실행되도록 하는 필드입니다.

## podManagementPolicy

StatefulSet에서 Pod 생성 및 종료 순서를 제어하는 정책으로 `OrderedReady` 또는 `Parallel`을 선택할 수 있습니다.
