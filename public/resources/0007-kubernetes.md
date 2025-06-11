![0007-01](/tech-blog/resources/images/kubernetes/0007-01.png)

# emptyDir

Container 간 데이터 공유를 위해 Volume 을 사용하는 것을 말한다. 최초 Volume 이 생성될 때는 항상 내용이 비어있기 때문에 emptyDir 이란 이름을 가지게 되었다.

![0007-02](/tech-blog/resources/images/kubernetes/0007-02.png)

만약 Container 1 이 web 역할을 하는 서버이고 Container 2 는 백엔드를 처리해주는 서버라고 하자. 이 때 web 서버로부터 받은 파일을 mount 된 Volume 에 저장해두고 백엔드의
Container 역시 같은 Volume 을 mount 해두면 이 두 서버가 Volume 을 자신의 로컬에 있는 파일 처럼 사용할 수 있다. 즉 두 서버 간 파일 전송 없이 같은 파일을 사용할 수 있다.

추가로 Volume 은 Pod 안에 생성되기 때문에 만약 Pod 에 문제가 발생하여 다시 생성 될 경우 모든 데이터가 삭제된다. 그러므로 일시적으로 사용 할 데이터만 넣는 것이 좋다.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-volume-1
spec:
  containers:
    - name: container1
      image: kubetm/init
      volumeMounts: # Volume mount
        - name: empty-dir
          mountPath: /mount1  # Container1 이 사용하는 path => /mount1
    - name: container2
      image: kubetm/init
      volumeMounts: # Volume mount
        - name: empty-dir
          mountPath: /mount2  # Container2 가 사용하는 path => /mount2
  volumes:
    - name: empty-dir
      emptyDir: { }          # Volume 의 속성으로 emptyDir 을 지정

# mountPath : Container 가 이 Path 로 Volume 을 연결함을 의미
# mountPath 의 경로가 다르지만 Path 가 지정되는 Volume 의 이름이
#  empty-dir 로 동일하기 때문에 container 마다 자신이 원하는 경로를 사용하고 있지만
#  결국 같은 Volume 을 mount 하고 있다.
```

# hostPath

이름에서 알 수 있듯 하나의 host 즉, Pod 들이 올라가 있는 Node 에 path 를 Volume 으로 사용한다.

![0007-03](/tech-blog/resources/images/kubernetes/0007-03.png)

emptyDir 과 다른 점은 Path 를 각 Pod 들이 mount 해서 공유하기 때문에 Pod 가 삭제 되어도 Node 에 있는 데이터는 사라지지 않는다. 데이터가 사라지지 않아 좋아 보이지만 Pod 입장에서
문제가 있다.

![0007-04](/tech-blog/resources/images/kubernetes/0007-04.png)

만약 다양한 이유로 Pod 가 다시 생성될 때 다른 Node 에 만들어지는 경우 Pod 가 사용하던 Volume 은 hostPath 에 mount 되어있었기 때문에 Volume 을 사용할 수 없게 된다. 왜냐하면
Pod 는 자신이 올라간 Node 에 있는 Volume 만 사용할 수 있기 때문이다.

Pod 가 다시 생성되는 경우 발생하는 문제를 해결한다고 하면, Node 가 생성될 때마다 같은 이름의 경로를 만들어서 직접 Node 에 있는 Path 끼리 mount 해주면 되긴 하지만 이 방법은 k8s 가 해주지
않고 관리자가 직접 설정해줘야 한다. 이렇게 구성하는 것이 그렇게 어렵고 복잡한 것은 아니지만 실수할 여지가 있기 때문에 추천하는 방법은 아니다.

각 Node 는 기본적으로 시스템 파일 또는 다양한 설정 파일과 같이 자기 자신을 위해 사용되는 파일들이 있다. Pod 자신이 할당되어 있는 host 에 데이터를 읽거나 써야할 때 사용하면 된다.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-volume-3
spec:
  nodeSelector:
    kubernetes.io/hostname: k8s-node1
  containers: # Pod 를 만들 때 Conatiner 에서 
    - name: container
      image: kubetm/init
      volumeMounts: # Volume 을 mount 하는데
        - name: host-path         # host-path 라는 이름의 Volume 을 사용 하고
          mountPath: /mount1      # Path 는 mount1 이다.
  volumes:
    - name: host-path          # host-path 라는 이름의 Volume
      hostPath: # hostPath 라는 속성을 사용한다.
        path: /node-v           # Path 는 node-v 이고 
        type: Directory         # type 은 Directory 이다.

# 추가로 hostPaht 의 path: /node-v 는 이 Pod 가 만들어지기 전에 만들어져 있어야 한다.
```

hostPath 는 Pod 의 데이터를 저장하기 위한 용도가 아니고 Node 에 있는 데이터를 Pod 에서 사용하기 위한 용도이다.

# PVC/PV (Persistent Volume Claim/ Persistent Volume)

PVC/PV 는 Pod 에 영속성 있는 Volume 을 제공하기 위한 기능이다.

![0007-05](/tech-blog/resources/images/kubernetes/0007-05.png)

실제 Volume 의 형태는 다양하다. Local Volume 도 있지만 외부에 원격으로 사용되는 형태의 aws, git 등과 같은 Volume 들도 있다.

Pod 는 이런 PV 에 바로 연결하지 않고 PVC 를 통해 PV 와 연결 된다. k8s 는 Volume 사용에 있어서 User 영역과 Admin 영역으로 나누었다. Admin 은 k8s 를 관리하는 운영자이고
User 는 Pod 에 Service 를 만들고 배포를 관리하는 서비스 담당자 이다.

앞서 Volume 의 종류가 다양하기 때문에 각 Volume 에 연결하기 위한 방법과 설정이 상이하다.


```yml
# 각 Volume 에 따라 서로 다른 설정 값이 사용 되는 예시 (nfs, iscsi, gitrepo)
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-01
spec:
  nfs:
    server: 192.168.0.xxx
    path: /sda/data
  iscsi:
    targetPortal: 163.180.11
    iqn: iqn.200.qnap:...
    lun: 0
    fsType: ext4
    readOnly: no
    chapAuthSession: true
  gitRepo:
    repository: github.com...
    revision: master
    directory: .
```

그렇기 때문에 이런 설정들을 전문적으로 관리하는 PV 들을 만들어 사용하고 User 는 이것을 사용 하기 위해 PVC 를 만들게 된다.


```yml
# PV 를 사용하기 위한 User 의 PVC 설정 예시
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-01
spec:
  accessModes:
    - ReadWriteOnce          # 읽기 쓰기 모드가 가능한
  resources:
    requests:
      storage: 1G          # 용량 1 기가인 Volume 을 요청
  storageClassName: ""     # 공백으로 넣으면 현재 만들어진 PV 중 선택 된다
  # 이 값을 "" 대신 생략하게 되면 다른 동작을 할 수 있다.
```

```yml
# PVC 를 사용하는 Pod 설정 예시
apiVersion: v1
kind: Pod
metadata:
  name: pod-volume-3
spec:
  containers:
    - name: container
      image: kubetm/init
      volumeMounts:
        - name: pvc-pv         # 만든어진 PVC 를 Container 에서 사용
          mountPath: /mount3
  volumes:
    - name: pvc-pv
      persistentVolumeClaim:
        claimName: pvc-01     # 앞서 만든 PVC 이름을 연결
```

처리 흐름을 정리하면 다음과 같다.

1. 최초 Admin 이 PV 를 만들어 둔다. 
2. 사용자 (User) 가 PVC 를 만든다. 
3. k8s 가 PVC 내용에 맞는 적정한 Volume 에 연결 해준다. 
4. 이후 Pod 생성시 PVC 를 사용한다.
