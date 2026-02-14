java 개발을 하려면 환경변수를 설정해야한다.

아니 더 정확히는 명령 프롬프트에서 컴파일하고 실행하려면 환경변수를 설정해야 한다.

명령 프롬프트는 cmd창으로 알고 있는 보통 검정색 있어보이는 화면을 말한다.

우선 환경변수라는것이 무엇인지부터 알아보자.

<table>
<tbody>
<tr>
<td>IT(정보기술)&nbsp;용어로,&nbsp;OS의&nbsp;셸(shell)&nbsp;등에&nbsp;설정되어&nbsp;있다.&nbsp; <br>변수의&nbsp;이름과&nbsp;의미는&nbsp;미리&nbsp;정해져&nbsp;있기&nbsp;때문에&nbsp;환경변수를&nbsp;읽으면&nbsp;시스템의&nbsp;설정을&nbsp;어느&nbsp;정도&nbsp;알&nbsp;수&nbsp;있다. <br><br>OS의&nbsp;환경변수는&nbsp;시스템의&nbsp;실행파일이&nbsp;놓여&nbsp;있는&nbsp;디렉토리의&nbsp;지정&nbsp;등&nbsp;OS&nbsp;상에서&nbsp;동작하는&nbsp;응용소프트웨어가&nbsp;참조하기&nbsp;위한&nbsp;설정이&nbsp;기록된다.&nbsp;응용소프트웨어로부터는&nbsp;시스템&nbsp;콜(system&nbsp;call:프로그래밍&nbsp;언어에서&nbsp;지원하지&nbsp;않는&nbsp;기능에&nbsp;대하여&nbsp;운영체계의&nbsp;루틴을&nbsp;호출하여&nbsp;이용하는&nbsp;것)이나&nbsp;OS의&nbsp;표준&nbsp;API&nbsp;등을&nbsp;통하여&nbsp;간단히&nbsp;값을&nbsp;얻을&nbsp;수&nbsp;있도록&nbsp;되어&nbsp;있다. <br><br>또한&nbsp;웹&nbsp;브라우저의&nbsp;내부&nbsp;데이터의&nbsp;일부를&nbsp;환경변수라고&nbsp;하는&nbsp;경우도&nbsp;있는데,&nbsp;이것은&nbsp;HTTP를&nbsp;요청할&nbsp;때&nbsp;송신되는&nbsp;것으로,&nbsp;브라우저의&nbsp;종류나&nbsp;링크되어&nbsp;있는&nbsp;웹&nbsp;페이지&nbsp;등&nbsp;웹&nbsp;서버가&nbsp;웹&nbsp;브라우저에&nbsp;대하여&nbsp;최적의&nbsp;처리를&nbsp;하기&nbsp;위해&nbsp;송신되는&nbsp;것이다.&nbsp;HTTP를&nbsp;요청하는&nbsp;응용소프트웨어는&nbsp;모두&nbsp;환경변수를&nbsp;송신하고&nbsp;있다고&nbsp;할&nbsp;수&nbsp;있다. <br><br>사용자가&nbsp;의도적으로&nbsp;변환할&nbsp;수&nbsp;있는&nbsp;환경변수도&nbsp;많으며,&nbsp;특히&nbsp;웹&nbsp;브라우저에서는&nbsp;자신의&nbsp;정체를&nbsp;숨길&nbsp;목적으로&nbsp;브라우저&nbsp;등의&nbsp;변수를&nbsp;변환하는&nbsp;경우도&nbsp;있다. <br><br>그러나&nbsp;사실과&nbsp;다른&nbsp;값을&nbsp;환경변수에&nbsp;설정하면&nbsp;그&nbsp;환경변수를&nbsp;사용하고&nbsp;있는&nbsp;서버나&nbsp;응용소프트웨어가&nbsp;올바르게&nbsp;작동하지&nbsp;않을&nbsp;수&nbsp;있다.&nbsp;특히,&nbsp;셸의&nbsp;환경변수를&nbsp;변환했을&nbsp;경우에는&nbsp;심각한&nbsp;오작동을&nbsp;일으킬&nbsp;수&nbsp;있기&nbsp;때문에&nbsp;이를&nbsp;취급하는&nbsp;경우에는&nbsp;주의가&nbsp;필요하다.&nbsp;</td>
</tr>
</tbody>
</table>

위 본문은 네이버 검색을 통해 가져온 내용이다.

위 본문을 읽어도 잘 모르겠다면,

"여기여기에(사용할 것들이있는 위치) 있는 것들을 내가 사용할건데, 미리 쓰기 편하게 등록해 놓는거야"

정도로 생각해도 될 것 같다.

환경변수를 설정하기 위해서는 설정하는 곳으로 가야한다.

![0064-32-java-environment-variables-guide-img-01.png](/tech-blog/resources/images/migration/0064-32-java-environment-variables-guide/img-01.png)

[내 컴퓨터]를 마우스 우클릭을 해서 속성을 클릭한다.

혹은 키보드의 윈도우키와 오른쪽 위에 pause/break 키를 동시에 눌러주면 바로 아래 이미지와 같은 화면이 뜬다.

![0064-32-java-environment-variables-guide-img-02.png](/tech-blog/resources/images/migration/0064-32-java-environment-variables-guide/img-02.png)

새로 뜬 화면의 좌측에 있는 '고금 시스템 설정' 을 클릭한다.

![0064-32-java-environment-variables-guide-img-03.png](/tech-blog/resources/images/migration/0064-32-java-environment-variables-guide/img-03.png)

그리고 뜬 화면의 아래쪽에 '환경 변수' 를 클릭하면 바로 위 이미지의 앞쪽에 뜬 팝업이 하나 더 뜬다.

바로 이곳에서 환경변수를 설정할 수 있다.

바로 위의 그림에 보이는 것처럼 등록할 수 있는 영역이 두군데가 있다.

1. 특정 사용자에 대한 사용자 변수

2. 시스템 변수

사실 말이 특정 사용자이지, 로그온 되어있는 현재 사용자 계정에서만 사용하려면 1번의 위치에 등록을 시키고

이 컴퓨터를 사용하는 모든 사용자 계정에 대해 동일한 환경변수를 설정하려면 2번의 위치에 등록을 하면 된다.

그리고 java에서 설정하는 환경변수는 두가지 종류가 있다.

PATH와 CLASSPATH이다.

PATH는 실행 프로그램의 위치만을 나타내며

CLASSPATH는 실행 프로그램에서 사용하는 라이브러리의 위치를 나타낸다.

그래서 PATH는 java에서 사용할 실행 프로그램들이 위치하고있는

[자바 설치 경로] 하위의 bin 이라는 디렉토리로 설정한다.

그리고 CLASSPATH는 [자바 JRE 설치 경로]하위의 lib 디렉토리의 위치로 설정한다.

/**

* 책을 보던 중 새로 추가할 만한 내용이 있어서 수정하게 되었다.

* 이 부분이 java version이 달라지면서 바뀌었을 수도 있지만,

* 5.0 버전때를 기준으로 CLASSPATH에 대한 설명을 더하자면

*

* 자바 라이브러리 클래스들이 저장된 디렉토리를 설정하는 것으로

* J2DJK(Java 2 Development Kit)는 필요한 클래스 라이브러리를 ..\jre\lib\ext 디렉토리에 복사하면 사용 가능하므로

* ​특별한 경우가 아니면 CLASSPATH는 설정하지 않는 것이 좋다.​

*/

환경변수를 등록하거나 수정하는 작업은 간단하다.

[새로 만들기] 버튼을 눌러 이름과 값을 정해주면 된다.

이미 존재한다면 (아마 path는 존재하고 있을 것이다.) 해당 값을 클릭해둔 상태로 [편집] 버튼을 누르면 된다.

보통 java에 대한 환경변수를 설정할때는

1. JAVA_HOME 이라는 변수를 생성하고, [java 설치 경로]의 jdk 버전이 명시된 디렉토리까지 설정하고

2, PATH에서 JAVA_HOME이라는 1에서 만든 변수를 가져다 사용하여 등록하는데

PATH에는 이렇게 작성하면 된다.

%JAVA_HOME%\bin;

환경변수의 경로는 항상 세미콜론(;)으로 구분되어야 하며

**​환경변수 설정이 바뀌었을 경운에는 명령 프롬프트를 반드시 재시작 해야 수정한 내용이 반영된다.**​

만약 환경변수가 제대로 설정되었는지 확인해보고 싶다면

(java의 경우) 명령프롬프트를 띄우고 "javac" 라고 입력했을 때

해당 명령어 사용법이 뜨면 제대로 설치 및 설정이 완료된 것이고

해당 명령어를 찾을 수 없다라는 문구가 나오면

어딘가가 잘못된 것아다.

![0064-32-java-environment-variables-guide-img-04.png](/tech-blog/resources/images/migration/0064-32-java-environment-variables-guide/img-04.png)

(제대로 설정되지 않은 예)

그리고 또 하나, Java는 설치할 때 환경변수 세팅이 자동으로 등록되지 않는다.

그렇기 때문에 Hello World를 하기 전에 까먹지 말고 세팅해 주어야 한다.

일반적으로 jdk를 설치하면 jre가 자동으로 설치 되지만

jre를 설치하면 jdk는 자동으로 설치되지 않는다.

:jre -> Java Runtime Environment 로 자바 실행 환경이다.

:jdk -> Java Development Kit 으로 개발을 하기 위한 도구이다.

이렇게 환경변수 세팅을 마쳤다면 드디어 Hello World 를 출력할 준비가 ? 되었다.

이왕 세팅한거 티키신이 분노하지 않게 '안녕 세상아' 한 번 찍어주자.

```java
import java.lang.*;

public class Example {
    public static void main(String[] ar) {
        System.out.println("Hello, World!");
    }
}
​
```

메모장에서 작성해도 좋다.

대신, ​파일이름과 public class 뒤의 이름이 대소문자까지 완벽하게 동일해야 한다.​

위의 경우 파일을 Example.java 로 저장해야만 한다.

그리고 해당 파일이 있는 위치로 이동한후

javac Example.java

라고 컴파일 명령을 내린다.

정상적으로 컴파일이 되었다면, .java파일이 있던 위치에 동일한 이름의 .class 파일이 생겼을 것이고

명령프롬프트에는 아무런 문구 없이 사용자의 입력을 기다리며 커서가 껌뻑이고 있을 것이다.

컴파일이 완료되었으면 다음 명령어로 실행시켜보자.

java Example

만약 위의 과정을 순서대로 잘 수행했다면 "Hello, World!" 라는 문구가 떡하니 출력되어 있을 것이다.

환경변수에 대해 알아보다가 Hello, World! 까지 출력해 보았다.

이제 환경변수가 무엇이며, 그렇기 때문에 왜 설정해줘야 하는지

그리고 어떻게 확인할 수 있는지 까지 알아보았다.

다음엔 무엇을 정리해두지

 현재 상황이 직접 java를 설치할 수 있는 환경이 아니라 이미지 자료가 부족하다.
