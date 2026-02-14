***런타임시에 어노테이션 정보 사용하기***

***클래스에 적용된 어노테이션 정보 얻기***

- 클래스.class 의 어노테이션 정보를 얻는 메소드를 이용한다.

***필드, 생성자, 메소드에 적용된 어노테이션 정보 얻기***

- 클래스.class의 다음 아래 표에 작성된 메소드를 이용해서

- java.lang.reflect 패키지의 Field, Constructor, Method 클래스의 배열을 얻어낸다.

<table>
<tbody>
<tr>
<td>리턴타입</td>
<td>메서드명 (매개변수)</td>
<td>설명</td>
</tr>
<tr>
<td>Field[]</td>
<td>getFields()</td>
<td>필드 정보를 Field 배열로 반환</td>
</tr>
<tr>
<td>Constructor[]</td>
<td>getConstructor()</td>
<td>생성자 정보를 Constructor 배열로 반환</td>
</tr>
<tr>
<td>Method[]</td>
<td>getDeclaredMethods()</td>
<td>메소드 정보를 Method 배열로 반환</td>
</tr>
</tbody>
</table>

- Field, Constructor, Method의 어노테이션 정보를 얻는 메소드를 이용

예를 들어 다음과 같은 코드가 있다.

```java
class TestAnno {
    @Annotation1
    int field1;

    @Annotation2
    String field2;
}
```

TestAnno 클래스에는 field1, field2 필드가 선언되어 있고 각 필드는 Annotation이 적용되어 있다.

이럴 경우 위 표에 작성한 Field[]를 사용하여 각 필드를 배열로 저장하고, 이 배열에 저장된 내용을 가지고 각 필드에 어떤 어노테이션이 적용되었는지 알아올 수 있다. *(생성자와 메서드도 동일하다.)*

***어노테이션 정보를 얻기 위한 메소드***

<table>
<tbody>
<tr>
<td>리턴타입</td>
<td>메소드명 (매개변수)</td>
</tr>
<tr>
<td>boolean</td>
<td>isAnnotationPresent(Class&lt;?&nbsp;extends&nbsp;Annotation&gt;&nbsp;annotationClass)</td>
</tr>
<tr>
<td>지정한&nbsp;어노테이션이&nbsp;적용되었는지&nbsp;여부,&nbsp;Class에서&nbsp;호출했을&nbsp;경우&nbsp;상위&nbsp;클래스에&nbsp;적용된&nbsp;경우에도&nbsp;true를&nbsp;리턴한다.</td>
</tr>
<tr>
<td>Annotation</td>
<td>getAnnotation(Class&lt;T&gt;&nbsp;annotationClass)</td>
</tr>
<tr>
<td>지정한&nbsp;어노테이션이&nbsp;적용되어&nbsp;있으면&nbsp;어노테이션을&nbsp;리턴하고&nbsp;그렇지&nbsp;않다면&nbsp;null을&nbsp;리턴한다.&nbsp;Class에서&nbsp;호출했을&nbsp;경우&nbsp;상위&nbsp;클래스에&nbsp;적용된&nbsp;경우에도&nbsp;어노테이션을&nbsp;리턴한다.</td>
</tr>
<tr>
<td>Annotation[]</td>
<td>getAnnotations()</td>
</tr>
<tr>
<td>적용된&nbsp;모든&nbsp;어노테이션을&nbsp;리턴한다.&nbsp;Class에서&nbsp;호출했을&nbsp;경우&nbsp;상위&nbsp;클래스(부모클래스)에&nbsp;적용된&nbsp;어노테이션도&nbsp;모두&nbsp;포함한다.&nbsp;적용된&nbsp;어노테이션이&nbsp;없을&nbsp;경우&nbsp;길이가&nbsp;0인&nbsp;배열을&nbsp;리턴한다.</td>
</tr>
<tr>
<td>Annotation[]</td>
<td>getDeclaredAnnotations()</td>
</tr>
<tr>
<td>직접&nbsp;적용된&nbsp;모든&nbsp;어노테이션을&nbsp;리턴한다.&nbsp;Class에서&nbsp;호출했을&nbsp;경우&nbsp;상위&nbsp;클래스에&nbsp;적용된&nbsp;어노테이션은&nbsp;포함되지&nbsp;않는다.</td>
</tr>
</tbody>
</table>

아래 예제를 통해 어떻게 사용하는지 직접적으로 알아보자.

순서는 다음과 같다.

1. 어노테이션 생성

2. 어노테이션이 적용된 소스 작성

3. 어노테이션이 적용된 소스를 실행할 메인 클래스 작성

## 1. 어노테이션 생성

```java
/*
 * 이 어노테이션은 Method에만 적용될 수 있음을 명시한다.
 * 또한 실행시에도 유지되어야 하므로 Runtime 유지 정책을 명시한다.
 */
@Target()
@Retention(RetentionPolicy.RUNTIME)
public @interface PrintAnnotation {
    /*
     * 이름 : value
     * 리턴타입 : String
     * 기본값 : "-"
     */
    String value() default "=";

    /*
     * 이름 : number
     * 리턴타입 : int
     * 기본값 : 15
     */
    int number() default 15;
}
```

[PrintAnnotation.java 파일]

## 2. 어노테이션이 적용된 소스 작성

```java
public class Service {
    @PrintAnnotation
    public void method1() {
        System.out.println("실행 내용1");
    }

    @PrintAnnotation("*")
    public void method2() {
        System.out.println("실행 내용2");
    }

    @PrintAnnotation(value="#", number=20)
    public void method3() {
        System.out.println("실행 내용3");
    }
}
```

[Service.java 파일]

## 3. 어노테이션이 적용된 소스를 실행할 메인 클래스 작성

```java
import java.lang.reflect.*;

public class PrintAnnotationExample {
    public static void main(String[] ar) {
        // Service 클래스에 어노테이션이 적용된 메서드가 있는지 조사한다.
        // 어노테이션의 element 값을 사용한다.
        // 해당 메서드를 호출한다.

        Method[] declaredMethods = Service.class.getDeclaredMethod();

        for(Method method : declaredMethods) {
            // 현재 method에 PeintAnnotation 어노테이션이 적용되어있는지 검사
            if(method.isAnnotationPresent(PrintAnnotation.class)) {
                // 적용되어 있을 경우 진입

                PrintAnnotation printAnnotation = method.getAnnotation(PrintAnnotation.class);

                // 메소드 이름 출력
                System.out.println("[" + method.getName() + "]");

                // 어노테이션에 만든 element에 대해 값을 가져올 때 아래와 같이 가져올 수 있다.
                // System.out.println(printAnnotation.value());
                // System.out.println(printAnnotation.number());

                for(int i = 0; i < printAnnotation.number(); ++i) {
                    System.out.print(printAnnotation.value());
                }
                System.out.println();

                // 현재 반복문에 들어와 있는 메서드 호출
                try {
                    // 메서드가 들어있는 클래스 객체를 매개변수로 넘겨준다.
                    // 아래 한 줄은 마치
                    // Service service = new Service();
                    // service.method1();
                    // 과 같은 역할을 한다고 생각하면 된다.
                    method.invoke(new Service());
                } catch (Exception e) {
                }
                System.out.pritnln();
            }
        }
    }
}
```

[PrintAnnotationExample.java 파일]

실행 결과

<table>
<tbody>
<tr>
<td>[method1] <br>--------------- <br>실행&nbsp;내용1 <br><br>[method2] <br>*************** <br>실행&nbsp;내용2 <br><br>[method3] <br>#################### <br>실행&nbsp;내용3</td>
</tr>
</tbody>
</table>

사실 어노테이션을 직접 정의해서 사용하는 일은 그렇게 흔한 일은 아니다. *(라고 알고 있다.)*

하지만 직접 작성해보고 사용해보는 과정을 통해서 나중에 api에서 제공해주는 어노테이션을 만났을 때 소스 분석에 더 도움이 될거라고 생각하고 도서를 참고하여 어노테이션에 대해 정리해보았다.

나는 도움이 되었는데 누군가도 도움이 되었으면 좋겠다.

*내용 참고 ] 이것이 자바다(신용권의 Java 프로그래밍 정복). 한빛미디어 출반사. 신용권 저.*
