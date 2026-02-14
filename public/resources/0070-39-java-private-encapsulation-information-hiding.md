다른 언어에도 있지만, 이 '접근 제한자'라는 개념이 있다.

단어에서도 느껴지듯 내가 아닌 다른 곳(혹은 것)에서의 접근을 제한하겠다는 의미이다.

모두에게 공개하지 않겠다는 말.

보통 네가지 종류의 접근 제한자가 있다.

1. public

> 접근을 제한하지 않는다.
>
> 모두의 접근을 허용한다.
>
> 그래서 보통 클래스의 멤버 메소드는 이 public을 사용해서 작성한다.
>
> 왜?
>
> 생각해보면 단순하다. 내가 만든 이 기능 모두가 널리널리 사용했으면 좋겠으니까?

2. protected

> 동일한 패키지 내에 존재하거나, 다른 패키지에 존재한다면 상속을 받은 경우에만 접근이 가능하다.

3. package

> 아무런 접근제한자를 명시하지 않으면 이 package라고 생각하면 된다.
>
> default값으로 동일한 패키지 내에서만 자유롭게 접근이 가능하다.

4. private

> 자기 자신의 클래스 내에서만 접근이 가능하다.
>
> 그래서 보통 클래스의 멤버 필드는 이 private을 사용해서 작성한다.
>
> 그 이유는 아래 예시로 살펴보자.

***멤버 필드를 ​보통 private 접근 제한자로 사용하는 이유​***

다음 원의 넓이를 구하는 소스를 살펴보자.

[소스1]

```java
package com.xxxelppa.Example;

public class Example {
    public static void main(String[] ar) {
        Calc cp = new Calc();

        System.out.println("원의 넓이 : " + cp.getArea(2.0));
    }
}

class Calc {
    public double pi = 3.14;

    public double getArea(double r) {
        return r*r*pi;
    }
}
```

[소스1 실행결과]

![0070-39-java-private-encapsulation-information-hiding-img-01.png](/tech-blog/resources/images/migration/0070-39-java-private-encapsulation-information-hiding/img-01.png)

​***보통 저런 pi와 같은 값은 final키워드를 사용해서 정의하는게 더 편리하긴 하다.***

***그리고 심지어 pi값은 java.lang 패키지의 Math클래스 하위에 static final 변수 PI에 미리 정의 되어있기도 하다.***

***그저 설명을 위한 설정인 예시이다.​***

만약 이 클래스를 받아 사용하는 사람이 나쁜(?)마음을 먹고

'아 나는 pi값이 3.14인게 너무 싫어, 통크게 한 31.4였으면 좋겠어!'

라고해서 다음과 같이 소스를 고쳐 사용할 수 있다.

[소스2]

```java
package com.xxxelppa.Example;

public class Example {
    public static void main(String[] ar) {
        Calc cp = new Calc();

        System.out.println("before 원의 넓이 : " + cp.getArea(2.0));
        System.out.println("아닛 나는 이 결과가 마음에 안들어!!");

        cp.pi = 31.4;
        System.out.println("after 원의 넓이 : " + cp.getArea(2.0));
    }
}

class Calc {
    public double pi = 3.14;

    public double getArea(double r) {
        return r*r*pi;
    }
}
```

[소스2 실행결과]

![0070-39-java-private-encapsulation-information-hiding-img-02.png](/tech-blog/resources/images/migration/0070-39-java-private-encapsulation-information-hiding/img-02.png)

Calc 클래스의 멤버필드 pi가 static으로 선언되어있지 않기 때문에 객체를 통해 접근을 시도했다.

이 때 멤버필드 pi의 접근 제한자가 public이기 때문에 그 어느 곳에서도 Calc 객체를 통해 접근할 수 있다.

10라인에서 바로 그 모습을 보여주고 있다.

이렇게되면 이 클래스를 배포한 개발자의 의도대로 프로그램이 동작하지 않게 된다.

지금은 단순히 원의 넓이가 10배가 되는 상황이지만,

은행에서 사용하는 이율값에 저렇게 접근이 가능하다면

*(뭐 나중에 걸리겠지만)*

나쁜 마음을 먹은 사람들이 마음대로 이율을 조절할 수 있다면 어떨까?

그래서 해당 클래스에서만 접근 가능하도록 제한하며,

​***해당 클래스를 개발한 개발자의 의도에 맞게만 접근할 수 있도록 멤버 메소드를 public으로 제공***​하는 것이 일반적이다.

다음은 그 예를 보여준다.

[소스3]

```java
package com.xxxelppa.Example;

public class Example {
    public static void main(String[] ar) {
        Calc cp = new Calc();

        System.out.println("before 원의 넓이 : " + cp.getArea(2.0));
        cp.setPi(31.4);

        System.out.println("after 원의 넓이 : " + cp.getArea(2.0));
        //cp.pi = 31.4;
        //System.out.println("after 원의 넓이 : " + cp.getArea(2.0));
    }
}

class Calc {
    private double pi = 3.14;

    public double getPi() {
        return pi;
    }

    public void setPi(double pi) {
        System.out.println("pi 값은 사용자가 설정할 수 없습니다.");
    }

    public double getArea(double r) {
        return r*r*pi;
    }
}
```

[소스3 실행결과]

![0070-39-java-private-encapsulation-information-hiding-img-03.png](/tech-blog/resources/images/migration/0070-39-java-private-encapsulation-information-hiding/img-03.png)

11라인은 현재 Calc클래스의 멤버 필드인 pi가 private 접근 제한자를 사용하고 있기 때문에 컴파일 되지 않아 주석으로 막아놓았다.

그렇기 때문에 해당 값에 접근을 하려면 개발자가 제공한 멤버 메소드를 통할 수 밖에 없다.

19라인과 23라인에서 작성한 메소드는 일반적으로 외부에서 멤버필드에 접근하기 위한 메소드를 정의한 것으로

getter, setter 메소드 라고도 한다.

보통 아래와 같은 형태를 가진다.

```java
class GetterSetterTemplate {
    private int number;

    public int getNumber() {
        return this.number;
    }

    public void setNumber(int number) {
        this.number;
    }
}
```

2라인에서 멤버 필드를 private으로 선언하고

getter인 경우 4라인에서 처럼 get뒤에 멤버필드를 써주고 this.멤버필드를 반환한다.

setter인 경우 8라인에서 처럼 set뒤에 멤버필드를 써주고 해당 멤버 타입의 매개변수를 받아

'this.멤버필드 = 매개변수' 형태로 작성하는것이 일반적이다.

하지만 꼭 이렇게 써야만 하는것은 아니라는걸 표현하고 싶어서 [소스3]의 23라인처럼 setter 메소드를 작성해 보았다.

즉, 해당 변수의 값을 바꾸고 싶다면 개발자가 정의한 setter메소드를 통해서 ***​프로그램 작성시 의도한 형태로만 바뀔 수 있도록***​ 유도하는 것이다.

궁금해 할것 같아서 아래 private으로 선언된 멤버필드에 접근하려면 어떻게 되는지 컴파일 결과를 추가한다.

1. 객체를 생성하고 객체를 통해 값을 변경하려고 하는 경우

```java
package com.xxxelppa.Example;

public class Example {
    public static void main(String[] ar) {
        Calc cp = new Calc();

        cp.pi = 31.4;
    }
}

class Calc {
    private double pi = 3.14;
}
```

![0070-39-java-private-encapsulation-information-hiding-img-04.png](/tech-blog/resources/images/migration/0070-39-java-private-encapsulation-information-hiding/img-04.png)

2. private static 으로 선언된 멤버필드에 클래스 이름으로 접근해서 값을 변경하려고 하는 경우

```java
package com.xxxelppa.Example;

public class Example {
    public static void main(String[] ar) {
        Calc.pi = 31.4;
    }
}

class Calc {
    private static double pi = 3.14;
}
```

![0070-39-java-private-encapsulation-information-hiding-img-05.png](/tech-blog/resources/images/migration/0070-39-java-private-encapsulation-information-hiding/img-05.png)

그럼 자연 스럽게 Encapsulation과 Information Hiding에 대해 알아보자.

사실 알아볼 것도 없는게, 얘도 이름만 거창하지, 이미 위의 예제에서 사용했다.

***클래스의 ​멤버 필드에 대해 private 접근 제한을 걸고, 멤버 메소드에 대해 public 접근을 허용하는 것이 바로 정보 은닉화 라고도 하는 Information Hiding이다.​***

개발자의 의도대로만 데이터(멤버 필드)에 접근하도록 하는것,

외부에서의 직접적인 데이터 접근을 막는것,

이것이 Information Hiding이다.

그럼 캡슐화라고도 하는 Encapsulation은?

종종 정보 은닉화와 캡슐화를 혼용해서 사용하는 곳이 많다.

개인적인 생각이지만 이 두가지를 함수와 메소드 처럼 구분해서 이해했으면 좋겠다.

캡슐화는 하나의 클래스에는 한가지의 추상화된 개념에 대한 속성와 메소드로만 이루어지도록 작성하는 것이다.

간단한 예를들면, 위에서 작성한 Calc 클래스 멤버 메소드로 String paperColor; 라는게 선언 되어 있다라고 가정하자.

계산을 하는데 전혀 상관없이 뜬금없는 종이 색상에 대한 속성값을 가지고 있는 것이다.

그럼 다중에 혹시라도 종이 생상을 사용해야한다고 하면, 그것을 사용하기 위해서 Calc 클래스의 객체를 생성해야 할까?

적절한 예를 들었는지 모르겠지만, 결론은 하나의 메소드는 하나의 기능만 하도록 만드는 것이 좋듯이

하나의 클래스에는 하나의 추상화된 개념에 대한 속성과 메소드로 구성하는 것이 좋다라는 것이다.

(가독성에도, 분석에도, 유지보수 수정을 할 경우에도)

마지막으로 이 두가지를 구분했으면 하는 바람이 있는 이유는,

캡슐화라는 말이 어떤 의미에서는 밖에서 접근하지 못하도록 꽁꽁 싸매고 있는듯한 느낌이지만

하나의 추상화된 개념에 대해 정의를 했다라고 하더라도 멤버 필드를 public으로 선언하면

캡슐화는 되었지만 은닉화가 이루어지지 않았다고 볼 수 있다 생각하기 때문이다.
