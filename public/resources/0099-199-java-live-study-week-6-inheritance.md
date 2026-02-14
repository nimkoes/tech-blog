## 자바의 상속에 대해 학습하세요.

---

### 학습할 것

- 자바 상속의 특징
- super 키워드
- 메소드 오버라이딩
- 다이나믹 메소드 디스패치 (Dynamic Method Dispatch)
- 추상 클래스
- final 키워드
- Object 클래스

---

#### 자바 상속의 특징

---

상속은 상속을 해주는 클래스와 상속을 받는 클래스 두 클래스 사이에서 일어날 수 있는 일이다.

용어에서도 알 수 있듯, 상속을 해주는 클래스가 가진 멤버 필드(클래스 레벨의 변수)와 멤버 메소드를 상속을 받는 클래스에서 마치 자신의 것처럼 사용할 수 있는 것을 뜻한다.

그럼 왜 상속이라는 개념을 도입 했을까?

자바에 대해 개인적으로 느끼고 있는 것이지만, 상수, 변수, 배열, 반복문, 클래스, 제네릭 등 대부분의 모든 개념들은 **​'중복을 피하고 싶다'**​라는 강력한 귀차니즘을 해소하기 위한 결과물이라고 생각 한다. *(태양 말고 중복을 피하고 싶어서...)*

솔직히 반복문이 없어도 복사, 붙여넣기를 열심히 하면 없어도 된다.

그런데 왜 굳이 반복문을 사용할까.

중복 코드를 피한다는 것을 제외 하더라도, 보다 읽기 좋은 코드를 작성해서 유지보수 하기 좋게 하기 위함도 있다.

상속도 마찬가지이다.

특정 클래스를 상속 받은 클래스들은, 상속 해주는 클래스가 가진 것들을 기본적으로 가지고 있다는 것을 뜻하기 때문에

**​수정하고자 하는 속성이나 기능이 이 클래스에 있다면, 이 클래스 한 곳만 수정하면 모든 클래스에 쉽게 적용**​할 수 있기 때문이다.

그 외에 다른 이점들도 많이 있지만, 우선 중복 코드를 제거하고 유지보수성을 높이기 위함이 있다는 것을 기억했으면 한다.

 앞으로 상속을 해주는 클래스를 부모 클래스(superclass), 상속을 받는 클래스를 자식 클래스(subclass) 라고 하겠다.

자바에서의 상속이 가지는 몇가지 특징이 있다.

1. 인터페이스를 제외한 부모 클래스를 단 하나만 가질 수 있다.

2. 부모 클래스를 가진 자식 클래스도 다른 클래스의 부모 클래스가 될 수 있다.

3. 모든 클래스는 Object 라는 클래스를 암묵적으로 상속 받고 있다.

4. 모든 클래스의 가장 위에 있는 부모 클래스는 Object 라는 클래스 이다.

(위에서 인터페이스라는 말을 사용 했는데, 8주차에 알아보려 한다.)

하나의 부모 클래스는 다수의 자식 클래스를 가질 수 있지만, 반대로 하나의 자식 클래스는 둘 이상의 부모 클래스를 가질 수 없다.

그 이유는 다음 그림을 보자.

![0099-199-java-live-study-week-6-inheritance-img-01.png](/tech-blog/resources/images/migration/0099-199-java-live-study-week-6-inheritance/img-01.png)

우선 위와 같은 모양으로 코드 작성을 시도하면 "Class cannot extend multiple classes" 컴파일 오류가 발생한다.

하지만 만약 가능하다는 가정하에 위와 같이 작성했다면

자식 클래스에서 부모 클래스의 걸어간다() 를 사용할 경우 동쪽으로 갈지 서쪽으로 갈지 알 수 없다.

이것을 다중 상속이라고 한다.

즉, 위와 같은 문제가 있기 때문에 자바에서는 클래스의 다중 상속을 지원하지 않기 때문에 상속을 받을 때는 신중해야 한다.

#### 한 번 상속 받으면 다른 클래스를 상속 받을 수 없기 때문이다.

이 상속과 관련해서 한가지 재미있는게 있다.

앞서 클래스에 대해 정리했을 때, 클래스는 사용자가 정의한 자료형이라고 표현했다.

다시 말해서 데이터 타입으로 취급할 수 있다는 것인데, 같은 데이터 타입을 사용할 때 배열이라는 것을 사용 했다.

이 말은 클래스도 배열에 담아 사용할 수 있다는 것을 뜻하는데, 다음과 같은 코드를 작성할 수 있다.

```java
package me.xxxelppa.study.week06;

public class Exam_001 {
    public static void main(String[] args) {
        MyType[] mt = new MyType[10];

        for(int i = 0; i < mt.length; ++i) {
            mt[i] = new MyType();
        }
    }
}

class MyType {}
```

mt 배열은 10개의 MyType 클래스 타입의 변수(또는 객체)를 요소로 가질 수 있는 배열이다.

갑자기 이 코드를 작성한 이유는, 상속에서 자식은 자기 자신의 타입이기도 하지만 **​동시에 부모 타입**​이기도 하기 때문이다.

코드를 보면 쉽게 이해할 수 있다.

```java
package me.xxxelppa.study.week06;

public class Exam_002 {
    public static void main(String[] args) {
        MyParent mp = new MyChild();  // 부모 타입에 자식 타입 객체를 할당

        MyParent[] arrMP = new MyParent[10];
        for(int i = 0; i < arrMP.length; ++i) {
            if(i % 2 == 0) arrMP[i] = new MyChild();  // 짝수번째 요소에는 자식 객체
            else arrMP[i] = new MyParent();           // 홀수번째 요소에는 부모 객체
        }
    }
}

class MyParent { }
class MyChild extends MyParent { }
```

MyChild 입장에서 MyParent 는 부모 클래스이다.

그리고 자식 타입은 부모 타입의 변수에 할당될 수 있기 때문에 위와 같은 코드가 문제 없이 동작한다.

이것을 **​다형성**​이라고 한다.

자바 언어를 사용 하면서 매우 아주 엄청 진짜 뻥안치고 중요한 내용이기 때문에 정말 잘 알아둬야 한다.

상속을 사용하지 않는다는 것은 포인터를 사용하지 않고 C언어를 사용하는 것과 다를바 없다.

#### super 키워드

---

this 키워드가 자기 자신의 클래스를 나타내는 키워드 였다면, super는 상속 관계에서 부모 클래스를 가리키는 키워드 이다.

코드를 보는게 이해가 빠를것 같다.

```java
package me.xxxelppa.study.week06;

public class Exam_003 extends SuperTestClass {
    public static void main(String[] args) {
        Exam_003 exam_003 = new Exam_003();
        exam_003.myPrint();
        System.out.println();

        System.out.println("어떤 결과 ?");
        exam_003.print();
    }

    public void myPrint() {
        super.print();  // 상속 관계에서 부모 클래스에 접근
        print();
    }

    public void print() {
        System.out.println("자식 클래스 메소드");
    }
}

class SuperTestClass {
    public void print() {
        System.out.println("부모 클래스의 메소드");
    }
}
```

<table>
<tbody>
<tr>
<td><span>부모 클래스의 메소드</span><br><span>자식 클래스 메소드</span><br><br><span>어떤 결과?</span><br><span>자식 클래스 메소드</span></td>
</tr>
</tbody>
</table>

현재 부모 클래스에도 자식 클래스에도 모두 print 라는 메소드가 모두 존재한다.

이 때 14라인에서 명시적으로 부모 클래스의 print 메소드를 실행 하라고 했기 때문에, 자식 클래스에 있는 print 를 사용하지 않고 부모 클래스의 메소드를 사용한 것을 알 수 있다.

마지막으로 super 키워드는 this 키워드와 마찬가지로 super() 라는 것이 있다.

this()가 자기 자신 클래스의 다른 생성자를 호출 했다면, super() 는 부모 클래스의 생성자를 호출 하는데 사용한다.

```java
package me.xxxelppa.study.week06;

public class Exam_004 extends SuperClass {
    public Exam_004() {
    }

    public static void main(String[] args) {
        Exam_004 exam_004 = new Exam_004();
    }
}

class SuperClass {
    public SuperClass() {
        System.out.println("부모 클래스의 기본 생성자");
    }
}
```

<table>
<tbody>
<tr>
<td><span>부모 클래스의 기본 생성자</span></td>
</tr>
</tbody>
</table>

자바에서는 객체를 생성하면, 그 클래스의 부모 클래스의 기본 생성자를 자동으로 실행하도록 되어 있다.

그렇기 때문에 위에 작성한 예제 코드에서 super() 를 작성하지 않았지만,

Exam_004() 생성자 안에서 super() 가 있는 것처럼 동작한 것을 확인할 수 있다.

this 에서처럼 매개변수를 넣어주면, 해당 매개변수를 갖는 부모 클래스의 생성자가 호출 된다.

#### 메소드 오버라이딩

---

메소드 오버라이딩은 다른 말로 '메소드 재정의' 라고 한다.

이런 표현은 잘 쓰지 않지만, 덮어쓰기라고 생각하면 될 것 같다.

상속 관계에서 부모 클래스의 메소드를 자신의 것처럼 가져다 사용할 수 있는데

그 내용이 마음에 들지 않거나(?) 다시 정의해서 사용해야 할 필요가 있을 경우 메소드 오버라이딩을 할 수 있다.

```java
package me.xxxelppa.study.week06;

public class Exam_005 extends OverrideTestClass {
    public static void main(String[] args) {
        Exam_005 exam_005 = new Exam_005();
        exam_005.myPrint();
    }

    @Override
    public void myPrint() {
        System.out.println("자식 클래스에서 오버리이딩 한 메소드를 실행 합니다.");
    }
}

class OverrideTestClass {
    public void myPrint() {
        System.out.println("부모 클래스의 myPrint 메소드를 실행 합니다.");
    }
}
```

<table>
<tbody>
<tr>
<td><span>자식 클래스에서 오버라이딩 한 메소드를 실행 합니다.</span></td>
</tr>
</tbody>
</table>

그리고 굳이 작성해주지 않아도 괜찮지만, 굳이 작성해주면 좋은 @Override 어노테이션이 있다.

어노테이션은 @ 를 사용하여 나타내는데, 다양하게 사용할 수 있지만 보통 메타 데이터로 사용 된다.

메타 데이터란 데이터를 위한 데이터라고도 하며, 해당 데이터가 어떤 데이터인지 설명해주는 것이다.

지금 코드에서 사용한 @Override 라는 어노테이션은

public void myPrint() 메소드가 Override 한 메소드 라는 것을 컴파일러에게 알려주는 역할을 한다.

만약, 부모 클래스에 재정의 할 메소드가 없을 경우 **컴파일 시점에 오류를 발생해 주기 때문에 런타임시 오작동을 방지**할 수 있다.

위 코드에서 OverrideTestClass 클래스의 myPrint 메소드 이름을 다른 것으로 바꾸면

9라인에 "Method does not override method from its superclass" 라는 컴파일 오류가 발생하는 것을 볼 수 있다.

이렇게 컴파일 시점에 사용자의 typo를 검출 하기도 하지만, 코드를 읽는 사람이 '이 메소드는 오버라이딩 된 것이구나' 라고 바로 알 수 있기 때문에 가독성에도 이점이 있다.

그럼 만약 내가 오버라이드 했지만 그럼에도 불구하고 부모의 원래 메소드를 사용하고 싶을 때가 있을수도 있다.

이런 경우 어떻게 해야 할까?

해법은 이미 알고 있다. super 키워드를 사용해서 호출하면 된다.

#### 다이나믹 메소드 디스패치 (Dynamic Method Dispatch)

---

메소드 디스패치는 크게 두가지 타입이 존재한다.

1. 스태틱 (정적)

2. 다이나믹 (동적)

컴파일 타임에 호출 할 메소드를 알 수 있으면 정적

컴파일 타임이 아닌 런타임에 호출 할 메소드를 알 수 있으면 동적 이라고 한다.

동적 디스패치의 경우 다형적인 코드를 작성할 때 발생하는데, 역시 코드를 보는게 좋을것 같다.

```java
package me.xxxelppa.study.week06;

public class Exam_008 {
    public static void main(String[] args) {
        // 정적 디스패치
        Child_01 child_01 = new Child_01();
        child_01.print();
        Child_02 child_02 = new Child_02();
        child_02.print();
        System.out.println();

        // 동적 디스패치 (오버라이딩)
        Super dynamic_dispatch_01 = new Child_01();
        dynamic_dispatch_01.print();
        Super dynamic_dispatch_02 = new Child_02();
        dynamic_dispatch_02.print();
        System.out.println();
    }
}

class Super {
    public void print() {
        System.out.println("부모 클래스의 메소드");
    }
}

class Child_01 extends Super {
    @Override
    public void print() {
        System.out.println("자식 01 에서 재정의 한 메소드");
    }
}

class Child_02 extends Super {
    @Override
    public void print() {
        System.out.println("자식 02 에서 재정의 한 메소드");
    }
}
```

<table>
<tbody>
<tr>
<td><span>자식 01 에서 재정의 한 메소드</span><br><span>자식 02 에서 재정의 한 메소드</span><br><br><span>자식 01 에서 재정의 한 메소드</span><br><span>자식 02 에서 재정의 한 메소드</span></td>
</tr>
</tbody>
</table>

코드를 봐서는 잘 알기 어렵기 때문에 컴파일 된 바이트 코드를 열어보았다.

여기서 눈여겨 볼 부분은 소스 코드 상의 7, 9, 14, 16 라인 이므로 해당 부분을 굵은 글씨로 수정했다.

<table>
<tbody>
<tr>
<td><span>// class version 52.0 (52)</span><br><span>// access flags 0x21</span><br><span>public class me/xxxelppa/study/week06/Exam_008 {</span><br><span><br></span><br><span>&nbsp; // compiled from: Exam_008.java</span><br><span><br></span><br><span>&nbsp; // access flags 0x1</span><br><span>&nbsp; public &lt;init&gt;()V</span><br><span>&nbsp; &nbsp;L0</span><br><span>&nbsp; &nbsp; LINENUMBER 3 L0</span><br><span>&nbsp; &nbsp; ALOAD 0</span><br><span>&nbsp; &nbsp; INVOKESPECIAL java/lang/Object.&lt;init&gt; ()V</span><br><span>&nbsp; &nbsp; RETURN</span><br><span>&nbsp; &nbsp;L1</span><br><span>&nbsp; &nbsp; LOCALVARIABLE this Lme/xxxelppa/study/week06/Exam_008; L0 L1 0</span><br><span>&nbsp; &nbsp; MAXSTACK = 1</span><br><span>&nbsp; &nbsp; MAXLOCALS = 1</span><br><span><br></span><br><span>&nbsp; // access flags 0x9</span><br><span>&nbsp; public static main([Ljava/lang/String;)V</span><br><span>&nbsp; &nbsp;L0</span><br><span>&nbsp; &nbsp; LINENUMBER 6 L0</span><br><span>&nbsp; &nbsp; NEW me/xxxelppa/study/week06/Child_01</span><br><span>&nbsp; &nbsp; DUP</span><br><span>&nbsp; &nbsp; INVOKESPECIAL me/xxxelppa/study/week06/Child_01.&lt;init&gt; ()V</span><br><span>&nbsp; &nbsp; ASTORE 1</span><br><span>&nbsp; &nbsp;L1</span><br><span><b>&nbsp; &nbsp; LINENUMBER 7 L1</b></span><br><span><b>&nbsp; &nbsp; ALOAD 1</b></span><br><span><b>&nbsp; &nbsp; INVOKEVIRTUAL me/xxxelppa/study/week06/Child_01.print ()V</b></span><br><span>&nbsp; &nbsp;L2</span><br><span>&nbsp; &nbsp; LINENUMBER 8 L2</span><br><span>&nbsp; &nbsp; NEW me/xxxelppa/study/week06/Child_02</span><br><span>&nbsp; &nbsp; DUP</span><br><span>&nbsp; &nbsp; INVOKESPECIAL me/xxxelppa/study/week06/Child_02.&lt;init&gt; ()V</span><br><span>&nbsp; &nbsp; ASTORE 2</span><br><span>&nbsp; &nbsp;L3</span><br><span><b>&nbsp; &nbsp; LINENUMBER 9 L3</b></span><br><span><b>&nbsp; &nbsp; ALOAD 2</b></span><br><span><b>&nbsp; &nbsp; INVOKEVIRTUAL me/xxxelppa/study/week06/Child_02.print ()V</b></span><br><span>&nbsp; &nbsp;L4</span><br><span>&nbsp; &nbsp; LINENUMBER 10 L4</span><br><span>&nbsp; &nbsp; GETSTATIC java/lang/System.out : Ljava/io/PrintStream;</span><br><span>&nbsp; &nbsp; INVOKEVIRTUAL java/io/PrintStream.println ()V</span><br><span>&nbsp; &nbsp;L5</span><br><span>&nbsp; &nbsp; LINENUMBER 13 L5</span><br><span>&nbsp; &nbsp; NEW me/xxxelppa/study/week06/Child_01</span><br><span>&nbsp; &nbsp; DUP</span><br><span>&nbsp; &nbsp; INVOKESPECIAL me/xxxelppa/study/week06/Child_01.&lt;init&gt; ()V</span><br><span>&nbsp; &nbsp; ASTORE 3</span><br><span>&nbsp; &nbsp;L6</span><br><span><b>&nbsp; &nbsp; LINENUMBER 14 L6</b></span><br><span><b>&nbsp; &nbsp; ALOAD 3</b></span><br><span><b>&nbsp; &nbsp; INVOKEVIRTUAL me/xxxelppa/study/week06/Super.print ()V</b></span><br><span>&nbsp; &nbsp;L7</span><br><span>&nbsp; &nbsp; LINENUMBER 15 L7</span><br><span>&nbsp; &nbsp; NEW me/xxxelppa/study/week06/Child_02</span><br><span>&nbsp; &nbsp; DUP</span><br><span>&nbsp; &nbsp; INVOKESPECIAL me/xxxelppa/study/week06/Child_02.&lt;init&gt; ()V</span><br><span>&nbsp; &nbsp; ASTORE 4</span><br><span>&nbsp; &nbsp;L8</span><br><span><b>&nbsp; &nbsp; LINENUMBER 16 L8</b></span><br><span><b>&nbsp; &nbsp; ALOAD 4</b></span><br><span><b>&nbsp; &nbsp; INVOKEVIRTUAL me/xxxelppa/study/week06/Super.print ()V</b></span><br><span>&nbsp; &nbsp;L9</span><br><span>&nbsp; &nbsp; LINENUMBER 17 L9</span><br><span>&nbsp; &nbsp; GETSTATIC java/lang/System.out : Ljava/io/PrintStream;</span><br><span>&nbsp; &nbsp; INVOKEVIRTUAL java/io/PrintStream.println ()V</span><br><span>&nbsp; &nbsp;L10</span><br><span>&nbsp; &nbsp; LINENUMBER 18 L10</span><br><span>&nbsp; &nbsp; RETURN</span><br><span>&nbsp; &nbsp;L11</span><br><span>&nbsp; &nbsp; LOCALVARIABLE args [Ljava/lang/String; L0 L11 0</span><br><span>&nbsp; &nbsp; LOCALVARIABLE child_01 Lme/xxxelppa/study/week06/Child_01; L1 L11 1</span><br><span>&nbsp; &nbsp; LOCALVARIABLE child_02 Lme/xxxelppa/study/week06/Child_02; L3 L11 2</span><br><span>&nbsp; &nbsp; LOCALVARIABLE dynamic_dispatch_01 Lme/xxxelppa/study/week06/Super; L6 L11 3</span><br><span>&nbsp; &nbsp; LOCALVARIABLE dynamic_dispatch_02 Lme/xxxelppa/study/week06/Super; L8 L11 4</span><br><span>&nbsp; &nbsp; MAXSTACK = 2</span><br><span>&nbsp; &nbsp; MAXLOCALS = 5</span><br><span>}</span></td>
</tr>
</tbody>
</table>

다형적이지 않은 7, 9 라인에서는 컴파일 결과 어떤 객체의 메소드를 사용할지 알 수 있지만

다형적인 코드를 사용한 14, 16라인에서는 부모 타입의 print 메소드를 사용 한다고 되어있고, 실제 사용되는 객체에 대한 정보는 알 수 없다.

다시 말해서 컴파일 시점이 아닌 런타임 시점에 어떤 객체의 메소드를 사용할지 결정 된다는 것인데, 이런 것을 동적 디스패치 라고 한다.

#### 추상 클래스

---

자바를 쓰다보면 추상이라는 말을 자주 접한다. 일상에서 자주 사용하는 말이 아니어서 그 의미가 쉽게 와닿지 않을 수 있다.

추상적이라는 말의 반대 의미를 갖는 말 중에 구체적이라는 말을 보통 사용한다.

이래도 이해가 어렵다면, 공통적인 부분을 추출해낸다 라고 할 수도 있다.

예를 들어보자.

기린, 코끼리, 나무늘보, 고슴도치가 있다.

다양한 관점에서 해석할 수 있겠지만, 우리는 이들을 '동물' 이라고 말한다.

이렇게 공통적인 부분을 추출해내어 '동물' 이라고 한 것이 추상화 했다고 할 수 있다.

동물을 한번 더 추상화 해본다고 하자.

동물과 비슷한 급에서 분류 하는 것중 식물도 있다.

이것을 '생명체' 라고 할 수 있는데, 이것도 추상화 했다고 할 수 있다.

그 반대 방향을 구체화 했다고 한다.

100% 똑같지 않을 수 있지만, 약간 대분류, 중분류, 소분류 하는 것과 비슷한 느낌이다.

추상화라는 것이 무엇인지 느낌을 알았으니, 추상 클래스가 무엇인지 알아보자.

(추상화와 추상 클래스는 조금 다르다.)

아주 간단하게 요약하면, 추상 메소드를 가지면 그게 추상 클래스이다.

하지만 추상 클래스라고 해서 추상 메소드를 가져야만 하는 것은 아니다.

추상 메소드가 없어도 추상 클래스로 선언 했으면 그건 추상 클래스이다.

추상 클래스를 추상 메소드 이외에 일반 메소드들도 얼마든지 가질 수 있다.

추상 클래스나 메소드는 자바에서 abstract 키워드를 사용한다.

```java
package me.xxxelppa.study.week06;

public class Exam_006 {
}

// 추상 메소드를 가지지 않는 추상 클래스
abstract class abstract_class_without_abstract_method { }

// 추상 메소드를 가지는 추상 클래스
abstract class abstract_class_with_abstract_method {
    abstract public void print();
}
```

추상 메소드 존재 여부와 무관하게 모든 추상 클래스는 인스턴스화 (객체화) 할 수 없다.

즉, new 키워드를 사용해서 객체를 생성할 수 없다.

그 이유는 의외로 단순하다.

구체적인 내용이 없기 때문에 이걸 구체적인 객체로 생성하지 못한다고 생각하면 된다.

실제로 11라인에서 작성한 abstract 키워드를 사용한 추상 메소드를 보자.

이 키워드가 붙은 메소드는 구현부를 가지고 있지 않다.

즉, 이 메소드를 실행 했을 때 뭘 할지 알 수 없다.

그럼 이 쓸모 없어 보이는 것은 왜 만들었을까?

사실 쓸모 없어 보이지만 쓸모가 있다. *(이게 무슨 말장난)*

이 객체도 만들 수 없는 추상 메소드를 가진 추상 클래스를 상속 받으면, 상속 받은 클래스에서는 이 **추상 메소드를 무조건 구현** 해주어야 한다.

즉, 다음과 같다.

```java
package me.xxxelppa.study.week06;

public class Exam_006 extends abstract_class_with_abstract_method {
    @Override
    public void print() {
        System.out.println("무조건 구현 해주어야 합니다.");
    }
}

// 추상 메소드를 가지지 않는 추상 클래스
abstract class abstract_class_without_abstract_method { }

// 추상 메소드를 가지는 추상 클래스
abstract class abstract_class_with_abstract_method {
    abstract public void print();
}
```

부모 클래스를 작성 하면서 다음과 같이 생각할 수 있다.

'이 메소드는 상속 받은 클래스마다 다르게 구현 해야하는 기능인데, 구현을 강제할 방법이 없을까'

일반 메소드라면 자식 클래스에서 오버라이딩이 선택이기 때문에 강제할 수 없다.

하지만 추상 메소드를 작성 해둔다면 상속 받은 자식은 무조건 구현해야한다는 제약을 가지게 된다.

추상 메소드를 구현하지 않으면 컴파일 단계에서 오류를 발생하기 때문에, 런타임 오류를 방지할 수 있다는 장점도 가지고 있다.

만약 추상 메소드를 가지는 추상 클래스를 상속 받았는데 메소드를 구현하지 않으면 다음과 같은 오류 메시지를 받아볼 수 있다.

<table>
<tbody>
<tr>
<td><span>Class 'Exam_006' must either be declared abstract or implement abstract method 'print()' in 'abstract_class_wih_abstract_method'</span></td>
</tr>
</tbody>
</table>

추상 클래스가 자신을 상속받은 자식 클래스에서 자신이 가진 추상 메소드 구현을 강제 하는 것도 있지만,

추상 메소드를 가지지도 않으면서 추상 클래스로 선언하는 경우가 있다.

개인적으로 흔하게 보지 못했지만, 그 클래스의 객체를 생성해서 사용하면 안되는 경우 추상 클래스로 정의 하기도 한다.

#### final 키워드

---

이름이 주는 느낌이 어떤 느낌인지 알았다면, 그 느낌이 맞다.

이거 진짜 최종, 더 이상 진짜 수정 없음, 끝 이라고 하고 싶을 때 사용하는 키워드 이다.

클래스를 정리 하면서 등장 했지만, 사실 클래스 이외에 변수에도 사용할 수 있다.

변수에 사용할 경우 이 변수를 앞으로 상수 취급 한다는 것을 의미한다.

상수는 그 자체로 다른 값을 가질 수 없다.

다시 말해서 변수의 형태를 가지고 있지만, final 키워드를 붙였다면 이 변수는 다른 값을 가질 수 없음을 뜻한다.

그렇기 때문에 보통 final 키워드를 사용하면 값을 처음에 무조건 할당 해줘야 한다.

final 키워드가 붙은 변수는 다음과 같은 방법으로 값을 할당할 수 있다.

```java
package me.xxxelppa.study.week06;

public class Exam_007 {
    private final int MY_FINAL_INT;
    private final String MY_FINAL_STRING = "FINAL_STRING";
    public Exam_007(int MY_FINAL_INT) {
        this.MY_FINAL_INT = MY_FINAL_INT;
    }

    public static void main(String[] args) {
        final double PI = 3.14;
    }
}
```

4라인에서 final 변수를 선언 했지만 값을 할당하지 않았다.

그래도 가능한 이유는 **​생성자를 통해 값을 할당**​하고 있기 때문이다.

그 외의 경우에는 무조건 선언과 동시에 값을 할당 해주어야 한다.

추가로 final 변수에 대한 네이밍 컨벤션이 존재한다.

모두 대문자로 작성하고 언더 스코어(_)로 연결한 변수명을 사용해서 '누가 봐도 final 변수구나' 하고 알 수 있도록 한다.

다음으로 메소드에도 붙일 수 있는데, 이런 경우 오버라이드 할 수 없는 메소드가 된다.

변수가 상수가 된 것처럼 같은 이름으로 다른 기능을 하도록 재정의 할 수 없다는 것을 뜻한다.

마지막으로 클래스에 붙인 경우 상속할 수 없는 즉, 부모 클래스가 될 수 없음을 뜻한다.

하지만 final 클래스는 여전히 부모 클래스를 가질 수 있다.

#### Object 클래스

---

Object 클래스는 단군 할아버지 같은 존재다. 모든 클래스의 최상위 부모는 항상 이 Object 클래스이다.

이 말의 의미는 모든 클래스는 Object 클래스에 정의 되어있는 모든 멤버 필드와 메소드를 자유롭게 가져다 사용할 수 있음을 뜻한다.

[Object 클래스에 대한 api 문서 링크](https://docs.oracle.com/en/java/javase/13/docs/api/java.base/java/lang/Object.html)

이 클래스에서 다른 어떤 메소드 보다 주의해야 할 것은 finalize() 메소드이다.

간단하게 말하면, 이 메소드는 GC를 호출하는 메소드인데 사실 직접 호출하면 여러가지 문제가 발생할 수 있다.

[자세한 내용에 대해 잘 정리된 글을 링크로 남겨둔다.](https://brunch.co.kr/@oemilk/122)

그래서인지 api 문서 상에도 deprecated 가 되었다고 명시 되어 있다.

<table>
<tbody>
<tr>
<td><span><b>Deprecated.</b></span><br><span>The finalization mechanism is inherently problematic. Finalization can lead to performance issues, deadlocks, and hangs. Errors in finalizers can lead to resource leaks; there is no way to cancel finalization if it is no longer necessary; and no ordering is specified among calls to&nbsp;finalize&nbsp;methods of different objects. Furthermore, there are no guarantees regarding the timing of finalization. The&nbsp;finalize&nbsp;method might be called on a finalizable object only after an indefinite delay, if at all. Classes whose instances hold non-heap resources should provide a method to enable explicit release of those resources, and they should also implement&nbsp;<a href="https://docs.oracle.com/en/java/javase/13/docs/api/java.base/java/lang/AutoCloseable.html">AutoCloseable</a>&nbsp;if appropriate. The&nbsp;<a href="https://docs.oracle.com/en/java/javase/13/docs/api/java.base/java/lang/ref/Cleaner.html">Cleaner</a>&nbsp;and&nbsp;<a href="https://docs.oracle.com/en/java/javase/13/docs/api/java.base/java/lang/ref/PhantomReference.html">PhantomReference</a>&nbsp;provide more flexible and efficient ways to release resources when an object becomes unreachable.</span></td>
</tr>
</tbody>
</table>
