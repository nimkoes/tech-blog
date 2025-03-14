---
title: "DaemonSet, Job, CronJob"
description: ""
author: "nimkoes"
date: "2021-03-02"
---

DaemonSet, Job, CronJob Controller 가 무엇이고 언제 사용 하는지 정리 한다.

# DaemonSet

각 Node 에 자원이 다르게 남아있는 상태에서 ReplicaSet 의 경우 Pod 를 Scheduler 에 의존해서 Node 에 배치할 때, 만약 Node1 에 자원이 많이 남아있는 경우 Pod 를 많이 배치할
것이다. 그리고 Node3 과 같이 자원이 별로 없으면 Pod 를 배치하지 않을 수도 있다.

![0012-01](/tech-blog/resources/images/kubernetes/0012-01.png)

반면 DaemonSet 은 Node 의 자원 상태와 상관 없이 각 Node 에 Pod 가 하나씩 만들어진다는 특징이 있다. 만약 Node 가 10개면 각 노드에 하나씩 총 10개의 Pod 가 생긴다. 이렇게 각
Node 에 설치해서 사용해야 하는 서비스 들이 있다.

각 Node 에 설치해서 사용해야 하는 서비스의 대표적인 예

1. 성능 수집 (Prometheus)
2. 로그 수집 (fluentd)
3. Storage (GlusterFS)

# Job / CronJob

Pod 는 크게 직접 , ReplicaSet 을 통해 그리고 Job 을 통해 만들어지는 세 가지 경우가 있다. 모두 같은 Pod 지만 누구에 의해 만들어졌냐에 따라 조금씩 다른 부분이 존재 한다.

![0012-02](/tech-blog/resources/images/kubernetes/0012-02.png)

Pod 들이 Node1 에서 구동중인 상태에서 Node 가 다운이 된 상황을 가정하자. 그러면 직접 만든 Pod 도 장애가 발생한 것이고 해당 서비스는 더 이상 유지할 수 없다. 하지만 Controller 에 의해
만들어진 Pod 들은 장애가 감지 되면 다른 Node 에 다시 만들어지기 때문에 서비스는 유지 된다. 그리고 ReplicaSet 에 의해 만들어진 Pod 는 일을 하지 않으면 Pod 를 Restart 시켜주기 때문에
서비스가 반드시 유지되어야 하는 경우 사용해야 한다.

추가로 Recreate 는 Pod 를 다시 만들어 주기 때문에 Pod 의 이름이나 IP 등이 변경 되지만 Restart 는 Pod 는 그대로 있고 Pod 안의 Container 만 재시작 해준다는 차이가 있다. 반면
Job 으로 만들어진 Pod 는 프로세서가 일을 하지 않으면 Pod 는 종료 된다. 이 때 종료의 의미는 Pod 가 삭제되는 것은 아니고 자원을 사용하지 않는 상태로 멈춰있기 때문에 Pod 에 들어가서 로그 등을
확인할 수 있다. 이후 불필요한 경우 직접 삭제할 수 있다.

![0012-03](/tech-blog/resources/images/kubernetes/0012-03.png)

그리고 CronJob 은 이러한 Job 들을 주기에 맞춰 생성하는 역할을 하는데 일반적으로 이 Job 을 하나의 단위로 사용하지 않고 CronJob 을 만들어서 특정 시간에 반복적으로 실행 되도록 할 때 사용 한다.

대표적인 예

1. 매일 새벽에 정기적으로 하는 데이터 백업 작업
2. 주기적인 업데이트 확인
3. 예약 메일 등 메시지 발송 작업

# DaemonSet

selector 와 template 이 있어서 모든 Node 에 template 으로 Pod 를 만들고 selector 와 Label 로 DaemonSet 과 연결 된다.

![0012-04](/tech-blog/resources/images/kubernetes/0012-04.png)

만약 Node 들의 OS 종류가 달라 그림과 같이 Label 이 설정 되어있고, 특정 os (ubuntu) 에는 Pod 를 설치하고 싶지 않은 경우 Pod 의 nodeSelector 를 설정 하여 이 Label 이
없는 Node 에는 Pod 를 생성하지 않도록 할 수 있다.

![0012-05](/tech-blog/resources/images/kubernetes/0012-05.png)

DaemonSet 은 하나의 Node 에 하나를 추가해서 Pod 를 만들 수는 없지만 Node 에 Pod 를 만들지 않을 수는 있다. 그리고 특정 Node 로 접근했을 때 그 Node 에 들어있는 Pod 에 접근이
되도록 많이 사용 한다. 그렇기 때문에 한 가지 더 생각해볼 수 있다. 만약 Node 타입의 Service 를 만들고 'externalTrafficPolicy: Local' 옵션을 추가하면 특정 Node 의
NodePort 로 접근하면 이 트래픽은 Service 로 가고 다시 해당 Node 의 Pod 로 연결 되도록 할 수 있다. 이렇게도 사용할 수 있지만 hostPort 라는 것을 설정하면 직접 Node 에 있는
Port 가 Pod 로 연결 되어 동일한 결과를 얻을 수 있다.

```yml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: daemonset-1
spec:
  selector: # selector 와
    matchLabels:
      type: app
  template: # template 이 있고 template 안에는
    metadata:
      labels:
        type: app
    spec:
      nodeSelector: # nodeSelector 를 지정하면
        os: centos             # 이 Label 이 설정 된 Node 에만 Pod 가 생성 한다.
      containers: # 지정하지 않으면 모든 Node 에 생성 한다.
        - name: container
          image: kubetm/app
          ports:
            - containerPort: 8080  # container 에 Port 가 있고
              hostPort: 18080      # hostPort 를 지정할 수 있다.

# 18080 Port 로 들어온 트래픽은 해당 Pod 의 8080 이라는 Container port 에 연결 된다.
```

# Job

Job 도 마찬가지로 template 과 selector 가 있는데 이 template 에는 특정 작업만 하고 종료가 되는 Pod 들을 담게 되고 selector 는 직접 만들지 않아도 Job 이 알아서 만들어
준다.

![0012-06](/tech-blog/resources/images/kubernetes/0012-06.png)

template 을 가지고 일반적으로 하나의 Pod 를 생성하고 Pod 가 일을 다 하면 Job 도 종료 되지만 completions 라는 값을 6을 주면 6개의 Pod 를 하나씩 순차적으로 실행 시켜 모두 작업이
끝나야 Job 도 종료 된다. 또한 parallelism 이라고 2 라는 값을 주면 2개 씩 Pod 가 생성 되고 activeDeadlineSeconds 라고 해서 30 이라는 값을 주면 이 Job 은 30초 후
기능을 정지 해버리고 실행되고 있는 모든 Pod 들을 삭제 해버린다. 아직 실행하지 못한 Pod 들은 실행되지 않는다.

```yml
apiVersion: batch/v1
kind: Job
metadata:
  name: job-1
spec:
  completions: 6
  parallelism: 2
  activeDeadlineSeconds: 30
  template: # template 에 Pod 의 내용들이 들어간다.
    spec:
      restartPolicy: Never
      containers:
        - name: container
          image: kubetm/init
```

# CronJob

job Template 이 있고 이 내용을 바탕으로 Job 을 만들고 schedule 에 설정한 값을 주기로 Job 을 만들어 준다.

![0012-07](/tech-blog/resources/images/kubernetes/0012-07.png)

schedule 을 그림과 같이 설정 할 경우 Job 이 1분 간격으로 만들어 지고 Job 은 또 자신의 역할인 Pod 를 만들게 된다. 추가로 ConcurrencyPolicy 기능이 있는데 Allow,
Forbid, Replace 세가지 옵션 값을 가진다. 일반적으로 이 Policy 를 설정하지 않으면 Allow 가 default 값이다.

![0012-08](/tech-blog/resources/images/kubernetes/0012-08.png)

Allow 는 1분 간격으로 schedule 한다고 설정 했을 때 앞서 만들어진 Pod 가 구동 및 종료 상태와 무관하게 자신의 schedule 에 맞춰 새로운 Job 을 만들고 Pod 가 생성 된다.

Forbid 는 1min 때 Job 이 생성 되지만 다음 schedule 타임 까지도 Pod 가 종료되지 않고 실행 중이라면 해당 시간의 Job 은 skip 된다. 그리고 이 Pod 가 종료되는 즉시 다음
schedule 타입의 Job 이 만들어 진다.

Replace 는 1min 에 Job 이 만들어 졌고 2min schedule 타임에 1min 의 Pod 가 running 중이라고 하면 새로운 Pod 를 만들면서 Job 과 연결 한다. 그렇기 때문에 2min 때
새로운 Job 은 생기지 않지만 새로운 Pod 가 생기면서 Job 과 연결 된다. 만약 Pod 가 자신의 schedule 타입에 종료 되었다면 3min 때 새로운 Job 이 만들어 지고 Pod 가 만들어 진다.

이런 옵션 값을 가지고 CronJob 은 더욱 정교하게 Job 을 다룰 수 있다. 이 밖에도 실행중인 Job 을 일시 중지 (Suspend) 시킬 수 있고 Manual 로 Trigger 할 수 있다.

```yml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cron-job
spec:
  schedule: "*/1 * * * *"
  concurrencyPolicy: Allow
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: container
              image: kubetm/init
```
