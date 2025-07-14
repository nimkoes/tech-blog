# 네트워크 트래픽 처리 흐름 정리

## 개요

이 문서는 `www.my-app.com`에서 `GET /my-app/data` 요청을 보낼 때, 로컬 PC부터 Azure AKS의 Spring Boot 서버까지 이어지는 네트워크 트래픽의 매우 구체적인 처리 과정을 설명합니다.

## 네트워크 장비 개요

네트워크 트래픽이 처리되는 과정에서 여러 네트워크 장비들이 각각의 역할을 수행합니다.

**주요 네트워크 장비들**

- **로컬 PC**: 사용자의 요청을 생성하고 네트워크로 전송하는 출발점
- **인터넷 공유기**: 가정이나 사무실의 여러 기기를 인터넷에 연결하는 중간 다리 역할
- **스위치**: 네트워크 내에서 패킷을 정확한 목적지로 전달하는 교통 정리 역할
- **라우터**: 서로 다른 네트워크 간의 패킷을 전달하는 우체국 역할

**쉽게 이해하기**

- 로컬 PC는 마치 편지를 쓰는 사람과 같습니다.
- 인터넷 공유기는 마치 아파트의 우체통과 같습니다.
- 스위치는 마치 건물 내부의 안내원과 같습니다.
- 라우터는 마치 도시 간 우편물을 전달하는 우체국과 같습니다.

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

**상태 스냅샷 #0: 브라우저 내부 URL 파싱 및 요청 생성**

**브라우저 URL 파싱 테이블**

```
브라우저 URL 파싱 결과:
┌───────────┬────────────────┬─────────────────┬────────────────┐
│ component │ value          │ description     │ reference      │
├───────────┼────────────────┼─────────────────┼────────────────┤
│ protocol  │ https          │ Secure Protocol │ RFC 2818       │
│ hostname  │ www.my-app.com │ Server Domain   │ DNS Lookup     │
│ path      │ /my-app/data   │ API Endpoint    │ Server Routing │
│ port      │ 443            │ HTTPS Default   │ RFC 2818       │
│ query     │ (none)         │ GET Request     │ -              │
│ fragment  │ (none)         │ Anchor Tag      │ -              │
└───────────┴────────────────┴─────────────────┴────────────────┘
```

**브라우저 HTTP 요청 생성 과정**

**1단계: HTTP 메서드 결정**

```
요청 타입 분석:
┌─────────────┬────────┬──────────────┬───────────┐
│ input type  │ method │ reason       │ reference │
├─────────────┼────────┼──────────────┼───────────┤
│ URL Input   │ GET    │ Data Query   │ RFC 7231  │
│ Form Submit │ POST   │ Data Transfer│ RFC 7231  │
│ Link Click  │ GET    │ Page Move    │ RFC 7231  │
└─────────────┴────────┴──────────────┴───────────┘
```

**2단계: HTTP 헤더 생성**

```
HTTP 헤더 생성 과정:
┌─────────────┬───────────────────┬────────────────┬─────────────────┐
│ header name │ value             │ source         │ generation rule │
├─────────────┼───────────────────┼────────────────┼─────────────────┤
│ Host        │ www.my-app.com    │ URL Parsing    │ RFC 7230 5.4    │
│ User-Agent  │ Mozilla/5.0...    │ Browser Info   │ Browser Config  │
│ Accept      │ text/html,app...  │ Browser Config │ RFC 7231 5.3.2  │
│ Accept-Lang │ ko-KR,ko;q=0.9... │ User Config    │ RFC 7231 5.3.5  │
│ Accept-Enc  │ gzip,deflate,br   │ Browser Support│ RFC 7231 5.3.4  │
│ Connection  │ keep-alive        │ Performance    │ RFC 7230 6.1    │
└─────────────┴───────────────────┴────────────────┴─────────────────┘
```

**3단계: HTTP 요청 라인 생성**

```
HTTP 요청 라인 구조:
┌──────────────┬──────────────┬──────────────┬───────────────┐
│ component    │ value        │ format       │ RFC reference │
├──────────────┼──────────────┼──────────────┼───────────────┤
│ method       │ GET          │ Uppercase    │ RFC 7231 4.1  │
│ request-uri  │ /my-app/data │ Absolute Path│ RFC 7230 5.3  │
│ http-version │ HTTP/1.1     │ Version      │ RFC 7230 2.6  │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

**최종 HTTP 요청 생성**

```
HTTP 요청 구조 (바이트 단위):
┌────────────────────────────────────────────────────────────────┐
│ GET /my-app/data HTTP/1.1\r\n                                  │
│ Host: www.my-app.com\r\n                                       │
│ User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...\r\n   │
│ Accept: text/html,application/xhtml+xml,application/xml...\r\n │
│ Accept-Language: ko-KR,ko;q=0.9,en;q=0.8\r\n                   │
│ Accept-Encoding: gzip, deflate, br\r\n                         │
│ Connection: keep-alive\r\n                                     │
│ \r\n                                                           │
│ (empty statement)                                              │
└────────────────────────────────────────────────────────────────┘
```

**HTTP 요청 바이트 분석**

```
HTTP 요청 바이트 구조:
┌─────────┬─────────────┬─────────┬──────────┬──────────────┐
│ offset  │ bytes       │ content │ encoding │ description  │
├─────────┼─────────────┼─────────┼──────────┼──────────────┤
│ 0-15    │ GET /my-app │ ASCII   │ UTF-8    │ Request Line │
│ 16-31   │ /data HTTP/ │ ASCII   │ UTF-8    │ Request Line │
│ 32-35   │ 1.1\r\n     │ ASCII   │ UTF-8    │ Request Line │
│ 36-49   │ Host: www.m │ ASCII   │ UTF-8    │ Header Line  │
│ 50-63   │ y-app.com\r │ ASCII   │ UTF-8    │ Header Line  │
│ 64-67   │ \n          │ CRLF    │ -        │ Header Sep   │
│ ...     │ ...         │ ...     │ ...      │ ...          │
│ 200-203 │ \r\n\r\n    │ CRLF    │ -        │ Header End   │
└─────────┴─────────────┴─────────┴──────────┴──────────────┘
```

**브라우저 내부 상태 테이블**

```
브라우저 요청 상태:
┌────────────┬──────────────┬────────┬─────────┬──────────────┐
│ request ID │ URL          │ method │ status  │ timestamp    │
├────────────┼──────────────┼────────┼─────────┼──────────────┤
│ req-001    │ /my-app/data │ GET    │ PARSING │ 10:30:45.123 │
│ req-002    │ /my-app/stat │ GET    │ QUEUED  │ 10:30:45.124 │
│ req-003    │ /my-app/conf │ GET    │ QUEUED  │ 10:30:45.125 │
└────────────┴──────────────┴────────┴─────────┴──────────────┘
```

**쉽게 이해하기**

- 브라우저는 마치 편지를 쓰기 전에 "어디로 보낼까?"를 결정하는 것과 같습니다
- URL 파싱은 마치 편지봉투에 주소를 쓰는 것과 같습니다
- HTTP 헤더는 마치 편지에 "발신자 정보"와 "특별 요청사항"을 적는 것과 같습니다
- 요청 라인은 마치 편지의 제목을 쓰는 것과 같습니다

**왜 이 단계가 필요한가?**

- **서버가 어떤 데이터를 요청하는지 명확히 알려주기 위함**: HTTP 메서드와 경로로 서버가 처리할 작업을 명시
- **서버가 클라이언트의 능력(지원하는 언어, 압축 방식 등)을 파악하기 위함**: Accept 헤더로 클라이언트가 처리할 수 있는 응답 형식 전달
- **보안을 위해 HTTPS 프로토콜을 사용하기 위함**: TLS 암호화를 통한 데이터 기밀성 보장
- **성능 최적화를 위함**: Connection: keep-alive로 연결 재사용, Accept-Encoding으로 압축 지원

### 1.2 표현 계층 (Presentation Layer)

**데이터 인코딩 및 암호화 준비**

- HTTP 헤더와 본문을 UTF-8로 인코딩
- HTTPS 사용으로 TLS/SSL 암호화 준비
- 브라우저가 지원하는 암호화 스위트 목록 생성
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

**상태 스냅샷 #1: 브라우저 DNS 캐시 확인**

**브라우저 DNS 캐시 테이블**

```
브라우저 DNS 캐시 테이블:
┌────────────────┬────────────────┬──────┬─────────────┬──────────────┐
│ domain name    │ IP address     │ TTL  │ timestamp   │ cache status │
├────────────────┼────────────────┼──────┼─────────────┼──────────────┤
│ www.google.com │ 142.250.191.78 │ 300s │ 10:25:30    │ VALID        │
│ www.naver.com  │ 223.130.195.95 │ 600s │ 10:20:15    │ VALID        │
│ www.my-app.com │ -              │ -    │ -           │ MISS         │
└────────────────┴────────────────┴──────┴─────────────┴──────────────┘
```

**브라우저 DNS 캐시 검색 알고리즘 (상세)**

**1단계: 캐시 키 생성 및 정규화**

```
도메인명 정규화 과정:
┌─────────────────┬────────────────┬─────────────┬───────────────┬────────────┐
│ input           │ normalized     │ algorithm   │ result        │ hash value │
├─────────────────┼────────────────┼─────────────┼───────────────┼────────────┤
│ www.my-app.com  │ www.my-app.com │ toLowerCase │ Cache Key Gen │ 0x12345678 │
│ WWW.MY-APP.COM  │ www.my-app.com │ toLowerCase │ Cache Key Gen │ 0x12345678 │
│ www.my-app.com. │ www.my-app.com │ trim('.')   │ Cache Key Gen │ 0x12345678 │
│ my-app.com      │ my-app.com     │ identity    │ Cache Key Gen │ 0x87654321 │
└─────────────────┴────────────────┴─────────────┴───────────────┴────────────┘
```

**2단계: 해시 테이블 검색**

```
해시 테이블 검색 과정:
┌──────┬────────────────────────┬────────────┬──────────────┬────────────┐
│ step │ operation              │ hash key   │ bucket index │ result     │
├──────┼────────────────────────┼────────────┼──────────────┼────────────┤
│ 1    │ hash("www.my-app.com") │ 0x12345678 │ 0x78         │ bucket 120 │
│ 2    │ bucket[120] search     │ -          │ -            │ EMPTY      │
│ 3    │ linked list loop       │ -          │ -            │ NOT_FOUND  │
│ 4    │ return cache miss      │ -          │ -            │ MISS       │
└──────┴────────────────────────┴────────────┴──────────────┴────────────┘
```

**3단계: TTL 검증 (캐시 히트 시)**

```
TTL 검증 과정:
┌────────────────┬─────────────┬──────────────┬──────┬─────────┬─────────┐
│ domain         │ cached time │ current time │ TTL  │ elapsed │ status  │
├────────────────┼─────────────┼──────────────┼──────┼─────────┼─────────┤
│ www.google.com │ 10:25:30    │ 10:30:45     │ 300s │ 315s    │ EXPIRED │
│ www.naver.com  │ 10:20:15    │ 10:30:45     │ 600s │ 630s    │ EXPIRED │
│ www.my-app.com │ -           │ 10:30:45     │ -    │ -       │ MISS    │
└────────────────┴─────────────┴──────────────┴──────┴─────────┴─────────┘
```

**4단계: 캐시 미스 처리**

```
캐시 미스 처리 과정:
┌──────┬───────────────┬────────────────┬─────────────┬─────────┬───────────────┐
│ step │ action        │ target         │ method      │ result  │ next action   │
├──────┼───────────────┼────────────────┼─────────────┼─────────┼───────────────┤
│ 1    │ Browser Cache │ www.my-app.com │ hash lookup │ MISS    │ hosts file    │
│ 2    │ hosts file    │ /etc/hosts     │ file read   │ MISS    │ OS Resolver   │
│ 3    │ OS Resolver   │ getaddrinfo    │ API call    │ PENDING │ DNS Server    │
│ 4    │ DNS Server    │ 168.126.63.1   │ UDP query   │ PENDING │ Wait Response │
└──────┴───────────────┴────────────────┴─────────────┴─────────┴───────────────┘
```

### 2.2 운영체제 DNS 리졸버 호출

**상태 스냅샷 #2: 운영체제 DNS 리졸버 내부 상태**

**운영체제 DNS 캐시 테이블 (상세)**

```
OS DNS 캐시 테이블 (Linux /proc/net/dns_resolver):
┌────────────────┬────────────────┬──────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ domain name    │ IP address     │ TTL  │ timestamp   │ cache status │ resolver    │ query count │
├────────────────┼────────────────┼──────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ www.google.com │ 142.250.191.78 │ 300s │ 10:25:30    │ VALID        │ systemd     │ 15          │
│ www.naver.com  │ 223.130.195.95 │ 600s │ 10:20:15    │ VALID        │ systemd     │ 8           │
│ www.my-app.com │ -              │ -    │ -           │ MISS         │ -           │ 0           │
│ api.github.com │ 140.82.113.6   │ 180s │ 10:28:12    │ VALID        │ systemd     │ 3           │
└────────────────┴────────────────┴──────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**운영체제 DNS 설정 테이블**

```
OS DNS 설정 (/etc/resolv.conf):
┌────────────┬──────────────────────┬────────┬──────────┬────────┐
│ setting    │ value                │ source │ priority │ status │
├────────────┼──────────────────────┼────────┼──────────┼────────┤
│ nameserver │ 168.126.63.1         │ DHCP   │ 1        │ ACTIVE │
│ nameserver │ 168.126.63.2         │ DHCP   │ 2        │ BACKUP │
│ nameserver │ 8.8.8.8              │ manual │ 3        │ BACKUP │
│ search     │ localdomain          │ DHCP   │ -        │ ACTIVE │
│ options    │ timeout:2 attempts:3 │ DHCP   │ -        │ ACTIVE │
│ options    │ rotate               │ DHCP   │ -        │ ACTIVE │
└────────────┴──────────────────────┴────────┴──────────┴────────┘
```

**운영체제 DNS 리졸버 알고리즘 (상세)**

**1단계: 로컬 DNS 캐시 확인**

```
로컬 DNS 캐시 검색 과정:
┌──────┬────────────────────────┬─────────────┬─────────────┬───────────────┐
│ step │ operation              │ data source │ result      │ next action   │
├──────┼────────────────────────┼─────────────┼─────────────┼───────────────┤
│ 1    │ /proc/net/dns_resolver │ kernel      │ cache table │ search        │
│ 2    │ hash("www.my-app.com") │ cache key   │ 0x87654321  │ bucket search │
│ 3    │ bucket[0x21] search    │ cache table │ EMPTY       │ next step     │
│ 4    │ linked list loop       │ cache table │ NOT_FOUND   │ hosts file    │
└──────┴────────────────────────┴─────────────┴─────────────┴───────────────┘
```

**2단계: hosts 파일 확인**

```
hosts 파일 검색 과정:
┌──────┬─────────────────────────┬────────────┬───────────┬─────────────┐
│ step │ operation               │ file path  │ result    │ next action │
├──────┼─────────────────────────┼────────────┼───────────┼─────────────┤
│ 1    │ open file               │ /etc/hosts │ SUCCESS   │ read        │
│ 2    │ line scan               │ hosts file │ SCANNING  │ matching    │
│ 3    │ "www.my-app.com" search │ hosts file │ NOT_FOUND │ DNS server  │
│ 4    │ close file              │ /etc/hosts │ SUCCESS   │ next step   │
└──────┴─────────────────────────┴────────────┴───────────┴─────────────┘
```

**3단계: DNS 서버 선택 및 질의**

```
DNS 서버 선택 알고리즘:
┌───────────┬──────────────┬──────────┬─────────┬────────────┬────────────┐
│ server    │ IP address   │ priority │ status  │ last query │ next query │
├───────────┼──────────────┼──────────┼─────────┼────────────┼────────────┤
│ primary   │ 168.126.63.1 │ 1        │ ACTIVE  │ 10:30:40   │ 10:30:45   │
│ secondary │ 168.126.63.2 │ 2        │ STANDBY │ 10:30:35   │ -          │
│ tertiary  │ 8.8.8.8      │ 3        │ STANDBY │ 10:30:30   │ -          │
└───────────┴──────────────┴──────────┴─────────┴────────────┴────────────┘
```

**DNS 질의 패킷 생성 (상세)**

```
DNS 질의 패킷 구조:
┌─────────────────────────────────────────────────────────────────────────────┐
│ DNS Header (12 bytes)                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ ID: 0x1234 (2 bytes) - Random Transaction ID                                │
│ Flags: 0x0100 (2 bytes) - Standard Query (QR=0, OPCODE=0, AA=0, TC=0, RD=1) │
│ QDCOUNT: 1 (2 bytes) - Query Count                                          │
│ ANCOUNT: 0 (2 bytes) - Answer Count                                         │
│ NSCOUNT: 0 (2 bytes) - Authority Server Count                               │
│ ARCOUNT: 0 (2 bytes) - Additional Info Count                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ DNS Question (variable)                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ QNAME: www.my-app.com (variable) - Domain Name (Length+Label Format)        │
│ QTYPE: A (2 bytes) - Record Type (IPv4 Address)                             │
│ QCLASS: IN (2 bytes) - Class (Internet)                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**DNS 질의 패킷 바이트 분석**

```
DNS 패킷 바이트 구조:
┌────────┬──────────────┬──────────────────┬───────────────┬─────────────┬─────────────┐
│ offset │ bytes        │ value            │ meaning       │ encoding    │ description │
├────────┼──────────────┼──────────────────┼───────────────┼─────────────┼─────────────┤
│ 0-1    │ 0x1234       │ Transaction ID   │ Packet ID     │ big-endian  │ Random Gen  │
│ 2-3    │ 0x0100       │ Flags            │ Standard Q    │ big-endian  │ DNS Header  │
│ 4-5    │ 0x0001       │ Query Count      │ 1             │ big-endian  │ QDCOUNT     │
│ 6-7    │ 0x0000       │ Answer Count     │ 0             │ big-endian  │ ANCOUNT     │
│ 8-9    │ 0x0000       │ Authority Count  │ 0             │ big-endian  │ NSCOUNT     │
│ 10-11  │ 0x0000       │ Additional Count │ 0             │ big-endian  │ ARCOUNT     │
│ 12     │ 0x03         │ Label Length     │ 3 chars       │ binary      │ 'www'       │
│ 13-15  │ 0x777777     │ 'www'            │ Domain Label  │ ASCII       │ Label 1     │
│ 16     │ 0x07         │ Label Length     │ 7 chars       │ binary      │ 'my-app'    │
│ 17-23  │ 0x6d792d6170 │ 'my-app'         │ Domain Label  │ ASCII       │ Label 2     │
│ 24     │ 0x03         │ Label Length     │ 3 chars       │ binary      │ 'com'       │
│ 25-27  │ 0x636f6d     │ 'com'            │ Domain Label  │ ASCII       │ Label 3     │
│ 28     │ 0x00         │ End Marker       │ Label End     │ binary      │ null byte   │
│ 29-30  │ 0x0001       │ Record Type      │ A (IPv4)      │ big-endian  │ QTYPE       │
│ 31-32  │ 0x0001       │ Class            │ IN (Internet) │ big-endian  │ QCLASS      │
└────────┴──────────────┴──────────────────┴───────────────┴─────────────┴─────────────┘
```

**운영체제 DNS 리졸버 상태 머신 (상세)**

```
OS DNS 리졸버 상태 전이:
┌───────────────┬─────────────────┬─────────────┬─────────────────┬──────────────────┬─────────┐
│ current state │ event           │ next state  │ action          │ reference table  │ timeout │
├───────────────┼─────────────────┼─────────────┼─────────────────┼──────────────────┼─────────┤
│ IDLE          │ browser request │ CACHE_CHECK │ OS cache seatch │ /proc/net/dns    │ -       │
│ CACHE_CHECK   │ cache hit       │ RESOLVED    │ IP return       │ cache table      │ -       │
│ CACHE_CHECK   │ cache miss      │ HOSTS_CHECK │ hosts file      │ /etc/hosts       │ -       │
│ HOSTS_CHECK   │ hosts hit       │ RESOLVED    │ IP return       │ hosts table      │ -       │
│ HOSTS_CHECK   │ hosts miss      │ DNS_QUERY   │ DNS server      │ resolv.conf      │ -       │
│ DNS_QUERY     │ DNS response    │ RESOLVED    │ IP return       │ network stack    │ -       │
│ DNS_QUERY     │ DNS timeout     │ RETRY       │ retry           │ retry logic      │ 2s      │
│ RETRY         │ maximum retry   │ FAILED      │ catch exception │ error handler    │ 3 times │
│ RESOLVED      │ cache update    │ IDLE        │ save cache      │ cache table      │ -       │
└───────────────┴─────────────────┴─────────────┴─────────────────┴──────────────────┴─────────┘
```

**브라우저 내부 DNS 상태 머신 (상세)**

```
DNS 상태 전이 머신:
┌───────────────┬──────────────┬─────────────┬─────────────────┬─────────────────┬─────────┐
│ current state │ event        │ next state  │ action          │ reference table │ timeout │
├───────────────┼──────────────┼─────────────┼─────────────────┼─────────────────┼─────────┤
│ IDLE          │ URL input    │ CACHE_CHECK │ cache search    │ browser cache   │ -       │
│ CACHE_CHECK   │ cache hit    │ RESOLVED    │ IP return       │ cache table     │ -       │
│ CACHE_CHECK   │ cache miss   │ HOSTS_CHECK │ hosts file      │ /etc/hosts      │ -       │
│ HOSTS_CHECK   │ hosts hit    │ RESOLVED    │ IP return       │ hosts table     │ -       │
│ HOSTS_CHECK   │ hosts miss   │ OS_RESOLVE  │ OS call         │ OS resolver     │ -       │
│ OS_RESOLVE    │ OS response  │ RESOLVED    │ IP return       │ network stack   │ -       │
│ OS_RESOLVE    │ OS timeout   │ FAILED      │ cache exception │ error handler   │ 5s      │
│ RESOLVED      │ cache update │ IDLE        │ save cache      │ cache table     │ -       │
└───────────────┴──────────────┴─────────────┴─────────────────┴─────────────────┴─────────┘
```

**브라우저 DNS API 호출 상세**

**Chrome 브라우저 (V8 엔진) - 상세 구현**

```javascript
// Chrome V8 엔진 DNS 리졸버 상세 구현
class ChromeDNSResolver {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.maxCacheSize = 1000;
    this.defaultTTL = 300; // 5분
  }

  async resolve(hostname) {
    // 1. 캐시 키 생성 및 정규화
    const normalizedHostname = this.normalizeHostname(hostname);
    const cacheKey = this.generateCacheKey(normalizedHostname);

    // 2. 브라우저 캐시 확인
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      console.log(`DNS 캐시 히트: ${hostname} -> ${cached.ip}`);
      return cached.ip;
    }

    // 3. 진행 중인 요청 확인
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // 4. OS DNS 리졸버 호출
    const promise = this.resolveWithOS(normalizedHostname);
    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      this.updateCache(cacheKey, result);
      this.pendingRequests.delete(cacheKey);
      return result.ip;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  normalizeHostname(hostname) {
    return hostname.toLowerCase().replace(/\.$/, '');
  }

  generateCacheKey(hostname) {
    // FNV-1a 해시 함수 사용
    let hash = 0x811c9dc5;
    for (let i = 0; i < hostname.length; i++) {
      const char = hostname.charCodeAt(i);
      hash ^= char;
      hash = (hash * 0x01000193) >>> 0; // 32비트 정수로 변환
    }
    return hash;
  }

  isExpired(cachedEntry) {
    const now = Date.now();
    return (now - cachedEntry.timestamp) > (cachedEntry.ttl * 1000);
  }

  async resolveWithOS(hostname) {
    // 운영체제 DNS 리졸버 호출
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('DNS resolution timeout'));
      }, 5000);

      // 실제 OS 호출 (Node.js 환경 시뮬레이션)
      process.nextTick(() => {
        clearTimeout(timeout);
        resolve({
          ip: '20.123.45.67',
          ttl: 300,
          timestamp: Date.now()
        });
      });
    });
  }

  updateCache(cacheKey, result) {
    this.cache.set(cacheKey, {
      ip: result.ip,
      ttl: result.ttl,
      timestamp: result.timestamp
    });

    // 캐시 크기 제한
    if (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
```

### 2.3 네트워크 계층에서 DNS 패킷 전송

**상태 스냅샷 #3: 네트워크 스택 DNS 패킷 처리**

**UDP 소켓 생성 및 상태 관리**

```
UDP 소켓 상태 테이블:
┌──────────────┬───────────────┬────────────┬───────────┬──────┬──────────────┐
│ socket ID    │ local address │ local port │ state     │ type │ created      │
├──────────────┼───────────────┼────────────┼───────────┼──────┼──────────────┤
│ 0x12345678   │ 192.168.1.100 │ 54321      │ BOUND     │ UDP  │ 10:30:45.123 │
│ 0x87654321   │ 0.0.0.0       │ 0          │ UNBOUND   │ UDP  │ 10:30:45.124 │
│ 0xdeadbeef   │ 192.168.1.100 │ 12345      │ CONNECTED │ UDP  │ 10:30:45.125 │
└──────────────┴───────────────┴────────────┴───────────┴──────┴──────────────┘
```

**UDP 소켓 생성 과정 (상세)**

```
UDP 소켓 생성 알고리즘:
┌──────┬───────────────────┬──────────────┬─────────────────────┬──────────┬───────────────┐
│ step │ operation         │ syscall      │ parameters          │ result   │ next action   │
├──────┼───────────────────┼──────────────┼─────────────────────┼──────────┼───────────────┤
│ 1    │ create socket     │ socket()     │ AF_INET, SOCK_DGRAM │ fd=5     │ binding       │
│ 2    │ set socker option │ setsockopt() │ SO_REUSEADDR        │ SUCCESS  │ binding       │
│ 3    │ binding           │ bind()       │ 192.168.1.100:0     │ SUCCESS  │ connection    │
│ 4    │ set connection    │ connect()    │ 168.126.63.1:53     │ SUCCESS  │ transfer      │
│ 5    │ data transfer     │ sendto()     │ DNS packet          │ 32 bytes │ wait response │
└──────┴───────────────────┴──────────────┴─────────────────────┴──────────┴───────────────┘
```

**UDP 헤더 생성 (상세)**

```
UDP 헤더 구조:
┌────────────────────────────────────────────────────────────────┐
│ UDP Header (8 bytes)                                           │
├────────────────────────────────────────────────────────────────┤
│ Source Port: 54321 (2 bytes) - Source Port (Random Assignment) │
│ Dest Port: 53 (2 bytes) - Destination Port (DNS Standard)      │
│ Length: 40 (2 bytes) - UDP Header + Data Length (8+32)         │
│ Checksum: 0xABCD (2 bytes) - Checksum (Optional)               │
└────────────────────────────────────────────────────────────────┘
```

**UDP 패킷 바이트 분석**

```
UDP 패킷 바이트 구조:
┌────────┬──────────┬───────────┬──────────────────┬────────────┬───────────────────┐
│ offset │ bytes    │ value     │ meaning          │ encoding   │ description       │
├────────┼──────────┼───────────┼──────────────────┼────────────┼───────────────────┤
│ 0-1    │ 0xD431   │ 54321     │ Source Port      │ big-endian │ Random Assignment │
│ 2-3    │ 0x0035   │ 53        │ Destination Port │ big-endian │ DNS Standard      │
│ 4-5    │ 0x0028   │ 40        │ Packet Length    │ big-endian │ Header+Data       │
│ 6-7    │ 0xABCD   │ Checksum  │ Integrity Check  │ big-endian │ Optional          │
│ 8-39   │ DNS Data │ DNS Query │ DNS Protocol     │ binary     │ DNS Packet        │
└────────┴──────────┴───────────┴──────────────────┴────────────┴───────────────────┘
```

**IP 헤더 생성 (상세)**

```
IP 헤더 구조:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ IP Header (20 bytes)                                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Version: 4 (4 bits) - IPv4                                                   │
│ IHL: 5 (4 bits) - Header Length (5*4=20 bytes)                                   │
│ ToS: 0x00 (1 byte) - Type of Service (Normal)                                       │
│ Total Length: 60 (2 bytes) - Total Packet Length (20+8+32)                         │
│ ID: 0x1234 (2 bytes) - Packet Identifier                                           │
│ Flags: 0x4000 (3 bits) - Don't Fragment                                     │
│ Fragment Offset: 0 (13 bits) - Fragment Offset                                 │
│ TTL: 64 (1 byte) - Time to Live                                                 │
│ Protocol: 17 (1 byte) - UDP Protocol                                         │
│ Checksum: 0xABCD (2 bytes) - IP Header Checksum                                  │
│ Source IP: 192.168.1.100 (4 bytes) - Source IP                                 │
│ Dest IP: 168.126.63.1 (4 bytes) - Destination IP                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**IP 패킷 바이트 분석**

```
IP 패킷 바이트 구조:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┬─────────────┐
│ offset       │ bytes       │ value        │ meaning     │ encoding    │ description │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┼─────────────┤
│ 0            │ 0x45        │ Version=4, IHL=5│ IPv4 Header │ binary      │ Header Info    │
│ 1            │ 0x00        │ ToS=0        │ Normal Service  │ binary      │ Service Type  │
│ 2-3          │ 0x003C      │ 60           │ Total Length    │ big-endian  │ Packet Size    │
│ 4-5          │ 0x1234      │ Packet ID      │ Identifier      │ big-endian  │ Random Generation    │
│ 6-7          │ 0x4000      │ Don't Fragment│ Flags     │ big-endian  │ No Fragmentation  │
│ 8            │ 0x40        │ TTL=64       │ Time to Live    │ binary      │ Hop Count    │
│ 9            │ 0x11        │ Protocol=17  │ UDP         │ binary      │ Protocol     │
│ 10-11        │ 0xABCD      │ Checksum       │ Integrity Check   │ big-endian  │ Header Checksum  │
│ 12-15        │ 0xC0A80164  │ 192.168.1.100│ Source IP     │ big-endian  │ Local IP      │
│ 16-19        │ 0xA87E3F01  │ 168.126.63.1 │ Destination IP     │ big-endian  │ DNS Server IP  │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┴─────────────┘
```

**라우팅 테이블 검색 (상세)**

```
라우팅 테이블 구조:
┌────────────────┬─────────────┬───────────┬────────┬───────┬────────┐
│ destination    │ gateway     │ interface │ metric │ flags │ status │
├────────────────┼─────────────┼───────────┼────────┼───────┼────────┤
│ 0.0.0.0/0      │ 192.168.1.1 │ eth0      │ 1      │ UG    │ ACTIVE │
│ 192.168.1.0/24 │ 0.0.0.0     │ eth0      │ 1      │ U     │ ACTIVE │
│ 127.0.0.0/8    │ 0.0.0.0     │ lo        │ 1      │ U     │ ACTIVE │
│ 168.126.63.1   │ 192.168.1.1 │ eth0      │ 1      │ UG    │ ACTIVE │
└────────────────┴─────────────┴───────────┴────────┴───────┴────────┘
```

**라우팅 결정 알고리즘 (상세)**

```
라우팅 테이블 검색 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ step         │ operation            │ target IP   │ match rule   │ result      │ next action │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ 1            │ 168.126.63.1 Search   │ 168.126.63.1│ Exact Match     │ MATCH       │ Gateway   │
│ 2            │ Gateway Check      │ 192.168.1.1 │ Local Network │ LOCAL       │ ARP Table   │
│ 3            │ Interface Check      │ eth0        │ Ethernet       │ READY       │ MAC Address     │
│ 4            │ MAC Address Check        │ ARP Cache    │ MAC Search     │ PENDING     │ ARP Request     │
└──────────────┴──────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

**라우팅 테이블 검색 알고리즘 (상세 구현)**

```cpp
// Linux 커널 라우팅 테이블 검색 알고리즘
struct route_entry {
    uint32_t destination;
    uint32_t gateway;
    uint32_t interface;
    uint8_t prefix_length;
    uint32_t metric;
    uint32_t flags;
};

class RoutingTable {
private:
    std::vector<route_entry> routes;
    std::map<uint32_t, route_entry> cache;
    
public:
    route_entry* lookup(uint32_t dest_ip) {
        // 1. 캐시 확인
        auto cache_it = cache.find(dest_ip);
        if (cache_it != cache.end()) {
            return &cache_it->second;
        }
        
        // 2. 가장 구체적인 매치 검색 (Longest Prefix Match)
        route_entry* best_match = nullptr;
        int best_prefix = -1;
        
        for (auto& route : routes) {
            uint32_t mask = (0xFFFFFFFF << (32 - route.prefix_length));
            uint32_t network = route.destination & mask;
            uint32_t target_network = dest_ip & mask;
            
            if (network == target_network && route.prefix_length > best_prefix) {
                best_match = &route;
                best_prefix = route.prefix_length;
            }
        }
        
        // 3. 캐시에 저장
        if (best_match) {
            cache[dest_ip] = *best_match;
        }
        
        return best_match;
    }
    
    void add_route(uint32_t dest, uint32_t gw, uint32_t iface, uint8_t prefix) {
        route_entry route;
        route.destination = dest;
        route.gateway = gw;
        route.interface = iface;
        route.prefix_length = prefix;
        route.metric = 1;
        route.flags = ROUTE_ACTIVE;
        
        routes.push_back(route);
        cache.clear(); // 캐시 무효화
    }
};
```

**라우팅 테이블 상태 머신**

```
라우팅 상태 전이:
┌──────────────┬─────────────────┬─────────────┬───────────────┬──────────────────┬─────────────┐
│ current state│ event           │ next state  │ action        │ reference table  │ timeout     │
├──────────────┼─────────────────┼─────────────┼───────────────┼──────────────────┼─────────────┤
│ IDLE         │ Packet Reception       │ LOOKUP      │ Routing Table  │ routing table    │ -           │
│ LOOKUP       │ Exact Match       │ GATEWAY     │ Gateway    │ route cache      │ -           │
│ LOOKUP       │ Partial Match       │ GATEWAY     │ Gateway    │ route cache      │ -           │
│ LOOKUP       │ No Match       │ DEFAULT     │ Default Gateway│ default route    │ -           │
│ GATEWAY      │ Local Network   │ LOCAL       │ Direct Transmission      │ interface table  │ -           │
│ GATEWAY      │ Remote Network   │ FORWARD     │ Gateway    │ ARP table        │ -           │
│ LOCAL        │ MAC Address Check   │ READY       │ Frame Generation    │ ARP cache        │ -           │
│ FORWARD      │ MAC Address Check   │ READY       │ Frame Generation    │ ARP cache        │ -           │
│ READY        │ Transmission            │ IDLE        │ Packet Transmission      │ network interface│ -           │
└──────────────┴─────────────────┴─────────────┴───────────────┴──────────────────┴─────────────┘
```

### 2.4 데이터 링크 계층에서 ARP 캐시 및 MAC 주소 확인

**상태 스냅샷 #4: ARP 캐시 및 MAC 주소 처리**

**ARP 캐시 테이블 (상세)**

```
ARP 캐시 테이블 (/proc/net/arp):
┌───────────────┬───────────────────┬───────────┬───────┬────────────┬───────────┐
│ IP address    │ MAC address       │ interface │ type  │ state      │ timestamp │
├───────────────┼───────────────────┼───────────┼───────┼────────────┼───────────┤
│ 192.168.1.1   │ 00:11:22:33:44:55 │ eth0      │ ether │ REACHABLE  │ 10:30:40  │
│ 192.168.1.100 │ AA:BB:CC:DD:EE:FF │ eth0      │ ether │ REACHABLE  │ 10:30:35  │
│ 192.168.1.50  │ 11:22:33:44:55:66 │ eth0      │ ether │ STALE      │ 10:25:30  │
│ 168.126.63.1  │ -                 │ eth0      │ ether │ INCOMPLETE │ -         │
└───────────────┴───────────────────┴───────────┴───────┴────────────┴───────────┘
```

**ARP 캐시 검색 알고리즘 (상세)**

```
ARP 캐시 검색 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ step         │ operation            │ target IP   │ cache lookup │ result      │ next action │
├──────────────┼──────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 1            │ 192.168.1.1 Search    │ 192.168.1.1 │ hash table   │ HIT         │ MAC Return     │
│ 2            │ MAC Address Check        │ 00:11:22:33:44:55│ valid     │ REACHABLE   │ Frame Generation   │
│ 3            │ TTL Validation             │ 300s        │ timestamp    │ VALID       │ Transmission Ready     │
│ 4            │ Interface Check      │ eth0        │ interface    │ READY       │ Transmission         │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**ARP 요청 과정 (상세)**

```
ARP 요청 생성 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ step         │ operation            │ ARP type    │ target       │ result      │ next action │
├──────────────┼──────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 1            │ ARP Request Generation        │ REQUEST     │ 192.168.1.1  │ PACKET      │ Broadcast  │
│ 2            │ Source MAC Setting        │ 00:11:22:33:44:55│ eth0     │ SRC_MAC     │ Broadcast  │
│ 3            │ Destination MAC Setting        │ FF:FF:FF:FF:FF:FF│ broadcast │ DST_MAC     │ Broadcast  │
│ 4            │ ARP Header Generation        │ 0x0806      │ ARP Protocol │ HEADER      │ Frame Generation   │
│ 5            │ Ethernet Frame Generation   │ 0x0806      │ ARP Type     │ FRAME        │ Transmission         │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**ARP 패킷 구조 (상세)**

```
ARP 패킷 구조:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ARP Header (28 bytes)                                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Hardware Type: 1 (2 bytes) - Ethernet (0x0001)                                  │
│ Protocol Type: 0x0800 (2 bytes) - IPv4                                       │
│ Hardware Size: 6 (1 byte) - MAC Address Length                                     │
│ Protocol Size: 4 (1 byte) - IP Address Length                                      │
│ Operation: 1 (2 bytes) - ARP Request (1=REQUEST, 2=REPLY)                       │
│ Sender MAC: 00:11:22:33:44:55 (6 bytes) - Sender MAC                         │
│ Sender IP: 192.168.1.100 (4 bytes) - Sender IP                               │
│ Target MAC: 00:00:00:00:00:00 (6 bytes) - Target MAC (Unknown)              │
│ Target IP: 192.168.1.1 (4 bytes) - Target IP                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**ARP 패킷 바이트 분석**

```
ARP 패킷 바이트 구조:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┬─────────────┐
│ offset       │ bytes       │ value        │ meaning     │ encoding    │ description │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┼─────────────┤
│ 0-1          │ 0x0001      │ 1            │ Ethernet      │ big-endian  │ Hardware Type│
│ 2-3          │ 0x0800      │ 0x0800       │ IPv4        │ big-endian  │ Protocol Type│
│ 4            │ 0x06        │ 6            │ MAC Length     │ binary      │ Hardware Size│
│ 5            │ 0x04        │ 4            │ IP Length      │ binary      │ Protocol Size│
│ 6-7          │ 0x0001      │ 1            │ ARP Request    │ big-endian  │ Operation Code    │
│ 8-13         │ 0x001122334455│ Sender MAC  │ 00:11:22:33:44:55│ binary    │ Sender MAC   │
│ 14-17        │ 0xC0A80164  │ 192.168.1.100│ Sender IP   │ big-endian  │ Sender IP    │
│ 18-23        │ 0x000000000000│ Target MAC    │ 00:00:00:00:00:00│ binary    │ Target MAC     │
│ 24-27        │ 0xC0A80101  │ 192.168.1.1  │ Target IP     │ big-endian  │ Target IP      │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┴─────────────┘
```

**이더넷 프레임 생성 (상세)**

```
이더넷 프레임 구조:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Ethernet Frame (60 bytes minimum)                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Preamble: 0xAAAAAAAA (7 bytes) - Frame Synchronization                                │
│ SFD: 0xAB (1 byte) - Start Frame Delimiter                                   │
│ Dest MAC: FF:FF:FF:FF:FF:FF (6 bytes) - Broadcast MAC                     │
│ Src MAC: 00:11:22:33:44:55 (6 bytes) - Sender MAC                           │
│ Type: 0x0806 (2 bytes) - ARP Protocol                                        │
│ Data: ARP Packet (28 bytes) - ARP Header + Data                                │
│ FCS: 0x12345678 (4 bytes) - Frame Check Sequence (CRC32)                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**이더넷 프레임 바이트 분석**

```
이더넷 프레임 바이트 구조:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┬─────────────┐
│ offset       │ bytes       │ value        │ meaning     │ encoding    │ description │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┼─────────────┤
│ 0-6          │ 0xAAAAAAAA  │ Preamble     │ Synchronization       │ binary      │ 7 bytes     │
│ 7            │ 0xAB        │ SFD          │ Frame Start   │ binary      │ 1 byte      │
│ 8-13         │ 0xFFFFFFFFFFFF│ Broadcast│ FF:FF:FF:FF:FF:FF│ binary    │ Destination MAC     │
│ 14-19        │ 0x001122334455│ Sender MAC  │ 00:11:22:33:44:55│ binary    │ Source MAC     │
│ 20-21        │ 0x0806      │ ARP          │ Protocol Type │ big-endian  │ Ethertype     │
│ 22-49        │ ARP Packet    │ ARP Data   │ ARP Header     │ binary      │ ARP Content     │
│ 50-53        │ 0x12345678  │ FCS          │ Checksum       │ big-endian  │ CRC32       │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┴─────────────┘
```

**ARP 캐시 관리 알고리즘 (상세 구현)**

```cpp
// Linux 커널 ARP 캐시 관리 알고리즘
struct arp_entry {
    uint32_t ip_address;
    uint8_t mac_address[6];
    uint32_t interface;
    uint32_t state;
    uint64_t timestamp;
    uint32_t ttl;
};

class ARPCache {
private:
    std::map<uint32_t, arp_entry> cache;
    std::mutex cache_mutex;
    uint32_t default_ttl = 300; // 5분
    
public:
    arp_entry* lookup(uint32_t ip) {
        std::lock_guard<std::mutex> lock(cache_mutex);
        
        auto it = cache.find(ip);
        if (it != cache.end()) {
            arp_entry& entry = it->second;
            
            // TTL 검증
            uint64_t now = get_timestamp();
            if (now - entry.timestamp > entry.ttl) {
                entry.state = ARP_STALE;
                return nullptr;
            }
            
            return &entry;
        }
        
        return nullptr;
    }
    
    void add_entry(uint32_t ip, const uint8_t* mac, uint32_t iface) {
        std::lock_guard<std::mutex> lock(cache_mutex);
        
        arp_entry entry;
        entry.ip_address = ip;
        memcpy(entry.mac_address, mac, 6);
        entry.interface = iface;
        entry.state = ARP_REACHABLE;
        entry.timestamp = get_timestamp();
        entry.ttl = default_ttl;
        
        cache[ip] = entry;
    }
    
    void send_arp_request(uint32_t target_ip, uint32_t iface) {
        // ARP 요청 패킷 생성
        uint8_t arp_packet[28];
        
        // ARP 헤더 설정
        arp_packet[0] = 0x00; arp_packet[1] = 0x01; // Hardware Type: Ethernet
        arp_packet[2] = 0x08; arp_packet[3] = 0x00; // Protocol Type: IPv4
        arp_packet[4] = 0x06; // Hardware Size: 6 bytes
        arp_packet[5] = 0x04; // Protocol Size: 4 bytes
        arp_packet[6] = 0x00; arp_packet[7] = 0x01; // Operation: REQUEST
        
        // 송신자 MAC/IP 설정
        uint8_t src_mac[6] = {0x00, 0x11, 0x22, 0x33, 0x44, 0x55};
        uint32_t src_ip = 0xC0A80164; // 192.168.1.100
        
        memcpy(&arp_packet[8], src_mac, 6);
        memcpy(&arp_packet[14], &src_ip, 4);
        
        // 목표 MAC (알 수 없음)
        memset(&arp_packet[18], 0, 6);
        
        // 목표 IP
        memcpy(&arp_packet[24], &target_ip, 4);
        
        // 이더넷 프레임으로 전송
        send_ethernet_frame(arp_packet, 28, iface);
    }
    
private:
    uint64_t get_timestamp() {
        return std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }
    
    void send_ethernet_frame(const uint8_t* data, size_t len, uint32_t iface) {
        // 이더넷 프레임 생성 및 전송
        uint8_t frame[64]; // 최소 프레임 크기
        
        // 목적 MAC (브로드캐스트)
        uint8_t dst_mac[6] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
        memcpy(frame, dst_mac, 6);
        
        // 소스 MAC
        uint8_t src_mac[6] = {0x00, 0x11, 0x22, 0x33, 0x44, 0x55};
        memcpy(frame + 6, src_mac, 6);
        
        // 이더타입 (ARP)
        frame[12] = 0x08; frame[13] = 0x06;
        
        // 데이터
        memcpy(frame + 14, data, len);
        
        // 패딩 (최소 60바이트)
        if (len < 46) {
            memset(frame + 14 + len, 0, 46 - len);
        }
        
        // FCS 계산 (실제로는 하드웨어에서 처리)
        uint32_t fcs = calculate_crc32(frame, 14 + len);
        memcpy(frame + 14 + len, &fcs, 4);
        
        // 네트워크 인터페이스로 전송
        write_interface(iface, frame, 14 + len + 4);
    }
    
    uint32_t calculate_crc32(const uint8_t* data, size_t len) {
        // CRC32 계산 (간소화)
        uint32_t crc = 0xFFFFFFFF;
        for (size_t i = 0; i < len; i++) {
            crc ^= data[i];
            for (int j = 0; j < 8; j++) {
                crc = (crc >> 1) ^ (0xEDB88320 & -(crc & 1));
            }
        }
        return ~crc;
    }
};
```

**ARP 상태 머신 (상세)**

```
ARP 상태 전이:
┌──────────────┬─────────────────┬─────────────┬───────────────┬──────────────────┬─────────────┐
│ current state│ event           │ next state  │ action        │ reference table  │ timeout     │
├──────────────┼─────────────────┼─────────────┼───────────────┼──────────────────┼─────────────┤
│ IDLE         │ Packet Transmission Request   │ ARP_LOOKUP  │ ARP Cache Search │ ARP cache        │ -           │
│ ARP_LOOKUP   │ Cache Hit       │ READY       │ MAC Return      │ MAC table        │ -           │
│ ARP_LOOKUP   │ Cache Miss       │ ARP_REQUEST │ ARP Request      │ ARP table        │ -           │
│ ARP_REQUEST  │ ARP Response        │ ARP_REPLY   │ MAC Save      │ ARP cache        │ -           │
│ ARP_REQUEST  │ ARP Timeout    │ ARP_RETRY   │ Retry        │ retry logic      │ 1 second         │
│ ARP_RETRY    │ Max Retry     │ FAILED      │ Error Handling      │ error handler    │ 3 times         │
│ ARP_REPLY    │ Cache Update   │ READY       │ MAC Return      │ ARP cache        │ -           │
│ READY        │ Frame Generation     │ IDLE        │ Transmission          │ ethernet frame   │ -           │
└──────────────┴─────────────────┴─────────────┴───────────────┴──────────────────┴─────────────┘
```

**쉽게 이해하기**

- ARP 캐시는 마치 전화번호부와 같습니다. IP 주소를 MAC 주소로 변환하는 주소록입니다
- ARP 요청은 마치 "192.168.1.1의 전화번호가 뭐예요?"라고 물어보는 것과 같습니다
- 브로드캐스트는 마치 마을 전체에 "192.168.1.1 주인님 계세요?"라고 외치는 것과 같습니다
- 이더넷 프레임은 마치 편지봉투에 주소를 쓰고 편지를 넣는 것과 같습니다
- MAC 주소는 마치 집 주소와 같고, IP 주소는 마치 우편번호와 같습니다

**왜 이 단계가 필요한가?**

- **물리적 주소 확인**: IP 주소는 논리적 주소이므로 실제 네트워크 카드의 MAC 주소로 변환해야 함
- **네트워크 효율성**: ARP 캐시로 불필요한 ARP 요청을 줄여 네트워크 트래픽 최적화
- **프로토콜 변환**: 네트워크 계층(IP)과 데이터 링크 계층(MAC) 간의 주소 변환
- **브로드캐스트 활용**: 로컬 네트워크에서 목표 MAC 주소를 찾기 위한 효율적인 방법
- **프레임 생성**: 최종적으로 네트워크 카드가 전송할 수 있는 이더넷 프레임 형태로 변환 this.cache.set(cacheKey, { ip: result.ip, ttl: result.ttl, timestamp: result.timestamp });

        // 캐시 크기 제한
        if (this.cache.size > this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
  } }

```

**Safari 브라우저 (WebKit 엔진) - 상세 구현**
```cpp
// WebKit DNS 리졸버 상세 구현
class WebKitDNSResolver {
private:
    DNSCache m_cache;
    OSResolver m_osResolver;
    PendingRequests m_pendingRequests;
    std::mutex m_cacheMutex;
    std::mutex m_pendingMutex;
    
public:
    String resolve(const String& hostname) {
        // 1. 호스트명 정규화
        String normalizedHostname = normalizeHostname(hostname);
        String cacheKey = generateCacheKey(normalizedHostname);
        
        // 2. 캐시 확인 (스레드 안전)
        {
            std::lock_guard<std::mutex> lock(m_cacheMutex);
            if (auto cached = m_cache.get(cacheKey)) {
                if (!cached->isExpired()) {
                    return cached->ip();
                }
            }
        }
        
        // 3. 진행 중인 요청 확인
        {
            std::lock_guard<std::mutex> lock(m_pendingMutex);
            if (auto pending = m_pendingRequests.get(cacheKey)) {
                return pending->waitForResult();
            }
        }
        
        // 4. OS 리졸버 호출
        auto promise = std::make_shared<PendingRequest>();
        {
            std::lock_guard<std::mutex> lock(m_pendingMutex);
            m_pendingRequests.set(cacheKey, promise);
        }
        
        try {
            auto result = m_osResolver.resolve(normalizedHostname);
            
            // 캐시 업데이트
            {
                std::lock_guard<std::mutex> lock(m_cacheMutex);
                m_cache.set(cacheKey, result);
            }
            
            // 진행 중인 요청 제거
            {
                std::lock_guard<std::mutex> lock(m_pendingMutex);
                m_pendingRequests.remove(cacheKey);
            }
            
            promise->setResult(result.ip());
            return result.ip();
            
        } catch (const std::exception& e) {
            // 진행 중인 요청 제거
            {
                std::lock_guard<std::mutex> lock(m_pendingMutex);
                m_pendingRequests.remove(cacheKey);
            }
            promise->setError(e.what());
            throw;
        }
    }
    
private:
    String normalizeHostname(const String& hostname) {
        String normalized = hostname.lower();
        if (normalized.endsWith(".")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
    
    String generateCacheKey(const String& hostname) {
        // FNV-1a 해시 함수 사용
        uint32_t hash = 0x811c9dc5;
        for (char c : hostname) {
            hash ^= static_cast<uint32_t>(c);
            hash *= 0x01000193;
        }
        return String::number(hash);
    }
};

class DNSCache {
private:
    std::unordered_map<String, std::shared_ptr<CacheEntry>> m_entries;
    size_t m_maxSize;
    
public:
    std::shared_ptr<CacheEntry> get(const String& key) {
        auto it = m_entries.find(key);
        if (it != m_entries.end()) {
            return it->second;
        }
        return nullptr;
    }
    
    void set(const String& key, const DNSResult& result) {
        if (m_entries.size() >= m_maxSize) {
            // LRU 캐시 구현
            auto oldest = m_entries.begin();
            for (auto it = m_entries.begin(); it != m_entries.end(); ++it) {
                if (it->second->timestamp < oldest->second->timestamp) {
                    oldest = it;
                }
            }
            m_entries.erase(oldest);
        }
        
        m_entries[key] = std::make_shared<CacheEntry>(result);
    }
};
```

**쉽게 이해하기**

- 브라우저는 마치 개인 전화번호부를 먼저 확인하는 것과 같습니다
- "www.my-app.com의 번호가 있나?" 확인 후 없으면 안내데스크에 물어봅니다
- 캐시는 마치 자주 쓰는 번호를 메모해두는 것과 같습니다
- TTL은 마치 "이 번호는 언제까지 유효한가?"를 나타내는 것과 같습니다

**처리 주체**: 브라우저 (Chrome의 경우 V8 엔진, Safari의 경우 WebKit 엔진)

**로컬 DNS 캐시 확인 과정 (상세)**

**1단계: 브라우저 내부 캐시 검색**

- 브라우저가 자체 DNS 캐시 테이블에서 `www.my-app.com` 검색
- 해시 테이블 기반 O(1) 검색 수행
- 캐시 키: `www.my-app.com` (소문자 정규화)
- FNV-1a 해시 함수 사용하여 캐시 키 생성

**2단계: hosts 파일 확인**

- Windows: `C:\Windows\System32\drivers\etc\hosts` 파일 읽기
- Mac/Linux: `/etc/hosts` 파일 읽기
- 파일 내용 파싱하여 도메인-IP 매핑 확인
- 라인별 파싱: 공백으로 구분된 IP와 도메인명

**3단계: 운영체제 DNS 리졸버 호출**

- Windows: `GetHostByName` 또는 `getaddrinfo` API 호출
- Mac: `dscacheutil` 또는 `getaddrinfo` API 호출
- Linux: `getaddrinfo` 시스템 콜 호출
- 비동기 처리로 UI 블로킹 방지

**쉽게 이해하기**

- 브라우저는 먼저 "이 주소를 최근에 찾아본 적이 있나?" 확인
- 마치 전화번호부에서 자주 쓰는 번호를 먼저 찾아보는 것과 같음
- 찾아본 적이 없으면 운영체제에게 "이 주소의 전화번호를 알아봐" 요청
- 해시 테이블은 마치 전화번호부의 색인과 같아서 빠르게 찾을 수 있음

### 2.2 DNS 리졸버 동작

**상태 스냅샷 #2: 운영체제 DNS 설정 및 캐시**

**운영체제 DNS 설정 (상세)**

```
PC 네트워크 설정:
┌──────────────┬───────────────┬───────────────┬─────────────┐
│ setting item │ value         │ description   │ source      │
├──────────────┼───────────────┼──────────────┼─────────────┤
│ IP address   │ 192.168.1.100 │ PC private IP │ DHCP        │
│ subnet mask  │ 255.255.255.0 │ network       │ DHCP        │
│ default GW   │ 192.168.1.1   │ Router Address│ DHCP        │
│ DNS server 1 │ 168.126.63.1  │ KT DNS        │ DHCP        │
│ DNS server 2 │ 168.126.63.2  │ KT DNS backup │ DHCP        │
│ DNS timeout  │ 5 seconds           │ Timeout       │ OS Default  │
│ DNS retries  │ 3 times           │ Retry Count   │ OS Default  │
└──────────────┴───────────────┴───────────────┴─────────────┘
```

**운영체제 DNS 캐시 (상세)**

```
OS DNS 캐시 테이블:
┌────────────────┬────────────────┬──────┬───────────┬─────────────┐
│ domain name    │ IP address     │ TTL  │ timestamp │ cache type  │
├────────────────┼────────────────┼──────┼───────────┼─────────────┤
│ www.google.com │ 142.250.191.78 │ 300s │ 10:25:30  │ POSITIVE    │
│ www.naver.com  │ 223.130.195.95 │ 600s │ 10:20:15  │ POSITIVE    │
│ www.my-app.com │ -              │ -    │ -         │ MISS        │
│ invalid.com    │ -              │ 300s │ 10:25:30  │ NEGATIVE    │
└────────────────┴────────────────┴──────┴───────────┴─────────────┘
```

**운영체제 DNS 리졸버 처리 과정 (상세)**

**1단계: 로컬 캐시 검색**

```
캐시 검색 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ step         │ operation            │ domain      │ cache type   │ result      │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ 1            │ Hash Table Search     │ www.my-app.com│ POSITIVE    │ MISS        │
│ 2            │ NEGATIVE Cache Check  │ www.my-app.com│ NEGATIVE    │ MISS        │
│ 3            │ Cache Miss Processing       │ -           │ -            │ DNS Server    │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**2단계: DNS 서버 선택**

```
DNS 서버 선택 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ server       │ IP address           │ priority    │ status       │ selection   │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ Primary DNS  │ 168.126.63.1         │ 1           │ HEALTHY      │ SELECTED    │
│ Secondary DNS│ 168.126.63.2         │ 2           │ HEALTHY      │ BACKUP      │
│ Tertiary DNS │ 8.8.8.8              │ 3           │ UNKNOWN      │ FALLBACK    │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**3단계: DNS 질의 패킷 생성**

```
DNS 질의 패킷 구조 (상세):
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ field        │ value                │ size        │ description  │ RFC         │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ Transaction ID│ 0x1234              │ 16 bits     │ Request Identifier   │ RFC 1035    │
│ Flags        │ 0x0100               │ 16 bits     │ Standard Query     │ RFC 1035    │
│ Questions    │ 1                    │ 16 bits     │ Query Count     │ RFC 1035    │
│ Answer RRs   │ 0                    │ 16 bits     │ Answer Records   │ RFC 1035    │
│ Authority RRs│ 0                    │ 16 bits     │ Authority Records   │ RFC 1035    │
│ Additional RRs│ 0                   │ 16 bits     │ Additional Records   │ RFC 1035    │
│ Name         │ www.my-app.com       │ variable    │ Domain Name     │ RFC 1035    │
│ Type         │ A (1)                │ 16 bits     │ IPv4 Address    │ RFC 1035    │
│ Class        │ IN (1)               │ 16 bits     │ Internet Class │ RFC 1035    │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**DNS 질의 패킷 바이트 구조**

```
DNS Query Byte Structure:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ offset       │ bytes       │ content      │ encoding    │ description │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ 0-1          │ 0x1234      │ Transaction ID│ Big Endian │ Request ID     │
│ 2-3          │ 0x0100      │ Flags        │ Big Endian │ Standard Query    │
│ 4-5          │ 0x0001      │ Questions    │ Big Endian │ Query Count    │
│ 6-7          │ 0x0000      │ Answer RRs   │ Big Endian │ Answer Count    │
│ 8-9          │ 0x0000      │ Authority RRs│ Big Endian │ Authority Count    │
│ 10-11        │ 0x0000      │ Additional RRs│ Big Endian │ Additional Count    │
│ 12           │ 0x03        │ Name length  │ -           │ www Length     │
│ 13-15        │ www         │ www          │ ASCII       │ www         │
│ 16           │ 0x06        │ Name length  │ -           │ my-app Length  │
│ 17-22        │ my-app      │ my-app       │ ASCII       │ my-app      │
│ 23           │ 0x03        │ Name length  │ -           │ com Length     │
│ 24-26        │ com         │ com          │ ASCII       │ com         │
│ 27           │ 0x00        │ Name end     │ -           │ Name End      │
│ 28-29        │ 0x0001      │ Type A       │ Big Endian │ A Record     │
│ 30-31        │ 0x0001      │ Class IN     │ Big Endian │ Internet Class │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**쉽게 이해하기**

- 운영체제는 마치 공용 전화번호부를 확인하는 것과 같습니다
- "www.my-app.com의 번호가 있나?" 확인 후 없으면 전화번호 안내데스크에 전화를 겁니다
- DNS 서버 선택은 마치 "어느 안내데스크에 물어볼까?" 결정하는 것과 같습니다
- DNS 패킷은 마치 "이 주소의 전화번호를 알려주세요"라는 질문서와 같습니다

**처리 주체**: 운영체제 (Windows의 경우 DNS Client 서비스, Mac의 경우 mDNSResponder)

**로컬 DNS 서버 설정 확인 (상세)**

**Windows DNS 설정 확인 과정**

```
Windows DNS 설정 확인:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ step         │ action               │ command     │ result       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 1            │ Open Network Settings   │ ncpa.cpl    │ Network Window   │
│ 2            │ Select Wi-Fi Adapter   │ Double Click     │ Properties Window      │
│ 3            │ TCP/IPv4 Properties       │ Properties Button    │ IP Settings Window   │
│ 4            │ Check DNS Server        │ Advanced → DNS  │ DNS Server List │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**Mac DNS 설정 확인 과정**

```
Mac DNS 설정 확인:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ step         │ action               │ menu        │ result       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 1            │ System Preferences      │ Apple Menu   │ Preferences Window   │
│ 2            │ Select Network        │ Network     │ Network Window   │
│ 3            │ Select Wi-Fi           │ Wi-Fi       │ Wi-Fi Settings   │
│ 4            │ Advanced Settings            │ Advanced Button    │ Advanced Settings Window  │
│ 5            │ Select DNS Tab          │ DNS Tab      │ DNS Server List │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**일반적인 DNS 서버 설정**

```
DNS 서버 설정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ ISP          │ Primary DNS          │ Secondary   │ Tertiary     │ Backup      │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ KT           │ 168.126.63.1         │ 168.126.63.2│ 8.8.8.8      │ 8.8.4.4     │
│ SKT          │ 210.220.163.82       │ 219.250.36.130│ 8.8.8.8   │ 8.8.4.4     │
│ LG U+        │ 164.124.101.2        │ 203.248.252.2│ 8.8.8.8    │ 8.8.4.4     │
│ Google       │ 8.8.8.8              │ 8.8.4.4     │ -            │ -           │
│ Cloudflare   │ 1.1.1.1              │ 1.0.0.1     │ -            │ -           │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**쉽게 이해하기**

- 운영체제는 "어느 DNS 서버에 물어볼까?" 확인
- 마치 전화번호 안내데스크의 번호를 확인하는 것과 같음
- 그 다음 "www.my-app.com의 주소가 뭐야?"라는 질문을 만들어서 DNS 서버로 보냄

### 2.3 네트워크 계층에서 DNS 패킷 전송

**상태 스냅샷 #3: 네트워크 스택 패킷 생성**

**UDP 소켓 상태 (상세)**

```
UDP 소켓 테이블:
┌────────────┬───────────────┬────────────┬──────────────┬─────────────┬─────────────┐
│ socket ID  │ local IP      │ local port │ remote IP    │ remote port │ status      │
├────────────┼───────────────┼────────────┼──────────────┼─────────────┼─────────────┤
│ 0x12345678 │ 192.168.1.100 │ 54321      │ 168.126.63.1 │ 53 (DNS)    │ ESTABLISHED │
│ 0x87654321 │ 192.168.1.100 │ 54322      │ 8.8.8.8      │ 53 (DNS)    │ ESTABLISHED │
│ 0xABCD1234 │ 192.168.1.100 │ 54323      │ 20.123.45.67 │ 443 (HTTPS) │ ESTABLISHED │
└────────────┴───────────────┴────────────┴──────────────┴─────────────┴─────────────┘
```

**UDP 소켓 생성 과정 (상세)**

```
UDP 소켓 생성 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ step         │ action               │ parameter   │ result       │ reference   │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ 1            │ socket() Call        │ AF_INET     │ Socket Descriptor │ POSIX       │
│ 2            │ Port Assignment            │ Dynamic Port    │ 54321        │ OS          │
│ 3            │ Socket Table Registration      │ socket ID   │ 0x12345678   │ OS          │
│ 4            │ Status Setting            │ ESTABLISHED │ Connection Status     │ OS          │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**UDP 소켓을 정리한 이유**

- DNS 질의를 위해 운영체제가 UDP 소켓을 생성
- 소켓은 네트워크 통신의 추상화된 인터페이스
- "어느 포트로 어떤 서버와 통신할까?"를 관리
- 실제로는 운영체제가 자동으로 생성하고 관리
- UDP는 DNS 질의에 적합한 프로토콜 (빠르고 간단)

**라우팅 테이블 (상세)**

```
PC 라우팅 테이블:
┌──────────────┬───────────────┬─────────────┬───────────┬────────┬─────────────┐
│ dest network │ subnet mask   │ gateway     │ interface │ metric │ description │
├──────────────┼───────────────┼─────────────┼───────────┼────────┼─────────────┤
│ 0.0.0.0      │ 0.0.0.0       │ 192.168.1.1 │ Wi-Fi     │ 1      │ Default Route   │
│ 192.168.1.0  │ 255.255.255.0 │ 0.0.0.0     │ Wi-Fi     │ 1      │ Local Network │
│ 127.0.0.0    │ 255.0.0.0     │ 0.0.0.0     │ Loopback  │ 1      │ Loopback       │
│ 224.0.0.0    │ 240.0.0.0     │ 0.0.0.0     │ Wi-Fi     │ 1      │ Multicast   │
└──────────────┴───────────────┴─────────────┴───────────┴────────┴─────────────┘
```

**라우팅 테이블이 있는 장비들**

- **PC**: 네트워크 스택에 라우팅 테이블 존재 (Windows: `route print`, Linux: `route -n`)
- **스위치**: 라우팅 테이블 없음 (MAC 주소 테이블만 있음)
- **라우터**: 라우팅 테이블 존재 (네트워크 간 패킷 전달)
- **공유기**: 라우팅 테이블 존재 (라우터 기능 포함)

**라우팅 테이블의 역할**

- 목적지 IP 주소를 확인해서 **어느 네트워크 인터페이스**로 패킷을 보낼지 결정
- 물리적 포트가 아니라 **논리적 네트워크 인터페이스** (Wi-Fi, 이더넷 등)
- "이 IP로 가려면 어느 인터페이스를 통해 어느 게이트웨이로 보내야 할까?" 결정

**라우팅 테이블 각 항목의 의미**

**dest network (목적지 네트워크)**

- 패킷이 가야 할 네트워크 주소
- 0.0.0.0 = 모든 네트워크 (기본 라우트)
- 192.168.1.0 = 로컬 네트워크
- 127.0.0.0 = 루프백 네트워크 (자기 자신)

**subnet mask (서브넷 마스크)**

- 네트워크 주소와 호스트 주소를 구분하는 마스크
- 255.255.255.0 = 24비트 네트워크, 8비트 호스트
- 0.0.0.0 = 모든 비트가 네트워크 (기본 라우트)

**gateway (게이트웨이)**

- 다음 홉(다음 라우터)의 IP 주소
- 0.0.0.0 = 직접 전송 (같은 네트워크)
- 192.168.1.1 = 공유기로 전송 (외부 네트워크)

**interface (인터페이스)**

- 패킷을 전송할 네트워크 인터페이스
- Wi-Fi = 무선 랜 카드
- Loopback = 가상 인터페이스 (자기 자신과 통신)

**metric (메트릭)**

- 라우팅 우선순위 (숫자가 작을수록 우선)
- 같은 목적지에 여러 경로가 있을 때 사용
- 1 = 가장 우선순위가 높음

**라우팅 결정 과정 (상세)**

**1단계: 목적지 IP 주소 확인**

- 목적지 IP: 168.126.63.1 (KT DNS 서버)
- 이진수로 변환: 10101000.01111110.00111111.00000001
- IP 주소 클래스: A 클래스 (첫 번째 옥텟이 1-126)

**2단계: 라우팅 테이블 순차 검색 (Longest Prefix Match)**

**2-1. 첫 번째 규칙 검사 (0.0.0.0/0 - 기본 라우트)**

```
목적지 IP: 168.126.63.1
서브넷 마스크: 255.255.255.255 (0.0.0.0/0은 모든 주소 매칭)
비트 연산: 168.126.63.1 & 255.255.255.255 = 168.126.63.1
결과: 매칭됨 (기본 라우트는 모든 주소와 매칭)
우선순위: 1 (가장 낮은 우선순위)
```

**2-2. 두 번째 규칙 검사 (192.168.1.0/24 - 로컬 네트워크)**

```
목적지 IP: 168.126.63.1
서브넷 마스크: 255.255.255.0
비트 연산: 168.126.63.1 & 255.255.255.0 = 168.126.63.0
네트워크 주소: 192.168.1.0
결과: 168.126.63.0 ≠ 192.168.1.0 (매칭되지 않음)
우선순위: 2 (더 구체적인 라우트)
```

**2-3. 세 번째 규칙 검사 (127.0.0.0/8 - 루프백)**

```
목적지 IP: 168.126.63.1
서브넷 마스크: 255.0.0.0
비트 연산: 168.126.63.1 & 255.0.0.0 = 168.0.0.0
네트워크 주소: 127.0.0.0
결과: 168.0.0.0 ≠ 127.0.0.0 (매칭되지 않음)
우선순위: 3 (더 구체적인 라우트)
```

**2-4. 네 번째 규칙 검사 (224.0.0.0/4 - 멀티캐스트)**

```
목적지 IP: 168.126.63.1
서브넷 마스크: 240.0.0.0
비트 연산: 168.126.63.1 & 240.0.0.0 = 160.0.0.0
네트워크 주소: 224.0.0.0
결과: 160.0.0.0 ≠ 224.0.0.0 (매칭되지 않음)
우선순위: 4 (더 구체적인 라우트)
```

**3단계: 최적 라우트 선택**

- 첫 번째 규칙(0.0.0.0/0)이 매칭됨
- 메트릭 값: 1 (가장 우선순위가 높음)
- 선택된 라우트: 기본 라우트
- 선택 이유: 다른 라우트들이 매칭되지 않아 기본 라우트 사용

**4단계: 게이트웨이 및 인터페이스 결정**

```
선택된 라우트 정보:
- 목적지 네트워크: 0.0.0.0 (모든 네트워크)
- 서브넷 마스크: 0.0.0.0
- 게이트웨이: 192.168.1.1 (공유기)
- 인터페이스: Wi-Fi
- 메트릭: 1
- 라우트 타입: 기본 라우트
```

**5단계: ARP 캐시 확인**

```
ARP 캐시에서 게이트웨이 MAC 주소 확인:
- IP: 192.168.1.1
- MAC: 00:11:22:33:44:55 (캐시됨)
- 상태: REACHABLE
- 캐시 시간: 10:30:45
- TTL: 300초
```

**6단계: 최종 결정**

- **결정**: Wi-Fi 인터페이스를 통해 192.168.1.1(공유기)로 패킷 전송
- **이유**: 168.126.63.1은 로컬 네트워크(192.168.1.0/24)에 속하지 않으므로 외부 네트워크로 전송
- **다음 홉**: 192.168.1.1 (공유기)
- **전송 방식**: 이더넷 프레임으로 캡슐화하여 Wi-Fi 인터페이스로 전송
- **프로토콜**: UDP (DNS 질의)
- **포트**: 53 (DNS 표준 포트)

```

**라우팅 테이블 검색 알고리즘 (Longest Prefix Match)**

```

라우팅 테이블 검색 알고리즘:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ step         │ operation            │ input       │ output       │ complexity  │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ 1            │ Route Sort           │ Route List  │ Sorted Routes│ O(n log n)  │
│ 2            │ IP & Mask Operation  │ IP, Mask    │ Network Addr │ O(1)        │
│ 3            │ Address Compare      │ Result, Route│ Match Status │ O(1)        │
│ 4            │ Best Route Select    │ Matched Routes│ Selected Route│ O(n)        │
│ 5            │ Metric Compare       │ Same Routes │ Final Route  │ O(1)        │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**Longest Prefix Match 알고리즘 상세 구현**
```python
def longest_prefix_match(destination_ip, routing_table):
    """
    Longest Prefix Match 알고리즘 구현
    
    Args:
        destination_ip: 목적지 IP 주소 (예: "168.126.63.1")
        routing_table: 라우팅 테이블 (리스트 of 딕셔너리)
    
    Returns:
        선택된 라우트 또는 None
    """
    # 1단계: 서브넷 마스크 길이로 정렬 (긴 마스크부터)
    sorted_routes = sorted(
        routing_table, 
        key=lambda x: bin(int(x['subnet_mask'].replace('.', ''))).count('1'),
        reverse=True
    )
    
    # 2단계: 각 라우트에 대해 매칭 검사
    matching_routes = []
    
    for route in sorted_routes:
        # IP 주소를 정수로 변환
        dest_ip_int = ip_to_int(destination_ip)
        network_ip_int = ip_to_int(route['dest_network'])
        subnet_mask_int = ip_to_int(route['subnet_mask'])
        
        # 비트 AND 연산으로 네트워크 주소 계산
        calculated_network = dest_ip_int & subnet_mask_int
        
        # 계산된 네트워크가 라우트의 네트워크와 일치하는지 확인
        if calculated_network == network_ip_int:
            matching_routes.append(route)
    
    # 3단계: 매칭된 라우트 중 메트릭이 가장 낮은 것 선택
    if matching_routes:
        return min(matching_routes, key=lambda x: x['metric'])
    
    return None

def ip_to_int(ip_address):
    """IP 주소를 정수로 변환"""
    parts = ip_address.split('.')
    return (int(parts[0]) << 24) + (int(parts[1]) << 16) + \
           (int(parts[2]) << 8) + int(parts[3])

# 사용 예시
routing_table = [
    {'dest_network': '0.0.0.0', 'subnet_mask': '0.0.0.0', 'gateway': '192.168.1.1', 'metric': 1},
    {'dest_network': '192.168.1.0', 'subnet_mask': '255.255.255.0', 'gateway': '0.0.0.0', 'metric': 1},
    {'dest_network': '127.0.0.0', 'subnet_mask': '255.0.0.0', 'gateway': '0.0.0.0', 'metric': 1},
    {'dest_network': '224.0.0.0', 'subnet_mask': '240.0.0.0', 'gateway': '0.0.0.0', 'metric': 1}
]

selected_route = longest_prefix_match('168.126.63.1', routing_table)
print(f"선택된 라우트: {selected_route}")
```

**라우팅 테이블 검색 성능 분석**

```
라우팅 테이블 검색 성능:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ metric       │ time complexity      │ space       │ Optimization Method   │ Actual Implementation    │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ Time Complexity│ O(n log n)         │ O(n)        │ Trie Structure│ Router      │
│ Space Complexity│ O(n)              │ O(n)        │ Hash Table   │ Switch      │
│ Avg Search Time│ O(log n)           │ O(1)        │ Cache Usage  │ PC          │
│ Worst Search Time│ O(n)             │ O(n)        │ Distributed  │ Server      │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**쉽게 이해하기**

- 라우팅 테이블 검색은 마치 우체국에서 "이 편지를 어느 방향으로 보낼까?" 결정하는 것과 같음
- 각 규칙은 "이 주소로 가는 편지는 이 방향으로 보내라"는 안내표와 같음
- 기본 라우트(0.0.0.0/0)는 "모르는 주소는 이 방향으로 보내라"는 기본 안내표와 같음
- 서브넷 마스크는 "주소의 어느 부분까지 확인할까?"를 결정하는 마스크와 같음

**쉽게 이해하기**

- 라우팅 테이블은 마치 지도와 같습니다
- "168.126.63.1로 가려면 어느 길로 가야 할까?" 확인
- 로컬 네트워크가 아니므로 공유기(게이트웨이)를 통해 외부로 전송
- PC에도 라우팅 테이블이 있어서 "이 패킷을 어디로 보낼까?" 결정합니다

**처리 주체**: 운영체제 네트워크 스택 (Windows의 경우 TCP/IP 스택, Mac의 경우 BSD 네트워크 스택)

**UDP 패킷 생성**

- 소스 포트: 54321 (동적 할당)
- 목적지 포트: 53 (DNS 표준 포트)
- 목적지 IP: 168.126.63.1 (KT DNS 서버)

**IP 패킷 상세 구조**

**IP 헤더 (20바이트)**

```
IP Header Structure:
┌─────────────────────────────────────────────────┐
│ Version │ IHL  │ Type of Service │ Total Length │
│ (4 bits)│(4)   │ (8 bits)        │ (16 bits)    │
├─────────────────────────────────────────────────┤
│ 4       │ 5    │ 0x00            │ 512          │
├─────────────────────────────────────────────────┤
│ Identification │ Flags │ Fragment Offset        │
│ (16 bits)      │ (3)   │ (13 bits)              │
├─────────────────────────────────────────────────┤
│ 0x1234         │ 0x0000│ 0                      │
├─────────────────────────────────────────────────┤
│ Time to Live   │ Protocol │ Header Checksum     │
│ (8 bits)       │ (8 bits) │ (16 bits)           │
├─────────────────────────────────────────────────┤
│ 64             │ 17 (UDP) │ 0xABCD              │
├─────────────────────────────────────────────────┤
│ Source IP Address (32 bits)                     │
├─────────────────────────────────────────────────┤
│ 192.168.001.100 (0xC0A80164)                    │
├─────────────────────────────────────────────────┤
│ Destination IP Address (32 bits)                │
├─────────────────────────────────────────────────┤
│ 168.126.063.001 (0xA87E3F01)                    │
└─────────────────────────────────────────────────┘
```

**UDP 헤더 (8바이트)**

```
UDP Header Structure:
┌────────────────────────────────┐
│ Source Port │ Destination Port │
│ (16 bits)   │ (16 bits)        │
├────────────────────────────────┤
│ 54321       │ 53 (DNS)         │
├────────────────────────────────┤
│ Length │ Checksum              │
│ (16)   │ (16 bits)             │
├────────────────────────────────┤
│ 512    │ 0xEFGH                │
└────────────────────────────────┘
```

**DNS 쿼리 페이로드 (484바이트)**

```
DNS Query Structure:
┌──────────────────────────────────────────────────┐
│ Transaction ID │ Flags  │ Questions │ Answer RRs │
│ (16 bits)      │ (16)   │ (16 bits) │ (16 bits)  │
├──────────────────────────────────────────────────┤
│ 0x1234         │ 0x0100 │ 1         │ 0          │
├──────────────────────────────────────────────────┤
│ Authority RRs  │ Additional RRs                  │
│ (16 bits)      │ (16 bits)                       │
├──────────────────────────────────────────────────┤
│ 0              │ 0                               │
├──────────────────────────────────────────────────┤
│ Query Section: www.my-app.com (A record)         │
│ - Name: www.my-app.com (variable length)         │
│ - Type: A (1)                                    │
│ - Class: IN (1)                                  │
└──────────────────────────────────────────────────┘
```

**쉽게 이해하기**

- 운영체제는 DNS 질문을 우편물로 만들어서 보내는 것과 같음
- 발신자 주소(PC IP), 수신자 주소(DNS 서버 IP), 포트 번호를 적어서 패킷을 만듦
- 마치 편지봉투에 주소를 쓰는 것과 같음

### 2.4 데이터 링크 계층에서 프레임 생성

**상태 스냅샷 #4: ARP 캐시 및 MAC 주소 확인**

**ARP 캐시 테이블 (PC) - 상세**

```
PC ARP 캐시:
┌───────────────┬───────────────────┬───────────┬───────────┬─────────────┬─────────────┐
│ IP address    │ MAC address       │ interface │ status    │ timestamp   │ TTL         │
├───────────────┼───────────────────┼───────────┼───────────┼─────────────┼─────────────┤
│ 192.168.1.1   │ 00:11:22:33:44:55 │ Wi-Fi     │ REACHABLE │ 10:30:45    │ 300 seconds       │
│ 192.168.1.100 │ AA:BB:CC:DD:EE:FF │ Wi-Fi     │ PERMANENT │ 10:00:00    │ Unlimited      │
│ 168.126.63.1  │                   │ -         │ -         │ -           │ -           │
└───────────────┴───────────────────┴───────────┴───────────┴─────────────┴─────────────┘
```

**ARP 캐시 검색 과정 (상세)**

```
ARP 캐시 검색 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ step         │ operation            │ IP address  │ result       │ next action │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ 1            │ Hash Table Search     │ 192.168.1.1 │ HIT          │ MAC Use    │
│ 2            │ TTL Validation            │ 192.168.1.1 │ VALID        │ Frame Generation  │
│ 3            │ MAC Address Return       │ 00:11:22:33:44:55 │ OK     │ Ethernet Transmission  │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**ARP 요청 과정 (캐시 미스 시)**

**ARP 요청 패킷 구조**

```
ARP Request Frame Structure:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ field        │ value                │ size        │ description  │ RFC         │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ Hardware Type│ 1 (Ethernet)         │ 16 bits     │ Hardware Type │ RFC 826     │
│ Protocol Type│ 0x0800 (IPv4)        │ 16 bits     │ Protocol Type │ RFC 826     │
│ Hardware Size│ 6 (MAC address)      │ 8 bits      │ MAC Address Size │ RFC 826     │
│ Protocol Size│ 4 (IPv4 address)     │ 8 bits      │ IP Address Size  │ RFC 826     │
│ Operation    │ 1 (Request)          │ 16 bits     │ ARP Request     │ RFC 826     │
│ Sender MAC   │ AA:BB:CC:DD:EE:FF    │ 6 bytes     │ Sender MAC   │ PC MAC      │
│ Sender IP    │ 192.168.1.100        │ 4 bytes     │ Sender IP    │ PC IP       │
│ Target MAC   │ 00:00:00:00:00:00    │ 6 bytes     │ Target MAC     │ Unknown   │
│ Target IP    │ 192.168.1.1          │ 4 bytes     │ Target IP      │ Router IP   │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**ARP 요청 처리 과정**

```
ARP 요청 처리 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ step         │ action               │ target      │ method       │ result      │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ 1            │ ARP Cache Search        │ 192.168.1.1 │ hash lookup  │ MISS        │
│ 2            │ ARP Request Generation        │ Broadcast │ ARP frame    │ REQUEST     │
│ 3            │ Ethernet Frame Generation   │ FF:FF:FF:FF:FF:FF │ broadcast │ Transmission Ready    │
│ 4            │ Network Transmission        │ All Devices    │ broadcast    │ Transmission Complete    │
│ 5            │ ARP Response Wait        │ 192.168.1.1 │ timeout      │ 5 seconds         │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**이더넷 프레임 생성 (상세)**

**이더넷 프레임 구조 (바이트 단위)**

```
이더넷 프레임 구조:
┌────────────┬───────────────────┬────────┬───────────┬─────────────────┬─────────────┐
│ field      │ value             │ size   │ desc      │ reference table │ byte offset │
├────────────┼───────────────────┼────────┼───────────┼─────────────────┼─────────────┤
│ Dest MAC   │ 00:11:22:33:44:55 │ 6 byte │ Router MAC  │ ARP cache       │ 0-5         │
│ Source MAC │ AA:BB:CC:DD:EE:FF │ 6 byte │ PC MAC    │ network card    │ 6-11        │
│ Type       │ 0x0800            │ 2 byte │ IPv4      │ Fixed Value            │ 12-13       │
│ Payload    │ IP packet         │ Variable    │ DNS query │ Network Stack       │ 14-...      │
│ FCS        │ 0x12345678        │ 4 byte │ checksum  │ Calculated Value            │ Last 4 bytes│
└────────────┴───────────────────┴────────┴───────────┴─────────────────┴─────────────┘
```

**이더넷 프레임 바이트 구조**

```
이더넷 프레임 바이트 구조:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ offset       │ bytes       │ content      │ encoding    │ description │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ 0-5          │ 00:11:22:33:44:55 │ Dest MAC │ Big Endian │ Router MAC  │
│ 6-11         │ AA:BB:CC:DD:EE:FF │ Source MAC│ Big Endian │ PC MAC      │
│ 12-13        │ 0x0800      │ Type        │ Big Endian │ IPv4        │
│ 14-17        │ 0x45         │ IP Version  │ -           │ IPv4, IHL=5 │
│ 18-19        │ 0x0200       │ Total Length│ Big Endian │ 512 bytes   │
│ 20-21        │ 0x1234       │ ID          │ Big Endian │ Fragment ID │
│ 22-23        │ 0x0000       │ Flags/Offset│ Big Endian │ No fragment │
│ 24           │ 0x40         │ TTL         │ -           │ 64 hops     │
│ 25           │ 0x11         │ Protocol    │ -           │ UDP         │
│ 26-27        │ 0xABCD       │ Checksum    │ Big Endian │ IP checksum │
│ 28-31        │ 0xC0A80164   │ Source IP   │ Big Endian │ 192.168.1.100│
│ 32-35        │ 0xA87E3F01   │ Dest IP     │ Big Endian │ 168.126.63.1│
│ 36-37        │ 0xD431       │ Source Port │ Big Endian │ 54321       │
│ 38-39        │ 0x0035       │ Dest Port   │ Big Endian │ 53 (DNS)    │
│ 40-41        │ 0x0200       │ UDP Length  │ Big Endian │ 512 bytes   │
│ 42-43        │ 0xEFGH       │ UDP Checksum│ Big Endian │ UDP checksum│
│ 44-...       │ DNS Query    │ DNS payload │ -           │ DNS query   │
│ ...-Last   │ 0x12345678   │ FCS         │ Big Endian │ Frame checksum│
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**FCS (Frame Check Sequence) 계산 과정**

```
FCS 계산 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┬─────────────┐
│ step         │ operation            │ data        │ result       │ algorithm   │
├──────────────┼──────────────────────┼─────────────┼──────────────┼─────────────┤
│ 1            │ Frame Data Collection   │ Entire Frame  │ Byte Array   │ -           │
│ 2            │ CRC-32 Calculation          │ Byte Array   │ 0x12345678   │ CRC-32      │
│ 3            │ 1's Complement            │ 0x12345678   │ 0xEDCBA987   │ NOT Operation     │
│ 4            │ FCS Addition             │ Frame End    │ Completed Frame │ -           │
└──────────────┴──────────────────────┴─────────────┴──────────────┴─────────────┘
```

**쉽게 이해하기**

- ARP 캐시는 마치 개인 주소록과 같습니다
- "192.168.1.1의 실제 주소가 뭐지?" 확인
- 이미 알고 있으면 바로 사용, 모르면 물어봄
- 이더넷 프레임은 마치 편지봉투와 같아서 발신자와 수신자 주소를 적습니다
- FCS는 마치 편지봉투의 봉인과 같아서 내용이 변조되지 않았는지 확인합니다

**처리 주체**: 네트워크 어댑터 드라이버 (Windows의 경우 Intel Wireless 드라이버, Mac의 경우 AirPort 드라이버)

**네트워크 장비별 처리 과정**

**로컬 PC의 역할**

- 사용자의 요청을 네트워크 패킷으로 변환
- MAC 주소와 IP 주소를 포함한 이더넷 프레임 생성
- 무선 신호로 인터넷 공유기로 전송

**인터넷 공유기의 역할**

- PC에서 전송된 무선 신호를 수신
- 패킷의 목적지 확인 (외부 네트워크로 가는지 확인)
- NAT(Network Address Translation) 수행: 사설 IP를 공인 IP로 변환
- 다음 홉(라우터)으로 패킷 전달

**스위치의 역할 (사무실 네트워크 내부)**

- MAC 주소 테이블을 기반으로 패킷 전달
- 목적지 MAC 주소가 같은 네트워크에 있으면 직접 전달
- 다른 네트워크로 가는 패킷은 라우터로 전달

**라우터의 역할**

- IP 주소를 기반으로 패킷의 최적 경로 결정
- 라우팅 테이블을 확인하여 다음 홉 결정
- 서로 다른 네트워크 간의 패킷 전달

**MAC 주소와 IP 주소의 역할 구분**

**MAC 주소를 사용하는 이유**

- MAC 주소는 물리적 네트워크 세그먼트 내에서 직접 통신을 위한 주소
- 이더넷 프레임은 MAC 주소를 기반으로 스위치나 허브에서 전송됨
- 같은 네트워크 세그먼트 내에서는 MAC 주소로 직접 통신 가능
- 라우터를 거치지 않는 로컬 네트워크에서는 MAC 주소만으로 통신

**IP 주소를 사용하는 이유**

- IP 주소는 논리적 네트워크 주소로, 다른 네트워크와의 통신을 위한 주소
- 라우터는 IP 주소를 기반으로 패킷을 다른 네트워크로 전달
- 인터넷 전체에서 유일한 주소 체계를 제공
- 네트워크 계층에서 경로 결정을 위해 사용됨

**MAC 주소 획득 방법 (ARP 프로토콜)**

**ARP (Address Resolution Protocol) 동작**

- PC가 목적지 IP 주소(168.126.63.1)에 대응하는 MAC 주소를 모를 때
- ARP 캐시 테이블 확인: `arp -a` 명령어로 확인 가능
- 캐시에 없으면 ARP 요청 브로드캐스트 전송

**ARP 요청 패킷 구조**

```
ARP Request Frame:
- Destination MAC: FF:FF:FF:FF:FF:FF (브로드캐스트)
- Source MAC: AA:BB:CC:DD:EE:FF (PC의 MAC)
- Type: 0x0806 (ARP)
- ARP Payload:
  - Hardware Type: 1 (Ethernet)
  - Protocol Type: 0x0800 (IPv4)
  - Operation: 1 (Request)
  - Sender MAC: AA:BB:CC:DD:EE:FF
  - Sender IP: 192.168.1.100
  - Target MAC: 00:00:00:00:00:00 (알 수 없음)
  - Target IP: 168.126.63.1
```

**ARP 응답 처리**

- 공유기가 ARP 응답으로 자신의 MAC 주소 전송
- PC가 ARP 캐시에 MAC 주소 저장
- 이후 통신에서는 캐시된 MAC 주소 사용

**이더넷 프레임 상세 구조**

**프레임 헤더 (14바이트)**

```
Ethernet Frame Header:
┌───────────────────┬───────────────────┬───────────┐
│ Destination MAC   │ Source MAC        │ Type      │
│ (6 bytes)         │ (6 bytes)         │ (2 bytes) │
├───────────────────┼───────────────────┼───────────┤
│ 00:11:22:33:44:55 │ AA:BB:CC:DD:EE:FF │ 0x0800    │
└───────────────────┴───────────────────┴───────────┘
```

**프레임 페이로드 (IP 패킷)**

```
IP Packet (DNS Query):
┌───────────────────────────────────┐
│ IP Header (20 bytes)              │
├───────────────────────────────────┤
│ Version: 4, Header Length: 5      │
│ Type of Service: 0x00             │
│ Total Length: 512                 │
│ Identification: 0x1234            │
│ Flags: 0x0000, Fragment Offset: 0 │
│ Time to Live: 64                  │
│ Protocol: 17 (UDP)                │
│ Header Checksum: 0xABCD           │
│ Source IP: 192.168.1.100          │
│ Destination IP: 168.126.63.1      │
├───────────────────────────────────┤
│ UDP Header (8 bytes)              │
├───────────────────────────────────┤
│ Source Port: 54321                │
│ Destination Port: 53              │
│ Length: 512                       │
│ Checksum: 0xEFGH                  │
├───────────────────────────────────┤
│ DNS Query Payload (484 bytes)     │
├───────────────────────────────────┤
│ Transaction ID: 0x1234            │
│ Flags: Standard Query (0x0100)    │
│ Questions: 1                      │
│ Answer RRs: 0                     │
│ Authority RRs: 0                  │
│ Additional RRs: 0                 │
│ Query: www.my-app.com (A record)  │
└───────────────────────────────────┘
```

**프레임 트레일러 (4바이트)**

```
Frame Trailer:
┌───────────────┐
│ FCS (4 bytes) │
│ 0x12345678    │
└───────────────┘
```

**쉽게 이해하기**

- 네트워크 카드 드라이버가 패킷을 물리적으로 전송할 수 있는 형태로 바꿈
- 마치 편지를 봉투에 넣고 우표를 붙이는 것과 같음
- MAC 주소는 실제 물리적 주소로, "이 편지를 어느 기계로 보낼까?"를 나타냄
- IP 주소는 논리적 주소로, "이 편지가 최종적으로 어느 네트워크로 가야 할까?"를 나타냄
- ARP는 마치 전화번호부에서 이름으로 번호를 찾는 것과 같음

**네트워크 장비별 쉬운 설명**

- **로컬 PC**: 마치 편지를 쓰는 사람과 같습니다. 요청을 만들어서 네트워크로 보냅니다
- **인터넷 공유기**: 마치 아파트의 우체통과 같습니다. 여러 집의 편지를 모아서 우체국으로 보냅니다
- **스위치**: 마치 건물 내부의 안내원과 같습니다. "이 편지는 어느 방으로 가야 할까?"를 결정합니다
- **라우터**: 마치 도시 간 우편물을 전달하는 우체국과 같습니다. "이 편지는 어느 도시로 가야 할까?"를 결정합니다

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

**상태 스냅샷 #5: KT DNS 서버 내부 처리**

**KT DNS 서버 캐시**

```
KT DNS 캐시 테이블:
┌────────────────┬────────────────┬───────┬──────┬───────────┐
│ domain name    │ IP address     │ TTL   │ type │ timespamp │
├────────────────┼────────────────┼───────┼──────┼───────────┤
│ www.google.com │ 142.250.191.78 │ 300s  │ A    │ 10:25:30  │
│ www.naver.com  │ 223.130.195.95 │ 600s  │ A    │ 10:20:15  │
│ my-app.com     │ 20.123.45.67   │ 3600s │ A    │ 09:30:00  │
│ www.my-app.com │ -              │ -     │ -    │ -         │
└────────────────┴────────────────┴───────┴──────┴───────────┘
```

**DNS 서버 처리 과정**

1. 수신: `www.my-app.com` A 레코드 질의
2. 캐시 확인: `www.my-app.com` 없음, `my-app.com` 있음
3. 재귀적 질의 시작:

- Root DNS 서버에 `.com` NS 레코드 질의
- .com DNS 서버에 `my-app.com` NS 레코드 질의
- my-app.com DNS 서버에 `www.my-app.com` A 레코드 질의

**DNS 서버 라우팅 테이블**

```
KT DNS 서버 라우팅:
┌────────────────┬──────────────┬────────────────────┬───────┐
│ destination    │ server IP    │ server type        │ order │
├────────────────┼──────────────┼────────────────────┼───────┤
│ Root DNS       │ 198.41.0.4   │ a.root-servers.net │ 1     │
│ .com DNS       │ 192.5.6.30   │ a.gtld-servers.net │ 1     │
│ my-app.com DNS │ 20.123.45.67 │ Azure DNS          │ 1     │
└────────────────┴──────────────┴────────────────────┴───────┘
```

**쉽게 이해하기**

- DNS 서버는 마치 전화번호 안내데스크와 같습니다
- "www.my-app.com의 번호가 있나?" 확인 후 없으면 다른 안내데스크에 물어봄
- 최종적으로 찾은 번호를 질문한 사람에게 알려줌

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

**상태 스냅샷 #6: 네트워크 라우터들의 라우팅 테이블**

**KT 백본 라우터 라우팅 테이블**

```
KT 백본 라우터 라우팅:
┌──────────────┬───────────────┬───────────────┬───────────┬────────┐
│ dest network │ subnet mask   │ next          │ interface │ metrix │
├──────────────┼───────────────┼───────────────┼───────────┼────────┤
│ 0.0.0.0      │ 0.0.0.0       │ 203.248.252.1 │ Internet  │ 1      │
│ 192.168.0.0  │ 255.255.0.0   │ 168.126.63.1  │ Internal  │ 1      │
│ 20.123.45.0  │ 255.255.255.0 │ 203.248.252.1 │ Internet  │ 2      │
│ 168.126.63.0 │ 255.255.255.0 │ 0.0.0.0       │ Internal  │ 1      │
└──────────────┴───────────────┴───────────────┴───────────┴────────┘
```

**KT 지역 POP 라우터 라우팅 테이블**

```
KT 지역 POP 라우터 라우팅:
┌──────────────┬───────────────┬──────────────┬───────────┬────────┐
│ dest network │ subnet mask   │ next         │ interface │ metrix │
├──────────────┼───────────────┼──────────────┼───────────┼────────┤
│ 0.0.0.0      │ 0.0.0.0       │ 168.126.63.1 │ Backbone  │ 1      │
│ 192.168.1.0  │ 255.255.255.0 │ 192.168.1.1  │ Customer  │ 1      │
│ 168.126.63.0 │ 255.255.255.0 │ 0.0.0.0      │ Backbone  │ 1      │
└──────────────┴───────────────┴──────────────┴───────────┴────────┘
```

**라우팅 결정 과정**

1. KT DNS → KT 백본: 목적지 192.168.1.100 → 기본 라우트 → 인터넷
2. KT 백본 → KT 지역 POP: 목적지 192.168.1.100 → 고객 네트워크 → 공유기
3. KT 지역 POP → 공유기: 직접 전달

**공유기 NAT 테이블**

```
공유기 NAT 테이블:
┌───────────────┬──────────────┬─────────────────┬─────────────┬─────────────┐
│ private IP    │ private port │ public IP       │ public port │ status      │
├───────────────┼──────────────┼─────────────────┼─────────────┼─────────────┤
│ 192.168.1.100 │ 54321        │ 203.248.252.100 │ 12345       │ ESTABLISHED │
│ 192.168.1.101 │ 54322        │ 203.248.252.100 │ 12346       │ ESTABLISHED │
└───────────────┴──────────────┴─────────────────┴─────────────┴─────────────┘
```

**쉽게 이해하기**

- 라우터들은 마치 우체국 체인과 같습니다
- 각 우체국이 "이 편지를 어느 방향으로 보낼까?" 결정
- NAT 테이블은 마치 아파트 우체통의 주소 변환표와 같습니다

**처리 주체**: 네트워크 라우터들 (KT 백본 라우터, 지역 POP 라우터, 사용자 공유기)

**네트워크 장비별 역방향 처리**

**라우터의 역방향 처리**

- DNS 서버에서 온 응답 패킷을 수신
- 라우팅 테이블을 확인하여 사용자 네트워크로 전달
- 각 라우터가 "이 응답을 어느 방향으로 보낼까?" 결정

**인터넷 공유기의 역방향 처리**

- 라우터에서 온 응답 패킷을 수신
- NAT 테이블을 확인하여 원래 요청한 PC로 전달
- 사설 IP 주소로 변환하여 로컬 네트워크로 전송

**스위치의 역방향 처리**

- 공유기에서 온 응답 패킷을 수신
- MAC 주소 테이블을 확인하여 해당 PC로 전달
- "이 응답은 어느 PC로 가야 할까?" 결정

**로컬 PC의 역방향 처리**

- 스위치에서 온 응답 패킷을 수신
- 네트워크 스택에서 패킷 처리
- 브라우저에 IP 주소 (20.123.45.67) 전달

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

**네트워크 장비별 쉬운 설명**

- **라우터**: 마치 우체국에서 "이 편지를 어느 방향으로 보낼까?" 결정하는 것과 같습니다
- **인터넷 공유기**: 마치 아파트 우체통에서 "이 편지는 어느 집으로 가야 할까?" 확인하는 것과 같습니다
- **스위치**: 마치 건물 안내원이 "이 편지는 어느 방으로 가야 할까?" 결정하는 것과 같습니다
- **로컬 PC**: 마치 편지를 받는 사람이 봉투를 뜯고 내용을 확인하는 것과 같습니다

## 4단계: TCP 연결 수립

### 4.1 TCP 3-way 핸드셰이크

**상태 스냅샷 #7: TCP 연결 상태 및 소켓 테이블**

**TCP 소켓 상태 (연결 전)**

```
PC TCP 소켓 테이블 (연결 전):
┌────────────┬───────────────┬────────────┬──────────────┬─────────────┬─────────────┐
│ socket ID  │ local IP      │ local port │ remote IP    │ remote port │ status      │
├────────────┼───────────────┼────────────┼──────────────┼─────────────┼─────────────┤
│ 0x12345678 │ 192.168.1.100 │ 54321      │ 168.126.63.1 │ 53 (DNS)    │ CLOSED      │
│ 0x87654321 │ 192.168.1.100 │ 54322      │ 8.8.8.8      │ 53 (DNS)    │ CLOSED      │
│ 0xABCD1234 │ 192.168.1.100 │ 54323      │ 20.123.45.67 │ 443 (HTTPS) │ CLOSED      │
└────────────┴───────────────┴────────────┴──────────────┴─────────────┴─────────────┘
```

**TCP 연결 상태 머신 (상세)**

```
TCP 상태 전이 머신:
┌───────────────┬─────────────────┬─────────────┬───────────────┬──────────────────┬─────────────┐
│ current state │ event           │ next state  │ action        │ reference table  │ timer       │
├───────────────┼─────────────────┼─────────────┼───────────────┼──────────────────┼─────────────┤
│ CLOSED        │ connect()       │ SYN_SENT    │ Send SYN      │ socket table     │ -           │
│ SYN_SENT      │ receive SYN+ACK │ ESTABLISHED │ Send ACK      │ connection table │ retransmit  │
│ SYN_SENT      │ timeout         │ CLOSED      │ Connection Fail│ error handler    │ 3 seconds         │
│ ESTABLISHED   │ data transfer   │ ESTABLISHED │ Data Transfer │ data buffer      │ -           │
│ ESTABLISHED   │ close()         │ FIN_WAIT_1  │ Send FIN      │ socket table     │ -           │
└───────────────┴─────────────────┴─────────────┴───────────────┴──────────────────┴─────────────┘
```

**TCP 연결 테이블 (연결 후)**

```
PC TCP 연결 테이블 (연결 후):
┌────────────┬───────────────┬────────────┬──────────────┬─────────────┬─────────────┬─────────────┐
│ socket ID  │ local IP      │ local port │ remote IP    │ remote port │ status      │ seq number  │
├────────────┼───────────────┼────────────┼──────────────┼─────────────┼─────────────┼─────────────┤
│ 0x12345678 │ 192.168.1.100 │ 54321      │ 168.126.63.1 │ 53 (DNS)    │ CLOSED      │ -           │
│ 0x87654321 │ 192.168.1.100 │ 54322      │ 8.8.8.8      │ 53 (DNS)    │ CLOSED      │ -           │
│ 0xABCD1234 │ 192.168.1.100 │ 54323      │ 20.123.45.67 │ 443 (HTTPS) │ ESTABLISHED │ 1234567891  │
└────────────┴───────────────┴────────────┴──────────────┴─────────────┴─────────────┴─────────────┘
```

**TCP 연결 생성 과정 (상세)**

**1단계: 소켓 생성**

```
소켓 생성 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ step         │ action               │ parameter   │ result       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 1            │ socket() Call        │ AF_INET     │ Socket Descriptor │
│ 2            │ Port Assignment            │ Dynamic Port    │ 54323        │
│ 3            │ Socket Table Registration      │ socket ID   │ 0xABCD1234   │
│ 4            │ Status Setting            │ CLOSED      │ Initial Status     │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**2단계: 연결 시작 (SYN 전송)**

```
SYN 패킷 생성 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ field        │ value                │ calculation │ source       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ Source Port  │ 54323                │ Dynamic Assignment    │ OS           │
│ Dest Port    │ 443                  │ HTTPS Default   │ RFC 2818     │
│ Seq Number   │ 1234567890           │ Random Generation    │ OS           │
│ Ack Number   │ 0                    │ SYN Packet    │ RFC 793      │
│ Flags        │ SYN=1, ACK=0         │ Connection Start    │ RFC 793      │
│ Window Size  │ 65535                │ Buffer Size    │ OS Setting      │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**3단계: SYN-ACK 수신 및 처리**

```
SYN-ACK 처리 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ step         │ action               │ validation  │ result       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 1            │ Packet Reception            │ Checksum Validation  │ OK           │
│ 2            │ SYN Flag Check      │ SYN=1       │ OK           │
│ 3            │ ACK Flag Check      │ ACK=1       │ OK           │
│ 4            │ Ack Number Validation      │ ISN+1       │ OK           │
│ 5            │ Status Update        │ SYN_SENT→   │ ESTABLISHED  │
│ 6            │ Seq Number Update  │ Server ISN     │ 9876543210   │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**4단계: ACK 전송**

```
ACK 패킷 생성 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ field        │ value                │ calculation │ source       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ Source Port  │ 54323                │ Existing Socket    │ Socket Table   │
│ Dest Port    │ 443                  │ Existing Socket    │ Socket Table   │
│ Seq Number   │ 1234567891           │ ISN+1       │ Local Calculation    │
│ Ack Number   │ 9876543211           │ Server ISN+1  │ Server Response    │
│ Flags        │ SYN=0, ACK=1         │ Connection Complete    │ RFC 793      │
│ Window Size  │ 65535                │ Buffer Size    │ OS Setting      │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**TCP 헤더 상세 구조 (바이트 단위)**

**TCP 헤더 (20바이트) - 바이트별 분석**

```
TCP Header Byte Structure:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ byte offset  │ field name  │ value (hex)  │ value (dec) │ description │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ 0-1          │ Source Port │ D433         │ 54323       │ Local Port  │
│ 2-3          │ Dest Port   │ 01BB         │ 443         │ Dest Port   │
│ 4-7          │ Seq Number  │ 499602D2     │ 1234567890  │ Seq Number  │
│ 8-11         │ Ack Number  │ 00000000     │ 0           │ Ack Number  │
│ 12           │ Data Offset │ 50           │ 5 (20 bytes)│ Header Len  │
│ 13           │ Flags       │ 02           │ SYN=1       │ Control Flags│
│ 14-15        │ Window Size │ FFFF         │ 65535       │ Window Size │
│ 16-17        │ Checksum    │ ABCD         │ 43981       │ Checksum    │
│ 18-19        │ Urgent Ptr  │ 0000         │ 0           │ Urgent Ptr  │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**TCP 플래그 상세 분석**

```
TCP Flags Bit Analysis:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ bit position │ flag name   │ value (SYN)  │ value (ACK) │ description │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ 0            │ CWR         │ 0            │ 0           │ Congestion  │
│ 1            │ ECE         │ 0            │ 0           │ ECN Echo    │
│ 2            │ URG         │ 0            │ 0           │ Urgent      │
│ 3            │ ACK         │ 0            │ 1           │ Acknowledgment│
│ 4            │ PSH         │ 0            │ 0           │ Push        │
│ 5            │ RST         │ 0            │ 0           │ Reset       │
│ 6            │ SYN         │ 1            │ 0           │ Synchronize │
│ 7            │ FIN         │ 0            │ 0           │ Finish      │
│ 8            │ (reserved)  │ 0            │ 0           │ Reserved    │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**TCP 체크섬 계산 과정**

```
TCP Checksum Calculation:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ step         │ data                 │ operation   │ result       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 1            │ IP Header + TCP Header│ 16-bit Sum  │ 0x1234       │
│ 2            │ 1's Complement       │ NOT Operation│ 0xEDCB       │
│ 3            │ Final Checksum       │ Store        │ 0xABCD       │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**쉽게 이해하기**

- TCP 소켓 테이블은 마치 전화번호부와 같습니다
- "어느 번호로 연결했는지" 기록하고 상태를 추적합니다
- ESTABLISHED는 "통화 중" 상태와 같습니다
- 시퀀스 번호는 마치 "몇 번째 대화인가?"를 나타내는 것과 같습니다
- 체크섬은 마치 "이 대화가 정확한가?"를 확인하는 것과 같습니다

**처리 주체**: 운영체제 TCP/IP 스택 (Windows의 경우 TCP/IP 드라이버, Mac의 경우 BSD TCP 스택)

**TCP 연결 수립 과정 (상세)**

**1단계: 소켓 생성 및 초기화**

- 운영체제가 TCP 소켓 생성
- 동적 포트 할당 (54323)
- 소켓 테이블에 등록 (socket ID: 0xABCD1234)
- 초기 상태: CLOSED

**2단계: SYN 패킷 전송**

- 클라이언트가 서버로 SYN 패킷 전송
- 시퀀스 번호: 1234567890 (랜덤 생성)
- 플래그: SYN=1, ACK=0
- 상태 변경: CLOSED → SYN_SENT

**3단계: SYN-ACK 패킷 수신**

- 서버가 SYN-ACK 패킷 응답
- 서버 시퀀스 번호: 9876543210
- 확인 번호: 1234567891 (클라이언트 ISN + 1)
- 플래그: SYN=1, ACK=1

**4단계: ACK 패킷 전송**

- 클라이언트가 ACK 패킷 전송
- 시퀀스 번호: 1234567891
- 확인 번호: 9876543211 (서버 ISN + 1)
- 플래그: SYN=0, ACK=1
- 상태 변경: SYN_SENT → ESTABLISHED

**쉽게 이해하기**

- TCP 연결은 마치 전화를 거는 과정과 같음
- PC가 "여보세요?" (SYN) → 서버가 "네, 여보세요" (SYN-ACK) → PC가 "연결됐네요" (ACK)
- 이 과정을 통해 양쪽이 서로 통신할 준비가 되었음을 확인
- 시퀀스 번호는 마치 "몇 번째 대화인가?"를 나타내는 것과 같음

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

**상태 스냅샷 #8: Azure Load Balancer 내부 상태**

**Azure Load Balancer 백엔드 풀**

```
Azure Load Balancer 백엔드 풀:
┌──────────────┬────────────┬──────┬───────────┬──────────────┬─────────────┐
│ Backend ID   │ IP address │ port │ status    │ health check │ last check  │
├──────────────┼────────────┼──────┼───────────┼──────────────┼─────────────┤
│ aks-node-001 │ 10.0.1.5   │ 80   │ Healthy   │ 200 OK       │ 10:30:45    │
│ aks-node-002 │ 10.0.1.6   │ 80   │ Healthy   │ 200 OK       │ 10:30:46    │
│ aks-node-003 │ 10.0.1.7   │ 80   │ Unhealthy │ Timeout      │ 10:30:47    │
│ aks-node-004 │ 10.0.1.8   │ 80   │ Healthy   │ 200 OK       │ 10:30:48    │
└──────────────┴────────────┴──────┴───────────┴──────────────┴─────────────┘
```

**Load Balancer 연결 풀**

```
Azure Load Balancer 연결 풀:
┌─────────────────┬─────────────┬────────────┬──────────────┬──────────────────┬─────────────┐
│ client IP       │ client port │ backend IP │ backend port │ connection time  │ session ID  │
├─────────────────┼─────────────┼────────────┼──────────────┼──────────────────┼─────────────┤
│ 203.248.252.100 │ 54323       │ 10.0.1.5   │ 80           │ 10:30:45         │ sess-001    │
│ 203.248.252.101 │ 54324       │ 10.0.1.6   │ 80           │ 10:30:46         │ sess-002    │
│ 203.248.252.102 │ 54325       │ 10.0.1.8   │ 80           │ 10:30:47         │ sess-003    │
└─────────────────┴─────────────┴────────────┴──────────────┴──────────────────┴─────────────┘
```

**Load Balancer 내부 처리 과정 (상세)**

**1단계: 요청 수신 및 검증**

```
요청 검증 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ step         │ validation           │ check       │ result       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 1            │ IP Address Validation         │ 20.123.45.67│ OK           │
│ 2            │ Port Validation            │ 443 (HTTPS) │ OK           │
│ 3            │ Protocol Validation        │ TCP         │ OK           │
│ 4            │ Health Check Verification       │ Backend Status   │ OK           │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**2단계: 백엔드 선택 알고리즘**

```
라운드 로빈 알고리즘 실행:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ request #    │ available backends   │ selected    │ reason       │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 1            │ [10.0.1.5, 10.0.1.6, 10.0.1.8] │ 10.0.1.5 │ First    │
│ 2            │ [10.0.1.5, 10.0.1.6, 10.0.1.8] │ 10.0.1.6 │ Second    │
│ 3            │ [10.0.1.5, 10.0.1.6, 10.0.1.8] │ 10.0.1.8 │ Third    │
│ 4            │ [10.0.1.5, 10.0.1.6, 10.0.1.8] │ 10.0.1.5 │ Rotation       │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**3단계: 연결 풀 업데이트**

```
연결 풀 업데이트 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ action       │ data                 │ source      │ destination  │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 1            │ New Connection Registration         │ client      │ connection pool│
│ 2            │ Session ID Generation         │ LB          │ session table│
│ 3            │ Timestamp Recording      │ system      │ connection pool│
│ 4            │ Backend Selection Recording     │ algorithm   │ connection pool│
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**Load Balancer 내부 상태 테이블**

```
Load Balancer 상태 테이블:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ table name   │ record count│ last update  │ status      │ health      │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ backend pool │ 4           │ 10:30:48     │ ACTIVE      │ 75% (3/4)   │
│ connection   │ 3           │ 10:30:47     │ ACTIVE      │ OK          │
│ session      │ 3           │ 10:30:47     │ ACTIVE      │ OK          │
│ health check │ 4           │ 10:30:48     │ ACTIVE      │ 75% (3/4)   │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**헬스 체크 상세 과정**

```
헬스 체크 프로세스:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ backend      │ check method         │ interval    │ threshold    │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ 10.0.1.5     │ HTTP GET /health     │ 30 seconds        │ 3 failures     │
│ 10.0.1.6     │ HTTP GET /health     │ 30 seconds        │ 3 failures     │
│ 10.0.1.7     │ HTTP GET /health     │ 30 seconds        │ 3 failures     │
│ 10.0.1.8     │ HTTP GET /health     │ 30 seconds        │ 3 failures     │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**Load Balancer 알고리즘 상세**

**라운드 로빈 알고리즘 구현**

```python
class RoundRobinLoadBalancer:
    def __init__(self, backends):
        self.backends = [b for b in backends if b.status == 'Healthy']
        self.current_index = 0
        self.lock = threading.Lock()
    
    def select_backend(self):
        with self.lock:
            if not self.backends:
                return None
            
            selected = self.backends[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.backends)
            return selected
    
    def update_backend_status(self, backend_id, status):
        for backend in self.backends:
            if backend.id == backend_id:
                backend.status = status
                if status == 'Unhealthy':
                    self.backends.remove(backend)
                break
```

**Load Balancer 패킷 처리 과정**

**1단계: 패킷 수신 및 파싱**

```
패킷 파싱 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ field        │ value                │ extraction  │ validation   │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ Source IP    │ 203.248.252.100      │ IP Header     │ OK           │
│ Dest IP      │ 20.123.45.67         │ IP Header     │ OK           │
│ Source Port  │ 54323                │ TCP 헤더    │ OK           │
│ Dest Port    │ 443                  │ TCP 헤더    │ OK           │
│ Protocol     │ TCP                  │ IP 헤더     │ OK           │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**2단계: 백엔드 선택 및 NAT**

```
NAT 처리 과정:
┌──────────────┬──────────────────────┬─────────────┬──────────────┐
│ original     │ translated           │ algorithm   │ backend      │
├──────────────┼──────────────────────┼─────────────┼──────────────┤
│ Dest IP: 20.123.45.67 │ Dest IP: 10.0.1.5 │ DNAT      │ aks-node-001 │
│ Dest Port: 443 │ Dest Port: 80     │ 포트 변환    │ aks-node-001 │
│ Source IP: 203.248.252.100 │ Source IP: 20.123.45.67 │ SNAT │ Load Balancer │
└──────────────┴──────────────────────┴─────────────┴──────────────┘
```

**3단계: 연결 추적**

```
연결 추적 테이블:
┌──────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│ session ID   │ client info │ backend info │ timestamp   │ status      │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ sess-001     │ 203.248.252.100:54323 │ 10.0.1.5:80 │ 10:30:45 │ ESTABLISHED │
│ sess-002     │ 203.248.252.101:54324 │ 10.0.1.6:80 │ 10:30:46 │ ESTABLISHED │
│ sess-003     │ 203.248.252.102:54325 │ 10.0.1.8:80 │ 10:30:47 │ ESTABLISHED │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

**쉽게 이해하기**

- Load Balancer는 마치 건물 안내 데스크와 같습니다
- "어느 층으로 안내할까?" 결정하고 방문자 정보를 기록합니다
- 헬스 체크는 마치 "각 층이 정상적으로 작동하나?" 확인하는 것과 같습니다
- 라운드 로빈은 마치 "순서대로 안내하는" 방식과 같습니다
- NAT는 마치 "방문자 정보를 바꿔서 안내하는" 것과 같습니다

**처리 주체**: Azure Load Balancer (Microsoft의 소프트웨어 정의 네트워킹)

**Azure Load Balancer 수신 과정 (상세)**

**1단계: 패킷 수신 및 검증**

- 공인 IP: 20.123.45.67로 수신된 패킷 처리
- TCP 헤더 파싱 및 프로토콜 검증
- 헬스 체크를 통한 백엔드 풀 상태 확인

**2단계: 백엔드 선택**

- 라운드 로빈 알고리즘으로 AKS 노드 선택
- 선택된 노드: aks-nodepool1-12345678-vmss000001 (10.0.1.5)
- 연결 풀에 세션 정보 기록

**3단계: NAT 처리 및 전달**

- DNAT: 목적지 IP를 20.123.45.67 → 10.0.1.5로 변경
- 포트 변환: 443 → 80
- SNAT: 소스 IP를 클라이언트 → Load Balancer로 변경

**쉽게 이해하기**

- Azure Load Balancer는 마치 건물의 안내 데스크와 같음
- 방문자가 들어오면 "어느 층으로 안내할까?" 결정
- 여러 서버 중에서 한 대를 선택해서 요청을 전달
- 각 서버가 건강한지(헬스 체크)도 계속 확인
- NAT는 마치 "방문자 정보를 바꿔서 안내하는" 것과 같음

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

**상태 스냅샷 #9: kube-proxy 및 iptables 규칙**

**kube-proxy Service 테이블**

```
kube-proxy Service 테이블:
┌─────────────────┬─────────────┬──────┬───────────┬────────────────┐
│ Service name    │ ClusterIP   │ port │ type      │ Endpoint count │
├─────────────────┼─────────────┼──────┼───────────┼────────────────┤
│ my-app-frontend │ 10.96.1.100 │ 80   │ ClusterIP │ 3              │
│ my-app-backend  │ 10.96.2.100 │ 8080 │ ClusterIP │ 2              │
│ kube-dns        │ 10.96.0.10  │ 53   │ ClusterIP │ 2              │
└─────────────────┴─────────────┴──────┴───────────┴────────────────┘
```

**kube-proxy Endpoint 테이블**

```
my-app-frontend Endpoints:
┌────────────────┬────────────┬──────┬────────┬───────────────┐
│ Pod name       │ Pod IP     │ port │ status │ selected rate │
├────────────────┼────────────┼──────┼────────┼───────────────┤
│ frontend-pod-1 │ 10.244.1.5 │ 80   │ Ready  │ 33.3%         │
│ frontend-pod-2 │ 10.244.1.6 │ 80   │ Ready  │ 33.3%         │
│ frontend-pod-3 │ 10.244.1.7 │ 80   │ Ready  │ 33.3%         │
└────────────────┴────────────┴──────┴────────┴───────────────┘
```

**iptables 규칙 (NAT 테이블)**

```
iptables -t nat -L PREROUTING:
┌───────────────┬───────────────┬────────────┬─────────────────┬─────────────┐
│ chain         │ targt         │ protofoenl │ match condition │ action      │
├───────────────┼───────────────┼────────────┼─────────────────┼─────────────┤
│ PREROUTING    │ KUBE-SERVICES │ all        │ 10.96.0.0/16    │ Service 조회  │
│ KUBE-SERVICES │ KUBE-SVC-XXX  │ tcp        │ 10.96.1.100:80  │ Load Balance │
│ KUBE-SVC-XXX  │ KUBE-SEP-YYY  │ tcp        │ random          │ Endpoint 선택 │
│ KUBE-SEP-YYY  │ DNAT          │ tcp        │ 10.244.1.5:80   │ 포트 변환      │
└───────────────┴───────────────┴────────────┴─────────────────┴──────────────┘
```

**실제 iptables 명령어**

```bash
# Service 규칙
iptables -t nat -A PREROUTING -d 10.96.1.100/32 -p tcp --dport 80 -j KUBE-SERVICES
iptables -t nat -A KUBE-SERVICES -d 10.96.1.100/32 -p tcp --dport 80 -j KUBE-SVC-XXX

# Load Balancing 규칙
iptables -t nat -A KUBE-SVC-XXX -m statistic --mode random --probability 0.3333333333 -j KUBE-SEP-YYY
iptables -t nat -A KUBE-SVC-XXX -m statistic --mode random --probability 0.5000000000 -j KUBE-SEP-ZZZ
iptables -t nat -A KUBE-SVC-XXX -j KUBE-SEP-WWW

# DNAT 규칙
iptables -t nat -A KUBE-SEP-YYY -p tcp -j DNAT --to-destination 10.244.1.5:80
```

**쉽게 이해하기**

- kube-proxy는 마치 건물 내부의 안내 시스템과 같습니다
- Service는 마치 "어느 부서로 가야 할까?"를 결정하는 것과 같습니다
- iptables는 마치 건물 내부의 길 안내 표지판과 같습니다
- "이 방향으로 가면 어느 방에 도착한다"는 규칙을 만들어둡니다

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

**상태 스냅샷 #10: Nginx 내부 상태 및 설정**

**Nginx 프로세스 상태**

```
Nginx 프로세스 테이블:
┌────────────┬────────┬─────────┬──────────────────┬──────────────┐
│ process ID │ type   │ status  │ connection count │ memory usage │
├────────────┼────────┼─────────┼──────────────────┼──────────────┤
│ 1          │ Master │ Running │ -                │ 2MB          │
│ 10         │ Worker │ Running │ 5                │ 15MB         │
│ 11         │ Worker │ Running │ 3                │ 12MB         │
│ 12         │ Worker │ Running │ 7                │ 18MB         │
└────────────┴────────┴─────────┴──────────────────┴──────────────┘
```

**Nginx 설정 파일 (nginx.conf)**

```
Nginx 설정 구조:
┌──────────┬───────────────┬────────────────┬───────────┐
│ bloclk   │ setting       │ value          │ reference │
├──────────┼───────────────┼────────────────┼───────────┤
│ http     │ server_tokens │ off            │ 보안       │
│ http     │ gzip          │ on             │ 압축       │
│ server   │ listen        │ 80             │ 포트       │
│ server   │ server_name   │ my-app.com     │ 도메인      │
│ location │ /my-app/      │ proxy_pass     │ 백엔드      │
│ location │ proxy_pass    │ my-app-backend │ 서비스명    │
└──────────┴───────────────┴────────────────┴───────────┘
```

**Nginx 연결 풀**

```
Nginx 연결 테이블:
┌───────────────┬─────────────────┬────────────────┬─────────────┬─────────────────┐
│ connection ID │ client IP       │ request URI    │ tatus       │ processing time │
├───────────────┼─────────────────┼────────────────┼─────────────┼─────────────────┤
│ 1001          │ 203.248.252.100 │ /my-app/data   │ Processing  │ 10:30:45        │
│ 1002          │ 203.248.252.101 │ /my-app/status │ Established │ 10:30:46        │
│ 1003          │ 203.248.252.102 │ /my-app/config │ Established │ 10:30:47        │
└───────────────┴─────────────────┴────────────────┴─────────────┴─────────────────┘
```

**Nginx 로그 엔트리**

```
Nginx 액세스 로그:
┌───────────┬─────────────────┬────────────────────┬────────┬───────────────┐
│ timestamp │ client IP       │ request            │ status │ response size │
├───────────┼─────────────────┼────────────────────┼────────┼───────────────┤
│ 10:30:45  │ 203.248.252.100 │ GET /my-app/data   │ 200    │ 1234          │
│ 10:30:46  │ 203.248.252.101 │ GET /my-app/status │ 200    │ 567           │
│ 10:30:47  │ 203.248.252.102 │ GET /my-app/config │ 200    │ 890           │
└───────────┴─────────────────┴────────────────────┴────────┴───────────────┘
```

**쉽게 이해하기**

- Nginx는 마치 건물의 안내 데스크와 같습니다
- "어떤 업무를 보러 오셨나요?" 확인하고 적절한 부서로 안내합니다
- 로그는 마치 방문자 명부와 같아서 "누가 언제 왔는지" 기록합니다

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

**상태 스냅샷 #11: Spring Boot 내부 상태**

**JVM 스레드 풀 상태**

```
Spring Boot 스레드 풀:
┌───────────┬──────────────────────┬──────────┬──────────────────┬────────────────┐
│ thread ID │ name                 │ status   │ request          │ start datetime │
├───────────┼──────────────────────┼──────────┼──────────────────┼────────────────┤
│ 1         │ main                 │ RUNNABLE │ -                │ 10:00:00       │
│ 10        │ http-nio-8080-exec-1 │ RUNNABLE │ GET /my-app/data │ 10:30:45       │
│ 11        │ http-nio-8080-exec-2 │ WAITING  │ -                │ 10:30:46       │
│ 12        │ http-nio-8080-exec-3 │ WAITING  │ -                │ 10:30:47       │
└───────────┴──────────────────────┴──────────┴──────────────────┴────────────────┘
```

**Spring MVC URL 매핑 테이블**

```
DispatcherServlet URL 매핑:
┌────────────────┬─────────────┬──────────────────┬─────────────┬───────┐
│ URL pattern    │ HTTP method │ controller       │ method      │ order │
├────────────────┼─────────────┼──────────────────┼─────────────┼───────┤
│ /my-app/data   │ GET         │ DataController   │ getData()   │ 1     │
│ /my-app/status │ GET         │ StatusController │ getStatus() │ 1     │
│ /my-app/config │ GET         │ ConfigController │ getConfig() │ 1     │
│ /health        │ GET         │ HealthController │ getHealth() │ 2     │
└────────────────┴─────────────┴──────────────────┴─────────────┴───────┘
```

**Spring Boot 요청 처리 상태**

```
요청 처리 상태:
┌────────────┬────────────┬────────────────────┬──────────────────────┬──────────┐
│ request ID │ client IP  │ request URI        │ process step         │ duration │
├────────────┼────────────┼────────────────────┼──────────────────────┼──────────┤
│ req-001    │ 10.244.1.5 │ GET /my-app/data   │ controller execution │ 50ms     │
│ req-002    │ 10.244.1.6 │ GET /my-app/status │ service call         │ 30ms     │
│ req-003    │ 10.244.1.7 │ GET /my-app/config │ DB query             │ 100ms    │
└────────────┴────────────┴────────────────────┴──────────────────────┴──────────┘
```

**Spring Boot 로그 엔트리**

```
Spring Boot 애플리케이션 로그:
┌──────────────┬───────────┬────────────────┬───────────────────────────────────┬────────────┐
│ timestamp    │ log level │ class          │ message                           │ request ID │
├──────────────┼───────────┼────────────────┼───────────────────────────────────┼────────────┤
│ 10:30:45.123 │ INFO      │ DataController │ GET /my-app/data request received │ req-001    │
│ 10:30:45.150 │ DEBUG     │ DataService    │ database query start              │ req-001    │
│ 10:30:45.200 │ INFO      │ DataController │ generate response complete        │ req-001    │
└──────────────┴───────────┴────────────────┴───────────────────────────────────┴────────────┘
```

**쉽게 이해하기**

- Spring Boot는 마치 실제 업무를 처리하는 부서와 같습니다
- DispatcherServlet은 마치 부서의 안내원으로, "어떤 업무인가요?" 확인합니다
- 스레드 풀은 마치 여러 직원이 동시에 업무를 처리하는 것과 같습니다
- 로그는 마치 업무 일지와 같아서 "어떤 업무를 언제 처리했는지" 기록합니다

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

**네트워크 장비별 응답 전송**

**Azure Load Balancer의 응답 전송**

- Spring Boot 서버에서 온 응답을 수신
- 원본 요청자의 IP 주소로 응답 전송
- 연결 풀에서 해당 TCP 연결 찾아서 응답

**라우터들의 응답 전송**

- Azure 백본 네트워크의 라우터들이 응답을 인터넷으로 전달
- 각 라우터가 라우팅 테이블을 확인하여 최적 경로 선택
- KT 백본 네트워크로 응답 전달

**인터넷 공유기의 응답 수신**

- KT 지역 POP에서 온 응답을 수신
- NAT 테이블을 확인하여 원래 요청한 PC로 전달
- 로컬 네트워크로 응답 전송

**스위치의 응답 전달**

- 공유기에서 온 응답을 수신
- MAC 주소 테이블을 확인하여 해당 PC로 전달
- "이 응답은 어느 PC로 가야 할까?" 결정

**로컬 PC의 응답 수신**

- 스위치에서 온 응답을 수신
- 무선 네트워크 어댑터가 802.11ac 신호를 디지털 데이터로 변환
- 네트워크 스택에서 패킷 처리 및 브라우저로 전달

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

**네트워크 장비별 쉬운 설명**

- **Azure Load Balancer**: 마치 건물 안내 데스크가 방문자에게 완성된 보고서를 전달하는 것과 같습니다
- **라우터들**: 마치 여러 우체국이 편지를 순서대로 전달하는 것과 같습니다
- **인터넷 공유기**: 마치 아파트 우체통에서 "이 편지는 어느 집으로 가야 할까?" 확인하는 것과 같습니다
- **스위치**: 마치 건물 안내원이 "이 편지는 어느 방으로 가야 할까?" 결정하는 것과 같습니다
- **로컬 PC**: 마치 편지를 받는 사람이 봉투를 뜯고 내용을 확인하는 것과 같습니다

## 10단계: 브라우저에서 응답 처리

### 10.1 브라우저 수신 처리

**상태 스냅샷 #12: 브라우저 내부 상태**

**브라우저 네트워크 스택 상태**

```
브라우저 네트워크 연결 테이블:
┌───────────────┬────────────────┬─────────────┬──────────┬─────────────┐
│ connection ID │ remote IP      │ remote port │ protocol │ status      │
├───────────────┼────────────────┼─────────────┼──────────┼─────────────┤
│ conn-001      │ 20.123.45.67   │ 443         │ HTTPS    │ ESTABLISHED │
│ conn-002      │ 142.250.191.78 │ 443         │ HTTPS    │ ESTABLISHED │
│ conn-003      │ 223.130.195.95 │ 443         │ HTTPS    │ ESTABLISHED │
└───────────────┴────────────────┴─────────────┴──────────┴─────────────┘
```

**브라우저 TLS 세션 테이블**

```
브라우저 TLS 세션:
┌────────────────┬─────────────┬──────────────────────────────┬────────────┬─────────────────┐
│ server domain  │ TLS version │ Cipher Suite                 │ session ID │ expiration time │
├────────────────┼─────────────┼──────────────────────────────┼────────────┼─────────────────┤
│ www.my-app.com │ TLS 1.3     │ TLS_AES_256_GCM_SHA384       │ 0x1234     │ 10:35:45        │
│ www.google.com │ TLS 1.3     │ TLS_CHACHA20_POLY1305_SHA256 │ 0x5678     │ 10:40:00        │
└────────────────┴─────────────┴──────────────────────────────┴────────────┴─────────────────┘
```

**브라우저 HTTP 캐시**

```
브라우저 HTTP 캐시:
┌────────────────┬─────────────┬─────────────┬──────────────┬─────────────────┐
│ URL            │ HTTP method │ status code │ cache policy │ expiration time │
├────────────────┼─────────────┼─────────────┼──────────────┼─────────────────┤
│ /my-app/data   │ GET         │ 200         │ no-cache     │ -               │
│ /my-app/status │ GET         │ 200         │ max-age=300  │ 10:35:45        │
│ /my-app/config │ GET         │ 200         │ max-age=600  │ 10:40:45        │
└────────────────┴─────────────┴─────────────┴──────────────┴─────────────────┘
```

**브라우저 JavaScript 실행 상태**

```
JavaScript 실행 컨텍스트:
┌────────────┬───────────────┬──────────┬──────────────┬────────────────┐
│ context ID │ function name │ status   │ data         │ execution time │
├────────────┼───────────────┼──────────┼──────────────┼────────────────┤
│ ctx-001    │ fetch()       │ Pending  │ /my-app/data │ 10:30:45       │
│ ctx-002    │ then()        │ Resolved │ JSON data    │ 10:30:46       │
│ ctx-003    │ updateUI()    │ Running  │ DOM update   │ 10:30:47       │
└────────────┴───────────────┴──────────┴──────────────┴────────────────┘
```

**쉽게 이해하기**

- 브라우저는 마치 편지를 받아서 처리하는 사무실과 같습니다
- TLS 세션은 마치 비밀 대화를 위한 암호와 같습니다
- HTTP 캐시는 마치 자주 쓰는 문서를 책상 위에 두는 것과 같습니다
- JavaScript는 마치 받은 데이터를 화면에 표시하는 디자이너와 같습니다

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

**라우터**: 네트워크 간의 패킷을 전달하는 장비로, 라우팅 테이블을 기반으로 최적 경로를 결정합니다. 서로 다른 네트워크 간의 통신을 중계하며, IP 주소를 사용하여 패킷의 목적지를 판단합니다.

**스위치**: 네트워크 내에서 패킷을 전달하는 장비로, MAC 주소를 기반으로 패킷을 전송합니다. 각 포트에 연결된 기기의 MAC 주소를 학습하여 해당 포트로만 패킷을 전송하며, 브로드캐스트 패킷은 모든 포트로 전송합니다.

**인터넷 공유기**: 가정이나 사무실의 여러 기기를 인터넷에 연결하는 장비로, NAT(Network Address Translation) 기능을 제공합니다. 사설 IP 주소를 공인 IP 주소로 변환하여 여러 기기가 하나의 공인 IP를 공유할 수 있게 합니다.

**네트워크 어댑터**: 컴퓨터를 네트워크에 연결하는 하드웨어로, 이더넷 카드나 무선 랜 카드가 이에 해당합니다. 디지털 데이터를 물리적 신호로 변환하여 네트워크로 전송하고, 수신한 신호를 디지털 데이터로 변환합니다.

**POP (Point of Presence)**: 인터넷 서비스 제공업체(ISP)의 네트워크 접속점으로, 사용자와 인터넷 백본을 연결합니다. 지역별로 설치되어 사용자와 ISP의 백본 네트워크를 연결하는 역할을 합니다.

**허브**: 물리 계층에서 동작하는 네트워크 장비로, 수신한 신호를 모든 포트로 전송하는 단순한 장비입니다. 충돌 도메인을 공유하여 네트워크 성능을 저하시킬 수 있으며, 현재는 스위치로 대체되어 거의 사용되지 않습니다.

**게이트웨이**: 서로 다른 네트워크 프로토콜이나 아키텍처 간의 통신을 중계하는 장비로, 라우터의 한 종류입니다. 로컬 네트워크와 인터넷을 연결하는 역할을 하며, NAT(Network Address Translation) 기능을 제공합니다.

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

### 네트워크 프로토콜 상세 용어

**ARP (Address Resolution Protocol)**: IP 주소를 MAC 주소로 변환하는 프로토콜로, 네트워크 계층의 IP 주소를 데이터 링크 계층의 MAC 주소로 매핑하는 역할을 합니다. 브로드캐스트를 통해 같은 네트워크 세그먼트 내의 모든 기기에 질의를 보내고, 해당 IP 주소를 가진 기기만 응답하여 MAC 주소를 획득합니다.

**브로드캐스트 (Broadcast)**: 네트워크 세그먼트 내의 모든 기기에게 패킷을 전송하는 방식으로, MAC 주소 FF:FF:FF:FF:FF:FF를 사용하여 모든 기기가 패킷을 수신하도록 합니다. ARP 요청이나 DHCP 요청과 같이 특정 기기를 찾을 때 사용되며, 네트워크 효율성 측면에서는 제한적으로 사용됩니다.

**체크섬 (Checksum)**: 데이터 전송 중 오류를 검출하기 위한 값으로, 전송할 데이터를 특정 알고리즘으로 계산하여 얻은 값을 패킷에 포함시킵니다. 수신측에서 같은 알고리즘으로 계산한 값과 비교하여 데이터 무결성을 확인하며, TCP, UDP, IP 헤더에서 사용됩니다.

**FCS (Frame Check Sequence)**: 이더넷 프레임의 마지막 4바이트로, CRC-32 알고리즘을 사용하여 프레임 전체의 오류를 검출합니다. 전송 중 발생한 비트 오류를 감지하여 손상된 프레임을 폐기하고, 데이터 링크 계층에서 신뢰성 있는 전송을 보장합니다.

**TTL (Time To Live)**: 패킷이 네트워크에서 살아있을 수 있는 최대 홉(라우터) 수로, 각 라우터를 통과할 때마다 1씩 감소합니다. TTL이 0이 되면 패킷이 폐기되어 무한 루프를 방지하며, traceroute 명령어에서 각 홉의 정보를 얻기 위해 사용됩니다.

### 네트워크 하드웨어 상세 용어

**스위치 (Switch)**: 데이터 링크 계층에서 동작하는 네트워크 장비로, MAC 주소 테이블을 기반으로 패킷을 전송합니다. 각 포트에 연결된 기기의 MAC 주소를 학습하여 해당 포트로만 패킷을 전송하며, 브로드캐스트 패킷은 모든 포트로 전송합니다.

**허브 (Hub)**: 물리 계층에서 동작하는 네트워크 장비로, 수신한 신호를 모든 포트로 전송하는 단순한 장비입니다. 충돌 도메인을 공유하여 네트워크 성능을 저하시킬 수 있으며, 현재는 스위치로 대체되어 거의 사용되지 않습니다.

**라우터 (Router)**: 네트워크 계층에서 동작하는 장비로, 서로 다른 네트워크 간의 패킷을 전달합니다. 라우팅 테이블을 기반으로 최적 경로를 결정하며, IP 주소를 사용하여 패킷의 목적지를 판단합니다.

**게이트웨이 (Gateway)**: 서로 다른 네트워크 프로토콜이나 아키텍처 간의 통신을 중계하는 장비로, 라우터의 한 종류입니다. 로컬 네트워크와 인터넷을 연결하는 역할을 하며, NAT(Network Address Translation) 기능을 제공합니다.

### 네트워크 주소 관련 용어

**사설 IP 주소 (Private IP Address)**: 인터넷에 직접 연결되지 않는 내부 네트워크에서 사용하는 IP 주소로, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 범위에 속합니다. NAT를 통해 공인 IP 주소로 변환되어 인터넷과 통신하며, 여러 네트워크에서 중복 사용 가능합니다.

**공인 IP 주소 (Public IP Address)**: 인터넷에서 전 세계적으로 유일한 IP 주소로, ISP에서 할당받아 사용합니다. 인터넷에 직접 연결되어 전 세계 어디서든 접근 가능하며, 유료로 할당받아 사용하는 제한된 자원입니다.

**NAT (Network Address Translation)**: 사설 IP 주소를 공인 IP 주소로 변환하는 기술로, 여러 기기가 하나의 공인 IP 주소를 공유할 수 있게 합니다. 포트 번호를 추가로 사용하여 여러 연결을 구분하며, 보안상 내부 네트워크 구조를 숨기는 효과가 있습니다.

**서브넷 마스크 (Subnet Mask)**: IP 주소의 네트워크 부분과 호스트 부분을 구분하는 32비트 값으로, 네트워크 주소를 계산하는 데 사용됩니다. 255.255.255.0과 같은 형태로 표현되며, CIDR 표기법으로 /24와 같이 표현할 수도 있습니다.

### 네트워크 프로토콜 스택 용어

**TCP/IP 스택**: 인터넷에서 사용하는 표준 네트워크 프로토콜 스택으로, TCP(전송 계층)와 IP(네트워크 계층)를 기반으로 구성됩니다. 애플리케이션 계층, 전송 계층, 네트워크 계층, 네트워크 액세스 계층으로 나뉘며, 각 계층은 독립적으로 동작하면서 하위 계층의 서비스를 사용합니다.

**소켓 (Socket)**: 네트워크 통신을 위한 프로그래밍 인터페이스로, IP 주소와 포트 번호의 조합으로 구성됩니다. TCP 소켓과 UDP 소켓으로 구분되며, 애플리케이션이 네트워크 통신을 쉽게 구현할 수 있도록 추상화된 인터페이스를 제공합니다.

**포트 번호 (Port Number)**: 컴퓨터에서 실행 중인 프로그램을 구분하는 16비트 번호로, 0부터 65535까지의 범위를 가집니다. 0-1023은 잘 알려진 포트(Well-known ports)로 시스템에서 예약되어 있으며, 1024-65535는 동적 포트로 애플리케이션이 자유롭게 사용할 수 있습니다.

### 무선 네트워크 상세 용어

**802.11**: IEEE에서 정의한 무선 근거리 통신망 표준으로, Wi-Fi의 기술적 기반이 됩니다. 802.11a, 802.11b, 802.11g, 802.11n, 802.11ac, 802.11ax 등 다양한 버전이 있으며, 각각 다른 주파수 대역과 전송 속도를 지원합니다.

**QAM (Quadrature Amplitude Modulation)**: 디지털 데이터를 아날로그 신호로 변조하는 방식으로, 진폭과 위상을 동시에 변화시켜 여러 비트를 한 번에 전송합니다. 256-QAM은 8비트(256개 상태)를 한 번에 전송하며, 더 높은 QAM은 더 많은 데이터를 전송할 수 있지만 노이즈에 민감합니다.

**채널 (Channel)**: 무선 통신에서 사용하는 주파수 대역으로, 2.4GHz 대역에서는 1-13번 채널이 사용됩니다. 인접한 채널 간에는 간섭이 발생할 수 있어 1, 6, 11번 채널을 주로 사용하며, 5GHz 대역에서는 더 많은 채널을 사용할 수 있습니다.

**SSID (Service Set Identifier)**: 무선 네트워크를 식별하는 이름으로, 최대 32자까지 설정할 수 있습니다. 같은 SSID를 가진 액세스 포인트들은 하나의 무선 네트워크를 구성하며, 클라이언트는 SSID를 통해 연결할 네트워크를 선택합니다.

### 보안 프로토콜 상세 용어

**TLS 핸드셰이크**: TLS 연결을 수립하기 위한 협상 과정으로, 클라이언트와 서버 간의 암호화 방식과 키를 결정합니다. ClientHello, ServerHello, 키 교환, Finished 메시지로 구성되며, 대칭키 암호화를 위한 공유 비밀키를 안전하게 생성합니다.

**대칭키 암호화 (Symmetric Encryption)**: 암호화와 복호화에 같은 키를 사용하는 방식으로, AES, ChaCha20 등의 알고리즘이 사용됩니다. 비대칭키 암호화보다 빠르지만 키 교환 과정이 필요하며, TLS에서는 대화 내용을 암호화하는 데 사용됩니다.

**비대칭키 암호화 (Asymmetric Encryption)**: 공개키와 개인키를 사용하는 암호화 방식으로, RSA, ECDHE 등의 알고리즘이 사용됩니다. 키 교환과 디지털 서명에 사용되며, TLS 핸드셰이크에서 대칭키를 안전하게 교환하는 데 사용됩니다.

**디지털 인증서 (Digital Certificate)**: 공개키의 소유자를 증명하는 전자 문서로, 인증 기관(CA)에서 발급합니다. 서버의 신원을 확인하고 중간자 공격을 방지하며, 브라우저에서 HTTPS 연결의 신뢰성을 판단하는 기준이 됩니다.
