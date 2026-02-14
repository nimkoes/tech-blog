Java 8 에서 새롭게 선보인 람다식.

이 람다식에 대해 알아보기 전에 꼭 알아야 할 개념이 있다.

***futional interface***라는 것이다.

이 함수형 인터페이스란 이름에 겁먹지 말자.

함수형 인터페이스란 ***추상메소드를 단 하나만 가지는 인터페이스***를 지칭하는 말이다.

당장 생각나는 인터페이스중에는 Runnable 인터페이스가 있지만, 임의로 함수형 인터페이스를 하나 생성해서 예시로 들어보겠다.

```java
interface FInterface {
    public void aaa();
}
```

위에서 처럼 FInterface라는 이름의 인터페이스를 하나 생성했다.

그리고 이 인터페이스는 aaa라는 이름의 매개변수가 없고 리턴타입이 void인 추상메소드를 하나 가지고 있다.

이게 함수형 인터페이스이다.

추가로 인터페이스가 함수형 인터페이스임을 명시적으로 선언할 수 있다.
바로 @ (어노테이션)을 사용하는 방법이다.

이 어노테이션은 @FuntionalInterface 라고 쓴다.

```java
@FunctionalInterface
interface FInterface {
    public void aaa();
}
```

위에서와 같이 명시적으로 이 인터페이스가 함수형 인터페이스임을 명시했다면,
이 인터페이스가 두 개 이상의 추상 메서드를 가질 경우 컴파일 시기에 에러를 보여준다.

즉, 다음과 같이 사용할 수 없다.

```java
@FunctionalInterface
interface FInterface {
    public void aaa();
    public void bbb();
}
```

이렇게 작성할 경우 1번 라인에
#### Invalid '@FunctionalInterface' annotation; FInterface is not a functional interface
라는 오류를 발생한다.

 @FunctionalInterface를 명시할 경우 두 개 이상의 추상메서드를 가질 수 없도록 컴파일 시기에 에러를 발생할 뿐이다.
굳이 명시하지 않더라도 추상메서드가 하나일 경우 함수형 인터페이스로 인식하는데는 문제가 없다.

람다식에 대해서 말하고 있는데 왜 갑자기 함수형 인터페이스에 대해서 언급하는 것일까?

당연히 밀접한 관련이 있기 때문이다.

람다식이란 다른 말로 ***익명함수***라고도 부른다.

익명함수란 이름이 없는 함수라는 말이다.

사용함에서의 장점은 ***코드가 간결***해지고 ***뷸팔요한 반복이 제거***되며 ***동일 함수에 대한 재사용성***이 좋아진다.

이렇게 필요한 부분에 대해서만 작성하기 때문에 더 나은 퍼포먼스를 기대할 수도 있다.

더 나은 퍼포먼스에 대해서는 객체를 만드는 과정을 생략하기 때문이다.

```java
Runnable r1 = new Runnable() {
    @Override
    public void run() {

    }
};

Runnable r2 = () -> { };
```

위에서 선언한 r1와 r2는 완전히 동일한 것으로 간주할 수 있다.
1라인에서는 new 라는 연산자를 통해 객체를 생성하고 있다.
반면 8라인에서 람다식을 사용할 경우 객체 생성없이 함수를 호출하듯 바로 사용이 가능하다.
이제부터 람다식의 더 자세한 사용 방법에 대해 알아보자.

람다식은 자바 진영 에서도 이제부터 함수형 언어를 지원하겠다는 것을 의미한다.

함수는 보퉁 y = f(x) 라고 표현한다.

이것의 의미는 f라는 이름의 함수에 x값을 넣으면 y값을 결과로 받아볼 수 있음을 뜻한다.

즉, 람다식도 동일하다.

( ) -> { } 이렇게 표현하는 람다식은

***( ) 이 안에 매개변수를 넣고 { } 안의 로직을 수행한다.***

매개변수가 x이고 이 x값을 화면에 출력하는 람다식을 작성해보자.

```java
public class FuntionalInterfaceExample {
    public static void main(String[] ar) {
        FInterface fi = (x) -> {
            System.out.println(x);
        };
        fi.aaa(10);
    }
}

interface FInterface {
    public void aaa(int x);
}
```

위 소스의 실행 결과는 콘솔창에 10이라는 값을 출력하는 것이다.

3라인의 (x)가 { ... } 에서 사용할 매개변수를 뜻하며, { ... }안에서 x변수를 출력하는 예제이다.

이번엔 두 개의 매개변수를 받아 출력하는 예제를 작성해보자.

```java
public class FuntionalInterfaceExample {
    public static void main(String[] ar) {
        FInterface fi = (x, y) -> {
            System.out.println(x+y);
        };
        fi.aaa(10, 20);
    }
}

interface FInterface {
    public void aaa(int x, int y);
}
```

위 소스의 실행 결과는 콘솔팡에 30이라는 값을 출력하는 것이다.

만약 람다식이 없었다면 어떻게 작성했을지 비교를 위해 람다식을 사용하지 않은 소스 코드를 첨부한다.

```java
public class FuntionalInterfaceExample {
    public static void main(String[] ar) {
        /*
        FInterface fi = (x) -> {
            System.out.println(x);
        };
        fi.aaa(10);
        */
        FInterface fi2 = new FInterface() {
            @Override
            public void aaa(int x, int y) {
                System.out.println(x+y);
            }
        };
        fi2.aaa(10, 20);
    }
}

interface FInterface {
    public void aaa(int x, int y);
}
```

그렇다면 이 람다식은 기존의 방식처럼 new 연산자를 사용해서 어떤 인터페이스를 사용할지 명시해주지도 않았는데 어떤 인터페이스를 사용할지 결정했을까?

람다식은 ***내가 담길 변수의 타입에 해당하는 인터페이스를 사용하도록*** 만들어졌다.

즉, 내가 FInterface fi 라고 하는 순간 FInterface의 추상메서드를 알아서 호출하도록 되어 있기 때문에 해당 인터페이스의 매개변수와 리턴타입만 맞춰주면 나머지는 알아서 처리한다.

마지막으로 이 람다식에서 생략 가능한 부분이 있고 함수형 인터페이스를 사용하기 때문에 발생하는 람다식 안에서 사용하는 변수의 제한적인 부분에 대해서는 다음에 살펴보겠다.
