---
title: "VM 과 Container 비교"
description: ""
author: "nimkoes"
date: "2021-03-02"
---

![0003-01](/tech-blog/resources/images/kubernetes/0003-01.png)

VM 과 Container 모두 공통적으로 하나의 서버(Host Server)가 있고 그 서버에는 Host OS 가 올라간다.

VM 의 경우 Host OS 위에 VM 을 가상화 하기 위한 여러 Hypervisor 가 있고 그 위에 Guest OS 를 올려 다수의 VM 을 만들 수 있다. 이 Guest OS 역시 Host OS 와 같이
독립적으로 사용해서 각각의 OS 에 애플리케이션을 설치하고 서비스를 만들어 제공할 수 있다.

Container 의 경우 Host OS 위에 Container 가상화를 시켜주는 다양한 소프트웨어들이 있는데, 보편적으로 Docker 를 많이 사용 한다.

![0003-02](/tech-blog/resources/images/kubernetes/0003-02.png)

Docker 를 사용해서 Container 를 만들 수 있다.

Linux 마다 버전이 있고, 이 버전에 따라 기본적으로 제공되는 라이브러리가 서로 다르다. 만약 Linux 6 버전에서 개발을 하면 자연스럽게 설치되어 있는 OpenJDK 라이브러리를 사용하게 된다. 개발이 완료
된 다음 이것을 Linux 7 버전에서 띄우게 되면 버전 차이에 대한 이슈가 발생할 가능성이 높다.

그래서 Docker 를 설치하고 Container image 를 만들게 되는데, image 에는 하나의 서비스와 이 서비스가 동작하는데 필요한 라이브러리들이 포함되어 있다. 그래서 Linux 7 버전에 다른
라이브러리들이 있어도 Docker 가 설치되어 있고, Container image 를 가져와 사용했을 때 각 서비스는 자신의 라이브러리를 사용하기 때문에 안정적으로 시스템을 구동할 수 있다.

Docker 가 해주는 또 다른 일은 다수의 Container 간 Host 자원을 분리해서 사용할 수 있도록 해주는데, Linux 고유 기술인 namespace 와 cgroupos 을 사용 한다. namespace
는 커널에 관련된 영역을 분리 해주고, cgroups 는 자원에 대한 영역을 분리 해준다.

다시 말해 Docker 와 같은 Container 가상화 솔루션들은 OS 에서 제공하는 자원 격리 기술을 이용해서 Container 라는 단위로 서비스를 분리할 수 있게 해주고, 이로 인해 Container 가상화가
설치 된 OS 에서는 개발 환경에 대한 걱정 없이 배포가 가능해진다.

VM 은 각각의 OS 를 띄워 사용하고, Container 는 하나의 OS 를 공유해서 사용하는 구조이기 때문에 두 방법은 서로 장점과 단점을 가지고 있다.

---

**VM 특징**

Host OS 로 Window 를 사용하고 있어도 Guest OS 로 Linux 를 설치해서 사용할 수 있다.
Guest OS 를 설치하기 때문에 느린 속도
Guest OS 가 보안에 뚫여도 Host OS 와 분리되어 있기 때문에 각각 VM 간 피해가 없음

**Container 특징**

Host OS 와 다른 OS 의 Container 사용 불가능
Guest OS 를 사용하지 않기 때문에 빠른 속도
하나의 Container 가 보안에 뚫려 Host OS 에 접근하게 되면 다른 Container 들도 위험

![0003-03](/tech-blog/resources/images/kubernetes/0003-03.png)

시스템 개발 관점에서 VM 과 Container 의 다른점이 있다.

일반적으로 하나의 서비스를 만들 때 다수의 모듈이 하나의 서비스로 만들어져 동작 한다. 그래서 만약 Module A 와 Module B 는 괜찮은데 Module C 에 부하가 심한 경우 VM 을 하나 더 생성해서
띄우게 된다. 자원 사용과 성능 관점에서 비효율 적이다.

반면 Container 는 하나의 서비스를 만들 때 Module 단위로 쪼개어 각각의 Container 안에 담는 것을 권장한다. 뿐만 아니라 각 모듈은 각자 기능에 적합한 언어를 사용하면 더 좋다고 한다. 여기서
Kubernetes 는 다수의 Container 들을 Pod 라는 개념으로 묶을 수 있고, 이 Pod 가 하나의 배포 단위가 된다. 결과적으로 내가 필요한 Pod 만 (부하가 심한 Module) 확장을 할 수 있고
이것을 Kubernetes 가 쉽게 할 수 있도록 도움을 준다.