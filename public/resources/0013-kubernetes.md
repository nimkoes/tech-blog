---
title: '[chap.12] Pod - Lifecycle'
description: >-
  Kubernetes Pod Lifecycle에서 Phase가 Pending, Running, Succeeded, Failed, Unknown으로 바뀌는 과정과 Conditions, Container State를 그림으로 정리했다.
publishedAt: '2025-03-03'
updatedAt: '2025-03-03'
tags:
  - Kubernetes
  - Pod
  - Lifecycle
status: published
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

![Pod의 Status 아래 Phase와 Conditions가, Containers의 ContainerStatuses 아래 State가 있는 상태 정보 구조](/tech-blog/resources/images/kubernetes/redraw/0013-01.svg)

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

---

![Pod가 처음 생성되면 Phase가 Pending인 상태로 시작하는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-04.svg)

Pod 의 최초 상태는 Pending 이다.

![initContainer가 추가되어 두 Container보다 먼저 실행되고 Initialized 값이 True가 되는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-05.svg)

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
      command: [ 'sh', '-c', 'until nslookup mydb; do echo waiting for mydb; sleep 2; done;' ]
```

![initContainer 실행 결과에 따라 정해지는 Initialized : True 조건을 강조한 단계](/tech-blog/resources/images/kubernetes/redraw/0013-06.svg)

initContainer 가 정상적으로 실행 되었거나, Pod 에 설정되어 있지 않았을 경우 Initialized 값이 True 가 되고 실패했을 경우 False 가 된다.

![Node Scheduling으로 Pod가 올라갈 Node1이 선정되고 PodScheduled : True가 추가되는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-07.svg)

이 Pod 가 올라갈 Node 는 직접 지정한 경우 그 node 에, 지정하지 않은 경우 k8s 가 자원의 상황을 판단하여 올라갈 Node 를 결정 한다.

![Node 선정이 끝나 True가 된 PodScheduled 조건을 강조한 단계](/tech-blog/resources/images/kubernetes/redraw/0013-08.svg)

Pod 가 올라갈 Node 선정이 완료 되면 PodScheduled 값은 True 가 된다.

![Image Downloading이 추가되어 Container에 필요한 Image를 내려받는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-09.svg)

![내려받은 두 Image가 선정된 Node1에 놓이는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-10.svg)

Container 에 image 를 다운로드 한다.

![Node 선정과 Image 다운로드 동안 두 Container가 Waiting 상태와 ContainerCreating reason을 갖는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-11.svg)

Node 를 선정하고 image 를 다운받는 동안 Container 의 상태는 Waiting 이고 reason 은 ContainerCreating 이다.

![Pending에서 Running으로 넘어가며 Pod와 두 Container의 상태가 Running이 되는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-12.svg)

본격적으로 Container 가 기동 되면서 Pod 와 Container 의 상태는 Running 이 된다.

![첫 번째 Container에 문제가 생겨 Waiting 상태와 CrashLoopBackOff reason으로 바뀌는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-13.svg)

![두 번째 Container도 Waiting 상태와 CrashLoopBackOff reason으로 바뀌는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-14.svg)

보통 정상적으로 기동이 될 수도 있지만 하나 또는 모든 Container 가 기동 중 문제가 발생하여 재 시작 될 수 있다. 문제가 발생한 경우 Container 의 상태는 Waiting 이고
CrashLoopBackOff 라는 reason 값을 가진다.

![Pod는 Running이지만 ContainerReady와 Ready 조건이 False가 되는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-15.svg)

Pod 는 Container 의 이런 상태들에 대해 Running 이라고 간주하고, 대신 내부 Condition 에 ContainerReady 와 Ready 값은 False 로 가진다.

![모든 Container가 정상 기동해 Running이 되고 ContainerReady와 Ready가 True로 바뀌는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-16.svg)

![서비스 운영 중 계속 유지되어야 하는 ContainerReady : True와 Ready : True 조건을 강조한 단계](/tech-blog/resources/images/kubernetes/redraw/0013-17.svg)

결국 모든 Container 들이 정상적으로 기동 되어 동작 한다면 Condition 들은 모두 True 값이 된다.

그래서 서비스가 계속 운영 되어야 하는 경우 이 status 가 True 인 상태를 계속 유지해야 한다.

여기서 기억해야 할 것은 Pod 의 상태가 Running 이더라도 내부 Container 들의 상태가 Running 이 아닐 수 있기 때문에 Pod 뿐만 아니라 Container 의 상태도 모니터링 해야 한다.

![일을 마친 Pod가 Running에서 Failed 또는 Succeeded 상태로 넘어가는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-18.svg)

Job 이나 CronJob 으로 생성 된 Pod 의 경우 자신의 일을 수행 했을 때는 Running 중 이지만, 일을 마치고 나면 Pod 는 더 이상 일을 하지 않는 상태가 된다. 이 때 Pod 의 상태는
Failed 나 Succeeded 두 가지 중 하나를 갖는다.

![Container 하나가 Error로 Terminated되어 Pod가 Failed가 되는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-19.svg)

만약 작업을 하고 있는 Container 중에 하나라도 문제가 생겨 에러가 발생 하면 Pod 의 상태는 Failed 가 된다.

![모든 Container가 Completed로 Terminated되어 Pod가 Succeeded가 되는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-20.svg)

Container 들이 모두 Completed 로 일들을 잘 마쳤을 때 Succeeded 가 된다.

![Failed와 Succeeded 모두 ContainerReady와 Ready 조건이 False로 바뀌는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-21.svg)

이때 또 Pod 의 Condition 값이 변하게 되는데, 성패 여부를 떠나 ContainerReady 와 Ready 의 값이 False 로 바뀌게 된다.

![Pending 상태에서 바로 Failed로 넘어가는 경우가 추가되는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-22.svg)

추가적인 경우로 Pending 중에 바로 Failed 로 빠지는 경우도 있고

![통신 장애 시 Pending이나 Running에서 Unknown이 되고, 오래 지속되면 Unknown에서 Failed로 넘어가는 단계](/tech-blog/resources/images/kubernetes/redraw/0013-23.svg)

Pending 이나 Running 중에 통신 장애가 발생하면 Pod 가 Unknown 상태로 바뀌게 된다. 통신 장애 복구가 빨리 이루어지면 다시 기존 상태로 변경 되지만 이 상태가 오래 지속 되면 Failed 로
가기도 한다.

