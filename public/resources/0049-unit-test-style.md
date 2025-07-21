# 단위 테스트의 세 가지 스타일

## 출력 기반 테스트 (Output-based Testing)

출력 기반 테스트는 입력값에 대한 반환값만을 검증하는 테스트 방식이다.

이 방식은 순수 함수처럼 전역 상태나 내부 상태를 변경하지 않는 코드에만 적용할 수 있으며, 가장 직관적이고 리팩터링에 강한 테스트 스타일이다. 함수형 프로그래밍 원칙을 적용해 코드 구조를 바꿔야 제대로 활용할 수 있고, 테스트가 실패할 경우 원인을 빠르게 파악할 수 있다.

쉽게 말해, 입력을 넣으면 항상 같은 결과가 나오는 함수(예: 계산기 덧셈 함수)처럼, 코드의 동작이 단순하고 예측 가능할 때 가장 효과적이다. 복잡한 상태나 외부 시스템과의 연동이 없는 순수한 계산, 변환 등에 적합하다.

```java
class Calculator {
  public int add(int a, int b) {
    return a + b;
  }
}

@Test
void add_shouldReturnCorrectSum() {
  Calculator calc = new Calculator();
  int result = calc.add(2, 3);
  assertEquals(5, result);
}
```

## 상태 기반 테스트 (State-based Testing)

상태 기반 테스트는 작업 후 시스템의 상태 변화를 검증하는 테스트 방식이다.

이 방식은 출력이 없는 메서드나 사이드 이펙트가 있는 코드에 적합하며, 객체의 필드, 데이터베이스, 파일 등 다양한 상태 변화를 확인할 수 있다. 내부 상태의 변화가 복잡할수록 테스트가 어려워질 수 있지만, 실제 동작의 결과를 간접적으로 검증할 때 유용하다.

쉽게 말해, 어떤 행동을 한 뒤에 시스템이나 객체의 상태가 바뀌었는지 확인하는 방식이다. 예를 들어, 버튼을 누르면 카운터가 1 증가하는지, 은행 계좌에서 돈을 출금하면 잔액이 줄어드는지 등을 검사할 때 사용한다.

```java
class Counter {
  private int count = 0;

  public void increment() {
    count++;
  }

  public int getCount() {
    return count;
  }
}

@Test
void increment_shouldIncreaseCount() {
  Counter counter = new Counter();
  counter.increment();
  assertEquals(1, counter.getCount());
}
```

## 통신 기반 테스트 (Communication-based Testing)

통신 기반 테스트는 시스템과 협력자 간의 메시지 교환을 검증하는 테스트 방식이다.

이 방식은 SUT가 협력자를 올바르게 호출하는지, 즉 메시지 전달이 제대로 이뤄지는지를 확인하며, 주로 목(mock) 객체를 사용해 호출 여부, 인자, 호출 횟수 등을 검증한다. 꼭 필요한 경우에만 사용해야 하며, 목 객체가 많아질수록 테스트가 복잡해질 수 있다.

쉽게 말해, 내가 어떤 일을 직접 처리하지 않고 다른 사람(객체)에게 부탁했을 때, 그 부탁이 제대로 전달되고 실행됐는지 확인하는 방식이다. 예를 들어, 알림 서비스가 실제로 외부 메일 발송 시스템을 호출했는지, 결제 요청이 결제 게이트웨이로 전달됐는지 등을 검증할 때 사용한다.

```java
interface Notifier {
  void notify(String message);
}

class NotificationService {
  private final Notifier notifier;

  public NotificationService(Notifier notifier) {
    this.notifier = notifier;
  }

  public void send(String msg) {
    notifier.notify(msg);
  }
}

@Test
void send_shouldNotifyCollaborator() {
  Notifier mockNotifier = mock(Notifier.class);
  NotificationService service = new NotificationService(mockNotifier);
  service.send("Hello");
  verify(mockNotifier).notify("Hello");
}
```

> 하나의 테스트에서 한 가지 스타일만 쓸 필요는 없다. 상황에 따라 두 가지, 세 가지 스타일을 조합해서 사용할 수 있다. 예를 들어, 어떤 테스트는 출력 기반과 상태 기반을 동시에 활용할 수 있고, 복잡한 시스템에서는 통신 기반까지 함께 쓰기도 한다.

# 단위 테스트 스타일 비교

좋은 단위 테스트는 네 가지 핵심 요소로 평가할 수 있다.

- 회귀 방지
- 리팩터링 내성
- 빠른 피드백
- 유지 보수성

## 회귀 방지

회귀 방지는 코드가 변경되었을 때, 그로 인해 발생한 문제(버그)를 테스트가 잘 잡아내는 능력을 의미한다.

테스트가 얼마나 많은 실제 코드를 실행하는지, 코드의 복잡성(분기, 조건 등), 그리고 실제 비즈니스 요구와의 관련성(도메인 유의성)이 회귀 방지력을 결정한다. 즉, 테스트가 단순히 한 부분만 확인하는 것이 아니라, 여러 메서드와 다양한 조건, 실제 중요한 비즈니스 로직까지 폭넓게 검증할수록 회귀 방지력이 높아진다.

### 테스트 중에 실행되는 코드의 양

테스트가 실행될 때 실제로 얼마나 많은 프로덕션 코드가 실행되는지를 의미한다. 예를 들어, 단순히 한 메서드만 호출하는 것이 아니라, 그 안에서 여러 메서드가 함께 실행된다면 테스트 중에 실행되는 코드의 양이 많아진다. 실행되는 코드가 많을수록, 코드 변경이 다른 곳에 영향을 미칠 확률도 높고, 그만큼 테스트가 많은 부분의 변경을 감지할 수 있다.

```java
class OrderService {
  public int calculateTotal(Order order) {
    return order.getQuantity() * order.getUnitPrice();
  }
}

class Order {
  private int quantity;
  private int unitPrice;

  public Order(int quantity, int unitPrice) {
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }

  public int getQuantity() {
    return quantity;
  }

  public int getUnitPrice() {
    return unitPrice;
  }
}

@Test
void calculateTotal_shouldMultiplyQuantityAndUnitPrice() {
  Order order = new Order(2, 100);
  OrderService service = new OrderService();
  int total = service.calculateTotal(order);
  assertEquals(200, total);
}
```

이 테스트는 OrderService의 메서드뿐 아니라, Order의 getter들도 함께 실행한다. 즉, 단순해 보여도 여러 코드 경로가 실제로 검증된다.

### 코드 복잡도

테스트가 커버하는 코드의 복잡성(예: if, switch, loop 등 분기 처리)이 얼마나 되는지에 따라 회귀 방지 효과가 달라진다. 복잡한 분기 구조는 변경에 더 취약하기 때문에, 다양한 조건과 흐름을 모두 테스트해야 작은 변화도 감지할 수 있다.

```java
class DiscountService {
  public int calculateDiscount(int price) {
    if (price > 1000) {
      return 100;
    } else if (price > 500) {
      return 50;
    } else {
      return 0;
    }
  }
}

@Test
void discount_shouldBe100_ifPriceAbove1000() {
  DiscountService service = new DiscountService();
  assertEquals(100, service.calculateDiscount(1500));
}

@Test
void discount_shouldBe50_ifPriceBetween500And1000() {
  DiscountService service = new DiscountService();
  assertEquals(50, service.calculateDiscount(700));
}

@Test
void discount_shouldBe0_ifPriceBelow500() {
  DiscountService service = new DiscountService();
  assertEquals(0, service.calculateDiscount(300));
}
```

이 테스트는 if, else if, else 세 가지 분기를 모두 검증한다. 즉, 복잡한 코드 흐름을 테스트하고 있기 때문에 회귀 방지력이 높다.

### 도메인 유의성

테스트가 실제 비즈니스 요구사항(=도메인 로직)과 얼마나 관련성이 있는지를 의미한다. 도메인 유의성이 높다는 것은, 이 테스트가 실제로 중요한 기능을 검증하고 있다는 뜻이다. 내부 구현 방식이나 기술적인 세부사항만 확인하는 테스트는 실제 기능과 동떨어져 있기 때문에, 회귀를 막는 데 큰 도움이 되지 않는다.

```java
class BankAccount {
  private int balance;

  public BankAccount(int balance) {
    this.balance = balance;
  }

  public void withdraw(int amount) {
    if (amount > balance) throw new IllegalArgumentException("Insufficient balance");
    balance -= amount;
  }

  public int getBalance() {
    return balance;
  }
}

@Test
void withdraw_shouldReduceBalance() {
  BankAccount account = new BankAccount(1000);
  account.withdraw(200);
  assertEquals(800, account.getBalance());
}

@Test
void withdraw_shouldFail_ifInsufficientBalance() {
  BankAccount account = new BankAccount(100);
  assertThrows(IllegalArgumentException.class, () -> {
    account.withdraw(200);
  });
}
```

이 테스트는 실제 은행 계좌 출금이라는 중요한 비즈니스 규칙을 검증한다. 이런 테스트는 변경이 발생했을 때 핵심 요구사항이 깨지는 걸 빠르게 감지할 수 있다.

> 테스트 스타일과 테스트 피드백 속도(실행 속도) 사이에는 큰 상관관계가 없다. 테스트가 외부 의존성과 분리되어 단위 테스트 영역에 있다면, 어떤 스타일이든 실행 속도는 거의 비슷하다.

## 리팩터링 내성

리팩터링 내성은 코드 구조가 바뀌어도 테스트가 잘 깨지지 않는 성질을 의미한다.

- **출력 기반 테스트**는 테스트가 오직 결과값에만 결합되어 있어, 리팩터링에 가장 강하다.
- **상태 기반 테스트**는 클래스 상태와 결합되기 쉬워, 거짓 양성(실제 문제는 없는데 테스트가 깨지는 현상)이 발생할 수 있다.
- **통신 기반 테스트**는 목 객체와의 상호작용에 의존해, 리팩터링에 가장 취약하다. (특히, 내부 구현이 바뀌면 목과의 상호작용도 바뀌기 쉽다.)

거짓 양성을 줄이려면, 테스트가 식별할 수 있는 동작(외부에서 관찰 가능한 결과)에만 결합되도록 캡슐화를 잘 지켜야 한다.

## 유지 보수성

유지 보수성은 테스트를 이해하고 관리하기 쉬운지의 정도다.

- **출력 기반 테스트**는 가장 관리하기 쉽다. (작고 간결하며, 코드 변경에도 잘 깨지지 않는다.)
- **상태 기반 테스트**는 헬퍼 메서드, 값 객체 등을 활용해 유지 보수성을 높일 수 있다. (하지만 상태가 복잡해질수록 관리가 어려워진다.)
- **통신 기반 테스트**는 목 객체가 많아질수록 복잡해지고, 관리가 어려워진다. (테스트 코드가 실제 코드보다 더 복잡해질 수 있다.)

유지 보수성은 테스트의 크기, 복잡성, 외부 의존성의 개수에 따라 달라진다.

## 스타일 비교 표

|         | 출력 기반 | 상태 기반 | 통신 기반 |
|---------|-------|-------|-------|
| 회귀 방지   | 높음    | 높음    | 높음    |
| 리팩터링 내성 | 매우 높음 | 중간    | 낮음    |
| 피드백 속도  | 빠름    | 빠름    | 빠름    |
| 유지 보수성  | 높음    | 중간    | 낮음    |

- 세 가지 스타일 모두 회귀 방지와 피드백 속도에서는 점수가 비슷하다.
- 출력 기반 테스트는 함수형으로 작성된 코드에만 적용할 수 있다.
- 코드를 순수 함수로 만들면 상태 기반이나 통신 기반 테스트 대신 출력 기반 테스트가 가능하다.
- 실제로는 한 가지 스타일만 고집하지 않고, 상황에 따라 여러 스타일을 조합해서 사용하는 것이 현실적이다.

# 함수형 아키텍처와 테스트

함수형 아키텍처는 비즈니스 로직(불변 코어)과 사이드 이펙트(가변 셸)를 명확히 분리하는 소프트웨어 설계 방식이다.

## 특징

### 순수 함수 중심

- 동일한 입력에 대해 항상 동일한 출력을 반환한다.
- 외부 상태나 시스템에 영향을 주지 않는다(사이드 이펙트 없음).
- 예측 가능하고, 테스트가 쉽다.

### 숨은 입출력 최소화

- 숨은 입출력이란 함수 시그니처에 드러나지 않는 동작(예: 파일 쓰기, DB 수정, 예외, 현재 시간 참조 등)이다.
- 숨은 입출력이 없을수록 참조 투명성을 만족한다.

### 불변 코어(Functional Core)와 가변 셸(Mutable Shell) 분리

- 불변 코어: 순수 함수로만 구성, 비즈니스 로직 담당, 상태 변경 없음
- 가변 셸: 외부 입력 수집, 사이드 이펙트(입출력, DB, 네트워크 등) 처리

## 구조와 동작 예시

```java
// 불변 코어(순수 함수)
class OrderCalculator {
  public int calculateTotal(int quantity, int unitPrice) {
    return quantity * unitPrice;
  }
}

// 가변 셸(입출력, 외부와의 연결)
class OrderService {
  private final OrderCalculator calculator = new OrderCalculator();

  public void processOrder(int quantity, int unitPrice) {
    int total = calculator.calculateTotal(quantity, unitPrice); // 순수 함수 호출
    saveToDatabase(total); // 사이드 이펙트(가변 셸)
  }

  private void saveToDatabase(int total) {
    // 실제 DB 저장 로직 (사이드 이펙트)
  }
}
```

- 위 예시에서 `OrderCalculator`는 불변 코어, `OrderService`의 DB 저장은 가변 셸이다.

## 장점

- 비즈니스 로직(불변 코어)은 출력 기반 테스트로 빠르고 안정적으로 검증할 수 있다.
- 사이드 이펙트(가변 셸)는 최소한의 통합 테스트만으로도 충분하다.
- 코드가 예측 가능하고, 리팩터링에 강하다.
- 유지 보수성과 테스트 용이성이 크게 향상된다.

## 실무 적용법

- 외부 의존성(입출력, DB 등)을 목(mock)으로 대체해 테스트 가능성을 확보한다.
- 비즈니스 로직을 점진적으로 순수 함수(불변 코어)로 리팩터링한다.
- 가변 셸은 실제 입출력, 외부 시스템 연동 등 사이드 이펙트만 담당하도록 분리한다.

## 육각형 아키텍처와의 비교

### 공통점

- 관심사 분리를 추구한다.

### 차이점

- 육각형 아키텍처는 도메인 계층과 어댑터(입출력, 외부 시스템 등)를 분리한다.
- 함수형 아키텍처는 이 중에서도 불변 코어(순수 함수)와 가변 셸(사이드 이펙트 처리)을 더 엄격하게 나눈다.
- 함수형 아키텍처는 육각형 아키텍처의 하위 집합이자, 더 강한 테스트 용이성과 예측 가능성을 제공한다.

> 함수형 아키텍처는 "비즈니스 로직은 순수 함수로, 외부와의 연결은 별도 계층으로" 분리해, 테스트와 유지보수에 최적화된 구조를 만든다.

# 기술 용어

## 순수 함수

동일한 입력에 대해 항상 동일한 출력을 반환하고, 외부 상태나 시스템에 영향을 주지 않는 함수다. 참조 투명성을 만족하며, 사이드 이펙트가 없기 때문에 테스트가 예측 가능하고 리팩터링에 강하다. 함수형 프로그래밍의 핵심 개념이다.

## 사이드 이펙트

함수 실행이 외부 상태나 시스템에 영향을 주는 동작이다. 예를 들어 파일 쓰기, DB 수정, 콘솔 출력 등이 해당한다. 사이드 이펙트가 많을수록 테스트가 예측 가능성을 잃고, 유지 보수가 어려워진다.

## 목(Mock)

테스트 중 협력 객체를 흉내 내기 위해 사용하는 가짜 객체다. 호출 여부, 파라미터, 횟수 등을 검증하는 데 사용된다. 통신 기반 테스트에서 주로 사용된다. 잘못 사용하면 테스트가 구현에 지나치게 결합될 수 있다.

## SUT(System Under Test)

테스트의 대상이 되는 시스템, 클래스, 함수 등을 의미한다. SUT는 테스트의 중심이 되는 객체로, 입력을 받고 출력을 생성하거나 상태를 변경한다.

## 불변 코어(Functional Core)

함수형 아키텍처에서 비즈니스 로직을 담당하는 순수 함수 집합이다. 외부 상태에 의존하지 않고, 입력에 따라 결정만 내린다. 테스트가 쉽고, 예측 가능하며, 재사용성이 높다.

## 가변 셸(Mutable Shell)

함수형 아키텍처에서 외부 입력을 수집하고, 출력 또는 사이드 이펙트를 실행하는 계층이다. 데이터베이스 접근, 네트워크 호출, 사용자 인터페이스 등이 여기에 해당한다. 불변 코어와 분리되어 있어야 한다.

## 참조 투명성(Referential Transparency)

어떤 표현식을 해당 표현식의 값으로 대체해도 프로그램의 동작이 달라지지 않는 성질이다. 이 성질을 가진 함수는 순수 함수이며, 테스트와 예측이 쉬운 코드 작성에 유리하다. 함수형 프로그래밍의 기반 개념이다.

## 통합 테스트(Integration Test)

여러 컴포넌트나 모듈이 실제로 함께 동작하는지 검증하는 테스트다. 단위 테스트가 개별 함수나 클래스의 동작만 확인하는 반면, 통합 테스트는 시스템의 여러 부분이 올바르게 연결되어 있는지, 실제 환경에서 문제가 없는지 확인한다. 보통 데이터베이스, 네트워크, 파일 시스템 등 외부 시스템과의 상호작용을 포함한다.

## E2E 테스트(End-to-End Test)

시스템 전체가 실제 사용자 시나리오대로 동작하는지 검증하는 테스트다. 사용자의 입력부터 최종 결과까지 모든 경로를 따라가며, 실제 배포 환경과 유사하게 테스트한다. 주로 웹 브라우저 자동화, API 시나리오 등에서 사용된다.

## 어댑터(Adapter)

육각형 아키텍처에서 도메인 계층과 외부 시스템(입출력, DB, 네트워크 등)을 연결하는 계층이다. 어댑터는 도메인 로직을 변경하지 않고도 외부 시스템과의 연동 방식을 유연하게 바꿀 수 있게 해준다. 관심사 분리와 확장성에 중요한 역할을 한다.

## 도메인 계층(Domain Layer)

비즈니스 규칙과 핵심 로직을 담당하는 소프트웨어의 중심 계층이다. 도메인 계층은 외부 시스템이나 프레임워크에 의존하지 않고, 오직 비즈니스 요구사항만을 구현한다. 유지 보수성과 테스트 용이성을 높이기 위해 다른 계층과 명확히 분리된다.  