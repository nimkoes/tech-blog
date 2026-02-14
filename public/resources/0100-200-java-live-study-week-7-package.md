## 자바의 패키지에 대해 학습하세요.

---

### 학습할 것

- package 키워드
- import 키워드
- 클래스패스
- CLASSPATH 환경변수
- -classpath 옵션
- 접근지시자

---

#### package 키워드

---

package 키워드에 앞서 패키지 자체에 대해 생각해보려 한다.

아주 쉽게 생각하면 컴퓨터에 폴더를 생각하면 된다.

실제로 자바에서 패키지 개념도 폴더와 같다.

조금 더 그럴싸하게? 얘기하면 클래스를 묶은 단위로 사용할 수 있다 할 수 있다.

그러면 왜 클래스를 굳이 패키지라는 폴더와 같은 개념을 사용해서 묶도록 했을까.

크게 두가지 이유가 있다.

하나는 같은 이름의 클래스를 선언할 때 구분할 수 있기 때문도 있고

다른 하나는 이 이유의 연장선에서 비슷한 또는 연관있는 클래스끼리 하나의 폴더로 묶어 관리하기 위함이다.

패키지 이름으로 아무것이나 사용할 수 있는건 아니다.

반드시 지켜야 하는 규칙도 있지만, 그렇지 않아도 되는 규칙이 있어서 혼란스러운 경우가 종종 있지만 보통은 다음과 같은 규칙이 있다.

- 영문 소문자를 사용

- 상위 패키지와 하위 패키지는 . 을 사용해서 연결

- 자바 예약어는 사용하지 않음

- java 로 시작하면 자바에서 기본적으로 제공하는 패키지

- javax 로 시작하면 자바에서 기본적으로 제공하는 확장 패키지

- org 로 시작하면 비영리 단체에서 만든 패키지

- com 으로 시작하면 기업에서 만든 패키지

일반적으로 위와 같은 규칙이 있으니, 사용하는 클래스가 어떤 패키지에 속해 있는지 보면 대략적인 정보에 대해 알 수 있다.

패키지를 선언하지 않는 경우도 있다.

권장하지 않지만 선언하지 않는다고 해서 프로그램이 동작하지 않는것은 아니다.

이런 경우 클래스가 default 패키지에 생성 되었다고 한다.

![0100-200-java-live-study-week-7-package-img-01.jpg](/tech-blog/resources/images/migration/0100-200-java-live-study-week-7-package/img-01.jpg)

![0100-200-java-live-study-week-7-package-img-02.jpg](/tech-blog/resources/images/migration/0100-200-java-live-study-week-7-package/img-02.jpg)

```java
public class Exam_001_Default_Package {
    public static void main(String[] args) {
        // default package 를 사용한 경우로, package 키워드를 사용하지 않는다.
    }
}
```

#### import 키워드

---

이 키워드는 다른 패키지에 있는 클래스를 가져다 사용하고 싶을 때 쓰는 키워드 이다.

다음은 import 키워드를 사용한 예이다.

![0100-200-java-live-study-week-7-package-img-03.jpg](/tech-blog/resources/images/migration/0100-200-java-live-study-week-7-package/img-03.jpg)

```java
package me.xxxelppa.study.week07.sub_01;

public class Exam_001_sub_01 {
    private String sub_01_str = "sub_01 패키지 안에 선언된 문자열";

    public String getSub_01_str() {
        return sub_01_str;
    }
}
```

```java
package me.xxxelppa.study.week07.sub_02;

import me.xxxelppa.study.week07.sub_01.Exam_001_sub_01;

public class Exam_001_sub_02 {
    public static void main(String[] args) {
        Exam_001_sub_01 exam_001_sub_01 = new Exam_001_sub_01();
        System.out.println(":: 다른 패키지 사용 -> " + exam_001_sub_01.getSub_01_str());
    }
}
```

<table>
<tbody>
<tr>
<td><span>::&nbsp;다른&nbsp;패키지&nbsp;사용&nbsp;-&gt;&nbsp;sub_01&nbsp;패키지&nbsp;안에&nbsp;선언된&nbsp;문자열</span></td>
</tr>
</tbody>
</table>

import 키워드를 사용하면 static import 라는 것을 보게 된다.

static 키워드를 사용하여 멤버 필드 (클래스 레벨의 변수) 또는 메소드를 선언하면, 객체 (또는 인스턴스)를 통하지 않고 클래스 이름을 통해 사용할 수 있다.

즉, 다음과 같은 것이 가능하다.

![0100-200-java-live-study-week-7-package-img-04.jpg](/tech-blog/resources/images/migration/0100-200-java-live-study-week-7-package/img-04.jpg)

```java
package me.xxxelppa.study.week07.sub_01;

public class Exam_002_sub_01_static {
    public static void print() {
        System.out.println("sub_01 패키지에 있는 static 메소드 print 사용");
    }
}
```

```java
package me.xxxelppa.study.week07.sub_02;

import static me.xxxelppa.study.week07.sub_01.Exam_002_sub_01_static.print;

public class Exam_002_sub_02_static {
    public static void main(String[] args) {
        print();
    }
}
```

<table>
<tbody>
<tr>
<td><span>sub_01 패키지에 있는 static 메소드 print 사용</span></td>
</tr>
</tbody>
</table>

만약 static import 를 사용하지 않았다면, 7라인에서 print 메소드를 사용하기 위해

다음과 같이 작성 했어야 했다.

```java
package me.xxxelppa.study.week07.sub_02;

import me.xxxelppa.study.week07.sub_01.Exam_002_sub_01_static;

public class Exam_002_sub_02_static {
    public static void main(String[] args) {
        Exam_002_sub_01_static.print();
    }
}
```

#### 클래스 패스, CLASSPATH 환경변수

---

JVM에 의해 프로그램이 실행될 때 사용할 클래스 파일들을 찾는 경로를 클래스패스 라고 한다.

클래스패스를 설정하는 방법이 몇가지 있는데, 윈도우 기준으로 윈도우 시스템에서 사용 할 클래스 패스를 환경변수에 등록하는 방법과

ide와 같은 통합 개발 환경을 제공하는 도구에 classpath 를 설정하여 사용하는 방법이 있다.

[예전에 환경변수를 설정하고 클래스패스에 대해 정리했던 글이다.](/tech-blog/post/0064-32-java-environment-variables-guide/)

#### -classpath 옵션

---

이 옵션에 대해서는 윈도우 기준 명령 프롬프트에 java -help 명령을 입력하면 설명이 나와있다.

![0100-200-java-live-study-week-7-package-img-05.jpg](/tech-blog/resources/images/migration/0100-200-java-live-study-week-7-package/img-05.jpg)

-classpath

class search path of directories and zip/jar files

--class-path

class search path of directories and sip/jar files

A ; separated list of directories, JAR archives, and ZIP archives to search for class files.

실행이 아니라 컴파일을 할 경우에는 다음과 같이 사용할 수 있다.

![0100-200-java-live-study-week-7-package-img-06.jpg](/tech-blog/resources/images/migration/0100-200-java-live-study-week-7-package/img-06.jpg)

#### 접근지시자

---

접근지시자는 다른 말로 접근제한자 라고도 한다.

클래스나 멤버 필드 또는 클래스 내부에 선언 된 메소드에 대해 외부의 접근을 어디까지 허용할 것이지 정할 때 사용할 수 있다.

5주차 과제에서 한 번 언급한 적이 있기 때문에 간략하게 표로 정리해 보았다.

<table>
<tbody>
<tr>
<td><span>구분</span></td>
<td><span>적용 가능한 접근지시자</span></td>
</tr>
<tr>
<td><span>class (클래스)</span></td>
<td><span>public 또는 생략 (default)</span></td>
</tr>
<tr>
<td><span>멤버 필드 (클래스 변수)</span></td>
<td><span>public, protected, 생략 (default), private</span></td>
</tr>
<tr>
<td><span>멤버 메소드</span></td>
</tr>
<tr>
<td><span>지역 변수 (메소드 변수)</span></td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>

public : 자신을 포함한 모든 위치에서 사용이 가능하다. 즉, 제한이 없다.

protected : 같은 패키지 또는 상속 관계에서 접근 해서 사용할 수 있다.

생략(default) : package 라는 이름으로 부르기도 하는데, 같은 패키지 내에서 접근할 수 있는 지시자 또는 제한자 이다.

private : 같은 클래스 내에서만 접근해서 사용할 수 있다.
