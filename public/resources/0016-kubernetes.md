Pod 는 기본적으로 Scheduler 에 의해 Node 에 할당 되지만 사용자의 의도에 의해 Node 를 지정할 수 있고, 운영자가 특정 노드를 사용하지 못하도록 관리 할 수도 있다.

# Node 선택 (NodeName, NodeSelector, NodeAffinity)

Pod 를 특정 Node 에 할당 되도록 선택하기 위한 용도로 사용 한다.

![0016-01](/tech-blog/resources/images/kubernetes/0016-01.png)

Node1, Node2, Node3 은 서버가 한국에 있고, Node4, Node5 는 미국에 있다고 가정 한다. 이 상태에서 Pod 를 하나 만들면 k8s Scheduler 는 cpu 자원이 가장 많은 Node 에
이 Pod 를 할당 한다.

## NodeName

NodeName 을 사용하면 Scheduler 와는 상관 없이 바로 해당 Node 의 이름으로 Pod 가 할당 된다. 명시적으로 Node 에 할당 할 수 있어서 좋아 보이지만 운영 환경에서는 Node 가 추가, 삭제
되면서 Node 이름이 계속 바뀔 수 있기 때문에 잘 사용하지 않는다.

## NodeSelector

특정 Node 를 선택할 때 권장하는 방법은 NodeSelector 인데, Pod 에 key 와 value 를 설정하면, 해당 Label 이 작성 된 Node 에 할당 된다. 하지만 Label 의 특성 상 다수의
Node 에 동일한 Label 을 설정할 수 있기 때문에 Pod 에 NodeSelector 를 설정하면 Scheduler 에 의해 자원이 많은 Node 에 Pod 가 할당 된다. NodeSelector 에는 단점이
있는데, key 와 value 가 완전히 일치 해야하고 만약 매칭하는 Label 이 없으면 Pod 가 어느 Node 에도 할당 되지 않아 오류가 발생한다.

## NodeAffinity

이 단점을 보완한 방법이 NodeAffinity 이다. Pod 에 key 만 설정해도 해당 그룹 중에 Scheduler 를 통해 자원이 많은 Node 에 Pod 가 할당 된다. 만약 조건에 맞는 key 를 가진
Node 가 없더라도 Scheduler 가 판단해서 자원이 많은 Node 에 할당 되도록 옵션을 설정할 수 있다.

# Pod 간 집중, 분산 (Pod Affinity, Anti-Affinity)

다수의 Pod 들을 하나의 Node 에 집중해서 할당 하거나 Pod 간 겹치는 Node 없이 분산해서 할당할 수 있다.

![0016-02](/tech-blog/resources/images/kubernetes/0016-02.png)

## Pod Affinity

예를 들어 위와 같이 Web 과 Server 가 있고 이 두 Pod 는 Hostpath 를 쓰는 하나의 PV 에 연결 되어 있을 때, 두 Pod 는 같은 Node 에 있어야 문제가 발생하지 않는다. 그래서 두 Pod
를 같은 Node 에 할당 하려면 Pod Affinity 를 사용해야 한다. 처음 Web Pod 가 Scheduler 에 의해 특정 Node 에 할당 되면 그 Hostpath 에 PV 가 생기게 된다. 다음으로
Server Pod 가 Web Pod 가 있는 Node 에 들어가게 하려면 Server Pod 를 만들 때 Pod Affinity 속성을 넣고 Web Pod 에 있는 Label 을 지정하면 된다.

## Anti-Affinity

Master 가 다운되면 Slave 가 백업을 해줘야 하는 관계라고 할 때, 이 두 Pod 가 같은 Node 에 들어갈 경우 Node 가 다운 되었을 때 둘 다 장애가 발생한다. 그래서 서로 다른 Node 에
Scheduling 되어야 한다. 그렇기 때문에 Master 가 Scheduler 에 의해 어느 한 Node 에 들어가고 Slave Pod 를 만들 때 Anti-Affinity 를 설정하여 Master Pod 의
key, value 를 설정하면 Slave Pod 는 Master Pod 와 다른 Node 에 만들어 진다.

## Node 할당 제한 (Toleration, Taint)

특정 Node 에는 Pod 가 할당 되지 않도록 제한하기 위해 사용 한다.

![0016-03](/tech-blog/resources/images/kubernetes/0016-03.png)

Node5 는 높은 사양의 그래픽을 요구하는 Application 을 운영하는 용도로 GPU 를 설정 했을 때, 운영자는 Taint 라는 것을 설정 해둔다. 그러면 일반적인 Pod 들은 Scheduler 가 이
Node 로 할당하지 않기 때문에 Pod 가 직접 Node5 를 지정해서 할당하려 해도 불가능 하다. 이 Node 에 Pod 를 할당 하려면 Pod 는 Toleration 을 설정 해야 한다.

## Node Affinity

![0016-04](/tech-blog/resources/images/kubernetes/0016-04.png)

Selector 와 Label 은 key 와 value 가 모두 같아야 매칭이 되지만 matchExpressions 는 다양한 조합으로 Pod 들을 선택할 수 있다.

![0016-05](/tech-blog/resources/images/kubernetes/0016-05.png)

Node Affinity 를 사용할 때 matchExpressions 속성을 통해 Pod 는 Node 를 선택할 수 있다. key 를 그룹핑 단위로 Pod 를 하위 식별자로 하는 Label 들이 Node 에 설정되어
있고, Pod 를 key 가 kr 인 그룹 안에 할당할 때 matchExpressions 를 사용할 수 있다. 그러면 Scheduler 가 자원이 많은 Node 쪽으로 Pod 를 배치 한다.

![0016-06](/tech-blog/resources/images/kubernetes/0016-06.png)

![0016-07](/tech-blog/resources/images/kubernetes/0016-07.png)

Node Affinity 에서 matchExpressions 에 Operator 로 사용할 수 있는 종류는 위와 같다. 대부분 ReplicaSet 에서 보았던 내용과 동일하고, 아래쪽의 Gt 와 Lt 는 사용자가
지정한 value 보다 값이 크거나 작은 Node 를 선택하는 옵션이 추가 되었다.

Node Affinity 의 다음 속성으로 required 와 preferred 가 있다.

![0016-08](/tech-blog/resources/images/kubernetes/0016-08.png)

위와 같이 두 개의 Node 가 있을 때, 만약 Node Affinity 로 required 속성을 가진 Pod 가 Node 에는 없는 key 를 가지고 있을 경우 이 Pod 는 Node 에 절대로
Scheduling 되지 않는다. 하지만 만약 key 가 ch 인 Node 가 있으면 선호할 뿐이고 반드시 그 Node 에 할당 되어야 하는 Pod 가 아닌 경우에는 required 대신 preferred 옵션을
작성하면 해당 key 가 없더라도 적절한 Node 에 할당 된다.

preferred 에는 weight 라는 필수 값이 있다.

![0016-09](/tech-blog/resources/images/kubernetes/0016-09.png)

key 가 다른 Label 을 가진 두 개의 Node 가 있고, cpu 는 50과 30으로 Node1 이 더 많다고 하자. 그리고 preferred 속성을 가진 Pod 를 만드는데, 두 Node 의 key 가 모두
있기 때문에 두 노드 중 cpu 자원이 많은 Node1 에 할당 된다.

![0016-10](/tech-blog/resources/images/kubernetes/0016-10.png)

여기에 선호도에 대한 가중치를 주는 의미로 weight 값을 줄 수 있다. 이 Pod 는 key 가 us 이거나 kr 인 Node 에 할당 될 수 있지만, key 가 kr 인 Node 에 가중치를 조금 더 주겠다고
설정 했다. 그러면 Scheduler 는 최초 cpu 자원만 보고 Node1 에 할당 하려 했지만, Pod 의 가중치가 합산 되어 다시 점수를 매긴다. 그 결과 최종 점수가 더 높은 Node 에 Pod 를 할당
한다.

점수를 계산하는 방식이 이렇게 간단하지 않지만 대략적인 weight 속성에 대한 개념은 설명한 내용과 같다.

# Pod Affinity, Pod Anti-Affinity

![0016-11](/tech-blog/resources/images/kubernetes/0016-11.png)

type: web 이라는 Label 을 가진 web Pod 가 Scheduler 에 의해 Node1에 할당 되었다. 만약 이 web Pod 와 같은 Node 에 Pod 를 할당 하려면 Pod Affinity 라는
속성으로 matchExpressions 를 사용할 수 있는데, 이 matchExpressions 는 Node 의 Label 이 아닌 Pod 의 Label 과 매칭 된다. 그래서 web Pod 와 같은 Node1 에
할당될 수 있다. 추가로 topologyKey 는 Node 의 key 를 본다. 다시 말하면 matchExpressions 에 있는 조건에 맞는 Pod 를 찾지만 Node 의 key 가 a-team 인 범위에서만
찾겠다는 의미이다.

![0016-12](/tech-blog/resources/images/kubernetes/0016-12.png)

만약 web Pod 가 Node3 에 할당 되었었다면, server Pod 는 pending 상태가 되고 설정된 조건이 만족 할 때까지 Node 에 할당 되지 않는다.

![0016-13](/tech-blog/resources/images/kubernetes/0016-13.png)

다음으로 Pod Anti-Affinity 는 type: master 라는 Label 을 가진 master Pod 가 Node4 에 Schduling 되었을 때, 이와 다른 Node 에 Pod 를 할당하기 위해
slave Pod 에 Anti-Affinity 를 설정하고 matchExpressions 로 master Pod 의 Label 을 설정한다. 마찬가지로 topologyKey 를 설정하여 b-team 이라는 key 를
가진 Node 로 범위를 제한 할 수 있다.

# Taint, Toleration

![0016-14](/tech-blog/resources/images/kubernetes/0016-14.png)

Node1 은 다른 Node 들과는 다르게 GPU 가 구성되어 있다. 그리고 일반적인 Pod 들이 Node1 에 할당되는 것을 막으려면 Taint 라는 것을 Node 에 설정한다. Taint 에는 식별자로 사용하는
Label 인 key 와 value 가 있고, effect 라는 옵션에 값을 NoSchedule 로 주면 다른 Pod 들이 이 Node 에 할당되지 않는다.

![0016-15](/tech-blog/resources/images/kubernetes/0016-15.png)

만약 Pod 가 GPU 자원을 사용해야 하는 경우 해당 Pod 에 Toleration 을 설정하여 Taint 가 설정 된 Node 에 Pod 를 할당할 수 있다. 내용으로는 key, operator, value,
effect 가 있는데 Taint 의 Label 과 일치해야 한다. 하나라도 다른 값을 가질 경우 Toleration 을 설정 했다고 하더라도 Taint 가 설정 된 Node 에 할당될 수 없다.

![0016-16](/tech-blog/resources/images/kubernetes/0016-16.png)

추가로 Pod 의 Toleration 설정 값으로 매칭하는 Taint 가 있는 Node 를 찾는다고 생각할 수 있는데 그렇지 않다. Pod 가 Node1 에 Scheduling 되었을 때, Pod 에 Node1 의
Taint 와 매칭하는 Toleration 이 있기 때문에 Node1 에 할당될 수 있는 것이다.

![0016-17](/tech-blog/resources/images/kubernetes/0016-17.png)

그렇기 때문에 Pod 에 별도의 Node Selector 를 설정하여 특정 Pod 가 Node1 에 할당될 수 있도록 해야 한다.

즉, Taint 가 설정 된 Node 에는 아무 Pod 나 할당될 수 없으며, 해당 Taint 와 매칭하는 Toleration 을 설정한 Pod 만 할당될 수 있지만, Pod 가 특정 Node 에 Scheduling
되도록 하려면 별도의 옵션을 추가 해야 한다.

effect 는 NoShcedule, PreferNoSchedule, NoExecute 값을 가진다. PreferNoSchedule 은 가급적 Scheduling 이 되지 않도록 하는 것으로 Pod 가 다른 Node
에 할당될 수 없는 상황이라면 Taint 가 설정 된 Node 라도 Pod 가 할당될 수 있다.

![0016-18](/tech-blog/resources/images/kubernetes/0016-18.png)

NoExecute 는 Pod1 이 Node2 할당 되어 운영 중에 NoSchedule effect 를 가진 Taint 를 설정하면 어떻게 될까? Node Affinity, Pod Affinity 그리고
NoSchedule 설정 값은 Pod 가 최초 Node 를 선택할 때에만 영향을 주는 것으로 이미 Pod 가 Node 에 할당 된 이후에는 Node Label 을 수정 하거나 Taint 를 설정 한다고 해서 Pod
가 삭제되거나 하지 않는다.

![0016-19](/tech-blog/resources/images/kubernetes/0016-19.png)

하지만 Pod 가 Node 에 이미 할당 되어 운영중일 때 NoExecute 값을 가진 Taint 를 설정하게 되면 Pod는 삭제 된다.

![0016-20](/tech-blog/resources/images/kubernetes/0016-20.png)

만약 Node3 의 Pod2 가 삭제 되지 않도록 하기 위해서는 Pod 를 만들 때 Taint 와 매칭하는 Toleration 을 설정하면 된다. tolerationSeconds 라는 속성이 있는데 이 값에 설정된
시간이 경과한 후 Pod 가 삭제 된다. 만약 tolerationSeconds 속성을 사용하지 않으면 Pod 는 삭제 되지 않는다.

NoSchedule 과 NoExecute 는 k8s 에서 자주 사용하는 속성으로 개념을 알아두면 좋다. NoSchedule 은 Master Node 에 기본적으로 설정되어 있어서 Pod 를 만들 때 Master 에
할당되지 않도록 하는데 사용 된다. 만약 ReplicaSet 을 사용해서 Pod 를 운영 중일 때 Node 에 장애가 발생하면 k8s 는 해당 Node 의 Pod 들이 정상 동작하지 않을 수 있기 때문에
NoExecute 속성을 가진 Taint 를 자체적으로 장애가 발생한 Node 에 설정한다. 그러면 ReplicaSet 은 자신의 Pod 가 없어졌기 때문에 다른 Node 에 Pod 를 다시 만들어서 Service
가 유지될 수 있도록 해준다.
