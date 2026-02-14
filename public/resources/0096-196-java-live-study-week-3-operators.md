## 자바가 제공하는 다양한 연산자를 학습하세요.

---

### 학습할 것

- 산술 연산자
- 비트 연산자
- 관계 연산자
- 논리 연산자
- instanceof
- assignment(=) operator
- 화살표(->) 연산자
- 3항 연산자
- 연산자 우선 순위
- (optional) Java 13. switch operator

---

각 주제에 대해 본격적으로 알아보기 전에 연산자 관련하여 공통적인 내용에 대해 한 번 정리하려 한다.

<용어 정의>

연산 (operations) : 프로그램에서 데이터를 처리하여 결과를 산출하는 것

연산자 (operator) : 연산에 사용되는 표시나 기호

피연산자 (operand) : 연산의 대상이 되는 데이터

연산식 (expressions) : 연산자와 피연산자로 연산의 과정을 기술한 것

<table>
<tbody>
<tr>
<td><span>연산자 종류</span></td>
<td><span>연산자</span></td>
<td><span>피연산자 수</span></td>
<td><span>결과값</span></td>
<td><span>설명</span></td>
</tr>
<tr>
<td><span>산술</span></td>
<td><span>+, -, *, /, %</span></td>
<td><span>이항</span></td>
<td><span>숫자</span></td>
<td><span>사칙연산 및 나머지 계산</span></td>
</tr>
<tr>
<td><span>부호</span></td>
<td><span>+, -</span></td>
<td><span>단항</span></td>
<td><span>숫자</span></td>
<td><span>음수와 양수의 부호</span></td>
</tr>
<tr>
<td><span>문자열</span></td>
<td><span>+</span></td>
<td><span>이항</span></td>
<td><span>문자열</span></td>
<td><span>두 문자열을 연결</span></td>
</tr>
<tr>
<td><span>대입</span></td>
<td><span>=,&nbsp;+=,&nbsp;-=,&nbsp;*=,&nbsp;/=,&nbsp;%=,&nbsp;&amp;=,&nbsp; </span><br><span>^=,&nbsp;|=,&nbsp;&lt;&lt;=,&nbsp;&gt;&gt;=,&nbsp;&gt;&gt;&gt;=</span></td>
<td><span>이항</span></td>
<td><span>다양</span></td>
<td><span>우변의 값을 좌변의 변수에 대입</span></td>
</tr>
<tr>
<td><span>증감</span></td>
<td><span>++, --</span></td>
<td><span>단항</span></td>
<td><span>숫자</span></td>
<td><span>1만큼 증가/감소</span></td>
</tr>
<tr>
<td><span>비교(관계)</span></td>
<td><span>==,&nbsp;!=,&nbsp;&gt;,&nbsp;&lt;,&nbsp;&gt;=,&nbsp;&lt;=, </span><br><span>instanceof</span></td>
<td><span>이항</span></td>
<td><span>boolean</span></td>
<td><span>값의 비교</span></td>
</tr>
<tr>
<td><span>논리</span></td>
<td><span>!, &amp;, |, &amp;&amp;, ||</span></td>
<td><span>단항, 이항</span></td>
<td><span>boolean</span></td>
<td><span>논리적 NOT, AND, OR 연산</span></td>
</tr>
<tr>
<td><span>조건</span></td>
<td><span>(조건식) ? A : B</span></td>
<td><span>삼항</span></td>
<td><span>다양</span></td>
<td><span>조건식에 따라 A 또는 B 중 하나를 선택</span></td>
</tr>
<tr>
<td><span>비트</span></td>
<td><span>~, &amp;, |, ^</span></td>
<td><span>단항, 이항</span></td>
<td><span>숫자, boolean</span></td>
<td><span>비트 NOT, AND, OR, XOR 연산</span></td>
</tr>
<tr>
<td><span>쉬프트</span></td>
<td><span>&gt;&gt;, &lt;&lt;, &gt;&gt;&gt;</span></td>
<td><span>이항</span></td>
<td><span>숫자</span></td>
<td><span>비트를 좌측/우측으로 밀어서 이동</span></td>
</tr>
</tbody>
</table>

(** 한빛 미디어, 이것이 자바다. 신용권의 Java 프로그래밍 정복 내용 참고)

#### 산술연산자

---

일반적으로 산술 연산은 덧셈, 뺄셈, 곱셈, 나눗셈의 사칙 연산을 뜻한다.

자바에서 산술 연산은 사칙연산과 나머지 연산을 포함한 다섯 가지 연산을 뜻한다.

덧셈과 뺄셈 그리고 곱셈은 일반적으로 알고 있는 수학에서 계산과 동일하다.

나눗셈과 나머지 연산은 처음 프로그래밍을 접한다면 다소 생소할 수 있다.

산술 연산에 대한 예를 살펴보기 전에 2주차에서 살펴봤던 타입 캐스팅과 타입 프로모션을 다시 한 번 생각해볼 필요가 있다.

요약하자면,

타입 캐스팅은 원본 데이터의 데이터 타입 표현 범위를 모두 표현하지 못하는 데이터 타입으로 만들어진 변수에 값을 넣을 때 발생하는 것이고

타입 프로모션은 원본 데이터의 데이터 타입 표현 범위를 모두 표현할 수 있는 데이터 타입으로 만들어진 변수에 값을 넣을 때 발생하는 것이다.

산술 연산에서는 타입 캐스팅과 타입 프로모션이 빈번히 발생할 수 있기 때문에, 데이터 타입에 따른 값의 변화에 주의해야 한다.

```java
package me.xxxelppa.study.week03;

public class Exam_001 {
    public static void main(String[] args) {
        int v1 = 10;
        int v2 = 3;

        System.out.println("v1 + v2 = " + (v1 + v2));
        System.out.println("v1 - v2 = " + (v1 - v2));
        System.out.println("v1 * v2 = " + (v1 * v2));
        System.out.println("v1 / v2 = " + (v1 / v2));
        System.out.println("v1 % v2 = " + (v1 % v2));

    }
}
```

<table>
<tbody>
<tr>
<td><span>v1&nbsp;+&nbsp;v2&nbsp;=&nbsp;13 </span><br><span>v1&nbsp;-&nbsp;v2&nbsp;=&nbsp;7 </span><br><span>v1&nbsp;*&nbsp;v2&nbsp;=&nbsp;30 </span><br><span>v1&nbsp;/&nbsp;v2&nbsp;=&nbsp;3 </span><br><span>v1&nbsp;%&nbsp;v2&nbsp;=&nbsp;1</span></td>
</tr>
</tbody>
</table>

예시로 작성한 코드에서 보면 알 수 있듯, 정수형 자료형을 사용해서 연산을 했기 때문에 정수 표현 범위 내에서만 결과를 만들어낼 수 있다.

그래서 나눗셈과 나머지 연산을 보면, 정확히 그 몫과 나머지를 정수형으로 자동 변환 되어 결과를 출력한 것을 볼 수 있다.

이것을 실수형 자료형을 사용하면 결과가 조금 다르게 나온다.

```java
package me.xxxelppa.study.week03;

public class Exam_002 {
    public static void main(String[] args) {
        double v1 = 10;
        double v2 = 3;

        System.out.println("v1 + v2 = " + (v1 + v2));
        System.out.println("v1 - v2 = " + (v1 - v2));
        System.out.println("v1 * v2 = " + (v1 * v2));
        System.out.println("v1 / v2 = " + (v1 / v2));
        System.out.println("v1 % v2 = " + (v1 % v2));

    }
}
```

<table>
<tbody>
<tr>
<td><span>v1&nbsp;+&nbsp;v2&nbsp;=&nbsp;13.0 </span><br><span>v1&nbsp;-&nbsp;v2&nbsp;=&nbsp;7.0 </span><br><span>v1&nbsp;*&nbsp;v2&nbsp;=&nbsp;30.0 </span><br><span>v1&nbsp;/&nbsp;v2&nbsp;=&nbsp;3.3333333333333335 </span><br><span>v1&nbsp;%&nbsp;v2&nbsp;=&nbsp;1.0</span></td>
</tr>
</tbody>
</table>

실수 표현 범위를 가질 수 있기 때문에 소수점 아래 값도 계산되어 결과가 나오는 것을 볼 수 있다.

#### 비트 연산자

---

개인적으로 비트 연산을 자주 사용하는 상황이 없었기 때문에 오랜 기억을 떠올려야 한다.

비트 연산은 1과 0을 가지고 이루어진다.

일반적으로 0이 거짓, false를 상징하고, 그 외의 모든 값은 true를 상징한다.

~ 은 단항 연산을 하며 부정, not 을 뜻한다. 그래서 1은 0으로 0은 1로 변환한다. (NOT)

& 는 이항 연산자로 양쪽 항의 값이 모두 1인 경우 1을 반환한다. (AND)

| 는 이항 연산자로 양쪽 항 중 하나라도 1이면 1을 반환한다. (OR)

^ 는 이항 연산자로 양쪽 한의 값이 서로 다를 때 1을 반환 한다. (XOR, exclusive or)

비트 연산을 할 때 '진리표'라는 것을 작성 하기도 한다.

진리표는 모든 입출력 경우에 대한 참거짓 결과를 논리값으로 정리한 표이다.

각 비트 연산에 대한 진리표는 다음과 같다.

<table>
<tbody>
<tr>
<td><span>~ (NOT)</span></td>
</tr>
<tr>
<td><span>입력1</span></td>
<td><span>결과</span></td>
</tr>
<tr>
<td><span>1</span></td>
<td><span>0</span></td>
</tr>
<tr>
<td><span>0</span></td>
<td><span>1</span></td>
</tr>
</tbody>
</table>

비트를 반전 시킨다.

<table>
<tbody>
<tr>
<td><span>&amp; (AND)</span></td>
</tr>
<tr>
<td><span>입력1</span></td>
<td><span>입력2</span></td>
<td><span>결과</span></td>
</tr>
<tr>
<td><span>1</span></td>
<td><span>1</span></td>
<td><span>1</span></td>
</tr>
<tr>
<td><span>1</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
</tr>
<tr>
<td><span>0</span></td>
<td><span>1</span></td>
<td><span>0</span></td>
</tr>
<tr>
<td><span>0</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
</tr>
</tbody>
</table>

둘 다 참(1)인 경우 참(1)을 반환 한다.

<table>
<tbody>
<tr>
<td><span>| (OR)</span></td>
</tr>
<tr>
<td><span>입력1</span></td>
<td><span>입력2</span></td>
<td><span>출력</span></td>
</tr>
<tr>
<td><span>1</span></td>
<td><span>1</span></td>
<td><span>1</span></td>
</tr>
<tr>
<td><span>1</span></td>
<td><span>0</span></td>
<td><span>1</span></td>
</tr>
<tr>
<td><span>0</span></td>
<td><span>1</span></td>
<td><span>1</span></td>
</tr>
<tr>
<td><span>0</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
</tr>
</tbody>
</table>

하나라도 참(1)인 경우 참(1)을 반환 한다.

<table>
<tbody>
<tr>
<td><span>^ (XOR)</span></td>
</tr>
<tr>
<td><span>입력1</span></td>
<td><span>입력2</span></td>
<td><span>결과</span></td>
</tr>
<tr>
<td><span>1</span></td>
<td><span>1</span></td>
<td><span>0</span></td>
</tr>
<tr>
<td><span>1</span></td>
<td><span>0</span></td>
<td><span>1</span></td>
</tr>
<tr>
<td><span>0</span></td>
<td><span>1</span></td>
<td><span>1</span></td>
</tr>
<tr>
<td><span>0</span></td>
<td><span>0</span></td>
<td><span>0</span></td>
</tr>
</tbody>
</table>

서로 다른 경우 참(1)을 반환 한다.

비트 연산을 다양한 곳에서 활용할 수 있겠지만, 지금 당장 생각 나는 건 네트워크의 서브넷 마스크이다.

숫자에 대해 비트 연산을 하면 어떻게 되는지 예시를 살펴보자.

```java
package me.xxxelppa.study.week03;

public class Exam_004 {
    public static void main(String[] args) {
        // 정수형 자료형 int는 8바이트, 즉 32비트로 표현 한다.
        int v1 = 10;    // 00000000 00000000 00000000 00001010
        int v2 = 15;    // 00000000 00000000 00000000 00001111

        /*
         * ~ 연산을 하면 모든 비트를 반전한다.
         *
         * 11111111 11111111 11111111 11110101
         * MSB가 1 -> 음수를 뜻함
         * 2의 보수를 취한 값에 -부호를 붙인 값을 반환
         *
         * 00000000 00000000 00000000 00001010    -> 모든 비트 반전
         * 00000000 00000000 00000000 00001011    -> 1을 더함
         *
         * 1011 은 10진수 11이므로 -11을 뜻함
         */
        System.out.println(~v1);        // -11

        /*
         * 00000000 00000000 00000000 00001010
         * 00000000 00000000 00000000 00001111
         * -------------------------------------
         * 양쪽 모두 1일 때 1을 반환
         * 00000000 00000000 00000000 00001010
         *
         * 1010 은 10진수 10을 뜻함
         */
        System.out.println(v1 & v2);    // 10

        /*
         * 00000000 00000000 00000000 00001010
         * 00000000 00000000 00000000 00001111
         * -------------------------------------
         * 한쪽이라도 1이면 1을 반환
         * 00000000 00000000 00000000 00001111
         *
         * 1111 은 10진수 15을 뜻함
         */
        System.out.println(v1 | v2);    // 15

        /*
         * 00000000 00000000 00000000 00001010
         * 00000000 00000000 00000000 00001111
         * -------------------------------------
         * 서로 다를 때 1을 반환
         * 00000000 00000000 00000000 00000101
         *
         * 101 은 10진수 5을 뜻함
         */
        System.out.println(v1 ^ v2);    // 5

    }
}
```

<table>
<tbody>
<tr>
<td><span>-11 </span><br><span>10 </span><br><span>15 </span><br><span>5</span></td>
</tr>
</tbody>
</table>

알고리즘 문제를 풀 때도 가끔 비트연산을 활용하면 생각보다 문제를 쉽게 풀 수 있을때가 있으니

자주 사용하지 않더라도 대략 어떻게 동작하는지 알아두면 좋을것 같다.

#### 관계 연산자

---

관계 연산자는 이 연산자를 중심으로 양쪽의 값이 어떤 관계를 갖는지 확인하는 연산이다.

예를 들면, 두 값이 같은지, 어느 쪽 같이 더 큰지, 작은지 등을 알아보는데 사용 한다.

종류는 다음과 같다.

==, !=, >, <, >=, <=, instanceof

<table>
<tbody>
<tr>
<td><span>연산자</span></td>
<td><span>이름</span></td>
<td><span>설명</span></td>
</tr>
<tr>
<td><span>==</span></td>
<td><span>같음</span></td>
<td><span>양쪽 값이 같으면 참, 다르면 거짓</span></td>
</tr>
<tr>
<td><span>!=</span></td>
<td><span>같지 않음</span></td>
<td><span>양쪽 값이 다르면 참, 같으면 거짓</span></td>
</tr>
<tr>
<td><span>&gt;</span></td>
<td><span>보다 큼</span></td>
<td><span>왼쪽 값이 크면 참, 같거나 작으면 거짓</span></td>
</tr>
<tr>
<td><span>&gt;=</span></td>
<td><span>보다 크거나 같음</span></td>
<td><span>왼쪽 값이 크거나 같으면 참, 작으면 거짓</span></td>
</tr>
<tr>
<td><span>&lt;</span></td>
<td><span>보다 작음</span></td>
<td><span>왼쪽 값이 작으면 참, 같거나 크면 거짓</span></td>
</tr>
<tr>
<td><span>&lt;=</span></td>
<td><span>보다 작거나 같음</span></td>
<td><span>왼쪽 값이 작거나 같으면 참, 크면 거짓</span></td>
</tr>
<tr>
<td><span>instanceof</span></td>
<td>&nbsp;</td>
<td><span>왼쪽 참조 변수 값이 오른쪽 참조 변수 타입이면 참, 아니면 거짓</span></td>
</tr>
</tbody>
</table>

```java
package me.xxxelppa.study.week03;

public class Exam_005 {
    public static void main(String[] args) {
        // == 연산자
        System.out.println("10 == 10 : " + (10 == 10));   // true
        System.out.println("10 == 20 : " + (10 == 20));   // false

        // != 연산자
        System.out.println("10 != 10 : " + (10 != 10));   // false
        System.out.println("10 != 20 : " + (10 != 20));   // true

        // > 연산자
        System.out.println("10 > 20 : " + (10 > 20));    // false
        System.out.println("20 > 10 : " + (20 > 10));    // true

        // >= 연산자
        System.out.println("10 >= 10 : " + (10 >= 10));   // true
        System.out.println("10 >= 20 : " + (10 >= 20));   // false

        // < 연산자
        System.out.println("10 < 20 : " + (10 < 20));    // true
        System.out.println("20 < 10 : " + (20 < 10));    // false

        // <= 연산자
        System.out.println("10 <= 10 : " + (10 <= 10));   // true
        System.out.println("20 <= 10 : " + (20 <= 10));   // false

    }
}
```

<table>
<tbody>
<tr>
<td><span>10&nbsp;==&nbsp;10&nbsp;:&nbsp;true </span><br><span>10&nbsp;==&nbsp;20&nbsp;:&nbsp;false </span><br><span>10&nbsp;!=&nbsp;10&nbsp;:&nbsp;false </span><br><span>10&nbsp;!=&nbsp;20&nbsp;:&nbsp;true </span><br><span>10&nbsp;&gt;&nbsp;20&nbsp;:&nbsp;false </span><br><span>20&nbsp;&gt;&nbsp;10&nbsp;:&nbsp;true </span><br><span>10&nbsp;&gt;=&nbsp;10&nbsp;:&nbsp;true </span><br><span>10&nbsp;&gt;=&nbsp;20&nbsp;:&nbsp;false </span><br><span>10&nbsp;&lt;&nbsp;20&nbsp;:&nbsp;true </span><br><span>20&nbsp;&lt;&nbsp;10&nbsp;:&nbsp;false </span><br><span>10&nbsp;&lt;=&nbsp;10&nbsp;:&nbsp;true </span><br><span>20&nbsp;&lt;=&nbsp;10&nbsp;:&nbsp;false</span></td>
</tr>
</tbody>
</table>

instanceof 에 대해서는 클래스에 대해 정리해볼 때 따로 예시를 작성 해보려 한다.

그 외의 경우 수학에서 배웠던 것과 크게 다르지 않으며, '같음'과 '같지 않음'이 생긴 것이 조금 생소할 뿐이다.

#### 논리 연산자

---

비트 연산과 비슷하지만 그 대상(피연산자)이 boolean 타입의 논리 값이라는 것이다.

! 는 논리적인 부정을 뜻하며, true를 false로, false를 true로 바꿔준다.

그 외 && (AND), || (OR) 연산은 비트 연산자에서 보았던 것과 같은 개념을 갖는다.

즉, &&는 양쪽 피연산자 모두 true 일 때 true 를 반환하고 그 외의 경우는 false 를 반환한다.

|| 는 양쪽 피연산자 중 하나라도 true이면 true 를 반환하고 그 외의 경우는 false 를 반환한다.

```java
package me.xxxelppa.study.week03;

public class Exam_006 {
    public static void main(String[] args) {
        boolean myTrue = true;
        boolean myFalse = false;

        if (myTrue & myFalse)  System.out.println("if test 1 > myTrue 와 myFalse 는 모두 true 입니다.");
        if (myTrue | myFalse)  System.out.println("if test 2 > myTrue 와 myFalse 둘 중 하나는 true 입니다.");
        if (myTrue && myFalse) System.out.println("if test 3 > myTrue 와 myFalse 는 모두 true 입니다.");
        if (myTrue || myFalse) System.out.println("if test 4 > myTrue 와 myFalse 둘 중 하나는 true 입니다.");

        if (!myFalse) System.out.println("!myFalse 의 결과는 true 입니다.");

    }
}
```

<table>
<tbody>
<tr>
<td><span>if&nbsp;test&nbsp;2&nbsp;&gt;&nbsp;myTrue&nbsp;와&nbsp;myFalse&nbsp;둘&nbsp;중&nbsp;하나는&nbsp;true&nbsp;입니다. </span><br><span>if&nbsp;test&nbsp;4&nbsp;&gt;&nbsp;myTrue&nbsp;와&nbsp;myFalse&nbsp;둘&nbsp;중&nbsp;하나는&nbsp;true&nbsp;입니다. </span><br><span>!myFalse&nbsp;의&nbsp;결과는&nbsp;true&nbsp;입니다.</span></td>
</tr>
</tbody>
</table>

그렇다면 & 와 && 그리고 | 과 || 는 무엇이 다른걸까.

&&는 첫번째 조건이 참이 아니면 두번째 조건은 확인하지 않는다.

&는 첫번째 조건이 참이 아니어도 두번째 조건을 확인한다.

||는 첫번째 조건이 참이면 두번째 조건은 확인하지 않는다.

|는 첫번째 조건이 참이어도 두번째 조건을 확인한다.

간혹 && 와 || 연산을 사용할 때 truthy, falsy 하다라는 말을 사용하기도 한다.

#### instanceof

---

스터디 진행 중 클래스에 대해 학습해볼 때 알아보려고 했는데, 지금 알아봐야 할 것 같다.

사용 방법은 "(레퍼런스 타입 변수) instanceof (레퍼러스 데이터 타입)" 이며, 레퍼런스 타입 변수가 레퍼런스 타입의 데이터 타입인지 확인해보는 연산이다.

클래스 역시 사용자 정의 자료형이라 할 수 있기 때문에 포괄적으로 레퍼런스 데이터 타입 이라고 정리했다.

다양한 곳에서 활용할 수 있지만, 보통 레퍼런스 타입 변수가 레퍼런스 데이터 타입으로 타입 변환이 가능한지 확인하기 위해서 사용한다.

타입 변환이 가능 하다는 것은 여러가지 내용을 내포할 수 있다.

상속에 대해 정리해볼 때 잊지 않는다면 다시 한 번 이 내용을 언급 해야겠다.

우선 instanceof 를 사용하는 간단한 예제 코드를 작성해 보았다.

```java
package me.xxxelppa.study.week03;

public class Exam_007 {
    public static void main(String[] args) {
        MyParents_0 myParents_0 = new MyParents_0();
        MyParents_1 myParents_1 = new MyParents_1();
        MyParents_2 myParents_2 = new MyParents_2();

        System.out.println("expect false :: " + (myParents_0 instanceof MyInterface));
        System.out.println("expect true  :: " + (myParents_1 instanceof MyInterface));
        System.out.println("expect true  :: " + (myParents_2 instanceof MyInterface));

        System.out.println("expect true  :: " + (myParents_1 instanceof MyParents_2));

        /*
         * instanceof 연산 결과가 true 일 경우
         * 해당 타입의 변수에 값을 할당할 수 있다.
         */
        if (myParents_1 instanceof MyInterface) {
            MyInterface myInterface = new MyParents_1();
            System.out.println("자신의 상위 타입의 변수에 값을 할당할 수 있다. :: " + (myInterface != null));
        }
    }
}

class MyParents_0 {}
class MyParents_1 extends MyParents_2 {}
class MyParents_2 implements MyInterface {}
interface MyInterface {}
```

<table>
<tbody>
<tr>
<td><span>expect&nbsp;false&nbsp;::&nbsp;false </span><br><span>expect&nbsp;true&nbsp;&nbsp;::&nbsp;true </span><br><span>expect&nbsp;true&nbsp;&nbsp;::&nbsp;true </span><br><span>expect&nbsp;true&nbsp;&nbsp;::&nbsp;true </span><br><span>자신의&nbsp;상위&nbsp;타입의&nbsp;변수에&nbsp;값을&nbsp;할당할&nbsp;수&nbsp;있다.&nbsp;::&nbsp;true</span></td>
</tr>
</tbody>
</table>

#### assignment(=) operator

---

대입 또는 할당 연산자라고 부른다. 오른쪽의 피연산자를 왼쪽의 피연산자의 값으로 할당한다.

그렇기 때문에 왼쪽에는 변수가, 오른쪽엔 리터럴 또는 리터럴이 담긴 변수가 온다.

값을 초기화 한다고 표현하기도 한다.

등호(=) 만 사용하는 경우도 있지만, 다른 연산자를 함께 사용하여 문장의 길이를 줄이기도 한다.

다른 연산자를 함께 사용하면 다음과 같은 효과가 있다.

예를 들어 다른 연산자를 {?}라고 하면

variable {?}= literal;

이것은 다음 연산을 축약한 표현이 된다.

variable = variable {?} literal;

즉, 자기 자신에 대해 연산한 결과를 다시 자기 자신에 담을 경우 사용한다.

```java
package me.xxxelppa.study.week03;

public class Exam_008 {
    public static void main(String[] args) {
        int v1 = 10;
        System.out.println(v1 += 20);
        System.out.println(v1);
    }
}
```

<table>
<tbody>
<tr>
<td><span>30</span><br><span>30</span></td>
</tr>
</tbody>
</table>

7라인에서 v1 값을 한번 더 출력해본 이유는, 이러한 대입 연산을 하면 기존의 v1값을 덮어 쓴다는 것을 다시 한 번 확인해보기 위함이다.

다른 연산들은 수학에서도 보기 때문에 익숙하겠지만 >>, <<, >>> 과 같은 시프트 연산은 처음 볼 수 있다.

이들은 비트 이동 연산자로 말 그래도 비트를 이동하는 연산을 한다.

```java
package me.xxxelppa.study.week03;

public class Exam_009 {
    public static void main(String[] args) {
        int v1, v2;

        System.out.println("============= << 연산 ============");
        v1 = 17;            // 00000000 00000000 00000000 00010001
        v2 = v1 << 3;       // 00000000 00000000 00000000 10001000
        System.out.println(v2); // 128 + 8 = 136
        System.out.println();

        System.out.println("========== 양수 >> 연산 ==========");
        v1 = 17;            // 00000000 00000000 00000000 00010001
        v2 = v1 >> 3;       // 00000000 00000000 00000000 00000010
        System.out.println(v2); // 2
        System.out.println();

        System.out.println("========== 음수 >> 연산 ==========");
        v1 = -17;           // 11111111 11111111 11111111 11101111
        v2 = v1 >> 3;       // 11111111 11111111 11111111 11111101
        System.out.println(v2); // -3
        System.out.println();

        System.out.println("========== 양수 >>> 연산 ==========");
        v1 = 17;            // 00000000 00000000 00000000 00010001
        v2 = v1 >>> 3;      // 00000000 00000000 00000000 00000010
        System.out.println(v2); // 2
        System.out.println();

        System.out.println("========== 음수 >>> 연산 ==========");
        v1 = -17;               // 11111111 11111111 11111111 11101111
        v2 = v1 >>> 3;          // 00011111 11111111 11111111 11111101
        System.out.println(v2); // 00100000 00000000 00000000 00000000 -> 536870912 :: 이 값에서 1을 빼면
                                // 00011111 11111111 11111111 11111111 -> 536870911 :: 이 값에서 2를 빼면
                                // 00011111 11111111 11111111 11111101 -> 536870909
        System.out.println();
    }
}
```

>> 이 것과 >>> 이 것의 차이는, 오른쪽으로 비트 이동을 할 때 MSB값으로 채우느냐 무조건 0으로 채우느냐 이다.
>> 이 연산의 경우 MSB 값으로 부족한 비트를 채우고, >>> 이 연산은 MSB 상관없이 무조건 0으로 값을 채워준다.

모든 비트 연산을 할 때, 밀려 나는 비트는 전부 버려진다.

#### 화살표(->) 연산자

---

자바에 람다가 도입 되면서 등장한 연산자로 알고 있다.

람자는 자바8에서 등장 했으며, 기존의 익명 클래스 객체를 만드는 대신 메소드(또는 함수)를 1급 시민으로 값으로 취급하여 전달할 수 있게 하였다.

예전에 자바 람다에 대해 정리를 해본 적이 있었다.

지금 생각해보면 람다를 활용하기 전, 처음 공부를 하면서 정리했었기 때문에 다듬어야 할 내용이 많을 것 같다.

이번을 계기로 조만간 다시 한 번 정독하고 내용을 고쳐야겠다.

[자바 함수형 인터페이스와 람다식 1편 : 기본 개념과 사용법](https://xxxelppa.tistory.com/48?category=607878)

[자바 함수형 인터페이스와 람다식 2편 : 생략 문법과 제약사항](https://xxxelppa.tistory.com/49?category=607878)

화살표 함수를 요약하자면

왼쪽에 메소드(또는 함수)에서 사용 할 매개변수를 나열한다.

예를 들어

```java
public void printParamString(String str) {
    System.out.println("출력할 문자열 : " + str);
}
```

이라는 메소드가 있다고 하면

화살표 왼쪽에 다음과 같이 작성해줄 수 있다.

stringTypeVariable ->

(매개 변수가 하나라면 소괄호를 생략할 수 있다.)

그리고 오른쪽에 실제 매개변수를 받아서 처리하는 로직이 작성 된다.

-> {

System.out.printl("출력할 문자열 : " + stringTypeVariable);

}

사용함에 있어서 특별한 조건이 필요하지만

지금은 화살표 연산자 왼쪽엔 매개변수들이, 오른쪽엔 그 매개 값을 사용하는 로직이 작성 된다고 알고 넘어가자.

15주차 람다식에 대해 정리할 때 자세히 다뤄봐야겠다.

#### 3항 연산자

---

가끔 가독성 문제로 이 연산자를 사용하는 것을 싫어하는 사람들이 있다.

개인적으로 너무 길지 않으면 활용하는 편이다.

3항 연산자는 항이 3개라 3항 연산자다.

물음표와 콜론을 사용하며, 기본적인 생김새는 다음과 같다.

(조건) ? (조건이 참일 때 실행) : (조건이 거짓일 때 실행)

```java
package me.xxxelppa.study.week03;

public class Exam_010 {
    public static void main(String[] args) {
        int v1 = 10;

        if(v1 > 10) v1 *= 10;
        else v1 -= 5;

        System.out.println(v1);
    }
}
```

<table>
<tbody>
<tr>
<td><span>5</span></td>
</tr>
</tbody>
</table>

담긴 값이 10보다 크면 10배를, 같거나 작으면 -5를 하는 작업을 한다고 했을 때

if조건문을 사용하면 위와 같이 작성할 수 있다.

이를 3항 연산자를 사용하면 다음과 같이 작성할 수 있다.

```java
package me.xxxelppa.study.week03;

public class Exam_011 {
    public static void main(String[] args) {
        int v1 = 11;
        System.out.println(v1 > 10 ? (v1 *= 10) : (v1 -= 5));
    }
}
```

<table>
<tbody>
<tr>
<td><span>110</span></td>
</tr>
</tbody>
</table>

if 조건문 안에 또 다른 if 조건문을 넣을 수 있는 것처럼, 3항 연산 안에 또 다른 3항 연산을 중첩해서 사용할 수 있다.

하지만 매우 복잡해질 수 있기 때문에 추천하지 않는다.

#### 연산자 우선 순위

---

수학에서도 그렇지만 모든 연산에는 우선순위가 있다.

예를 들어 1 + 2 * 3 을 계산할 때, 곱셈이 덧셈보다 우선순위가 높기 때문에 9가 아닌 7이 연산의 결과가 된다.

<table>
<tbody>
<tr>
<td><span>우선순위</span></td>
<td><span>연산자</span></td>
</tr>
<tr>
<td><span>1</span></td>
<td><span>(),&nbsp;[]</span></td>
</tr>
<tr>
<td><span>2</span></td>
<td><span>!, ~, ++, --</span></td>
</tr>
<tr>
<td><span>3</span></td>
<td><span>*, /, %</span></td>
</tr>
<tr>
<td><span>4</span></td>
<td><span>+, -</span></td>
</tr>
<tr>
<td><span>5</span></td>
<td><span>&lt;&lt;, &gt;&gt;, &gt;&gt;&gt;</span></td>
</tr>
<tr>
<td><span>6</span></td>
<td><span>&lt;, &lt;=, &gt;, &gt;=</span></td>
</tr>
<tr>
<td><span>7</span></td>
<td><span>==, !=</span></td>
</tr>
<tr>
<td><span>8</span></td>
<td><span>&amp;</span></td>
</tr>
<tr>
<td><span>9</span></td>
<td><span>^</span></td>
</tr>
<tr>
<td><span>10</span></td>
<td><span>|</span></td>
</tr>
<tr>
<td><span>11</span></td>
<td><span>&amp;&amp;</span></td>
</tr>
<tr>
<td><span>12</span></td>
<td><span>||</span></td>
</tr>
<tr>
<td><span>13</span></td>
<td><span>? :</span></td>
</tr>
<tr>
<td><span>14</span></td>
<td><span>=, +=, -=, *=, /=, &lt;&lt;=, &gt;&gt;=, &amp;=, ^=, ~=</span></td>
</tr>
</tbody>
</table>

자주 사용하는 연산은 굳이 외우지 않아도 익숙해진다. 그리고 사실 전부 외우는 것이 불가능하지 않지만 쉽지도 않다.

연산자의 우선순위 때문에 코딩하는 사람도 읽는 사람도 고통스럽지 않는, 모두가 행복한 방법이 있다.

괄호를 적극적으로 사용하면 된다.

그렇다고 너무 모든 연산마다 쓸 것 까진 없지만, 애매한 부분에 대해 적절히 사용해주면 가독성 좋은 연산 문장을 작성할 수 있다.

굳이 한 줄에 모든 연산을 표현할 필요는 없으니 (아마도..?) 적절히 여러 라인에 걸쳐 작성해 주는 것도 좋은 방법이라 생각한다.

#### (optional) Java 13, switch operator

---

switch 문법은 조건에 따라 분기해야 할 내용이 많아질 경우, 가독성을 포함하여 실행 속도를 향상 시키기 위해 있는 문법으로 알고 있다.

이번에 java 13에서 달라진 switch 문법에 대해 알아보다보니 java 12에서도 꽤 많은 변화가 있었던 것 같았다.

그래서 12와 13에서 사용 방법이 어떻게 달라 졌는지 간단한 예제를 작성해 보았다.

 아무래도 기분이 개운하지 못해서 조금 더 찾아보고 공부해 보았다.

잘못 전달 될 만한 내용이 있어서 내용을 추가하기로 했다.

java 13 에서 switch 는 statement 가 아니고 operator(또는 expression) 라는 것이다.

본문의 제일 처음 정리한 내용을 바탕으로 이해해보면,

연산자는 연산에 사용되는 표시나 기호이다.

그리고 연산은 데이터를 처리하여 결과를 산출해내는 것을 뜻한다.

즉, 처리한 결과가 존재한다는 것이다.

그래서 이전의 switch 와 비교했을 때, switch 자체가 연산자로 작동하여 하나의 값으로 취급될 수 있다는 것을 의미한다.

이 사실을 염두에 두고 아래 예제를 보면 조금 더 재미있게 볼 수 있을 것 같다.

([참고가 될 만한 링크](https://nipafx.dev/java-13-switch-expressions/))

```java
package me.xxxelppa.study.week03;

public class Exam_012 {
    public static void main(String[] args) {
        /*
         * 가장 기본적인 형태의 switch 문
         */
        System.out.println(switchBasic("a"));   // 1
        System.out.println(switchBasic("e"));   // 3

        /*
         * java 12 부터 쉼표(, 콤마)를 사용하여 여러 case 를 한 줄에 나열
         */
        System.out.println(switchWithMultiCase("d"));   // 3
        System.out.println(switchWithMultiCase("f"));   // 3

        /*
         * java 12 부터 화살표 (arrow ->) 를 사용하여 결과 반환
         * 더 이상 break 키워드를 사용하지 않아도 원하는 결과를 받아볼 수 있음
         * 실행 결과를 바로 변수에 할당
         */
        System.out.println(switchWithArrow("c"));   // 2
        System.out.println(switchWithArrow("e"));   // 3

        /*
         * java 13 부터 yield 키워드를 사용하여 switch 결과 반환
         */
        System.out.println(switchWithJava13Yield("a"));   // 1
        System.out.println(switchWithJava13Yield("e"));   // 3
    }

    private static int switchBasic(String str) {
        int result;
        switch (str) {
            case "a":
            case "b":
                result = 1;
                break;
            case "c":
                result = 2;
                break;
            case "d":
            case "e":
            case "f":
                result = 3;
                break;
            default:
                result = -1;
        };
        return result;
    }

    private static int switchWithMultiCase(String str) {
        int result;
        switch (str) {
            case "a", "b":
                result = 1;
                break;
            case "c":
                result = 2;
                break;
            case "d", "e", "f":
                result = 3;
                break;
            default:
                result = -1;
        };
        return result;
    }

    private static int switchWithArrow(String str) {
        int result = switch (str) {
            case "a", "b" -> 1;
            case "c" -> 2;
            case "d", "e", "f" -> 3;
            default -> -1;
        };
        return result;
    }

    private static int switchWithJava13Yield(String str) {
        int result = switch (str) {
            case "a", "b":
                yield 1;
            case "c":
                yield 2;
            case "d", "e", "f" : {
                System.out.println("{} 블록을 사용하여 추가 로직을 수행할 수 있다.");
                yield 3;
            }
            default:
                yield -1;
        };
        return result;
    }
}
```
