# 개요

목(Mock)은 테스트에서 외부 의존성을 대체하고 상호작용을 검증하는 강력한 도구이지만, 잘못 사용하면 테스트의 취약성을 증가시키고 유지보수를 어렵게 만든다. 올바른 목 사용은 회귀 방지와 리팩터링 내성의 균형을 맞춰 테스트의 품질을 크게 향상시킬 수 있다.

# 목의 가치를 극대화하기

## 시스템 경계에서 상호작용 검증하기

목의 가치를 극대화하려면 시스템 경계(application boundary)에서만 상호작용을 검증해야 한다. 시스템 경계는 애플리케이션과 외부 세계가 만나는 지점으로, 컨트롤러와 비관리 의존성의 연결 지점이다.

### 시스템 경계에서 mocking 해야 하는 이유

- **회귀 방지**: 통합 테스트가 더 많은 코드를 검증할 수 있다.
- **리팩터링 내성**: 코드의 구현 세부사항에서 목을 분리할 수 있다.
- **테스트 안정성**: 외부 의존성의 변경에 덜 민감하다.

### 잘못된 예: 중간 계층 mocking

```java
// 중간 계층을 목으로 처리
public class OrderService {
  private OrderValidator validator; // 목으로 처리하면 안 됨
  private OrderCalculator calculator; // 목으로 처리하면 안 됨
  private OrderRepository repository; // 목으로 처리 가능 (시스템 경계)

  public void processOrder(Order order) {
    if (validator.isValid(order)) {
      Order processedOrder = calculator.calculate(order);
      repository.save(processedOrder);
    }
  }
}

@Test
void processOrder_shouldValidateAndCalculate() {
  OrderValidator mockValidator = mock(OrderValidator.class); // X
  OrderCalculator mockCalculator = mock(OrderCalculator.class); // X

  when(mockValidator.isValid(any())).thenReturn(true);
  when(mockCalculator.calculate(any())).thenReturn(processedOrder);

  service.processOrder(order);

  verify(mockValidator).isValid(order); // 구현 세부사항에 결합
  verify(mockCalculator).calculate(order); // 구현 세부사항에 결합
}
```

이 테스트는 구현 세부사항에 강하게 결합되어, 내부 로직이 조금만 바뀌어도 테스트가 실패하기 쉽다.
**_실무에서는 도메인 계층에서는 외부 의존성을 사용하면 안되지만, 설명을 위해 만든 예시 코드 이다._**

### 올바른 예: 시스템 경계에서만 mocking

```java
// 외부 의존성만 목으로 처리
public class OrderController {
  private OrderService service; // 실제 객체 사용
  private EmailSender emailSender; // 목 (비관리 의존성)
  private OrderRepository repository; // 실제 DB 사용 (관리 의존성)

  public void processOrder(OrderRequest request) {
    Order order = service.processOrder(request);
    repository.save(order);
    emailSender.sendConfirmation(order.getCustomerEmail());
  }
}

@Test
void processOrder_shouldSaveOrderAndSendEmail() {
  EmailSender mockEmailSender = mock(EmailSender.class);
  OrderController controller = new OrderController(service, mockEmailSender, repository);

  controller.processOrder(request);

  // 시스템 경계에서의 상호작용만 검증
  verify(mockEmailSender).sendConfirmation("customer@example.com");
}
```

이 테스트는 외부 시스템과의 상호작용에만 집중하므로 리팩터링에 강하다.

### 잘못된 예시와 올바른 예시에서의 repository 의존성 비교

| 구분            | 잘못된 예          | 올바른 예           |
|---------------|----------------|-----------------|
| 테스트 계층        | 도메인 계층(단위 테스트) | 컨트롤러 계층(통합 테스트) |
| Repository 처리 | mock 으로 대체     | 실제 DB           |
| 테스트 목적        | 비즈니스 로직 검증     | 시스템 통합 검증       |

## 목을 스파이로 대체하기

스파이(Spy) 는 수동으로 작성한 목으로, 프레임워크가 생성하는 목보다 가독성이 좋고 재사용성이 높다. 시스템 경계에 있는 클래스에 대해서는 스파이가 목보다 낫다.

### 목 vs 스파이 비교

| 구분    | 목(Mock)           | 스파이(Spy) |
|-------|-------------------|----------|
| 생성 방식 | 프레임워크 (Mockito 등) | 직접 작성    |
| 유연성   | 높음                | 낮음       |
| 가독성   | 보통                | 높음       |
| 재사용성  | 낮음                | 높음       |
| 코드 크기 | 작음                | 큼        |

### 스파이 구현 예제

```java
// 수동 스파이 구현
public class EmailSenderSpy implements EmailSender {
  private List<Email> sentEmails = new ArrayList<>();
  private int sendCount = 0;

  @Override
  public void send(Email email) {
    sentEmails.add(email);
    sendCount++;
  }

  public List<Email> getSentEmails() {
    return Collections.unmodifiableList(sentEmails);
  }

  public boolean wasEmailSentTo(String recipient) {
    return sentEmails.stream()
      .anyMatch(email -> email.getRecipient().equals(recipient));
  }

  public int getSendCount() {
    return sendCount;
  }

  public void reset() {
    sentEmails.clear();
    sendCount = 0;
  }
}

// 사용 예
@Test
void processOrder_shouldSendConfirmationEmail() {
  EmailSenderSpy spy = new EmailSenderSpy();
  OrderService service = new OrderService(spy);

  service.processOrder(order);

  // 스파이를 통한 검증
  assertTrue(spy.wasEmailSentTo("customer@example.com"));
  assertEquals(1, spy.getSendCount());

  Email sentEmail = spy.getSentEmails().get(0);
  assertEquals("주문 확인", sentEmail.getSubject());
}
```

스파이의 장점은 검증 단계에서 코드를 재사용할 수 있어 테스트 크기가 줄고 가독성이 개선된다.

# 목 처리에 대한 모범 사례

## 비관리 의존성에만 목 적용하기

목은 비관리 의존성(unmanaged dependencies)에만 사용해야 한다. 비관리 의존성은 애플리케이션 프로세스 외부에 존재하는 시스템으로, 다른 애플리케이션이나 시스템과 공유되는 리소스다.

### 관리 의존성 vs 비관리 의존성

| 구분     | 관리 의존성 (Managed) | 비관리 의존성 (Unmanaged) |
|--------|------------------|---------------------|
| 제어 범위  | 전체 제어 가능         | 제어 불가능              |
| 접근 방식  | 애플리케이션을 통해서만     | 외부에서도 접근 가능         |
| 테스트 전략 | 실제 인스턴스 사용       | 목으로 대체              |
| 예시     | 데이터베이스           | SMTP 서버, 외부 API     |

### 올바른 목 사용 예제

```java

@Service
public class OrderService {
  private final OrderRepository orderRepository; // 관리 의존성
  private final EmailService emailService; // 비관리 의존성
  private final PaymentGateway paymentGateway; // 비관리 의존성

  public void processOrder(Order order) {
    // 관리 의존성: 실제 DB 사용
    orderRepository.save(order);

    // 비관리 의존성: 목으로 대체
    emailService.sendConfirmation(order.getCustomerEmail());
    paymentGateway.processPayment(order.getPaymentInfo());
  }
}

@SpringBootTest
class OrderServiceIntegrationTest {
  @Autowired
  private OrderRepository orderRepository; // 실제 DB 사용

  @MockBean
  private EmailService emailService; // 목으로 대체

  @MockBean
  private PaymentGateway paymentGateway; // 목으로 대체

  @Test
  void processOrder_shouldSaveOrderAndSendEmail() {
    Order order = new Order("customer@example.com", 1000.0);

    service.processOrder(order);

    // 관리 의존성 상태 검증
    Order savedOrder = orderRepository.findById(order.getId());
    assertThat(savedOrder).isNotNull();

    // 비관리 의존성 상호작용 검증
    verify(emailService).sendConfirmation("customer@example.com");
    verify(paymentGateway).processPayment(order.getPaymentInfo());
  }
}
```

## 통합 테스트에서만 목 사용하기

목은 컨트롤러 테스트(통합 테스트)에서만 사용해야 한다. 단위 테스트에서는 목을 사용하지 말아야 한다.

### 단위 테스트에서 목을 피해야 하는 이유

- **도메인 모델은 외부 의존성이 없어야 한다**: 순수한 비즈니스 로직은 외부 시스템과 분리되어야 한다.
- **실제 객체로 테스트**: 도메인 로직은 실제 객체를 사용해 테스트하는 것이 바람직하다.
- **테스트 안정성**: 목을 사용하면 테스트가 구현에 과도하게 결합될 수 있다.

### 올바른 테스트 분리

```java
// 도메인 모델: 단위 테스트 (목 사용 안 함)
public class Order {
  private double total;
  private Customer customer;

  public void applyDiscount(double rate) {
    if (customer.isPremium()) {
      total = total * (1 - rate);
    }
  }

  public double getTotal() {
    return total;
  }
}

@Test
void applyDiscount_shouldApplyDiscountForPremiumCustomer() {
  // 실제 객체 사용
  Customer premiumCustomer = new Customer(CustomerType.PREMIUM);
  Order order = new Order(1000.0, premiumCustomer);

  order.applyDiscount(0.1);

  assertEquals(900.0, order.getTotal(), 0.01);
}

// 컨트롤러: 통합 테스트 (목 사용)
@Test
void processOrder_shouldInteractWithExternalSystems() {
  EmailService mockEmailService = mock(EmailService.class);
  OrderController controller = new OrderController(service, mockEmailService);

  controller.processOrder(request);

  verify(mockEmailService).sendConfirmation(anyString());
}
```

## 목 호출 수 확인하기

목을 사용할 때는 **예상된 호출**이 있는지와 **예상치 못한 호출**이 없는지를 모두 확인해야 한다.

### 호출 검증 예제

```java

@Test
void processOrder_shouldInteractWithDependenciesOnce() {
  EmailSender mockEmailSender = mock(EmailSender.class);
  PaymentGateway mockPaymentGateway = mock(PaymentGateway.class);

  OrderService service = new OrderService(mockEmailSender, mockPaymentGateway);

  service.processOrder(order);

  // 예상된 호출 확인
  verify(mockEmailSender, times(1)).sendConfirmation("customer@example.com");
  verify(mockPaymentGateway, times(1)).processPayment(order.getPaymentInfo());

  // 예상치 못한 호출 없음 확인
  verifyNoMoreInteractions(mockEmailSender);
  verifyNoMoreInteractions(mockPaymentGateway);
}

@Test
void processOrder_shouldNotSendEmail_whenPaymentFails() {
  EmailSender mockEmailSender = mock(EmailSender.class);
  PaymentGateway mockPaymentGateway = mock(PaymentGateway.class);

  when(mockPaymentGateway.processPayment(any())).thenThrow(new PaymentException());

  assertThrows(PaymentException.class, () -> {
    service.processOrder(order);
  });

  // 결제 실패 시 이메일 발송하지 않음
  verify(mockEmailSender, never()).sendConfirmation(anyString());
}
```

## 보유 타입만 목으로 처리하기

보유 타입(Owned Types)은 우리가 작성하고 소유한 코드로, 서드파티 라이브러리가 아닌 애플리케이션 코드다. 목은 보유 타입에만 적용해야 한다.

### 보유 타입 vs 서드파티 타입

| 구분    | 보유 타입 (Owned Types) | 서드파티 타입   |
|-------|---------------------|-----------|
| 소유권   | 우리가 소유              | 외부에서 제공   |
| 변경 제어 | 우리가 제어              | 외부에서 제어   |
| 목 사용  | 가능                  | 불가능       |
| 대안    | 어댑터 패턴 적용           | 어댑터 패턴 필수 |

### Anti-corruption Layer 패턴

서드파티 라이브러리를 직접 목킹하지 말고, **Anti-corruption Layer**를 통해 보유 타입으로 래핑해야 한다.

#### 잘못된 예: 서드파티 라이브러리 직접 목킹

```java
// 서드파티 라이브러리 직접 목킹
@Test
void shouldSendEmail() {
  JavaMailSender mockMailSender = mock(JavaMailSender.class); // X

  service.sendEmail("test@example.com");

  verify(mockMailSender).send(any(MimeMessage.class));
}
```

이 방식의 문제점

- 서드파티 API 변경 시 테스트가 깨짐
- 테스트가 외부 라이브러리의 구현에 의존
- 테스트의 안정성 저하

#### 올바른 예: 어댑터 패턴 적용

```java
// 어댑터 패턴 적용
public interface EmailGateway { // 보유 타입
  void sendEmail(String to, String subject, String body);
}

public class JavaMailEmailGateway implements EmailGateway {
  private final JavaMailSender mailSender; // 서드파티

  public JavaMailEmailGateway(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  @Override
  public void sendEmail(String to, String subject, String body) {
    MimeMessage message = mailSender.createMimeMessage();
    // JavaMailSender 세부사항 처리
    try {
      MimeMessageHelper helper = new MimeMessageHelper(message);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(body);
      mailSender.send(message);
    } catch (MessagingException e) {
      throw new EmailException("Failed to send email", e);
    }
  }
}

// 테스트에서는 보유 타입만 목킹
@Test
void shouldSendEmail() {
  EmailGateway mockGateway = mock(EmailGateway.class); // O

  service.sendEmail("test@example.com");

  verify(mockGateway).sendEmail(
    eq("test@example.com"),
    eq("주문 확인"),
    contains("주문이 완료되었습니다")
  );
}
```

### 어댑터 패턴의 장점

- **테스트 안정성**: 서드파티 API 변경에 영향받지 않는다.
- **도메인 보호**: 외부 시스템의 복잡성을 내부 도메인에서 격리한다.
- **유연성**: 다른 이메일 서비스로 교체 시 어댑터만 변경한다.
- **테스트 용이성**: 보유 타입만 목킹하면 된다.

# 검증문 작성 시 주의사항

## 제품 코드에 의존하지 않기

테스트에서 검증문을 작성할 때는 제품 코드에 의존하지 않아야 한다. 별도의 리터럴과 상수 집합을 사용해야 한다.

### 동어 반복 테스트(Tautological Test) 함정

**동어 반복 테스트**는 테스트가 제품 코드와 동일한 로직을 사용하여 결과를 검증하는 경우다. 이런 테스트는 아무것도 검증하지 않고 무의미한 검증문만 있는 테스트가 된다.

#### 잘못된 예: 제품 코드에 의존한 검증

```java
public class DiscountCalculator {
  public double calculateDiscount(double price, CustomerType type) {
    if (type == CustomerType.PREMIUM) {
      return price * 0.1; // 10% 할인
    }
    return 0.0;
  }
}

// 잘못된 테스트: 제품 코드와 동일한 로직 사용
@Test
void calculateDiscount_shouldReturnCorrectDiscount() {
  DiscountCalculator calculator = new DiscountCalculator();

  double result = calculator.calculateDiscount(1000.0, CustomerType.PREMIUM);

  // X: 제품 코드와 동일한 계산 로직 사용
  double expected = 1000.0 * 0.1; // 동어 반복 지점
  assertEquals(expected, result);
}
```

이 테스트는 제품 코드의 버그를 발견하지 못한다. 계산 로직이 잘못되어도 테스트는 통과한다.

#### 올바른 예: 독립적인 검증

```java
// 올바른 테스트: 독립적인 기대값 사용
@Test
void calculateDiscount_shouldReturn10PercentForPremiumCustomer() {
  DiscountCalculator calculator = new DiscountCalculator();

  double result = calculator.calculateDiscount(1000.0, CustomerType.PREMIUM);

  // 독립적인 기대값 사용
  assertEquals(100.0, result, 0.01);
}

@Test
void calculateDiscount_shouldReturnZeroForRegularCustomer() {
  DiscountCalculator calculator = new DiscountCalculator();

  double result = calculator.calculateDiscount(1000.0, CustomerType.REGULAR);

  assertEquals(0.0, result, 0.01);
}
```

### 리터럴과 상수 복제의 필요성

테스트에서는 제품 코드와 독립적인 리터럴과 상수를 사용해야 한다.

```java
public class OrderValidator {
  private static final double MIN_ORDER_AMOUNT = 1000.0;

  public boolean isValid(Order order) {
    return order.getTotal() >= MIN_ORDER_AMOUNT;
  }
}

// 테스트에서 별도의 상수 사용
@Test
void isValid_shouldReturnFalse_whenOrderAmountIsBelowMinimum() {
  OrderValidator validator = new OrderValidator();

  // 테스트용 상수 사용 (제품 코드와 독립적)
  double testAmount = 500.0; // MIN_ORDER_AMOUNT보다 작음
  Order order = new Order(testAmount);

  assertFalse(validator.isValid(order));
}

@Test
void isValid_shouldReturnTrue_whenOrderAmountIsAboveMinimum() {
  OrderValidator validator = new OrderValidator();

  double testAmount = 1500.0; // MIN_ORDER_AMOUNT보다 큼
  Order order = new Order(testAmount);

  assertTrue(validator.isValid(order));
}
```

# 목 사용의 예외 상황

## 로깅 처리 방법

모든 비관리 의존성에 하위 호환성이 동일한 수준으로 필요한 것은 아니다. 메시지의 정확한 구조가 중요하지 않고 메시지의 존재 여부와 전달하는 정보만 검증하면 시스템 경계에서 비관리 의존성과의 상호작용을 검증하라는 지침을 무시할 수 있다. 대표적인 예가 **로깅**이다.

### 로깅 유형별 처리 방법

| 로깅 유형 | 설명             | 테스트 방법 |
|-------|----------------|--------|
| 지원 로깅 | 비즈니스 요구사항의 일부  | 테스트 대상 |
| 진단 로깅 | 개발자를 위한 내부 메시지 | 테스트 제외 |

```java
// 지원 로깅: 테스트 대상
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

// 진단 로깅: 테스트 제외
public class OrderService {
  private final Logger logger = LoggerFactory.getLogger(OrderService.class);

  public void processOrder(Order order) {
    logger.debug("Processing order: {}", order.getId()); // 테스트하지 않음
    // 비즈니스 로직
  }
}
```

## 하위 호환성이 중요하지 않은 경우

일부 비관리 의존성은 하위 호환성이 중요하지 않을 수 있다. 이런 경우에는 실용적 판단에 따라 목을 사용하지 않는 것을 고려할 수 있다.

```java
// 하위 호환성이 중요하지 않은 경우
public class AnalyticsService {
  private final AnalyticsClient analyticsClient; // 외부 분석 서비스

  public void trackEvent(String eventName, Map<String, Object> properties) {
    // 분석 데이터 전송 (실패해도 비즈니스 로직에 영향 없음)
    try {
      analyticsClient.track(eventName, properties);
    } catch (Exception e) {
      // 로깅만 하고 계속 진행
      logger.warn("Failed to track analytics event", e);
    }
  }
}

// 테스트에서는 목 사용 가능
@Test
void trackEvent_shouldSendAnalyticsData() {
  AnalyticsClient mockClient = mock(AnalyticsClient.class);
  AnalyticsService service = new AnalyticsService(mockClient);

  service.trackEvent("order_completed", properties);

  verify(mockClient).track("order_completed", properties);
}
```

# 용어 정의

## 시스템 경계 (System Edge / Application Boundary)

애플리케이션과 외부 세계가 만나는 지점으로, 컨트롤러와 비관리 의존성 사이의 마지막 연결지점을 의미한다. 목은 이 경계에서만 사용해야 하며, 중간 계층에서 목을 사용하면 테스트의 취약성이 증가한다.

## 스파이 (Spy)

수동으로 작성한 목으로, 실제 객체의 일부 동작을 유지하면서 호출된 메서드나 전달된 인자를 기록하는 테스트 대역이다. 프레임워크가 생성하는 목보다 가독성이 좋고 재사용성이 높다.

## 보유 타입 (Owned Types)

우리가 작성하고 소유한 코드로, 서드파티 라이브러리가 아닌 애플리케이션 코드를 의미한다. 목은 보유 타입에만 적용해야 하며, 서드파티 라이브러리는 어댑터 패턴을 통해 보유 타입으로 래핑해야 한다.

## 동어 반복 테스트 (Tautological Test)

테스트가 제품 코드와 동일한 로직을 사용하여 결과를 검증하는 경우를 의미한다. 이런 테스트는 아무것도 검증하지 않고 무의미한 검증문만 있는 테스트가 되어 실제 버그를 발견하지 못한다.

## Anti-corruption Layer

외부 시스템과의 상호작용을 캡슐화하여 내부 도메인 모델을 보호하는 계층이다. 서드파티 라이브러리를 직접 사용하지 않고 어댑터를 통해 래핑하여 도메인의 순수성을 유지한다.

## 비관리 의존성 (Unmanaged Dependencies)

애플리케이션 프로세스 외부에 존재하는 시스템으로, 다른 애플리케이션이나 시스템과 공유되는 리소스를 의미한다. SMTP 서버, 외부 API, 메시지 버스 등이 해당하며, 테스트 시 목으로 대체해야 한다.

## 관리 의존성 (Managed Dependencies)

애플리케이션이 전체를 제어할 수 있는 외부 시스템으로, 애플리케이션을 통해서만 접근 가능하고 외부 환경에서 상호작용을 볼 수 없다. 대표적인 예로 데이터베이스가 있으며, 테스트 시 실제 인스턴스를 사용해야 한다.
