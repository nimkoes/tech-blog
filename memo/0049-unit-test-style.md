# 단위 테스트의 세 가지 스타일

- 출력 기반 (output-based testing)
  - 가장 품질이 좋다.
  - 아무데서나 사용할 수 없으며, 순수 함수 방식으로 작성된 코드에만 적용된다.
  - 이를 위해 함수형 프로그래밍 원칙을 사용해 기반 코드가 함수형 아키텍처를 지향하게끔 재구성해야 한다.
- 상태 기반 (state-based testing)
  - 두 번째로 좋은 선택이다.
- 통신 기반 (communication-based testing)
  - 간헐적으로만 사용 해야 한다.

- 하나의 테스트에서 하나 또는 둘, 심지어 세 가지 스타일 모두를 함께 사용할 수 있다.

## 출력 기반 테스트 스타일 정의

- 테스트 대상 시스템(SUT)에 입력을 넣고 생성되는 출력을 점검하는 방식이다.
- 이러한 단위 테스트 스타일은 전역 상태나 내부 상태를 변경하지 않는 코드에만 적용되므로 반환 값마 검증하면 된다.
- 시스템이 생성하는 출력을 검증한다.
- 사이드 이펙트가 없고 SUT 작업 결과는 호출자에게 반환하는 값뿐이다.
- 출력 기반 단위 테스트 스타일은 함수형(functional)이라고도 한다.

- (-> 간단한 java 예제 테스트 코드가 있으면 좋겠다.)

## 상태 기반 테스트 스타일 정의

- 작업이 완료된 후 시스템 상태를 확인하는 것이다.
- 상태라는 용어는 SUT나 협력자 중 하나, 또는 데이터베이스나 파일 시스템 등과 같은 프로세스 외부 의존성의 상태 등을 의미할 수 있다.

- (-> 간단한 java 예제 테스트 코드가 있으면 좋겠다.)

## 통신 기반 테스트 스타일 정의

- 목을 사용해 테스트 대상 시스템과 협력자 간의 통신을 검증한다.
- SUT의 협력자는 목으로 대체하고 SUT가 협력자를 올바르게 호출하는지 검증한다.

- (-> 간단한 java 예제 테스트 코드가 있으면 좋겠다.)

단위 테스트의 고전파는 통신 기반 스타일보다 상태 기반 스타일을 선호한다. 런던파는 이와 반대로 선택한다. 두 분파는 출력 기반 테스트를 사용한다.

# 단위 테스트 스타일 비교

- 좋은 단위 테스트의 4대 요소로 서로 비교해본다.
- 4대 요소는 다음과 같다.
  - 회귀 방지
  - 리팩터링 내성
  - 빠른 피드백
  - 유지 보수성

## 회귀 방지와 피드백 속도 지표로 스타일 비교하기

- 회귀방지력이란, 코드를 변경했을 때 그 변경으로 인해 발생한 문제(=버그)를 테스트가 잘 잡아낸다는 뜻이다.
- 회귀 방지 지표는 특정 스타일에 따라 달라지지 않는다.
- 회귀 방지 지표는 다음의 세 가지 특성으로 결정 된다.

### 테스트 중에 실행되는 코드의 양

- 테스트가 실행될 때 실제로 얼마나 많은 프로덕션 코드가 실행되느냐를 말한다.
- 테스트가 특정 메서드만 호출하는 게 아니라, 내부적으로 다른 많은 메서드를 같이 호출한다면 테스트 중에 실행되는 코드의 양이 많은 것이다.
- 실행되는 코드가 많다는 건 변경이 다른 곳에 영향을 미칠 확률도 높고, 그만큼 테스트가 많은 부분의 변경을 감지할 수 있다는 뜻이다.
- 반대로 코드의 한 부분만 실행한다면, 다른 부분의 변화는 감지하지 못하게 된다.
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
  ```
  ```java
  @Test
  void calculateTotal_shouldMultiplyQuantityAndUnitPrice() {
      Order order = new Order(2, 100); // 수량 2, 단가 100
      OrderService service = new OrderService();
      
      int total = service.calculateTotal(order);
      
      assertEquals(200, total);
  }
  ```
- 이 테스트는 OrderService.calculateTotal() 뿐만 아니라 Order.getQuantity(), Order.getUnitPrice()도 실행한다.
- 즉, 단순한 테스트처럼 보여도 세 개의 메서드가 실행되고 있는 것이다

### 코드 복잡도

- 해당 테스트가 커버하는 코드의 복잡성(예: if, switch, loop 등의 분기 처리) 이 얼마나 되느냐이다.
- 코드가 복잡할수록 테스트의 회귀 방지 효과는 커진다.
- 왜냐하면 복잡한 분기 구조는 변경에 더 취약하기 때문이다.
- 테스트가 복잡한 분기 조건을 커버하지 않는다면, 테스트는 변경 감지 능력이 낮다.
- 반대로 다양한 조건과 흐름을 포함한 코드를 테스트하면, 작게 바뀌는 것도 감지할 수 있어 회귀 방지가 잘 된다.
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
  ```
  ```java
  @Test
  void discount_shouldBe100_ifPriceAbove1000() {
      DiscountService service = new DiscountService();
      assertEquals(100, service.calculateDiscount(1500)); // 조건 1
  }
      
  @Test
  void discount_shouldBe50_ifPriceBetween500And1000() {
      DiscountService service = new DiscountService();
      assertEquals(50, service.calculateDiscount(700)); // 조건 2
  }
      
  @Test
  void discount_shouldBe0_ifPriceBelow500() {
      DiscountService service = new DiscountService();
      assertEquals(0, service.calculateDiscount(300)); // 조건 3
  }
  ```
- 이 테스트는 코드의 if, else if, else 3개의 분기를 모두 커버한다.
- 즉, 복잡한 코드 흐름을 테스트하고 있기 때문에 회귀 방지력이 높다.

### 도메인 유의성

- 테스트가 검증하는 것이 실제 비즈니스 요구사항(=도메인 로직)과 얼마나 관련성이 있느냐를 의미한다.
- 도메인 유의성이 높다는 것은, 이 테스트가 실제로 중요한 기능을 검증하고 있다는 뜻이다.
- 테스트가 내부 구현 방식만 확인하거나 너무 기술적인 세부사항만 확인하면, 실제 기능과 동떨어진 “겉핥기 테스트”가 된다. 이런 테스트는 회귀를 막는 데 큰 도움이 되지 않는다.
- 도메인 유의성이 높은 테스트는 실제 고객이나 사용자의 요구사항을 보호해준다.
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
  ```
  ```java
  @Test
  void withdraw_shouldReduceBalance() {
  BankAccount account = new BankAccount(1000);
      account.withdraw(200);
      
      assertEquals(800, account.getBalance()); // 중요한 도메인 로직 확인
  }
      
  @Test
  void withdraw_shouldFail_ifInsufficientBalance() {
      BankAccount account = new BankAccount(100);
      
      assertThrows(IllegalArgumentException.class, () -> {
          account.withdraw(200); // 도메인 규칙 위반 시 예외 발생 검증
      });
  }
  ```
- 이 테스트는 실제 은행 계좌 출금이라는 중요한 비즈니스 규칙을 검증하고 있다. 즉, 도메인 유의성이 매우 높다.
- 이런 테스트는 변경이 발생했을 때 핵심 요구사항이 깨지는 걸 빠르게 감지할 수 있다.


- 테스트 스타일과 테스트 피드백 속도 사이에는 상관관계가 거의 없다.
- 테스트가 프로새스 외부 의존성과 떨어져 단위 테스트 영역에 있는 한, 모든 스타일은 테스트 실행 속도가 거의 동일하다.

## 리팩터링 내성 지표로 스타일 비교하기

- 리팩터링 내성은 리팩터링 중에 발생하는 거짓 양성(허위 경보) 수에 대한 척도다.
- 결국 거짓 양성은 식별할 수 있는 동작이 아니라 코드의 구현 세부 사항에 결합된 테스트의 결과다.

### 출력 기반 테스트

- 테스트가 테스트 대상 메서드에만 결합되므로 거짓 양성 방지가 가장 우수하다.
- 이러한 테스트가 구현 세부 사항에 결합하는 경우는 테스트 대상 메서드가 구현 세부 사항일 때뿐이다.

### 상태 기반 테스트

- 일반적으로 거짓 양성이 되기 쉽다.
- 테스트 대상 메서드 외에도 클래스 상태와 함께 작동한다.

### 통신 기반 테스트

- 거짓 양성에 가장 취약하다.
- 스텁과의 상호 작용을 확인해서는 안 된다.
- 애플리케이션 경계를 넘는 상호 작용을 확인하고 해당 상호 작용의 사이드 이펙트가 외부 환경에 보이는 경우에만 목이 괜찮다.


- 캡슐화를 잘 지키고 테스트를 식별할 수 있는 동작에만 결합하면 거짓 양성을 최소로 줄일 수 있다.

## 유지 보수성 지표로 스타일 비교하기

## 스타일 비교하기 결론

