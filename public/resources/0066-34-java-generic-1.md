오늘의 주인공 java의 Generic

우선 가볍게? 정의 부터 찾아보자. 뭐든지 그 정의가 가장 중요하다.

![0066-34-java-generic-1-img-01.png](/tech-blog/resources/images/migration/0066-34-java-generic-1/img-01.png)

출처] 네이버 어학사전

그렇다면 프로그래밍에서의 Generic은 어떻게 정의되어 있는지 찾아보았는데 '제네릭은 뭐다." 이렇게 깔끔하게 딱 떨어지는 정의는 마땅히 찾지 못하고, 가장 잘 설명한 문장을 찾았다.

제네릭은 *'클래스 내부에서 사용할 데이터 타입을 외부에서 지정하는 기법'*이다.

그러면 왜 클래스 내부에서 사용할 데이터 타입을 밖에서 지정해주자는 것일까?

그래서 준비했다.

아래 상황을 살펴보자.

자바를 너무 좋아하는 촉이 좋은 '감자바'씨는 친구 '좀해조'씨로부터 두개의 숫자를 출력 하는 프로그램을 만들어 달라는 요청을 받았다.

그래서 우리 감자바씨는 흔쾌히 만들어주겠다고 하며 두팔 걷어부치고 코딩을 했다.

```java
public class GenericExample {
    public static void main(String[] ar) {
        calc cp = new calc(13, 17);
        cp.print();
    }
}

class calc {
    private int num1;
    private int num2;
    calc() { }
    calc(int num1, int num2) {
        this.num1 = num1;
        this.num2 = num2;
    }
    public void print() {
        System.out.println("num1 : " + num1);
        System.out.println("num2 : " + num2);
    }
}
```

이클립스 켜는 시간 포함 3분만에 뚝딱 만들어낸 감자바씨는 친구에게 소스를 보내줬다.

몇분이나 지났을까 친구 좀해조씨가 에러가 난다고 연락이 왔다.

그럴리 없다고 난색을 표하는 감자바씨

알고보니 이친구가 소스를 아래와 같이 고쳐서 돌리고 있었다.

```java
public class GenericExample {
    public static void main(String[] ar) {
        calc cp = new calc(13.2, 17.3);
        cp.print();
    }
}

class calc {
    private int num1;
    private int num2;
    calc() { }
    calc(int num1, int num2) {
        this.num1 = num1;
        this.num2 = num2;
    }
    public void print() {
        System.out.println("num1 : " + num1);
        System.out.println("num2 : " + num2);
    }
}
```

![0066-34-java-generic-1-img-02.png](/tech-blog/resources/images/migration/0066-34-java-generic-1/img-02.png)

좀해조씨 얘기를 들어보니

자기는 소수점도 출력해야 하는데 감자바 네녀석이 정수만 출력할 수 있게 해놨다 이거다.

부탁하는 입장에 짜증을 내자 화가난 감자바씨

다시 마음을 추스리고 어떻게 해야할지 고민에 빠진다.

그러다 수업시간에 제네릭에 대해 얼핏 들은걸 기억해낸 감자바씨는 급히 소스 수정에 들어간다.

최종 수정본은 아래와 같다.

```java
public class GenericExample {
    public static void main(String[] ar) {
        calc<Integer> cp1 = new calc<Integer>(13, 17);
        calc<Double> cp2 = new calc<Double>(13.2, 17.3);
        cp1.print();
        cp2.print();
    }
}

class calc<T> {
    private T num1;
    private T num2;
    calc() { }
    calc(T num1, T num2) {
        this.num1 = num1;
        this.num2 = num2;
    }
    public void print() {
        System.out.println("num1 : " + num1);
        System.out.println("num2 : " + num2);
    }
}
```

이제 출력하고 싶은게 있으면 3, 4번 라인을 수정해서 원하는 타입을 넣으면 뭐든 출력할 수 있을거라고 전해주었다.

이게 바로 제네릭이다.

*(너무 뜬금없이 결론이 나왔나..?)*

우선 그 얘기부터 시작해보자.

변수라는 개념이 생겨난 배경에 대해 혹시 알고 있을까?

상수를 표현하기 위해서는 상수가 달라질 때마다 계속 상수를 추가해서 써야만 했을 것이다.

그래서 나온 것이 변수이다.

변수, 수가 변한다는 것이다. 공간은 하나인데 그 공간을 다양한 수가 공유를 하며 이값도 넣고 저값도 넣고

그렇다보니 너무 중구난방이라 일정한 타입의 개념으로 묶어 변수를 만들었다.

그게 정수형은 int, 실수형은 float, 문자열은 String ... 등의 타입으로 구분을 한 것이다.

그런데 이렇게 만들어놓고 보니, 간단한 예시로, 성적처리를 할 때

과목수가 많아지면 int kor, eng, math, history, ... 너무 많아지더라는 것이다.

행여나 나중에 과목이라도 하나 추가가 된다면

총점을 구하고 평균을 구하는 곳에 생각할 부분이 너무 많아지고 관리가 힘들고 소스는 길어지는 문제가 있는 것이다.

그래서 나온 개념이 바로 배열이다.

동일한 자료형에 대해서 하나의 변수로 묶어 관리하는 것.

그것이 바로 배열이다.

배열이 나온 이후로 이제 과목점수를

int[] subjectScore = new int[10];

이렇게 10과목을 선언하고, 총점을 구할때도

kor + eng + math ...

이런게 아니고

for(int i = 0; i < subjectScore.length; ++i) { sum += subjectScore[i]; }

이런 식으로 과목이 몇개가 추가되어도 간단하게 수정할 수 있게 된 것이다.

하지만 또 고민이 생겼다.

이렇게 과목별 점수를 관리하는건 배열이 생겨서 쉬워졌는데..

특정 학생 단위로 묶어서 과목별 점수와 총점 평균을 관리하려다보니

평균에서 실수형 자료형이 나오면서 하나의 배열로 묶을 수 없게 된 것이다.

심지어는 학생 단위로 묶으면 그 학생에 대한 기본 정보도 있어야 누구의 점수인지 구별을 한텐데..

그래서 나온 개념이 자바의 클래스 이다.

클래스는 서로 다른 자료형에 대해서 *(+ 그 자료를 조작하는 메서드도)* 하나의 묶음으로 관리할 수 있는 개념인 것이다.

그래서 이제 클래스라는 강력한 개념을 가지고 일상생활에서의 문제를 해결할 수 있게 되었는데,

자꾸 쓰다보니 또 뭔가 불편해진 것이다.

뭐가 불편한가.. 고민을 해봤더니 이게 웬걸

소스가 계속 중복되고 있던 것이다.

그것도 자료형이 다르다는 이유 하나만으로.

다시 위에 작성한 감자바씨의 최초 소스를 보자.

int라는 자료형에서 double이라는 자료형으로 다루는 데이터 타입이 바뀌면

만약 제네릭이라는 개념이 없었다면 실수형에 대한 처리를 하는 부분을 어떻게든 따로 하나 더 만들었어야 했을 것이다.

캐스팅을 한다면? 이라고 생각할지 모르겠지만, 그건 데이터 손실을 가져오기 때문에 추천할만한 방법은 아니다.

즉, 제네릭도 **"​중복되는 소스를 하나로 묶어 소스코드의 재사용성을 더욱 극대화 하기 위해​"** 생겨난 것이다.

휴,

배보다 배꼽이 더 커진 느낌이지만

제네릭이란것이 왜 생겨났는지 그 이유를 알아야 '어디에 써먹을지' 감이 올것이기 때문에

주저리주저리 설명이 길어졌다.

제네릭의 사용 문법에 대해서는 2편을 따로 작성해야겠다.

[*(java 제네릭 (Generic), 내가 알아보기 쉽게 정리 - 2편, 어떻게 제네릭)*](http://xxxelppa.tistory.com/35)
