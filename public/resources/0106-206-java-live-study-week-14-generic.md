## 자바의 제네릭에 대해 학습하세요.

---

### 학습할 것

- 제네릭 사용법
- 제네릭 메소드 만들기
- 제네릭 주요 개념(바운디드 타입, 와일드 카드)
- Erasure

---

제네릭을 사용하는 방법에 대해 정리해보기 전에 왜 필요한지에 대해 알면 언제 사용할지 도움이 될 수 있다.

예전에 관련해서 정리했던 링크를 첨부한다.

[java 제네릭 (Generic), 내가 알아보기 쉽게 정리 - 1편, 왜 제네릭](https://xxxelppa.tistory.com/34?category=607878)

링크를 추가 했지만, 그래도 간략하게 제네릭이 왜 필요한지 간단하게 정리해보려 한다.

제네릭을 사용하는 이유에는 흔히 알고있는 컴파일 타임에 타입 체크를 하기 위함이나 타입 캐스팅을 제거하여 프로그램 성능 향상을 위해서 이다.

하지만 보다 궁극적인(?) 목적은 **중복코드의 제거**에 있다고 생각 한다.

예를 들어 다음과 같이 List 에 담긴 내용을 모두 출력하는 메소드를 구현한다고 생각해보자.

list 에 담긴 요소의 타입이 정수인 경우 다음과 같이 만들어볼 수 있다.

```java
    public static void printAllIntegers(List list) {
        for(int i = 0; i < list.size(); ++i) {
            System.out.println((int)list.get(i));
        }
    }
```

list 에 담긴 요소의 타입이 문자열인 경우 다음과 같이 만들어볼 수 있다.

```java
    public static void printAllStrings(List list) {
        for(int i = 0; i < list.size(); ++i) {
            System.out.println((String)list.get(i));
        }
    }
```

각 메소드의 구현부를 비교해보면 타입 캐스팅 부분을 제외하고 모두 동일하다.

심지어 만약 매개변수로 전달 받은 list 에 담긴 요소에 기대하지 않은 타입의 요소가 담겨 있다면 런타임에 예외가 발생할 것이다.

***

첨언이지만, List 클래스의 경우 제네릭을 지원한다. 하지만 위에 작성한 예제는 제네릭을 사용하지 않고 구현 했고 실제로도 동작하는 것을 확인할 수 있다.

이렇게 제네릭을 지원 하지만 제네릭을 사용하지 않고 클래스 자체를 사용하는 경우 **raw type (로 타입)**을 사용 했다고 한다.

앞으로 정리 하겠지만 로 타입은 되도록 사용하지 말아야 한다.

사용할 경우 앞서 제네릭의 강력한 장점인 컴파일 타임에 타입 체크를 하는 것과 타입 캐스팅을 하지 않음으로 얻는 이득을 얻지 못하기 때문이다.

그럼 왜 자바를 만든 사람들은 제네릭을 만들었으면서 사용을 강제하지 않고 로 타입도 지원하도록 했을까.

그건 아마도 자바 언어 개발자들이 **하위 호환성**을 유지하기 위해서다.

제네릭은 JDK5 에 추가된 개념인데 사용을 강제하도록 하면 이전 버전에서는 사용할 수 없기 때문이다.

마지막으로 살펴볼 Erasure 도 하위 호환성을 유지하기 위한 내용이다.

***

위에 작성한 코드를 개선하는 방법에 대해서는 '제네릭 메소드 만들기'에서 자세히 정리하고, 우선 사용 방법에 대해 알아보자.

#### 제네릭 사용법

---

제네릭은 클래스, 인터페이스 그리고 메소드에 사용할 수 있다. 이 때 중요한 것은 매개변수로 '타입'을 전달할 수 있다는 것이다.

이것을 흔히 타입 파라미터 라고 부르고 타입 파라미터의 타입을 작성을 할 때는 각괄호 <> 를 이용한다. 다이아몬드

말로 설명하려니 어려운것 같다. 문자열을 요소로 가지는 리스트를 정의하고 값을 출력하는 예를 살펴보자.

```java
package me.xxxelppa.study.week14;

import java.util.ArrayList;
import java.util.List;

public class Exam_002 {
    public static void main(String[] args) {
        List without_generic = new ArrayList();
        without_generic.add("제네릭을 사용하지 않은 로타입 리스트");

        List<String> with_generic = new ArrayList<>();
        with_generic.add("제네릭을 사용한 리스트");

        /*
            객체를 생성할 때 아래와 같이 구체적인 타입을 작성 해야 하지만 생략 가능하다.
            List<String> with_generic = new ArrayList<String>();

            이렇게 제네릭을 사용할 때 구체적인 타입 생략이 가능한 것을 다이아몬드 연산자 라고도 한다.
         */

        // 출력
        String without_generic_String = (String)without_generic.get(0);  // 타입 캐스팅이 필요하다.
        String with_generic_String = with_generic.get(0);                // 타입 캐스팅이 필요하지 않다.
    }
}
```

제네릭을 사용 한다고 하면 위와 같인 각괄호 안에 사용 할 타입을 작성해서 사용하면 된다.

이번엔 컴파일 타임에 타입을 체크 한다는 것이 무엇인지 알아보자.

만약 타입 파라미터와 맞지 않는 타입의 값을 사용하려 한다면 다음과 같은 메시지를 보여준다.

![0106-206-java-live-study-week-14-generic-img-01.jpg](/tech-blog/resources/images/migration/0106-206-java-live-study-week-14-generic/img-01.jpg)

기억해야 하는 것은 '컴파일 타임'에 타입 체크를 한다는 것이다.

제네릭을 사용하는 것은 알겠는데, 어떻게 만들어져 있길래 사용할 수 있는 건지에 대해서는 얘기하지 않았다.

직접 제네릭을 사용한 클래스를 만들어 보자.

다음은 타입 매개변수 타입의 값을 하나 저장할 수 있는 클래스를 선언하고 사용한 예제이다.

```java
package me.xxxelppa.study.week14;

public class Exam_004 {

    // T 타입 value 를 저장할 수 있는 클래스
    static class MyGenericClass<T> {
        T value;

        MyGenericClass(T value) {
            this.value = value;
        }

        public T getValue() {
            return value;
        }

        public void setValue(T value) {
            this.value = value;
        }
    }

    public static void main(String[] args) {
        MyGenericClass<String> mgc_String = new MyGenericClass<>("사과");
        System.out.println(mgc_String.getValue());

        mgc_String.setValue("자몽");
        System.out.println(mgc_String.getValue());
    }
}
```

<table>
<tbody>
<tr>
<td><span>사과</span><br><span>자몽</span></td>
</tr>
</tbody>
</table>

처음 보면 다소 생소할 수 있지만, 차분히 보면 그리 어렵지 않다.

6라인에서 MyGeneric 클래스를 보면 지금까지 정의했던 클래스와 다른점은 <T> 라는 부분이 추가된 것이다.

이 내용을 작성 함으로 인해 MyGeneric 이라는 클래스 내부에서 T 라는 것을 사용할 수 있게 된다.

그리고 이 T 는 이 클래스 내부에서 '타입 매개변수'를 대표하는 값으로 사용 된다.

그럼**왜 하필 T**일까?

사실 어떤 문자를 사용해도 상관 없다.

심지어 *<myTypeParameter> 라고 해도 잘 동작*한다.

물론 이렇게 정의 했을 경우, 너무나 당연하게도 , 위에서 T 라고 쓴 부분을 모두 myTypeParameter 라고 고쳐줘야 한다.

그럼에도 불구하고 T 를 사용한 이유는 흔히 컨벤션 이라고 하는 우리들 사이의 약속이기 때문이다.

되도록 컨벤션을 지켜 코드를 작성하는게 서로 이해하기 쉽기 때문에 특별한 경우가 아니라면 지켜주는게 좋다.

만약 타입 파라미터가 두 개 이상일 경우 T 이외에 R, S, E, K, V, N, U 등의 문자를 많이 사용 하고 콤마(,) 로 구분한다.

보통 T(type), R(return type), S(String), E(element), K (key), V(value), N(number) 의 의미로 사용하는 것으로 알고있다.

```java
package me.xxxelppa.study.week14;

public class Exam_005 {
    static class MyGenericClass<T, M> {
        T value_1;
        M value_2;

        public T getValue_1() {
            return value_1;
        }

        public void setValue_1(T value_1) {
            this.value_1 = value_1;
        }

        public M getValue_2() {
            return value_2;
        }

        public void setValue_2(M value_2) {
            this.value_2 = value_2;
        }
    }

    public static void main(String[] args) {
        MyGenericClass<String, Integer> mgc = new MyGenericClass<>();
        mgc.setValue_1("사과");
        mgc.setValue_2(1000);
        System.out.println(mgc.getValue_1() + " 한 개 " + mgc.getValue_2() + "원");
    }
}
```

<table>
<tbody>
<tr>
<td><span>사과 한 개 1000원</span></td>
</tr>
</tbody>
</table>

#### 제네릭 메소드 만들기

---

순서대로 라면 '제네릭 주요 개념' 을 먼저 정리 해야 하지만, 편의상 메소드 만드는 것을 먼저 정리하게 되었다.

앞서 제네릭은 클래스와 인터페이스 그리고 메소드에서 사용할 수 있다고 했는데, 이번엔 메소드에서 사용하는 방법을 알아보려 한다.

제네릭 메소드에 대해 정의 하자면, 파라미터와 반환 타입으로 제네릭 타입을 사용하는 것을 말한다.

다음은 타입 파라미터를 하나 전달 받아 그 값을 그대로 반환하는 코드이다.

```java
package me.xxxelppa.study.week14;

public class Exam_006 {

    public static <T> T myGenericTest(T t) {
        return t;
    }

    public static void main(String[] args) {
        System.out.println(myGenericTest("자몽"));
        System.out.println(myGenericTest(1500));
    }
}
```

<table>
<tbody>
<tr>
<td><span>자몽</span><br><span>1500</span></td>
</tr>
</tbody>
</table>

메소드에서 사용할 경우 클래스에서 사용 할때와 다른 부분이 있다.

앞서 클래스에서 사용할 예시에서 getter, setter 에서는 볼 수 없었던 5 라인에 작성된 <T> 가 그렇다.

제네릭 클래스에서는 해당 클래스 내부에서 사용 할 타입 파라미터가 무엇인지 알려주기 위해 class 를 선언할 때 알려 주었다면

제네릭 메소드에서는 메소드를 정의할 때, 해당 메소드 내부에서 사용 할 타입 파라미터가 무엇인지 알려주기 위해

메소드를 정의할 때 5라인 처럼 먼저 나열을 해주고 사용해야 한다. 즉, 리턴 타입을 명시하기 전에 작성 되어야 한다.

마치 '이제부터 T 라는 문자를 만나면, 그건 타입 파라미터니까 놀라지 마' 라고 알려주는 것과 같다.

이번엔 처음에 작성했던 List 내용을 모두 출력하던 메소드를 개선해보자.

개선하기 전의 모습은 다음과 같다.

```java
package me.xxxelppa.study.week14;

import java.util.ArrayList;
import java.util.List;

public class Exam_001 {

    public static void printAllIntegers(List list) {
        for(int i = 0; i < list.size(); ++i) {
            System.out.println((int)list.get(i));
        }
    }

    public static void printAllStrings(List list) {
        for(int i = 0; i < list.size(); ++i) {
            System.out.println((String)list.get(i));
        }
    }

    public static void main(String[] args) {
        List myList_Integers = new ArrayList();
        myList_Integers.add(1);
        myList_Integers.add(2);
        myList_Integers.add(3);

        List myList_Strings = new ArrayList();
        myList_Strings.add("가");
        myList_Strings.add("나");
        myList_Strings.add("다");

        printAllIntegers(myList_Integers);
        printAllStrings(myList_Strings);
    }
}
```

<table>
<tbody>
<tr>
<td><span>1</span><br><span>2</span><br><span>3</span><br><span>가</span><br><span>나</span><br><span>다</span></td>
</tr>
</tbody>
</table>

이것을 제네릭 메소드로 구현하면 다음과 같이 작성해볼 수 있다.

```java
package me.xxxelppa.study.week14;

import java.util.ArrayList;
import java.util.List;

public class Exam_007 {

    public static <T> void printAll(List<T> list) {
        for(T t : list) {
            System.out.println(t);
        }
    }

    public static void main(String[] args) {
        List<Integer> myList_Integers = new ArrayList<>();
        myList_Integers.add(1);
        myList_Integers.add(2);
        myList_Integers.add(3);

        List<String> myList_Strings = new ArrayList<>();
        myList_Strings.add("가");
        myList_Strings.add("나");
        myList_Strings.add("다");

        printAll(myList_Integers);
        printAll(myList_Strings);
    }
}
```

실행 해보면 앞서 작성한 것과 동일한 결과가 나오는 것을 확인할 수 있다.

8라인에 작성한 printAll 제네릭 메소드를 보면,

앞서 List 에 담긴 요소의 타입에 따라 서로 다른 메소드를 작성 하고

요소의 값을 사용할 경우 각 타입에 맞게 타입 캐스팅을 해주어야 했는데

제네릭을 사용해서 컴파일 타임에 요소의 타입 검사를 통해 런타임 오류를 방지하면서

타입 캐스팅도 하지 않고

보다 범용적인 메소드를 작성할 수 있는 것을 볼 수 있다.

이쯤이면 제네릭이 굉장히 매력적이라고(?) 생각할 수 있을것 같다.

이정도만 해도 충분히 훌륭해 보이지만 사실 문제가 남아있다.

물론 내가 생각한건 아니고 수많은 선배 개발자 분들은 이미 알고 있었고 또 해결까지 해두셨으니 걱정할건 없다.

#### 제네릭 주요 개념(바운디드 타입, 와일드 카드)

---

바로 위에서 언급한 남아있는 문제를 해결하기 위한 방법이 바운디드 타입과 와일드 카드이다.

리스트의 모든 요소를 출력하는 예제를 조금 수정해서 다음과 같이 수정해 보았다.

다음은 리스트에 담긴 요소를 문자열이라 가정하고, 공백을 기준으로 나누어 그 개수가 몇개인지 출력하는 메소드이다.

```java
package me.xxxelppa.study.week14;

import java.util.ArrayList;
import java.util.List;

public class Exam_008 {

    public static <T> List<Integer> printTokenSizeList(List<T> list) {
        List<Integer> result = new ArrayList<>();
        for(T t : list) {
            result.add(((String)t).split(" ").length);
        }
        return result;
    }

    public static void main(String[] args) {
        List<String> myList = new ArrayList<>();
        myList.add("가을 하늘 공활한데 높고 구름 없이");
        myList.add("밝은 달은 우리 가슴 일편단심일세");
        myList.add("무궁화 삼천리 화려 강산");
        myList.add("대한사람 대한으로 길이 보전하세");

        List<Integer> result = printTokenSizeList(myList);

        for(int elem : result) {
            System.out.println(elem);
        }
    }
}
```

<table>
<tbody>
<tr>
<td><span>6</span><br><span>5</span><br><span>4</span><br><span>4</span></td>
</tr>
</tbody>
</table>

별다른 문제 없이 의도한 대로 동작하는것 같지만 사실 **불편**한 부분이 몇가지 있다.

우선 11라인에서 **String 타입으로 캐스팅** 하는 코드가 있다는 것이다.

만약 이 메소드의 매개변수로 다음과 같은 List 가 전달되면 어떻게 될까?

```java
        List<Integer> myNewList = new ArrayList<>();
        myNewList.add(1);
        myNewList.add(2);
        myNewList.add(3);
```

컴파일 오류는 발생하지 않지만 **런타임 에러**가 발생한다.

<table>
<tbody>
<tr>
<td><span>Exception in thread "main" java.lang.ClassCastException: class java.lang.Integer cannot be cast to class java.lang.String (java.lang.Integer and java.lang.String are in module java.base of loader 'bootstrap')</span></td>
</tr>
</tbody>
</table>

제네릭을 사용해서 컴파일 타임에 타입 체크도 해주고, 코드 재사용성도 좋아졌다고 했는데 신통치 않다.

이 문제를 해결 하기 위한 개념이 바운디드 타입이다. 이 개념을 사용하면 타입 파라미터의 타입을 제한할 수 있다.

쉽게 얘기하면 타입 파라미터로 사용할 수 있는 타입을 특정 타입으로 제한할 수 있다는 것이다.

사용하는 방법은 extends 키워드를 사용해서 다음과 같이 작성해주면 된다.

다음은 위에 작성한 예제에서 타입 파라미터 T의 값을 String 클래스로 제한하도록 수정한 코드이다.

```java
package me.xxxelppa.study.week14;

import java.util.ArrayList;
import java.util.List;

public class Exam_008 {

    public static <T extends String> List<Integer> printTokenSizeList(List<T> list) {
        List<Integer> result = new ArrayList<>();
        for(T t : list) {
            result.add(t.split(" ").length);
        }
        return result;
    }

    public static void main(String[] args) {
        List<String> myList = new ArrayList<>();
        myList.add("가을 하늘 공활한데 높고 구름 없이");
        myList.add("밝은 달은 우리 가슴 일편단심일세");
        myList.add("무궁화 삼천리 화려 강산");
        myList.add("대한사람 대한으로 길이 보전하세");

        List<Integer> result = printTokenSizeList(myList);

        for(int elem : result) {
            System.out.println(elem);
        }
    }
}
```

수정한 부분은 8라인에서 타입 파라미터의 타입을 String으로 제한한 부분과

그렇기 때문에 11라인에서 T 타입의 변수 t 에 대해 String 타입이라는 것을 알고 있기 때문에

더 이상 타입 캐스팅이 의미가 없어 삭제한 부분이다.

extends 를 사용해서 타입 제한을 하는 경우 제한한 타입을 포함한 해당 타입의 하위 타입들을 사용할 수 있다.

다음 예시는 List에 담긴 모든 요소 값의 합을 반환하는 예제이다.

```java
package me.xxxelppa.study.week14;

import java.util.ArrayList;
import java.util.List;

public class Exam_010 {

    public static <T extends Number> double getSum(List<T> list) {
        double sum = 0.0;
        for(T t : list) sum += t.doubleValue();
        return sum;
    }

    public static void main(String[] args) {
        List<Number> myNumber = new ArrayList<>();
        myNumber.add(10);
        myNumber.add(2.5);

        System.out.println(getSum(myNumber));
    }
}
```

<table>
<tbody>
<tr>
<td><span>12.5</span></td>
</tr>
</tbody>
</table>

이렇게 **타입을 제한**하는 방법중에 와일드 카드를 사용하는 방법이 있다.

와일드 카드는 보통 '모든 것' 을 뜻하는데 * (별표, asterisk) 또는 ? (물음표) 를 사용하는데, 자바 제네릭 에서는 ? 를 사용한다.

**크게 세가지 형태**가 존재한다.

1. <?>

: 모든 종류의 클래스나 인터페이스 타입 사용 가능

2. <? extends 상위타입>

: 상위타입 타입 또는 이 타입의 하위타입만 사용 가능

3. <? super 하위타입>

: 하위타입 타입 또는 이 타입의 상위타입만 사용 하능

이해를 돕기 위해 다음과 같은 상속 구조를 갖는 클래스들을 정의 했다고 가정하자.

![0106-206-java-live-study-week-14-generic-img-02.png](/tech-blog/resources/images/migration/0106-206-java-live-study-week-14-generic/img-02.png)

```java
package me.xxxelppa.study.week14;

import java.util.Arrays;
import java.util.List;

public class Exam_011 {
    public static void main(String[] args) {
        // List 의 요소 타입으로 제한을 두지 않음
        List<?> wildcard_test = Arrays.asList(
                new Root(),
                new Sub_01(),
                new Sub_02(),
                new Sub_02_Sub(),
                new Exam_011()
        );

        // List 의 요소 타입으로 Sub_02 또는 Sub_02 하위 타입으로 제한
        List<? extends Sub_02> wildcard_extends_test = Arrays.asList(
                new Sub_02(),
                new Sub_02_Sub()
        );

        // List 의 요소 타입으로 Sub_01 또는 Sub_01 상위 타입으로 제한
        List<? super Sub_01> wildcard_super_test = Arrays.asList(
                new Root(),
                new Sub_01()
        );

        wildcard_test.forEach(System.out::println);
        System.out.println();
        wildcard_extends_test.forEach(System.out::println);
        System.out.println();
        wildcard_super_test.forEach(System.out::println);
    }
}

class Root {}
class Sub_01 extends Root {}
class Sub_02 extends Root {}
class Sub_02_Sub extends Sub_02 {}
```

<table>
<tbody>
<tr>
<td><span>me.xxxelppa.study.week14.Root@2f7a2457</span><br><span>me.xxxelppa.study.week14.Sub_01@566776ad</span><br><span>me.xxxelppa.study.week14.Sub_02@6108b2d7</span><br><span>me.xxxelppa.study.week14.Sub_02_Sub@1554909b</span><br><span>me.xxxelppa.study.week14.Sub_02_Sub@1554909b</span><br><br><span>me.xxxelppa.study.week14.Sub_02@22f71333</span><br><span>me.xxxelppa.study.week14.Sub_02_Sub@13969fbe</span><br><br><span>me.xxxelppa.study.week14.Root@3498ed</span><br><span>me.xxxelppa.study.week14.Sub_01@1a407d53</span></td>
</tr>
</tbody>
</table>

만약 타입 제한에 **위배 되는 경우** 다음과 같은 오류 메시지를 보여준다.

![0106-206-java-live-study-week-14-generic-img-03.jpg](/tech-blog/resources/images/migration/0106-206-java-live-study-week-14-generic/img-03.jpg)

#### Erasure

---

제네릭에 대해 알아보면서 다양한 코드를 접하고 작성 해봤겠지만 특이한? 점이 있다.

바로 타입 파라미터에 primitive 타입을 사용하지 않았다는 것이다.

**primitive 타입도 타입인데 타입으로 사용하지 못한다는게 이상하다고 생각**해야 한다.

결론부터 얘기하면 타입 소거 (type Erasure) 때문이다.

이해를 돕기 위해 List<Integer> 를 정의해보자.

```java
package me.xxxelppa.study.week14;

import java.util.ArrayList;
import java.util.List;

public class Exam_012 {
    List<Integer> list = new ArrayList<>();
}
```

이 코드의 바이트 코드를 보면 다음과 같다.

<table>
<tbody>
<tr>
<td><span>//&nbsp;class&nbsp;version&nbsp;55.0&nbsp;(55) </span><br><span>//&nbsp;access&nbsp;flags&nbsp;0x21 </span><br><span>public&nbsp;class&nbsp;me/xxxelppa/study/week14/Exam_012&nbsp;{ </span><br><br><span>&nbsp;&nbsp;//&nbsp;compiled&nbsp;from:&nbsp;Exam_012.java</span><br><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x0 </span><br><span>&nbsp;&nbsp;//&nbsp;signature&nbsp;Ljava/util/List&lt;Ljava/lang/Integer;&gt;; </span><br><span>&nbsp;&nbsp;//&nbsp;declaration:&nbsp;list&nbsp;extends&nbsp;java.util.List&lt;java.lang.Integer&gt;</span><br><span>&nbsp;&nbsp;Ljava/util/List;&nbsp;list</span><br><br><span>&nbsp;&nbsp;//&nbsp;access&nbsp;flags&nbsp;0x1 </span><br><span>&nbsp;&nbsp;public&nbsp;&lt;init&gt;()V </span><br><span>&nbsp;&nbsp;&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;6&nbsp;L0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;0 </span><br><br><span>&nbsp;&nbsp;&nbsp;&nbsp;INVOKESPECIAL&nbsp;java/lang/Object.&lt;init&gt;&nbsp;()V</span><br><span>&nbsp;&nbsp;&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LINENUMBER&nbsp;7&nbsp;L1 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;ALOAD&nbsp;0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;NEW&nbsp;java/util/ArrayList </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;DUP </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;<b>INVOKESPECIAL&nbsp;java/util/ArrayList.&lt;init&gt;&nbsp;()V</b></span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;PUTFIELD&nbsp;me/xxxelppa/study/week14/Exam_012.list&nbsp;:&nbsp;Ljava/util/List;</span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;RETURN </span><br><span>&nbsp;&nbsp;&nbsp;L2 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;LOCALVARIABLE&nbsp;this&nbsp;Lme/xxxelppa/study/week14/Exam_012;&nbsp;L0&nbsp;L2&nbsp;0 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXSTACK&nbsp;=&nbsp;3 </span><br><span>&nbsp;&nbsp;&nbsp;&nbsp;MAXLOCALS&nbsp;=&nbsp;1 </span><br><span>}</span></td>
</tr>
</tbody>
</table>

여기서 주목해야 할 부분은 ArrayList 가 생성될 때 **타입 정보가 없다**는 것이다.

재밌는? 것은 제네릭을 사용하지 않고 raw type 으로 ArrayList를 생성 해도 똑같은 바이트 코드를 볼 수 있다는 것이다.

그리고 내부에서 타입 파라미터를 사용할 경우 Object 타입으로 취급하여 처리 된다.

이것을 타입 소거 (type Erasure) 라고 한다.

타입 소거는 제네릭 타입이 특정 타입으로 제한 되어 있을 경우 해당 타입에 맞춰 컴파일시 타입 변경이 발생하고

타입 제한이 없을 경우 Object 타입으로 변경된다.

그럼 왜 이렇게 만들었을까? 그 이유는 **하위 호환성**을 지키기 위해서이다.

제네릭을 사용하더라도 하위 버전에서도 동일하게 동작해야하기 때문이다.

**primitive 타입을 사용하지 못하는 것도 바로 이 기본 타입은 Object 클래스를 상속받고 있지 않기 때문**이다.

그래서 기본 타입 자료형을 사용하기 위해서는 Wrapper 클래스를 사용해야 한다.

Wrapper 클래스를 사용할 경우 Boxing 과 Unboxing 을 명시적으로 사용할 수도 있지만 암묵적으로도 사용할 수 있으니 구현 자체에는 크게 신경쓸 부분은 없는것 같다.

마지막으로 제네릭과 관련하여 **한가지 더 생각해볼 문제**가 있다.

다음 코드는 제네릭 타입 파라미터를 사용해서 배열을 생성하는 예제이다.

```java
package me.xxxelppa.study.week14;

import java.util.Arrays;

public class Exam_013<T> {
    private T[] myArray;

    Exam_013(int size) {
//        myArray = new T[size];  // Type parameter 'T' cannot be instantiated directly
        myArray = (T[]) new Object[size];
    }

    public void addElem(int index, T t) {
        myArray[index] = t;
    }

    public void printElem() {
        System.out.println(Arrays.toString(myArray));
    }

    public static void main(String[] args) {
        Exam_013<String> e2 = new Exam_013<>(3);
        e2.addElem(0, "java");
        e2.addElem(1, "generic");

        e2.printElem();
    }
}
```

<table>
<tbody>
<tr>
<td><span>[java,&nbsp;generic,&nbsp;null]</span></td>
</tr>
</tbody>
</table>

제네릭 타입을 사용해서 배열을 생성하려면 9라인 처럼 쓰는게 편할텐데, 왜 사용하지 못하고 10 라인처럼 생성해야 하는걸까?

그 이유는 **new 연산자를 사용하기 때문**이다.

new 연산자는 동적 메모리 할당 영역인 heap 영역에 생성한 객체를 할당한다.

하지만 제네릭은 컴파일 타임에 동작하는 문법이다.

컴파일 타임에는 T의 타입이 어떤 타입인지 알 수 없기 때문에 Object 타입으로 생성한 다음 타입 캐스팅을 해주어야 사용할 수 있다.

연장선에서 **static 변수에도 제네릭 타입을 사용할 수 없다**.

```java
package me.xxxelppa.study.week14;

public class Exam_014<T> {
    private T myValue_1;
    // 'me.xxxelppa.study.week14.Exam_014.this' cannot be referenced from a static context
    // private static T myValue_2;
}
```

조금만 생각해보면 그 이유를 금방 알 수 있다.

static 키워드를 사용해서 멤버 필드를 선언하게 되면, 특정 객체에 종속되지 않고 클래스 이름으로 접근해서 사용할 수 있다.

제네릭 타입을 사용하면, 위 예제의 경우 Exam_014<String> 과 Exam_014<Integer> 등으로 객체를 생성해서

인스턴스마다 사용하는 타입을 다르게 사용할 수 있어야 하는데

static 으로 선언한 변수가 가능할 수가 없다. 그렇기 때문에 static 변수에는 제네릭 타입을 사용할 수 없다.

하지만 재미있게도 **static 메소드에는 제네릭을 사용할 수 있다**.

심지어 위에 작성한 예제에서도 static 메소드를 자유롭게 사용했다.

왜 static 변수에는 사용할 수 없었는데 메소드에는 가능했을까.

이것도 조금만 생각해보면 그 이유를 알 수 있다.

static 키워드를 사용하면 클래스 이름으로 접근하여 객체를 생성하지 않고 여러 인스턴스에서 공유해서 사용할 수 있다.

변수같은 경우 해당 값을 사용하려면 값의 타입을 알아야 하지만

메소드의 경우 해당 기능을 공유해서 사용하는 것이기 때문에 제네릭 타입 변수 T 를 매개변수로 사용한다고 하면

해당 값은 메소드 안에서 지역 변수로 사용되기 때문에 변수와 달리 메소드는 static 으로 선언 되어 있어도 제네릭을 사용할 수 있다.
