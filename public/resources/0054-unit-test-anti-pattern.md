# 개요

단위 테스트를 작성할 때 흔히 저지르는 실수들이 있다. 이런 실수들은 테스트의 품질을 떨어뜨리고 유지보수를 어렵게 만든다.

# 비공개 메서드 단위 테스트

## 비공개 메서드와 테스트 취약성

비공개 메서드를 직접 테스트하려는 시도는 여러 문제를 일으키는데, 우선 테스트가 구현 세부사항에 결합된다. 비공개 메서드는 클래스의 내부 구현이므로, 리팩터링 시 테스트도 함께 변경되어야 한다. 그리고 캡슐화 원칙을 위반한다. 비공개 메서드는 외부에 노출되지 않아야 하는데, 테스트를 위해 노출하면 설계가 깨진다.

```java
// 비공개 메서드를 직접 테스트
public class OrderService {
  private double calculateDiscount(Order order) {
    if (order.getTotal() > 1000) {
      return order.getTotal() * 0.1;
    }
    return 0;
  }
}

@Test
void calculateDiscount_shouldReturn10Percent_whenTotalExceeds1000() {
  // 리플렉션을 사용해 비공개 메서드에 접근
  Method method = OrderService.class.getDeclaredMethod("calculateDiscount", Order.class);
  method.setAccessible(true);

  OrderService service = new OrderService();
  Order order = new Order(1200);

  double result = (double) method.invoke(service, order);
  assertEquals(120.0, result);
}
```

이런 테스트는 비공개 메서드의 구현이 바뀌면 깨지기 쉽다. 또한 테스트가 복잡해지고 유지보수가 어려워진다.

## 비공개 메서드와 불필요한 커버리지

비공개 메서드를 직접 테스트하면 불필요한 커버리지가 생긴다. 커버리지 수치만 높아지고 실제로는 의미 있는 테스트가 되지 않는다. 테스트는 비즈니스 요구사항을 검증해야 하는데, 비공개 메서드는 구현 세부사항이므로 비즈니스 가치가 낮다.

## 비공개 메서드 테스트가 타당한 경우

드물지만 비공개 메서드를 테스트해야 하는 경우가 있다. 예를 들어, 클래스와 ORM 또는 팩토리 간의 비공개 계약을 구현하는 경우다. 이런 경우에는 해당 메서드가 클래스의 식별할 수 있는 동작에 속한다고 볼 수 있다.

하지만 이런 경우에도 비공개 메서드를 공개로 만들지 말고, 해당 추상화를 별도 클래스로 추출하는 것이 좋다.

```java
// 추상화를 별도 클래스로 분리
public class DiscountCalculator {
  public double calculateDiscount(Order order) {
    if (order.getTotal() > 1000) {
      return order.getTotal() * 0.1;
    }
    return 0;
  }
}

public class OrderService {
  private final DiscountCalculator discountCalculator;

  public OrderService(DiscountCalculator discountCalculator) {
    this.discountCalculator = discountCalculator;
  }

  public Order processOrder(Order order) {
    double discount = discountCalculator.calculateDiscount(order);
    order.applyDiscount(discount);
    return order;
  }
}

@Test
void calculateDiscount_shouldReturn10Percent_whenTotalExceeds1000() {
  DiscountCalculator calculator = new DiscountCalculator();
  Order order = new Order(1200);

  double result = calculator.calculateDiscount(order);
  assertEquals(120.0, result);
}
```

# 비공개 상태 노출

테스트를 위해 비공개 상태를 노출하는 것도 안티 패턴이다. 테스트는 제품 코드와 같은 방식으로 시스템과 상호작용해야 한다. 특별한 권한을 가져서는 안 된다.

```java
// 테스트를 위해 비공개 상태 노출
public class UserService {
  private List<User> users = new ArrayList<>();

  // 테스트를 위해 추가된 메서드
  public List<User> getUsers() {
    return users;
  }

  public void addUser(User user) {
    users.add(user);
  }
}

@Test
void addUser_shouldAddUserToList() {
  UserService service = new UserService();
  User user = new User("John");

  service.addUser(user);

  // 비공개 상태에 직접 접근
  List<User> users = service.getUsers();
  assertTrue(users.contains(user));
}
```

이런 방식은 캡슐화를 깨뜨리고 설계를 망친다. 대신 공개 API를 통해 간접적으로 검증해야 한다.

```java
// 공개 API를 통한 검증
public class UserService {
  private List<User> users = new ArrayList<>();

  public void addUser(User user) {
    users.add(user);
  }

  public boolean hasUser(String name) {
    return users.stream().anyMatch(user -> user.getName().equals(name));
  }
}

@Test
void addUser_shouldAddUserToList() {
  UserService service = new UserService();
  User user = new User("John");

  service.addUser(user);

  // 공개 API를 통한 검증
  assertTrue(service.hasUser("John"));
}
```

# 테스트로 유출된 도메인 지식

테스트를 작성할 때 특정 구현을 암시하지 말아야 한다. 블랙박스 관점에서 제품 코드를 검증해야 한다. 도메인 지식을 테스트에 유출하면 테스트가 구현에 결합된다.

```java
// 구현 세부사항을 암시하는 테스트
@Test
void processOrder_shouldCallCalculateDiscountThenApplyDiscount() {
  OrderService service = new OrderService();
  Order order = new Order(1200);

  service.processOrder(order);

  // 구현 세부사항을 검증
  verify(discountCalculator).calculateDiscount(order);
  verify(order).applyDiscount(anyDouble());
}
```

이런 테스트는 내부 구현이 바뀌면 깨진다. 대신 최종 결과를 검증해야 한다.

```java
// 최종 결과를 검증하는 테스트
@Test
void processOrder_shouldApplyDiscount_whenTotalExceeds1000() {
  OrderService service = new OrderService();
  Order order = new Order(1200);

  Order result = service.processOrder(order);

  // 최종 결과만 검증
  assertEquals(1080.0, result.getTotal(), 0.01);
}
```

# 코드 오염

코드 오염은 테스트에만 필요한 제품 코드를 추가하는 것이다. 이는 테스트 코드와 제품 코드가 혼재되게 하고 제품 코드의 유지보수를 어렵게 만든다.

```java
// 테스트를 위한 코드 오염
public class OrderService {
  private List<Order> orders = new ArrayList<>();

  public void processOrder(Order order) {
    // 실제 비즈니스 로직
    if (order.getTotal() > 1000) {
      order.applyDiscount(0.1);
    }
    orders.add(order);
  }

  // 테스트를 위해 추가된 메서드
  public List<Order> getOrders() {
    return orders;
  }

  // 테스트를 위해 추가된 메서드
  public void clearOrders() {
    orders.clear();
  }
}
```

이런 메서드들은 테스트에서만 사용되고 실제 비즈니스 로직에는 필요 없다. 제품 코드를 복잡하게 만들고 유지보수를 어렵게 한다.

대신 테스트에서 필요한 기능은 테스트 코드 내에서 해결하거나, 실제로 필요한 기능이라면 제대로 설계해야 한다.

# 구체 클래스를 목으로 처리하기

구체 클래스를 목으로 처리해야 한다면, 이는 단일 책임 원칙을 위반하는 결과다. 해당 클래스가 너무 많은 책임을 가지고 있다는 뜻이다.

```java
// 구체 클래스를 목으로 처리
public class OrderProcessor {
  private DatabaseConnection db;
  private EmailService emailService;

  public void processOrder(Order order) {
    // 비즈니스 로직
    if (order.getTotal() > 1000) {
      order.applyDiscount(0.1);
    }

    // 외부 의존성 호출
    db.save(order);
    emailService.sendConfirmation(order.getCustomerEmail());
  }
}

@Test
void processOrder_shouldProcessOrder() {
  DatabaseConnection mockDb = mock(DatabaseConnection.class);
  EmailService mockEmail = mock(EmailService.class);

  OrderProcessor processor = new OrderProcessor(mockDb, mockEmail);
  // ...
}
```

이런 클래스는 비즈니스 로직과 외부 의존성 호출이 섞여 있다. 테스트하기 어렵고 유지보수가 어렵다.

대신 두 가지 클래스로 분리해야 한다. 도메인 로직이 있는 클래스와 프로세스 외부 의존성과 통신하는 클래스로 나눈다.

```java
// 책임 분리
public class OrderBusinessLogic {
  public Order processOrder(Order order) {
    if (order.getTotal() > 1000) {
      order.applyDiscount(0.1);
    }
    return order;
  }
}

public class OrderService {
  private final OrderBusinessLogic businessLogic;
  private final OrderRepository repository;
  private final EmailService emailService;

  public OrderService(OrderBusinessLogic businessLogic,
                      OrderRepository repository,
                      EmailService emailService) {
    this.businessLogic = businessLogic;
    this.repository = repository;
    this.emailService = emailService;
  }

  public void processOrder(Order order) {
    Order processedOrder = businessLogic.processOrder(order);
    repository.save(processedOrder);
    emailService.sendConfirmation(processedOrder.getCustomerEmail());
  }
}

@Test
void processOrder_shouldApplyDiscount_whenTotalExceeds1000() {
  OrderBusinessLogic businessLogic = new OrderBusinessLogic();
  Order order = new Order(1200);

  Order result = businessLogic.processOrder(order);

  assertEquals(1080.0, result.getTotal(), 0.01);
}
```

# 시간 처리하기

## 앰비언트 컨텍스트로서의 시간

현재 시간을 앰비언트 컨텍스트로 사용하면 제품 코드가 오염되고 테스트하기 어려워진다.

```java
// 앰비언트 컨텍스트로 시간 사용
public class OrderService {
  public void processOrder(Order order) {
    // 현재 시간을 직접 참조
    LocalDateTime now = LocalDateTime.now();
    order.setCreatedAt(now);

    if (order.getCreatedAt().getHour() < 9) {
      order.setPriority(Priority.HIGH);
    }
  }
}

@Test
void processOrder_shouldSetHighPriority_whenCreatedBefore9AM() {
  OrderService service = new OrderService();
  Order order = new Order();

  // 시간을 제어할 수 없어서 테스트가 어려움
  service.processOrder(order);

  // 시간에 따라 결과가 달라짐
  assertTrue(order.getPriority() == Priority.HIGH || order.getPriority() == Priority.NORMAL);
}
```

이런 테스트는 실행 시간에 따라 결과가 달라져서 불안정하다.

## 명시적 의존성으로서의 시간

시간을 명시적 의존성으로 주입하면 테스트하기 쉬워진다.

```java
// 명시적 의존성으로 시간 주입
public class OrderService {
  private final Clock clock;

  public OrderService(Clock clock) {
    this.clock = clock;
  }

  public void processOrder(Order order) {
    LocalDateTime now = LocalDateTime.now(clock);
    order.setCreatedAt(now);

    if (order.getCreatedAt().getHour() < 9) {
      order.setPriority(Priority.HIGH);
    }
  }
}

@Test
void processOrder_shouldSetHighPriority_whenCreatedBefore9AM() {
  // 고정된 시간으로 테스트
  Clock fixedClock = Clock.fixed(
    Instant.parse("2023-01-01T08:00:00Z"),
    ZoneId.of("UTC")
  );

  OrderService service = new OrderService(fixedClock);
  Order order = new Order();

  service.processOrder(order);

  assertEquals(Priority.HIGH, order.getPriority());
}

@Test
void processOrder_shouldSetNormalPriority_whenCreatedAfter9AM() {
  // 다른 시간으로 테스트
  Clock fixedClock = Clock.fixed(
    Instant.parse("2023-01-01T10:00:00Z"),
    ZoneId.of("UTC")
  );

  OrderService service = new OrderService(fixedClock);
  Order order = new Order();

  service.processOrder(order);

  assertEquals(Priority.NORMAL, order.getPriority());
}
```

이렇게 하면 테스트가 안정적이고 예측 가능해진다. 가능하면 항상 일반 값(Clock)이 좋다.

# 정리

단위 테스트 안티 패턴을 피하는 것이 중요하다. 비공개 메서드를 직접 테스트하지 말고, 식별할 수 있는 동작으로 간접적으로 테스트해야 한다. 비공개 메서드가 너무 복잡하다면 추상화를 별도 클래스로 추출해야 한다.

테스트를 위해 비공개 상태를 노출하지 말고, 도메인 지식을 테스트에 유출하지 말아야 한다. 코드 오염을 피하고, 구체 클래스를 목으로 처리해야 한다면 책임을 분리해야 한다.

시간 처리에서는 앰비언트 컨텍스트보다는 명시적 의존성을 사용하는 것이 좋다. 이렇게 하면 테스트가 안정적이고 유지보수하기 쉬워진다.

# 용어 정의

## 비공개 메서드 (Private Method)

클래스 내부에서만 사용되는 메서드로, 외부에 노출되지 않는다. 캡슐화를 통해 클래스의 내부 구현을 숨기는 역할을 한다. 비공개 메서드는 직접 테스트하지 말고 공개 메서드를 통해 간접적으로 테스트해야 한다.

## 코드 오염 (Code Contamination)

테스트에만 필요한 코드를 제품 코드에 추가하는 것을 의미한다. 이는 제품 코드의 복잡성을 증가시키고 유지보수를 어렵게 만든다. 테스트 코드와 제품 코드가 혼재되게 하여 설계를 망친다.

## 앰비언트 컨텍스트 (Ambient Context)

전역적으로 접근 가능한 상태나 서비스를 의미한다. 예를 들어, 현재 시간을 직접 참조하는 것처럼 전역 상태에 의존하는 것을 말한다. 앰비언트 컨텍스트는 테스트하기 어렵고 예측하기 어려운 코드를 만든다.

## 명시적 의존성 (Explicit Dependency)

생성자나 메서드 매개변수를 통해 명확하게 드러나는 의존성을 의미한다. 의존성 주입을 통해 테스트 시 모킹이 쉽고, 코드의 의존성을 한눈에 파악할 수 있다. 명시적 의존성은 테스트 용이성과 유지보수성을 높인다.

## 구체 클래스 (Concrete Class)

인터페이스나 추상 클래스가 아닌 실제 구현체를 의미한다. 구체 클래스를 목으로 처리해야 한다면, 해당 클래스가 너무 많은 책임을 가지고 있다는 뜻이다. 단일 책임 원칙을 위반하는 결과이므로 책임을 분리해야 한다.

## 식별할 수 있는 동작 (Observable Behavior)

외부에서 관찰 가능한 최종 결과를 의미한다. 반환 값, 상태 변화, 외부 시스템과의 통신 등이 포함된다. 테스트는 식별할 수 있는 동작에만 결합되어야 하며, 구현 세부사항에 의존해서는 안 된다.

## 블랙박스 테스트 (Black Box Testing)

시스템의 내부 구조나 구현을 고려하지 않고 입력과 출력만으로 검증하는 테스트 방식이다. 사용자 관점에서 테스트를 설계하며 기능 요구사항 충족 여부를 확인하는 데 유리하다. 구현 세부사항에 의존하지 않아 리팩터링에 강하다.

## 화이트박스 테스트 (White Box Testing)

코드의 내부 구조, 논리, 흐름 등을 분석하여 테스트 케이스를 설계하는 방식이다. 조건 분기, 루프 등을 기준으로 테스트 범위를 결정할 수 있다. 테스트 커버리지를 높이는 데 적합하지만, 구현 세부사항에 의존하여 리팩터링에 취약할 수 있다.
