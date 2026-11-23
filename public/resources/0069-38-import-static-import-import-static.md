---
title: '정적 import (static import)의 사용, import에 static 예약어를 붙이면 어떻게 될까?'
description: >-
  Java의 import가 필요한 이유와 전체 경로로 클래스를 쓰는 방법을 비교하고, import static을 쓰면 정적 멤버를 클래스 이름 없이 바로 호출할 수 있다는 점을 예제로 정리했다.
publishedAt: '2017-05-25'
updatedAt: '2017-05-25'
tags:
  - Java
  - 단편
  - static
  - import
status: needs-review
---
java에서 import 예약어를 사용하는 경우가 있다.

어떤 경우냐면 java에서 선언하지 않아도 기본적으로 import해주는 java.lang 패키지가 아닌 다른 클래스 파일이나 라이브러리를 해당 소스에서 사용하고자 할 경우, 외부 클래스 파일이나 라이브러리를 추가하기 위한 경우이다.

예를 들면 사용자로부터 숫자를 입력 받기위해 java의 util패키지에 선언된 Scanner클래스를 사용할 때

아래와 같이 해당 클래스르 import해 주어야 사용 가능하다.

[소스 1]

```java
import java.util.Scanner;

public class Example {
    public static void main(String[] ar) {
        Scanner sc = new Scanner(System.in);

        System.out.print("input number : ");
        int number = sc.nextInt();

        System.out.println("input result = " + number);
    }
}
```

[소스1 실행결과]

![Scanner를 import한 소스1 실행 결과로 입력한 17이 그대로 출력된 콘솔](/tech-blog/resources/images/migration/0069-38-import-static-import-import-static/img-01.png)

만약 Scanner 클래스를 import 하지 않고 [소스2]처럼 사용하려 한다면

compile 과정에서 아래와 같이 클래스를 찾을 수 없다는 에러를 보여줄 것이다.

[소스 2]

```java
public class Example {
    public static void main(String[] ar) {
        Scanner sc = new Scanner(System.in);

        System.out.print("input number : ");
        int number = sc.nextInt();

        System.out.println("input result = " + number);
    }
}
```

[소스2 실행결과]

![Scanner를 import하지 않아 cannot find symbol 컴파일 에러가 난 소스2 실행 결과](/tech-blog/resources/images/migration/0069-38-import-static-import-import-static/img-02.png)

만약 import를 쓰기 싫다면 [소스3] 과 같이 전체 경로를 명시해줘서 사용 할수는 있지만

소스가 지저분해보이고 가독성이 떨어진다는 단점이 있다.

[소스3]

```java
public class Example {
    public static void main(String[] ar) {
        java.util.Scanner sc = new java.util.Scanner(System.in);

        System.out.print("input number : ");
        int number = sc.nextInt();

        System.out.println("input result = " + number);
    }
}
```

[소스3 실행결과]

![java.util.Scanner 전체 경로를 쓴 소스3이 입력한 27을 정상 출력한 콘솔](/tech-blog/resources/images/migration/0069-38-import-static-import-import-static/img-03.png)

그런 의미에서 사실 System.out.println() 도 [소스4]와 같이 작성해야 하는 것이 맞다.

[소스4]

```java
public class Example {
    public static void main(String[] ar) {
        java.util.Scanner sc = new java.util.Scanner(java.lang.System.in);

        java.lang.System.out.print("input number : ");
        int number = sc.nextInt();

        java.lang.System.out.println("input result = " + number);
    }
}
```

[소스4 실행결과]

![java.lang.System까지 전체 경로로 쓴 소스4가 입력한 3737을 정상 출력한 콘솔](/tech-blog/resources/images/migration/0069-38-import-static-import-import-static/img-04.png)

import 예약어에 대해 간단히 살펴보며 다루려던 주제와 조금 다른 길로 갔지만,

다시 되돌아와서 '과연 import에 static 예약어를 붙이면 어떻게 될까?'를 알아보자.

사실 장황하게 얘기한 것에 비해 대단한건 없다.

import에 static을 붙이면 import된 정적 멤버필드나 정적 메소드는 ***클래스의 이름 없이 접근***하여 사용할 수 있다.

뭔말인지 잘 이해가 안된다?

그럼 예제를 보면 쉽다.

[소스5]

```java
import static java.lang.System.*;

public class Example {
    public static void main(String[] ar) {
        out.println("Hello, xxxelppa World!");
    }
}
```

[소스5 실행결과]

![import static으로 System을 생략하고 out.println만으로 Hello, xxxelppa World!를 출력한 콘솔](/tech-blog/resources/images/migration/0069-38-import-static-import-import-static/img-05.png)

1라인에서 java.lang 패키지의 System 클래스 안에 정의된 ***정적 멤버에 대해 클래스명 없이 접근***​할 수 있도록 선언한 부분이다.

그래서 5라인에서 System 클래스를 생략하고 바로 out객체를 통해 문자열을 출력한 예제이다.

static import라는 거창한 이름에 비하면 정말 별거 아닌것 같다.

명칭에 속지말자.

대부분 알고보면 별거 아니다.
