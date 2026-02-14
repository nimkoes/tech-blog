## 자바의 람다식에 대해 학습하세요.

---

### 학습할 것

- 람다식 사용법
- 함수형 인터페이스
- Variable Capture
- 메소드, 생성자 레퍼런스

---

람다식을 사용하기에 앞서 **익명 구현 객체**라는 것에 대해 알면 좋다.

익명 구현 객체는 인터페이스나 클래스의 객체를 생성해서 사용할 때, 재사용하지 않는 경우 보통 사용한다.

예를 들어 보자.

특정 인터페이스를 사용하기 위해 이 인터페이스를 상속 받은 클래스를 구현하는 방법이 있다.

```java
package me.xxxelppa.study.week15;

public class Exam_001 {
    public static void main(String[] args) {
        Exam_001_Sub exam_001_sub = new Exam_001_Sub();
        exam_001_sub.doSomething();
    }
}

interface AnonymousTest_001 {
    void doSomething();
}

// 인터페이스를 구현한 클래스 정의
class Exam_001_Sub implements AnonymousTest_001 {
    @Override
    public void doSomething() {
        System.out.println("do something !!");
    }
}
```

<table>
<tbody>
<tr>
<td><span>do something !!</span></td>
</tr>
</tbody>
</table>

그런데 만약 Exam_001_Sub 클래스가 AnonymousTest 인터페이스의 구현체로만 사용하고, Exam_001_Sub 클래스가 재사용 되지 않는다고 하면 새로운 클래스 파일을 생성해서 관리하는게 부담이 될 수 있다.

그래서 다음과 같이 **별도의 클래스를 작성하지 않고** 인터페이스를 바로 구현하여 사용하는 방법이 있는데, 이것을 익명 구현 객체라고 부른다. (작성하지 않지만 별도의 클래스 파일이 생성 된다. 본문의 아래쪽에서 자세히 다룬다.)

```java
package me.xxxelppa.study.week15;

public class Exam_002 {
    public static void main(String[] args) {
        AnonymousTest_002 anonymousTest_002 = new AnonymousTest_002() {
            @Override
            public void doSomething() {
                System.out.println("do something !!");
            }
        };

        anonymousTest_002.doSomething();
    }
}

interface AnonymousTest_002 {
    void doSomething();
}
```

<table>
<tbody>
<tr>
<td><span>do something !!</span></td>
</tr>
</tbody>
</table>

람다식 얘기에 앞서 굳이 익명 구현 객체에 대해 언급한 이유는 람다식이 이 익명 구현 객체와 생긴게 비슷하기 때문이다.

그래서 간혹 람다식이 간결하게 표현한 익명 구현 객체 처럼 생각 되지만 실제로 생성되는 코드를 보면 전혀 다르다는 것을 알 수 있다.

자세한 내용은 뒤쪽에 정리해 두었다.

#### 함수형 인터페이스

---

람다식의 사용 방법에 정리하기에 앞서 함수형 인터페이스에 대해서 알아야 한다.

말이 거창해서 그렇지 결론부터 얘기하면**추상 메소드가 하나뿐인 인터페이스**를 함수형 인터페이스라고 한다.

즉, 다음과 같은 인터페이스들을 모두 함수형 인터페이스에 속한다.

```java
package me.xxxelppa.study.week15;

public class Exam_003 {
}

interface FunctionalInterface_001 {
    void aaa();
}

// 함수형 인터페이스는 @FunctionalInterface 를 사용해서 명시적으로 컴파일러에게 알려줄 수 있다.
// @FunctionalInterface 를 사용하면 다른 사람이 추상 메소드를 추가하는 상황을 예방할 수 있다.
@FunctionalInterface
interface FunctionalInterface_002 {
    void aaa();

    // static 메소드가 있어도 괜찮다.
    static void bbb() { }

    // default 메소드가 있어도 괜찮다.
    default void ccc() { }
}
```

위에 선언한 두 개의 인터페이스의 특징은, 이 인터페이스를 상속 받은 클래스가 반드시 구현해야하는 **추상 메소드가 한 개** 뿐이라는 것이다.

추가로 오버라이드 한 메소드에 대해 @Override 애노테이션을 붙여주는 것을 기억 할 것이다.

이 애노테이션은 작성하지 않아도 동작하는데 문제가 없지만

붙여 줌으로 컴파일 타임에 Override 된 것이 맞는지 확인하는 것과, 코드를 읽는 입장에서 재정의 된 메소드임을 인지할 수 있다.

비슷한 맥락에서 함수형 인터페이스도 @FunctionalInterface 라는 애노테이션을 붙여줄 수 있다.

이 애노테이션을 붙이면 컴파일러가 해당 인터페이스에 **추상 메소드가 1개만 선언 되었는지 확인**해주며

다른 사람이 이 코드를 보고 **추상 메소드를 추가하는 문제를 예방**할 수 있다.

만약 이 애노테이션이 작성 되어있는데, 복수개의 추상 메소드가 정의되어 있다면 IntelliJ IDE 기준으로 다음와 같은 메시지를 보여준다.

"Multiple non-overriding abstract methods found in interface me.xxxelppa.study.week15.FunctionalInterface_002"

#### 람다식 사용법

---

람다식은 생략 가능한 부분이 꽤 많기 때문에 헷갈릴 수 있지만, 기본적으로 화살표를 기준으로 좌측에 매개변수가 우측에 실행 코드가 작성 된다는 것을 기억하면 된다.

(매개변수) -> { 실행 코드 }

위의 형태를 기준으로 String 타입의 문자열을 받아서 그대로 출력하는 경우를 생각해보자.

```java
package me.xxxelppa.study.week15;

public class Exam_004 {
    public static void main(String[] args) {

        // 1. 작성 가능한 모든 내용을 생략 없이 작성한 경우
        LambdaTest_001 myTest_01 = (String param) -> {
            System.out.println(param);
        };

        // 2. 매개변수의 타입을 생략한 경우
        LambdaTest_001 myTest_02 = (param) -> {
            System.out.println(param);
        };

        // 3. 매개변수가 한개여서 소괄호를 생략한 경우
        LambdaTest_001 myTest_03 = param -> {
            System.out.println(param);
        };

        // 4. 실행 코드가 한 줄이어서 중괄호를 생략한 경우
        LambdaTest_001 myTest_04 = (String param) -> System.out.println(param);

        // 5. 매개변수가 한개이고 실행 코드가 한 줄이어서 생략 가능한 모든것을 생략한 경우
        LambdaTest_001 myTest_05 = param -> System.out.println(param);

        // 6. 반환값이 있는 경우 return 키워드 사용하는 경우
        LambdaTest_002 myTest_06 = (n1, n2) -> {
            System.out.println("6. 반환값이 있는 경우 return 키워드 사용하는 경우");
            return n1 + n2;
        };

        // 7. 실행 코드가 반환 코드만 존재하는 경우 키워드와 중괄호 생략한 경우
        LambdaTest_002 myTest_07 = (n1, n2) -> n1 + n2;

        // 8. 매개변수가 없어서 소괄호를 생략할 수 없는 경우
        LambdaTest_003 myTest_08 = () -> System.out.println("8. 매개변수가 없어서 소괄호를 생략할 수 없는 경우");

        myTest_01.printString("1. 작성 가능한 모든 내용을 생략 없이 작성한 경우");
        myTest_02.printString("2. 매개변수의 타입을 생략한 경우");
        myTest_03.printString("3. 매개변수가 한개여서 소괄호를 생략한 경우");
        myTest_04.printString("4. 실행 코드가 한 줄이어서 중괄호를 생략한 경우");
        myTest_05.printString("5. 매개변수가 한개이고 실행 코드가 한 줄이어서 생략 가능한 모든것을 생략한 경우");

        System.out.println();
        System.out.println(myTest_06.add(10, 20));
        System.out.println(myTest_07.add(20, 30));

        myTest_08.noArgs();
    }
}

@FunctionalInterface
interface LambdaTest_001 {
    void printString(String str);
}

@FunctionalInterface
interface LambdaTest_002 {
    int add(int num1, int num2);
}

@FunctionalInterface
interface LambdaTest_003 {
    void noArgs();
}
```

<table>
<tbody>
<tr>
<td><span>1.&nbsp;작성&nbsp;가능한&nbsp;모든&nbsp;내용을&nbsp;생략&nbsp;없이&nbsp;작성한&nbsp;경우 </span><br><span>2.&nbsp;매개변수의&nbsp;타입을&nbsp;생략한&nbsp;경우 </span><br><span>3.&nbsp;매개변수가&nbsp;한개여서&nbsp;소괄호를&nbsp;생략한&nbsp;경우 </span><br><span>4.&nbsp;실행&nbsp;코드가&nbsp;한&nbsp;줄이어서&nbsp;중괄호를&nbsp;생략한&nbsp;경우 </span><br><span>5.&nbsp;매개변수가&nbsp;한개이고&nbsp;실행&nbsp;코드가&nbsp;한&nbsp;줄이어서&nbsp;생략&nbsp;가능한&nbsp;모든것을&nbsp;생략한&nbsp;경우 </span><br><span>6.&nbsp;반환값이&nbsp;있는&nbsp;경우&nbsp;return&nbsp;키워드&nbsp;사용하는&nbsp;경우 </span><br><span>30 </span><br><span>50 </span><br><span>8.&nbsp;매개변수가&nbsp;없어서&nbsp;소괄호를&nbsp;생략할&nbsp;수&nbsp;없는&nbsp;경우</span></td>
</tr>
</tbody>
</table>

람다식을 사용할 때 타겟 타입 이라는 것이 존재한다.

타겟 타입이란, 람다식은 기본적으로 '인터페이스 변수'에 담기는데, 이**람다식이 담기는 인터페이스를 타겟 타입**이라고 한다.

즉, 위에 작성한 예제 코드 기준으로 LambdaTest_001 과 LambdaTest_002 를 타겟 타입이라고 할 수 있다.

람다식을 사용할 때 타겟 타입이 중요한 이유는, 위에서 봐서 알겠지만, **람다식만 보고는 이게 어떤 함수형 인터페이스를 구현한 것인지** 유추할 수 없기 때문이다.

() -> System.out.println("who am I .. ? ");

이것을 보고 void 타입의 매개변수가 없는 추상 메소드를 구현 했다는 것은 알 수 있지만

정확히 어떤 타겟 타입을 사용한 것인지(어떤 함수형 인터페이스를 사용 했는지) 모호하기 때문이다.

추가로 람다식 관련하여 자바 표준 API 가 존재한다.

필요한 경우 직접 함수형 인터페이스를 정의해서 사용해도 무관하지만, 자주 사용하는 형태에 대해 표준으로 정의해서 제공하고 있으니

특별한 경우(?)가 아니라면 직접 인터페이스를 정의해서 사용하는 일은 많지 않을 거라 생각한다.

아래는 처음 람다식을 공부했을 당시 정리했던 표이다.

(혹시 오타가 있다면 이 때 당시 전부 타이핑 했었기 때문이니 양해 부탁 드립니다.)

<table>
<tbody>
<tr>
<td><span>종류</span></td>
<td><span>추상메소드 특징</span></td>
<td><span>인터페이스명</span></td>
<td><span>추상메소드</span></td>
<td><span>andThen()</span></td>
<td><span>compose()</span></td>
<td><span>and()</span><br><span>or()</span><br><span>negate()</span></td>
<td><span>설명</span></td>
</tr>
<tr>
<td><span>Consumer</span></td>
<td><span>매개값은 있고,</span><br><span>리턴값은 없음</span></td>
<td><span>Consumer&lt;T&gt;</span></td>
<td><span>void accept(T t)</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T를 받아 소비</span></td>
</tr>
<tr>
<td><span>BiConsumer&lt;T, U&gt;</span></td>
<td><span>void accept(T t, U u)</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T와 U를 받아 소비</span></td>
</tr>
<tr>
<td><span>DoubleConsumer</span></td>
<td><span>void accept(double value)</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>double 값을 받아 소비</span></td>
</tr>
<tr>
<td><span>IntConsumer</span></td>
<td><span>void accept(int value)</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>int 값을 받아 소비</span></td>
</tr>
<tr>
<td><span>LongConsumer</span></td>
<td><span>void accept(long value)</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>long 값을 받아 소비</span></td>
</tr>
<tr>
<td><span>ObjDoubleConsumer</span></td>
<td><span>void accept(T t, double value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T와 double 값을 받아 소비</span></td>
</tr>
<tr>
<td><span>ObjIntConsumer</span></td>
<td><span>void accept(T t, int value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T와 int 값을 받아 소비</span></td>
</tr>
<tr>
<td><span>ObjLongConsumer</span></td>
<td><span>void accept(T t, long value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T와 long 값을 받아 소비</span></td>
</tr>
<tr>
<td><span>Supplier</span></td>
<td><span>매개값은 없고,</span><br><span>리턴값은 있음</span></td>
<td><span>Supplier&lt;T&gt;</span></td>
<td><span>T get()</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>T 객체를 리턴</span></td>
</tr>
<tr>
<td><span>BooleanSupplier</span></td>
<td><span>boolean getAsBoolean()</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>boolean 값을 리턴</span></td>
</tr>
<tr>
<td><span>DoubleSupplier</span></td>
<td><span>double getAsDouble()</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>double 값을 리턴</span></td>
</tr>
<tr>
<td><span>IntSupplier</span></td>
<td><span>int getAsInt()</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>int 값을 리턴</span></td>
</tr>
<tr>
<td><span>LongSupplier</span></td>
<td><span>long getAsLong()</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>long 값을 리턴</span></td>
</tr>
<tr>
<td><span>Function</span></td>
<td><span>매개값도 있고,</span><br><span>리턴값도 있음</span><br><span>주로 매개값을</span><br><span>리턴값으로 매핑</span><br><span>(타입변환)</span></td>
<td><span>Function&lt;T, R&gt;</span></td>
<td><span>R apply(T t)</span></td>
<td><span>O</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>객체 T를 객체 R로 매핑</span></td>
</tr>
<tr>
<td><span>BiFunction&lt;T, U, R&gt;</span></td>
<td><span>R apply(T t, U u)</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T와 U를 객체 R로 매핑</span></td>
</tr>
<tr>
<td><span>DoubleFunction&lt;R&gt;</span></td>
<td><span>R apply(double value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>double을 객체 R로 매핑</span></td>
</tr>
<tr>
<td><span>IntFunction&lt;R&gt;</span></td>
<td><span>R apply(int value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>int를 객체 R로 매핑</span></td>
</tr>
<tr>
<td><span>IntToDoubleFunction</span></td>
<td><span>double applyAsDouble(int value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>int를 double로 매핑</span></td>
</tr>
<tr>
<td><span>IntToLongFunction</span></td>
<td><span>long applyAsLong(int value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>int를 long으로 매핑</span></td>
</tr>
<tr>
<td><span>LongToDoubleFunction</span></td>
<td><span>double applyAsDouble(long value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>long을 double로 매핑</span></td>
</tr>
<tr>
<td><span>LongToIntFunction</span></td>
<td><span>int applyAsInt(long value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>long을 int로 매핑</span></td>
</tr>
<tr>
<td><span>ToDoubleBiFunction&lt;T, U&gt;</span></td>
<td><span>double applyAsDouble(T t, U u)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T와 U를 double로 매핑</span></td>
</tr>
<tr>
<td><span>ToDoubleFunction&lt;T&gt;</span></td>
<td><span>double applyAsDouble(T t)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T를 double로 매핑</span></td>
</tr>
<tr>
<td><span>ToIntBiFunction&lt;T, U&gt;</span></td>
<td><span>int applyAsInt(T t, U u)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T와 U를 int로 매핑</span></td>
</tr>
<tr>
<td><span>ToIntFunction&lt;T&gt;</span></td>
<td><span>int applyAsInt(T t)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T를 int로 매핑</span></td>
</tr>
<tr>
<td><span>ToLongBiFunction&lt;T, U&gt;</span></td>
<td><span>long applyAsLong(T t, U u)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T와 U를 long으로 매핑</span></td>
</tr>
<tr>
<td><span>ToLongFunction&lt;T&gt;</span></td>
<td><span>long applyAsLong(T t)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>객체 T를 long으로 매핑</span></td>
</tr>
<tr>
<td><span>Operator</span></td>
<td><span>매개값도 있고,</span><br><span>리턴값도 있음</span><br><span>주로 매개값을</span><br><span>연산하고 결과를 리턴</span></td>
<td><span>BinaryOperator&lt;T&gt;</span></td>
<td><span>BiFunction&lt;T, U, R&gt;의 하위 인터페이스</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>T와 U를 연산한 후 R리턴</span><br><span>두 개의 static method</span><br><span>&nbsp;&nbsp; minBy(Comparator&lt;? Super T&gt; comparator)</span><br><span>&nbsp;&nbsp; maxBy(Comparator&lt;? Super T&gt; comparator)</span></td>
</tr>
<tr>
<td><span>UnaryOperator&lt;T&gt;</span></td>
<td><span>Function&lt;T, T&gt;의 하위 인터페이스</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>T를 연산한 후 T리턴</span></td>
</tr>
<tr>
<td><span>DoubleBinaryOperator</span></td>
<td><span>double applyAsDouble(double, double)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>두 개의 double 연산</span></td>
</tr>
<tr>
<td><span>DoubleUnaryOperator</span></td>
<td><span>double applyAsDouble(double)</span></td>
<td><span>O</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>한 개의 double 연산</span></td>
</tr>
<tr>
<td><span>IntBinaryOperator</span></td>
<td><span>int applyAsInt(int, int)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>두 개의 int 연산</span></td>
</tr>
<tr>
<td><span>IntUnaryOperator</span></td>
<td><span>int applyAsInt(int)</span></td>
<td><span>O</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>한 개의 int 연산</span></td>
</tr>
<tr>
<td><span>LongBinaryOperator</span></td>
<td><span>long applyAsLong(long, long)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>두 개의 long 연산</span></td>
</tr>
<tr>
<td><span>LongUnaryOperator</span></td>
<td><span>long applyAsLong(long)</span></td>
<td><span>O</span></td>
<td><span>O</span></td>
<td><span>　</span></td>
<td><span>한 개의 long 연산</span></td>
</tr>
<tr>
<td><span>Predicate</span></td>
<td><span>매개값은 있고,</span><br><span>리턴타입은 boolean</span><br><span>매개값을 조사해서</span><br><span>true/false를 리턴</span></td>
<td><span>Predicate&lt;T&gt;</span></td>
<td><span>boolean test(T t)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>O</span></td>
<td><span>객체 T를 조사</span></td>
</tr>
<tr>
<td><span>BiPredicate&lt;T, U&gt;</span></td>
<td><span>boolean test(T t, U u)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>O</span></td>
<td><span>객체 T와 U를 비교 조사</span></td>
</tr>
<tr>
<td><span>DoublePredicate</span></td>
<td><span>boolean test(double value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>O</span></td>
<td><span>double 값을 조사</span></td>
</tr>
<tr>
<td><span>IntPredicate</span></td>
<td><span>boolean test(int value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>O</span></td>
<td><span>int 값을 조사</span></td>
</tr>
<tr>
<td><span>LongPredicate</span></td>
<td><span>boolean test(long value)</span></td>
<td><span>　</span></td>
<td><span>　</span></td>
<td><span>O</span></td>
<td><span>long 값을 조사</span></td>
</tr>
</tbody>
</table>

(한빛미디어, 이것이 자바다. 신용권의 Java 프로그래밍 정복 2권 참고)

각 API 마다 모든 예제 코드를 작성하는 것을 나열하는 것은 별다른 의미가 없을 것 같다.

개인적으로 코드는 작성 하겠지만 여기에는 불필요하게 길어질 것 같아 생략 하려고 한다.

메소드, 생성자 레퍼런스에 대해 정리 하면서 Operator 와 Function에 대해 간접적으로 사용 예시를 작성할 예정이다.

#### Variable Capture

---

람다식의 실행 코드 블록 내에서 클래스의 멤버 필드와 멤버 메소드, 그리고 지역 변수를 사용할 수 있다.

클래스의 멤버 필드와 멤버 메소드는 특별한 제약 없이 사용 가능하지만, 지역변수를 사용함에 있어서는 제약이 존재한다.

이 내용을 잘 이해하기 위해서는 JVM 의 메모리에 대해 조금은 알아야 한다.

잠시 람다식이 아닌 다른 얘기를 해보자.

멤버 메소드 내부에서 클래스의 객체를 생성해서 사용 할 경우 다음과 같은 문제가 있다.

익명 구현 객체를 포함해서 객체를 생성 할 경우 new 라는 키워드를 사용 한다.

이 키워드를 사용한다는 것은 **동적 메모리 할당 영역(이하 heap)**에 객체를 생성한다는 것을 의미한다.

이렇게 생성된 객체는 자신을 감싸고 있는 멤버 메소드의 실행이 끝난 이후에도 heap 영역에 존재하므로 사용할 수 있지만

이 멤버 메소드에 정의 된 매개변수나 지역 변수는 **런타임 스택 영역(이하 stack)**에 할당되어 메소드 실행이 끝나면 해당 영역에서 사라져 더 이상 사용할 수 없게 된다.

그렇기 때문에 멤버 메소드 내부에서 생성된 객체가 자신을 감싸고 있는 메소드의 매개변수나 지역변수를 사용하려 할 때 문제가 생길 수 있다.

조금 더 쉽게 처음부터 설명 하면

1. 클래스의 멤버 메소드의 매개변수와 이 메소드 실행 블록 내부의 지역 변수는 JVM의 stack에 생성되고

메소드 실행이 끝나면 stack에서 사라진다.

2. new 연산자를 사용해서 생성한 객체는 JVM의 heap 영역에 객체가 생성되고 GC (Garbage Collector)에 의해 관리되며, 더 이상 사용하지 않는 객체에 대해 필요한 경우 메모리에서 제거한다.

heap에 생성된 객체가 stack의 변수를 사용하려고 하는데, 사용하려는 시점에 stack에 더 이상 해당 변수가 존재하지 않을 수 있다. 왜냐하면 stack은 메소드 실행이 끝나면 매개변수나 지역변수에 대해 제거하기 때문이다. 그래서 더 이상 존재하지 않는 변수를 사용하려 할 수 있기 때문에 오류가 발생한다.

자바는 이 문제를 Variable Capture 라고 하는 값 복사를 사용해서 해결하고 있다.

즉, 컴파일 시점에 멤버 메소드의 매개변수나 지역 변수를 멤버 메소드 내부에서 생성한 객체가 사용 할 경우 객체 내부로 값을 복사해서 사용한다. 하지만 모든 값을 복사해서 사용할 수 있는 것은 아니다.

여기에도 제약이 존재하는데 final 키워드로 작성 되었거나 final 성격을 가져야 한다.

final 키워드로 작성 되는 것은 알겠는데, 성격을 가진다는 것은 무엇일까.

final 성격을 가진다는 것은 final 키워드로 선언된 것은 아니지만 **​값이 한 번만 할당**되어​ final 처럼 쓰이는 것을 뜻한다.

(java 1.7 까지는 final 을 반드시 명시 했어야 했고, final 을 생략하고 쓸 수 있는 건 java 1.8 부터로 기억한다.)

final 키워드 유무에 따라 값이 복사 되는 위치가 달라지는데, 다음과 같이 복사 된다.

```java
package me.xxxelppa.study.week15;

public class Exam_005 {
    public void testMethod(final String myFinalString_01, String myString_01) {
        final String myFinalString_02 = "myFinalString_02";
        String myString_02 = "myString_02";

        class VariableCaptureTest {
            // final 명시하지 않은 경우 멤버 필드로 복사
            // String myString_01
            // String myString_02
            void print() {
                // final 명시한 경우 지역 변수로 복사
                // String myFinalString_01
                // String myFinalString_02
//                System.out.println(myFinalString_01 + " :: " + myFinalString_02);
//                System.out.println(myString_01 + " :: " + myString_02);
            }
        }

        new VariableCaptureTest().print();
    }

    public static void main(String[] args) {
        Exam_005 exam_005 = new Exam_005();
        exam_005.testMethod("myFinalString_01", "myString_01");
    }
}
```

09 ~11 라인, 13 ~ 15 라인은 컴파일 시 생성 될 것으로 예상한 내용을 정리한 것이다.

호기심이 생겨서 16, 17 라인을 사용 할 때와 안 할 때 생성되는 바이트 코드를 비교해 보았다.

![0107-207-java-live-study-week-15-lambda-img-01.jpg](/tech-blog/resources/images/migration/0107-207-java-live-study-week-15-lambda/img-01.jpg)

![0107-207-java-live-study-week-15-lambda-img-02.jpg](/tech-blog/resources/images/migration/0107-207-java-live-study-week-15-lambda/img-02.jpg)

당장 눈에 띄는 것은 중첩 클래스 때문에 '외부_클래스'${숫자}'내부_클래스'.class 클래스 파일이 추가로 생성 되었다.

비교 결과 값 복사를 볼 수 확인할 수 있었는데, 예상했던 것과 조금 다른 결과가 나왔다.

1. final 키워드를 사용한 매개변수 : 값 복사가 일어남

2. final 키워드를 사용한 지역변수 : final 키워드가 사라지고 값 복사가 일어나지 않음

3. final 키워드를 사용하지 않은 매개변수 : final 키워드가 생성되고 값 복사가 일어남

4. final 키워드를 사용하지 않은 지역변수 : final 키워드가 생성되고 값 복사가 일어남

결과가 조금 이상한 것 같아서 디컴파일 된 결과가 아닌 바이트 코드를 열어 보았다.

<table>
<tbody>
<tr>
<td><span>//&nbsp;class&nbsp;version&nbsp;55.0&nbsp;(55)</span><br><span>//&nbsp;access&nbsp;flags&nbsp;0x21</span><br><span>public&nbsp;class&nbsp;me/xxxelppa/study/week15/Exam_005&nbsp;{</span><br><br><span>&nbsp; // compiled from: Exam_005.java</span><br><span>&nbsp;&nbsp;NESTMEMBER&nbsp;me/xxxelppa/study/week15/Exam_005$1VariableCaptureTest</span><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x0</span><br><span>&nbsp;&nbsp;INNERCLASS&nbsp;me/xxxelppa/study/week15/Exam_005$1VariableCaptureTest&nbsp;null&nbsp;VariableCaptureTest</span><br><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x1</span><br><span>&nbsp;&nbsp;public&nbsp;&lt;init&gt;()V</span><br><span>&nbsp;&nbsp;&nbsp;L0</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;3&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKESPECIAL&nbsp;java/lang/Object.&lt;init&gt;&nbsp;()V </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;RETURN </span><br><span>&nbsp;&nbsp;&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;this&nbsp;Lme/xxxelppa/study/week15/Exam_005;&nbsp;L0&nbsp;L1&nbsp;0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXSTACK&nbsp;=&nbsp;1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXLOCALS&nbsp;=&nbsp;1</span><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x1 </span><br><span>&nbsp;&nbsp;public&nbsp;testMethod(Ljava/lang/String;Ljava/lang/String;)V </span><br><span>&nbsp;&nbsp;&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;5&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LDC&nbsp;"myFinalString_02" </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ASTORE&nbsp;3 </span><br><span>&nbsp;&nbsp;&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;6&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LDC&nbsp;"myString_02" </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ASTORE&nbsp;4 </span><br><span>&nbsp;&nbsp;&nbsp;L2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;21&nbsp;L2 </span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;NEW&nbsp;me/xxxelppa/study/week15/Exam_005$1VariableCaptureTest</b> </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;DUP </span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;0 </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;1 </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;2 </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;4</b></span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKESPECIAL me/xxxelppa/study/week15/Exam_005$1VariableCaptureTest.&lt;init&gt;&nbsp;(Lme/xxxelppa/study/week15/Exam_005;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKEVIRTUAL&nbsp;me/xxxelppa/study/week15/Exam_005$1VariableCaptureTest.print&nbsp;()V</span><br><span>&nbsp;&nbsp;&nbsp;L3 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;22&nbsp;L3 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;RETURN </span><br><span>&nbsp;&nbsp;&nbsp;L4</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;this&nbsp;Lme/xxxelppa/study/week15/Exam_005;&nbsp;L0&nbsp;L4&nbsp;0 </span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;myFinalString_01&nbsp;Ljava/lang/String;&nbsp;L0&nbsp;L4&nbsp;1 </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;myString_01&nbsp;Ljava/lang/String;&nbsp;L0&nbsp;L4&nbsp;2 </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;myFinalString_02&nbsp;Ljava/lang/String;&nbsp;L1&nbsp;L4&nbsp;3 </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;myString_02&nbsp;Ljava/lang/String;&nbsp;L2&nbsp;L4&nbsp;4</b> </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXSTACK&nbsp;=&nbsp;6 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXLOCALS&nbsp;=&nbsp;5 </span><br><br><span>&nbsp;&nbsp;// access flags 0x9</span><br><span>&nbsp;&nbsp;public&nbsp;static&nbsp;main([Ljava/lang/String;)V </span><br><span>&nbsp;&nbsp;&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;25&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;NEW&nbsp;me/xxxelppa/study/week15/Exam_005 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;DUP </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKESPECIAL&nbsp;me/xxxelppa/study/week15/Exam_005.&lt;init&gt;&nbsp;()V </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ASTORE&nbsp;1 </span><br><span>&nbsp;&nbsp;&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;26&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LDC&nbsp;"myFinalString_01" </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LDC&nbsp;"myString_01"</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKEVIRTUAL&nbsp;me/xxxelppa/study/week15/Exam_005.testMethod&nbsp;(Ljava/lang/String;Ljava/lang/String;)V</span><br><span>&nbsp;&nbsp;&nbsp;L2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;27&nbsp;L2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;RETURN </span><br><span>&nbsp;&nbsp;&nbsp;L3 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;args&nbsp;[Ljava/lang/String;&nbsp;L0&nbsp;L3&nbsp;0</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;exam_005&nbsp;Lme/xxxelppa/study/week15/Exam_005;&nbsp;L1&nbsp;L3&nbsp;1</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXSTACK&nbsp;=&nbsp;3 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXLOCALS&nbsp;=&nbsp;2 </span><br><span>}</span></td>
</tr>
</tbody>
</table>

자세한 내용은 모르겠지만 찾아보니 ALOAD 명령은 스택 영역의 값을 읽어오는 명령이라고 한다.

그리고 눈여겨 봐야 할 부분은 'NEW me/xxxelppa/study/week15/Exam_005$1VariableCaptureTest' 이 부분인데,

중첩 클래스에 대해 새로운 객체를 생성하는 것으로 보인다.

이 주제의 마지막 부분에 람다식을 컴파일 한 결과 어떤 결과가 나오는지 확인해볼 예정이니 꼭 기억했으면 좋겠다.

heap 영역에 존재하는 객체가 stack 영역의 변수를 안전하게 사용할 수 있도록 값 복사를 하는 것은 알겠다.

그럼 복사하는 변수는 왜 final 이어야 할까?

final 이라는 것은 값을 변경할 수 없도록 하겠다는 것을 의미하는데, 값이 변경 가능하다면 문제가 생길 수 있기 때문이다.

사본을 사용하고 있는데 원본을 외부에서 변경 할 수 있다면, 객체 내부에서 그 값을 마음 놓고 사용할 수 없기 때문이다.

그러면 자연스럽게, 이런 멤버 메소드의 매개변수나 지역변수가 아닌, 인스턴스 변수에 대해서는 특별한 제약이 없다는 것에 대해 의문이 풀린다.

왜냐하면 그런 인스턴스 변수들은 기본적으로 heap 영역에 존재하기 때문에, 위와 같이 별도로 값을 복사해서 사용 할 필요 없이 직접 heap 영역에 접근해서 사용하면 되기 때문이다.

그럼 다시 람다 얘기로 돌아와서, 일반적으로 람다식은 클래스의 멤버 메소드 내부에서 사용 된다.

그렇기 때문에 람다식 내부에서 사용하는 외부 변수들에 대해 위에서 얘기한 동일한 문제가 발생하고, 이 문제를 해결하기 위해 Variable Capture 를 한다.

궁금하니까 간단한 람다식을 정의하고 컴파일 해보았다.

```java
package me.xxxelppa.study.week15;

public class Exam_011 {
    public static void main(String[] args) {

        MyFunctionalInterface mfi_1 = new MyFunctionalInterface() {
            @Override
            public void doProc() {
                System.out.println("익명 구현 객체");
            }
        };
        mfi_1.doProc();

        MyFunctionalInterface mfi_2 = () -> System.out.println("람다식");
        mfi_2.doProc();
    }
}

@FunctionalInterface
interface MyFunctionalInterface {
    void doProc();
}
```

<table>
<tbody>
<tr>
<td><span>익명 구현 객체</span><br><span>람다식</span></td>
</tr>
</tbody>
</table>

![0107-207-java-live-study-week-15-lambda-img-03.jpg](/tech-blog/resources/images/migration/0107-207-java-live-study-week-15-lambda/img-03.jpg)

intelliJ 가 너무 좋은(?)건지 익명 구현 객체에 대한 클래스 파일이 보이지 않아 직접 폴더를 찾아 들어갔다.

<table>
<tbody>
<tr>
<td><span>class&nbsp;Exam_011$1&nbsp;implements MyFunctionalInterface&nbsp;{</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;Exam_011$1()&nbsp;{</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;} </span><br><br><span>&nbsp;&nbsp;&nbsp;&nbsp;public&nbsp;void&nbsp;doProc()&nbsp;{</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println("익명 구현 객체");</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;} </span><br><span>}</span></td>
</tr>
</tbody>
</table>

익명 구현 객체에 대해서는 클래스 파일이 별도로 생겼는데 람다식에 대한 클래스 파일은 생기지 않았다.

확인해보지 않았지만, 바로 위에서 살펴본 예제에서 중첩 클래스에 대해 NEW 키워드가 있었던 것으로 보아

이 코드도 바이트코드를 확인해보면 같은 내용이 있을 것 같다.

그럼 람다식은 어떻게 동작하는 걸까. 굉장히 익명 구현 객체를 사용하는 것처럼 보였는데 실제 결과는 매우 달랐기 때문에 궁금하니까 바이트코드를 열어 보았다.

이 코드의 바이트 코드를 보면 특이한 걸 볼 수 있다.

<table>
<tbody>
<tr>
<td><span>//&nbsp;class&nbsp;version&nbsp;55.0&nbsp;(55) </span><br><span>//&nbsp;access&nbsp;flags&nbsp;0x21 </span><br><span>public&nbsp;class&nbsp;me/xxxelppa/study/week15/Exam_011&nbsp;{</span><br><span>&nbsp;&nbsp;//&nbsp;compiled&nbsp;from: Exam_011.java</span><br><span>&nbsp;&nbsp;NESTMEMBER&nbsp;me/xxxelppa/study/week15/Exam_011$1</span><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x0 </span><br><span>&nbsp;&nbsp;INNERCLASS&nbsp;me/xxxelppa/study/week15/Exam_011$1&nbsp;null&nbsp;null</span><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x19 </span><br><span>&nbsp;&nbsp;public&nbsp;final&nbsp;static&nbsp;INNERCLASS&nbsp;java/lang/invoke/MethodHandles$Lookup&nbsp;java/lang/invoke/MethodHandles&nbsp;Lookup</span><br><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x1 </span><br><span>&nbsp;&nbsp;public&nbsp;&lt;init&gt;()V </span><br><span>&nbsp;&nbsp;&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;3&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKESPECIAL&nbsp;java/lang/Object.&lt;init&gt;&nbsp;()V </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;RETURN </span><br><span>&nbsp;&nbsp;&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;this&nbsp;Lme/xxxelppa/study/week15/Exam_011;&nbsp;L0&nbsp;L1&nbsp;0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXSTACK&nbsp;=&nbsp;1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXLOCALS&nbsp;=&nbsp;1 </span><br><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x9 </span><br><span>&nbsp;&nbsp;public&nbsp;static&nbsp;main([Ljava/lang/String;)V </span><br><span>&nbsp;&nbsp;&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;6&nbsp;L0 </span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;NEW&nbsp;me/xxxelppa/study/week15/Exam_011$1</b> </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;DUP </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKESPECIAL&nbsp;me/xxxelppa/study/week15/Exam_011$1.&lt;init&gt;&nbsp;()V </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ASTORE&nbsp;1 </span><br><span>&nbsp;&nbsp;&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;12&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKEINTERFACE&nbsp;me/xxxelppa/study/week15/MyFunctionalInterface.doProc&nbsp;()V&nbsp;(itf)</span><br><br><span>&nbsp;&nbsp;&nbsp;L2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;14&nbsp;L2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;<b>INVOKEDYNAMIC&nbsp;</b>doProc()Lme/xxxelppa/study/week15/MyFunctionalInterface;&nbsp;[</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;handle&nbsp;kind&nbsp;0x6&nbsp;:&nbsp;INVOKESTATIC </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;java/lang/invoke/LambdaMetafactory.metafactory(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite;</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;arguments: </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;()V,&nbsp; </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;handle&nbsp;kind&nbsp;0x6&nbsp;:&nbsp;INVOKESTATIC</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;me/xxxelppa/study/week15/Exam_011.lambda$main$0()V,&nbsp;</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;()V </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;] </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ASTORE&nbsp;2 </span><br><span>&nbsp;&nbsp;&nbsp;L3 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;15&nbsp;L3 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKEINTERFACE&nbsp;me/xxxelppa/study/week15/MyFunctionalInterface.doProc&nbsp;()V&nbsp;(itf)</span><br><span>&nbsp;&nbsp;&nbsp;L4 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;16&nbsp;L4 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;RETURN </span><br><span>&nbsp;&nbsp;&nbsp;L5 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;args&nbsp;[Ljava/lang/String;&nbsp;L0&nbsp;L5&nbsp;0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;mfi_1&nbsp;Lme/xxxelppa/study/week15/MyFunctionalInterface;&nbsp;L1&nbsp;L5&nbsp;1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;mfi_2&nbsp;Lme/xxxelppa/study/week15/MyFunctionalInterface;&nbsp;L3&nbsp;L5&nbsp;2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXSTACK&nbsp;=&nbsp;2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXLOCALS&nbsp;=&nbsp;3 </span><br><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x100A</span><br><span>&nbsp;&nbsp;private&nbsp;static&nbsp;synthetic&nbsp;lambda$main$0()V </span><br><span>&nbsp;&nbsp;&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;14&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;GETSTATIC&nbsp;java/lang/System.out&nbsp;:&nbsp;Ljava/io/PrintStream;</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LDC&nbsp;"\ub78c\ub2e4\uc2dd" </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKEVIRTUAL&nbsp;java/io/PrintStream.println&nbsp;(Ljava/lang/String;)V</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;RETURN </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXSTACK&nbsp;=&nbsp;2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXLOCALS&nbsp;=&nbsp;0 </span><br><span>}</span></td>
</tr>
</tbody>
</table>

예상 했던 대로 익명 구현 객체에 대해서는 NEW 를 사용해서 객체도 생성 된 것으로 보이고 또 별도의 클래스 파일도 생긴걸 확인 했다.

람다식이 쓰인 부분에 대해서는 invokedynamic 이라는 opcode 를 사용했는데,

java 1.8 부터 생긴 것으로 interface 의 default method 와 lambda 식에서 사용 된다고 한다.

람다 내부 동작에 대해 참고가 된 글을 링크로 남긴다.

[람다의 내부동작 #1](https://tourspace.tistory.com/11)

[람다의 내부동작 #2](https://tourspace.tistory.com/12?category=788398)

복잡하다면 익명 구현 객체를 사용 할 때와 람다식을 사용했을 때 다음과 같은 차이점이 있다는 것만 기억하면 된다.

1. **람다식은** 익명 구현 객체 처럼 별도의 객체를 생성하거나 컴파일 결과 **별도의 클래스를 생성하지 않는다**는 것

2. **람다식 내부에서 사용하는 변수는** Variable Capture(값 복사)가 발생하며, 이 값은 **final이거나 final 처럼 사용**해야 한다는 것

사실 사용하는 입장에서는 **'인스턴스 변수를 제외하고 람다식 내부에서 사용하는 변수는 final이거나 final 성격을 가져야 한다'** 고 기억하면 별 문제 없긴 하다.

#### 메소드, 생성자 레퍼런스

---

메소드, 생성자 레퍼런스는 람다식을 더 간략하게 표현할 수 있게 해준다..

콜론 두 개 :: 를 사용하며, 크게 다음과 같이 구분할 수 있다.

1. static 메소드 참조

=> 클래스_이름::메소드_이름

2. 인스턴스 메소드 참조

=> 인스턴스_변수::메소드_이름

3. 람다식의 매개변수로 접근 가능한 메소드 참조

=> 매개변수의_타입_클래스_이름::메소드_이름

4. 생성자 참조

=> 클래스_이름::new

로 사용할 수 있다.

각 경우에 대한 간단한 예시를 작성해 보았다.

우선 1, 2, 3번에 해당하는 예제는 다음과 같다.

```java
package me.xxxelppa.study.week15;

import java.util.function.BiFunction;
import java.util.function.IntBinaryOperator;
import java.util.function.ToIntBiFunction;

public class Exam_006 {
    public static void main(String[] args) {

        // int 타입 두 개를 받아 int 타입을 반환하는 표준 api 사용
        IntBinaryOperator op;

        // static method 참조
        op = (num_01, num_02) -> MyReference.add_static(num_01, num_02);
        System.out.println(op.applyAsInt(10, 20));

        op = MyReference::add_static;
        System.out.println(op.applyAsInt(20, 30));

        // instance method 잠조
        MyReference mr = new MyReference();

        op = (num_01, num_02) -> mr.add_instance(num_01, num_02);
        System.out.println(op.applyAsInt(30, 40));

        op = mr::add_instance;
        System.out.println(op.applyAsInt(40, 50));

        // 람다식의 매개변수로 접근 가능한 메소드 참조
        //
        // 만약 (x, y) -> x.instanceMethod(y) 인 경우가 있는데
        // 이런 경우 사용할 수 있는 방법은 아래와 같다.
        //
        // 아래 코드는 x 문자열에 y 문자열이 포함되어 있는지 결과를 반환하는 예제이다.
        // String 클래스의 contains 를 사용 한다.
        //
        // 이 경우 static method 참조와 형태가 매우 유사해 보이지만
        // x의 타입에 속하는 클래스 다음에 :: 연산자를 사용해서 메소드 참조를 한다.
        BiFunction<String, String, Boolean> myBiFunction;
        myBiFunction = (x, y) -> x.contains(y);
        System.out.println(myBiFunction.apply("java study", "java"));

        myBiFunction = String::contains;
        System.out.println(myBiFunction.apply("java online study", "python"));
    }
}

class MyReference {
    // static method
    public static int add_static(int num_1, int num_2) {
        return num_1 + num_2;
    }

    // instance method
    public int add_instance(int num_1, int num_2) {
        return num_1 + num_2;
    }
}
```

<table>
<tbody>
<tr>
<td><span>30</span><br><span>50</span><br><span>70</span><br><span>90</span><br><span>true</span><br><span>false</span></td>
</tr>
</tbody>
</table>

다음은 생성자 참조의 예제이다.

```java
package me.xxxelppa.study.week15;

import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Supplier;

public class Exam_007 {
    public static void main(String[] args) {

        BiFunction<String, Integer, ConstructorRefTest> bf;
        Function<String, ConstructorRefTest> f;
        Supplier<ConstructorRefTest> s;

        bf = (param_1, param_2) -> new ConstructorRefTest(param_1, param_2);
        System.out.println(bf.apply("nimkoes", 17).toString());

        System.out.println();

        s = ConstructorRefTest::new;
        System.out.println("기본 생성자 : " + s.get().toString());

        f = ConstructorRefTest::new;
        System.out.println("String 하나를 받는 생성자 : " + f.apply("nimkoes").toString());

        bf = ConstructorRefTest::new;
        System.out.println("String, int 두 개를 받는 생성자 : " + bf.apply("xxxelppa", 71).toString());

    }
}

class ConstructorRefTest {
    String name;
    int age;

    public ConstructorRefTest() {
    }

    public ConstructorRefTest(String name) {
        this.name = name;
    }

    public ConstructorRefTest(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "ConstructorRefTest{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```

<table>
<tbody>
<tr>
<td><span>ConstructorRefTest{name='nimkoes',&nbsp;age=17} </span><br><br><span>기본&nbsp;생성자&nbsp;:&nbsp;ConstructorRefTest{name='null',&nbsp;age=0} </span><br><span>String&nbsp;하나를&nbsp;받는&nbsp;생성자&nbsp;:&nbsp;ConstructorRefTest{name='nimkoes',&nbsp;age=0} </span><br><span>String,&nbsp;int&nbsp;두&nbsp;개를&nbsp;받는&nbsp;생성자&nbsp;:&nbsp;ConstructorRefTest{name='xxxelppa',&nbsp;age=71}</span></td>
</tr>
</tbody>
</table>

---

마지막으로 함수형 프로그래밍에 대해서 생각해보려 한다.

#### 1급 시민 또는 1급 객체 (First-class citizen)

다음의 세 가지 조건을 모두 만족하는 것들을 말한다.

1. 변수에 할당할 수 있다.

2. 매개변수로 사용할 수 있다.

3. 반환 값으로 사용할 수 있다.

당장 생각나는 대표적인 예는 javascript 의 function 이다.

```javascript
function myFunc() {
    console.log("문자열을 출력 합니다.");
}

(function myMainFunc(param) {
    // 매개변수로 사용 가능
    console.log("매개변수로 전달 된 함수 실행");
    param();
    console.log("");

    // 변수에 할당 가능
    let myVal = param;
    console.log("변수에 담긴 함수 실행");
    myVal();
    console.log("");

    let returnVal = (function () { return param; })();
    console.log("반환 결과 변수에 담긴 함수 실행");
    returnVal();
    console.log("");

})(myFunc);
```

![0107-207-java-live-study-week-15-lambda-img-04.png](/tech-blog/resources/images/migration/0107-207-java-live-study-week-15-lambda/img-04.png)

갑자기 javascript 코드가 나와서 좀 그렇지만

javascript 에서 함수는 변수에 담을 수 있고, 매개변수로도 전달 가능하며, 반환 값으로도 사용할 수 있다.

그렇기 때문에 javascript 에서 함수는 유명한 1급 시민 객체이다.

다시 자바 얘기를 해보자.

혹시 지금까지 자바 코드를 작성 하면서 메소드를 변수에 담아 전달해본 적이 있었을까?

메소드는 클래스에 종속되어 객체로 전달 하거나 객체를 반환한 적은 있어도, 메소드 자체를 전달해본 적은 없다.

그래서 자바의 메소드는 1급 시민 객체가 아니다.

하지만 자바의 람다식은 변수에 담을 수 있고, 매개변수로 전달할 수 있으며, 반환 값으로 사용할 수 있다.

```java
package me.xxxelppa.study.week15;

public class Exam_009 {
    public static void main(String[] args) {

        // 변수에 저장
        MyInterface mi = () -> System.out.println("변수에 저장 된 람다식");
        mi.print();

        // 매개변수로 전달
        doProc(() -> System.out.println("매개변수로 전달 된 람다식"));

        // 반환 값으로 사용
        getProc().print();
    }

    public static void doProc(MyInterface mi) {
        mi.print();
    }

    public static MyInterface getProc() {
        return () -> System.out.println("반환 값으로 사용 된 람다식");
    }
}

interface MyInterface {
    void print();
}
```

<table>
<tbody>
<tr>
<td><span>변수에&nbsp;저장&nbsp;된&nbsp;람다식 </span><br><span>매개변수로&nbsp;전달&nbsp;된&nbsp;람다식 </span><br><span>반환&nbsp;값으로&nbsp;사용&nbsp;된&nbsp;람다식</span></td>
</tr>
</tbody>
</table>

람다식이 세가지 조건을 만족하기 때문에 1급 시민 객체인 것은 알겠는데, 그래서 뭐가 좋다는 걸까

앞서 람다식의 Variable Capture 에 대해 정리 하면서 언급한 내용을 기억해야 한다.

heap 영역에 생성된 객체가 stack 영역의 변수를 안정적으로 사용하기 위해 final 또는 final 성격을 가져야 한다.

즉, 변할 수 있는 것을 변하지 않도록 제한을 둔 것이다. 이것을 불변 상태(Immutable)로 만든다고 한다.

불변 상태로 만든다는 것에 대해 잘 이해가 되지 않는다면, 조금 더 쉬운 말로 '외부의 상태에 독립적'이라고 표현할 수 있다.

외부의 상태에 독립적이라는 것은 다른 말로 순수 함수라고 할 수 있는데, 다음의 javascript 코드를 보자.

```javascript
let gender = 'male';

function myPureFunction (param){
    return "성별 : " + param;
}

function myFunction (param) {
    let result = "성별 : ";
    if(param === 'male') {
        result += "남성";
    } else {
        result += "여성";
    }
    return result;
}

(function(){
    console.log(myPureFunction("남성"));
    console.log(myFunction(gender));
})();
```

![0107-207-java-live-study-week-15-lambda-img-05.png](/tech-blog/resources/images/migration/0107-207-java-live-study-week-15-lambda/img-05.png)

실행 결과는 같지만, myPureFunction 과 myFunction 의 차이점은 실행 결과가 외부 변수에 의해 실행 결과에 영향을 주는가 이다.

Variable Capture 를 통해 람다식 내부에서 사용하는 지역 변수에 대해 final 이어야 하는 이유도 같은 맥락이라고 할 수 있다.

불변 상태로 만들면 지역 변수에 대해 변하지 않는 상수를 사용하기 때문에 동일한 입력에 대해 동일한 결과를 기대할 수 있다.

이것을 부작용(side effect, 부수효과) 이 없다고 한다.

동일한 입력에 대해 일관된 결과를 받아볼 수 있다는 것은 다시 말하면

다수의 쓰레드가 동시에 공유 해서 사용한다고 하더라도 일관된 결과를 받아볼 수 있다는 것으로

쓰레드와 관련된 동시성 문제가 생길 원인을 미리 방지할 수 있다.
