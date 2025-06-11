![0015-01](/tech-blog/resources/images/kubernetes/0015-01.png)

리소스를 균등하게 사용하고 있는 3개의 Pod 를 가진 Node 가 있다.
![0015-02](/tech-blog/resources/images/kubernetes/0015-02.png)

각 Pod 가 Node 의 리소스를 균등하게 사용하고 있기 때문에 특정 Pod 에 추가 리소스를 할당 할 수 없는 상황에서 Pod1 이 추가 리소스를 필요로 하는 상황이 발생 했다. 그럼 Pod1 이 리소스 부족으로
에러가 발생하고 다운 되어야 할까? 아니면 다른 Pod2 나 Pod3 을 다운시키고 Pod1 에 추가 리소스를 할당 해야 할까?

![0015-03](/tech-blog/resources/images/kubernetes/0015-03.png)

k8s 에는 Application 의 중요도에 따라 이런 상황을 핸들링 할 수 있도록 세 가지 단계로 Quality of Service 를 지원해주고 있다. 지금 상황에서는 BestEffort 가 부여 된 Pod 가
가장 먼저 다운이 되고 리소스가 반환 되고 Pod1 은 필요한 리소스를 제공받아 사용할 수 있게 된다.

![0015-04](/tech-blog/resources/images/kubernetes/0015-04.png)

Node 에 어느정도 자원이 남아 있지만 Pod2 에서 그보다 많은 자원을 필요로 한다면 Burstable 이 적용 된 Pod 가 다음으로 다운 되면서 리소스가 반환 된다. 그래서 Guaranteed 가 마지막까지
Pod 를 안정적으로 유지시켜주는 Class 이다.

![0015-05](/tech-blog/resources/images/kubernetes/0015-05.png)

QoS 는 특별한 속성이 있어서 설정할 수 있는 것은 아니다. Container 의 resource 설정이 있는데, 여기에 requests 와 limits 에 따라 memory 와 cpu 를 어떻게 설정 할지 결정
한다.

# Guaranteed

![0015-06](/tech-blog/resources/images/kubernetes/0015-06.png)
Pod 에 다수의 Container 가 있을 경우 각각의 Container 마다 Request 와 Limit 가 있어야 한다. 그리고 그 안에 memory 와 cpu 둘 다 설정 되어 있어야 하고, 각
Container 안에 설정 된 memory 와 cpu 값은 request 와 limit 가 같아야 한다. 이 모든 규칙은 만족 해야 k8s 가 이 Pod 를 Guaranteed Class 로 판단하고 Pod 의
어떤 Container 에도 request 와 limit 가 설정되어있지 않다면 BestEffort 가 된다.

# Burstable

![0015-07](/tech-blog/resources/images/kubernetes/0015-07.png)
Guaranteed 와 BestEffort 의 중간이라고 생각하면 된다.

가령 Container 마다 request 와 limit 는 설정되어 있지만 request 의 값이 더 작다던가, request 만 설정 되었다던가 또는 Pod 의 Container 가 두 개인데 하나만 완벽하게
설정 되어 있는 경우 모두 Bustable Class 가 된다.

추가로 Bustable Class 에 다수의 Pod 가 있을 경우 어떤 Pod 가 먼저 다운 되어 리소스를 반환하는지에 대해서도 알 필요가 있다. 이것은 OOM(Out Of Memory) Score 에 따라 결정
된다.

![0015-08](/tech-blog/resources/images/kubernetes/0015-08.png)

현재 Pod2 와 Pod3 의 request memory 가 각각 5G, 8G 로 설정 되어 있는데, 그 안의 Application 의 실제 memory 가 똑같이 4G 만큼 사용되고 있다고 하면 Pod2 의
memory 사용량은 75% 이고 Pod3 는 50% 이다. OOM Score 는 Pod2 가 75% 로 더 크기 때문에 k8s 는 Pod2 를 먼저 제거 한다.

# BestEffort

![0015-09](/tech-blog/resources/images/kubernetes/0015-09.png)

이렇게 세 가지 Class 는 Container 에 request 와 limit 를 어떻게 설정 하느냐에 따라 결정 된다.
