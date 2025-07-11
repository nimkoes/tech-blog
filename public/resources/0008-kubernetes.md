![0008-01](/tech-blog/resources/images/kubernetes/0008-01.png)

본격적인 사용 방법을 알아보기에 앞서 ConfigMap 과 Secret 이 언제 사용되는지 먼저 정리한다.

![0008-02](/tech-blog/resources/images/kubernetes/0008-02.png)

개발 환경과 운영 환경이 있다. A Service 는 환경에 따라 SSH 설정 및 User 와 key 값을 설정해야 한다. 하지만 이 값은 Container 안에 있는 Service 에 들어있는 값이기 때문에 이
값을 바꾼다는 것은 환경에 따라 Container Image 를 따로 관리해야 한다는 것을 의미한다. 단순히 이 값을 관리하기 위해 용량이 큰 Image 를 별도로 관리하는 것은 부담되는 일이다.

보통 환경에 따라 변하는 값들을 외부에서 결정할 수 있도록 한다. 이것을 도와주는 것이 ConfigMap 과 Secret 이라는 오브젝트 이다. 관리 해야 하는 일반적인 상수들을 모아 ConfigMap 을 만들고
key 값과 같이 보안과 관련 된 값을 모아 Secret 을 만든다.

Pod 를 생성할 때 ConfigMap 과 Secret 오브젝트를 연결할 수 있는데 Container 의 환경변수에 이 데이터들이 들어가게 된다. A Service 의 입장에서는 Env (환경변수) 값을 읽어서
로직을 처리하게 된다.

운영 환경에서는 ConfigMap 과 Secret 의 데이터만 바꿔주면 똑같은 Container Image 를 사용해서 의도한 대로 동작하게 할 수 있다.

# Env (Literal)

가장 기본적인 형태인 상수를 입력하는 방법이다.

![0008-03](/tech-blog/resources/images/kubernetes/0008-03.png)

ConfigMap 은 key 와 value 로 구성되어 있다. 그래서 필요한 상수들을 정의하면 Pod 를 만들 때 이 ConfigMap 을 가져와서 Container 안에 환경 변수로 설정할 수 있다. Secret
도 동일한 기능을 하는데 비밀번호와 같은 보안과 관련 된 값들을 저장하는 용도로 사용 한다. ConfigMap 과 다른 Secret 의 특징은 값을 넣을 때 Base64 인코딩 한 값을 넣어야 한다는 것인데
Secret 의 보안적인 요소는 아닌 단순한 규칙일 뿐이다. 이 값 이 Pod 에 주입 될 때 자동으로 디코딩 되기 때문에 환경 변수에서는 인코딩 전의 값이 보이게 된다.

일반적인 오브젝트의 값들은 k8s DB 에 저장이 되는 반면 Secret 은 메모리에 저장이 된다. 파일에 저장되어 있는 것보다 메모리에 저장되어 있는 것이 보안 상 유리하기 때문이다. 또한 ConfigMap 은
key-value 를 제한 없이 입력할 수 있는 반면 Secret 은 1 메가 까지 입력할 수 있는데 너무 많은 값을 넣으면 메모리를 사용하기 때문에 시스템에 영향을 줄 수도 있다.

```yml
# ConfigMap 설정 예시
apiVersion: v1
kind: ConfigMap
metadata:
  name: cm-dev
data:
  SSH: 'false'    # key: value 형태의 상수를 입력
  User: dev
```

```yml
# Secret 설정 예시
apiVersion: v1
kind: Secret
metadata:
  name: sec-dev
data:
  Key: MTIzNA==   # key: value 형태로 입력하되 value 는 BASE64 인코딩 한 값 사용
```

```yml
# ConfigMap 과 Secret 을 사용하는 Pod 설정 예시
apiVersion: v1
kind: Pod
metadata:
  name: pod-1
spec:
  containers:
    - name: container
      image: kubetm/init
      envFrom: # envFrom 으로 사용 할 ConfigMap 과 Secret 을 참조
        - configMapRef:
            name: cm-dev
        - secretRef:
            name: sec-dev
```

# Env (File)

![0008-04](/tech-blog/resources/images/kubernetes/0008-04.png)

파일을 ConfigMap 에 담을 경우 파일의 이름이 ConfigMap 의 이름이 key 가 되고 내용이 value 가 된다. 이것을 Pod 를 만들 때 환경변수로 넣을 때 그대로 넣게 될 경우 key 가 파일
이름이 되어 자연스럽지 않다. 그래서 key 를 새로 정의해서 Content 를 넣는 방법을 사용 한다.

file 을 ConfigMap 으로 만드는 것은 대시보드에서 지원하지 않기 때문에 master node 에서 kubectl 명령을 사용 한다.

```shell
# cm-file 이라는 ConfigMap 생성
echo "Content" >> file.txt
kubectl create configmap cm-file --from-file=./file.txt
```

```shell
# sec-file 이라는 Secret 생성
echo "Content" >> file.txt
kubectl create secret generic sec-file --from-file=./file.txt
```

Secret 생성시 file 의 내용이 BASE64 로 인코딩 된다. 그렇기 때문에 미리 내용을 BASE64 로 인코딩 하였다면 두 번 인코딩 될 수 있으므로 주의해야한다.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-file
spec:
  containers: # Container 에
    - name: container
      image: kubetm/init
      env: # 환경변수를 넣을 건데
        - name: file           # 이 환경변수의 이름은 file 이다.
          valueFrom: # 이 파일의 값을 가져올건데
            configMapKeyRef: # 그 값은 ConfigMap 의 Key 를 참조 한다.
              name: cm-file    # ConfigMap 의 이름은 cm-file 이고
              key: file.txt    # cm-file 안에 있는 file.txt 라는 key 에 대한 value 입력
```

Volume Mount (file)

![0008-05](/tech-blog/resources/images/kubernetes/0008-05.png)

file 을 ConfigMap 에 담는 것 까지는 앞서 본 것과 동일하다.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-mount
spec:
  containers: # Container 안에
    - name: container
      image: kubetm/init
      volumeMounts: # Volume 을 mount 하는데
        - name: file-volume
          mountPath: /mount    # 그 때 mount path 이고
  volumes:
    - name: file-volume      # maount 할 Volume 을 보면
      configMap: # 이 Vloume 안에는 configMap 을 담았고
        name: cm-file        # configMap 의 이름은 cm-file 이다.
```

마지막으로 Env (File) 과 Volume Mount (File) 방식은 큰 차이점이 있다.

Env (File) 같은 경우 Pod 를 만들 때 환경변수 값을 한 번 주입하면 그것으로 끝이기 때문에 ConfigMap 의 데이터가 바뀌어도 Pod 의 환경변수 값은 바뀌지 않는다. Pod 가 다시 만들어질
경우에는 갱신이 된다.

반면 Volume Mount (File) 방식은 mount 자체가 원본과 연결해 준다는 것을 의미하기 때문에 ConfigMap 의 데이터가 바뀔 경우 Pod 에 mount 된 내용도 같이 바뀌게 된다.
