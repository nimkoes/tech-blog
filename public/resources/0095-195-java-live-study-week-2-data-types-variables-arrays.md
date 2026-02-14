## 자바의 프리미티브 타입, 변수 그리고 배열을 사용하는 방법을 익힙니다.

---

### 학습할 것

- 프리미티브 타입 종류와 값의 범위 그리고 기본 값
- 프리미티브 타입과 레퍼런스 타입
- 리터럴
- 변수 선언 및 초기화하는 방법
- 변수의 스코프와 라이프타임
- 타입 변환, 캐스팅 그리고 타입 프로모션
- 1차 및 2차 배열 선언하기
- 타입 추론, var

---

#### 프리미티브 타입 종류와 값의 범위 그리고 기본 값

---

프리미티브 타입. 영어로 primitive type. 또는 원시 타입 또는 기본형 타입 이라고 하기도 한다.

우선 타입이란 데이터 타입을 줄인 말로 자료형 이라고 하기도 한다.

그럼 데이터 타입 이란 무엇일까.

컴퓨터 관점에서 타입은 데이터가 메모리에 어떻게 저장될 것이고 또 어떻게 다뤄져야 하는지에 대해 알려주는 것이다.

즉, 데이터 타입을 보면 컴퓨터에서 어떤 형태를 가지며 어떻게 처리될 수 있는지 머릿속에 그릴 수 있다.

그 중에서 프리미티브 (기본형) 타입에 대해 알아보자.

내가 배울 당시 이 기본형을 자바의 8대 자료형 이라고 불렀던 기억이다.

자바 언어에 기본적으로 내장 된 타입으로 표로 정리하면 다음과 같다.

<table>
<tbody>
<tr>
<td><span>구분</span></td>
<td><span>프리미티브 타입</span></td>
<td><span>메모리 크기</span></td>
<td><span>기본 값</span></td>
<td><span>표현 범위</span></td>
</tr>
<tr>
<td><span>논리형</span></td>
<td><span>boolean</span></td>
<td><span>1 byte</span></td>
<td><span>false</span></td>
<td><span>true, false</span></td>
</tr>
<tr>
<td><span>정수형</span></td>
<td><span>byte</span></td>
<td><span>1 byte</span></td>
<td><span>0</span></td>
<td><span>-128 ~ 127</span></td>
</tr>
<tr>
<td><span>short</span></td>
<td><span>2 byte</span></td>
<td><span>0</span></td>
<td><span>-32,768 ~ 32767</span></td>
</tr>
<tr>
<td><span>int</span></td>
<td><span>4 byte</span></td>
<td><span>0</span></td>
<td><span>-2,147,483,648 ~ 2,147,483,647</span></td>
</tr>
<tr>
<td><span>long</span></td>
<td><span>8 byte</span></td>
<td><span>0L</span></td>
<td><span>&nbsp;-9,223,372,036,854,775,808&nbsp;~&nbsp;9,223,372,036,854,775,807</span></td>
</tr>
<tr>
<td><span>실수형</span></td>
<td><span>float</span></td>
<td><span>4 byte</span></td>
<td><span>0.0F</span></td>
<td><span>(3.4&nbsp;X&nbsp;10^-38)&nbsp;~&nbsp;(3.4&nbsp;X&nbsp;10^38)&nbsp;의&nbsp;근사값</span></td>
</tr>
<tr>
<td><span>double</span></td>
<td><span>8 byte</span></td>
<td><span>0.0</span></td>
<td><span>&nbsp;(1.7&nbsp;X&nbsp;10^-308)&nbsp;~&nbsp;(1.7&nbsp;X&nbsp;10^308)&nbsp;의&nbsp;근사값</span></td>
</tr>
<tr>
<td><span>문자형</span></td>
<td><span>char</span></td>
<td><span>2 byte (유니코드)</span></td>
<td><span>'\u0000'</span></td>
<td><span>0 ~ 65,535</span></td>
</tr>
</tbody>
</table>

이걸 다 알아야 하나?

개인적으로 char와 위에서부터 int 까지의 표현범위까지 외우고 있는데, 최소한 메모리 크기를 포함해서 기본 값 까지는 알아야 한다고 생각 한다.

기계적으로 외우는게 싫다면 이해를 하면 외우기 쉽다.

1 byte는 8 bit 이다. 그리고 1 bit 는 2진수 한 자리를 뜻한다.

우리가 일반적으로 사용하는 10진수는 한 자리에 10가지를 표현할 수 있다. (0 ~ 9)

2진수는 한 자리에 2가지 표현을 할 수 있다. (0 ~ 1)

1 비트가 2진수 한 자리를 뜻하면, 2 비트는 2진수 두 자리를 뜻하고 다음과 같은 값을 표현할 수 있다.

00, 01, 10, 11

비트가 1 증가하자 표현할 수 있는 가지수가 2배가 되었다.

3 비트로 표현 가능한 값은 다음과 같다.

000, 001, 010, 011, 100, 101, 110, 111

비트가 1 증가하자 표현할 수 있는 가지수가 역시 2배가 되었다.

( ** 10진수에서 자릿수가 늘어나면 표현 가능한 수가 10배가 되는 것을 생각하면 된다. ex, 10 -> 100 )

여기서 우리는 1 비트가 증가 할 때마다 표현할 수 있는 값이 두 배가 되는 것을 알 수 있다.

확신할 수 없다면 다음과 같이 생각해볼 수 있다.

2 비트로 표현 가능했던 모든 값의 앞에 0을 붙인 것과 1을 붙인 것, 두 그룹으로 만들 수 있다.

 2 비트로 표현 가능했던 모든 값 : 00, 01, 10, 11

-> 모든 값 앞에 0을 붙인 값 : 000, 001, 010, 011

-> 모든 값 앞에 1을 붙인 값 : 100, 101, 110, 111

결국 비트가 1 증가 할 경우 표현 가능한 값의 표현 범위가 2배가 된다는 것을 알 수 있다.

그리고 비트의 수와 표현 가능한 값의 수는 2의 거듭제곱으로 나타낼 수 있다는 것도 알 수 있다. (2배씩 커지기 때문에)

정수형 프리미티브 타입 중 byte 자료형의 메모리 크기는 1 byte이다.

즉 8비트 이다. 8 비트로 표현 가능한 값의 개수는 2의 8제곱 이다.

2의 8 제곱은 256인데 왜 표현범위가 0 ~ 255 가 아니고 -128 ~ 127 까지 일까.

컴퓨터에서 음수를 표현하기 위해 MSB 라는 것을 사용한다.

MSB는 Most Significant Bit 의 줄임 말로 최상위 비트를 뜻한다.

최상위 비트란 일반적으로 가장 왼쪽에 위치한 비트를 뜻한다.

8비트를 다음과 같이 표현할 수 있다고 가정해보자.

<table>
<tbody>
<tr>
<td><span>x</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
</tr>
</tbody>
</table>

x 표시한 가장 왼쪽에 나타낸 비트를 MSB 라고 부르고 부호 비트라고도 한다.

이 값이 1이면 음수, 0이면 양수라고 판단한다.

즉, 부호가 있는 자료형의 경우 1비트를 부호를 표현하기 위해 사용하기 때문에

현재 예시를 기준으로 -128 ~ 127 까지의 값 표현 범위를 가진다.

양수는 0이 포함되기 때문에 128이 아니다.

만약 0 ~ 255 까지 표현하고 싶다면, 다시 말해 부호 비트의 자리도 데이터로 취급하려 한다면 unsigned (부호가 없는) 자료형을 사용하면 된다. 음수는 표현하지 못하는 대신 양수 표현 범위가 두 배 늘어난다.

아쉽게도 자바에는 unsigned 타입의 자료형을 지원하지 않는다.

그래서 보통 표현 범위를 넘을 때 더 큰 자료형을 사용하고는 한다.

하지만 자바 8 부터 Integer 와 Long 의 wrapper 클래스에 unsigned 관련한 static 메소드가 추가 되었는데, 실제로 활용한 적은 아직 없다.

이 내용을 이해 했다면 다른 자료형에 대해 몇 바이트의 크기인지 안다면

부호를 가질 때와 가지지 않을 때의 값의 표현 범위를 계산해낼 수 있으므로 굳이 외울 필요가 없어진다.

실수의 경우 참 재미있다.

분명 정수형과 비교했을 때 메모리 크기는 별반 다르지 않은데, 값의 표현 범위가 훨씬 넓다.

심지어 소수점을 표현할 수 있다니.

실수는 부호, 가수(mantissa), 지수(exponent)로 구성되며, 부동 소수점 방식을 사용한다.

부동 소수점 방식을 사용하여 모든 가수를 0 보다 크거나 같고 1보다 작은 값 범위의 값으로 만들고

원래 수를 표현하기 위해 10을 몇 번 거듭 제곱해야 하는지 지수로 표현한다.

즉, 1.234 라는 값을 0.1234 * 10^1 로 표현 한다는 것을 의미한다.

실수형 중 float 타입은 부호(1비트) + 지수(8비트) + 가수(23비트) = 32비트 를 사용하고

double 타입은 부호(1비트) + 지수(11비트) 가수(52비트) = 64비트 를 사용한다.

다른 얘기지만 그냥 정수형 하나, 실수형 하나, 논리형 하나 이렇게 큼직하고 두루뭉술하게 구분해도 상관 없을 것 같은데 왜 이렇게 잘게(?) 구분해 두었을까?

다양한 이유가 있겠지만, 소 잡는 칼로 닭을 잡지 않기 위함 이라고 할 수 있을 것 같다.

야구공 하나 가지고 다니기 위해 야구 가방을 하나 사는게 여행용 캐리어를 사는 것보다 여러가지로 이득이기 때문이다.

뭔가 더 정리할 내용이 있는 것 같지만, 주제에 벗어나는 것 같다.

마지막으로 요즘도 그런지(?) 모르겠지만, 충격적이었던 사실이 있다.

정수형 타입을 선언할 때 byte나 short 타입을 사용하지 말고 int 타입을 사용하라는 것이 기억난다.

왜냐하면 내가 아무리 byte, short 를 사용하겠다고 해도, 지난 시간 알아봤던 JVM이 내부에서 전부 4 바이트 크기로 만들어 관리한다고 알고 있다.

즉, 4바이트보다 작은 타입에 대해, 내가 크기에 맞게 사용하겠다고 아무리 byte, short 해도 JVM이 무조건 기본적으로 4바이트 크기 타입으로 생각하기 때문에 두 번 일하게 하지 말라는 얘기를 들은 기억이 있다.

물론 배열에서 사용 할 때는 또 다르지만.. 주제를 너무 벗어나는 것 같다.

#### 프리미티브 타입과 레퍼런스 타입

---

프리미티브 타입에 대해서는 위에서 살펴 보았다.

레퍼런스 타입이란 무엇일까.

reference. 참고, 참조의 뜻을 가지고 있다. 그래서 참조 타입이라고 하는 사람도 많이 있다.

참조 한다는 것을 무엇일까.

여러가지 의미로 해석할 수 있겠지만, 자바 언어에서는 실제 값이 저장되어 있는 곳의 위치를 저장한 값(주소값)을 뜻한다.

참조 타입의 종류는 배열, 열거(enum), 클래스 그리고 인터페이스가 있다.

기본 타입과 참조 타입을 구분하는 방법은 생각보다 단순하다.

저장되는 값이 실제 값 그 자체이냐 아니면 메모리의 주소값이냐에 따라 구분할 수 있다.

그럼 이 값은 어디에 저장 되는 걸까.

지난 1주차에 공부한 JVM의 Runtime Data Area 이다.

그 중에서도 런타임 스택 영역과 가비지 컬렉션 힙 영역에 저장 된다.

예륻 들어 다음과 같은 코드가 있다고 생각하자.

```java
package me.xxxelppa.study.week02;

public class Exam_001 {
    public static void main(String[] args) {
        String name = "xxxelppa";
        int age = 17;
    }
}
```

레퍼런스 타입의 name 변수와 프리미티브 타입의 age 변수는 런타임 스택 영역에 생성 된다.

그리고 레퍼런스 타입의 값인 주소값과, 프리미티브 타입의 값인 17 역시 런타임 스택 영역에 저장 된다.

다만, 레퍼런스 타입의 값인 주소값이 가리키는 실제 값은 가비지 컬렉션 힙 영역에 객체가 생성 된다.

그래서 값을 복사할 때 조심해야 한다.

그 이유는 프리미티브 타입의 경우 실제 값이 아닌 주소값이 복사되기 때문이다.

보통 기본서에서는 값에 의한 복사 (call by value)와 참조 또는 주소에 의한 복사 (call by reference) 라고 한다.

값에 의한 복사가 아닌 경우 두가지 경우가 있는데 얕은 복사와 깊은 복사로 또 나뉜다.

얕은 복사는 주소값을 복사하여 결국 동일한 가비지 컬렉션 힙 영역의 객체를 참조한다.

그래서 이런 복사를 의도하지 않았을 경우 치명적인 오류가 발생할 수 있다.

깊은 복사는 프리미티브 타입에서의 값에 의한 복사처럼 완전히 똑같은 새로운 객체를 만들어 복사하는 것을 뜻한다.

어느 방식이 좋다 나쁘다는 없고, 의도한 상황에 맞게 적절히 잘 판단하여 사용해야 한다.

#### 리터럴

---

요약하자면 리터럴은 실제로 저장되는 값 그 자체로 메모리에 저장되어있는 변하지 않는 값 그 자체를 뜻한다.

또는 컴파일 타임에 프로그램 안에 정의되어 그 자체로 해석 되어야 하는 값을 뜻한다.

어떻게 표현해도 말이 어려운것 같다. 그냥 코드 내에서 직접 쓴 값이라고 생각하는게 편할것 같다.

그 종류로는 정수, 실수, 문자, 부울(논리), 문자열 등이 있다.

어디서 본 것 같다면 문자열을 제외하고 프리미티브 타입으로 표현 가능하다는 것을 알 수 있다.

각 프리미티브 타입에 대한 설명은 앞서 했으므로 여기서는 생략하고

대신 예제 코드를 하나 작성 해보기로 했다.

```java
package me.xxxelppa.study.week02;

public class Exam_002 {
    public static void main(String[] args) {
        System.out.println("===== 정수 리터럴 =====");
        int int_v1 = 0b10;    // 접두문자 0b   -> 2진수
        int int_v2 = 010;     // 접두문자 0    -> 8진수
        int int_v3 = 10;      // 접두문자 없음 -> 10진수
        int int_v4 = 0x10;    // 접두문자 0x   -> 16진수
        long long_v1 = 10L;   // 접미문자 l 또는 L -> long 타입 리터럴

        System.out.println("2진수 정수 리터럴 : " + int_v1);
        System.out.println("8진수 정수 리터럴 : " + int_v2);
        System.out.println("10진수 정수 리터럴 : " + int_v3);
        System.out.println("16진수 정수 리터럴 : " + int_v4);
        System.out.println("long 타입 정수 리터럴 : " + long_v1);
        System.out.println();

        System.out.println("===== 실수 리터럴 =====");
        // 실수 타입 리터럴은 double 타입으로 컴파일 되므로
        // float 타입인 경우 명시적으로 f 또는 F 를 명시해줘야 한다.
        // double 타입도 d나 D를 명시해줘도 되지만, 안해줘도 상관 없다.
        float float_v1 = 1.234F;
        double double_v1 = 1.234;
        double double_v2 = 1.234d;
        double double_v3 = 1234E-3d;

        System.out.println("float 타입 실수 리터럴 : " + float_v1);
        System.out.println("double 타입 실수 리터럴 1 : " + double_v1);
        System.out.println("double 타입 실수 리터럴 2 : " + double_v2);
        System.out.println("double 타입 실수 리터럴 3 : " + double_v3);
        System.out.println();

        System.out.println("===== 문자 리터럴 =====");
        char char_v1 = 'C';
        char char_v2 = '민';
        char char_v3 = '\u1234';    // 백슬러시 u 다음 4자리 16진수 유니코드

        System.out.println("문자 리터럴 1 : " + char_v1);
        System.out.println("문자 리터럴 2 : " + char_v2);
        System.out.println("문자 리터럴 3 : " + char_v3);
        System.out.println();

        System.out.println("===== 부울(논리) 리터럴 =====");
        boolean boolean_v1 = true;
        boolean boolean_v2 = 12 > 34;

        System.out.println("부울(논리) 리터럴 1 : " + boolean_v1);
        System.out.println("부울(논리) 리터럴 2 : " + boolean_v2);
        System.out.println();

        System.out.println("===== 문자열 리터럴 =====");
        String string_v1 = "hello, ws study";
        System.out.println("문자열 리터럴 : " + string_v1);
        System.out.println();
    }
}
```

<table>
<tbody>
<tr>
<td><span>=====&nbsp;정수&nbsp;리터럴&nbsp;===== </span><br><span>2진수&nbsp;정수&nbsp;리터럴&nbsp;:&nbsp;2 </span><br><span>8진수&nbsp;정수&nbsp;리터럴&nbsp;:&nbsp;8 </span><br><span>10진수&nbsp;정수&nbsp;리터럴&nbsp;:&nbsp;10 </span><br><span>16진수&nbsp;정수&nbsp;리터럴&nbsp;:&nbsp;16 </span><br><span>long&nbsp;타입&nbsp;정수&nbsp;리터럴&nbsp;:&nbsp;10 </span><br><br><span>=====&nbsp;실수&nbsp;리터럴&nbsp;===== </span><br><span>float&nbsp;타입&nbsp;실수&nbsp;리터럴&nbsp;:&nbsp;1.234 </span><br><span>double&nbsp;타입&nbsp;실수&nbsp;리터럴&nbsp;1&nbsp;:&nbsp;1.234 </span><br><span>double&nbsp;타입&nbsp;실수&nbsp;리터럴&nbsp;2&nbsp;:&nbsp;1.234 </span><br><span>double&nbsp;타입&nbsp;실수&nbsp;리터럴&nbsp;3&nbsp;:&nbsp;1.234 </span><br><br><span>=====&nbsp;문자&nbsp;리터럴&nbsp;===== </span><br><span>문자&nbsp;리터럴&nbsp;1&nbsp;:&nbsp;C </span><br><span>문자&nbsp;리터럴&nbsp;2&nbsp;:&nbsp;민 </span><br><span>문자&nbsp;리터럴&nbsp;3&nbsp;:&nbsp;ሴ </span><br><br><span>=====&nbsp;부울(논리)&nbsp;리터럴&nbsp;===== </span><br><span>부울(논리)&nbsp;리터럴&nbsp;1&nbsp;:&nbsp;true </span><br><span>부울(논리)&nbsp;리터럴&nbsp;2&nbsp;:&nbsp;false </span><br><br><span>=====&nbsp;문자열&nbsp;리터럴&nbsp;===== </span><br><span>문자열&nbsp;리터럴&nbsp;:&nbsp;hello,&nbsp;ws&nbsp;study</span></td>
</tr>
</tbody>
</table>

대입 연산자를 기준으로 모든 우항의 값들을 리터럴 이라고 부른다.

#### 변수 선언 및 초기화하는 방법

---

자바에서 변수를 선언하는 방법은 기본적으로 그 변수의 타입(자료형) 다음에 변수의 이름을 작성하는 것으로 한다.

예를 들어 정수형 타입의 변수를 다음과 같이 선언할 수 있다.

```java
package me.xxxelppa.study.week02;

public class Exam_003 {
    public static void main(String[] args) {
        int value1;     // 정수형 타입의 변수 value1 을 선언
    }
}
```

한 번에 여러개의 변수를 선언한다면 다음과 같이도 할 수 있다.

```java
package me.xxxelppa.study.week02;

public class Exam_004 {
    public static void main(String[] args) {
        // 한 번에 여러개의 정수형 타입 변수를 선언
        int value1, value2, value3;
    }
}
```

초기화 하는 방법은 대입 연산자인 등호를 사용한다.

처음 등호를 접하면 좌항과 우항의 값이 동등하다는 것을 뜻할 때 쓰이는 것이 익숙하겠지만

프로그래밍에서 등호는 우항의 값을 좌항의 변수에 할당 한다는 의미로 쓰인다.

이름도 대입 연산자라고 부른다.

동등하다는 것을 나타내고 싶을 때는 등호를 두 번 사용한다. (==)

초기화 한다는 것은, 선언한 변수에 실제 값을 넣는다는 것을 의미한다.

위에서 선언한 변수에 값을 초기화 해보자.

```java
package me.xxxelppa.study.week02;

public class Exam_005 {
    public static void main(String[] args) {
        // 1. 선언과 동시에 초기화
        int value1 = 10;

        // 2. 선언한 다음 초기화
        int value2;
        value2 = 20;
    }
}
```

갑자기 호기심이 생겨 바로 위의 코드를 컴파일 한 class 파일을 IDE를 사용해서 열어 보았다.

<table>
<tbody>
<tr>
<td><span>//&nbsp;Compiled&nbsp;from&nbsp;WS_live_study.java&nbsp;(version&nbsp;1.8&nbsp;:&nbsp;52.0,&nbsp;super&nbsp;bit)</span><br><span>public&nbsp;class&nbsp;Day02.WS_live_study&nbsp;{ </span><br><span>&nbsp;&nbsp; </span><br><span>&nbsp;&nbsp;//&nbsp;Method&nbsp;descriptor&nbsp;#6&nbsp;()V </span><br><span>&nbsp;&nbsp;//&nbsp;Stack:&nbsp;1,&nbsp;Locals:&nbsp;1 </span><br><span>&nbsp;&nbsp;public&nbsp;WS_live_study(); </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;aload_0&nbsp;[this] </span><br><span>&nbsp; &nbsp;&nbsp;1&nbsp;&nbsp;invokespecial&nbsp;java.lang.Object()&nbsp;[8] </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;4&nbsp;&nbsp;return </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Line&nbsp;numbers: </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[pc:&nbsp;0,&nbsp;line:&nbsp;3] </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Local&nbsp;variable&nbsp;table: </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[pc: 0,&nbsp;pc:&nbsp;5]&nbsp;local:&nbsp;this&nbsp;index:&nbsp;0&nbsp;type:&nbsp;Day02.WS_live_study </span><br><span>&nbsp;&nbsp; </span><br><span>&nbsp;&nbsp;//&nbsp;Method&nbsp;descriptor&nbsp;#15&nbsp;([Ljava/lang/String;)V </span><br><span>&nbsp;&nbsp;//&nbsp;Stack:&nbsp;1,&nbsp;Locals:&nbsp;3 </span><br><span>&nbsp;&nbsp;public&nbsp;static&nbsp;void&nbsp;main(java.lang.String[]&nbsp;ar); </span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;bipush&nbsp;10 </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;istore_1&nbsp;[value1] </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;3&nbsp;&nbsp;bipush&nbsp;20 </b></span><br><span><b>&nbsp;&nbsp;&nbsp;&nbsp;5&nbsp;&nbsp;istore_2&nbsp;[value2]</b> </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;return </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Line&nbsp;numbers: </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[pc:&nbsp;0,&nbsp;line:&nbsp;6] </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[pc:&nbsp;3,&nbsp;line:&nbsp;10] </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[pc:&nbsp;6,&nbsp;line:&nbsp;11] </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Local&nbsp;variable&nbsp;table: </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[pc: 0,&nbsp;pc:&nbsp;7]&nbsp;local:&nbsp;ar&nbsp;index:&nbsp;0&nbsp;type:&nbsp;java.lang.String[] </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[pc:&nbsp;3,&nbsp;pc:&nbsp;7]&nbsp;local:&nbsp;value1&nbsp;index:&nbsp;1&nbsp;type:&nbsp;int </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[pc:&nbsp;6,&nbsp;pc:&nbsp;7]&nbsp;local:&nbsp;value2&nbsp;index:&nbsp;2&nbsp;type:&nbsp;int </span><br><span>}</span></td>
</tr>
</tbody>
</table>

너무 단순한 코드여서 그런 것인지 모르겠지만, 선언과 동시에 하는 방법과 따로 하는 방법에 별다른 차이는 없어 보인다.

#### 변수의 스코프와 라이프타임

---

변수의 스코프는 그 변수에 접근할 수 있는 범위 라고 생각하는게 무난할 것 같다.

자바 언어는 블록 스코프를 사용 한다. (블록은 중괄호 {} 를 뜻한다.)

```java
package me.xxxelppa.study.week02;

public class Exam_006 {
    // 여기 선언된 변수는 Exam_006 {} 블록 내에서 접근 가능하다.
    static int myBlock = 10;
    public static void main(String[] args) {
        System.out.println("result : " + myBlock);
    }
}
```

5라인에 선언한 myBlock 변수는 3라인의 WS_live_study {} 블록 내에서 접근 가능하기 때문에

이 코드를 실행하면 다음과 같은 결과를 볼 수 있다.

<table>
<tbody>
<tr>
<td><span>result : 10</span></td>
</tr>
</tbody>
</table>

그럼 다음과 같은 경우는 어떤 결과가 나올까?

```java
package me.xxxelppa.study.week02;

public class Exam_007 {
    // 여기 선언된 변수는 Exam_007 {} 블록 내에서 접근 가능하다.
    static int myBlock = 10;

    public static void main(String[] args) {
        int myBlock = 20;
        System.out.println("result : " + myBlock);
    }
}
```

예상 했겠지만 20을 출력하는 것을 확인할 수 있다.

<table>
<tbody>
<tr>
<td><span>result : 20</span></td>
</tr>
</tbody>
</table>

9라인에서 myBlock을 사용할 때, 이 값을 자신과 가까운 블록 스코프에서 찾고

없을 경우 상위 블록 스코프에 존재하는지 찾아본다.

레퍼런스 타입의 변수의 라이프 타임은 쓰레기 수집기 (GC : Garbage Collector)와 관련이 있다.

이 GC는 가비지 컬렉션 힙 영역에 존재하는 참조 타입 변수의 객체에 대해 동작한다.

힙 영역에 메모리가 부족할 경우 GC가 이 영역을 스캔하고, 아무곳에서도 사용하지 않는 즉, 참조 되고 있지 않은 객체를 제거해 버린다.

예를 들면 다음과 같은 경우다.

```java
package me.xxxelppa.study.week02;

public class Exam_008 {
    public static void main(String[] args) {
        MyTest mt = new MyTest();
        mt = null;
    }
}

class MyTest {}
```

5라인에서 MyTest 클래스의 객체를 생성해서 mt 변수에 할당 했다.

여기까지 하면, 런타임 스택 영역에 mt 변수가 생성되고, 그 값은 가비지 컬렉션 힙 영역에 생성 된 new MyTest() 로 만들어진 객체가 저장된 주소값을 가지고 있다.

이때 런타임 스택 영역의 mt 변수의 값인 주소값에 null을 할당하면, new MyTest() 로 만든 이 객체는 더이상 아무도 참조하지 않게 된다.

이런 객체가 GC의 대상이 된다.

마지막으로 런타임 스택 영역에 생성된 변수의 라이프 타임은 블록 스코프에 의존적이다.

즉, 블록 내에서 선언된 변수는 블록이 종료될 때 런타인 스택 영역에서 함께 소멸한다.

#### 타입 변환, 캐스팅 그리고 타입 프로모션

---

앞서 타입이란 데이터 타입을 줄인 말이고, 다른 말로 자료형 이라고도 한다고 했다.

특정 데이터 타입으로 표현된 리터럴은 다른 데이터 타입으로 변환할 수 있다.

예를 들어 int 타입 변수에 담긴 값을 long 타입 변수에 담을 수 있다.

```java
package me.xxxelppa.study.week02;

public class Exam_009 {
    public static void main(String[] args) {
        int v1 = 100;
        long v2 = v1;

        System.out.println("v1 : " + v1);
        System.out.println("v2 : " + v2);
    }
}
```

실행 결과 모두 100의 값을 출력 한다.

이렇게 변환 될 때 크게 두가지 경우를 생각해볼 수 있다.

1. 자신의 표현 범위를 모두 포함한 데이터 타입으로의 변환. (타입 프로모션)

2. 자신의 표현 범위를 모두 포함하지 못한 데이터 타입으로의 변환. (타입 캐스팅)

조금 복잡해 보이지만 이렇게 설명을 남기는 이유가 있다.

간혹 표현 범위의 크기를 가지고 분류하는 사람들이 있었기 때문이다.

예를 들어 실수형 데이터 타입인 float의 경우 메모리 크기가 4 byte 이고

정수형 데이터 타입인 long의 경우 메모리 크기가 8 byte 이다.

만약 표현 범위의 크기만 가지고 본다면 float 데이터 타입의 값을 long 타입으로 변환한다고 가정하자.

4 byte 메모리 크기를 갖는 값을 8 byte 메모리 크기의 데이터 타입으로 변환하기 때문에 타입 프로모션이라 생각하는 사람을 만난적이 있다.

타입 프로모션과 타입 캐스팅을 구분하기 위해서는 메모리 크기가 아닌 데이터 표현 범위를 따져봐야 한다.

지금 예시를 생각해보면, 실수를 표현하는 float 데이터 타입의 값을 정수를 표현하는 long 데이터 타입 값으로 변환을 시도한다면,

long 데이터 타입은 실수를 표현할 수 없기 때문에 원본 데이터에 손실이 발생 할 수 있다.

이렇게 원본 데이터가 담긴 데이터 타입의 표현 범위를 변환 할 데이터 타입의 표현 범위가 모두 수용하지 못할 경우 데이터 손실이 발생할 수 있는데, 이것을 타입 캐스팅 이라고 한다.

반대로 모두 수용할 수 있다면 타입 프로모션 이라고 한다.

말보단 코드를 보는 것이 좋을 것 같다. 위 상황을 구현해보았다.

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-01.jpg](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-01.jpg)

똑똑한 IDE는 위와 같이 타입 캐스팅이 발생할 경우 컴파일 타임에 오류를 발생한다.

메시지는 다음과 같다.

<table>
<tbody>
<tr>
<td><span>Type mismatch: cannot convert from float to long</span></td>
</tr>
</tbody>
</table>

그리고 어떻게 수정해야할지 추천도 해준다.

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-02.jpg](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-02.jpg)

Add cast to 'long' 을 선택하면 코드가 다음과 같이 자동으로 바뀌는 것을 볼 수 있다.

```java
package me.xxxelppa.study.week02;

public class Exam_010 {
    public static void main(String[] args) {
        float float_v1 = 1.23f;
//        long long_v1 = float_v1;
        long long_v1 = (long)float_v1;

        System.out.println("float_v1 : " + float_v1);
        System.out.println("long_v1 : " + long_v1);
    }
}
```

그럼 이 코드를 실행해보자.

<table>
<tbody>
<tr>
<td><span>float_v1&nbsp;:&nbsp;1.23 </span><br><span>long_v1&nbsp;:&nbsp;1</span></td>
</tr>
</tbody>
</table>

소수점을 표현할 수 있는 실수 데이터 타입을 정수 데이터 타입으로 강제로 변환 했기 때문에 원본 데이터가 온전히 변환되지 않았다.

물론 실수 데이터 타입에 담은 리터럴의 소숫점 아래 값이 없었다면 온전히 정수로 표현이 됐을 것이다.

그렇기 때문에 타입 캐스팅을 할 경우 원본 데이터에 손실이 발생 할 가능성이 있다고 한다. (무조건 손실이 일어나지 않기 때문에)

타입 프로모션의 경우 타입 캐스팅과 같이 어떤 데이터 타입으로 변환해야 하는지 명시하지 않아도 된다.

다음 코드는 float -> long 으로 타입 캐스팅 했던 것을 long -> float 로 타입 프로모션을 하도록 고친 것이다.

```java
package me.xxxelppa.study.week02;

public class Exam_011 {
    public static void main(String[] args) {
        long long_v1 = 123L;
        float float_v1 = long_v1;

        System.out.println("long_v1 : " + long_v1);
        System.out.println("float_v1 : " + float_v1);
    }
}
```

<table>
<tbody>
<tr>
<td><span>long_v1&nbsp;:&nbsp;123 </span><br><span>float_v1&nbsp;:&nbsp;123.0</span></td>
</tr>
</tbody>
</table>

데이터 타입을 변환할 경우를 자주 볼 수 있는데, 타입 캐스팅을 할 경우 앞서 말했지만 원본 데이터가 손실 될 수 있기 때문에 조심해서 다뤄야 한다.

#### 1차 및 2차 배열 선언하기

---

1차, 2차 배열을 선언하기에 앞서 배열이 무엇인지 먼저 알아야 한다.

배열은 동일한 자료형을 정해진 수만큼 저장하는 순서를 가진 레퍼런스 타입 자료형이다.

이런 것을 왜 만 들었을까.

다음은 배열을 설명할 때 자주 등장하는 상황이다.

숫자 수집을 좋아하던 xxxelppa는 길을 가다 3개의 숫자를 발견하게 되어 이를 컴퓨터에 저장해두기로 했다.

```java
package Day02;

public class WS_live_study {
    public static void main(String[] ar) {
        int num_1 = 10;
        int num_2 = 20;
        int num_3 = 30;

        System.out.println("1 번째 수집한 수 : " + num_1);
        System.out.println("2 번째 수집한 수 : " + num_2);
        System.out.println("3 번째 수집한 수 : " + num_3);
    }
}
```

<table>
<tbody>
<tr>
<td><span>1&nbsp;번째&nbsp;수집한&nbsp;수&nbsp;:&nbsp;10 </span><br><span>2&nbsp;번째&nbsp;수집한&nbsp;수&nbsp;:&nbsp;20 </span><br><span>3&nbsp;번째&nbsp;수집한&nbsp;수&nbsp;:&nbsp;30</span></td>
</tr>
</tbody>
</table>

다음날 길에서 새로운 2개의 숫자를 발견해서 같은 방법으로 컴퓨터에 저장 했다.

```java
package me.xxxelppa.study.week02;

public class Exam_012 {
    public static void main(String[] args) {
        int num_1 = 10;
        int num_2 = 20;
        int num_3 = 30;
        int num_4 = 40;
        int num_5 = 50;

        System.out.println("1 번째 수집한 수 : " + num_1);
        System.out.println("2 번째 수집한 수 : " + num_2);
        System.out.println("3 번째 수집한 수 : " + num_3);
        System.out.println("4 번째 수집한 수 : " + num_4);
        System.out.println("5 번째 수집한 수 : " + num_5);
    }
}
```

<table>
<tbody>
<tr>
<td><span>1&nbsp;번째&nbsp;수집한&nbsp;수&nbsp;:&nbsp;10 </span><br><span>2&nbsp;번째&nbsp;수집한&nbsp;수&nbsp;:&nbsp;20 </span><br><span>3&nbsp;번째&nbsp;수집한&nbsp;수&nbsp;:&nbsp;30 </span><br><span>4&nbsp;번째&nbsp;수집한&nbsp;수&nbsp;:&nbsp;40 </span><br><span>5&nbsp;번째&nbsp;수집한&nbsp;수&nbsp;:&nbsp;50</span></td>
</tr>
</tbody>
</table>

이렇게 매일 매일 평화롭게 숫자를 수집하고 있었는데, 어느 날 갑자기 100개의 숫자를 한번에 발견하게 되었다.

수집한 숫자가 많아질 수록 int num_{숫자} 를 계속 복사 붙여넣기 하고 출력을 할 때도 매번 똑같은 짓을 반복하는 자신을 발견했다.

심지어 얼마 전 초고층 빌딩 유리창 청소 아르바이트가 끝나 IDE를 살 수 없었던 xxxelppa는 절망했고,

복사 붙여넣기를 잘못 한 탓인지 중복된 변수명을 사용하거나 같은 숫자를 두 번 이상 출력하는 등 엉망진창이 되어버렸다.

더 이상 숫자 수집을 할 수 없다는 슬픔에 울다 지쳐 잠이 들었는데, 자바신이 whiteship을 타고 나타나 배열을 사용하라는 말을 남기고 떠나는 꿈을 꾸었다.

다음은 배열을 사용해서 숫자를 수집하고 출력한 예제이다.

```java
package me.xxxelppa.study.week02;

public class Exam_013 {
    public static void main(String[] args) {
        int[] collect_num = new int[5];

        collect_num[0] = 10;
        collect_num[1] = 20;
        collect_num[2] = 30;
        collect_num[3] = 40;
        collect_num[4] = 50;

        for (int i = 0; i < 5; ++i) {
            System.out.println((i+1) + " 번째 수집한 수 : " + collect_num[i]);
        }
    }
}
```

사실 아직 반복문에 대해 알아보지 않았지만, 더이상 변수 이름을 계속 지을 필요도 없어졌고

내용을 출력하는 것도 보다 간결하게 구현할 수 있게 되었다. (배열은 4주차 '제어문' 에서 자세히 볼 반복문과 함께 자주 사용 된다.)

여기서 눈 여겨 볼 것은

1. 동일한 데이터 타입을 하나의 배열로 관리할 수 있다는 것과

2. 배열은 순서를 가지고 있는데, 1부터 시작하지 않고 0부터 시작한다는 것이다. (간혹 zero base 라고도 표현 한다.)

다음으로 배열을 선언하는 방법에 대해 알아보자.

배열 타입은 대괄호 [] 를 사용하고, 크게 두가지 방법으로 선언할 수 있다.

```java
package me.xxxelppa.study.week02;

public class Exam_014 {
    public static void main(String[] args) {
        int[] type_1;
        int type_2[];
    }
}
```

이렇게 선언한 배열 변수에 값을 할당하는 방법은 다음과 같다.

```java
package me.xxxelppa.study.week02;

public class Exam_015 {
    public static void main(String[] args) {
        int[] type_1 = new int[5];
        int[] type_2 = {10, 20, 30, 40, 50};
        int[] type_3 = new int[]{10, 20, 30, 40, 50};

        // Array constants can only be used in initializers
//        type_2 = {10, 20, 30, 40, 50};
    }
}
```

직접 new 연산자를 사용해서 배열 객체를 생성하는 방법과.

어떤 값을 할당할지 정해진 경우 중괄호를 사용해서 간단하게 배열 객체를 만드는 방법이 있다.

6라인의 배열 객체 생성 및 할당 방법은 변수 선언과 동시에 할당할 경우에만 사용할 수 있는 방법이다.

즉, 다음과 같은 것은 컴파일 오류가 발생한다.

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-03.jpg](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-03.jpg)

선언한 배열 변수는 JVM의 런타임 스택 영역에 생성 된다.

그리고 배열은 레퍼런스 타입이기 때문에 값은 가비지 컬렉션 힙 영역에 객체가 생성 된다.

이 힙 영역의 주소 값이 런타입 스택 영역에 생성된 변수의 값으로 할당 된다.

즉, 다음과 같다.

```java
package me.xxxelppa.study.week02;

public class Exam_016 {
    public static void main(String[] args) {
        int[] type_1 = new int[5];
    }
}
```

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-04.png](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-04.png)

100번지는 예시로 쓴 주소 값으로 실제와는 많이 다르다.

자바는 사용자(개발자)가 직접 메모리에 접근하지 않고 할 수도 없다.

배열의 [0], [1], ... [n] 을 각각 배열의 요소 또는 원소 라고 부른다.

각 원소는 배열의 타입 크기를 갖는다.

길이 5인 배열을 생성하면 다음과 같다.

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-05.png](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-05.png)

그리고 가비지 컬렉션 힙 영영에 생성되는 데이터는 각 타입의 기본값으로 초기화 된다.

( **** 각 원소의 크기가 4 byte인 것은 예시를 int 데이터 타입으로 만들었기 때문이다.** )

2차원 배열 부터는 다차원 배열에 속한다.

살면서 알고리즘 문제에서 의도적으로 3차원 배열을 사용한 문제를 풀어본 기억 외에

2차원보다 고차원의 배열을 사용해본 기억이 거의 없을 정도로 2차원 배열까지만 자주 사용한다.

수학에서 얘기하는 점, 선, 면을 떠올리면 배열을 머릿속으로 그려볼 수 있다.

1차원 배열은 선을, 2차원 배열은 면을 떠올리면 된다.

특히 2차원 배열의 경우 행렬 형태로 자주 표현한다.

혹시나 3차원 배열이 궁금하다면, 큐브 형태를 떠올리면 된다.

2차원 배열의 선언은 다음과 같이 할 수 있다.

```java
package me.xxxelppa.study.week02;

public class Exam_017 {
    public static void main(String[] args) {
        int[][] type_1;
        int type_2[][];
    }
}
```

여기서 대괄호를 한번 더 써주면 3차원 배열이 된다.

값을 할당하는 방법은 다음과 같이 할 수 있다.

```java
package me.xxxelppa.study.week02;

public class Exam_018 {
    public static void main(String[] args) {
        int[][] type_1 = new int[2][3];
        int[][] type_2 = {{1, 2}, {3, 4, 5}};
        int[][] type_3 = new int[][]{{1, 2}, {3, 4, 5}};
    }
}
```

예제 코드의 5라인 new int[2][3] 배열을 기준으로, 2차원 배열은 메모리상에 다음과 같이 생성 된다.

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-06.png](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-06.png)

예제코드 6라인과 7라인의 경우 위 그림과는 조금 다르다.

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-07.png](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-07.png)

이것을 행렬로 표현한다면 다음과 같다.

<table>
<tbody>
<tr>
<td><span>1</span></td>
<td><span>2</span></td>
<td>&nbsp;</td>
</tr>
<tr>
<td><span>3</span></td>
<td><span>4</span></td>
<td><span>5</span></td>
</tr>
</tbody>
</table>

테이블 표현상 첫번째 행의 2 오른쪽에 공간이 있는것 처럼 보이지만

예제 코드 기준으로 존재하지 않는 공간이다.

이렇게 각 행에 대해 열의 길이가 다른 배열을 지그재그하다 해서 재기드 배열(jagged array) 이라 하기도 한다.

#### 타입 추론, var

---

타입 추론(Type inference) 이란 값을 보고 컴파일러가 데이터 타입이 무엇인지 추론 한다는 것을 의미한다.

javascript를 예로 들면, 모든 변수를 var, let, const 등을 사용해서 선언한다.

자바에서처럼 int, long, boolean 등의 데이터 타입을 명시하지 않고 사용한다.

타입 추론에 대해선 대표적으로 제네릭에서 볼 수 있다.

예를 들면 다음과 같다.

```java
package me.xxxelppa.study.week02;

import java.util.HashMap;

public class Exam_019 {
    public static void main(String[] args) {
        HashMap<String, Integer> myHashMap = new HashMap<>();
    }
}
```

7라인에서 myHashMap에 HashMap 객체를 할당할 때 new HashMap<String, Integer>() 를 사용하지 않고, new HashMap<>() 을 사용했다.

이것은 myHashMap 변수에 담길 데이터 타입이 HashMap<String, Integer> 라는 것을 myHashMap 변수의 데이터 타입을 바탕으로 추론해낼 수 있기 떄문이다.

타입 추론에 대해서는 이번에 처음 접하게 되었는데, 이런 타입 추론이 조금 더 확장 된 것 같다.

개인적으로 보다 명시적인 코딩을 지향하기 때문에 제네릭이나 람다에서 사용하는 것 이상의 타입 추론을 자주 사용하지 않을것 같다.

나중에 생각이 바뀐다면 또 모르겠지만 지금은 그렇다.

var를 사용할 경우 제약 사항이 몇가지 존재한다.

1. 로컬 변수이면서

2. 선언과 동시에 값이 할당 되어야 한다는 것이다.

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-08.jpg](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-08.jpg)

로컬 변수로 선언하지 않아서 발생한 오류이다.

![0095-195-java-live-study-week-2-data-types-variables-arrays-img-09.jpg](/tech-blog/resources/images/migration/0095-195-java-live-study-week-2-data-types-variables-arrays/img-09.jpg)

선언과 동시에 값을 할당하지 않아서 발생한 오류이다.

다른 언어에 비해 타입 추론 개념이 늦게 도입된 이유는 자바 개발진들이 매우 보수적이며, 하위 호환성을 매우 중요하게 생각하기 때문이라고 한다.

자바에서 var 를 보다 활용도 있게 사용할 수 있는 방법에 대해 정리해둔 글을 보아서 링크를 추가했다.

[Java 10 에서 var 재대로 사용하기 1](https://dev.to/composite/java-10-var-3o67)

[Java 10 에서 var 제대로 사용하기 2](https://dev.to/composite/java-10-var-2-4f8a)
