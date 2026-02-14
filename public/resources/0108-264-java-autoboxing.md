자바에는 8대 자료형이라 불리는 기본 자료형이 있다.

이 기본 자료형을 특별하게 분류하는 이유는 클래스가 아니기 때문이다.

클래스가 아니라는 것은 다른 말로 참조타입(reference type)이 아니라는 뜻이다.

당장 적당한 예시가 떠오르지 않지만, 이 기본 타입들에 대해 객체로 표현해야 하는 경우가 있는데 문제는 참조타입이 아니기 때문에 객체를 생성하지 못하는 문제가 있다.

그래서 Java에는 Wrapper(래퍼) 라고 부르는 클래스가 존재한다.

이 클래스들은 기본 자료형을 참조타입으로 객체를 생성할 수 있도록 해준다.

<table>
<tbody>
<tr>
<td>기본 타입 (primitive type)</td>
<td>래퍼클래스 (Wrapper class)</td>
</tr>
<tr>
<td>byte</td>
<td>Byte</td>
</tr>
<tr>
<td>short</td>
<td>Short</td>
</tr>
<tr>
<td>int</td>
<td>Integer</td>
</tr>
<tr>
<td>long</td>
<td>Long</td>
</tr>
<tr>
<td>float</td>
<td>Float</td>
</tr>
<tr>
<td>double</td>
<td>Double</td>
</tr>
<tr>
<td>char</td>
<td>Character</td>
</tr>
<tr>
<td>boolean</td>
<td>Boolean</td>
</tr>
</tbody>
</table>

Java에서는 primitive type 과 Wrapper 타입의 변환을 자동으로 해주는데, 이걸을 AutoBoxing 이라고 한다.

다음 코드는 박싱과 언박싱, 그리고 자동 박싱과 자동 언박싱의 예를 보여준다.

```java
package com.tistory.xxxelppa.section_001;

public class BoxingUnboxing {
    public static void main(String[] args) {
        Integer myWrapperNumber = new Integer(21);    // Boxing
        int myPrimitiveNumber = myWrapperNumber.intValue();  // Unboxing

        Integer myAutoBoxingNumber = 21;                // AutoBoxing
        int myAutoUnBoxingNumber = myAutoBoxingNumber;  // AutoUnBoxing
    }
}
```

꽤나 편리해 보이는데 왜 되도록 피하라고 했을까?

다음 코드를 보자

```java
    private static long sum_with_autoboxing() {
        Long sum = 0L;
        for (long i = 0; i < Integer.MAX_VALUE; ++i) {
            sum += i;
        }
        return sum;
    }
```

그다지 문제가 있어보이지 않는 0부터 4바이트 정수 자료형 int 의 최대 표현 범위의 값의 누적 합을 계산해 long 타입의 변수에 담는 코드이다.

조금 더 정확히 얘기하면 long 타입의 i 값을 Long 타입의 변수에 누적 합을 구하고 있다.

문제는 sum += i; 이 부분이다.

Wrapper 타입의 변수에 값을 할당할 때 우리 눈에는 그저 sum += i; 만 보이지만

컴파일러는 이 코드를 sum += Long.valueOf(i); 로 바꾸기 때문이다.

즉, 저 라인이 실행 될 때마다 Long 타입의 객체를 생성 한다는 것을 의미한다.

지금의 경우 21억개의 무의미한 객체를 생성했다고 생각하면 될 것 같다.

그래서 위의 코드에서 딱 한 문자인 L 을 l 로 고쳐보았다.

```java
    private static long sum_without_autoboxing() {
        long sum = 0L;
        for (long i = 0; i < Integer.MAX_VALUE; ++i) {
            sum += i;
        }
        return sum;
    }
```

그럼 이게 얼마나 차이가 나는걸까?

```java
package com.tistory.xxxelppa.section_001;

/**
 * autoboxing 테스트
 *
 * [실행 결과]
 * use autoboxing : 6644 ms
 * not use autoboxing : 609 ms
 *
 * 되도록 박싱된 기본 타입보다 기본 타입을 사용하고
 * 의도하지 않은 오토박싱이 사용되지 않도록 주의 필요
 *
 */
public class Main {

    public static void main(String[] args) {
        long startTime, endTime;

        startTime = System.currentTimeMillis();
        sum_with_autoboxing();
        endTime = System.currentTimeMillis();
        System.out.println("use autoboxing : " + (endTime - startTime) + " ms");

        startTime = System.currentTimeMillis();
        sum_without_autoboxing();
        endTime = System.currentTimeMillis();
        System.out.println("not use autoboxing : " + (endTime - startTime) + " ms");

    }

    private static long sum_with_autoboxing() {
        Long sum = 0L;
        for (long i = 0; i < Integer.MAX_VALUE; ++i) {
            sum += i;
        }
        return sum;
    }

    private static long sum_without_autoboxing() {
        long sum = 0L;
        for (long i = 0; i < Integer.MAX_VALUE; ++i) {
            sum += i;
        }
        return sum;
    }
}
```

코드의 맨 위에 주석으로 실행 결과를 기록해 두었다.

매변 결과는 조금씩 다르겠지만, 6000ms 즉 6초나 더 오래 걸린것을 확인할 수 있었다.

물론 이렇게 극단적인 상황이 자주 발생하지는 않겠지만, Auto Boxing 을 사용했을 때 내부에서 어떤 일이 생기는지 알고 있으면 좋을것 같아서 정리해 보았다.
