이전에 왜 제네릭이 나왔는지 알았다면,

[*(java 제네릭 (Generic), 내가 알아보기 쉽게 정리 - 1편, 왜 제네릭)*](http://xxxelppa.tistory.com/34)

이번에는 기본적인 제네릭 사용 방법에 대해 정리를 해보려 한다.

우선 <> 이 다이아몬드 괄호라고 불리는걸 보면 일단 '제네릭이다' 라고 생각하면 된다.

제네릭은 크게 ​**클래스​**에 적용할 수 있고 또 ​**메서드​**에도 적용해서 사용할 수 있다.

1. 클래스에 사용할 때는 아래와 같은 형태를 갖는다.

```java
package com.xxxelppa.generic;

public class GenericTest {
    public static void main(String[] ar) {
        Generic_sub<Integer> gs = new Generic_sub<Integer>();
    }
}
class Generic_sub<T> {
    private T num1;
    private T num2;
}
```

8라인에서 T라고 작성한 부분은 5라인에서 <>안에 작성한 **Reference Type의 클래스**가 전달되는 곳이다.

그래서 지금의 경우 5라인에서 Integer Wrapper Class를 사용한다고 했기 때문에

지금의 경우 gs객체는 Generic_sub 클래스의 두 멤버 필드 param1과 param2의 자료형이 Integer Type으로 생성했음을 뜻한다.

그리고 8라인의 <> 안에 작성한 문자의 형태로 클래스 내부에서 사용할 수 있다.

9, 10 라인에서가 그 예를 보여주는 경우이다.

2. 메서드에서 사용할 때는 아래와 같은 형태를 갖는다.

```java
package com.xxxelppa.generic;

public class GenericTest {
    public static void main(String[] ar) {
        Generic_sub<Integer> gs = new Generic_sub<Integer>();
        gs.setParam1(10);
        gs.setParam2(20);
        System.out.println(gs.printParamNum(gs.getParam1(), gs.getParam2()));
    }
}
class Generic_sub<T> {
    private T param1;
    private T param2;

    public T getParam1() { return param1; }
    public T getParam2() { return param2; }

    public void setParam1(T param1) { this.param1 = param1; }
    public void setParam2(T param2) { this.param2 = param2; }

    public <T> StringBuffer printParamNum(T param1, T param2) {
        StringBuffer str = new StringBuffer();
        str.append("첫 번째 매개변수 : ");
        str.append(param1);
        str.append(", 두 번째 매개변수 : ");
        str.append(param2);
        return str;
    }
}
```

위의 소스를 보면, 지금까지 제네릭을 사용하지 않고

/. 정수 두 개를 setter를 통해 객체의 멤버필드 값에 할당하고

/. getter를 통해 해당 객체의 메서드에 매개변수 두 개를 넘겨주어 출력하는 것

의 흐름과 똑같다.

그저 조금 다른 점이 있다면, 클래스명 뒤에 <T>로 타입을 외부에서 받아온다는 것을 명시해준 부분과, 21라인에 return type 앞에 내가 메서드 안에서 사용할 매개변수 타입을 <>안에 추가작성했다는 것뿐이다.

그렇게 복잡하고 어려운 코드가 아니라서 쉽게 이해가 될 것 같다.

아래는 실행 결과이다.

![0067-35-java-generic-2-img-01.png](/tech-blog/resources/images/migration/0067-35-java-generic-2/img-01.png)

그럼 다음으로, 제네릭의 장점이 무었이었을까?

내가 사용할 데이터 타입을 외부에서 정할 수 있다는 것이다.

그런 의미에서 아래 소스를 보자.

위의 소스에 객체만 하나 더 생성했을 뿐이다.

```java
package com.xxxelppa.generic;

public class GenericTest {
    public static void main(String[] ar) {
        Generic_sub<Integer> gs = new Generic_sub<Integer>();
        // 이번에 새로 추가한 부분 1
        Generic_sub<String> gs2 = new Generic_sub<String>();

        gs.setParam1(10);
        gs.setParam2(20);
        // 이번에 새로 추가한 부분 2
        gs2.setParam1("고구마");
        gs2.setParam2("감자");

        System.out.println(gs.printParamNum(gs.getParam1(), gs.getParam2()));
        // 이번에 새로 추가한 부분 3
        System.out.println(gs.printParamNum(gs2.getParam1(), gs2.getParam2()));
    }
}
class Generic_sub<T> {
    private T param1;
    private T param2;

    public T getParam1() { return param1; }
    public T getParam2() { return param2; }

    public void setParam1(T param1) { this.param1 = param1; }
    public void setParam2(T param2) { this.param2 = param2; }

    public <T> StringBuffer printParamNum(T param1, T param2) {
        StringBuffer str = new StringBuffer();
        str.append("첫 번째 매개변수 : ");
        str.append(param1);
        str.append(", 두 번째 매개변수 : ");
        str.append(param2);
        return str;
    }
}
```

새로 추가된 7라인을 보면

바로 위에 기존에 작성했던 라인과의 차이는 <Integer>부분이 <String>으로 변경된 것 뿐이다.

이렇게 해당 클래스에서 사용할 데이터 타입을 외부에서 정해줄 수 있어서

데이터 타입을 고려하지 않은 상태에서 동일한 작업을 하는 클래스에 대해

데이터 타입별로 클래스를 생성할 필요 없이 하나의 클래스에서 데이터 타입만 바꿔 조립하듯 코드 재활용이 된다는 것이다.

아래는 실행 결과이다.

![0067-35-java-generic-2-img-02.png](/tech-blog/resources/images/migration/0067-35-java-generic-2/img-02.png)

그러면 왜 제네릭을 사용하는지 이전 1편에서보다 더 정확히 느껴질거라고 생각된다.

마지막으로 다룰 내용은, 이 제네릭에서 내가 객체 생성시 사용하려고 하는 데이터타입에 대한 '제한'을 줄 수 있는데

그 부분에 대해서 알아보자.

우선 이 제한을 두는 배경에 대해 생각해보자.

만약 위와같이 소스를 작성해두면 어떤점이 불편(?)할까?

일상생활에서 흔히 일어날 수 있는 일을 가지고 예를 들어보자.

내일 손님이 집에 오기로 약속해서, 내일 손님에게 과일을 대접하기 위해 과일을 담을 바구니를 하나 샀다고 하자.

신선한 과일을 대접하기 위해 과일은 내일 아침에 살 생각으로 바구니를 집에 그냥 두었다.

그리고 다음날이 되었는데 이게 왠걸, 빨랫감이 한가득 들어가 있는게 아닌가?

이럴줄 알았으면 '**이 바구니는 과일을 담을 바구니**'라고 써서 붙여둘걸 그랬다.

여기서 '**이 바구니는 과일을 담을 바구니**'라고 하는것이 '**여기에는 과일만 담으세요**'라는 제약을 건것과 마찬가지이다.

이렇게 제약을 명시해주지 않으면 그곳에 빨래가 들어갈지 아니면 누군가 코 푼 휴지를 담아버릴지 모르기 때문이다.

예시가 적절했는지는 모르겠지만, 아래 소스를 한 번 보자.

```java
package com.xxxelppa.generic;

public class GenericTest {
    public static void main(String[] ar) {
        Generic_sub<Integer> gs = new Generic_sub<Integer>();
        gs.setParam1(10);
        gs.setParam2(20);

        System.out.println(gs.addParam(gs.getParam1(), gs.getParam2()));

    }
}
class Generic_sub<T extends Number> {
    private T param1;
    private T param2;

    public T getParam1() { return param1; }
    public T getParam2() { return param2; }

    public void setParam1(T param1) { this.param1 = param1; }
    public void setParam2(T param2) { this.param2 = param2; }

    public Double addParam(T param1, T param2) {
        Double d1 = param1.doubleValue();
        Double d2 = param2.doubleValue();

        return d1 + d2;
    }
}
```

 Integer 클래스는 Number 클래스의 자식임을 알고 있어야 한다.

눈에 확 들어오는 달라진 부분은 바로 13라인의 <T extends Number> 이 부분이다.

여기서 extends는 일반적으로 클래스간 상속시 사용되는 예약어와는 조금 다른 뜻을 가진다.

T로 전달받은 데이터 타입은 Number 클래스의 자식 클래스이다. 라는 뜻을 가진다.

이렇게 타입을 제한하였기 때문에 행여나 5라인의 소스를

```java
Generic_sub<String> gs = new Generic_sub<String>();
```

이렇게 고치기라도 한다면

```java
Multiple markers at this line
    - Bound mismatch: The type String is not a valid substitute for the bounded parameter <T extends
     Number> of the type Generic_sub<T>
```

이렇게 Parameter가 잘못 되었다고, Number클래스의 자식이 아니라고 에러를 보여준다.

데이터 타입을 제한하게 되면 얻을 수 있는 이점이 있다.

그것은 상속 관계에서 그 의미를 알 수 있는데,

24, 25라인에서 사용한 .doubleValue() 가 바로 그 해답이다.

이게 왜? 라고 생각한다면 조금만 더 스스로 생각해보길 권한다.

상속관계에서 자식은 부모의 모든 것을 가져다 사용할 수 있다.

그렇기 때문에 '부모가 가지고 있는 메서드의 기능을 모든 자식들이 동일하게 가지고 있다라는게 확실하기 때문에'

위의 예시처럼 Number 클래스가 가지고 있는 .doubleValue()에 대해서 안전하게 가져다 사용할 수 있는 것이다.

즉, 그냥 무턱대고 <T> 라고 작성하여 아무 데이터타입이나 들어올 수 있게 해주었다면 아래와 같은 상황이 벌어지게 되는 것이다.

```java
package com.xxxelppa.generic;

public class GenericTest {
    public static void main(String[] ar) {
        Generic_sub<String> gs = new Generic_sub<String>();
        gs.setParam1("string");
        gs.setParam2("not number");

        System.out.println(gs.addParam(gs.getParam1(), gs.getParam2()));

    }
}
class Generic_sub<T> {
    private T param1;
    private T param2;

    public T getParam1() { return param1; }
    public T getParam2() { return param2; }

    public void setParam1(T param1) { this.param1 = param1; }
    public void setParam2(T param2) { this.param2 = param2; }

    public Double addParam(T param1, T param2) {
        Double d1 = Double.parseDouble((String)param1);
        Double d2 = Double.parseDouble((String)param2);

        return d1 + d2;
    }
}
```

컴파일시 아무런 오류가 검출되지 않기 때문에 사용자는 문제가 없다라고 판단할 수 있다.

*(지금은 짧은 코드지만 나중에 복잡해지면 실수하기 마련이고 **예상하지 못한 입력이 생길 수 있기 때문**이다.)*

아래는 위 소스의 실행 결과이다.

![0067-35-java-generic-2-img-03.png](/tech-blog/resources/images/migration/0067-35-java-generic-2/img-03.png)

이러한 경우를 방지하기 위해서 데이터 타입을 제한하는 것이 필요하다.

이번 포스팅으로 마무리가 될 줄 알았는데 생각보다 길어진것 같아서 정리해야할 것 같다.

다음번에 데이터 타입을 제한하는 super에 대해서 알아보고

와일드 카드에 대해 알아보면서 제네릭의 기본적인 사용 방법에 대한 정리를 마무리 해야겠다.
