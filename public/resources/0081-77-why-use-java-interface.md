자바에서 인터페이스를 사용하는 이유가 무엇일까?

아마 인터페이스를 처음 접해보는 분들이 많이 궁금해 하는 부분일거라고 생각한다.

그냥 그 기능을 클래스로 구현해도 될 것 같은데 번거롭게(?) 인터페이스까지 사용해서 또 인터페이스에 대한 학습도 해야하기 때문이다.

이세상 모든건 그게 왜 필요한지를 알면 이해하는데 도움이 많이 된다.

interface라고 쓰는 이 인터페이스는 결론부터 얘기하면 '공동 작업시 충돌을 방지하기 위해서'라고 한다.

다른 많은 이점이 있지만, 처음 내가 배울 당시 인터페이스 사용 이유는 공동 작업을 할때 유연함을 위해서다.

다음과 같은 상황을 생각해보자.

A씨는 필기도구를 사용해서 글씨를 쓰는 프로그램을 개발하는 프로젝트를 진행하고 있다.

그러던 중 같은 팀의 연필을 개발하는 김개발씨와 볼펜을 개발하는 박개발씨에게 '쓴다'라는 기능을 개발하라고 지시했다.

김개발씨의 코드는 다음과 같다.

```java
class Pencil {
    public void Write() {
        System.out.println("연필로 쓴다.");
    }
}
```

박개발씨의 코드는 다음과 같다.

```java
class Ballpoint {
    public void Writing() {
        System.out.println("볼펜으로 쓴다.");
    }
}
```

두 사람에게 개발을 완료했다는 말을 들은 A씨는 당황했다.

각자의 단위에서는 잘 실행이 되지만, 메인 프로그램에 붙여서 사용하자니 서로 이름이 너무 달라서 사용하기에 너무 불편한 것이다.

왜냐면 다음주에 형광펜, 네임펜 등의 필기구에 대해서도 개발을 해야하기 때문에 이대로는 안되겠다 싶었다.

```java
class MainClass {
    public static void main(String[] ar) {
        Pencil pencil = new Pencil();
        BallPoint ballpoint = new Ballpoint();

        pencil.write();
        ballpoint.writing();
    }
}
```

그래서 미안하지만 김개발, 박개발씨에게 다음과 같은 인터페이스를 주며 다시 한 번 개발해달라고 부탁했다.

```java
interface Frindle {
    public void Write();
}
```

그리고나서 개선된 김개발씨의 코드이다.

```java
class Pencil implements Frindle {
    @Override
    public void Write() {
        System.out.println("연필로 쓴다.");
    }
}
```

박개발씨의 코드는 다음과 같다.

```java
class Ballpoint implements Frindle {
    @Override
    public void Write() {
        System.out.println("볼로 쓴다.");
    }
}
```

이로써 A씨는 다음과 같은 메인 클래스를 작성할 수 있게 되었다.

```java
package com.tistory.xxxelppa;

public class MainClass {
    public static void main(String[] ar) {
        Frindle frindle = new Pencil();
        frindle.write();

        frindle = new Ballpoint();
        frindle.write();

    }
}
```

이제는 형광펜으로 써도, 네임펜으로 써도 A씨는 클래스 이름만 알면 된다.

그러면 write라는 메서드를 호출했을 때 어떤 결과를 받아볼 것이라는 기대를 할 수 있게 된다는 장점이 있다.

(더 좋고 유연하게 작성할 수 있겠지만, 지금 당장 생각나는 예제가 이것 뿐이다.)

만약 형광펜으로 쓴다는 기능을 추가한다고 할 때, 이 interface를 상속받아 사용하게 된다면

A씨는 형광펜 클래스 내부에서 어떤 작업을 하는지 모르겠지만, write()를 호출했을 때 형광펜으로 쓴다는 기능을 한다는 것을 기대할 수 있다는 것이다.

다른 여러 장점을 가지고 있지만(인터페이스가), 내가 처음 배울 당시 인터페이스를 사용해야 하는 이유로 공동작업의 예를 들었기 때문에

위와같은 예시를 들어 보았다.
