# 개요

단위 테스트의 가치를 극대화하려면 어떤 코드를 테스트할지, 그리고 어떻게 리팩터링할지를 명확히 알아야 한다. 모든 제품 코드는 두 가지 차원으로 분류할 수 있으며, 이 분류를 통해 테스트 가치가 높은 코드를 식별하고 리팩터링 전략을 수립할 수 있다.

# 코드의 네 가지 유형

모든 제품 코드는 다음 두 차원으로 분류할 수 있다.

- **코드 복잡도(code complexity)** 또는 **도메인 유의성(domain significance)**
- **협력자 수(number of collaborators)**

## 코드 복잡도와 도메인 유의성

**코드 복잡도**는 코드 내 의사결정(분기) 지점의 수로 정의된다. 이 숫자가 클수록 복잡도는 더 높아진다. **도메인 유의성**은 코드가 프로젝트의 문제 도메인에 대해 얼마나 의미있는지를 나타낸다.

**협력자**는 가변 의존성이거나 프로세스 외부 의존성(또는 둘 다)이다. **가변 의존성**은 테스트 실행 중에 상태가 변경될 수 있는 객체나 시스템을 의미한다. 예를 들어, 데이터베이스, 파일 시스템, 공유 메모리, 싱글톤 객체 등이 해당한다. **프로세스 외부 의존성**은 애플리케이션 프로세스 외부에 존재하는 시스템이나 서비스다. 협력자가 많을수록 테스트 시 모킹이나 스텁이 더 많이 필요해진다.

## 코드 유형 분류표

|                 | 협력자 수 ↓      | 협력자 수 ↑     |
|-----------------|--------------|-------------|
| 복잡도 및 도메인 유의성 ↑ | 도메인 모델과 알고리즘 | 지나치게 복잡한 코드 |
| 복잡도 및 도메인 유의성 ↓ | 간단한 코드       | 컨트롤러        |

### 도메인 모델과 알고리즘

복잡하거나 도메인에 중요한 코드이지만 협력자가 거의 없는 유형이다. 비즈니스 규칙, 핵심 알고리즘, 도메인 로직 등이 여기에 해당한다. 단위 테스트에서 가장 가치가 높은 코드 유형이다.

### 간단한 코드

복잡도나 도메인 유의성이 낮고 협력자도 거의 없는 코드다. 매개변수가 없는 생성자, 한 줄 속성, 단순한 getter/setter 등이 예시다. 테스트할 가치가 거의 없다.

### 컨트롤러

복잡하지 않지만 협력자가 많은 코드다. 도메인 클래스와 외부 시스템 간의 조정 역할을 한다. 오케스트레이션 로직이 주를 이루며, 단위 테스트보다는 통합 테스트가 적합하다.

### 지나치게 복잡한 코드

복잡도와 도메인 유의성이 높으면서도 협력자가 많은 코드다. 덩치가 큰 컨트롤러나 여러 책임을 가진 클래스가 예시다. 이 유형의 코드는 리팩터링이 필요하다.

# 험블 객체 패턴을 사용한 리팩터링

**험블 객체 패턴(Humble Object Pattern)** 은 지나치게 복잡한 코드에서 로직을 추출해 코드를 테스트할 필요가 없도록 간단하게 만드는 기법이다. 추출된 로직은 테스트하기 어려운 의존성에서 분리된 다른 클래스로 이동한다.

## 험블 객체 패턴의 핵심 아이디어

험블 객체 패턴의 핵심은 **복잡한 로직을 테스트하기 어려운 의존성에서 분리**하는 것이다. 이 패턴을 적용하면

- **비즈니스 로직**은 순수하고 테스트하기 쉬운 클래스로 추출된다.
- **험블 객체**는 단순한 래퍼 역할만 하며, 테스트할 필요가 없다.
- **의존성 주입**을 통해 테스트 시 모킹이 가능해진다.

## 리팩터링 전후 비교

### 리팩터링 전: 지나치게 복잡한 코드

```java
public class OrderService {
  private DatabaseConnection db;
  private EmailService emailService;
  private PaymentGateway paymentGateway;

  public void processOrder(Order order) {
    // 복잡한 비즈니스 로직과 외부 의존성이 섞여 있음
    if (order.getTotal() > 1000) {
      order.applyDiscount(0.1);
    }

    if (order.getCustomer().getType() == CustomerType.PREMIUM) {
      order.setPriority(Priority.HIGH);
    }

    // 외부 의존성 호출
    db.save(order);
    emailService.sendConfirmation(order.getCustomer().getEmail());
    paymentGateway.processPayment(order.getPaymentInfo());
  }
}
```

이 코드는 비즈니스 로직(할인 적용, 우선순위 설정)과 외부 의존성(DB, 이메일, 결제)이 섞여 있어 테스트하기 어렵다.

### 리팩터링 후: 험블 객체 패턴 적용

```java
// 비즈니스 로직을 담당하는 순수한 클래스
public class OrderProcessor {
  public Order processOrder(Order order) {
    if (order.getTotal() > 1000) {
      order.applyDiscount(0.1);
    }

    if (order.getCustomer().getType() == CustomerType.PREMIUM) {
      order.setPriority(Priority.HIGH);
    }

    return order;
  }
}

// 험블 객체: 단순한 오케스트레이션만 담당
public class OrderService {
  private final OrderProcessor orderProcessor;
  private final OrderRepository orderRepository;
  private final EmailService emailService;
  private final PaymentGateway paymentGateway;

  public OrderService(OrderProcessor orderProcessor,
                      OrderRepository orderRepository,
                      EmailService emailService,
                      PaymentGateway paymentGateway) {
    this.orderProcessor = orderProcessor;
    this.orderRepository = orderRepository;
    this.emailService = emailService;
    this.paymentGateway = paymentGateway;
  }

  public void processOrder(Order order) {
    // 비즈니스 로직 위임
    Order processedOrder = orderProcessor.processOrder(order);

    // 외부 의존성 호출만 담당
    orderRepository.save(processedOrder);
    emailService.sendConfirmation(processedOrder.getCustomer().getEmail());
    paymentGateway.processPayment(processedOrder.getPaymentInfo());
  }
}
```

## 험블 객체 패턴의 장점

1. **테스트 용이성**: `OrderProcessor`는 순수한 비즈니스 로직만 담당하므로 단위 테스트가 쉽다.
2. **관심사 분리**: 비즈니스 로직과 인프라 로직이 명확히 분리된다.
3. **의존성 주입**: 테스트 시 모든 외부 의존성을 모킹할 수 있다.
4. **단일 책임**: 각 클래스가 하나의 명확한 책임만 가진다.

## 테스트 예시

```java

@Test
void processOrder_shouldApplyDiscount_whenTotalExceeds1000() {
  // Arrange
  OrderProcessor processor = new OrderProcessor();
  Order order = new Order(1200.0, CustomerType.REGULAR);

  // Act
  Order result = processor.processOrder(order);

  // Assert
  assertEquals(1080.0, result.getTotal(), 0.01); // 10% 할인 적용
}

@Test
void processOrder_shouldSetHighPriority_whenCustomerIsPremium() {
  // Arrange
  OrderProcessor processor = new OrderProcessor();
  Order order = new Order(500.0, CustomerType.PREMIUM);

  // Act
  Order result = processor.processOrder(order);

  // Assert
  assertEquals(Priority.HIGH, result.getPriority());
}
```

`OrderService`는 단순한 오케스트레이션만 담당하므로 통합 테스트로 충분하고, `OrderProcessor`는 순수한 비즈니스 로직이므로 단위 테스트로 빠르고 안정적으로 검증할 수 있다.

## 육각형 아키텍처와 함수형 아키텍처

육각형 아키텍처와 함수형 아키텍처는 모두 험블 객체 패턴을 구현한다.

- **육각형 아키텍처**: 도메인 계층(도메인 모델과 알고리즘)과 애플리케이션 서비스 계층(컨트롤러)으로 분리
- **함수형 아키텍처**: 함수형 코어(도메인 모델과 알고리즘)와 가변 셸(컨트롤러)로 분리

이러한 아키텍처는 비즈니스 로직과 프로세스 외부 의존성 간의 통신을 분리하여 테스트 용이성을 높인다.

# 가치 있는 단위 테스트를 위한 리팩터링

## 고객 관리 시스템 사례

명시적인 의존성과 암시적인 의존성을 구분하고, 도메인 유의성이 높은 코드에서 프로세스 외부 협력자를 사용하지 않도록 하는 것이 핵심이다.

### 명시적 의존성 vs 암시적 의존성

**명시적 의존성(Explicit Dependency)** 은 생성자나 메서드 매개변수를 통해 명확하게 드러나는 의존성이다. 의존성 주입을 통해 테스트 시 모킹이 쉽고, 코드의 의존성을 한눈에 파악할 수 있다.

**암시적 의존성(Implicit Dependency)** 은 코드 내부에서 직접 생성하거나 정적 메서드를 통해 접근하는 의존성이다. 테스트 시 제어하기 어렵고, 코드의 의존성을 파악하기 어려워 테스트와 유지보수를 어렵게 만든다.

#### 명시적 의존성 예시

```java
public class CustomerService {
  private final CustomerRepository customerRepository;
  private final EmailService emailService;

  // 생성자를 통한 명시적 의존성 주입
  public CustomerService(CustomerRepository customerRepository,
                         EmailService emailService) {
    this.customerRepository = customerRepository;
    this.emailService = emailService;
  }

  public void registerCustomer(Customer customer) {
    customerRepository.save(customer);
    emailService.sendWelcomeEmail(customer.getEmail());
  }
}
```

#### 암시적 의존성 예시

```java
public class CustomerService {
  public void registerCustomer(Customer customer) {
    // 암시적 의존성: 직접 생성
    CustomerRepository customerRepository = new DatabaseCustomerRepository();
    customerRepository.save(customer);

    // 암시적 의존성: 정적 메서드 호출
    EmailService.sendWelcomeEmail(customer.getEmail());

    // 암시적 의존성: 싱글톤 패턴
    Logger.getInstance().log("Customer registered: " + customer.getId());
  }
}
```

#### 암시적 의존성의 문제점

- **테스트 어려움**: 의존성을 모킹할 수 없어 단위 테스트가 어렵다.
- **결합도 증가**: 구체적인 구현체에 직접 의존하여 유연성이 떨어진다.
- **의존성 파악 어려움**: 코드를 읽어야만 어떤 의존성이 있는지 알 수 있다.
- **설정 복잡성**: 각 의존성마다 별도의 설정이 필요하다.

#### 명시적 의존성의 장점

- **테스트 용이성**: 의존성 주입을 통해 모킹이 쉽다.
- **결합도 감소**: 인터페이스에 의존하여 유연성이 높다.
- **의존성 명확성**: 생성자나 메서드 시그니처만 봐도 의존성을 파악할 수 있다.
- **설정 단순성**: 의존성 주입 컨테이너를 통해 중앙 집중식 관리가 가능하다.

### 1단계: 암시적 의존성을 명시적으로 만들기

도메인 모델은 직접적으로든 간접적으로든 프로세스 외부 협력자에게 의존하지 않는 것이 깔끔하다. 도메인 모델은 외부 시스템과의 통신을 책임지지 않아야 한다.

### 2단계: 애플리케이션 서비스 계층 도입

도메인 모델이 외부 시스템과 직접 통신하는 문제를 해결하기 위해 험블 컨트롤러(humble controller)로 책임을 옮긴다. 일반적으로 도메인 클래스는 다른 도메인 클래스나 단순 값과 같은 프로세스 내부 의존성에만 의존해야 한다.

### 3단계: 애플리케이션 서비스 복잡도 낮추기

재구성 로직(Reconstitution Logic)이 단순해 보이더라도 실제로는 내부적으로 많은 분기가 숨어 있어서 테스트할 가치가 있다.

### 4단계: 새 Company 클래스 소개

Tell Don't Ask 원칙을 적용하여 객체가 스스로 상태를 관리하도록 한다.

#### Tell Don't Ask 원칙이란?

**Tell Don't Ask 원칙**은 객체의 상태를 조회한 후 그 결과에 따라 결정을 내리는 것보다, 객체에게 직접 작업을 수행하도록 요청하는 것이 좋다는 원칙이다. 이 원칙을 따르면 객체가 스스로 상태를 관리하고 캡슐화가 향상되어 테스트와 유지보수가 쉬워진다.

#### Tell Don't Ask 원칙 위반 예시

```java
public class OrderService {
  public void processOrder(Order order) {
    // Ask: 객체의 상태를 조회
    if (order.getStatus() == OrderStatus.PENDING) {
      // Ask: 또 다른 상태를 조회
      if (order.getTotal() > 1000) {
        // Tell: 객체에게 직접 작업 요청
        order.applyDiscount(0.1);
      }

      // Ask: 상태를 조회한 후 결정
      if (order.getCustomer().getType() == CustomerType.PREMIUM) {
        order.setPriority(Priority.HIGH);
      }
    }
  }
}
```

이 코드는 객체의 상태를 여러 번 조회한 후 그 결과에 따라 결정을 내리고 있다. 이는 다음과 같은 문제를 야기한다.

- **캡슐화 위반**: 객체의 내부 상태를 외부에서 직접 조회
- **결합도 증가**: 외부에서 객체의 내부 구조를 알아야 함
- **테스트 어려움**: 여러 조건을 모두 고려해야 함

#### Tell Don't Ask 원칙 적용 예시

```java
public class Order {
  private OrderStatus status;
  private double total;
  private Customer customer;
  private Priority priority;

  public void process() {
    if (status == OrderStatus.PENDING) {
      applyBusinessRules();
      status = OrderStatus.PROCESSED;
    }
  }

  private void applyBusinessRules() {
    // 객체가 스스로 비즈니스 규칙을 적용
    if (total > 1000) {
      applyDiscount(0.1);
    }

    if (customer.getType() == CustomerType.PREMIUM) {
      setPriority(Priority.HIGH);
    }
  }

  private void applyDiscount(double rate) {
    total = total * (1 - rate);
  }

  private void setPriority(Priority newPriority) {
    this.priority = newPriority;
  }
}

public class OrderService {
  public void processOrder(Order order) {
    // Tell: 객체에게 직접 작업 요청
    order.process();
  }
}
```

#### Tell Don't Ask 원칙의 장점

1. **캡슐화 향상**: 객체의 내부 상태와 로직이 외부로부터 숨겨짐
2. **결합도 감소**: 외부에서 객체의 내부 구조를 알 필요가 없음
3. **테스트 용이성**: 객체의 행위를 검증하는 단순한 테스트 작성 가능
4. **유지보수성**: 비즈니스 규칙 변경 시 한 곳만 수정하면 됨
5. **단일 책임**: 객체가 자신의 상태 관리에 대한 책임을 가짐

#### 테스트 예시

```java

@Test
void process_shouldApplyDiscountAndSetHighPriority_whenOrderMeetsConditions() {
  // Arrange
  Customer premiumCustomer = new Customer(CustomerType.PREMIUM);
  Order order = new Order(1200.0, premiumCustomer, OrderStatus.PENDING);

  // Act
  order.process();

  // Assert
  assertEquals(1080.0, order.getTotal(), 0.01); // 10% 할인 적용
  assertEquals(Priority.HIGH, order.getPriority()); // 프리미엄 고객 우선순위
  assertEquals(OrderStatus.PROCESSED, order.getStatus()); // 상태 변경
}
```

이제 `OrderService`는 단순히 `order.process()`만 호출하면 되고, 모든 비즈니스 로직은 `Order` 객체 내부에서 처리된다. 이는 객체지향 설계의 핵심 원칙인 **캡슐화**와 **단일 책임 원칙**을 잘 따르는 예시다.

# 최적의 단위 테스트 커버리지 분석

비즈니스 로직과 오케스트레이션을 완전히 분리하면 코드베이스의 어느 부분을 단위 테스트로 할지 쉽게 결정할 수 있다.

## 도메인 계층과 유틸리티 코드 테스트하기

코드의 복잡도나 도메인 유의성이 높으면 회귀 방지가 뛰어나고 협력자가 거의 없어 유지비도 가장 낮다. 이는 단위 테스트에서 가장 가치 있는 대상이다.

## 나머지 세 사분면에 대한 코드 테스트하기

- **간단한 코드**: 너무 단순한 코드(예: 생성자) → 단위 테스트 불필요
- **지나치게 복잡한 코드**: 원래 복잡했지만 리팩터링으로 제거됨 → 테스트할 코드 없음
- **컨트롤러**: 컨트롤러 계층 → 단위 테스트보다 통합 테스트가 적합

## 전제 조건을 테스트해야 하는가?

일반적으로 권장하는 지침은 도메인 유의성이 있는 모든 전제 조건을 테스트하라는 것이다.

### 전제 조건(Precondition)이란?

**전제 조건**은 메서드나 함수가 올바르게 동작하기 위해 만족되어야 하는 조건이나 제약사항을 의미한다. 전제 조건은 메서드 실행 전에 검증되어야 하며, 위반 시 예외를 발생시키거나 오류를 반환한다.

전제 조건은 다음과 같은 형태로 나타날 수 있다:

1. **매개변수 검증**: null 체크, 범위 검증, 형식 검증
2. **객체 상태 검증**: 객체가 특정 상태에 있어야 함
3. **비즈니스 규칙 검증**: 도메인 규칙에 따른 제약사항
4. **시스템 상태 검증**: 외부 시스템이나 리소스의 상태

#### 전제 조건 예시

```java
public class BankAccount {
  private double balance;
  private AccountStatus status;

  public void withdraw(double amount) {
    // 전제 조건 1: 매개변수 검증
    if (amount <= 0) {
      throw new IllegalArgumentException("출금 금액은 0보다 커야 합니다.");
    }

    // 전제 조건 2: 객체 상태 검증
    if (status != AccountStatus.ACTIVE) {
      throw new IllegalStateException("활성화된 계좌만 출금할 수 있습니다.");
    }

    // 전제 조건 3: 비즈니스 규칙 검증
    if (amount > balance) {
      throw new InsufficientFundsException("잔액이 부족합니다.");
    }

    // 메서드의 실제 로직
    balance -= amount;
  }

  public void transfer(BankAccount target, double amount) {
    // 전제 조건 4: 매개변수 null 체크
    if (target == null) {
      throw new IllegalArgumentException("대상 계좌는 null일 수 없습니다.");
    }

    // 전제 조건 5: 자기 자신에게 이체 방지
    if (target == this) {
      throw new IllegalArgumentException("자기 자신에게는 이체할 수 없습니다.");
    }

    // 전제 조건 6: 대상 계좌 상태 검증
    if (target.status != AccountStatus.ACTIVE) {
      throw new IllegalStateException("대상 계좌가 활성화되지 않았습니다.");
    }

    // 실제 이체 로직
    withdraw(amount);
    target.deposit(amount);
  }
}
```

#### 전제 조건의 유형별 분류

**도메인 유의성이 있는 전제 조건:**

- 비즈니스 규칙과 직접 연결된 조건
- 도메인 전문가가 이해할 수 있는 개념
- 위반 시 비즈니스적으로 큰 문제가 됨

```java
// 도메인 유의성이 있는 전제 조건
if(amount >balance){
  throw new

InsufficientFundsException("잔액이 부족합니다.");
}

  if(target ==this){
  throw new

IllegalArgumentException("자기 자신에게는 이체할 수 없습니다.");
}
```

**기술적 전제 조건:**

- 단순한 방어 로직이나 기술적 안전장치
- 비즈니스 규칙과 무관한 기술적 제약
- 예외 발생으로 충분히 처리 가능

```java
// 기술적 전제 조건
if(amount <=0){
  throw new

IllegalArgumentException("출금 금액은 0보다 커야 합니다.");
}

  if(target ==null){
  throw new

IllegalArgumentException("대상 계좌는 null일 수 없습니다.");
}
```

#### 전제 조건 테스트 예시

```java

@Test
void withdraw_shouldThrowException_whenAmountExceedsBalance() {
  // Arrange
  BankAccount account = new BankAccount(1000.0);

  // Act & Assert
  assertThrows(InsufficientFundsException.class, () -> {
    account.withdraw(1500.0);
  });
}

@Test
void transfer_shouldThrowException_whenTransferringToSelf() {
  // Arrange
  BankAccount account = new BankAccount(1000.0);

  // Act & Assert
  assertThrows(IllegalArgumentException.class, () -> {
    account.transfer(account, 100.0);
  });
}

@Test
void withdraw_shouldThrowException_whenAmountIsNegative() {
  // Arrange
  BankAccount account = new BankAccount(1000.0);

  // Act & Assert
  assertThrows(IllegalArgumentException.class, () -> {
    account.withdraw(-100.0);
  });
}
```

#### 전제 조건 테스트의 중요성

1. **회귀 방지**: 전제 조건이 변경되거나 누락되는 것을 방지
2. **문서화**: 코드를 읽는 사람에게 메서드의 요구사항을 명확히 전달
3. **안정성**: 예상치 못한 입력이나 상태에 대한 방어
4. **유지보수성**: 전제 조건 변경 시 테스트를 통해 영향 범위 파악 가능

전제 조건은 메서드의 안전성과 신뢰성을 보장하는 중요한 요소이므로, 특히 도메인 유의성이 있는 전제 조건은 반드시 테스트해야 한다.

**테스트해야 할 전제 조건**

- 도메인 규칙과 직접 연결
- 불변성(Invariant)을 보장
- 위반 시 비즈니스적으로 큰 문제가 됨

**테스트하지 않아도 되는 전제 조건**

- 단순 방어 로직, 기술적 안전장치
- 비즈니스 규칙과 무관
- 예외 발생으로 충분히 처리 가능

# 컨트롤러에서 조건부 로직 처리

비즈니스 로직과 오케스트레이션의 분리는 다음과 같이 비즈니스 연산이 세 단계로 있을 때 가장 효과적이다:

- **저장소에서 데이터 검색**: 데이터베이스나 외부 시스템에서 현재 상태를 읽어온다
- **비즈니스 로직 실행**: 가져온 데이터를 바탕으로 규칙과 제약 조건을 검증하고 계산을 수행한다
- **데이터를 다시 저장소에 저장**: 변경된 결과를 저장한다

## 세 가지 특성의 균형

비즈니스 연산 중에 프로세스 외부 의존성을 참조해야 하는 경우, 다음 세 가지 특성 중 최대 두 가지만 가질 수 있다

- **도메인 모델 테스트 유의성**: 도메인 클래스의 협력자 수와 유형에 따른 함수
- **컨트롤러 단순성**: 의사 결정(분기) 지점이 있는지에 따라 다름
- **성능**: 프로세스 외부 의존성에 대한 호출 수로 정의

| 전략               | 도메인 모델 테스트 유의성 | 컨트롤러 단순성 | 성능 |
|------------------|----------------|----------|----|
| 외부 접근 가장자리로 밀어내기 | 높음             | 높음       | 낮음 |
| 도메인에 외부 의존성 주입   | 낮음             | 높음       | 높음 |
| 프로세스 세분화         | 중간             | 낮음       | 높음 |

대부분의 소프트웨어 프로젝트에서는 성능이 매우 중요하기 때문에 '외부에 대한 읽기 쓰기를 비즈니스 연산 가장자리로 밀어내기'는 고려할 필요가 없다. '도메인 모델에 프로세스 외부 의존성 주입하기'는 대부분 코드를 지나치게 복잡한 사분면에 넣으므로 피하는 것이 좋다. 따라서 '의사 결정 프로세스 단계를 더 세분화하기'가 가장 효과적인 절충안이다.

## CanExecute/Execute 패턴

컨트롤러 복잡도가 커지는 것을 완화하는 첫 번째 방법은 CanExecute/Execute 패턴을 사용해 비즈니스 로직이 도메인 모델에서 컨트롤러로 유출되는 것을 방지하는 것이다.

### CanExecute/Execute 패턴이란?

**CanExecute/Execute 패턴**은 각 do() 메서드에 대해 CanDo()를 두고, CanDo()가 성공적으로 실행되는 것을 Do()의 전제 조건으로 하는 패턴이다. 이 패턴은 Do() 전에 CanDo()를 호출하지 않을 수 없기 때문에 컨트롤러의 의사 결정을 근본적으로 제거한다.

### 패턴의 핵심 아이디어

- **CanExecute**: 작업을 수행할 수 있는지 검증하는 메서드
- **Execute**: 실제 작업을 수행하는 메서드
- **강제 호출**: Execute 전에 반드시 CanExecute를 호출해야 함
- **의사 결정 제거**: 컨트롤러에서 복잡한 조건부 로직 제거

### CanExecute/Execute 패턴 적용 예시

#### 리팩터링 전: 복잡한 컨트롤러

```java
public class OrderController {
  private final OrderService orderService;
  private final InventoryService inventoryService;
  private final PaymentService paymentService;

  public void placeOrder(OrderRequest request) {
    // 복잡한 조건부 로직이 컨트롤러에 집중
    if (!inventoryService.hasStock(request.getProductId(), request.getQuantity())) {
      throw new InsufficientStockException("재고가 부족합니다.");
    }

    if (!paymentService.canProcessPayment(request.getPaymentInfo())) {
      throw new PaymentProcessingException("결제를 처리할 수 없습니다.");
    }

    if (orderService.hasActiveOrder(request.getCustomerId())) {
      throw new DuplicateOrderException("이미 진행 중인 주문이 있습니다.");
    }

    // 실제 주문 처리
    orderService.createOrder(request);
    inventoryService.reserveStock(request.getProductId(), request.getQuantity());
    paymentService.processPayment(request.getPaymentInfo());
  }
}
```

#### 리팩터링 후: CanExecute/Execute 패턴 적용

```java
// 도메인 모델: 비즈니스 로직을 담당
public class OrderProcessor {
  private final InventoryService inventoryService;
  private final PaymentService paymentService;
  private final OrderService orderService;

  public OrderProcessor(InventoryService inventoryService,
                        PaymentService paymentService,
                        OrderService orderService) {
    this.inventoryService = inventoryService;
    this.paymentService = paymentService;
    this.orderService = orderService;
  }

  // CanExecute: 주문을 수행할 수 있는지 검증
  public OrderValidationResult canPlaceOrder(OrderRequest request) {
    List<String> errors = new ArrayList<>();

    if (!inventoryService.hasStock(request.getProductId(), request.getQuantity())) {
      errors.add("재고가 부족합니다.");
    }

    if (!paymentService.canProcessPayment(request.getPaymentInfo())) {
      errors.add("결제를 처리할 수 없습니다.");
    }

    if (orderService.hasActiveOrder(request.getCustomerId())) {
      errors.add("이미 진행 중인 주문이 있습니다.");
    }

    return new OrderValidationResult(errors.isEmpty(), errors);
  }

  // Execute: 실제 주문 처리
  public void placeOrder(OrderRequest request) {
    // CanExecute 결과를 검증
    OrderValidationResult validation = canPlaceOrder(request);
    if (!validation.isValid()) {
      throw new OrderValidationException(validation.getErrors());
    }

    // 실제 주문 처리 로직
    orderService.createOrder(request);
    inventoryService.reserveStock(request.getProductId(), request.getQuantity());
    paymentService.processPayment(request.getPaymentInfo());
  }
}

// 검증 결과를 담는 값 객체
public class OrderValidationResult {
  private final boolean valid;
  private final List<String> errors;

  public OrderValidationResult(boolean valid, List<String> errors) {
    this.valid = valid;
    this.errors = new ArrayList<>(errors);
  }

  public boolean isValid() {
    return valid;
  }

  public List<String> getErrors() {
    return Collections.unmodifiableList(errors);
  }
}

// 험블 컨트롤러: 단순한 오케스트레이션만 담당
public class OrderController {
  private final OrderProcessor orderProcessor;

  public OrderController(OrderProcessor orderProcessor) {
    this.orderProcessor = orderProcessor;
  }

  public void placeOrder(OrderRequest request) {
    // 단순히 도메인 모델에 위임
    orderProcessor.placeOrder(request);
  }

  // UI에서 사전 검증이 필요한 경우
  public OrderValidationResult validateOrder(OrderRequest request) {
    return orderProcessor.canPlaceOrder(request);
  }
}
```

### CanExecute/Execute 패턴의 장점

- **컨트롤러 단순화**: 복잡한 조건부 로직이 도메인 모델로 이동
- **비즈니스 로직 응집**: 검증과 실행 로직이 한 곳에 집중
- **재사용성**: CanExecute를 UI에서 사전 검증으로 활용 가능
- **테스트 용이성**: 도메인 모델의 검증 로직을 독립적으로 테스트 가능
- **일관성 보장**: Execute 전에 반드시 CanExecute가 호출됨

### 테스트 예시

```java

@Test
void canPlaceOrder_shouldReturnInvalid_whenInsufficientStock() {
  // Arrange
  OrderRequest request = new OrderRequest("product1", 10, "customer1", paymentInfo);
  when(inventoryService.hasStock("product1", 10)).thenReturn(false);

  OrderProcessor processor = new OrderProcessor(inventoryService, paymentService, orderService);

  // Act
  OrderValidationResult result = processor.canPlaceOrder(request);

  // Assert
  assertFalse(result.isValid());
  assertTrue(result.getErrors().contains("재고가 부족합니다."));
}

@Test
void placeOrder_shouldThrowException_whenValidationFails() {
  // Arrange
  OrderRequest request = new OrderRequest("product1", 10, "customer1", paymentInfo);
  when(inventoryService.hasStock("product1", 10)).thenReturn(false);

  OrderProcessor processor = new OrderProcessor(inventoryService, paymentService, orderService);

  // Act & Assert
  assertThrows(OrderValidationException.class, () -> {
    processor.placeOrder(request);
  });
}

@Test
void placeOrder_shouldSucceed_whenAllValidationsPass() {
  // Arrange
  OrderRequest request = new OrderRequest("product1", 10, "customer1", paymentInfo);
  when(inventoryService.hasStock("product1", 10)).thenReturn(true);
  when(paymentService.canProcessPayment(paymentInfo)).thenReturn(true);
  when(orderService.hasActiveOrder("customer1")).thenReturn(false);

  OrderProcessor processor = new OrderProcessor(inventoryService, paymentService, orderService);

  // Act
  processor.placeOrder(request);

  // Assert
  verify(orderService).createOrder(request);
  verify(inventoryService).reserveStock("product1", 10);
  verify(paymentService).processPayment(paymentInfo);
}
```

### UI에서의 활용

```java
// 프론트엔드에서 사전 검증
public class OrderForm {
  public void onOrderRequestChange(OrderRequest request) {
    // 사용자 입력 시 실시간 검증
    OrderValidationResult validation = orderController.validateOrder(request);

    if (!validation.isValid()) {
      showErrors(validation.getErrors());
      disableSubmitButton();
    } else {
      hideErrors();
      enableSubmitButton();
    }
  }

  public void onSubmit(OrderRequest request) {
    // 실제 주문 처리
    orderController.placeOrder(request);
  }
}
```

이 패턴을 통해 컨트롤러는 단순한 오케스트레이션만 담당하고, 모든 비즈니스 로직은 도메인 모델에 집중되어 테스트와 유지보수가 쉬워진다.

## 도메인 이벤트를 사용한 도메인 모델 변경 사항 추적

도메인 모델을 현재 상태로 만든 단계를 빼기 어려울 때가 있다. 컨트롤러에 이러한 책임도 있으면 더 복잡해진다. 이를 피하려면, 도메인 모델에서 중요한 변경 사항을 추적하고 비즈니스 연산이 완료된 후 해당 변경 사항을 외부 의존성 호출로 변환한다.

**도메인 이벤트**는 애플리케이션 내에서 도메인 전문가에게 중요한 이벤트를 말한다. 도메인 이벤트는 이미 일어난 일들을 나타내기 때문에 항상 과거 시제로 명명해야 한다. 도메인 이벤트는 값이며, 불변이고 서로 바꿔서 쓸 수 있다.

# 결론

이번 챕터의 핵심 내용은 외부 시스템에 대한 애플리케이션의 사이드 이펙트를 추상화하는 것이다.

**사이드 이펙트를 추상화한다**는 것은 구체적인 외부 호출 코드를 직접 쓰지 않고, 추상 인터페이스나 도메인 이벤트 등으로 감싸서 비즈니스 로직이 "무엇을" 하는지에 집중하게 만드는 것이다.

- 추상화할 것을 테스트하기보다 추상화를 테스트하는 것이 더 쉽다
- 잠재적인 파편화가 있더라도 비즈니스 로직을 오케스트레이션에서 분리하는 것은 많은 가치가 있다

# 용어 정의

## 코드 복잡도 (Code Complexity)

코드 내 의사결정(분기) 지점의 수로 정의되는 지표다. 복잡도가 높을수록 다양한 실행 경로가 존재하며, 테스트 시 더 많은 케이스를 고려해야 한다. 코드 복잡도는 회귀 방지력과 직접적인 관련이 있다.

## 도메인 유의성 (Domain Significance)

코드가 프로젝트의 문제 도메인에 대해 얼마나 의미있는지를 나타내는 지표다. 도메인 유의성이 높은 코드는 비즈니스 규칙이나 핵심 로직을 담당하며, 테스트 시 회귀 방지 효과가 크다. 도메인 전문가가 이해할 수 있는 개념과 직접 연결된 코드가 높은 도메인 유의성을 가진다.

## 협력자 (Collaborator)

테스트 대상 객체가 의존하는 다른 객체나 시스템을 의미한다. 협력자는 가변 의존성이거나 프로세스 외부 의존성일 수 있으며, 협력자 수가 많을수록 테스트 시 모킹이나 스텁이 더 많이 필요해진다. 협력자가 많은 코드는 테스트 유지비가 높아지는 경향이 있다.

## 험블 객체 패턴 (Humble Object Pattern)

복잡한 로직을 테스트하기 어려운 의존성에서 분리된 별도 클래스로 추출하는 설계 패턴이다. 이 패턴을 통해 남은 코드는 비즈니스 로직을 둘러싼 얇은 험블 래퍼, 즉 컨트롤러가 된다. 육각형 아키텍처와 함수형 아키텍처는 이 패턴을 구현한 대표적인 예시다.

## 육각형 아키텍처 (Hexagonal Architecture)

도메인 계층, 애플리케이션 서비스 계층, 외부 인터페이스로 구성된 소프트웨어 아키텍처다. 비즈니스 로직과 프로세스 외부 의존성과의 통신을 분리하여 테스트 용이성을 높인다. 포트와 어댑터 패턴을 사용하여 도메인 로직을 외부 시스템과 분리한다.

## 함수형 아키텍처 (Functional Architecture)

비즈니스 로직(불변 코어)과 사이드 이펙트(가변 셸)를 명확히 분리하는 소프트웨어 설계 방식이다. 불변 코어는 순수 함수로만 구성되어 예측 가능하고 테스트하기 쉬우며, 가변 셸은 외부 입력 수집과 사이드 이펙트 처리만 담당한다.

## 사이드 이펙트 (Side Effect)

애플리케이션이 제어할 수 없는 경계 밖의 모든 것을 의미한다. 데이터베이스, 파일 시스템, 외부 API 서버, 메시징 시스템, 이메일 서버 등에 읽기, 쓰기를 하는 것이 바로 외부 시스템에 대한 사이드 이펙트다. 사이드 이펙트가 많을수록 테스트가 예측 가능성을 잃고 유지보수가 어려워진다.

## 도메인 이벤트 (Domain Event)

애플리케이션 내에서 도메인 전문가에게 중요한 이벤트를 의미한다. 도메인 이벤트는 이미 일어난 일들을 나타내기 때문에 항상 과거 시제로 명명해야 하며, 시스템에서 발생하는 중요한 변경 사항을 외부 애플리케이션에 알리는 데 사용된다. 도메인 이벤트는 값이며 불변이고 서로 바꿔서 쓸 수 있다.

## Tell Don't Ask 원칙

객체의 상태를 조회한 후 그 결과에 따라 결정을 내리는 것보다, 객체에게 직접 작업을 수행하도록 요청하는 것이 좋다는 원칙이다. 이 원칙을 따르면 객체가 스스로 상태를 관리하고 캡슐화가 향상되어 테스트와 유지보수가 쉬워진다.

## 재구성 로직 (Reconstitution Logic)

저장된 데이터를 도메인 객체로 다시 구성하는 로직을 의미한다. 이 로직은 단순해 보이더라도 실제로는 내부적으로 많은 분기가 숨어 있어서 테스트할 가치가 있다. 재구성 로직은 도메인 객체의 불변성을 보장하고 비즈니스 규칙을 적용하는 중요한 역할을 한다.

## CanExecute/Execute 패턴

각 do() 메서드에 대해 CanDo()를 두고, CanDo()가 성공적으로 실행되는 것을 Do()의 전제 조건으로 하는 패턴이다. 이 패턴은 Do() 전에 CanDo()를 호출하지 않을 수 없기 때문에 컨트롤러의 의사 결정을 근본적으로 제거한다. 컨트롤러 복잡도 증가를 완화하는 효과적인 방법 중 하나다.

## 불변성 (Invariant)

객체나 시스템이 항상 유지해야 하는 조건이나 제약사항을 의미한다. 불변성은 도메인 규칙의 핵심이며, 위반 시 비즈니스적으로 큰 문제가 될 수 있다. 불변성을 보장하는 전제 조건은 반드시 테스트해야 한다.

## 프로세스 외부 의존성 (Process External Dependency)

애플리케이션 프로세스 외부에 존재하는 시스템이나 서비스를 의미한다. 데이터베이스, 외부 API, 파일 시스템, 메시징 시스템 등이 해당하며, 이러한 의존성은 테스트 시 모킹이나 스텁으로 대체해야 한다. 프로세스 외부 의존성이 많을수록 테스트 복잡도가 증가한다.
