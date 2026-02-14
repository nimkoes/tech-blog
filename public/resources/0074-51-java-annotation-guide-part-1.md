프로그램을 작성하다보면 종종 @이라는 문자를 본다.

어노테이션이라고 부르는건 알겠는데 정확한 사용 방법과 어떻게 수정하는지 등에 대해서 명확하게 알지 못했다.

***어노테이션의 용도***

1. 컴파일러에게 코드 작성 문법 에러를 체크하도록 정보를 제공한다.

우리가 코드를 작성하고 나서 이 코드가 제대로 잘 작성이 되었는지, 잘못 작성이 되었는지 컴파일러에게 검사할 수 있도록 정보를 제공해주는 역할이다.

대표적인 예로 @Override 이다. 이 어노테이션은 컴파일러에게 내가 지금 작성하고 있는 코드가 부모 클래스에 있는 메서드인지 검사해보라는 의미이다.

2. 소프트웨어 개발 툴이 빌드나 배치시 코드를 자동으로 생성할 수 있도록 정보를 제공한다.

나중에 자바 프로그램을 개발하고난 이후 jar나 war형식으로 압축을 해야할 경우가 생긴다. 이런 경우 어떤 파일 형식으로 압축을 하라고 지시를 할 경우에도 사용하게 된다.

3. 실행시(런타임시) 특정 기능을 실행하도록 정보를 제공한다.

예를들어 어떤 객체를 만들었는데 이 객체는 다른 객체와는 달리 특별한 역할을 수행해야 하는 객체를 만들어야 한다고 할 때, 이 객체에게 어노테이션을 기술해주면 이 어노테이션에 있는 데이터를 보고 특별한 역할을 수행할 수 있게 된다. 대표적으로 서블릿을 만들거나 컨트롤러를 만들 경우에 사용된다.

***어노테이션 파일 생성 방법***

아래와 같이 소스를 작성해서 만들 수 있게 되는데, 이 때 AnnotationName이라는 이름과 동일한 이름의 파일을 생성해야 한다.

```java
public @interface AnnatationName {

}
```

[파일명 : AnnotationName.java]

***어노테이션의 엘리먼트(element) 멤버***

- 어노테이션은 하나 이상의 엘리먼트 멤버를 가질 수 있다.

- 엘리먼트는 외부의 값을 입력받을 수 있는 역할을 한다.

- 여기서 외부의 값이란 개발자가 입력한 값을 의미한다.

- 엘리먼트 선언

```java
public @interface AnnatationName {
    타입 elementName() [default 값];        // element 선언
}
```

element의 타입으로는 primitive type과 reference type 둘다 올 수 있다.

*(primitive type : 기본 타입으로 int, byte 등을 의미한다. reference type은 참조타입으로 String, Integer 등을 의미한다.)*

[default 값] 부분은 선택사항으로, 값을 주지 않았을 경우에 가지는 기본값을 설정하지 않을 거라면 생략 가능하다.

하지만 기본값을 주지 않았을 경우에는 어노테이션이 적용되는 부분에서 반드시 element값을 전달 해주어야 한다.

다음 예시를 보자.

```java
public @interface AnnatationName {
    String elementName1();
    int elementName2() default 5;
}
```

AnnatationName이라는 어노테이션은 elementName1, elementName2 라는 두 개의 element를 가진다.

그리고 elementName1은 기본값이 없어서 선언시에 반드시 전달해주어야 하고

elemebtName2는 기본값을 5로 가지기 때문에 선언시 값을 전달해주지 않으면 5라는 기본값을 가지게 된다.

아래는 그 적용 예시이다.

```java
@AnnotationName(elementName1="값", elementName2=10)
또는
@AnnotationName(elemebtName1="값")
```

***기본 엘리먼트 value***

어노테이션을 선언할 때 value라는 element를 선언할 수 있는데, 이 element는 조금 다르게 동작한다.

```java
public @interface AnnotationName {
    String value();                    // 기본 element
    int elementName() default 5;
}
```

이 value라는 elemnt의 특징은, 값을 전달할 때 element의 이름을 생략할 수 있다는 점이다.

즉, 다음과 같이 선언해서 사용할 수 있다.

```java
@AnnotationName("값")
```

하지만 어노테이션에 두 개 이상의 속성에 값을 넣을 때는 다음과 같이 value라는 이름을 꼭 명시 해주어야 한다.

```java
@AnnotationName(value="값", elementName=10)
```

***어노테이션 적용 대상***

- 코드 상에서 어노테이션을 적용할 수 있는 대상으로 어노테이션을 만들 때 지정할 수 있다.

- java.lang.annotation.ElementType 열거 상수로 정의되어 있음

<table>
<tbody>
<tr>
<td>ElementType<br>열거 상수</td>
<td>적용 대상</td>
</tr>
<tr>
<td>Type</td>
<td>클래스, 인터페이스, 열거 타입</td>
</tr>
<tr>
<td>ANNOTATION_TYPE</td>
<td>어노테이션</td>
</tr>
<tr>
<td>FIELD</td>
<td>필드</td>
</tr>
<tr>
<td>CONSTRUCTOR</td>
<td>생성자</td>
</tr>
<tr>
<td>METHOD</td>
<td>메서드</td>
</tr>
<tr>
<td>LOCAL_VARIABLE</td>
<td>로컬 변수</td>
</tr>
<tr>
<td>PACKAGE</td>
<td>패키지</td>
</tr>
</tbody>
</table>

***어노테이션 적용 대상 지정 방법***

- @Target 어노테이션으로 적용 대상 지정

- @Target의 기본 엘리먼크인 value의 타입은 ElementType 배열

```java
@Target()
public @interface AnnotationName {
}
```

위 소스의 의미는, AnnotationName이라는 어노테이션은 ***TYPE, FIELD, METHOD***에 적용할 수 있음을 뜻한다.

위에서 작성한 소스가 적용되는 예시는 다음과 같다.

```java
@AnnotationName
public class ClassName {
    @AnnotationName
    private String fieldName;

    // @AnnotationName
    // 생성자에는 적용할 수 있다고 명시하지 않았기 때문에 생성자에는 적용할 수 없다.
    public className() { }

    @AnnotationName
    public void methodName() { }
}
```

***어노테이션 유지 정책***

- 어노테이션 적용 코드가 유지되는 시점을 지정하는 것이다. 즉, 해당 어노테이션에 대한 정보를 어느 순간까지 얻어올 수 있는지를 지정하는 것이다.

- java.lang.annotation.RetentionPolicy 열거 상수로 정의되어 있다.

<table>
<tbody>
<tr>
<td>RetentionPolicy<br>열거 상수</td>
<td>설명</td>
</tr>
<tr>
<td>SOURCE</td>
<td>소스상에서만&nbsp;어노테이션&nbsp;정보를&nbsp;유지한다.&nbsp;소스&nbsp;코드를&nbsp;분석할&nbsp;떄만&nbsp;의미가&nbsp;있으며,&nbsp;바이트&nbsp;코드&nbsp;파일에는&nbsp;정보가&nbsp;남지&nbsp;않는다.&nbsp;<b>바이트&nbsp;코드에서는&nbsp;유지되지&nbsp;않는&nbsp;정책.</b></td>
</tr>
<tr>
<td>CLASS</td>
<td>바이트&nbsp;코드&nbsp;파일까지&nbsp;어노테이션&nbsp;정보를&nbsp;유지한다.&nbsp;하지만&nbsp;리플렉션을&nbsp;이용해서&nbsp;어노테이션&nbsp;정보를&nbsp;얻을&nbsp;수는&nbsp;없다.&nbsp;<b>바이트&nbsp;코드를&nbsp;만들&nbsp;때&nbsp;까지는&nbsp;유지를&nbsp;하는&nbsp;정책.</b></td>
</tr>
<tr>
<td>RUNTIME</td>
<td>바이트&nbsp;코드&nbsp;파일까지&nbsp;어노테이션&nbsp;정보를&nbsp;유지하면서&nbsp;리플렉션을&nbsp;이용해서&nbsp;런타임에&nbsp;어노테이션&nbsp;정보를&nbsp;얻을&nbsp;수&nbsp;있다.&nbsp;<b>실제&nbsp;런타임&nbsp;시기에도&nbsp;유지하는&nbsp;정책으로&nbsp;보통&nbsp;이&nbsp;정책을&nbsp;많이&nbsp;사용한다.</b></td>
</tr>
</tbody>
</table>

*{*

*리플렉션 (Reflection) : 런타임 클래스의 메타 정보를 얻는 기능*

*- 클래스가 가지고 있는 필드, 생성자, 메소드, 어노테이션의 정보를 얻을 수 있다.*

*- 런타임시에 어노테이션 정보를 얻으려면 유지 정책을 runtime으로 설정해야 한다.*

*}*

***유지 정책 지정 방법***

- @Retention 어노테이션으로 유지 정책을 지정한다.

- @Retention의 기본 엘리먼트인 value의 타입은 RetentionPolicy

```java
@Target()
@Retention(RetentionPolicy.RUNTIME)
public @interface AnnotationName {
}
```

*내용 참고 ] 이것이 자바다(신용권의 Java 프로그래밍 정복). 한빛미디어 출반사. 신용권 저.*
