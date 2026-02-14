## 자바의 열거형에 대해 학습하세요.

---

### 학습할 것

- enum 정의하는 방법
- enum이 제공하는 메소드 (values()와 valueOf())
- java.lang.Enum
- EnumSet

---

Enum을 '열거형' 또는 Enumeration 또는 상수집합 이라고도 부른다.

상수 목록이 필요해서 class 나 interface 를 활용 하는것을 본 적이 있다.

하지만 class 나 interface 는 그런 용도로 사용하라고 만들어진 것이 아니기 때문에 이런 사용을 지양해야 한다.

#### enum 정의하는 방법

---

가장 단순한 형태의 enum 클래스는 다음과 같이 정의할 수 있다.

```java
package me.xxxelppa.study.week011;

public enum WhiteshipLectureList {
    THE_JAVA_JAVA_8,
    THE_JAVA_CODE_MANIPULATION,
    THE_JAVA_APPLICATION_TEST,
    SPRING_FRAMEWORK_INTRODUCTION,
    SPRING_FRAMEWORK_INTRODUCTION_REVISED_EDITION,
    SPRING_FRAMEWORK_CORE,
    SPRING_FRAMEWORK_WEB_MVC,
    SPRING_BOOT,
    SPRING_BOOT_UPDATED,
    SPRING_AND_JPA_BASED_WEB_APPLICATION_DEVELOPMENT,
    SPRING_SECURITY,
    REST_API,
    SPRING_DATA_JPA,
    INTERVIEW_GUIDE_SOFTWARE_DEVELOPMENT_ENGINEER;
}
```

class 대신 enum 키워드를 사용해서 만들어주면 된다.

그리고 만약 위와 같이 상수로 사용할 목록만 정의한다면 17라인의 세미콜론은 생략 가능하다.

이렇게 정의한 enum 은 보통 switch 문에서 유용하게 사용할 수 있다.

예를 들어 위에 나열한 강의의 수강료를 조회해오는 코드를 다음과 같이 작성해볼 수 있다.

```java
package me.xxxelppa.study.week011;

public class Exam_001 {
    public static void main(String[] args) {

        WhiteshipLectureList list = WhiteshipLectureList.SPRING_FRAMEWORK_CORE;
        int amount = 0;

        switch (list) {
            case THE_JAVA_JAVA_8                                  : amount = 55000;  break;
            case THE_JAVA_CODE_MANIPULATION                       : amount = 49500;  break;
            case THE_JAVA_APPLICATION_TEST                        : amount = 66000;  break;
            case SPRING_FRAMEWORK_INTRODUCTION                    : amount = 0;      break;
            case SPRING_FRAMEWORK_INTRODUCTION_REVISED_EDITION    : amount = 0;      break;
            case SPRING_FRAMEWORK_CORE                            : amount = 55000;  break;
            case SPRING_FRAMEWORK_WEB_MVC                         : amount = 110000; break;
            case SPRING_BOOT                                      : amount = 110000; break;
            case SPRING_BOOT_UPDATED                              : amount = 66000;  break;
            case SPRING_AND_JPA_BASED_WEB_APPLICATION_DEVELOPMENT : amount = 330000; break;
            case SPRING_SECURITY                                  : amount = 88000;  break;
            case REST_API                                         : amount = 99000;  break;
            case SPRING_DATA_JPA                                  : amount = 88000;  break;
            case INTERVIEW_GUIDE_SOFTWARE_DEVELOPMENT_ENGINEER    : amount = 220000; break;
        }

        System.out.println(list + " 수강료는 " + amount + "(원) 입니다.");
    }
}
```

<table>
<tbody>
<tr>
<td><span>SPRING_FRAMEWORK_CORE&nbsp;수강료는&nbsp;55000(원)&nbsp;입니다.</span></td>
</tr>
</tbody>
</table>

IDE 의 도음을 받아 비교적 쉽게 작성할 수 있었지만, 어딘가 불편하다.

만약 상수를 대표하는 값을 임의로 정한 값으로 사용할 수는 없을까?

예제 코드 상황에서는 각 강의의 수강료를 알고 싶기 때문에, 각 상수를 대표하는 값을 수강료를 나타낼 정수 타입의 값으로 만들어 보자.

다음은 수정된 enum 클래스 코드이다.

```java
package me.xxxelppa.study.week011;

public enum WhiteshipLectureList {
    THE_JAVA_JAVA_8(55000),
    THE_JAVA_CODE_MANIPULATION(49500),
    THE_JAVA_APPLICATION_TEST(66000),
    SPRING_FRAMEWORK_INTRODUCTION(0),
    SPRING_FRAMEWORK_INTRODUCTION_REVISED_EDITION(0),
    SPRING_FRAMEWORK_CORE(55000),
    SPRING_FRAMEWORK_WEB_MVC(110000),
    SPRING_BOOT(110000),
    SPRING_BOOT_UPDATED(66000),
    SPRING_AND_JPA_BASED_WEB_APPLICATION_DEVELOPMENT(330000),
    SPRING_SECURITY(88000),
    REST_API(99000),
    SPRING_DATA_JPA(88000),
    INTERVIEW_GUIDE_SOFTWARE_DEVELOPMENT_ENGINEER(220000);

    private int amount;

    WhiteshipLectureList(int amount) {
        this.amount = amount;
    }

    public int getAmount() {
        return this.amount;
    }
}
```

위와 같이 enum 에 정의한 상수 옆에 소괄호 () 를 사용하면

21라인과 같이 생성자를 사용할 수 있다.

이렇게 생성자를 통해 할당된 값을 사용하려면 25라인처럼 메소드를 정의해주면 된다.

수정한 enum 클래스를 사용해서 수강료를 조회하는 코드를 다시 작성해 보았다.

```java
package me.xxxelppa.study.week011;

public class Exam_002 {
    public static void main(String[] args) {
        WhiteshipLectureList list = WhiteshipLectureList.SPRING_FRAMEWORK_CORE;
        System.out.println(list + " 수강료는 " + list.getAmount() + "(원) 입니다.");
    }
}
```

<table>
<tbody>
<tr>
<td><span>SPRING_FRAMEWORK_CORE&nbsp;수강료는&nbsp;55000(원)&nbsp;입니다.</span></td>
</tr>
</tbody>
</table>

결과를 같은데 훨씬 코드가 간결해진 것을 볼 수 있다.

물론 지금 예제에서는 수강료 하나만을 사용했는데, 다음과 같이 원한다면 더 많은 값을 사용할 수 있다.

```java
package me.xxxelppa.study.week011;

public enum WhiteshipLectureList {
    THE_JAVA_JAVA_8                                  (55000 , "더 자바, Java8"),
    THE_JAVA_CODE_MANIPULATION                       (49500 , "더 자바, 코드를 조작하는 다양한 방법"),
    THE_JAVA_APPLICATION_TEST                        (66000 , "더 자바, 애플리케이션을 테스트하는 다양한 방법"),
    SPRING_FRAMEWORK_INTRODUCTION                    (0     , "스프링 프레임워크 입문"),
    SPRING_FRAMEWORK_INTRODUCTION_REVISED_EDITION    (0     , "예제로 배우는 스프링 입문(개정판)"),
    SPRING_FRAMEWORK_CORE                            (55000 , "스프링 프레임워크 핵심 기술"),
    SPRING_FRAMEWORK_WEB_MVC                         (110000, "스프링 웹 MVC"),
    SPRING_BOOT                                      (110000, "스프링 부트 개념과 활용"),
    SPRING_BOOT_UPDATED                              (66000 , "스프링 부트 업데이트"),
    SPRING_AND_JPA_BASED_WEB_APPLICATION_DEVELOPMENT (330000, "스프링과 JPA 기반 웹 애플리케이션 개발"),
    SPRING_SECURITY                                  (88000 , "스프링 시큐리티"),
    REST_API                                         (99000 , "스프링 기반 REST API 개발"),
    SPRING_DATA_JPA                                  (88000 , "스프링 데이터 JPA"),
    INTERVIEW_GUIDE_SOFTWARE_DEVELOPMENT_ENGINEER    (220000, "더 개발자, 인터뷰 가이드");

    private int amount;
    private String korDesc;

    WhiteshipLectureList(int amount) {
        this.amount = amount;
    }

    WhiteshipLectureList(int amount, String korDesc) {
        this.amount = amount;
        this.korDesc = korDesc;
    }

    public int getAmount() {
        return this.amount;
    }

    public String getKorDesc() {
        return this.korDesc;
    }
}
```

위와 같이 생성자를 오버라이딩해서 사용할 수도 있다.

마지막으로 호기심이 생겨 생성자 안에 문자열을 출력하는 내용을 넣고 코드를 작성 해보았다.

(코드 중복이 심해 코드가 추가된 생성자 부분만 첨부한다.)

```java
    WhiteshipLectureList(int amount, String korDesc) {
        System.out.println("call constructor => " + amount + " :: " + korDesc);
        this.amount = amount;
        this.korDesc = korDesc;
    }
```

수정한 코드를 사용한 예제 코드이다.

```java
package me.xxxelppa.study.week011;

public class Exam_003 {
    public static void main(String[] args) {
        System.out.println("========================= START =========================");
        System.out.println("===================== enum 변수 선언 ====================");
        WhiteshipLectureList list;
        System.out.println("================== enum 변수에 값 할당 ==================");
        list = WhiteshipLectureList.SPRING_BOOT;
        System.out.println("=================== enum 변수 값 사용 ===================");
        System.out.println(list + " 수강료는 " + list.getAmount() + "(원) 입니다.");
        System.out.println("========================== END ==========================");
    }
}
```

<table>
<tbody>
<tr>
<td><span>=========================&nbsp;START&nbsp;========================= </span><br><span>=====================&nbsp;enum&nbsp;변수&nbsp;선언&nbsp;==================== </span><br><span>==================&nbsp;enum&nbsp;변수에&nbsp;값&nbsp;할당&nbsp;================== </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;55000&nbsp;::&nbsp;더&nbsp;자바,&nbsp;Java8 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;49500&nbsp;::&nbsp;더&nbsp;자바,&nbsp;코드를&nbsp;조작하는&nbsp;다양한&nbsp;방법 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;66000&nbsp;::&nbsp;더&nbsp;자바,&nbsp;애플리케이션을&nbsp;테스트하는&nbsp;다양한&nbsp;방법 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;0&nbsp;::&nbsp;스프링&nbsp;프레임워크&nbsp;입문 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;0&nbsp;::&nbsp;예제로&nbsp;배우는&nbsp;스프링&nbsp;입문(개정판) </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;55000&nbsp;::&nbsp;스프링&nbsp;프레임워크&nbsp;핵심&nbsp;기술 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;110000&nbsp;::&nbsp;스프링&nbsp;웹&nbsp;MVC </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;110000&nbsp;::&nbsp;스프링&nbsp;부트&nbsp;개념과&nbsp;활용 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;66000&nbsp;::&nbsp;스프링&nbsp;부트&nbsp;업데이트 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;330000&nbsp;::&nbsp;스프링과&nbsp;JPA&nbsp;기반&nbsp;웹&nbsp;애플리케이션&nbsp;개발 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;88000&nbsp;::&nbsp;스프링&nbsp;시큐리티 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;99000&nbsp;::&nbsp;스프링&nbsp;기반&nbsp;REST&nbsp;API&nbsp;개발 </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;88000&nbsp;::&nbsp;스프링&nbsp;데이터&nbsp;JPA </span><br><span>call&nbsp;constructor&nbsp;=&gt;&nbsp;220000&nbsp;::&nbsp;더&nbsp;개발자,&nbsp;인터뷰&nbsp;가이드 </span><br><span>===================&nbsp;enum&nbsp;변수&nbsp;값&nbsp;사용&nbsp;=================== </span><br><span>SPRING_BOOT&nbsp;수강료는&nbsp;110000(원)&nbsp;입니다. </span><br><span>==========================&nbsp;END&nbsp;==========================</span></td>
</tr>
</tbody>
</table>

실행 결과를 보면 흥미로웠는데, enum 타입 변수를 실제로 사용하는 순간 모든 상수에 대해 객체가 만들어지는 것을 볼 수 있었다.

마지막으로 enum 클래스는 클래스 타입이지만 new 키워드를 사용해서 객체를 만들 수 없다는 특징이 있다.

실제로 생성자에 private 키워드를 붙여보면 똑똑한 IDE 가 'Modifier 'private' is redundant for enum constructors' 라고 알려준다.

생정자가 private 이라는 것은 외부에서 객체를 생성할 수 없다는 것을 뜻한다.

그럼 왜 생성자를 private 으로 강제 했을까.

생각해보면 enum은 상수 목록이다. 상수라는건 변수와 달리 다른 값이 할당 될 수 없고 그런 시도도 하면 안된다.

그렇기 때문에 생성자를 통해서 상수에 다른 값을 할당 하려는 생각조차 하지 못하도록 (동적으로 할당할 수 없도록) 강제하는것 같다.

#### enum이 제공하는 메소드 (values()와 valueOf())

---

enum 에는 몇가지 기본적으로 제공되는 메소드가 있다.

그 중에 values 는 특이하게..? api 문서에 나와있지 않다.

![0104-204-java-live-study-week-11-enum-img-01.jpg](/tech-blog/resources/images/migration/0104-204-java-live-study-week-11-enum/img-01.jpg)

이 values 메소드는 enum 안에 선언된 모든 상수들을 배열로 반환한다.

![0104-204-java-live-study-week-11-enum-img-02.jpg](/tech-blog/resources/images/migration/0104-204-java-live-study-week-11-enum/img-02.jpg)

```java
package me.xxxelppa.study.week011;

public class Exam_004 {
    public static void main(String[] args) {
        WhiteshipLectureList[] lists = WhiteshipLectureList.values();
        for(WhiteshipLectureList list : lists) {
            System.out.println(list.toString() + " (" + list.getAmount() + " 원) => " + list.getKorDesc());
        }
    }
}
```

<table>
<tbody>
<tr>
<td><span>THE_JAVA_JAVA_8&nbsp;(55000&nbsp;원)&nbsp;=&gt;&nbsp;더&nbsp;자바,&nbsp;Java8 </span><br><span>THE_JAVA_CODE_MANIPULATION&nbsp;(49500&nbsp;원)&nbsp;=&gt;&nbsp;더&nbsp;자바,&nbsp;코드를&nbsp;조작하는&nbsp;다양한&nbsp;방법 </span><br><span>THE_JAVA_APPLICATION_TEST&nbsp;(66000&nbsp;원)&nbsp;=&gt;&nbsp;더&nbsp;자바,&nbsp;애플리케이션을&nbsp;테스트하는&nbsp;다양한&nbsp;방법 </span><br><span>SPRING_FRAMEWORK_INTRODUCTION&nbsp;(0&nbsp;원)&nbsp;=&gt;&nbsp;스프링&nbsp;프레임워크&nbsp;입문 </span><br><span>SPRING_FRAMEWORK_INTRODUCTION_REVISED_EDITION&nbsp;(0&nbsp;원)&nbsp;=&gt;&nbsp;예제로&nbsp;배우는&nbsp;스프링&nbsp;입문(개정판) </span><br><span>SPRING_FRAMEWORK_CORE&nbsp;(55000&nbsp;원)&nbsp;=&gt;&nbsp;스프링&nbsp;프레임워크&nbsp;핵심&nbsp;기술 </span><br><span>SPRING_FRAMEWORK_WEB_MVC&nbsp;(110000&nbsp;원)&nbsp;=&gt;&nbsp;스프링&nbsp;웹&nbsp;MVC </span><br><span>SPRING_BOOT&nbsp;(110000&nbsp;원)&nbsp;=&gt;&nbsp;스프링&nbsp;부트&nbsp;개념과&nbsp;활용 </span><br><span>SPRING_BOOT_UPDATED&nbsp;(66000&nbsp;원)&nbsp;=&gt;&nbsp;스프링&nbsp;부트&nbsp;업데이트 </span><br><span>SPRING_AND_JPA_BASED_WEB_APPLICATION_DEVELOPMENT&nbsp;(330000&nbsp;원)&nbsp;=&gt;&nbsp;스프링과&nbsp;JPA&nbsp;기반&nbsp;웹&nbsp;애플리케이션&nbsp;개발 </span><br><span>SPRING_SECURITY&nbsp;(88000&nbsp;원)&nbsp;=&gt;&nbsp;스프링&nbsp;시큐리티 </span><br><span>REST_API&nbsp;(99000&nbsp;원)&nbsp;=&gt;&nbsp;스프링&nbsp;기반&nbsp;REST&nbsp;API&nbsp;개발 </span><br><span>SPRING_DATA_JPA&nbsp;(88000&nbsp;원)&nbsp;=&gt;&nbsp;스프링&nbsp;데이터&nbsp;JPA </span><br><span>INTERVIEW_GUIDE_SOFTWARE_DEVELOPMENT_ENGINEER&nbsp;(220000&nbsp;원)&nbsp;=&gt;&nbsp;더&nbsp;개발자,&nbsp;인터뷰&nbsp;가이드</span></td>
</tr>
</tbody>
</table>

valueOf 메소드는 enum 안에 존재하는 상수를 가져올 때 사용한다.

실제로 열거된 상수와 대소문자, 공백 까지 모두 완벽히 일치할 경우 해당 상수를 반환하고, 그렇지 않을 경우 예외를 발생 한다.

```java
package me.xxxelppa.study.week011;

public class Exam_005 {
    public static void main(String[] args) {
        String exists_in_enum = "THE_JAVA_JAVA_8";
        String not_exists_in_enum = "THE_JAVA_JAVA_5";

        WhiteshipLectureList myList_1 = WhiteshipLectureList.valueOf(exists_in_enum);
        System.out.println(myList_1.getKorDesc());

        try {
            WhiteshipLectureList myList_2 = WhiteshipLectureList.valueOf(not_exists_in_enum);
            System.out.println(myList_2.getKorDesc());
        } catch (IllegalArgumentException e) {
            System.out.println("존재하지 않는 상수를 사용하면 IllegalArgumentException 예외를 발생합니다.");
        }
    }
}
```

<table>
<tbody>
<tr>
<td><span>더&nbsp;자바,&nbsp;Java8 </span><br><span>존재하지&nbsp;않는&nbsp;상수를&nbsp;사용하면&nbsp;IllegalArgumentException&nbsp;예외를&nbsp;발생합니다.</span></td>
</tr>
</tbody>
</table>

그 외에도 enum 키워드를 사용한 enum 클래스는 아래에서 설명 할 java.lang.Enum 클래스를 기본적으로 상속받고 있는데,

이 java.lang.Enum 클래스는 또 Object 클래스를 상속 받고 있다.

그래서 enum 클래스는 기본적으로 Object 클래스에 정의되어 있는 메소드들을 사용할 수 있는데 이 중 일부 메소드는 오버라이드 하지 못하도록 막아두었다.

예를 들면 equals(), hashCode(), finalize() 등이 있는데, api에서 보면 final 로 정의 되어 있는것을 볼 수 있다.

#### java.lang.Enum

---

enum 클래스는 java.lang.Enum 클래스를 상속 받도록 되어 있다.

그렇기 때문에 다중 상속을 지원하지 않는 java에서 enum 클래스는 별도의 상속을 받을 수 없다.

뿐만 아니라 api문서를 보면 Enum 클래스의 생성자에 대해 Sole constructor 라고 설명이 작성 되어 있다.

이게 무슨 말인지 잘 몰라서 찾아보니, It is for use by code emitted by the compiler in response to enum type declarations. 라는 뜻인것 같다.

즉, 컴파일러가 사용하는 코드기 때문에 사용자가 호출해서 사용할 수 없다.

바로 위에서 java.lang.Enum 클래스도 Object 클래스를 상속 받았다고 했다.

그 중 일부는 final로 정의 되어 있어 오버라이드 할 수 없지만, toString 메소드는 Object로부터 상속 받은 메소드를 재정의 한 것들 중에 유일하게 final로 재정의 하지 않은 메소드이다.

Enum 클래스에 정의되어 있는 다른 메소드에 대한 예시를 작성해 보았다.

```java
package me.xxxelppa.study.week011;

public class Exam_006 {
    public static void main(String[] args) {
        WhiteshipLectureList myLec_1 = WhiteshipLectureList.SPRING_FRAMEWORK_CORE;
        WhiteshipLectureList myLec_2 = WhiteshipLectureList.SPRING_DATA_JPA;

        System.out.println("myLec_1 ordinal :: " + myLec_1.ordinal());
        System.out.println("myLec_2 ordinal :: " + myLec_2.ordinal());
        System.out.println();

        System.out.println("diff ordinal :: " + (myLec_1.ordinal() - myLec_2.ordinal()));
        System.out.println("compareTo :: " + myLec_1.compareTo(myLec_2));
        System.out.println();

        System.out.println(myLec_1.name());
        System.out.println(myLec_1.toString());
    }
}
```

<table>
<tbody>
<tr>
<td><span>myLec_1&nbsp;ordinal&nbsp;::&nbsp;5 </span><br><span>myLec_2&nbsp;ordinal&nbsp;::&nbsp;12 </span><br><br><span>diff&nbsp;ordinal&nbsp;::&nbsp;-7 </span><br><span>compareTo&nbsp;::&nbsp;-7 </span><br><br><span>SPRING_FRAMEWORK_CORE </span><br><span>55000&nbsp;::&nbsp;스프링&nbsp;프레임워크&nbsp;핵심&nbsp;기술</span></td>
</tr>
</tbody>
</table>

ordinal 은 enum 클래스에 나열된 상수가 몇 번째 나열되어 있는지 zero base 로 넘버링 한 위치를 반환 한다.

compareTo 메소드는 이 ordinal 값의 차이가 얼마나 나는지 반환하는 메소드이다.

name 은 상수의 값 그 자체를 반환 한다.

toString도 오버라이드 하지 않으면 name과 같은 결과가 나왔겠지만, 지금은 enum 클래스에 toString을 오버라이드 한 결과를 출력하고 있다.

위 예제에서 override 한 메소드는 다음과 같이 정의하고 실행한 결과이다.

```java
    @Override
    public String toString() {
        return this.amount + " :: " + this.getKorDesc();
    }
```

#### EnumSet

---

EnumSet 클래스는 java.util 패키지에 정의 되어 있는 클래스이다.

이름에서 유추할 수 있듯 Set 인터페이스를 구현하고 있으며, 일반적으로 알고있는 Set 자료구조의 특징을 가지고 있다.

예를 들면, 중복을 허용하지 않는다던가 하는 것들이다.

EnumSet 클래스는 다음과 같이 사용할 수 있다.

```java
package me.xxxelppa.study.week011;

import java.util.EnumSet;

public class Exam_007 {
    public static void main(String[] args) {
        EnumSet<MyEnum> enumSet = EnumSet.allOf(MyEnum.class);

        System.out.println("================= 전체 출력 =================");
        System.out.println(enumSet);
        System.out.println();

        EnumSet newEnumSet = EnumSet.of(MyEnum.MON, MyEnum.TUE, MyEnum.WED, MyEnum.THU, MyEnum.FRI);

        System.out.println("============= 특정 상수만 출력 ==============");
        System.out.println(newEnumSet);
        System.out.println();

        System.out.println("========== 특정 상수 제외하고 출력 ==========");
        System.out.println(EnumSet.complementOf(newEnumSet));
        System.out.println();

        System.out.println("================= 범위 출력 =================");
        System.out.println(EnumSet.range(MyEnum.WED, MyEnum.FRI));
        System.out.println();
    }
}

enum MyEnum {
    SUN, MON, TUE, WED, THU, FRI, SAT
}
```

<table>
<tbody>
<tr>
<td><span>=================&nbsp;전체&nbsp;출력&nbsp;================= </span><br><span>[SUN,&nbsp;MON,&nbsp;TUE,&nbsp;WED,&nbsp;THU,&nbsp;FRI,&nbsp;SAT] </span><br><br><span>=============&nbsp;특정&nbsp;상수만&nbsp;출력&nbsp;============== </span><br><span>[MON,&nbsp;TUE,&nbsp;WED,&nbsp;THU,&nbsp;FRI] </span><br><br><span>==========&nbsp;특정&nbsp;상수&nbsp;제외하고&nbsp;출력&nbsp;========== </span><br><span>[SUN,&nbsp;SAT] </span><br><br><span>=================&nbsp;범위&nbsp;출력&nbsp;================= </span><br><span>[WED,&nbsp;THU,&nbsp;FRI]</span></td>
</tr>
</tbody>
</table>

이 클래스는 모든 메소드가 static 키워드를 사용하여 정의되어 있기 때문에 객체 생성없이 사용할 수 있다.

객체 생성 없이 사용할 수 있다고 했지만 사실 객체를 생성할 수 없다.

api 문서를 찾아보면 이 클래스는 abstract 키워드를 사용한 추상 클래스이기 때문이다.

이 클래스에 대해 조사하다보니 비트필드에 대한 얘기가 많았다.

이해는 했는데 어떻게 표현하고 정리해야할지 조심스러워서 잘 정리된 글을 첨부한다.

[비트 필드 대신 EnumSet을 사용하라](https://jaehun2841.github.io/2019/02/04/effective-java-item36/#%EC%84%9C%EB%A1%A0)

---

EnumSet 이외에 EnumMap 이라는 것도 있다.

EnumMap 클래스는 Map 인터페이스를 구현하고 있는데, Map 인터페이스를 구현한 HashMap 또는 TreeMap 등과 비교했을 때

정해진 상수를 사용하기 때문에 해싱을 하지 않고, enum을 정의할 때 이미 순서가 정해져 있기 때문에 성능상 이점이 많다고 한다.

EnumMap을 사용하는 간단한 예제를 작성해 보았다.

```java
package me.xxxelppa.study.week011;

import java.util.EnumMap;
import java.util.Map;

public class Exam_008 {
    public static void main(String[] args) {
        EnumMap<WhiteshipLectureList, String> enumMap = new EnumMap<>(WhiteshipLectureList.class);

        enumMap.put(WhiteshipLectureList.REST_API, "수강하고싶다.");
        enumMap.put(WhiteshipLectureList.SPRING_FRAMEWORK_CORE, "재미있게 수강 했다.");

        for (Map.Entry<WhiteshipLectureList, String> entry : enumMap.entrySet()) {
            System.out.println(entry.getKey().getKorDesc() + " :: " + entry.getValue());
        }
    }
}
```

<table>
<tbody>
<tr>
<td><span>스프링&nbsp;프레임워크&nbsp;핵심&nbsp;기술&nbsp;::&nbsp;재미있게&nbsp;수강&nbsp;했다. </span><br><span>스프링&nbsp;기반&nbsp;REST&nbsp;API&nbsp;개발&nbsp;::&nbsp;수강하고싶다.</span></td>
</tr>
</tbody>
</table>
