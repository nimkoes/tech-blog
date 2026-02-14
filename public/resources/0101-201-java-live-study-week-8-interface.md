## 자바의 인터페이스에 대해 학습하세요.

---

### 학습할 것

- 인터페이스를 정의하는 방법
- 인터페이스를 구현하는 방법
- 인터페이스 레퍼런스를 통해 구현체를 사용하는 방법
- 인터페이스 상속
- 인터페이스의 기본 메소드 (Default Method), 자바 8
- 인터페이스의 static 메소드, 자바 8
- 인터페이스의 private 메소드, 자바 9

---

본격적으로 인터페이스에 대해 정리하기에 앞서 인터페이스가 무엇인지 정리해보려 한다.

극단적으로 얘기하면 인터페이스는 구현을 강제하도록 하기 위한 것이다.

그러면 불편한게 아닐까 싶은 생각도 있겠지만, 오히려 그 반대라고 생각하면 된다.

생활 속에서 인터페이스의 예를 찾아보면 콘센트가 인터페이스라고 할 수 있다.

적어도 한국에서 사용하는 콘센트의 규격이 정해져있기 때문에

우리는 전자제품을 살 때 그 제품이 콘센트에 연결이 되는 것인지 고민 없이 살 수 있다.

(어떻게 보면 JVM 도 인터페이스 같이 느껴진다.)

해외 여행을 다녀봤다면 플러그 어댑터를 한 번쯤은 생각해 봤을 거다.

그 이유는 다른 나라의 콘센트 규격이 우리와 다르기 때문이다.

즉, 사용하는 인터페이스가 달라서 그 인터페이스를 사용하기 위해 새로운 인터페이스를 준비했다고 볼 수 있다.

이 인터페이스는 큰 특징이 있다.

java 1.8 이전 버전을 기준으로, 인터페이스는 두가지만 가질 수 있었다.

public static final 의 성격을 가지는 변수와 public abstract 의 성격을 가지는 구현 없이 정의만 있는 메소드이다.

만약 그냥 생략하고 작성 한다고 해도 소용없다.

생략하면 위에 얘기한 타입이 자동으로 붙고, 다른 타입을 사용하려하면 컴파일 오류가 발생한다.

```java
package me.xxxelppa.study.week08;

public interface Exam_001 {
    /*
     * ERROR CASE
     *
     * public static final int test_01;        // Variable 'test_01' might not have been initialized
     * protected final int test_02 = 10;       // Modifier 'protected' not allowed here
     * private static final int test_03 = 10;  // Modifier 'private' not allowed here
     *
     * private void mTest_01();    // Modifier 'private' not allowed here
     * protected void mTest_02();  // Modifier 'protected' not allowed here
     * void mTest_03() { }         // Interface abstract methods cannot have body
     */

    /*
     * CAN USE CASE
     */
    int test_01 = 10;
    static int test_02 = 10;                // Modifier 'static' is redundant for interface fields
    final int test_03 = 10;                 // Modifier 'final' is redundant for interface fields
    public static int test_04 = 10;         // Modifier 'public' is redundant for interface fields, Modifier 'static' is redundant for interface fields
    public final int test_05 = 10;          // Modifier 'public' is redundant for interface fields, Modifier 'final' is redundant for interface fields
    public static final int test_06 = 10;   // Modifier 'public' is redundant for interface fields, Modifier 'static' is redundant for interface fields, Modifier 'final' is redundant for interface fields

    void mTest_03();
    abstract void mTest_02();               // Modifier 'abstract' is redundant for interface methods
    public abstract void mTest_01();        // Modifier 'public' is redundant for interface methods, Modifier 'abstract' is redundant for interface methods

}
```

#### 인터페이스를 정의하는 방법

---

인터페이스는 다음과 같이 정의할 수 있다.

```java
package me.xxxelppa.study.week08;

public interface Exam_002 {
}
```

public 이외의 다른 접근 제한자를 사용하면 오류가 발생한다.

생략할 수는 있다.

#### 인터페이스를 구현하는 방법, 인터페이스 레퍼런스를 통해 구현체를 사용하는 방법

---

인터페이스는 기본적으로 추상 메소드만 가지고 있기 때문에 어디선가 누군가는 구현을 해주어야 한다.

특정 interface를 구현하기 위해서는 클래스가 필요하고, 이 클래스는 구현 할 인터페이스를 상속 받아야 한다.

 되도록이면 클래스나 인터페이스는 각자 독립된 파일에 작성하지만, 보기 편하기 위해 하나의 파일에 작성했다.

 그리고 사실 인터페이스도 .java 확장자를 가지며, 컴파일하면 .class 파일이 생성 된다 !

앞서 인터페이스는 구현을 강제 한다고 했는데, 예를 들면 다음과 같이 할 수 있다.

하나의 예제에 너무 많은걸 넣은것 같지만, 천천히 보면 쉬운 내용이다.

```java
package me.xxxelppa.study.week08;

interface MyInterface_01 {
    void mustBeInvoked();
}

public class Exam_003 {
    public static void main(String[] args) {

        MyTestClass_01 mtc_01 = new MyTestClass_01();
        MyTestClass_02 mtc_02 = new MyTestClass_02();

        /*
         * mtc_01 과 mtc_02 변수는 각각 특정 클래스의 객체를 담고 있다.
         * 이 두 클래스는 모두 MyInterface_01 이라는 인터페이스를 상속받았으므로
         * MyInterface_01 에 정의한 추상 메소드인 mustBeInvoked() 가 무조건 구현 되어있음을 알 수 있다.
         *
         * 그리고 정말 중요한 한가지가 더 있는데,
         * 두 클래스가 같은 인터페이스를 상속 받았기 때문에 다음과 같이 배열로 관리할 수 있다.
         */

        // 인터페이스 타입으로 묶어서 관리할 수 있다 !!!
        MyInterface_01[] mi_01 = {
                new MyTestClass_01()
                , new MyTestClass_02()
        };

        // 같은 인터페이스를 구현하고 있기 때문에
        // mustBeInvoked 메소드가 있음을 확신하고 사용할 수 있다.
        for (MyInterface_01 mi : mi_01) {
            mi.mustBeInvoked();
        }
    }
}

/*
 * 인터페이스를 상속 받았는데,
 * 추상 메소드를 구현하지 않으면 (즉, 오버라이딩 하지 않으면)
 * 다음과 같은 컴파일 오류를 발생한다.
 *
 * Class 'MyTestClass_01' must either be declared abstract or implement abstract method 'mustBeInvoked()' in 'MyInterface_01'
 */
class MyTestClass_01 implements MyInterface_01 {

    /*
     * @Override 어노테이션을 생략해도 상관 없지만
     * 오버라이딩 한 메소드임을 컴파일러에게 알려주고
     * 사용자 입장에서도 한 눈에 오버라이딩 한 메소드임을 알려주기 위해
     * 굳이 사용하는 것을 권장한다.
     */
    @Override
    public void mustBeInvoked() {
        System.out.println("DO SOMETHING!");
    }
}

class MyTestClass_02 implements MyInterface_01 {
    @Override
    public void mustBeInvoked() {
        System.out.println("DOBBY IS FR22");
    }
}
```

<table>
<tbody>
<tr>
<td><span>DO SOMETHING!</span><br><span>DOBBY IS FR22</span></td>
</tr>
</tbody>
</table>

위 예제를 온전히 이해한다면, 인터페이스에서 가장 빈번하게 사용하는 개념을 알고 있다고 해도 과언이 아니라고 생각한다.

#### 인터페이스 상속

---

인터페이스 사용을 정말 권하는? 이유가 있는데, 다중 상속 문제이다.

인터페이스간의 상속이 아닌 클래스의 상속에 대해 되짚어 생각해보면,

클래스는 다이아몬드 상속 문제로 다중 상속이 불가능 하다.

하지만, 인터페이스는 클래스에 다중 상속이 가능하다.

```java
package me.xxxelppa.study.week08;

public class Exam_004 implements MyInterface_02, MyInterface_03, MyInterface_04 {

}

interface MyInterface_02 { }
interface MyInterface_03 { }
interface MyInterface_04 { }
```

서로 다른 인터페이스에 같은 추상 메소드가 있어도 문제없다.

왜냐면 어차피 구현되어있지 않기 때문에, 똑같은 메소드를 상속 받아도 한 번만 구현하면 문제 없기 때문이다.

```java
package me.xxxelppa.study.week08;

public class Exam_005 implements MyInterface_05, MyInterface_06 {
    @Override
    public void test() {
        System.out.println("한 번만 오버라이딩 하면 된다.");
    }
}

interface MyInterface_05 { void test(); }
interface MyInterface_06 { void test(); }
```

#### 인터페이스의 기본 메소드 (Default Method), 자바 8

---

인터페이스는 자바 1.8 부터 기능이 확장 되었다.

이전에는 '인터페이스 구현 메소드 가지고 있는 소리 하네' 하는 농담이 가능했지만 앞으로는 그러면 안된다.

바로 이 default 메소드가 구현부를 가지는 메소드이기 때문이다.

그럼 이게 왜 생겼을까?

적어도 자바를 쓰는 사람 혼란스러우라고 만든건 아니다.

인터페이스를 잘 생각 해보면, 인터페이스를 상속 받은 클래스는 인터페이스 내부에 정의한 추상 메소드 구현을 해야만 한다고 했다.

여기까지는 좋은데, 만약 특정 인터페이스를 구현하고 있는 클래스가 100개가 있는데 이 인터페이스에 추상 메소드 하나를 더 추가 해야 한다고 해보자.

새롭게 추가된 추상 메소드를 사용하는 클래스도 있겠지만, 사용하지 않아도 되는 클래스도 분명 있을 것이다.

그러면 사용하지 않는 클래스에서는 울며 겨자먹기로 아무것도 하지 않지만 비어있는 실행 블록을 작성 해야만 하는 상황에 놓일 수 있다.

끔찍한 일이 아닐 수 없다.

이런 상황에 클래스에서 인터페이스 내부의 메소드를 선택적으로 오버라이딩 해서 사용할 수 있도록

즉, 굳이 오버라이딩 하지 않아도 컴파일 오류가 발생하지 않는 메소드를 인터페이스에 추가하기 위해서 만든 것이 default 메소드 이다.

사용 방법은 간단하다.

```java
package me.xxxelppa.study.week08;

public class Exam_006 implements MyInterface_07 {
    // 인터페이스 내부 메소드를 오버라이딩 하지 않았지만 오류가 발생하지 않는다.

    public void doSomething() {
        // 이렇게 호출해서 사용할 수도 있다.
        myTestMethod();
    }
}

interface MyInterface_07 {
    default void myTestMethod() {
        System.out.println("인터페이스도 구현 메소드를 가질 수 있다.");
    }
}
```

#### 인터페이스의 static 메소드, 자바 8

---

default 메소드와 마찬가지로 static 메소드도 자바 1.8부터 생겼다.

자바에서 static 이랑 키워드를 만나면, 일단 동적이지 않고 정적이라는 생각을 하면서 객체를 만들지 않고 사용할 수 있다고 생각 하면 좋다.

일단 static 은 메모리에 로드 되는 시점이 다르다.

new 연산자를 사용하면 런타임에 동적으로 객체가 생성되어 메모리에 로드 되는 것이 아니고, 클래스가 로드 되는 시점에 생성 된다.

그렇기 때문에 static 으로 선언된 것들은 **​객체를 생성하지 않고 바로 사용할 수**​있다.

클래스의 멤버 필드나 멤버 메소드의 경우 static 키워드를 사용하면, 해당 클래스 이름으로 객체 생성 없이 바로 사용할 수 있다.

```java
package me.xxxelppa.study.week08;

public class Exam_007 {
    public static void main(String[] args) {
        System.out.println(" :: " + MyStaticTestClass.static_value);
        MyStaticTestClass.static_method();

        // Non-static field 'non_static_value' cannot be referenced from a static context
        // System.out.println(" :: " + MyStaticTestClass.non_static_value);

        // Non-static method 'non_static_method()' cannot be referenced from a static context
        // MyStaticTestClass.non_static_method();
    }
}

class MyStaticTestClass {
    public int non_static_value = 10;
    public static int static_value = 20;

    public void non_static_method() { }
    public static void static_method() { }
}
```

조금 다른 길로 새어나갔는데, 인터페이스의 static 메소드도 클래스의 멤버에 static 키워드를 붙인 것과 마찬가지로

인터페이스 이름으로 바로 접근해서 사용할 수 있다.

```java
package me.xxxelppa.study.week08;

public class Exam_008 {
    public static void main(String[] args) {
        MyInterface_08.my_static_method();
    }
}

interface MyInterface_08 {
    static void my_static_method() {
        System.out.println("static method 입니다.");
    }
}
```

인터페이스의 static 메소드 관련해서 재밌는것이 하나 더 있다.

바로 오버라이딩 할 수 없다는 것이다.

```java
package me.xxxelppa.study.week08;

public class Exam_009 implements MyInterface_09 {

    // @Override    // Method does not override method from its superclass
    static void my_static_method() {
        System.out.println("오버라이딩 하고 싶은데..");
    }

    public static void main(String[] args) {
        my_static_method();
        MyInterface_09.my_static_method();
    }
}

interface MyInterface_09 {
    static void my_static_method() {
        System.out.println("오버라이딩 할 수 없습니다.");
    }
}
```

<table>
<tbody>
<tr>
<td><span>오버라이딩 하고 싶은데..</span><br><span>오버라이딩 할 수 없습니다.</span></td>
</tr>
</tbody>
</table>

오버라이딩이 불가능한 이유에 대해 찾아보았는데, 다음과 같은 내용을 찾아낼 수 있었다.

Overloading is the mechanism of binding the method call with the method body dynamically based on the parameters passed to the method call.
Static methods are bonded at compile time using static binding. Therefore, we cannot override static methods in Java.

Unlike other methods in Interface, these static methods contain the complete definition of the function and since the definition is complete and the method is static, therefore these methods cannot be overridden or changed in the implementation class.

#### 인터페이스의 private 메소드, 자바 9

---

자바 9에서는 인터페이스에 private 메소드를 사용할 수 있게 되었다.

private 키워드를 사용해서 일반 메소드와 static 메소드 두 가지를 정의할 수 있는데

평범한 클래스에서 (plain old java class .. ?????) 사용하는 것과 같다고 생각하면 된다.

예를 들면 static 메소드에서 non static 메소드를 사용할 수 없다던가 하는 것들이다.

```java
package me.xxxelppa.study.week08;

public class Exam_010 {

}

interface MyInterface_10 {
    default void my_default_method() {
        // private 메소드 사용 가능
        my_private_method();
        System.out.println("my default method");
    }

    private void my_private_method() {
        // static 메소드 사용 가능
        my_private_static_method();
        System.out.println("my private method");
    }

    static void my_static_method() {
        // 다른 static 메소드 사용 가능
        my_another_private_static_method();
        System.out.println("my static method");
    }

    static void my_another_static_method() {
        // 다른 일반 메소드 사용 불가능
        // non-static method my_private_method() cannot be referenced from a static context
        // my_private_method();
    }

    private static void my_private_static_method() {
        // 다른 static 메소드 사용 가능
        my_static_method();
        System.out.println("my private static method");
    }

    private static void my_another_private_static_method() {
        System.out.println("my another private static method");
    }
}
```

정말 마지막으로 인터페이스에 대해 딱 하나만 더 얘기 한다면,

다른건 몰라도 전략 패턴에 대해서는 꼭 한번 찾아봤으면 좋겠다.
