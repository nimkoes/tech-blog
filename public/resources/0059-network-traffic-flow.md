# 네트워크 트래픽 처리 흐름 정리

## 개요

이 문서는 `www.my-app.com`에서 `GET /my-app/data` 요청을 보낼 때, 로컬 PC부터 Azure AKS의 Spring Boot 서버까지 이어지는 네트워크 트래픽의 매우 구체적인 처리 과정을 설명합니다.

## 시나리오 설정

**요청 정보**

- URL: `https://www.my-app.com/my-app/data`
- HTTP 메서드: GET
- 사용자 위치: 서울시 강남구 사무실
- 네트워크: 무선 Wi-Fi (KT 인터넷)

**대상 시스템**

- 클라우드: Microsoft Azure
- 컨테이너 오케스트레이션: Azure Kubernetes Service (AKS)
- 프론트엔드: Nginx 웹서버
- 백엔드: Spring Boot 애플리케이션

## 1단계: 로컬 PC에서의 요청 시작

**이 단계의 목적**: 사용자의 요청을 네트워크로 전송할 수 있는 형태로 변환하기 위함

**왜 필요한가?**
- 사용자가 브라우저에 입력한 URL은 사람이 이해할 수 있는 형태
- 네트워크로 전송하려면 컴퓨터가 이해할 수 있는 프로토콜 형태로 변환해야 함
- HTTP 요청 헤더에는 서버가 요청을 올바르게 처리하기 위한 정보가 포함됨

### 1.1 애플리케이션 계층 (Application Layer)

**브라우저 내부 처리**

- 사용자가 브라우저 주소창에 `https://www.my-app.com/my-app/data` 입력
- 브라우저가 URL을 파싱하여 다음 정보 추출:
  - 프로토콜: HTTPS
  - 호스트명: www.my-app.com
  - 경로: /my-app/data
  - 포트: 443 (HTTPS 기본 포트)

**HTTP 요청 생성**

```
GET /my-app/data HTTP/1.1
Host: www.my-app.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: ko-KR,ko;q=0.9,en;q=0.8
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
```

**왜 이 단계가 필요한가?**
- 서버가 어떤 데이터를 요청하는지 명확히 알려주기 위함
- 서버가 클라이언트의 능력(지원하는 언어, 압축 방식 등)을 파악하기 위함
- 보안을 위해 HTTPS 프로토콜을 사용하기 위함

### 1.2 표현 계층 (Presentation Layer)

**데이터 인코딩 및 암호화 준비**

- HTTP 헤더와 본문을 UTF-8로 인코딩
- HTTPS 사용으로 TLS/SSL 암호화 준비
- 브라우저가 지원하는 암호화 스위트 목록 생성:
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256
  - TLS_AES_128_GCM_SHA256

### 1.3 세션 계층 (Session Layer)

**TLS 핸드셰이크 준비**

- 브라우저가 TLS 1.3 핸드셰이크를 위한 랜덤 값 생성
- ClientHello 메시지 구성 준비
- 세션 재사용을 위한 Session ID 생성

## 2단계: DNS 질의 과정

### 2.1 DNS 질의 시작

**처리 주체**: 브라우저 (Chrome, Safari, Firefox 등)

**로컬 DNS 캐시 확인**

- 브라우저가 먼저 로컬 DNS 캐시 확인
- Windows의 경우 `C:\Windows\System32\drivers\etc\hosts` 파일 확인
- Mac의 경우 `/etc/hosts` 파일 확인
- 브라우저 자체 DNS 캐시 확인

**로컬 DNS 캐시 미스 시**

- 브라우저가 운영체제의 DNS 리졸버 호출
- Windows의 경우 `nslookup` 또는 `GetHostByName` API 호출
- Mac의 경우 `dscacheutil` 또는 `getaddrinfo` API 호출

**쉽게 이해하기**

- 브라우저는 먼저 "이 주소를 최근에 찾아본 적이 있나?" 확인
- 마치 전화번호부에서 자주 쓰는 번호를 먼저 찾아보는 것과 같음
- 찾아본 적이 없으면 운영체제에게 "이 주소의 전화번호를 알아봐" 요청

### 2.2 DNS 리졸버 동작

**처리 주체**: 운영체제 (Windows의 경우 DNS Client 서비스, Mac의 경우 mDNSResponder)

**로컬 DNS 서버 설정 확인**

- PC의 네트워크 설정에서 DNS 서버 확인
- Windows의 경우: 제어판 → 네트워크 및 인터넷 → 네트워크 연결 → 속성 → TCP/IPv4 → 속성
- Mac의 경우: 시스템 환경설정 → 네트워크 → 고급 → DNS
- 일반적으로 KT DNS: 168.126.63.1, 168.126.63.2
- 또는 Google DNS: 8.8.8.8, 8.8.4.4

**DNS 질의 패킷 생성**

```
DNS Query Packet:
- Transaction ID: 0x1234
- Flags: Standard Query (0x0100)
- Questions: 1
- Name: www.my-app.com
- Type: A (IPv4)
- Class: IN (Internet)
```

**쉽게 이해하기**

- 운영체제는 "어느 DNS 서버에 물어볼까?" 확인
- 마치 전화번호 안내데스크의 번호를 확인하는 것과 같음
- 그 다음 "www.my-app.com의 주소가 뭐야?"라는 질문을 만들어서 DNS 서버로 보냄

### 2.3 네트워크 계층에서 DNS 패킷 전송

**처리 주체**: 운영체제 네트워크 스택 (Windows의 경우 TCP/IP 스택, Mac의 경우 BSD 네트워크 스택)

**UDP 패킷 생성**

- 소스 포트: 54321 (동적 할당)
- 목적지 포트: 53 (DNS 표준 포트)
- 목적지 IP: 168.126.63.1 (KT DNS 서버)

**IP 패킷 헤더 구성**

```
IP Header:
- Version: 4
- Header Length: 20 bytes
- Total Length: 512 bytes
- TTL: 64
- Protocol: UDP (17)
- Source IP: 192.168.1.100 (PC의 사설 IP)
- Destination IP: 168.126.63.1 (KT DNS 서버)
```

**쉽게 이해하기**

- 운영체제는 DNS 질문을 우편물로 만들어서 보내는 것과 같음
- 발신자 주소(PC IP), 수신자 주소(DNS 서버 IP), 포트 번호를 적어서 패킷을 만듦
- 마치 편지봉투에 주소를 쓰는 것과 같음

### 2.4 데이터 링크 계층에서 프레임 생성

**처리 주체**: 네트워크 어댑터 드라이버 (Windows의 경우 Intel Wireless 드라이버, Mac의 경우 AirPort 드라이버)

**이더넷 프레임 구성**

```
Ethernet Frame:
- Destination MAC: 00:11:22:33:44:55 (공유기 MAC)
- Source MAC: AA:BB:CC:DD:EE:FF (PC의 무선 랜 카드 MAC)
- Type: 0x0800 (IPv4)
- Payload: IP 패킷
```

**쉽게 이해하기**

- 네트워크 카드 드라이버가 패킷을 물리적으로 전송할 수 있는 형태로 바꿈
- 마치 편지를 봉투에 넣고 우표를 붙이는 것과 같음
- MAC 주소는 실제 물리적 주소로, "이 편지를 어느 기계로 보낼까?"를 나타냄

### 2.5 물리 계층에서 무선 신호 전송

**처리 주체**: 무선 네트워크 어댑터 하드웨어 (Intel Wireless-AC 9560, Mac의 경우 Broadcom BCM4360)

**Wi-Fi 신호 변조**

- 802.11ac 프로토콜 사용
- 채널: 6 (2.4GHz 대역)
- 변조 방식: 256-QAM
- 전송 속도: 867 Mbps
- 무선 신호를 공유기로 전송

**쉽게 이해하기**

- 무선 랜 카드가 디지털 데이터를 전자파 신호로 바꿔서 공중으로 전송
- 마치 라디오 방송국이 음악을 전자파로 바꿔서 방송하는 것과 같음
- 2.4GHz는 전자파의 주파수로, 공유기와 PC가 같은 주파수로 통신

## 3단계: 인터넷을 통한 DNS 응답

### 3.1 KT DNS 서버에서의 처리

**처리 주체**: KT DNS 서버 (BIND 또는 PowerDNS 소프트웨어)

**DNS 서버 수신**

- KT DNS 서버 (168.126.63.1)가 DNS 질의 수신
- DNS 캐시 확인 후 캐시 미스 시 상위 DNS 서버로 질의

**재귀적 DNS 질의**

- KT DNS → Root DNS 서버 (.) 질의
- Root DNS → .com DNS 서버 질의
- .com DNS → my-app.com DNS 서버 질의
- my-app.com DNS → www.my-app.com의 A 레코드 반환

**DNS 응답 패킷**

```
DNS Response:
- Transaction ID: 0x1234
- Flags: Response, Authoritative Answer
- Answer: www.my-app.com A 20.123.45.67
- TTL: 300 (5분)
```

**쉽게 이해하기**

- KT DNS 서버는 마치 전화번호 안내데스크와 같음
- "www.my-app.com의 주소가 뭐야?"라는 질문을 받으면
- 먼저 자체 전화번호부에서 찾아보고, 없으면 다른 안내데스크에 물어봄
- 최종적으로 찾은 주소를 질문한 사람에게 알려줌

### 3.2 응답 패킷의 역방향 전송

**처리 주체**: 네트워크 라우터들 (KT 백본 라우터, 지역 POP 라우터, 사용자 공유기)

**네트워크 경로**

- KT DNS 서버 → KT 백본 네트워크 → KT 지역 POP → 사용자 공유기
- 각 홉에서 라우팅 테이블 확인 후 다음 홉으로 전송

**패킷 수신**

- PC가 DNS 응답 패킷 수신
- 브라우저에 IP 주소 (20.123.45.67) 전달

**쉽게 이해하기**

- DNS 서버가 찾은 주소를 다시 PC로 보내는 과정
- 마치 우편물이 여러 우체국을 거쳐서 발신자에게 돌아오는 것과 같음
- 각 라우터는 "이 편지를 어느 방향으로 보낼까?"를 결정하는 역할

## 4단계: TCP 연결 수립

### 4.1 TCP 3-way 핸드셰이크

**처리 주체**: 운영체제 TCP/IP 스택 (Windows의 경우 TCP/IP 드라이버, Mac의 경우 BSD TCP 스택)

**SYN 패킷 전송**

```
TCP Header:
- Source Port: 54322
- Destination Port: 443
- Sequence Number: 1234567890
- Flags: SYN
- Window Size: 65535
```

**SYN-ACK 응답**

- Azure Load Balancer가 SYN-ACK 응답
- Sequence Number: 9876543210
- Acknowledgment Number: 1234567891

**ACK 패킷 전송**

- PC가 ACK 패킷 전송으로 연결 완료
- 양방향 통신 채널 확립

**쉽게 이해하기**

- TCP 연결은 마치 전화를 거는 과정과 같음
- PC가 "여보세요?" (SYN) → 서버가 "네, 여보세요" (SYN-ACK) → PC가 "연결됐네요" (ACK)
- 이 과정을 통해 양쪽이 서로 통신할 준비가 되었음을 확인

### 4.2 TLS 핸드셰이크

**처리 주체**: 브라우저 TLS 라이브러리 (Chrome의 경우 BoringSSL, Safari의 경우 SecureTransport)

**ClientHello 전송**

```
TLS ClientHello:
- TLS Version: 1.3
- Random: 32바이트 랜덤 값
- Cipher Suites: TLS_AES_256_GCM_SHA384, ...
- Extensions: Server Name Indication (SNI)
```

**ServerHello 응답**

- Azure Load Balancer가 ServerHello 응답
- 선택된 암호화 스위트: TLS_AES_256_GCM_SHA384
- 서버 랜덤 값 전송

**키 교환 및 암호화 시작**

- ECDHE 키 교환 수행
- 공유 비밀키 생성
- 이후 모든 통신 암호화

**쉽게 이해하기**

- TLS는 마치 비밀 대화를 위한 암호를 정하는 과정과 같음
- 브라우저가 "이런 방식으로 암호화할 수 있어요" (ClientHello)
- 서버가 "좋아요, 이 방식으로 하죠" (ServerHello)
- 양쪽이 비밀키를 만들어서 앞으로의 대화를 암호화

## 5단계: Azure 클라우드 내부 라우팅

### 5.1 Azure Load Balancer 처리

**처리 주체**: Azure Load Balancer (Microsoft의 소프트웨어 정의 네트워킹)

**Azure Load Balancer 수신**

- 공인 IP: 20.123.45.67
- Load Balancer가 요청을 AKS 클러스터로 전달
- 헬스 체크를 통한 백엔드 풀 상태 확인

**로드 밸런싱 알고리즘**

- 라운드 로빈 방식으로 AKS 노드 선택
- 선택된 노드: aks-nodepool1-12345678-vmss000001

**쉽게 이해하기**

- Azure Load Balancer는 마치 건물의 안내 데스크와 같음
- 방문자가 들어오면 "어느 층으로 안내할까?" 결정
- 여러 서버 중에서 한 대를 선택해서 요청을 전달
- 각 서버가 건강한지(헬스 체크)도 계속 확인

### 5.2 Azure Virtual Network 라우팅

**처리 주체**: Azure Virtual Network (Microsoft의 가상 네트워크 인프라)

**네트워크 보안 그룹 (NSG) 검사**

- 인바운드 규칙 확인: 포트 443 허용
- 아웃바운드 규칙 확인: 모든 트래픽 허용

**서브넷 라우팅**

- AKS 서브넷: 10.0.1.0/24
- 선택된 노드 IP: 10.0.1.5

**쉽게 이해하기**

- Azure Virtual Network는 마치 회사 건물의 보안 시스템과 같음
- 출입문에서 "이 사람이 들어와도 될까?" 확인 (NSG)
- 건물 내부에서 "어느 층으로 가야 할까?" 결정 (서브넷 라우팅)
- 마치 회사 건물에서 방문증을 확인하고 적절한 층으로 안내하는 것과 같음

## 6단계: AKS 클러스터 내부 처리

### 6.1 AKS 노드 수신

**처리 주체**: kube-proxy (쿠버네티스의 네트워크 프록시 컴포넌트)

**kube-proxy 처리**

- 노드의 kube-proxy가 Service 규칙 확인
- Service: my-app-frontend
- ClusterIP: 10.96.1.100
- 포트 매핑: 80 → 8080

**iptables 규칙 적용**

```
iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 10.244.1.5:8080
```

**쉽게 이해하기**

- kube-proxy는 마치 건물 내부의 안내원과 같음
- "어느 방으로 가야 할까?"를 결정하고 안내
- iptables는 마치 건물 내부의 길 안내 표지판과 같음
- "이 방향으로 가면 어느 방에 도착한다"는 규칙을 만들어둠

### 6.2 Pod 선택 및 라우팅

**처리 주체**: 쿠버네티스 Service (kube-proxy와 함께 동작)

**Service Endpoint 선택**

- Service가 관리하는 Endpoint 목록 확인
- 선택된 Pod: my-app-frontend-abc123def456
- Pod IP: 10.244.1.5

**네트워크 정책 검사**

- NetworkPolicy 규칙 확인
- 인그레스 트래픽 허용 규칙 적용

**쉽게 이해하기**

- Service는 마치 건물 내부의 방 목록과 같음
- "어느 방에 손님이 들어와도 될까?" 확인 (NetworkPolicy)
- 여러 방 중에서 한 방을 선택해서 안내

## 7단계: 프론트엔드 Pod 처리

### 7.1 Nginx 컨테이너 수신

**처리 주체**: Nginx 웹서버 (Docker 컨테이너 내부에서 실행)

**Nginx 프로세스 처리**

- Nginx 워커 프로세스가 요청 수신
- 요청 로그 기록:

```
192.168.1.100 - - [15/Dec/2023:10:30:45 +0900] "GET /my-app/data HTTP/1.1" 200 1234
```

**Nginx 설정 확인**

- location 블록 매칭: `/my-app/`
- proxy_pass 설정: `http://my-app-backend:8080`
- 헤더 수정: Host, X-Real-IP, X-Forwarded-For

**쉽게 이해하기**

- Nginx는 마치 건물의 안내 데스크와 같음
- 방문자가 들어오면 "어떤 업무를 보러 오셨나요?" 확인
- 그 업무를 처리할 수 있는 다른 부서로 안내
- 방문자의 정보(IP, 프로토콜 등)를 기록해서 전달

### 7.2 백엔드 Service로 프록시

**처리 주체**: Nginx 프록시 모듈 + kube-dns

**내부 DNS 질의**

- Nginx가 `my-app-backend` 서비스명으로 DNS 질의
- kube-dns가 응답: 10.96.2.100

**프록시 요청 생성**

```
GET /my-app/data HTTP/1.1
Host: my-app-backend:8080
X-Real-IP: 192.168.1.100
X-Forwarded-For: 192.168.1.100
X-Forwarded-Proto: https
```

**쉽게 이해하기**

- Nginx가 "백엔드 부서는 어디에 있나요?"라고 내부 안내데스크에 물어봄
- 안내데스크가 "10.96.2.100에 있습니다"라고 알려줌
- Nginx가 방문자의 정보를 담은 메모와 함께 백엔드 부서로 전달

## 8단계: 백엔드 Pod 처리

### 8.1 Spring Boot 애플리케이션 수신

**처리 주체**: Spring Boot 애플리케이션 (JVM 내부에서 실행)

**Spring Boot 내부 처리**

- DispatcherServlet이 요청 수신
- URL 매핑: `/my-app/data` → `DataController.getData()`
- 요청 로그 기록:

```
2023-12-15 10:30:45.123 INFO  [http-nio-8080-exec-1] c.e.m.DataController - GET /my-app/data 요청 수신
```

**컨트롤러 메서드 실행**

```java

@GetMapping("/my-app/data")
public ResponseEntity<DataResponse> getData() {
  // 비즈니스 로직 실행
  DataService dataService = applicationContext.getBean(DataService.class);
  List<Data> dataList = dataService.getData();

  // 응답 생성
  DataResponse response = new DataResponse(dataList);
  return ResponseEntity.ok(response);
}
```

**쉽게 이해하기**

- Spring Boot는 마치 실제 업무를 처리하는 부서와 같음
- DispatcherServlet은 마치 부서의 안내원으로, "어떤 업무인가요?" 확인
- 컨트롤러는 마치 실제 업무를 담당하는 직원으로, 요청에 따라 데이터를 조회하고 응답

### 8.2 데이터베이스 조회

**처리 주체**: JPA/Hibernate (Spring Boot 애플리케이션 내부)

**JPA/Hibernate 처리**

- EntityManager가 데이터베이스 연결 확인
- SQL 쿼리 생성:

```sql
SELECT d.id, d.name, d.value, d.created_at
FROM data d
WHERE d.status = 'ACTIVE'
ORDER BY d.created_at DESC
```

**데이터베이스 응답 처리**

- ResultSet을 Entity 객체로 변환
- JSON 직렬화 준비

**쉽게 이해하기**

- JPA/Hibernate는 마치 데이터베이스와 대화하는 통역사와 같음
- Java 객체를 SQL 언어로 바꿔서 데이터베이스에 질문
- 데이터베이스가 답변한 결과를 다시 Java 객체로 바꿔서 애플리케이션에 전달

### 8.3 응답 생성

**처리 주체**: Spring Boot HTTP 응답 생성기

**JSON 응답 생성**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Sample Data 1",
      "value": "Value 1",
      "createdAt": "2023-12-15T10:30:45Z"
    },
    {
      "id": 2,
      "name": "Sample Data 2",
      "value": "Value 2",
      "createdAt": "2023-12-15T10:29:30Z"
    }
  ],
  "timestamp": "2023-12-15T10:30:45.123Z"
}
```

**HTTP 응답 헤더 설정**

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Content-Length: 456
Date: Fri, 15 Dec 2023 01:30:45 GMT
Server: Spring Boot/2.7.0
```

**쉽게 이해하기**

- Spring Boot가 조회한 데이터를 브라우저가 이해할 수 있는 JSON 형태로 변환
- 마치 업무 결과를 정리해서 보고서로 만드는 것과 같음
- HTTP 헤더는 마치 보고서의 제목과 작성일, 페이지 수 등을 적는 것과 같음

## 9단계: 응답 전송 과정

### 9.1 백엔드에서 프론트엔드로 응답

**처리 주체**: Spring Boot HTTP 응답 전송기 + Nginx 프록시

**Spring Boot 응답 전송**

- HttpServletResponse에 JSON 데이터 쓰기
- 응답 스트림 플러시
- TCP 소켓을 통한 응답 전송

**Nginx 프록시 응답 처리**

- 백엔드 응답을 받아서 버퍼링
- 응답 헤더 수정:

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Content-Length: 456
Date: Fri, 15 Dec 2023 01:30:45 GMT
Server: nginx/1.18.0
X-Powered-By: Spring Boot
```

**쉽게 이해하기**

- Spring Boot가 완성한 보고서를 Nginx에게 전달
- Nginx가 보고서를 받아서 "이 보고서는 우리 회사에서 만들었습니다"라고 표시 추가
- 마치 부서에서 완성한 보고서를 안내 데스크가 받아서 회사 로고를 찍고 방문자에게 전달하는 것과 같음

### 9.2 AKS 클러스터를 통한 응답 전송

**처리 주체**: kube-proxy + Azure Load Balancer

**Service를 통한 응답 라우팅**

- kube-proxy가 응답을 원본 요청자로 라우팅
- iptables 규칙을 통한 NAT 처리

**Load Balancer 응답 처리**

- Azure Load Balancer가 응답을 클라이언트로 전송
- 연결 풀에서 해당 TCP 연결 찾아서 응답

**쉽게 이해하기**

- kube-proxy가 "이 응답을 어디로 보낼까?" 확인하고 안내
- Azure Load Balancer가 "이 응답을 건물 밖으로 내보내야겠다" 결정
- 마치 안내 데스크가 방문자에게 완성된 보고서를 전달하는 것과 같음

### 9.3 인터넷을 통한 응답 전송

**처리 주체**: 네트워크 라우터들 + 무선 네트워크 어댑터

**네트워크 홉별 전송**

- Azure 데이터센터 → Azure 백본 네트워크 → 인터넷 익스체인지
- KT 백본 네트워크 → KT 지역 POP → 사용자 공유기

**무선 네트워크를 통한 최종 전송**

- 802.11ac 무선 신호로 PC에 응답 전송
- TCP ACK 패킷으로 연결 상태 확인

**쉽게 이해하기**

- 응답이 여러 우체국을 거쳐서 발신자에게 돌아오는 과정
- 마치 택배가 여러 물류센터를 거쳐서 수신자에게 도착하는 것과 같음
- 무선 신호는 마치 라디오 방송이 수신자에게 도달하는 것과 같음

## 10단계: 브라우저에서 응답 처리

### 10.1 브라우저 수신 처리

**처리 주체**: 브라우저 네트워크 스택 (Chrome의 경우 Chromium 네트워크 스택, Safari의 경우 WebKit 네트워크 스택)

**네트워크 스택 처리**

- 무선 랜 카드가 패킷 수신
- 이더넷 프레임 → IP 패킷 → TCP 세그먼트 → HTTP 응답

**TLS 복호화**

- 브라우저가 TLS 복호화 수행
- 공유 비밀키로 응답 데이터 복호화

**HTTP 응답 파싱**

- 브라우저가 HTTP 응답 헤더 파싱
- Content-Type: application/json 확인
- 응답 본문을 JSON으로 파싱

**쉽게 이해하기**

- 브라우저가 우편물을 받아서 봉투를 뜯고 내용을 확인하는 과정
- TLS 복호화는 마치 암호로 된 편지를 해독하는 것과 같음
- HTTP 파싱은 마치 편지의 제목과 내용을 구분해서 읽는 것과 같음

### 10.2 JavaScript 처리

**처리 주체**: 브라우저 JavaScript 엔진 (Chrome의 경우 V8, Safari의 경우 JavaScriptCore)

**응답 데이터 처리**

```javascript
// fetch API 응답 처리
fetch('/my-app/data')
  .then(response => response.json())
  .then(data => {
    console.log('받은 데이터:', data);
    // DOM 업데이트 또는 상태 관리
  });
```

**DOM 업데이트**

- JavaScript가 JSON 데이터를 DOM 요소에 반영
- 사용자에게 결과 표시

**쉽게 이해하기**

- JavaScript는 마치 받은 데이터를 화면에 표시하는 디자이너와 같음
- 받은 JSON 데이터를 웹페이지의 적절한 위치에 배치
- 마치 받은 보고서를 읽고 화면에 예쁘게 정리해서 보여주는 것과 같음

## 기술 용어 정의

### 네트워크 기본 용어

**DNS (Domain Name System)**: 인터넷에서 도메인 이름을 IP 주소로 변환하는 분산 데이터베이스 시스템으로, 사람이 기억하기 쉬운 도메인 이름을 컴퓨터가 이해하는 숫자 IP 주소로 바꿔주는 역할을 합니다.

**IP 주소 (Internet Protocol Address)**: 인터넷에서 각 기기를 식별하는 고유한 숫자 주소로, IPv4는 192.168.1.1과 같은 형태, IPv6는 2001:0db8:85a3:0000:0000:8a2e:0370:7334와 같은 형태를 가집니다.

**MAC 주소 (Media Access Control Address)**: 네트워크 카드의 물리적 주소로, 00:11:22:33:44:55와 같은 형태를 가지며 전 세계에서 유일한 식별자입니다.

**포트 (Port)**: 컴퓨터에서 실행 중인 프로그램을 구분하는 번호로, HTTP는 80번, HTTPS는 443번, DNS는 53번 포트를 사용합니다.

**TTL (Time To Live)**: 패킷이 네트워크에서 살아있을 수 있는 최대 홉(라우터) 수로, 패킷이 무한히 순환하는 것을 방지합니다.

### OSI 7계층 모델

**OSI 7계층 모델**: 네트워크 통신을 7개의 계층으로 나누어 설명하는 표준 모델로, 각 계층은 특정 기능을 담당하며 하위 계층의 서비스를 받아 상위 계층에 서비스를 제공합니다.

**애플리케이션 계층 (Application Layer)**: 사용자와 직접 상호작용하는 계층으로, HTTP, FTP, DNS, SMTP 등의 프로토콜이 이 계층에서 동작합니다.

**표현 계층 (Presentation Layer)**: 데이터의 형식을 변환하는 계층으로, 암호화, 압축, 인코딩 등의 기능을 담당합니다.

**세션 계층 (Session Layer)**: 두 기기 간의 연결을 관리하는 계층으로, 연결의 시작과 종료, 동기화 등을 담당합니다.

**전송 계층 (Transport Layer)**: 데이터의 신뢰성 있는 전송을 보장하는 계층으로, TCP와 UDP 프로토콜이 이 계층에서 동작합니다.

**네트워크 계층 (Network Layer)**: 패킷의 경로를 결정하는 계층으로, IP 프로토콜과 라우팅이 이 계층에서 동작합니다.

**데이터 링크 계층 (Data Link Layer)**: 물리적 연결을 통해 데이터를 전송하는 계층으로, 이더넷 프레임과 MAC 주소가 이 계층에서 사용됩니다.

**물리 계층 (Physical Layer)**: 실제 전기 신호나 무선 신호로 데이터를 전송하는 계층으로, 케이블, 무선 신호, 네트워크 카드 등이 이 계층에 속합니다.

### 프로토콜 관련 용어

**HTTP (HyperText Transfer Protocol)**: 웹에서 데이터를 주고받기 위한 프로토콜로, 클라이언트-서버 모델을 기반으로 동작합니다.

**HTTPS (HTTP Secure)**: HTTP에 SSL/TLS 암호화를 추가한 보안 프로토콜로, 데이터의 기밀성과 무결성을 보장합니다.

**TCP (Transmission Control Protocol)**: 신뢰성 있는 데이터 전송을 보장하는 프로토콜로, 연결 지향적이며 데이터 손실을 방지합니다.

**UDP (User Datagram Protocol)**: 빠른 데이터 전송을 위한 프로토콜로, 연결 없이 동작하며 일부 데이터 손실을 허용합니다.

**TLS (Transport Layer Security)**: 인터넷에서 데이터를 안전하게 전송하기 위한 암호화 프로토콜로, 클라이언트와 서버 간의 통신을 암호화하여 데이터의 기밀성과 무결성을 보장합니다.

**SSL (Secure Sockets Layer)**: TLS의 이전 버전으로, 현재는 TLS로 대체되었지만 여전히 SSL이라는 용어가 널리 사용됩니다.

### 무선 네트워크 용어

**Wi-Fi**: 무선 근거리 통신망 기술로, IEEE 802.11 표준을 기반으로 합니다.

**802.11ac**: Wi-Fi의 한 표준으로, 5GHz 대역에서 최대 3.5Gbps의 속도를 제공합니다.

**QAM (Quadrature Amplitude Modulation)**: 디지털 데이터를 아날로그 신호로 변조하는 방식으로, 256-QAM은 256개의 서로 다른 신호 상태를 사용합니다.

**채널 (Channel)**: 무선 통신에서 사용하는 주파수 대역으로, 2.4GHz 대역에서는 1-13번 채널이 사용됩니다.

### 클라우드 및 컨테이너 용어

**Azure**: Microsoft에서 제공하는 클라우드 컴퓨팅 플랫폼으로, 가상 머신, 데이터베이스, 네트워킹 등의 서비스를 제공합니다.

**AKS (Azure Kubernetes Service)**: Azure에서 제공하는 관리형 쿠버네티스 서비스로, 컨테이너 오케스트레이션을 자동화합니다.

**Load Balancer**: 여러 서버에 들어오는 트래픽을 분산시켜 주는 네트워크 장비로, 서버의 부하를 균등하게 분배하고 가용성을 높이는 역할을 합니다.

**Virtual Network**: 클라우드에서 제공하는 가상 네트워크로, 실제 네트워크와 유사한 기능을 제공하지만 소프트웨어로 구현됩니다.

**NSG (Network Security Group)**: Azure에서 네트워크 트래픽을 필터링하는 보안 기능으로, 인바운드와 아웃바운드 규칙을 설정할 수 있습니다.

### 쿠버네티스 용어

**Kubernetes**: 컨테이너 오케스트레이션 플랫폼으로, 컨테이너의 배포, 확장, 관리를 자동화합니다.

**Pod**: 쿠버네티스에서 실행되는 최소 단위로, 하나 이상의 컨테이너를 포함할 수 있습니다.

**Service**: 쿠버네티스에서 Pod 집합에 대한 네트워크 접근을 제공하는 추상화 계층으로, Pod의 IP가 변경되어도 일관된 엔드포인트를 제공하고 로드 밸런싱 기능을 수행합니다.

**kube-proxy**: 쿠버네티스의 네트워크 프록시 컴포넌트로, Service의 가상 IP를 실제 Pod IP로 변환합니다.

**iptables**: Linux에서 패킷 필터링과 NAT를 수행하는 도구로, 네트워크 규칙을 설정하여 트래픽을 제어합니다.

**ClusterIP**: 쿠버네티스 Service의 기본 타입으로, 클러스터 내부에서만 접근 가능한 가상 IP를 제공합니다.

**Endpoint**: 쿠버네티스에서 Service가 연결할 Pod의 IP와 포트 정보를 담고 있는 리소스입니다.

### 웹 서버 및 애플리케이션 용어

**Nginx**: 고성능 웹서버로, 리버스 프록시, 로드 밸런서, HTTP 캐시 등의 기능을 제공합니다.

**Spring Boot**: Java 기반의 웹 애플리케이션 프레임워크로, 빠른 개발과 자동 설정을 지원합니다.

**DispatcherServlet**: Spring MVC의 핵심 컴포넌트로, 모든 HTTP 요청을 받아서 적절한 컨트롤러로 라우팅합니다.

**JPA (Java Persistence API)**: Java에서 데이터베이스와 상호작용하기 위한 표준 API로, 객체 관계 매핑을 제공합니다.

**Hibernate**: JPA의 구현체로, Java 객체를 데이터베이스 테이블과 매핑하는 ORM 프레임워크입니다.

**JSON (JavaScript Object Notation)**: 데이터를 주고받기 위한 경량화된 데이터 형식으로, 사람이 읽기 쉽고 기계가 파싱하기 쉬운 형태입니다.

### 브라우저 관련 용어

**Chrome**: Google에서 개발한 웹 브라우저로, Chromium 엔진을 기반으로 합니다.

**Safari**: Apple에서 개발한 웹 브라우저로, WebKit 엔진을 기반으로 합니다.

**BoringSSL**: Google에서 개발한 SSL/TLS 라이브러리로, OpenSSL을 기반으로 하며 보안과 성능을 개선했습니다.

**SecureTransport**: Apple에서 개발한 SSL/TLS 라이브러리로, macOS와 iOS에서 사용됩니다.

**V8**: Google에서 개발한 JavaScript 엔진으로, Chrome과 Node.js에서 사용됩니다.

**JavaScriptCore**: Apple에서 개발한 JavaScript 엔진으로, Safari에서 사용됩니다.

### 운영체제 관련 용어

**Windows**: Microsoft에서 개발한 운영체제로, 데스크톱과 서버 환경에서 널리 사용됩니다.

**macOS**: Apple에서 개발한 운영체제로, Mac 컴퓨터에서 사용됩니다.

**BSD (Berkeley Software Distribution)**: Unix 계열의 운영체제로, macOS의 네트워크 스택 기반이 됩니다.

**mDNSResponder**: macOS에서 DNS 해석을 담당하는 서비스로, 로컬 DNS 캐시와 멀티캐스트 DNS를 처리합니다.

### 네트워크 하드웨어 용어

**라우터**: 네트워크 간의 패킷을 전달하는 장비로, 라우팅 테이블을 기반으로 최적 경로를 결정합니다.

**스위치**: 네트워크 내에서 패킷을 전달하는 장비로, MAC 주소를 기반으로 패킷을 전송합니다.

**네트워크 어댑터**: 컴퓨터를 네트워크에 연결하는 하드웨어로, 이더넷 카드나 무선 랜 카드가 이에 해당합니다.

**POP (Point of Presence)**: 인터넷 서비스 제공업체(ISP)의 네트워크 접속점으로, 사용자와 인터넷 백본을 연결합니다.

### 보안 관련 용어

**암호화 (Encryption)**: 데이터를 읽을 수 없는 형태로 변환하는 과정으로, 데이터의 기밀성을 보장합니다.

**복호화 (Decryption)**: 암호화된 데이터를 원래 형태로 되돌리는 과정입니다.

**암호화 스위트 (Cipher Suite)**: 암호화에 사용되는 알고리즘 조합으로, 키 교환, 암호화, 해시 함수 등을 포함합니다.

**ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)**: 키 교환을 위한 암호화 알고리즘으로, 타원곡선 암호화를 사용합니다.

### 데이터베이스 관련 용어

**SQL (Structured Query Language)**: 관계형 데이터베이스에서 데이터를 조회하고 조작하기 위한 표준 언어입니다.

**ResultSet**: 데이터베이스 쿼리의 결과를 담고 있는 객체로, 조회된 데이터에 접근할 수 있는 인터페이스를 제공합니다.

**Entity**: JPA에서 데이터베이스 테이블과 매핑되는 Java 클래스로, 객체 관계 매핑의 핵심 개념입니다.

### 기타 용어

**직렬화 (Serialization)**: 객체를 바이트 스트림으로 변환하는 과정으로, 네트워크 전송이나 저장을 위해 사용됩니다.

**역직렬화 (Deserialization)**: 바이트 스트림을 객체로 변환하는 과정입니다.

**캐시 (Cache)**: 자주 사용되는 데이터를 빠른 저장소에 보관하는 기술로, 성능 향상을 위해 사용됩니다.

**홉 (Hop)**: 네트워크에서 패킷이 한 라우터에서 다음 라우터로 이동하는 단계를 의미합니다.

**라운드 로빈 (Round Robin)**: 로드 밸런싱 알고리즘의 하나로, 요청을 순차적으로 각 서버에 분배하는 방식입니다. 