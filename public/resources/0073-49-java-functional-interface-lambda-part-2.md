1편에서 람다식에서 생략 가능한 부분이 있고, 함수형 인터페이스를 사용하기 때문에 발생하는 람다식 안에서 사용하는 변수의 제한적인 부분이 있다고 했었다.

***우선 람다식에서 생략 가능한 문법에 대해서 정리 해보자.***

추상메서드의 매개변수에 따라 생략 가능한 부분이 조금 다르기 때문에, parameter가 있는 경우와 없는 경우로 나누어 살펴보자.

## 1. parameter : 없음

```java
public class FunctionalInterfaceExample {
    public static void main(String[] ar) {
        // 매개변수가 없는 경우 ()는 무조건 작성해 줘야 한다.
        FInterface fi_1 = () -> { };

        // 구현부가 여러 라인인 경우 { } 안에 작성해야 한다.
        FInterface fi_2 = () -> {
            String msg = "Hello";
            System.out.println(msg);
        };

        // 구현부가 1라인인 경우 { }를 생략할 수 있다.
        FInterface fi_3 = () -> System.out.println("Hello");

        fi_1.aaa();
        fi_2.aaa();
        fi_3.aaa();
    }
}

interface FInterface {
    public void aaa();
}
```

## 2. parameter : 있음

```java
public class FunctionalInterfaceExample {
    public static void main(String[] ar) {
        // 기본형
        FInterface fi_1 = (x) -> { };

        // 매개변수가 1개인 경우 ()를 생략할 수 있다.
        FInterface fi_2 = x -> { };

        // 구현부가 여러 라인인 경우 { } 안에 작성해야 한다.
        FInterface fi_3 = (x) -> {
            String msg = "Hello";
            System.out.println(msg + " : " + x);
        };

        // 구현부가 1라인인 경우 { }를 생략할 수 있다.
        FInterface fi_4 = (x) -> System.out.println("Hello" + " : " + x);

        // 매개변수가 1개인 경우 ()를 생략할 수 있고, 구현부가 1라인인 경우 { }를 생략할 수 있다.
        FInterface fi_5 = x -> System.out.println("Hello" + " : " + x);

        fi_1.aaa(10);
        fi_2.aaa(20);
        fi_3.aaa(30);
        fi_4.aaa(40);
        fi_5.aaa(50);
    }
}

interface FInterface {
    public void aaa(int x);
}
```

***마지막으로 람다식 구현부 안에서 사용한 변수는 수정할 수 없다는 제약이 존재한다.***

즉, final 변수로 취급된다.

```java
public class FunctionalInterfaceExample {
    public static void main(String[] ar) {

        int tmp = 10;
        tmp = 200;

        FInterface fi = (x) -> {
            System.out.println("x : " + x);
        };
    }
}

interface FInterface {
    public void aaa(int x);
}
```

위의 경우 람다식 안에서 아직 tmp 변수를 사용하고 있지 않기 때문에 아무런 문제가 없다.

하지만 다음과 같은 경우 문제가 된다.

```java
public class FunctionalInterfaceExample {
    public static void main(String[] ar) {

        int tmp = 10;
        tmp = 200;
        FInterface fi = (x) -> {
            System.out.println("x : " + x);
            // Local variable tmp defined in an enclosing scope must be final or effectively final
            System.out.println("tmp : " + tmp);
        };
    }
}

interface FInterface {
    public void aaa(int x);
}
```

이렇게 람다식 안에서 사용할 변수들에 대해서는 final 변수 취급이 되기 때문에 5라인에서처럼 값을 수정할 수 없다.

8라인은 5라인에서의 오류 메시지를 보여준다.

```java
public class FunctionalInterfaceExample {
    public static void main(String[] ar) {

        final int tmp = 10;
        // tmp = 200;
        FInterface fi = (x) -> {
            System.out.println("x : " + x);
            // Local variable tmp defined in an enclosing scope must be final or effectively final
            System.out.println("tmp : " + tmp);
        };
    }
}

interface FInterface {
    public void aaa(int x);
}
```

그렇기 때문에 람다식 안에서 사용 할 변수들에 대해서는 위의 4라인과 같이 final 을 명시적으로 작성해주는 것이 가독성에 더 좋다.

이렇게 람다식 안에서 사용하는 변수가 final 취급받는 이유는,

이 람다식이 함수형 ***인터페이스***이기 때문이다.

인터페이스에서 선언된 멤버필드는 기본적으로 생략하더라도 무조건 ***static final***형태이기 때문이다.

그래서 람다식도 결국 ***익명 함수를 구현하는 함수형 인터페이스***이기 때문에 사용하는 변수도 final의 성격을 가질 수 밖에 없다.
