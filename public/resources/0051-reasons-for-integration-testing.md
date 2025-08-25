# 개요

단위 테스트만으로는 시스템이 전체적으로 잘 동작하는지 확신할 수 없다. 비즈니스 로직을 외부와 단절된 상태로 확인하는 것만으로는 충분하지 않다. 실제로는 데이터베이스, 외부 API, 파일 시스템 등과 연결되어 동작하기 때문이다. 이 글은 통합 테스트의 필요성과 올바른 사용법을 정리했다.

# 통합 테스트란 무엇인가?

통합 테스트는 단위 테스트가 아닌 모든 테스트를 의미한다. 단위 테스트가 다음 세 가지 요구사항을 모두 충족한다면, 그렇지 않은 테스트는 통합 테스트 범주에 속한다.

- 단일 동작 단위를 검증하고
- 빠르게 수행하고
- 다른 테스트와 별도로 처리한다

통합 테스트는 주로 시스템이 외부 시스템과 어떻게 연결되어 작동하는지를 검증한다. 즉, 여러 컴포넌트가 함께 동작하는 부분을 다룬다. 예를 들어, 주문 처리 시스템에서 주문 데이터가 데이터베이스에 저장되고, 결제 시스템과 연동되며, 이메일 알림이 발송되는 전체 흐름을 검증하는 것이다.

## 테스트 피라미드에서의 위치

|                 | 협력자 수 ↓      | 협력자 수 ↑     |
|-----------------|--------------|-------------|
| 복잡도 및 도메인 유의성 ↑ | 도메인 모델과 알고리즘 | 지나치게 복잡한 코드 |
| 복잡도 및 도메인 유의성 ↓ | 간단한 코드       | 컨트롤러        |

- **단위 테스트**: 도메인 모델과 알고리즘 (빠르고 격리됨)
- **통합 테스트**: 컨트롤러 (외부 의존성과 통합)

> 간단한 코드와 지나치게 복잡한 코드는 테스트해서는 안 된다. 여러 컴포넌트가 함께 동작하는 부분을 다루는 테스트가 단위 테스트일 수도 있지만, 대부분의 애플리케이션은 목으로 대체할 수 없는 외부 시스템(예: 데이터베이스)을 가지고 있다. 이런 경우 실제 데이터베이스와 연결해서 테스트해야 하므로 통합 테스트가 필요하다.

# 통합 테스트의 장단점

## 장점

- **회귀 방지**: 코드를 더 많이 거치므로 단위 테스트보다 우수하다. 여러 컴포넌트가 함께 동작하는 전체 흐름을 검증하기 때문에 코드 변경 시 더 많은 부분에서 문제를 발견할 수 있다.
- **리팩터링 내성**: 제품 코드와의 결합도가 낮아 우수하다. 통합 테스트는 "무엇을 하는가"에 집중하고 "어떻게 하는가"에는 덜 의존하기 때문에 내부 구현이 바뀌어도 테스트가 깨지지 않는다.

## 단점

- **느린 실행**: 외부 시스템으로 인해 속도 저하한다. 실제 데이터베이스나 외부 API를 사용하기 때문에 단위 테스트보다 훨씬 느리다.
- **높은 유지비**: 외부 시스템 운영 필요, 협력자가 많아 테스트가 복잡해진다. 테스트 환경 설정, 데이터 정리, 외부 시스템 상태 관리 등이 추가로 필요하다.

## 테스트 비율 가이드라인

일반적인 경험에 따른 규칙

- **단위 테스트**: 가능한 한 많은 비즈니스 시나리오의 예외 상황 확인. 도메인 로직의 다양한 조건과 예외 케이스를 빠르게 검증한다.
- **통합 테스트**: 주요 흐름(happy path)과 단위 테스트가 다루지 못하는 예외 상황. 실제 외부 시스템과의 통합이 필요한 부분을 검증한다.

# 빠른 실패와 통합 테스트

통합 테스트는 비즈니스 시나리오당 하나의 주요 흐름과 단위 테스트로 처리할 수 없는 모든 예외 상황을 다루는 것이 좋다. 이렇게 하면 테스트 수를 최소화하면서도 중요한 통합 지점들을 모두 검증할 수 있다.

## 빠른 실패(Fast Fail) 원칙

**빠른 실패**는 치명적인 오류를 초기에 발견해서 통합 테스트를 줄이는 효과를 제공한다. 잘못된 입력이나 상태가 들어왔을 때 즉시 예외를 던져서 더 이상 진행하지 않는 방식이다.

| 예외 상황 유형                  | 설명                                 | 테스트 방법             | 이유                                         |
|---------------------------|------------------------------------|--------------------|--------------------------------------------|
| **단위 테스트에 다룰 수 없는 예외 상황** | 외부 시스템과 실제 상호작용이 있어야만 발생하는 예외      | 통합 테스트             | Mock 객체로 재현이 불가능하고, 실제 환경에서만 발생 가능         |
| **빠른 실패로 잡히는 예외 상황**      | 잘못된 호출 시 즉시 예외를 던지고 멈추며, 데이터 손상 없음 | 단위 테스트 또는 개발 초기 실행 | 첫 실행 시 바로 버그가 드러나고, 복잡한 통합 테스트를 작성할 필요가 없음 |

> "즉시 실패하는 예외 상황"은 단위 테스트로 커버하고, 통합 테스트까지 만들 필요는 없다.

# 외부 시스템의 두 가지 유형

모든 외부 시스템은 두 가지 범주로 나뉜다.

## 관리 의존성 (Managed Dependency)

전체를 제어할 수 있는 외부 시스템이다. 애플리케이션이 이 시스템을 완전히 소유하고 관리한다.

- 애플리케이션을 통해서만 접근 가능
- 외부 환경에서 상호작용을 볼 수 없음
- 대표적인 예: 데이터베이스 (애플리케이션 전용 데이터베이스)

## 비관리 의존성 (Unmanaged Dependency)

전체를 제어할 수 없는 외부 시스템이다. 다른 애플리케이션이나 시스템과 공유되는 리소스다.

- 외부에서 상호작용을 볼 수 있음
- 대표적인 예: SMTP 서버, 메시지 버스, 공유 데이터베이스

> 관리 의존성은 실제 인스턴스를 사용하고, 비관리 의존성은 목으로 대체하라. 이렇게 하면 테스트의 안정성과 예측 가능성을 높일 수 있다.

## 관리 의존성이면서 비관리 의존성인 경우

다른 애플리케이션이 접근할 수 있는 데이터베이스가 대표적인 예시다. 이런 경우 데이터베이스의 일부 테이블은 애플리케이션 전용이고, 일부는 다른 애플리케이션과 공유된다.

```java

@Service
public class OrderService {
  private final OrderRepository orderRepository; // 관리 의존성
  private final NotificationService notificationService; // 비관리 의존성

  public void processOrder(Order order) {
    // 관리 의존성: 실제 DB 사용
    orderRepository.save(order);

    // 비관리 의존성: 목으로 대체
    notificationService.sendOrderConfirmation(order);
  }
}
```

이런 경우 다른 애플리케이션에서 볼 수 있는 테이블을 비관리 의존성으로 취급하고, 통합 테스트에서 목으로 대체한다. 애플리케이션 전용 테이블은 관리 의존성으로 취급해서 실제 데이터베이스를 사용한다.

# 통합 테스트 예제

## Spring Boot 기반 통합 테스트

```java

@SpringBootTest
@Transactional
class OrderServiceIntegrationTest {

  @Autowired
  private OrderService orderService;

  @Autowired
  private OrderRepository orderRepository;

  @MockBean
  private NotificationService notificationService; // 비관리 의존성

  @Test
  void processOrder_shouldSaveOrderAndSendNotification() {
    // Arrange
    Order order = new Order("user123", 1000.0);

    // Act
    orderService.processOrder(order);

    // Assert
    Order savedOrder = orderRepository.findById(order.getId()).orElse(null);
    assertThat(savedOrder).isNotNull();
    assertThat(savedOrder.getStatus()).isEqualTo(OrderStatus.PROCESSED);

    verify(notificationService).sendOrderConfirmation(order);
  }
}
```

## 가장 긴 주요 흐름 테스트

통합 테스트는 모든 외부 시스템을 거치는 가장 긴 주요 흐름을 다루는 것이 좋다. 이렇게 하면 실제 사용자가 경험하는 전체 시나리오를 검증할 수 있다.

```java

@SpringBootTest
@Transactional
class OrderWorkflowIntegrationTest {

  @Autowired
  private OrderService orderService;

  @Autowired
  private PaymentService paymentService;

  @Autowired
  private InventoryService inventoryService;

  @MockBean
  private EmailService emailService; // 비관리 의존성

  @Test
  void completeOrderWorkflow_shouldProcessAllSteps() {
    // Arrange
    Order order = createOrderWithItems();
    PaymentInfo paymentInfo = createPaymentInfo();

    // Act
    OrderResult result = orderService.processCompleteOrder(order, paymentInfo);

    // Assert
    assertThat(result.isSuccess()).isTrue();
    assertThat(order.getStatus()).isEqualTo(OrderStatus.COMPLETED);

    // 관리 의존성 상태 검증
    assertThat(inventoryService.getStockLevel(order.getProductId()))
      .isEqualTo(originalStock - order.getQuantity());

    // 비관리 의존성 상호작용 검증
    verify(emailService).sendOrderConfirmation(order.getCustomerEmail());
  }
}
```

# 인터페이스 사용에 대한 오해

## 잘못된 인터페이스 사용

많은 개발자가 단일 구현을 위한 인터페이스를 도입한다. 이는 "느슨한 결합"을 위한 것이라고 생각하지만, 실제로는 불필요한 복잡성을 추가한다.

```java
// 잘못된 예: 단일 구현을 위한 인터페이스
public interface IUserRepository {
  User save(User user);

  User findById(String id);
}

public class UserRepository implements IUserRepository {
  // 구현
}
```

이것은 **추상화가 아니다**. 해당 인터페이스를 구현하는 구체 클래스보다 결합도가 낮지 않다. 단순히 코드를 더 복잡하게 만들 뿐이다.

## 올바른 인터페이스 사용

```java
// 올바른 예: 비관리 의존성에만 인터페이스 사용
public interface EmailService {
  void sendEmail(String to, String subject, String content);
}

@Service
public class SmtpEmailService implements EmailService {
  // SMTP 구현
}

@Service
public class MockEmailService implements EmailService {
  // 테스트용 구현
}

// 관리 의존성은 구체 클래스 사용
@Service
public class UserService {
  private final UserRepository userRepository; // 구체 클래스
  private final EmailService emailService; // 인터페이스

  public UserService(UserRepository userRepository, EmailService emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
}
```

> 구현이 하나뿐인 인터페이스를 사용하는 타당한 이유는 목을 사용하기 위한 것뿐이다. 비관리 의존성에만 사용하고, 관리 의존성은 구체 클래스를 사용하라. 이렇게 하면 불필요한 복잡성을 피하면서도 테스트 용이성을 확보할 수 있다.

# 통합 테스트 모범 사례

## 도메인 모델 경계 명시하기

도메인 모델은 프로젝트가 해결하고자 하는 문제에 대한 도메인 지식의 모음이다. 단위 테스트는 도메인 모델과 알고리즘을 대상으로 하고, 통합 테스트는 컨트롤러를 대상으로 한다. 모든 도메인 로직이 하나의 뚜렷한 경계 안에 있고 코드베이스 여기저기에 흩어져있지 않도록 해야 한다.

### 도메인 계층과 애플리케이션 서비스 계층 분리

```java
// 도메인 계층: 순수한 비즈니스 로직만 담당
public class Order {
  private String id;
  private OrderStatus status;
  private List<OrderItem> items;

  public void process() {
    if (status == OrderStatus.PENDING) {
      applyBusinessRules();
      status = OrderStatus.PROCESSED;
    }
  }

  private void applyBusinessRules() {
    // 비즈니스 로직만 포함
    // 외부 시스템과의 통신 없음
  }
}

// 애플리케이션 서비스 계층 (컨트롤러): 오케스트레이션 담당
@Service
public class OrderService {
  private final OrderRepository orderRepository;
  private final EmailService emailService;

  public void processOrder(String orderId) {
    // 1. 도메인 객체 조회
    Order order = orderRepository.findById(orderId);

    // 2. 도메인 로직 실행 (순수한 비즈니스 로직)
    order.process();

    // 3. 외부 시스템과의 통신 (저장, 알림 등)
    orderRepository.save(order);
    emailService.sendOrderConfirmation(order.getCustomerEmail());
  }
}
```

### 도메인 모델 경계의 장점

- **테스트 용이성**: 도메인 로직은 외부 의존성 없이 단위 테스트 가능
- **재사용성**: 도메인 로직을 다른 컨텍스트에서도 재사용 가능
- **유지보수성**: 비즈니스 규칙 변경 시 한 곳만 수정하면 됨
- **이해도**: 도메인 전문가가 코드를 이해하기 쉬움

## 계층 줄이기

대부분의 백엔드 시스템에서는 다음 세 가지만 활용하면 된다. 계층이 많을수록 코드를 이해하기 어려워지고 유지보수가 복잡해진다.

- **도메인 계층**: 비즈니스 로직
- **애플리케이션 서비스 계층**: 외부 클라이언트 진입점, 도메인과 외부 시스템 조정
- **인프라 계층**: 데이터베이스 저장소, ORM 매핑, 외부 시스템 연동

## 순환 의존성 제거하기

순환 의존성은 둘 이상의 클래스가 서로를 참조하는 상황이다. 이는 코드를 이해하기 어렵게 만들고 테스트를 복잡하게 만든다.

```java
// 잘못된 예: 순환 의존성
@Service
public class OrderService {
  private final NotificationService notificationService;

  public void processOrder(Order order) {
    // 처리 후 알림
    notificationService.notifyOrderProcessed(order);
  }
}

@Service
public class NotificationService {
  private final OrderService orderService; // 순환 의존성!

  public void notifyOrderProcessed(Order order) {
    // 알림 후 주문 상태 업데이트
    orderService.updateOrderStatus(order.getId(), OrderStatus.NOTIFIED);
  }
}

// 올바른 예: 값 객체 사용
// 순환을 끊기 위해 이벤트 객체를 사용한다
@Service
public class OrderService {
  private final NotificationService notificationService;

  public void processOrder(Order order) {
    // 처리 후 이벤트 발행
    OrderProcessedEvent event = new OrderProcessedEvent(order.getId());
    notificationService.notifyOrderProcessed(event);
  }
}

@Service
public class NotificationService {
  public void notifyOrderProcessed(OrderProcessedEvent event) {
    // 이벤트 처리만 담당
  }
}
```

## 다중 실행 구절 사용 제한

테스트에서 여러 번의 실행 구절을 사용하는 것은 일반적으로 좋지 않다. 하지만 통합 테스트에서는 외부 시스템의 상태를 관리하기 위해 필요할 수 있다.

```java
// 잘못된 예: 단위 테스트에서 다중 실행
@Test
void processOrder_shouldHandleMultipleSteps() {
  Order order = new Order();

  // 첫 번째 실행
  orderService.validateOrder(order);

  // 두 번째 실행
  orderService.processOrder(order);

  // 세 번째 실행
  orderService.confirmOrder(order);

  assertThat(order.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
}

// 올바른 예: 통합 테스트에서만 다중 실행
@SpringBootTest
class OrderWorkflowIntegrationTest {
  @Test
  void completeOrderWorkflow_shouldProcessAllSteps() {
    Order order = new Order();

    // 통합 테스트에서는 다중 실행이 타당함
    orderService.processCompleteOrder(order);

    assertThat(order.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
  }
}
```

# 로깅 기능을 테스트하는 방법

## 로깅 유형 구분

로깅은 목적에 따라 두 가지로 나뉜다.

**지원 로깅(Support Logging)**: 지원 담당자나 시스템 관리자를 위한 메시지. 비즈니스 요구사항의 일부로 간주된다.
**진단 로깅(Diagnostic Logging)**: 개발자가 애플리케이션 내부 상황을 파악하기 위한 메시지. 구현 세부사항으로 간주된다.

## 로깅 테스트 원칙

```java
// 지원 로깅: 테스트 대상
@Service
public class OrderService {
  private final DomainLogger domainLogger;

  public void processOrder(Order order) {
    try {
      // 비즈니스 로직
      domainLogger.logOrderProcessed(order.getId(), order.getTotal());
    } catch (Exception e) {
      domainLogger.logOrderProcessingFailed(order.getId(), e.getMessage());
      throw e;
    }
  }
}

// 진단 로깅: 테스트하지 않음
@Service
public class OrderService {
  private final Logger logger = LoggerFactory.getLogger(OrderService.class);

  public void processOrder(Order order) {
    logger.debug("Processing order: {}", order.getId()); // 테스트하지 않음
    // 비즈니스 로직
  }
}
```

> 지원 로깅은 비즈니스 요구사항이므로 테스트하고, 진단 로깅은 구현 세부사항이므로 테스트하지 않는다. 이 구분을 통해 불필요한 테스트를 줄이고 중요한 로깅만 검증할 수 있다.

# 정리

통합 테스트는 단위 테스트가 아닌 모든 테스트를 의미하며, 시스템이 외부 시스템과 통합해 작동하는 방식을 검증한다. 단위 테스트가 개별 컴포넌트의 동작을 확인한다면, 통합 테스트는 여러 컴포넌트가 함께 동작하는 전체 흐름을 확인한다.

**주요 원칙**

- **관리 의존성은 실제 인스턴스를 사용하고, 비관리 의존성은 목으로 대체**: 테스트의 안정성과 예측 가능성을 높인다
- **가장 긴 주요 흐름과 단위 테스트로 처리할 수 없는 예외 상황을 다룸**: 효율적인 테스트 커버리지를 확보한다
- **빠른 실패 원칙을 활용해 통합 테스트 부담을 줄임**: 불필요한 복잡한 테스트를 피한다
- **단일 구현을 위한 인터페이스 사용을 피하고, 비관리 의존성에만 인터페이스 사용**: 불필요한 복잡성을 제거한다
- **도메인 모델 경계를 명시하고 계층을 줄이며 순환 의존성을 제거**: 코드의 이해도와 유지보수성을 높인다

통합 테스트는 회귀 방지와 리팩터링 내성이 우수하지만, 유지보수성과 피드백 속도는 단위 테스트보다 떨어진다. 따라서 테스트 피라미드를 통해 적절한 균형을 맞추는 것이 중요하다.

---

# 용어 정의

## 통합 테스트 (Integration Test)

단위 테스트가 아닌 모든 테스트를 의미하며, 시스템이 외부 시스템과 통합해 작동하는 방식을 검증한다. 단위 테스트의 세 가지 요구사항(단일 동작 검증, 빠른 수행, 격리) 중 하나라도 충족하지 못하는 테스트가 통합 테스트에 해당한다. 통합 테스트는 주로 여러 컴포넌트가 함께 동작하는 부분을 다루며, 회귀 방지와 리팩터링 내성은 우수하지만 유지보수성과 피드백 속도는 단위 테스트보다 떨어진다.

## 프로세스 외부 의존성 (Process External Dependency)

애플리케이션 프로세스 외부에 존재하는 시스템이나 서비스를 의미한다. 데이터베이스, 외부 API, 파일 시스템, 메시징 시스템 등이 해당하며, 이러한 의존성은 테스트 시 모킹이나 스텁으로 대체해야 한다. 프로세스 외부 의존성이 많을수록 테스트 복잡도가 증가하고, 관리 의존성과 비관리 의존성으로 나뉜다.

## 관리 의존성 (Managed Dependency)

전체를 제어할 수 있는 외부 시스템으로, 애플리케이션을 통해서만 접근할 수 있고 외부 환경에서 상호작용을 볼 수 없다. 대표적인 예로 데이터베이스가 있으며, 통합 테스트에서 실제 인스턴스를 사용해야 한다. 관리 의존성과의 통신은 구현 세부사항으로 간주되며, 상호작용이 아닌 최종 상태를 검증한다.

## 비관리 의존성 (Unmanaged Dependency)

전체를 제어할 수 없는 외부 시스템으로, 외부에서 상호작용을 볼 수 있다. SMTP 서버, 메시지 버스, 외부 API 등이 해당하며, 통합 테스트에서 목으로 대체해야 한다. 비관리 의존성과의 통신은 시스템의 식별할 수 있는 동작으로 간주되며, 인터페이스를 통해 추상화하는 것이 좋다.

## 빠른 실패 (Fast Fail)

치명적인 오류를 초기에 발견해서 통합 테스트를 줄이는 효과를 제공하는 원칙이다. 잘못된 호출 시 애플리케이션이 즉시 예외를 던지고 멈추며 데이터 손상이 없는 경우를 의미한다. 빠른 실패로 잡히는 예외 상황은 단위 테스트나 개발 초기 실행에서 처리하고, 복잡한 통합 테스트를 작성할 필요가 없다.

## 주요 흐름 (Happy Path)

시나리오의 성공적인 실행을 의미하며, 통합 테스트에서 다루는 핵심 대상이다. 모든 외부 시스템을 거치는 가장 긴 주요 흐름을 테스트하는 것이 좋으며, 비즈니스 시나리오의 정상적인 동작을 검증한다. 주요 흐름은 단위 테스트가 다루지 못하는 외부 시스템과의 통합 부분을 포함한다.

## 예외 상황 (Edge Case)

비즈니스 시나리오 수행 중 오류가 발생하는 경우를 의미한다. 단위 테스트로 처리할 수 없는 예외 상황은 통합 테스트에서 다루며, 외부 시스템과의 실제 상호작용이 있어야만 발생하는 예외가 해당한다. 예외 상황은 빠른 실패로 잡히는 경우와 외부 환경이 있어야만 발생하는 경우로 구분된다.

## 테스트 피라미드 (Test Pyramid)

단위 테스트, 통합 테스트, 엔드투엔드 테스트의 적절한 비율을 나타내는 개념이다. 대부분의 테스트는 빠르면서 비용이 낮은 단위 테스트여야 하고, 시스템이 전체적으로 올바른지 확인하는 통합 테스트는 속도가 느리고 비용이 많이 발생하므로 그 수가 적어야 한다. 테스트 피라미드의 모양은 프로젝트 복잡도에 따라 달라지며, 간단한 프로젝트는 단위 테스트와 통합 테스트의 개수가 동일할 수 있다.

## 순환 의존성 (Circular Dependency)

둘 이상의 클래스가 제대로 작동하고자 직간접적으로 서로 의존하는 것을 의미한다. 콜백이 대표적인 예시이며, 순환 의존성이 있으면 코드를 이해하려고 할 때 알아야 하는 부담이 커진다. 순환 의존성을 처리하는 좋은 방법은 값 객체를 도입해서 순환을 없애고, 호출부에 주는 결과를 값 객체로 반환하는 것이다.

## 지원 로깅 (Support Logging)

지원 담당자나 시스템 관리자를 위한 메시지를 생성하는 로깅 유형이다. 애플리케이션의 식별할 수 있는 동작으로 간주되며, 비즈니스 요구사항이므로 해당 요구사항을 코드베이스에 명시적으로 반영해야 한다. 지원 로깅은 외부 시스템으로 작동하는 다른 기능처럼 취급하며, 도메인 이벤트를 사용해서 도메인 모델의 변경 사항을 추적한다.

## 진단 로깅 (Diagnostic Logging)

개발자가 애플리케이션 내부에서 진행되는 작업을 이해하는 데 도움을 주는 로깅 유형이다. 구현 세부사항으로 간주되며, 테스트하지 않아야 한다. 진단 로깅은 가끔 사용해야 하며, 너무 많이 쓰면 코드를 복잡하게 하고 로그의 신호 대비 잡음 비율이 나빠진다. 이상적으로는 진단 로깅을 처리되지 않은 예외에 대해서만 사용해야 한다.

## 도메인 이벤트 (Domain Event)

애플리케이션 내에서 도메인 전문가에게 중요한 이벤트를 의미한다. 도메인 이벤트는 이미 일어난 일들을 나타내기 때문에 항상 과거 시제로 명명해야 하며, 시스템에서 발생하는 중요한 변경 사항을 외부 애플리케이션에 알리는 데 사용된다. 도메인 이벤트는 값이며 불변이고 서로 바꿔서 쓸 수 있으며, 도메인 모델의 변경 사항을 추적하는 데 활용된다.

## YAGNI (You Aren't Gonna Need It)

현재 필요하지 않은 기능에 시간을 들이지 말라는 원칙이다. 구현이 하나뿐인 인터페이스를 미리 만들어두는 것은 이 원칙을 위반하는 것으로, 향후 구현을 예상하면 YAGNI 법칙을 위배한다. 진정한 추상화는 발견되는 것이지 발명하는 것이 아니며, 의미상 추상화가 이미 존재하지만 코드에서 아직 명확하게 정의되지 않았을 때 그 이후에 발견되는 것이다.

## 식별할 수 있는 동작 (Observable Behavior)

외부에서 관찰 가능한 최종 결과로, 반환 값이나 상태 변화, 외부와의 통신 등이 포함된다. 테스트는 이를 대상으로 해야 하며, 비관리 의존성과의 통신은 식별할 수 있는 동작으로 간주된다. 식별할 수 있는 동작은 구현 세부사항과 구분되며, 테스트의 리팩터링 내성을 높이기 위해 외부 동작에만 의존해야 한다.

## 구현 세부사항 (Implementation Detail)

호출 순서, 내부 메서드 호출, 클래스 간 협력 구조 등 외부에서 관찰할 수 없는 내부 동작을 의미한다. 관리 의존성과의 통신은 구현 세부사항으로 간주되며, 테스트에서 검증하면 안 된다. 구현 세부사항을 검증하면 테스트가 코드의 내부 구조에 과도하게 결합되어 리팩터링 내성이 저하된다.
