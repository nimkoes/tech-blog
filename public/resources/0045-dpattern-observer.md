# 옵저버 패턴 (Observer Pattern)

## 주제 개요

옵저버 패턴은 객체 간의 `일대다(one-to-many)` 관계를 정의합니다.  
한 객체의 상태가 변경되면, 그 상태에 의존하는 여러 객체에게 자동으로 알림이 전달되어 동기화됩니다.

가장 흔한 비유는 `신문 구독 시스템`입니다.  
독자가 신문을 구독하면, 새로운 뉴스가 발행될 때마다 자동으로 신문을 받아보게 됩니다.

## 개념 설명

옵저버 패턴은 다음과 같은 두 개의 주요 구성 요소로 나뉩니다.

- `Subject`: 상태를 가지고 있으며, 상태 변경 시 `Observer`에게 알림을 보냅니다.
- `Observer`: `Subject`의 상태를 감시하며, 알림을 받으면 특정 동작을 수행합니다.

이러한 구조는 `느슨한 결합(loose coupling)` 을 가능하게 하며, `확장성과 재사용성`이 높은 설계를 돕습니다.

특징적으로 다음과 같은 상황에서 유용합니다:

- 특정 상태 변화에 여러 객체가 반응해야 하는 경우
- 구성 요소 간 의존성을 최소화하고, 이벤트 기반 시스템을 구성하고자 할 때
- MVC 패턴에서 모델이 뷰를 갱신하는 구조를 만들고자 할 때

## 예제 코드

다음은 Node.js(JavaScript)로 구현한 옵저버 패턴 예제입니다:

```javascript
// Subject 클래스 (발행자 역할)
class Subject {
  constructor() {
    this.observers = []
  }

  // 옵저버 등록
  register(observer) {
    this.observers.push(observer)
  }

  // 옵저버 해제
  unregister(observer) {
    this.observers = this.observers.filter(o => o !== observer)
  }

  // 옵저버에게 알림 전송
  notify(data) {
    this.observers.forEach(observer => observer.update(data))
  }
}

// Observer 클래스 (구독자 역할)
class Observer {
  constructor(name) {
    this.name = name
  }

  update(data) {
    console.log(`${this.name} received update: ${data}`)
  }
}

// 사용 예시
const newsPublisher = new Subject()
const subscriberA = new Observer("구독자 A")
const subscriberB = new Observer("구독자 B")

newsPublisher.register(subscriberA)
newsPublisher.register(subscriberB)

newsPublisher.notify("오늘의 뉴스: 옵저버 패턴 이해하기")
```

출력 결과:

```
구독자 A received update: 오늘의 뉴스: 옵저버 패턴 이해하기
구독자 B received update: 오늘의 뉴스: 옵저버 패턴 이해하기
```

## 용어 정의

- `옵저버 패턴`: 객체 간 관계를 정의하여, 한 객체의 상태 변경이 관련된 객체들에 자동으로 전달되는 구조를 말함. 이벤트 기반 시스템에서 자주 사용됨.
- `Subject`: 상태를 보유하고, 상태 변화가 발생하면 등록된 옵저버들에게 알림을 전송하는 역할을 수행하는 객체.
- `Observer`: `Subject`의 상태를 감시하고, 상태 변경 시 동작을 수행하는 객체.
- `느슨한 결합`: 한 객체가 다른 객체의 내부 구현에 의존하지 않고도 상호작용할 수 있는 설계 방식.
- `MVC(Model-View-Controller)`: 사용자 인터페이스, 데이터, 제어 로직을 각각 분리하여 개발하는 아키텍처. 뷰는 모델의 변화를 옵저버 패턴으로 감지할 수 있음.

## 정리

옵저버 패턴은 복잡한 의존 관계를 단순화하고, 동적으로 객체 간 관계를 구성할 수 있도록 도와주는 중요한 디자인 패턴입니다.  
이벤트 시스템, UI 프레임워크, 비동기 데이터 흐름 등 다양한 상황에서 폭넓게 활용됩니다.  
특히 `RxJS`, `LiveData`, `Spring @EventListener` 등도 내부적으로 이 패턴을 활용합니다.