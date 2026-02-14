## 자바의 애노테이션에 대해 학습하세요.

---

### 학습할 것

- 애노테이션 정의하는 방법
- @retention
- @target
- @documented
- 애노테이션 프로세서

---

애노테이션(annotation)을 사전에 찾아보면 '주석'이라고 나온다.

![0105-205-java-live-study-week-12-annotation-img-01.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-01.jpg)

위 이미지는 구글 검색 결과인데, 말뭉치 주석 이라는 말이 재밌어서 첨부했다.

자바에서 주석이라고 하면 크게 세 가지 형태를 떠올릴 수 있다.

1. 단일행 주석

2. 다중행 주석

3. javadoc 주석

이 주석들은 보통 작성된 코드를 보는 사람에게 정보를 제공해주기 위해 사용한다.

코드를 언제 누가 작성 했는지, 어떤 메소드가 있으며 어떻게 사용하는지 등 보통 자국어 문자를 사용해서 설명을 작성해 놓은 것이다.

적절한 위치에 작성된 과하지 않은 적절한 주석은 코드를 읽는데 도움을 준다.

아무튼,

사전에 주석이라고 등록되어있는 이 annotation은 앞서 얘기한 주석들과 성격이 좀 다르다.

사람을 위하기도 하지만 보통 컴파일러를 위해 작성하는 주석이다.

애노테이션은 보통 컴파일러에게 문법 오류를 체크할 수 있도록 힌트를 준다거나

또는 빌드시 코드를 자동 생성 한다거나 런타임 시점에 참고해서 특정 동작을 하도록 할 때 보통 사용할 수 있다.

대표적인 예로 문법 오류를 체크하는 것과 관련해서 @Override

코드 자동 생성에 대해 롬복(lombok) 라이브러리

런타임 시점에 특정 동작을 하는것에 대해 스프링의 aop 등이 있다.

애노테이션에서 뿐만 아니라 메타 데이터라는게 있다.

메타 데이터는 데이터를 위한 데이터 라고 하는데, 쉽게 설명하면 그 데이터가 어떤 데이터인지 설명해주는 데이터라고 할 수 있다.

그래서 메타 애노테이션 이라고 하면, 애노테이션을 설명하는 애노테이션 이라고 할 수 있으며

이런 메타 애노테이션은 클래스나 필드에 애노테이션을 작성하듯 애노테이션에 애노테이션을 작성할 수 있다.

#### 애노테이션 정의하는 방법

---

기본적으로 제공해주는 애노테이션이 아닌 커스텀한 애노테이션을 작성하고 싶다면, 다음과 같이 선언해서 사용할 수 있다.

```java
package me.xxxelppa.study.week12;

public @interface Exam_001 {
}
```

![0105-205-java-live-study-week-12-annotation-img-02.png](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-02.png)

애노테이션도 인터페이스나 enum과 같이 class 파일을 만든다.

참고로 기본적으로 제공하는 애노테이션의 경우 빌트인 (built-in) 애노테이션 이라고도 하는데, 다음과 같은 것들이 있다.

<table>
<tbody>
<tr>
<td><span>annotation</span></td>
<td><span>description</span></td>
</tr>
<tr>
<td><span>@Override</span></td>
<td><span>오버라이딩 된 메소드에 사용</span></td>
</tr>
<tr>
<td><span>@Deprecated</span></td>
<td><span>사용을 권장하지 않는 메소드에 사용 (IDE에 취소선으로 표시됨)</span></td>
</tr>
<tr>
<td><span>@SuppressWarnings</span></td>
<td><span>컴파일 경고를 무시하도록 할 때 사용</span></td>
</tr>
<tr>
<td><span>@SafeVarargs</span></td>
<td><span>가변인자 parameter 사용시 경고를 무시할 때 사용 (jdk 1.7 이상)</span></td>
</tr>
<tr>
<td><span>@FunctionalInterface</span></td>
<td><span>함수형 인터페이스임을 명시할 때 사용 (jdk 1.8 이상)</span></td>
</tr>
</tbody>
</table>

(함수형 인터페이스란 추상 메소드가 하나만 존재하는 인터페이스, SAM(Single Abstract Method)이라 하기도 한다.)

애노테이션은 엘리먼트 (element) 라는 것을 멤버로 가질 수 있다.

다음은 String 타입과 int 타입의 멤버를 가지는 Exam_002 애노테이션을 정의한 것이다.

```java
package me.xxxelppa.study.week12;

public @interface Exam_002 {
    String name();
    int age();
}
```

이렇게 선언한 애노테이션은 다음과 같이 적용해서 사용할 수 있다.

```java
package me.xxxelppa.study.week12;

@Exam_002(name = "nimkoes", age = 23)
public class Exam_003 {

}
```

Exam_002 애노테이션의 경우 기본값이 없기 때문에 Exam_003 클래스에 애노테이션을 적용했을 때 그 값을 반드시 지정해줘야 한다.

하지만 다음과 같이 애노테이션에 기본값이 설정 되어 있다면, 애노테이션을 적용할 때 굳이 어떤 값인지 작성하지 않아도 된다.

```java
package me.xxxelppa.study.week12;

@MyAnnotation_01
public class Exam_004 {
}

@interface MyAnnotation_01 {
    String name() default "nimkoes";
    int age() default 23;
}
```

다음으로 애노테이션은 value 라는 기본 element를 가질 수 있다.

value 라는 엘리먼트는 애노테이션을 적용할 때 굳이 element의 이름을 명시해주지 않아도 된다.

```java
package me.xxxelppa.study.week12;

@MyAnnotation_02("nimkoes")
public class Exam_005 {
}

@interface MyAnnotation_02 {
    String value();
}
```

예시로 String 타입을 사용했지만, 굳이 String 타입이 아니어도 괜찮다.

하지만 한 번에 두 개 이상의 엘리먼트 값을 할당해야 하는 경우 value 라고 하더라도 value를 명시해 주어야 한다.

```java
package me.xxxelppa.study.week12;

@MyAnnotation_03(value = "nimkoes", age = 23)
public class Exam_006 {
}

@interface MyAnnotation_03 {
    String value();
    int age();
}
```

여기까지 애노테이션을 작성하는 방법은 살펴보았는데 어쩌면 '그래서 뭐?' 라는 생각이 들지 모르겠다.

이미 정의 되어있는 애노테이션을 사용하거나, 프레임워크 또는 추가한 라이브러리에서 제공하는 애노테이션을 사용한다면 별로 신경쓰지 않아도 될지 모르겠다.

하지만 커스텀 애노테이션으르 만들거나 또는 애노테이션을 사용해서 커스텀한 무엇인가를 하고 싶다면 자바 리플렉션에 대해 아는것이 필수라고 생각한다.

리플렉션은 구체적인 클래스 타입을 몰라도 그 클래스의 메소드, 변수 등에 접근해서 사용할 수 있도록 해주는 것이라고 정의되어 있는데 잘 와닿지 않는다.

아주 단순하고 무식하게 설명하면 .class 라는 저장된 파일을 .java 소스에서 읽어서 그 클래스 파일에 메소드나 변수는 무엇이 있는지 등의 정보에 접근해서 사용할 수 있다고 할 수 있다.

이 리플렉션은 Class 라는 클래스로 사용할 수 있다.

다음은 리플렉션 기술을 사용해서 내가 정의한 애노테이션이 적용 되어 있는지 확인하는 에제 코드이다.

```java
package me.xxxelppa.study.week12;

import java.lang.annotation.Annotation;

public class Exam_007 {
    public static void main(String[] args) throws ClassNotFoundException {
        Class clazz = Class.forName("me.xxxelppa.study.week12.ReflectionTestClass");
        Annotation[] annotations = clazz.getDeclaredAnnotations();
        for (Annotation annotation : annotations) {
            System.out.println("적용된 annotation : " + annotation.toString());
        }
    }
}

@interface MyAnnotation_04 { }

@MyAnnotation_04
class ReflectionTestClass { }
```

(참고로 package 이름을 포함한 클래스 전체 이름을 FQCN (Fully Qualified Class Name) 이라 한다.)

위 예제를 실행해보면 놀랍게도 아무것도 출력되지 않는다.

분명히 ReflectionTestClass 에는 MyAnnotation_04 애노테이션이 작성되어있는데 아무것도 출력하지 않는다.

그 비밀은 retention 이라고 하는 유지 정책과 관련이 있다.

자연스럽게 다음 주제로 넘어가보자.

#### @retention

---

애노테이션에는 유지 정책이라는 것이 있다.

말이 거창해서 그렇지 그 애노테이션 정보를 언제까지 유지할 것인지 정하는 것이다.

이 유지 정책은 java.lang.annotation.RetentionPolicy 라는 enum 타입으로 정의되어 있다.

1. SOURCE

: 소스상에서만 애노테이션 정보를 유지한다. 바이트코드에는 정보가 남지 않는다.

2. CLASS

: 바이트코드까지 애노테이션 정보를 유지한다. 하지만 리플렉션으로 정보를 얻을 수 없다.

3. RUNTIME

: 리플렉션을 이용해서 런타임에도 정보를 얻을 수 있다.

위에 작성한 예제 실행 결과 아무것도 출력하지 않은 것은, Retention을 적용하지 않으면 기본적으로 CLASS 유지 정책이 적용되기 때문이다.

리플렉션을 사용해서 정보를 가져와보려 하는 예제이기 때문에 이 정책을 RUNTIME 으로 바꾼 다음 다시 실행 해보면 다음과 같다.

```java
package me.xxxelppa.study.week12;

import java.lang.annotation.Annotation;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

public class Exam_007 {
    public static void main(String[] args) throws ClassNotFoundException {
        Class clazz = Class.forName("me.xxxelppa.study.week12.ReflectionTestClass");
        Annotation[] annotations = clazz.getDeclaredAnnotations();
        for (Annotation annotation : annotations) {
            System.out.println("적용된 annotation : " + annotation.toString());
        }
    }
}

@Retention(RetentionPolicy.RUNTIME)
@interface MyAnnotation_04 { }

@MyAnnotation_04
class ReflectionTestClass { }
```

<table>
<tbody>
<tr>
<td><span>적용된 annotation : @me.xxxelppa.study.week12.MyAnnotation_04()</span></td>
</tr>
</tbody>
</table>

#### @target

---

애노테이션과 관련하여 java.lang.annotation.ElementType 이라는 enum 타입이 정의되어 있다.

이 타입은 애노테이션이 어느 곳에 적용할지 그 대상을 제한하는데 사용한다.

<table>
<tbody>
<tr>
<td><span>ElementType</span></td>
<td><span>적용 대상</span></td>
</tr>
<tr>
<td><span>TYPE</span></td>
<td><span>class, interface, enum</span></td>
</tr>
<tr>
<td><span>ANNOTATION_TYPE</span></td>
<td><span>annotation</span></td>
</tr>
<tr>
<td><span>FIELD</span></td>
<td><span>field</span></td>
</tr>
<tr>
<td><span>CONSTRUCTOR</span></td>
<td><span>constructor</span></td>
</tr>
<tr>
<td><span>METHOD</span></td>
<td><span>method</span></td>
</tr>
<tr>
<td><span>LOCAL_VARIABLE</span></td>
<td><span>local variable</span></td>
</tr>
<tr>
<td><span>PACKAGE</span></td>
<td><span>package</span></td>
</tr>
</tbody>
</table>

적용 대상을 제한할 때는 @Target 을 사용한다.

다음은 메소드에만 정의할 수 있는 애노테이션을 만들어본 예제이다.

```java
package me.xxxelppa.study.week12;

import java.lang.annotation.*;
import java.lang.reflect.Method;

public class Exam_008 {
    public static void main(String[] args) throws ClassNotFoundException {
        Class clazz = Class.forName("me.xxxelppa.study.week12.MyTest_008");

        Method[] declaredMethods = clazz.getDeclaredMethods();
        for (Method declaredMethod : declaredMethods) {
            Annotation[] declaredAnnotations = declaredMethod.getDeclaredAnnotations();
            for (Annotation declaredAnnotation : declaredAnnotations) {
                if (declaredAnnotation.annotationType().equals(MyAnnotation_05.class)) {
                    System.out.println(declaredMethod.toString() + " 메소드에 MyAnnotation_05 가 적용되어 있습니다.");
                }
            }
        }
    }
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface MyAnnotation_05 {}

class MyTest_008 {
    @MyAnnotation_05
    public void print_with_annotation() { }
    public void print_without_annotation() { }
}
```

<table>
<tbody>
<tr>
<td><span>public void me.xxxelppa.study.week12.MyTest_008.print_with_annotation() 메소드에 MyAnnotation_05 가 적용되어 있습니다.</span></td>
</tr>
</tbody>
</table>

복잡해 보이지만 사실 아주 간단한 예제이다.

만약 Target이 아닌 곳에 애노테이션을 적용하면 "not applicable to type" 이라는 컴파일 오류를 발생한다.

마지막으로 @Target 은 값으로 배열을 사용할 수 있다.

이것은 한 번에 여러 적용 대상을 선택할 수 있도록 하기 위함이다.

다음은 field 와 method 에 적용 가능한 애노테이션을 정의한 예시이다.

```java
package me.xxxelppa.study.week12;

import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

public class Exam_009 {

    @MyAnnotation_06
    private String name;

    @MyAnnotation_06
    public void method() {
    }
}

@Target({ElementType.FIELD, ElementType.METHOD})
@interface MyAnnotation_06 {
}
```

다음은 element 값을 사용하는 예제이다.

```java
package me.xxxelppa.study.week12;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Exam_010 {
    public static void main(String[] args) throws InvocationTargetException, IllegalAccessException {

        Method[] declaredMethods = MyTest_010.class.getDeclaredMethods();

        for (Method declaredMethod : declaredMethods) {
            // MyAnnotation_07 annotation 이 있을 경우
            if (declaredMethod.isAnnotationPresent(MyAnnotation_07.class)) {

                // MyAnnotation_07 객체
                MyAnnotation_07 myAnnotation_07 = declaredMethod.getAnnotation(MyAnnotation_07.class);

                for(int i = 0; i < myAnnotation_07.loopCnt(); ++i) {
                    declaredMethod.invoke(new MyTest_010());
                }
            }
        }
    }
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface MyAnnotation_07 {
    int loopCnt() default 1;
}

class MyTest_010 {
    @MyAnnotation_07(loopCnt = 10)
    public void printStarLine() {
        System.out.print("*");
    }
}
```

<table>
<tbody>
<tr>
<td><span>**********</span></td>
</tr>
</tbody>
</table>

이렇게 애노테이션을 활용하면 재미있는 기능들을 만들어낼 수 있고 또 활용하기 나름인것 같다.

#### @documen****te****d

---

이 애노테이션을 사용하면 javadoc 과 같은 도구에 의해 내가 작성한 내용이 문서와 될 수 있도록 한다.

javadoc 은 현재 프로젝트에 대한 api를 html 형식으로 생성해주는 도구하고 생각하면 된다.

javadoc 자체는 주제를 벗어나는 것 같아서 관련된 태그만 나열하고, annotation에 @document를 붙였을 때와 붙이지 않았을 때의 차이만 확인해보려 한다.

- javadoc 태그 종류

: @author

: @deprecated

: @exception

: @param

: @return

: @see

: @serial

: @serialData

: @serialField

: @since

: @throws

: @version

등이 있다.

intelliJ 에서 javadoc 을 만드는 방법은 간단하다.

![0105-205-java-live-study-week-12-annotation-img-03.png](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-03.png)

Tools 메뉴 하위 Generate JavaDoc 을 선택하면 다음과 같은 팝업을 볼 수 있다.

![0105-205-java-live-study-week-12-annotation-img-04.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-04.jpg)

Locale : ko_KR

Other command line arguments : -encoding UTF-8 -charset UTF-8 -docencoding UTF-8

한글이 있을 경우 위 값을 넣어 주면 깨지지 않는다.

다음 코드를 포함해서 javadoc 을 만든 결과는 다음과 같다.

```java
package me.xxxelppa.study.week12;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * java online study week 12 : annotation test class
 *
 * @author nimkoes
 */
public class Exam_011 {

    @MyAnnotation_08(name = "nimkoes", age = 23)
    public void print_documented(String printValue) {
        System.out.println(printValue);
    }

    @MyAnnotation_09(nickname = "xxxelppa", age = 24)
    public void print(String printValue) {
        System.out.println(printValue);
    }
}

@Documented
@Retention(RetentionPolicy.RUNTIME)
@interface MyAnnotation_08 {
    String name();
    int age();
}

@Retention(RetentionPolicy.RUNTIME)
@interface  MyAnnotation_09 {
    String nickname();
    int age();
}
```

![0105-205-java-live-study-week-12-annotation-img-05.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-05.jpg)

![0105-205-java-live-study-week-12-annotation-img-06.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-06.jpg)

![0105-205-java-live-study-week-12-annotation-img-07.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-07.jpg)

javadoc 을 만든 다음 확인해보면 @Document 를 추가한 부분에 대해 내가 작성한 내용이 추가 된 것을 볼 수 있었다.

그 외에도 @Inherited, @Repeatable 등의 커스텀 애노테이션을 만들 때 사용 가능한 메타 애노테이션들도 있다.

#### 애노테이션 프로세서

---

자바의 애노테이션 프로세서는 컴파일 타임에 애노테이션 정보를 참고하여 코드를 분석하고 생성하는 등의 작업을 할 수 있는 기능이다.

애노테이션 프로세서의 대표적인 예로 롬복(lombok) 라이브러리가 있다.

롬복 라이브러리는 애노테이션 기반으로 컴파일 타임에 바이트 코드를 생성해주는 라이브러리 이다.

프로젝트에 롬복 라이브러리를 추가 해보자.

![0105-205-java-live-study-week-12-annotation-img-08.png](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-08.png)

인텔리제이 메뉴의 File > Project Structure 에 들어간다.

![0105-205-java-live-study-week-12-annotation-img-09.png](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-09.png)

왼쪽 Libraries 메뉴에 들어가서 + 버튼을 누른 다음 From Maven 을 클릭 한다.

![0105-205-java-live-study-week-12-annotation-img-10.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-10.jpg)

org.projectlombok:lombok:1.18.12 버전을 많이 사용하는것 같아서 이 버전을 선택 했다.

라이브러리를 다 받고 나면 다음과 같이 코드를 작성 해보자.

```java
package me.xxxelppa.study.week12;

public class Exam_012 {
    private String name;
    private int age;
}
```

빌드를 한 다음 바이트코드를 열어보면 다음과 같다.

<table>
<tbody>
<tr>
<td><span>// class version 55.0 (55) </span><br><span>// access flags 0x21 </span><br><span>public class me/xxxelppa/study/week12/Exam_012 { </span><br><br><span>&nbsp; // compiled from: Exam_012.java</span><br><br><span>&nbsp; // access flags 0x2</span><br><span>&nbsp; private Ljava/lang/String; name</span><br><br><span>&nbsp; // access flags 0x2 </span><br><span>&nbsp; private I age </span><br><br><span>&nbsp; // access flags 0x1 </span><br><span>&nbsp; public ()V </span><br><span>&nbsp; &nbsp; L0 </span><br><span>&nbsp; &nbsp; &nbsp; LINENUMBER 3 L0 </span><br><span>&nbsp; &nbsp; &nbsp; ALOAD 0 </span><br><span>&nbsp; &nbsp; &nbsp; INVOKESPECIAL java/lang/Object. ()V </span><br><span>&nbsp; &nbsp; &nbsp; RETURN </span><br><span>&nbsp; &nbsp; L1 </span><br><span>&nbsp; &nbsp; &nbsp; LOCALVARIABLE this Lme/xxxelppa/study/week12/Exam_012; L0 L1 0 </span><br><span>&nbsp; &nbsp; &nbsp; MAXSTACK = 1 </span><br><span>&nbsp; &nbsp; &nbsp; MAXLOCALS = 1 </span><br><span>}</span></td>
</tr>
</tbody>
</table>

이번엔 롬복 라이브러리가 제공하는 애노테이션 중 @Getter 와 @Setter 를 사용해보자.

```java
package me.xxxelppa.study.week12;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class Exam_012 {
    private String name;
    private int age;
}
```

이전 코드와 비교했을 때 추가한 것은 @Getter 와 @Setter 일 뿐인데
이 내용을 참고해서 컴파일 타임에 바이트코드를 생성한 것을 볼 수 있다.

 만약 똑같이 했는데 바이트코드가 생기지 않았다면 인텔리제이에서 다음 설정을 활성화 해야 한다.

![0105-205-java-live-study-week-12-annotation-img-11.png](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-11.png)

File > Settings 를 클릭한다.

![0105-205-java-live-study-week-12-annotation-img-12.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-12.jpg)

annotation processor 를 검색해서 나온 메뉴에 들어가서 오른쪽에 Enable annotation processing 이 활성화 되어 있는지 확인해보자.

일단 annotation processor 가 무엇인지 느낌은 왔는데, 어떻게 동작했는지는 아직도 의문이다.

컴파일 타임에 annotation processor 가 있는것을 컴파일러는 어떻게 알고 어노테이션에 대해 전처리를 할 수 있을까?

lombok 라이브러리를 조금 더 자세히 들여다보자.

![0105-205-java-live-study-week-12-annotation-img-13.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-13.jpg)

라이브러리를 열고 들어가보면 META-INF 하위에 services 라는 폴더가 있는데

그 안에 javax.annotation.processing.Processor 라는 파일이 있다.

이 파일을 열면 다음과 같은 내용이 들어있다.

<table>
<tbody>
<tr>
<td><span>lombok.launch.AnnotationProcessorHider$AnnotationProcessor</span><br><span>lombok.launch.AnnotationProcessorHider$AnnotationProcessor</span></td>
</tr>
</tbody>
</table>

이번엔 lombok.launch.AnnotationProcessorHider 클래스에 중첩클래스인 AnnotationProcessor 를 열어보자.

![0105-205-java-live-study-week-12-annotation-img-14.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-14.jpg)

![0105-205-java-live-study-week-12-annotation-img-15.jpg](/tech-blog/resources/images/migration/0105-205-java-live-study-week-12-annotation/img-15.jpg)

파일에 작성되어있던 AnnotationProcessorHider 클래스에 중첩 된 두 개의 클래스를 볼 수 있는데,
공통점이 눈에 띈다.
바로 AbstractProcessor 클래스를 상속 받고 있다.

결론부터 얘기하기엔 늦었지만, 어쨌든 결론은, Annotation Processor 를 등록하려면

1. META-INF 디렉토리 하위에 services 디렉토리를 만들고
2. javax.annotation.processing.Processor 라는 파일을 만들고
3. 그 안에 AbstractProcessor 클래스를 상속받아 구현하고 있는 클래스의 FQCN 을 작성 하면 된다.

그러면 이제 컴파일러는 이 정보를 바탕으로 annotation processor 기능을 수행할 수 있게 된다.

더 깊게 찾아본다면, 예상하건데, annotation 을 스캔해서 롬복에서 제공하는 애노테이션이 있으면 (예를 들어 Getter, Setter) 바이트 코드를 컴파일 타임에 자동 생성해주는 부분을 찾을 수 있을것 같다.

마지막으로 이 annotation processor 의 장점이라고 하면, 이러한 동작이 '컴파일 타임'에 이루어지기 때문에
런타임에 비용이 추가되지 않는다는 것이다.

하지만 단점은 (내가 알기로) 공식 지원하는 기능이 아니기 때문에, 어떻게 보면 편법?이나 해킹?이라고 할 수 있다는 것이다.
또 다른 단점은 '알고 쓰면 약인데, 모르고 쓰면 의도하지 않은 동작을 할 수도' 있다는 것이다.

마무리가 이상하지만, 그러니까 잘 알고 쓰자.
