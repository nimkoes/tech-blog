![0014-01](/tech-blog/resources/images/kubernetes/0014-01.png)

Pod 를 만들면 그 안에 Container 가 생기고 Pod 와 Container 의 상태가 Running 이 되면서 그 안에 있는 Application 도 정상적으로 구동이 되고 있을 것이다. 그리고
Service 에 연결 되는데 이 Service 의 IP 가 외부에 노출되어 다수의 사용자에 의해 서비스가 이용 된다.

![0014-02](/tech-blog/resources/images/kubernetes/0014-02.png)

현재 하나의 Service 에 두 개의 Pod 가 연결되어 있고 트래픽이 반으로 나뉜다고 하자. 이 때 Node2 서버가 문제가 생겨 다운이 된 경우 그 위의 Pod 도 Failed 가 되면서 사용자의 모든 트래픽이
Pod1 로 들어가게 된다.

![0014-03](/tech-blog/resources/images/kubernetes/0014-03.png)

Pod1 이 트래픽을 견뎌준다면 서비스를 유지하는데 문제는 없다. 다운이 된 Pod2 는 Auto Healing 기능에 의해 다른 Node 에 생성을 시도 한다. 그 과정에서 Pod 와 Container 가
Running 상태가 되면서 Service 와 연결 되는데 Application 이 구동 중인 순간이 발생 한다.

Service 와 연결이 되자 마자 트래픽이 Pod2 로 유입되기 때문에 Application 이 구동 되는 동안 사용자는 50% 확률로 Error 페이지를 보게 되는 경우가 생기게 된다.

![0014-04](/tech-blog/resources/images/kubernetes/0014-04.png)

Pod 를 만들 때 ReadinessProbe 를 주게 되면 이런 문제를 피할 수 있다. ReadinessProbe 가 Application 이 완전히 구동 되기 전에는 Service 와 연결되지 않도록 해주기
때문이다. 따라서 Pod2 의 상태는 Running 이지만 트래픽은 계속 Pod1 에만 유입 되고 Application 이 완전히 구동 된 것이 확인 되면 Service 와 연결 되면서 트래픽이 분산 된다.

![0014-05](/tech-blog/resources/images/kubernetes/0014-05.png)

서비스 운영 중 갑자기 Application 에 장애가 발생할 수 있다. 이건 서버에는 문제가 없는데 그 위에 동작하는 Application 자체에만 문제가 생긴 경우와 같다.

![0014-06](/tech-blog/resources/images/kubernetes/0014-06.png)

이런 상황을 감지해 주는 게 LivenessProbe 이다. Pod 를 만들 때 LivenessProbe 를 설정하면 Application 에 문제가 발생할 경우 Pod 를 다시 생성하도록 하여 잠시 동안 트래픽
에러는 발생 하지만 지속적으로 에러가 발생하는 것은 방지해 준다.

즉, ReadinessProbe 를 설정하여 Application 구동 중 트래픽 실패를 방지하고, LivenessProbe 를 설정하여 Application 장애가 발생한 경우 지속적인 트래픽 실패를 방지할 수
있도록 해야 한다.

# ReadinessProbe, LivenessProbe

하나의 Service 에 Pod 가 연결 되어 있는 상태에서 Pod 를 하나 더 생성 할 건데 이 Pod 는 Container 에 HostPath 로 Node 의 Volume 이 연결되어 있다. 기본적으로
ReadinessProbe 와 LivenessProbe 는 사용 목적만 다를 뿐이고 설정할 수 있는 내용은 동일하다.

![0014-07](/tech-blog/resources/images/kubernetes/0014-07.png)

공통으로 들어가는 속성들을 보면 크게 httpGet, Exec, tcpSocket 으로 해당 Application 의 상태를 확인할 수 있다.

## httpGet

Port, Host, Path, HttpHeader, Scheme 을 확인할 수 있다.

## Exec

Command 를 사용해서 특정 명령어를 전송하여 그에 따른 결과를 확인할 수 있다.

## tcpSocket

Port, Host 를 통해 ReadinessProbe 와 LivenessProbe 의 성공 여부를 확인할 수 있다.

추가로 설정할 수 있는 옵션 값이 있다.

- initialDelaySeconds
  - default : 0 초
  - 최초 Probe 를 하기 전에 딜레이 시간
- periodSeconds
  - default : 10 초
  - Probe 를 체크하는 시간의 간격
- timeoutSeconds
  - default : 1 초
  - 결과가 도착해야 하는 시간
- successThreshold
  - default : 1 회
  - 몇 번 성공 결과를 받아야 정말 성공인지 설정
- failureThreshold
  - default : 3 회
  - 몇 번 실패 결과를 받아야 정말 실패인지 설정

# ReadinessProbe

Exec 를 사용해서 Command 로 ready.txt 파일을 조회 한다.

![0014-08](/tech-blog/resources/images/kubernetes/0014-08.png)

최초 delay 5초, 체크 간격 10초, 3번 성공 시 정상 구동으로 설정했다면 Pod 를 만들 때 Node 가 Schedule 되고 이미지가 다운 받아 지면서 Pod 와 Container 상태는 Running 이
되지만 이 Probe 가 성공하기 전까지는 Condition 에 Container Ready 상태와 Ready 상태가 false 로 남아 있고 EndPoint 에서는 이 Pod 의 IP 를 NotReadyAddr 로
간주하고 Service 에 연결하지 않는다.

![0014-09](/tech-blog/resources/images/kubernetes/0014-09.png)

k8s 는 ReadinessProbe 의 내용 대로 Application 의 기동 상태를 체크하는데, Container 상태가 Running 이 되면 최초 5초간 지연 하고 있다가 5초가 지나면 ready.txt
파일이 있는지 체크해보고, 파일이 없으면 10초 후에 다시 체크를 하게 된다.

![0014-10](/tech-blog/resources/images/kubernetes/0014-10.png)

이 Node 에 Ready.txt 라는 데이터를 추가하면 Container 의 Volume 과 연결 되어 있기 때문에 다음에 ReadinessProbe 를 체크할 때 성공 결과를 받게 된다. 그리고 3번 성공하게
되면 Condition 의 상태는 true 가 되고 EndPoint 도 정상적으로 Address 로 간주 하면서 Service 와 연결 되게 된다.

# LivenessProbe

하나의 Service 에 두 개의 Pod 가 Running 되고 있는 상태를 가정 한다. 이 중 한 Application 의 내용을 보면 /health 라는 요청을 보내면 Status 로 200을 주면서 서비스가
정상 운영 중이라는 Health Check 가 만들어져 있다.

![0014-11](/tech-blog/resources/images/kubernetes/0014-11.png)

그리고 이 Container 에는 LivenessProbe 가 설정되어 있고, 내용은 httpGet 으로 path에 /health 경로를 체크 한다. 옵션으로는 최초 5초 지연과 10초 간격 체크 그리고 3번 실패
할 경우 Pod 가 재시작 하도록 설정 했다.

![0014-12](/tech-blog/resources/images/kubernetes/0014-12.png)

k8s 가 httpGet 으로 5초 후에 해당 path 를 체크해보고 200 응답을 받을 것이다. 그리고 10초 후 다시 체크할 때고 200 응답을 받으면서 서비스가 정상 운영 중이라고 판단 하게 된다. 그러던 중
어느 순간 path 를 호출했을 때 Internal Server Error 를 발생 하면서 500 응답을 받았다고 하자. 하지만 Pod 는 Running 상태로 남아 있는다. 그렇게 3번을 500응답을 받게 되면
k8s 는 문제가 있다고 판단하고 이 Pod 를 Restart 한다.
