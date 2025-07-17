# 육각형 아키텍처(Hexagonal Architecture)란?

육각형 아키텍처(Hexagonal Architecture)는 소프트웨어를 **비즈니스 로직과 외부 입출력으로 분리**하여 유연하고 테스트하기 쉬운 구조를 만들기 위한 아키텍처 패턴이다.  
이 아키텍처는 **Ports and Adapters** 아키텍처라고도 불리며, 외부 세계와의 연결(입출력)을 플러그처럼 어댑터로 연결하는 방식을 사용한다.

## 핵심 개념 요약

![0060-01](/tech-blog/resources/images/hexigonal-architecture/0060-01.png)

- **도메인(Domain)**: 핵심 비즈니스 로직. 외부 기술에 의존하지 않음.
- **애플리케이션 서비스**: 도메인 객체를 조립하고 외부와 연결.
- **포트(Port)**: 도메인과 외부를 잇는 인터페이스.
- **어댑터(Adapter)**: 포트를 구현한 외부 기술 연결부(DB, Web 등).
- **입력 어댑터**: 웹 요청, CLI 등 외부 요청을 받는 구현.
- **출력 어댑터**: DB 저장, 이메일 발송 등 외부 시스템에 명령 수행.

## 예시: 주문 시 리워드 포인트 적립하기

사용자로부터 주문 요청을 받고, 주문 금액의 10%를 포인트로 적립하는 간단한 예제를 통해 육각형 아키텍처를 스프링 프레임워크 기반으로 구성해보자.

### 프로젝트 폴더 구조 및 구성 파일

아래는 스프링 기반 육각형 아키텍처 예제를 구성한 전체 폴더와 클래스 구조이다.

![0060-02](/tech-blog/resources/images/hexigonal-architecture/0060-02.png)

```
hexagonal-order-reward/
├── src
│   ├── main
│   │   └── java/com/example/order
│   │       ├── domain
│   │       │   └── Order.java                     → 도메인 모델
│   │       ├── application
│   │       │   └── OrderApplicationService.java  → 애플리케이션 서비스
│   │       ├── adapters
│   │       │   ├── in/web
│   │       │   │   ├── OrderController.java       → 입력 어댑터
│   │       │   │   └── OrderRequest.java          → DTO
│   │       │   └── out/persistence
│   │       │       └── JdbcRewardRepository.java  → 출력 어댑터
│   │       └── ports
│   │           └── out
│   │               └── RewardRepository.java      → 출력 포트
│   └── test
│       └── java/com/example/order
│           └── OrderApplicationServiceTest.java   → 테스트 코드
```

### 도메인 모델 정의

```java
// Order.java
package com.example.order.domain;

public class Order {
  private final int totalAmount;

  public Order(int totalAmount) {
    this.totalAmount = totalAmount;
  }

  public int calculateRewardPoints() {
    return totalAmount / 10;
  }
}
```

### 출력 포트 정의 (RewardRepository)

```java
// RewardRepository.java
package com.example.order.ports.out;

public interface RewardRepository {
  void saveReward(String userId, int points);
}
```

### 출력 어댑터 구현 (JdbcRewardRepository)

```java
// JdbcRewardRepository.java
package com.example.order.adapters.out.persistence;

import com.example.order.ports.out.RewardRepository;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcRewardRepository implements RewardRepository {
  @Override
  public void saveReward(String userId, int points) {
    System.out.println("[RewardRepository] Save: userId=" + userId + ", points=" + points);
  }
}
```

### 애플리케이션 서비스 구현

```java
// OrderApplicationService.java
package com.example.order.application;

import com.example.order.domain.Order;
import com.example.order.ports.out.RewardRepository;
import org.springframework.stereotype.Service;

@Service
public class OrderApplicationService {
  private final RewardRepository rewardRepository;

  public OrderApplicationService(RewardRepository rewardRepository) {
    this.rewardRepository = rewardRepository;
  }

  public void placeOrder(String userId, int amount) {
    Order order = new Order(amount);
    int points = order.calculateRewardPoints();
    rewardRepository.saveReward(userId, points);
  }
}
```

### 입력 어댑터 구현 (OrderController)

```java
// OrderController.java
package com.example.order.adapters.in.web;

import com.example.order.application.OrderApplicationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
  private final OrderApplicationService orderService;

  public OrderController(OrderApplicationService orderService) {
    this.orderService = orderService;
  }

  @PostMapping
  public void placeOrder(@RequestBody OrderRequest request) {
    orderService.placeOrder(request.getUserId(), request.getAmount());
  }
}
```

```java
// OrderRequest.java
package com.example.order.adapters.in.web;

public class OrderRequest {
  private String userId;
  private int amount;

  public String getUserId() {
    return userId;
  }

  public int getAmount() {
    return amount;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public void setAmount(int amount) {
    this.amount = amount;
  }
}
```

### 단위 테스트 코드

```java
// OrderApplicationServiceTest.java
package com.example.order;

import com.example.order.application.OrderApplicationService;
import com.example.order.ports.out.RewardRepository;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

public class OrderApplicationServiceTest {

  @Test
  void testPlaceOrderCalculatesAndSavesReward() {
    RewardRepository mockRepo = mock(RewardRepository.class);
    OrderApplicationService service = new OrderApplicationService(mockRepo);

    service.placeOrder("user123", 200);

    verify(mockRepo).saveReward("user123", 20); // 200 / 10 = 20
  }
}
```


위와 같이 육각형 아키텍처는 책임을 분리하여 변경에 강하고 테스트가 용이한 구조를 제공한다. 실전에서는 데이터베이스, 메시지 시스템, 외부 API 등 다양한 어댑터들을 구현하여 포트를 통해 연결할 수 있다.

## 입력 포트(Input Port)를 명시적으로 정의하지 않은 이유는?

예제에서는 출력 포트(`RewardRepository`)는 인터페이스로 정의했지만, 입력 포트는 별도의 인터페이스를 만들지 않았다.  
이것은 단순한 구조에서는 흔히 있는 일이다. 하지만 아키텍처를 명확하게 유지하려면 입력 포트도 다음처럼 정의하는 것이 바람직하다.

### 이유 요약

- 입력 포트는 **"사용자가 애플리케이션에 요청할 수 있는 작업 목록"** 을 정의한다.
- 예제에서는 `OrderApplicationService`가 유즈케이스를 직접 구현했지만, 외부에서 이 구현을 알 필요는 없다.
- 입력 포트를 인터페이스로 만들면 **컨트롤러 등 외부 어댑터는 인터페이스에만 의존**하게 되어 결합도가 낮아진다.

### 구조 개선 예시

```java
// 입력 포트 정의 (UseCase)
public interface PlaceOrderUseCase {
  void placeOrder(String userId, int amount);
}
```

```java
// 실제 유즈케이스 구현
@Service
public class OrderApplicationService implements PlaceOrderUseCase {
    ...
}
```

```java
// 입력 어댑터
@RestController
public class OrderController {
  private final PlaceOrderUseCase orderUseCase;

  public OrderController(PlaceOrderUseCase orderUseCase) {
    this.orderUseCase = orderUseCase;
  }

  @PostMapping
  public void placeOrder(@RequestBody OrderRequest request) {
    orderUseCase.placeOrder(request.getUserId(), request.getAmount());
  }
}
```

### 언제 입력 포트를 명시적으로 나눠야 할까?

| 상황                            | 포트 분리 필요성         |
|-------------------------------|-------------------|
| 구조가 단순함                       | 생략해도 무방           |
| 다양한 입력 경로(API, CLI, 이벤트 등) 존재 | **반드시 분리해야 함**    |
| 테스트나 모킹이 필요한 경우               | 포트 분리로 인해 유연성이 생김 |

### 결론

입력 포트를 명확히 인터페이스로 정의하면 육각형 아키텍처의 철학인 "입출력 독립성"을 더욱 잘 구현할 수 있다.  
작은 예제에서는 생략될 수 있지만, 규모가 커질수록 유지보수성과 테스트 유연성을 높이기 위해 적용하면 얻을 수 있는 장점이 있다.
