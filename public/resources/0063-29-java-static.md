static... 스태틱..

자바를 맨 처음 시작하면 보게되는 단어 중 하나인 static이라고 쓰고 스태틱 이라고 읽는 바로 저 스태틱

기계처럼 외워서 쓰게되는 그 문장

public static void main(String[] ar) { ... }

바로 저 스태틱

dynamic의 반대되는 개념이라고도 하는 저 동적이지 못한 static이란 무엇일까

나에게 처음 Hello World 출력의 기쁨(?)을 (사실 그렇게 기쁘진 않았고, 처음 보는건데 당연하다 생각했다..) 선물해준

김승현씨 (열혈강의 Java 프로그래밍의 저자)의 가르침을 더듬어 보았다.

(사실 static도 누군가의 질문이었다)

'그래, static이 정적인건 알겠어, 그래서 뭐. 어떡하라고. 그게 왜. 뭐가 다른데. 이건 어따쓰는데?'

충분히 이해한다 저 마음

개인적으로 느끼기에, 처음 언어를 접하는 대부분의 사람들은

1단계, 굉장한 마음가짐으로 책을 편다.

2단계, 자바란 무엇인가? 에 대해 읽어보며 일단 '객체지향 만세!' 를 외친다.

3단계, 제임스 고스..ㄹ....리...ㅇ.. Zzz... 역사 부분에서 졸기 시작한다.

4단계, 자바를 설치가 실습이므로 여기서 잠이 깨며 열심히 따라한다.

5단계, 이리오너라 이놈의 세상아! Hello World!! 대박 신기하다.

6단계, 몇몇 분들은 5단계에서 그날의 학습을 멈춘다.

7단계, 변수 음.. 그래 그런게 있겠지

8단계, 롸? 배열? 같은 자료형을 묶는다라... 신기하군

9단계, 분기문(if, switch) 반복분(for, while)을 보며 열심히 *을 찍기 시작하며 고통스러워 한다.

10단계, 클래스.. 아 모르겠다 !!

즉, static에 대해 생각할 겨를도 없이 (물론 끝까지 잘 학습하시는 분들도 많이 계시지만)

과제에 허덕이며 열심히 분기와 반복을 하다가 졸업을 한다.

그냥 이클립스가 static이 아닌 것을 static에서 사용할 수 없습니다 !! 라고 하면

아 구래? 그럼 static이라고 쓰지모 ㅎㅎ

어? 쓰니까 에러 안나네? 아싸

이렇게 넘긴 사람이 꽤 있을것이라 생각된다.

서론이 길다..

내가 아는 static에 대해 예시를 들어 설명을 해보려 한다.

사실 바쁜 분들은 여기부터 봐도 된다 ..

내가 학습할 당시의 예시가 너무나 좋다고 생각하기 때문에

그 예시를 들어 보겠다.

이런 경우를 생각해보자,

A라는 사람이 은행에 계좌를 신설했다.

이 때 이율을 0.05% 였다고 하자.

5년이 지나 0.07%로 오르고, 오르자마자 B라는 사람이 계좌를 신설했다.

그리고 3년이 지나 다시 0.03%로 내려갔다라고 하는 상황이라 하자.

이 부분에 있어서 아래와 같은 소스로 관리한다라고 가정을 해보자

```java
class Account {
    private String name;
    private int amount;
    private float iyul;

    public Account(String name, int amount, float iyul) {
        this.name = name;
        this.amount = amount;
        this.iyul = iyul;
    }

    public void disp() {
        System.out.println("이름 : " + this.name + " , 돈 : " + this.amount + ", 이율 : " + this.iyul);
    }
}
public class Exam_001 {
    public static void main(String[] ar) {
        //AAA 신설
       Account p1 = new Account("AAA", 10000, 0.07f);
       p1.disp();
       System.out.println();

        // 5년 뒤 BBB신설
        Account p2 = new Account("BBB", 20000, 0.05f);
        p1 = new Account("AAA", 10000, 0.05f);
        p1.disp();
        p2.disp();

        System.out.println();
        //3년 뒤 이율 업데이트
        p1 = new Account("AAA", 10000, 0.03f);
        p2 = new Account("BBB", 10000, 0.03f);
        p1.disp();
        p2.disp();
    }
}
```

아 물론 뭐라하실 것 같다.
급해서 저렇게 만들었다.
그래도 static에 대해 전달하는데 지장이 없을거라 생각해서 급한김에 작성한 소스라 부끄럽지만 아무튼 그렇다
(이율 업데이트를 getter, setter를 작성하면 너무 길어질 것 같아서, 새로 만들어 덮어써서 할당하는 것으로 만들었으니 양해를..)

아무튼, 위와같은 방식으로 이율을 업데이트 한다면 어떨까?
지금은 두명이기 때문에 그렇지 은행을 이용하는 고객이 두명이라면 그게 은행일지 생각해보길 바란다.

수천 수만명이 이용하는 은행인데, 이율이 바뀔 때마다 저렇게 업데이트를 사람마다 해줘야 한다면
나라면 살고싶지 않을 것 같다.

그래서 스태틱이 필요하다.
#### static으로 선언한 변수는 동일 클래스로 만들어진 객체라면 동일한 곳을 바라본다라고 생각하면 될 것이다.
사실 굵게 쓴 저 한줄이 static의 핵심이다.

조금 더 자세한 설명을 더한다면,
자바 메모리는 크게 네 부분으로 구분해 볼 수 있다.
1. constant 영역
2. GC (Garbage Collection)에 의해 관리되는 Heap 영역
3. Runtime Stact 영역
4. 레지스트리 영역
여기서 static으로 선언한 변수는 "​**프로그램 실행시에 constant영역에 할당되고 프로그램 종료시에 해제된다.​**"
라고 알고 있다.
눈치가 빠른 분들은 눈치 채셨겠지만, 이러한 특성 덕분에 static으로 선언하면
"​**해당 클래스의 객체가 생성되지 않아도 클래스 이름으로 static자원에 접근이 가능하다.**​" 라는
어마무시한 얘기까지 포함된다.

그래서 static은 자기 자신만의 고유한 초기화 영역을 가질 수 있다.
멤버필드 영역에 static { }
이렇게 작성하여 따로 초기화 시켜주기도 하는데, 이 부분은 별게(?) 아니기 때문에 금방 찾아볼 수 있을 것이다.
 프로그램 시작시 static { } 선언부를 먼저 실행한다.

그래서 위의 소스 코드를 아래와 같이 static을 써서 고쳐볼 수 있다.

```java
class Account {
    private String name;
    private int amount;
    static float iyul;

    public Account(String name, int amount) {
        this.name = name;
        this.amount = amount;
    }

    public void disp() {
        System.out.println("이름 : " + this.name + " , 돈 : " + this.amount + ", 이율 : " + iyul);
        //  System.out.println("이름 : " + this.name + " , 돈 : " + this.amount + ", 이율 : " + Account.iyul);
    }
}
public class Exam_001 {
    public static void main(String[] ar) {
        //Account 블래스의 iyul값 설정
        Account.iyul = 0.07f;

        //AAA 신설
        Account p1 = new Account("AAA", 10000);
        p1.disp();
        System.out.println();

        // 5년 뒤 BBB신설
        Account.iyul = 0.05f;
        Account p2 = new Account("BBB", 20000);

        p1.disp();
        p2.disp();

        System.out.println();
        //3년 뒤 이율 업데이트
        Account.iyul = 0.03f;
        p1.disp();
        p2.disp();
    }
}
```

얼마나 간단하고 편해보이는가,

실제로 소스를 실행해보면 알겠지만 클래스의 이름으로 접근하여 수정한 static변수인 iyul은
p1, p2객체로 접근하여 실행시키는 disp() 결과를 확인해보면
동일하게 수정되는것을 확인해볼 수 있다.

스태택이란 이런 것이라는것에 대해 감이 잡혔을 것이다.
(여기까지 참고 실습해가며 읽었다면)

몇가지 사실에 대해 더 얘기하려한다.
그 시절의 기억을 더듬어보면 static이란 동일 클래스로 만들어진 객체라면 **네 것 내 것**이 없는 녀석이다.
동일 클래스로 만들어진 객체라면 모두가 ​**공유해서 사용**​한다는 것이다.

역시 눈치 빠른 사람들은 저 말에서 중요한 사실 하나를 캐치했을 것이다.
그렇다, static은 this가 없다.
this는 자기 자신을 가리키는 것인데, static은 공유해서 사용하기 위한 것이기 때문에 this개념이 없다.

그렇기 때문에, 이 글의 서두에서 언급한
#### 그냥 이클립스가 static이 아닌 것을 static에서 사용할 수 없습니다 !! 라고 하면
#### 아 구래? 그럼 static이라고 쓰지모 ㅎㅎ
#### 어? 쓰니까 에러 안나네? 아싸
​이게 이해가 되어야 한다.

물론 static이 아닌 곳에서 static을 쓰는것은 당연히 되고
static에서 non static을 사용하지 못한다고 했는데, 사용할 방법이 있다.
그것은 바로 객체를 생성하여 ​**객체를 통해 사용**​하는 것,

아무튼 말이 너무 길어졌는데, static에 대해서는 이제 감이 잡혔을 것이라 생각한다.(제발)
this와 static에 대해서도 좀 더 언급 하고 싶지만,
너무 길어지기 때문에 이쯤에서 마무리 하고 다음에 생각날 때 다루려고 한다.

(사실 그렇게 대단한건 없다.. 어쩌면 내가 아직 몰라서 대단해 보이지 않는 것일수도 있다)

다음번엔 장황하지 않게 잘 풀어나가봐야겠다.
