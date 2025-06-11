![0004-01](/tech-blog/resources/images/kubernetes/0004-01.png)

Kubernetes 는 한 대의 서버를 Master 로 사용하고 다른 서버는 Node 로 하나의 Master 에 다수의 Node 들이 연결 된다. 이렇게 연결 된 하나의 묶음이 Kubernetes Cluster 가
된다.

Master 는 Kubernetes 의 전반적인 기능들을 컨트롤 하고, Node 들은 자원을 제공하는 역할을 한다. 만약 Cluster 전체 자원을 늘리고 싶으면 Node 를 계속 추가하면 된다.

Namespace 는 Cluster 안에서 Kubernetes 의 Object 들을 독립된 공간으로 분리할 수 있게 해준다. Namespace 에는 Kubernetes 최소 배포 단위인 Pod 들이 있고, 이 Pod
들에게 외부로부터 연결이 가능하도록 IP 를 할당해주는 서비스가 있다. 하지만 서로 다른 Namespace 에 있는 Pod 들은 연결할 수 없다.

Pod 안에는 다수의 Container 가 있을 수 있다. Container 하나 당 하나의 애플리케이션이 동작하기 때문에 결국 Pod 에는 다수의 애플리케이션이 동작할 수 있다.

만약 Pod 에 문제가 생겨 재생성 될 경우 모든 데이터가 삭제되기 때문에 Volume 을 만들어서 Pod 에 연결하면 데이터를 별도로 저장할 수 있다.

추가로 Namespace 에는 ResourceQuota 와 LimitRange 를 추가하여 하나의 Namespace 에서 사용 할 수 있는 자원의 양을 제한할 수 있다. 예를 들면 Pod 의 수, CPU, 메모리 등
이 있다.

Controller 는 Pod 들을 관리하는 기능을 하는데 각각의 사용 용도에 따라 다양한 종류가 있다.

---

- Replication Controller, Replica Set (가장 기본적인 Controller)
  - Pod 가 죽으면 다시 살려주거나
  - Pod 의 개수를 늘리거나 줄일 수 있다. (scale in, out)
- Deployment
  - 배포 후 Pod 를 새로운 버전으로 업그레이드
  - 업그레이드 도중 문제가 생기면 롤백이 가능하다.
- DaemonSet
  - 하나의 Node 에 Pod 가 하나씩만 유지되도록 한다. (이렇게 사용해야만 하는 Module 들이 있다.)
- CronJob
  - 특정 작업만 하고 종료하는 작업을 할 때 Pod 가 그렇게 동작할 수 있도록 해준다.
