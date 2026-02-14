## 자바의 예외 처리에 대해 학습하세요.

---

### 학습할 것

- 자바에서 예외 처리 방법 (try, catch, throw, throws, finally)
- 자바가 제공하는 예외 계층 구조
- Exception과 Error의 차이는?
- RuntimeException과 RE가 아닌 것의 차이는?
- 커스텀한 예외 만드는 방법

---

#### 자바에서 예외 처리 방법 (try, catch, throw, throws, finally), 커스텀한 예외 만드는 방법

---

자바에서 예외를 처리하는 방법은 다양하다.

try ~ catch 를 사용해서 예외를 직접 처리하는 방법.

try ~ catch ~ finally 를 사용해서 예외를 직접 처리하고, 예외가 발생해도 꼭 해야하는 후속처리까지 하는 방법.

throw를 사용해서 강제로 예외를 발생하는 방법.

에라 모르겠다. throws를 사용해서 나를 호출한 녀석에게 예외를 던지는 방법 등이 있다.

```java
package me.xxxelppa.study.week09;

public class Exam_001 {
    public static void main(String[] args) {

        try {

            // 예외가 발생할 수 있는 코드를 try 블록 안에 작성

        } catch(Exception e) {

            // 발생한 예외를 처리할 수 있는 코드를 catch 블록 안에 작성
            // 예외가 발생하지 않으면 이 블록의 내용을 실행하지 않는다.

        }
    }
}
```

사실 처음 예외를 보면 finally 가 그다지 쓸모 없어 보이기도 한다.

finally 를 사용하는 다양한 경우가 있겠지만, 데이터베이스를 사용할 때 많이 사용한다.

하지만 데이터베이스에 대해 설명하려면 너무 복잡해지기 때문에 상황을 예로 들어보자.

냉장고 문을 열었으면 문을 다시 닫고, 음식을 먹었으면 설거지를 해놓는게 보통이다.

```java
package me.xxxelppa.study.week09;

public class Exam_002 {
    public static void main(String[] args) {

        boolean isSnack = true;
        boolean isMilk = true;
        boolean isFood = true;

        try {

            // 냉장고 문을 연다.

            // 간식을 찾는다.

            // 간식이 없으면 예외 발생
            if(!isSnack) throw new SnackNotFoundException();

            // 우유가 없으면 예외 발생
            if(!isMilk) throw new MilkNotFoundException();

            // 먹을게 없으면 예외 발생
            if(!isFood) throw new FoodNotFoundException();

            // 간식을 꺼낸다.

            // 냉장고 문을 닫는다.

        } catch (SnackNotFoundException snfe) {

            // 간식이 없으면 실행하는 블록

            // 냉장고 문을 닫는다.

        } catch (MilkNotFoundException mnfe) {

            // 우유가 없으면 실행하는 블록

            // 냉장고 문을 닫는다.

        } catch (FoodNotFoundException mnfe) {

            // 먹을게 없으면 실행하는 블록

            // 냉장고 문을 닫는다.

        }
    }
}

class SnackNotFoundException extends Exception { }
class MilkNotFoundException extends Exception { }
class FoodNotFoundException extends Exception { }
```

try 블록 내에서 코드를 실행하는 도중 예외가 발생하면, try 블록 마지막에 실행하는 냉장고 문을 닫는 일을 할 수 없다.

먹고 싶은게 없다고 냉장고 문을 계속 열어두면, 등짝맞기 딱 좋다.

그래서 문을 닫아야 하는데, 모든 예외 상황에 문을 닫는다고 하려니 같은 내용이 반복 된다.

만약 냉장고 문을 그냥 닫지 않고, 이것좀 와서 보라고 한 다음에 냉장고 문을 닫고 싶으면 네곳을 고쳐야 한다.

슬픈일이 아닐 수 없다.

또 어쩌면 실수로 특정 예외 상황에서 냉장고 문을 닫는것을 깜빡하고 빠뜨릴 수도 있다.

등짝이 남아나지 않을거다.

예외가 발생해도 하지 않아도 무조건 냉장고 문을 닫아야 등짝이 터지지 않을 수 있기 때문에 finally 블록을 사용한다.

```java
package me.xxxelppa.study.week09;

public class Exam_003 {
    public static void main(String[] args) {

        boolean isSnack = true;
        boolean isMilk = true;
        boolean isFood = true;

        try {

            // 냉장고 문을 연다.

            // 간식을 찾는다.

            // 간식이 없으면 예외 발생
            if(!isSnack) throw new SnackNotFoundException();

            // 우유가 없으면 예외 발생
            if(!isMilk) throw new MilkNotFoundException();

            // 먹을게 없으면 예외 발생
            if(!isFood) throw new FoodNotFoundException();

            // 간식을 꺼낸다.

        } catch (SnackNotFoundException snfe) {

            // 간식이 없으면 실행하는 블록

        } catch (MilkNotFoundException mnfe) {

            // 우유가 없으면 실행하는 블록

        } catch (FoodNotFoundException mnfe) {

            // 먹을게 없으면 실행하는 블록

        } finally {

            // 냉장고 문을 닫는다.
        }
    }
}

class SnackNotFoundException extends Exception { }
class MilkNotFoundException extends Exception { }
class FoodNotFoundException extends Exception { }
```

그리고 자연스럽게 넘어갔는데, 특정 예외를 강제로 발생하고 싶을 때 throw 를 사용할 수 있다.

이 throw 를 사용할 경우 크게 두 가지 방법으로 처리할 수 있다.

하나는 위에서 예시로 만든 것처럼 catch 블록을 사용해서 직접 후처리를 하는 것이고

다른 하나는 메소드에 throws 키워드를 사용해서 나를 호출한 녀석에게 예외를 처리 해달라고 던져버리는 것이다.

이 두번째 방법을 예외 전파라고도 한다.

```java
package me.xxxelppa.study.week09;

public class Exam_004 {
    public static void main(String[] args) {
        try {
            myMethod_1();
        } catch (Exception e) {

            // 예외가 전파되어온 스택을 출력한다.
            e.printStackTrace();
        }
    }

    public static void myMethod_1() throws Exception {
        myMethod_2();
    }

    public static void myMethod_2() throws Exception {
        myMethod_3();
    }

    public static void myMethod_3() throws Exception {
        int a = 10;
        int b = 0;

        // 0으로 나누면 예외가 발생한다.
        a = a / b;
    }
}
```

<table>
<tbody>
<tr>
<td><span>java.lang.ArithmeticException: / by zero</span><br><br><span>at me.xxxelppa.study.week09.Exam_004.myMethod_3(Exam_004.java:25)</span><br><span>at me.xxxelppa.study.week09.Exam_004.myMethod_2(Exam_004.java:17)</span><br><span>at me.xxxelppa.study.week09.Exam_004.myMethod_1(Exam_004.java:13)</span><br><span>at me.xxxelppa.study.week09.Exam_004.main(Exam_004.java:6)</span></td>
</tr>
</tbody>
</table>

실행 결과를 보면 최초로 예외가 무엇 때문에 어디서 발생 했는지 call stack 을 출력해서 보여주고 있다.

개인적인 생각이지만 일반적으로 사람들은 똑같은 일을 반복하는걸 별로 좋아하지 않는다.

특히 개발자들은 더 그런것 같다.

예외를 처리할 때 try ~ with ~ resource 라는게 있다.

자바 7부터 등장했는데, 다음과 같이 생겼다.

```java
package me.xxxelppa.study.week09;

public class Exam_005 {
    public static void main(String[] args) {

        boolean isSnack = true;
        boolean isMilk = true;
        boolean isFood = true;

        try (Refrigerator refrigerator = new Refrigerator()){

            // 냉장고 문을 연다.

            // 간식을 찾는다.

            // 간식이 없으면 예외 발생
            if(!isSnack) throw new SnackNotFoundException();

            // 우유가 없으면 예외 발생
            if(!isMilk) throw new MilkNotFoundException();

            // 먹을게 없으면 예외 발생
            if(!isFood) throw new FoodNotFoundException();

            // 간식을 꺼낸다.

        } catch (Exception e) {
            if(e instanceof SnackNotFoundException) {
                // 간식이 없으면 실행하는 블록
            } else if(e instanceof MilkNotFoundException) {
                // 우유가 없으면 실행하는 블록
            } else if(e instanceof FoodNotFoundException) {
                // 먹을게 없으면 실행하는 블록
            }

            e.printStackTrace();
        }
    }
}

class Refrigerator implements AutoCloseable {
    @Override
    public void close() throws Exception {
        // 냉장고 문을 닫는다.
    }
}

class SnackNotFoundException extends Exception { }
class MilkNotFoundException extends Exception { }
class FoodNotFoundException extends Exception { }
```

10라인에 try 블록에 소괄호 블록이 생겼다.

이 소괄호 블록 안에서 생성한 객체는 finally 에서 후처리를 해주지 않아도 후처리를 해준다.

대신 조건이 있다.

41라인에 해당 클래스가 정의되어 있는 것을 보면, AutoCloseable 라는 인터페이스를 구현하고 있는것을 볼 수 있다.

이 인터페이스를 정의하고 있는 클래스라면 위와같이 조금은 더 간결하게 코드를 작성할 수 있다.

마지막으로 커스텀한 예외는 위에서 예제를 코드를 만들어 보면서 작성 했다.

바로 다음 절에서 Checked 와 Unchecked 예외에 대해 설명 하지만,

Checked 예외 상황을 만들 경우 Exception을 포함한 자식 타입 클래스를, Unchecked 예외 상황을 만들 경우 RuntimeException을 포함한 자식 타입 클래스를 상속 받으면 된다.

```java
package me.xxxelppa.study.week09;

public class Exam_006 {
    public static void main(String[] args) throws MyException {

        throw new MyException("내가 만든 커스텀한 예외");

    }
}

class MyException extends Exception {

    // super 생성자를 사용하면
    // Exception 클래스의 부모인 Throwable 클래스의 생성자를 호출한다.

    public MyException() {
        super();
    }

    public MyException(String message) {
        super(message);
    }
}
```

<table>
<tbody>
<tr>
<td><span>Exception in thread "main" me.xxxelppa.study.week09.MyException: 내가 만든 커스텀한 예외</span><br><br><span>at me.xxxelppa.study.week09.Exam_006.main(Exam_006.java:6)</span></td>
</tr>
</tbody>
</table>

#### 자바가 제공하는 예외 계층 구조, Exception과 Error의 차이는?, RuntimeException과 RE가 아닌 것의 차이는?

---

자바 api 문서를 참고해보면 모든 클래스의 최상위 부모인 Object 를 상속 받은 Throwable 을 상속 받은 Exception 과 Error 가 있다.

Error는 메모리가 부족하다던가 등의 JVM에 문제가 생겼을 경우에 발생하고,

Exception은 프로그램 코드 레벨에서 문제가 생겼을 경우에 발생하는 편이다.

Exception 은 또 크게 두가지로 구분해서 생각할 수 있는데, Checked 와 Unchecked 이다.

검색해보니 잘 정리된 좋은 그림이 있어서 가져와보았다.

![0102-202-java-live-study-week-9-exception-img-01.png](/tech-blog/resources/images/migration/0102-202-java-live-study-week-9-exception/img-01.png)

 출처 : [https://madplay.github.io/post/java-checked-unchecked-exceptions](https://madplay.github.io/post/java-checked-unchecked-exceptions)

Unchecked 예외는 RuntimeException (런타임 예외) 라고도 하는데, 보통 프로그램 실행중에 발생하며, 발생할 것을 미리 알 수 없다는 특징이 있다.

그리고 이 예외는 Exception 을 상속 받은 RuntimeException 을 상속 받은 클래스이다.

반면 Checked 예외는 RuntimeException이 아닌 예외를 말한다.

이러한 예외는 프로그램 실행중에 갑자기 발생하는 것이 아니기 때문에 미리 대처해둘 수 있다는 특징이 있다.

그렇기 때문에 RE가 아닌 (Unchecked Exception이 아닌) 예외에 대해서는 코드에서 명시적으로 예외 처리를 해주어야 한다.
