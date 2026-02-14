자바 애플리케이션이 동작하는 관점에서의 원자단위라고 생각되는 클래스라는 것의 개념에 대해 정리해보려 한다.

지난번 제네릭에 대해 알아볼 때 살짝 언급되었던 적이 있었다.

*[(java 제네릭 (Generic), 내가 알아보기 쉽게 정리 - 1편, 왜 제네릭)](http://xxxelppa.tistory.com/34)*

사실 클래스라는 것에 도달하기 위해서 거쳐가야할 개념들이 좀 있다.

쭉 나열해보자면 대강 '상수' -> '변수' -> '배열' -> '구조체' -> '클래스' 이렇다고 할 수 있다.

우선 자바에서 상수는 아래처럼 사용할 수 있다.

```java
public class Example {
    public static final int NUMBER = 10;
    public static void main(String[] ar) {
        System.out.println(NUMBER);
    }
}
```

일반적으로 알고있는 숫자도 하나가 하나의 의미를 갖는 상수로 사용하고 사용할 수 있지만

상수가 아닌 것을 상수로 사용하기 위해 자바에서는 3라인에서 작성한 것과 같이 final 예약어를 사용해서 상수화 시켜준다.

만약 아래처럼 새로운 값을 넣으려고 하면 에러가 발생한다.

```java
public class Example {
    public static final int NUMBER = 10;
    public static void main(String[] ar) {
        System.out.println(NUMBER);
        NUMBER = 20;
        System.out.println(NUMBER);
    }
}
```

![0068-37-java-core-concepts-summary-img-01.png](/tech-blog/resources/images/migration/0068-37-java-core-concepts-summary/img-01.png)

final 변수 NUMBER에 값을 assign (할당) 할 수 없다는 에러를 보여준다.

이렇게 고정된 값을 사용하다보니 아래 소스와 같은 문제가 생기게 되었다.

*(물론 이렇게 사용하는 사람은 없겠지만)*

```java
public class Example {
    public static final int NUMBER_1 = 1;
    public static final int NUMBER_2 = 2;
    public static final int NUMBER_3 = 3;
    public static final int NUMBER_4 = 4;
    public static final int NUMBER_5 = 5;

    public static void main(String[] ar) {
        System.out.println(NUMBER_1);
        System.out.println(NUMBER_2);
        System.out.println(NUMBER_3);
        System.out.println(NUMBER_4);
        System.out.println(NUMBER_5);
    }
}
```

다소 극단적일 수 있지만, 나는 그저 1부터 5까지의 숫자를 출력하고 싶었을 뿐인데

각각의 숫자를 표현하기 위해 너무 많은 자원이 소모되기도 하고

만약 나중에 100개의 수를 출력하고 싶다면? 더 나아가 ***1,000개 10,000개의 숫자를 출력***한다고 생각해보자.

우리에게 훌륭한 ctrl + c, ctrl + v 가 있다고는 하지만 너무 고통스러운 작업이 될것이다.

그래서 어떡하면 보다 편하고 효율적으로 만들수 있을까 생각하다보니 변수의 개념이 도입된 것이다.

```java
public class Example {
    public static int number;

    public static void main(String[] ar) {
        number = 1;
        System.out.println(number);
        number = 4000;
        System.out.println(number);
    }
}
```

위의 소스와 다른점이 있다면 7라인과 9라인에서 number라는 동일한 값을 출력하는데 서로 다른 결과가 나온다는 것이다.

그 이유는 너무나 잘 알겠지만, 6라인과 8라인에서 number라는 변수의 값을 바꿔주었기 때문이다.

상수를 사용했을 경우와 비교해서 ​***하나의 변수에 서로 다른 값들을 할당하여 표현​***하며 ​***재사용​***하고 있음을 주목해야 한다.

이제 더이상 여러 값을 표현하기 위해 그 수만큼의 상수를 만들 핊요가 없어졌다.

그렇게 변수를 사용해서 코딩을 열심히 하던 감자바씨는 친구 좀해조씨가 자신의 시험 성적을 입력하면 총점을 구해주는 프로그램을 하나 만들어 달라고 해서 열심히 코딩을 했다.

```java
import java.util.Scanner;

public class Example {
    public static void main(String[] ar) {
        Scanner sc = new Scanner(System.in);
        int sub_1 = 0;
        int sub_2 = 0;
        int sub_3 = 0;
        int tot = 0;

        System.out.print("첫 번째 과목 점수 : ");
        sub_1 = sc.nextInt();
        System.out.print("두 번째 과목 점수 : ");
        sub_2 = sc.nextInt();
        System.out.print("세 번째 과목 점수 : ");
        sub_3 = sc.nextInt();

        tot = sub_1 + sub_2 + sub_3;

        System.out.println("총점 : " + tot);

    }
}
```

![0068-37-java-core-concepts-summary-img-02.png](/tech-blog/resources/images/migration/0068-37-java-core-concepts-summary/img-02.png)

자신이 직접 무언가를 만들어냈다는 뿌듯함에 심취해있던 감자바씨의 기분에 갑자기 좀해조씨가 찬물을 끼얹었다.

"자바야 나 사실 이번 시험에서 3과목이 아니고 5과목을 봤는데 어떻게 해야해?"

그래서 감자바씨는 아래와 같이 수정했다.

```java
import java.util.Scanner;

public class Example {
    public static void main(String[] ar) {
        Scanner sc = new Scanner(System.in);
        int sub_1 = 0;
        int sub_2 = 0;
        int sub_3 = 0;
        int sub_4 = 0;
        int sub_5 = 0;
        int tot = 0;

        System.out.print("첫 번째 과목 점수 : ");
        sub_1 = sc.nextInt();
        System.out.print("두 번째 과목 점수 : ");
        sub_2 = sc.nextInt();
        System.out.print("세 번째 과목 점수 : ");
        sub_3 = sc.nextInt();
        System.out.print("네 번째 과목 점수 : ");
        sub_4 = sc.nextInt();
        System.out.print("다섯 번째 과목 점수 : ");
        sub_5 = sc.nextInt();

        tot = sub_1 + sub_2 + sub_3 + sub_4 + sub_5;

        System.out.println("총점 : " + tot);

    }
}
```

![0068-37-java-core-concepts-summary-img-03.png](/tech-blog/resources/images/migration/0068-37-java-core-concepts-summary/img-03.png)

감자바씨가 좀해조씨에게 전해준 소스는 완벽(?)하게 좀해조씨의 요구를 만족했다.

그런데 문제는 학기말고사에 터지고야 말았다.

"감자바야 이번에 내가 메꿔야할 학점이 많아서 과목을 좀 많이 수강했는데, 놀라지말고 들어

52과목에 대한 총점을 알아야하는데, 이번에도 부탁해도 될까?"

순간 감자바씨의 머릿속에서 지난번 소스코드가 기억나면서 울상이 되어버렸다.

"그까짓꺼 금방하지!" 라고 큰소리는 쳤는데 마땅한 대안이 없는 감자바씨는 고민에 빠진다.

그러던중 기적처럼 며칠전 수업시간에 들은 배열이라는것이 생각났다.

```java
import java.util.Scanner;

public class Example {
    public static void main(String[] ar) {
        Scanner sc = new Scanner(System.in);
        int[] sub_score = new int[12];
        int tot = 0;

        for(int i = 0; i < sub_score.length; ++i) {
                   System.out.print((i+1) + " 번째 과목 점수 : ");
            sub_score[i] = sc.nextInt();
            tot += sub_score[i];
        }

        System.out.println("총점 : " + tot);

    }
}
```

![0068-37-java-core-concepts-summary-img-04.png](/tech-blog/resources/images/migration/0068-37-java-core-concepts-summary/img-04.png)

*(52개는 너무 많아서 12개로 줄여서 예제를 작성해보았다.)*

이제 배열을 사용해서 아주 간결한, 더 많은 과목에 대한 총점을 구하고 싶으면 간단히 배열의 크기를 조절하는 것으로 유연한 코드가 완성 되었다.

감자바씨는 만족만족 하며 소스를 들고 좀해조씨에게 갔다.

그런데 곧 울상인 좀해조씨를 마주쳤다.

그 이유를 들어보니 요노마가 갑자기 여러명의 학생에 대해 총점뿐만 아니라 평균도 알고싶고 등수도 알고 있다라는거다.

배열은 동일한 자료형에 대해서만 묶을 수 있다는 사실을 알고있는 감자바씨는 또다시 고민에 빠진다.

안그래도 짱구 굴리느라 머리가 지끈거리는데 좀해조씨가 정적을 깨고 속을 뒤집는다.

옆동네 사는 '씨개발'씨는 구조체인가 뭔가 써가지고 학생별로 묶어서 점수를 관리한다는데 우리도 그렇게 하면 안되냐며 독촉을 한다.

열이받은 감자바씨, '구조체는 자바에 없단말야!' 그렇다 자바에는 구조체가 없다.

그래서 자바언어도 보여줄수는 없지만, 그 개념은 이렇다.

동일한 자료형에 대해 묶음으로관리할 수 있도록 해주는게 배열이었다면,

서로 다른 자료형에 대해서도 묶음으로 관리할 수 있도록 해주는게 구조체이다.

```java
struct 구조체의 이름 {
  멤버 변수;
};
```

참고 용도로만 작성해 본다면 위와 같이 생긴게 구조체이다.

지금 우리가 처한 상황에 대입시킨다면 아래와 같은 구조체를 선언할 수 있다.

```c++
typedef struct _scoreInfo{
    char sub_score[52];
    double avg;
} scoreInfo;
```

여기서 구조체를 다루기엔 범위가 아니므로 지금은 그저

'구조체라는건 서로 다른 데이터 타입에 대해서도 하나의 묶음으로 관리할 수 있도록 해놓은 것' 정도로 기억하면 될 것 같다.

좀해조씨의 구조체 발언에 번뜩 자바에서의 클래스가 생각이 난 감자바씨.

좀해조씨의 짜증섞인 말투를 뒤로한 채 집으로 향했다.

```c++
import java.util.Scanner;

public class Example {
    public static void main(String[] ar) {
        Scanner sc = new Scanner(System.in);
        Student[] stdnt;
        int subCnt = 0;

        System.out.print("학생 수를 입력 하세요 : ");
        stdnt = new Student[sc.nextInt()];

        System.out.print("과목 수를 입력 하세요 : ");
        subCnt = sc.nextInt();

        for(int i = 0; i < stdnt.length; ++i) {
            stdnt[i] = new Student(subCnt);
        }
    }
}
class Student {
    private int[] sub_score;
    private int tot;
    private double avg;

    public Student(int subCnt) {
        sub_score = new int[subCnt];
        tot = 0;
        avg = 0.0;
    }
}
```

감자바씨는 집에 오자마자 짐도 풀지 않고 컴퓨터에 앉았다.

우선 감자바씨는 위와같이 틀을 잡았다.

21라인에서 학생의 과목별 점수와 총점 그리고 평균을 관리하는 Student 클래스를 선언한다.

이 Student 클래스는 매개변수가 1개인 생성자만 가지고 있는데, 이 매개변수만큼 sub_score 배열을 생성한다.

*(sub_score 배열은 과목별 점수를 저장할 배열이다.)*

학생 수와 과목의 수는 5라인의 main 메서드 안에서 사용자로부터 입력을 받고

16라인의 반복문을 통해 Student 타입의 배열 stdnt에 Student 객체를 생성하고 있다.

이번 포스팅에서 전달하고 싶은건 클래스의 개념이기 때문에 바로 소스코드를 작성하지 않고 이어서 설명을 더하자면

클래스는 서로 다른 데이터 타입과 그 데이터를 조작하는 행위들의 묶음,

즉 ​***자료와 행위(메서드)의 묶음​***이라고 생각할 수 있다.

여기서 오해를 하면 안되는 부분이 있다.

흔히 일반 서적에서 말하는 붕어빵과 붕어빵 틀을 빗대어 클래스와 객체를 설명하는데

아주아주 개인적인 입장에서 이 설명을 그리 좋아하지 않는다.

*(그렇다고해서 나에게 적절한 설명 방법이 있는건 아니다... 쭈굴)*

이렇게 생각하면 조금 더 편하게 전달될지 모르겠다.

클래스는 우리가 일상생활에서 볼 수 있는 개념들*(티비, 자동차, 동물 등등)*을 ***추상화시킨 것***이다.

그러니까 예를 들어 사람이라는 Person 클래스를 작성한다고 하자.

유명인사를 예로 들어보자.

사람중에는 박지성, 김연아, 박찬호, 손흥민 등등 이 있다.

이들의 공통점이 무엇일까? 너무나 당연하게도 (위에서 언급 했으니까 다른 답은 없길 바라며) ***사람이라는 거다***.

이것이 바로 추상화다.

***공통적인 속성을 이끌어 내는 것.***

그렇다면 이 사람이 가지는 속성은 무엇이 있을까?

엄청나게 많겠지만 이름, 나이, 키, 몸무게, 발사이즈 등등이 있을것이다.

그러면 표현하면 된다!

```c++
class Person {
    private String name;
    private int age;
    private double tall;
    private double weight;
    private double shoeSize;
}
```

이렇게 하면 ***​내가 사용하고자 하는 속성을 포함시킨 사람이라는 추상화된 개념을 클래스로 표현한 것​***이다.

모든 속성을 다 표현하기도 어려울 뿐만 아니라 다 쓰지도 못할거다.

여기까지라면 C언어에서의 구조체가 가지는 개념과 동일한 기능을 한다고 생각하면 된다.

하지만 클래스에는 구조체와 달리 ​***행위라는 것​***을 더 가질 수 있다.

여기서 행위는 메서드를 뜻한다.

사람이 할 수 있는 행위에 무엇이 있을까?

걷는것, 뛰는것, 점프하는것, 무언가를 잡는것 등등이 있을것이다.

그러면 뭐다? 메서드를 추가하면 된다.

```c++
class Person {
    private String name;
    private int age;
    private double tall;
    private double weight;
    private double shoeSize;

    public double walk(double speed, double time) {
        double distance = 0.0;
        distance = speed * time;
        return distance;
    }
}
```

너무 길어질 것 같아서 걷는것만 추가해보았다.

클래스라는 것이 참 간단하지 않은가?

그럼 여기서 하나 더,

이렇게 추상화시킨 개념적 틀을 만들어 놓으면 끝일까?

아니다, 써먹어야 한다.

위에서 언급한 '***사람에는 박지성, 김연아, 박찬호, 손흥민 등이 있다.***' 라고 한 부분에서

우리는 지금 ***사람***을 만든것이다.

그럼 이제 박지성, 김연아, 박찬호, 손흥민을 만들어 보자.

```c++
public class ClassExample {
    public static void main(String[] ar) {
        Person parkJiSung = new Person();
    }
}

class Person {
    private String name;
    private int age;
    private double tall;
    private double weight;
    private double shoeSize;
    public double walk(double speed, double time) {
        double distance = 0.0;
        distance = speed * time;
        return distance;
    }
}
```

역시 너무 길어져서 박지성 객체만 만들어 보았다.

4라인에서 만든 것이 바로 ​사람 이라는 ***추상적 개념을 표현한 Person 클래스 타입, 형태를 가지는 parkJiSung (박지성) 객체를 생성한 부분***​이다.

이렇게 클래스를 객체화*(다른 곳에서는 이것을 인스턴스화 라고도 하더라)*해야 사용할 수 있게 되는 것이다.

좀 더 자세히 설명하면,

4라인을 두 부분으로 나누어 볼 수 있다.

```c++
Person parkJiSung;
parkJiSung = new Person();
```

2라인은 Person 타입의 parkJiSung 이라는 이름의 변수를 선언한 것이고

3라인은 ​***Person 객체를 생성해서 2라인에 선언한 parkJiSung 변수에 할당​***해주고 있는 부분이다.

여기까지 길지만 잘 따라왔다면 클래스가 왜 생겼으며 무엇인지, 그리고 객체와 무엇이 다른지 충분히 알것이라고 생각한다.

그럼 마지막으로 아까 작성하던 학생별 시험 점수를 관리하는 프로그램 소스를 *(생각나는대로 작성한..)* 첨부하고 마무리 해야겠다.

```c++
import java.util.Scanner;

public class Example {
    public static void main(String[] ar) {
        Scanner sc = new Scanner(System.in);
        Student[] stdnt;
        int subCnt = 0;

        System.out.print("학생 수를 입력 하세요 : ");
        stdnt = new Student[sc.nextInt()];

        System.out.print("과목 수를 입력 하세요 : ");
        subCnt = sc.nextInt();

        for(int i = 0; i < stdnt.length; ++i) {
            stdnt[i] = new Student(subCnt);
        }

        System.out.println();
        for(int i = 0; i < stdnt.length; ++i) {
            System.out.println(">>>>> " + (i+1) + "번째 학생 점수 입력");
            stdnt[i].inputScore();
                System.out.println();
        }

    System.out.println(">>>>> 계산중");
    System.out.println();
    for(int i = 0; i < stdnt.length; ++i) {
        stdnt[i].calcTotAvg();
    }

    System.out.println(">>>>> 결과 출력");
    for(int i = 0; i < stdnt.length; ++i) {
        System.out.println(">>>>> " + (i+1) + "번째 학생 총점과 평균");
        System.out.println("총점 : " + stdnt[i].getTot());
        System.out.println("평균 : " + stdnt[i].getAvg());
        System.out.println();
    }
    }
}
class Student {
    private Scanner sc;
    private int[] sub_score;
    private int tot;
    private double avg;

    public int getTot() { return this.tot; }
    public double getAvg() { return this.avg; }

    public Student(int subCnt) {
        sc = new Scanner(System.in);
        sub_score = new int[subCnt];
        tot = 0;
        avg = 0.0;
    }

    public void inputScore() {
        for(int i = 0; i < sub_score.length; ++i) {
            System.out.print((i+1) + "번째 과목 점수 : ");
            sub_score[i] = sc.nextInt();
        }
    }

    public void calcTotAvg() {
        for(int i = 0; i < sub_score.length; ++i) {
            tot += sub_score[i];
        }
        avg = (double)tot /  (double)sub_score.length;
    }
}
```

너무 생각나는대로 쓴것 같기도하고...

format을 적용해서 소숫점 정리라도 할껄 그랬나..

머암튼 아래는 실행 결과다.

![0068-37-java-core-concepts-summary-img-05.png](/tech-blog/resources/images/migration/0068-37-java-core-concepts-summary/img-05.png)

만드는 방법은 다양할거니까 .. ?!
