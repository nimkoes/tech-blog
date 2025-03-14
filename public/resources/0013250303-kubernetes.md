---
title: "Pod - Lifecycle"
description: ""
author: "nimkoes"
date: "2021-03-02"
---

Pod 에는 Lifecycle 이 존재하고 어떤 Pod 든 만들어지고 사라지는 과정을 거치게 된다. Lifecycle 은 각 단계 별로 하는 행동이 다르다는 특징을 갖는다. Pod 역시 단계별로 주요 행동들이 있고,
앞으로 알아 볼 ReadinessProbe, LivenessProbe, Qos, Policy 등 다양한 기능들이 Pod 의 특정 단계와 관련이 있기 때문에 Lifecycle 에 대해 잘 알아야 한다.

Pod 를 생성하고 나면 아래와 같이 Status 에 대한 값을 확인할 수 있다.

```yml
status:
  phase: Pending
  conditions:
    - type: Initialized
      status: 'True'
      lastProbeTime: null
      lastTransitionTime: '2019-09-26T22:07:56Z'
    - type: PodScheduled
      status: 'True'
      lastProbeTime: null
      lastTransitionTime: '2019-09-26T22:07:56Z'
    - type: ContainersReady
      status: 'False'
      lastProbeTime: null
      lastTransitionTime: '2019-09-26T22:08:11Z'
      reason: ContainersNotReady
    - type: Ready
      status: 'False'
      lastProbeTime: null
      lastTransitionTime: '2019-09-26T22:08:11Z'
      reason: ContainersNotReady


containerStatuses:
  - name: container
    state:
      waiting:
        reason: ContainerCreating
      lastState: { }
      ready: false
      restartCount: 0
      image: tmkube/init
      imageID: ""
      started: false
```

상기 내용에 대한 전체적인 구조는 아래와 같다.

![0013-01](/tech-blog/resources/images/kubernetes/0013-01.png)

1. Pod > Status > Phase : Pod 의 전체 상태를 대표하는 속성
   1. Pending
   2. Running
   3. Succeeded
   4. Failed
   5. Unknown
2. Pod > Status > Conditions : Pod 가 생성 되면서 실행하는 각 단계와 단계의 상태를 알려주는 속성
   1. Conditions
      1. Initialized
      2. ContainerReady
      3. PodScheduled
      4. Ready
   2. Reason
      1. ContainersNotReady
      2. PodCompleted
3. Pod > Containers > State : Pod 안에 있는 각 Container 를 대표하는 상태
   1. State
      1. Waiting
      2. Running
      3. Terminated
   2. Reason
      1. ContainerCreating
      2. CrashLoopBackOff
      3. Error
      4. Completed

Pod 의 전체 상태를 나타내는 것이 Phase 라고 했는데 이 상태가 어떻게 바뀌고 바뀜에 따라 Pod 의 Container 동작이 어떻게 달라지는지 정리 한다.

![0013-03](/tech-blog/resources/images/kubernetes/0013-03.gif)

---

![0013-04](/tech-blog/resources/images/kubernetes/0013-04.png)

Pod 의 최초 상태는 Pending 이다.

![0013-05](/tech-blog/resources/images/kubernetes/0013-05.png)

띄우려고 하는 Container 가 기동되기 전에 초기화 해야 하는 내용이 있는 경우 그 내용을 담는 initContainer 가 있다. 만약 Volume 이나 보안 설정을 위해 사전 설정을 해야 하는 등의 경우에
해당 한다.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers:
    - name: myapp-container
      image: busybox:1.28
      command: [ 'sh', '-c', 'echo The app is running! && sleep 3600' ]
  initContainers: # Pod 생성 내용 안에 initContainers 항목으로 초기화 스크립트를 삽입할 수 있다.
    - name: init-myservice
      image: busybox:1.28
      command: [ 'sh', '-c', 'until nslookup myservice; do echo waiting for myservice; sleep 2; done;' ]
    - name: init-mydb
      image: busybox:1.28
      command: [ 'sh', '-c', 'unitl mslookup mydb; do echo waiting for mydb; sleep 2; done;' ]
```

![0013-06](/tech-blog/resources/images/kubernetes/0013-06.png)

initContainer 가 정상적으로 실행 되었거나, Pod 에 설정되어 있지 않았을 경우 Initialized 값이 True 가 되고 실패했을 경우 False 가 된다.

![0013-07](/tech-blog/resources/images/kubernetes/0013-07.png)

이 Pod 가 올라갈 Node 는 직접 지정한 경우 그 node 에, 지정하지 않은 경우 k8s 가 자원의 상황을 판단하여 올라갈 Node 를 결정 한다.

![0013-08](/tech-blog/resources/images/kubernetes/0013-08.png)

Pod 가 올라갈 Node 선정이 완료 되면 PodScheduled 값은 True 가 된다.

![0013-09](/tech-blog/resources/images/kubernetes/0013-09.png)

![0013-10](/tech-blog/resources/images/kubernetes/0013-10.png)

Container 에 image 를 다운로드 한다.

![0013-11](/tech-blog/resources/images/kubernetes/0013-11.png)

Node 를 선정하고 image 를 다운받는 동안 Container 의 상태는 Waiting 이고 reason 은 ContainerCreating 이다.

![0013-12](/tech-blog/resources/images/kubernetes/0013-12.png)

본격적으로 Container 가 기동 되면서 Pod 와 Container 의 상태는 Running 이 된다.

![0013-13](/tech-blog/resources/images/kubernetes/0013-13.png)

![0013-14](/tech-blog/resources/images/kubernetes/0013-14.png)

보통 정상적으로 기동이 될 수도 있지만 하나 또는 모든 Container 가 기동 중 문제가 발생하여 재 시작 될 수 있다. 문제가 발생한 경우 Container 의 상태는 Waiting 이고
CrashLoopBackOff 라는 reason 값을 가진다.

![0013-15](/tech-blog/resources/images/kubernetes/0013-15.png)

Pod 는 Container 의 이런 상태들에 대해 Running 이라고 간주하고, 대신 내부 Condition 에 ContainerReady 와 Ready 값은 False 로 가진다.

![0013-16](/tech-blog/resources/images/kubernetes/0013-16.png)

![0013-17](/tech-blog/resources/images/kubernetes/0013-17.png)

결국 모든 Container 들이 정상적으로 기동 되어 동작 한다면 Condition 들은 모두 True 값이 된다.

그래서 서비스가 계속 운영 되어야 하는 경우 이 status 가 True 인 상태를 계속 유지해야 한다.

여기서 기억해야 할 것은 Pod 의 상태가 Running 이더라도 내부 Container 들의 상태가 Running 이 아닐 수 있기 때문에 Pod 뿐만 아니라 Container 의 상태도 모니터링 해야 한다.

![0013-18](/tech-blog/resources/images/kubernetes/0013-18.png)

Job 이나 CronJob 으로 생성 된 Pod 의 경우 자신의 일을 수행 했을 때는 Running 중 이지만, 일을 마치고 나면 Pod 는 더 이상 일을 하지 않는 상태가 된다. 이 때 Pod 의 상태는
Failed 나 Succeeded 두 가지 중 하나를 갖는다.

![0013-19](/tech-blog/resources/images/kubernetes/0013-19.png)

만약 작업을 하고 있는 Container 중에 하나라도 문제가 생겨 에러가 발생 하면 Pod 의 상태는 Failed 가 된다.

![0013-20](/tech-blog/resources/images/kubernetes/0013-20.png)

Container 들이 모두 Completed 로 일들을 잘 마쳤을 때 Succeeded 가 된다.

![0013-21](/tech-blog/resources/images/kubernetes/0013-21.png)

이때 또 Pod 의 Condition 값이 변하게 되는데, 성패 여부를 떠나 ContainerReadty 와 Reday 의 값이 False 로 바뀌게 된다.

![0013-22](/tech-blog/resources/images/kubernetes/0013-22.png)

추가적인 경우로 Pending 중에 바로 Failed 로 빠지는 경우도 있고

![0013-23](/tech-blog/resources/images/kubernetes/0013-23.png)

Pending 이나 Running 중에 통신 장애가 발생하면 Pod 가 Unknown 상태로 바뀌게 된다. 통신 장애 복구가 빨리 이루어지면 다시 기초 상태로 변경 되지만 이 상태가 오래 지속 되면 Failed 로
가기도 한다.

