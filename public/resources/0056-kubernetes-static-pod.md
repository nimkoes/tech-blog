# Static Pod란 무엇인가?

Static Pod는 Kubernetes에서 kubelet이 직접 관리하는 특수한 형태의 Pod이다.
일반적인 Pod는 사용자가 `kubectl apply` 명령으로 생성하고, API Server가 이를 etcd에 저장하여 관리하지만,
Static Pod는 API Server를 거치지 않고, kubelet이 지정된 디렉토리에서 YAML 파일을 직접 감지하여 실행한다.

## 일반적인 Pod 생성 흐름

![0047-01](/tech-blog/resources/images/kubernetes/0047-01.png)

## Static Pod 생성 흐름

![0047-02.png](/tech-blog/resources/images/kubernetes/0047-02.png)

# Static Pod의 특징

| 항목    | Static Pod       | 일반 Pod            |
|-------|------------------|-------------------|
| 생성 주체 | kubelet          | API 서버 (kubectl)  |
| 관리 위치 | 노드 로컬            | 전체 클러스터           |
| 저장소   | etcd 미사용         | etcd 저장           |
| 생성 방식 | 파일 시스템에서 YAML 읽음 | `kubectl apply` 등 |
| 삭제 방법 | YAML 파일 삭제       | `kubectl delete`  |

# Static Pod는 어디에 사용되는가?

보통 컨트롤 플레인 구성 요소를 직접 올릴 때 사용된다.

- `kube-apiserver`
- `kube-scheduler`
- `kube-controller-manager`
- `etcd`

이들은 클러스터가 완전히 동작하기 전부터 있어야 하므로, kubelet이 직접 실행하는 방식이 적절하다.

# Static Pod 설정 예시

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: static-nginx
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      ports:
        - containerPort: 80
```

위와 같은 YAML 파일을 지정 디렉토리에 저장하면 kubelet이 이를 감지하여 Static Pod으로 실행한다.

# Static Pod 경로 조회 및 변경 방법

## kubelet이 감시 중인 Static Pod 경로를 노드 내부에서 직접 확인하는 방법

systemd 설정을 보지 않고도, kubelet이 현재 어떤 경로를 감시하고 있는지 확인할 수 있다. 노드에 직접 접속해 `ps` 명령어로 kubelet 프로세스를 조사하면 된다.

### 노드에 SSH 접속

```bash
ssh ubuntu@<노드의 INTERNAL-IP>
```

### 실행 중인 kubelet 프로세스 확인

```bash
ps -ef | grep kubelet
```

예상 출력 예시:

```
root     1234     1  0 10:00 ?  00:00:05 /usr/bin/kubelet --pod-manifest-path=/etc/kubernetes/manifests ...
```

이 출력에서 `--pod-manifest-path=/경로` 값을 통해 kubelet이 현재 감시 중인 Static Pod 디렉토리를 확인할 수 있다.

### 해당 디렉토리 확인

```bash
cd /etc/kubernetes/manifests
ls -al
```

```
-rw------- 1 root root  2000 Jul  1 10:12 kube-apiserver.yaml
-rw------- 1 root root  1800 Jul  1 10:12 etcd.yaml
```

이 디렉토리에 존재하는 YAML 파일들은 모두 kubelet이 static pod으로 실행하고 있는 자원이다.

Static Pod은 kubelet이 감시하는 디렉토리에 YAML 파일을 두면 자동으로 실행된다.
따라서 먼저 **현재 경로를 확인하고**, 그 후 필요 시 **경로를 변경하거나 파일을 옮겨야 한다**.

## Static Pod 경로 조회 절차

### 노드 IP 확인

먼저 Static Pod이 실행되고 있는 노드의 IP를 알아야 한다.

```bash
kubectl get nodes -o wide
```

```
NAME          STATUS   ROLES    AGE   VERSION   INTERNAL-IP       EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION      CONTAINER-RUNTIME
node01        Ready    <none>   3d    v1.29.0    192.168.100.101   <none>        Ubuntu 22.04.3 LTS   5.15.0-92-generic   containerd://1.7.5
```

`INTERNAL-IP`가 SSH 접속에 사용할 IP이다.

### 노드에 SSH 접속

```bash
ssh ubuntu@192.168.100.101
```

### kubelet 실행 옵션 확인

```bash
ps -ef | grep kubelet
```

```
root      1234     1  0 08:00 ?        00:00:01 /usr/bin/kubelet --pod-manifest-path=/etc/kubernetes/manifests ...
```

`--pod-manifest-path`에 명시된 디렉토리가 kubelet이 감시하는 Static Pod 경로이다.

## Static Pod 경로 변경 및 적용

만약 Static Pod을 다른 경로에서 관리하고 싶다면 kubelet 설정을 수정해야 한다.

### systemd 설정 파일 열기

```bash
sudo vi /etc/systemd/system/kubelet.service.d/10-kubeadm.conf
```

### 기존 또는 새로운 `--pod-manifest-path` 설정

```
ExecStart=/usr/bin/kubelet ... --pod-manifest-path=/opt/custom-manifests
```

### 설정 적용 및 kubelet 재시작

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

## Static Pod 파일 이동 및 적용 확인

### 기존 Static Pod 경로에서 YAML 파일 복사

```bash
sudo mkdir -p /opt/custom-manifests
sudo cp /etc/kubernetes/manifests/static-nginx.yaml /opt/custom-manifests/
```

또는 새로운 파일 작성

```bash
sudo tee /opt/custom-manifests/static-nginx.yaml <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: static-nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
EOF
```

### 생성된 Pod 확인

```bash
kubectl get pods -A | grep static-nginx
```

Static Pod은 kubelet이 자동으로 생성하기 때문에, 클러스터에서는 `mirror pod` 형태로만 보인다.

# 추가 설명: systemd란?

systemd는 리눅스 운영체제에서 서비스(데몬)의 실행과 관리를 담당하는 init 시스템이다.
kubelet도 systemd에 의해 실행되며, 설정 파일(`/etc/systemd/system/...`)을 통해 동작 방식을 제어할 수 있다.
설정을 변경한 후에는 반드시 `systemctl daemon-reexec` → `daemon-reload` → `restart` 순서로 재시작해야 반영된다.
