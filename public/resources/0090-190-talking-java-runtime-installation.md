### 4. 자바 실행 환경 : 자바 설치 방법.

---

글을 작성하는 현재 시점으로 자바의 가장 최신 버전은 Java 11 이지만 Java 8 을 설치해서 사용할 계획이다.
그리고 윈도우 플랫폼을 기준으로 한다.

프로그래밍 언어가 뭔지도 알았겠다. 그 중 자바가 뭔지도 좀 알았겠다. 이제 본격적으로 설치를 해보자.

[설치 파일 다운로드 링크](https://www.oracle.com/index.html)

링크에 들어가서 다음 과정을 따라서 설치해보자.
사이트에 접속후 스크롤을 맨 아래로 내리면 다음과 같이 "Java for Developer" 라는 링크가 있다.
이걸 선택해서 들어가자.

![0090-190-talking-java-runtime-installation-img-01.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-01.png)

그럼 다음과 같은 화면이 나타난다.

![0090-190-talking-java-runtime-installation-img-02.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-02.png)

여기서도 스크롤을 맨 아래로 내려보면 다음과 같은 링크가 보일것이다.

![0090-190-talking-java-runtime-installation-img-03.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-03.png)

Java Archive의 오른쪽 DOWNLOAD 버튼을 클릭하면, 원하는 버전의 자바를 선택해서 다운받을 수 있는 화면으로 이동한다.

![0090-190-talking-java-runtime-installation-img-04.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-04.png)

그럼 여기서 Java SE 8을 선택하자.

Java를 설치하러 왔더니 SE라는 모르는게 나왔다. SE는 Standard Edition, 표준 에디션의 줄임말로 Java에는 SE 이외에도 몇가지 제품군이 있다.

1. Java SE
Java Standard Edition 으로 가장 기본이 되는 에디션 제품이다.

2. Java EE
Java Enterprise Edition 으로 기업용 프로그램을 만들때 최적의 환경을 제공하는 제품이다.

3. Java ME
Java Micro Edition 으로 가전제품 들 모바일 기기에 사용할 프로그램을 만들때 최적의 환경을 제공하는 제품이다.

우리는 여기서 SE를 설치할 것이다.

![0090-190-talking-java-runtime-installation-img-05.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-05.png)

클릭해서 들어가보면 크게 두가지 분류를 확인해볼 수 있다.
1. JDK (Java SE Development Kit, 자바 개발 도구)
2. JRE (Java SE Runtime Ecvironment, 자바 실행 환경)
만약 자바로 만들어진 프로그램을 실행만 할거라면 JRE 즉, 자바 실행 환경만 받아 설치하면 된다.
그런데 우리는 개발을 할 것이기 때문에 개발자 도구인 JDK를 받을 것이다.
JRE는 JDK내에 포함되어 같이 설치 되기 때문에 개발하는 입장에서는 JDK만 설치하면 된다.

그래서 다운 받으려고 했더니 또 두가지로 나뉜다. (윈도우 플랫폼에서 개발할 예정이기 때문에 윈도우만 예로 들었다.)
1. Window X86 : 32비트 운영체제일 경우 선택
2. Window X64 : 64비트 운영체제일 경우 선택

32비트는 뭐고 64비트가 무엇인지 몰라도 괜찮지만, 모르고 넘어가면 찜찜하니까 설명을 남긴다.

컴퓨터를 아예 모르고 자바를 시작한 사람들을 위해 비트가 무엇인지 간략하게 소개를 하겠다.
한화(KRW)의 가장 작은 단위가 1원 2원 하는 원 이라면, 컴퓨터는 비트가 메모리 크기를 나타내는 가장 작은 단위이다.
메모리 저장공간의 크기를 나타내는 비트에는 무엇인가를 저장할 수 있다.
컴퓨터는 1비트의 메모리에 1 또는 0의 두 종류 중 하나의 값을 저장할 수 있다.
이것을 켜진 상태(1)와 꺼진 상태(0) 또는 참(1)과 거짓(0) 이라고도 표현한다.

우리는 보통 10진수를 사용한다.
10진수는 0부터 9까지 열가지 숫자를 사용해서 표현한다.
그렇기 때문에 0, 1, 2, ... , 8, 9 까지 세고난 다음엔 자리 올림을 통해 9보다 1이 큰 수를 10 이라고 정의하고 있다.
컴퓨터는 2진수 숫자 체계를 사용한다.
그렇기 때문에 0과 1만을 가지고 숫자를 표현한다.
2진수로 10진수의 숫자를 센다고 하면 다음과 같다.

<table>
<tbody>
<tr>
<td>10진수</td>
<td>0</td>
<td>1</td>
<td>2</td>
<td>3</td>
<td>4</td>
<td>5</td>
<td>6</td>
<td>7</td>
<td>8</td>
</tr>
<tr>
<td>2진수</td>
<td>0</td>
<td>1</td>
<td>10</td>
<td>11</td>
<td>100</td>
<td>101</td>
<td>110</td>
<td>111</td>
<td>1000</td>
</tr>
</tbody>
</table>

2진수는 0, 1 다음에 자리올림이 발생한다는 특징이 있다.
만약에 2비트의 공간이 있다고 하면, 이 메모리에는 몇가지 종류의 데이터가 들어갈 수 있을까?
잘 모르겠을때는 단순하게 나열해보자.
2비트의 메모리 공간에 담을 수 있는 데이터의 종류 : 00, 01, 10, 11
이렇게 네가지 종류의 데이터를 담을 수 있다. 3비트일때는 어떨까?
3비트의 메모리 공간에 담을 수 있는 데이터의 종류 : 000, 001, 010, 011, 100, 101, 110, 111
이렇게 여덟가지 종류의 데이터를 담을 수 있다.
이를 공식화 하면 n비트의 메모리에는 2^n 종류의 데이터를 담을 수 있다.

컴퓨터는 n비트의 메모리에 2^n 개의 데이터를 담을 수 있다는것 까지 알았다.

운영체제의 비트수에 대해 얘기하다 여기까지 왔는데, 32비트 운영체제는 한번에 2^32개의 데이터를 처리할 수 있음을 뜻한다.
64비트 운영체제는 한번에 2^64개의 데이터를 처리할 수 있음을 뜻한다.

계산해보면 알겠지만 어마어마한 숫자다.
즉, 설치한 운영체제가 한번에 처리하는 데이터의 크기에 따라 맞는 프로그램을 설치하도록 정보를 제공하고 있는 것이다.

비트에 대한 마지막 이야기로 메모리 크기 단위에 대해 소개하려 한다.

백원이 열개면 천원이라고 하는 것처럼 (뭐, 10백원 이라고 해도 천원이지만 보통 그렇게 안쓰니까)

4비트(bit) 는 1니블(nibble)
8비트(bit) 는 1바이트(byte)
1,024바이트(byte) 는 1킬로바이트(KB)
1,024킬로바이트(KB) 는 1메가바이트(MB)
1,024메가바이트(MB) 는 1기가바이트(GB)

이런식으로 단위가 형성되어 있다. (1,024 라는 숫자가 %5Ccombi%20%5E%7B%2010%20%7D%7B%202%20%7D%20인걸 기억한다면 보다 쉽게 접근할 수 있다.)

비트에 대한 소개는 이쯤에서 마치겠다.

자신이 몇비트의 운영체제가 설치되어 있는지 확인하는 방법은
키보드의 윈도우키 + pause/break 를 같이 누르면 다음과 같은 화면에서 확인할 수 있다.
참고로 pause/break 키는 보통 키보드의 우측 상단에 위치해 있다.

![0090-190-talking-java-runtime-installation-img-06.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-06.png)

만약 이 버튼을 찾지 못하겠다면 다음 이미지와 같이 '내 컴퓨터' 에서 마우스 우클릭 후 '속성'을 선택하면 동일한 화면에 진입할 수 있다.

![0090-190-talking-java-runtime-installation-img-07.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-07.png)

다시 다운로드 화면에서, 사용 약관에 동의하고 다운 받을 파일을 선택하면 오라클 계정 로그인 화면이 나온다.

![0090-190-talking-java-runtime-installation-img-08.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-08.png)

로그인에 성공하면 설치 파일을 다운받을 수 있다. (계정이 없다면 만들어야 한다.)
자, 다운 받았다고 생각하고 이제 이 설치 받은 파일을 실행시켜보자.

![0090-190-talking-java-runtime-installation-img-09.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-09.png)

설치는 계속 Next를 눌러주면 된다.

![0090-190-talking-java-runtime-installation-img-10.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-10.png)

![0090-190-talking-java-runtime-installation-img-11.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-11.png)

위의 과정에서 설치 경로를 바꿀 수 있는데, 가능하면 바꾸지 말고 설치하자.

![0090-190-talking-java-runtime-installation-img-12.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-12.png)

![0090-190-talking-java-runtime-installation-img-13.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-13.png)

자세히 보면 차이를 알겠지만, 이번엔 JRE를 설치할 경로를 물어보고 있다.
이것 역시 되도록이면 수정하지 말고 설치를 하도록 하자.

![0090-190-talking-java-runtime-installation-img-14.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-14.png)

![0090-190-talking-java-runtime-installation-img-15.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-15.png)

설치가 완료되면 위와 같은 화면이 나오는데, Next Step 버튼을 클릭하면
설명에서 나와있는 것처럼 튜토리얼과 API 문서를 열어볼 수 있다고 한다.

[java SE 8 Documentation 링크](https://docs.oracle.com/javase/8/docs/)

사이트가 연결되니 나중에 꼭 참고해봤으면 좋겠다.

설치가 끝났다면 잘 설치 되었는지 확인 해보자.

명령 프롬프트를 하나 열어보자.
명령 프롬프트는 윈도우 키를 누르고 cmd (command) 를 입력하면 나오는 프로그램이다.

![0090-190-talking-java-runtime-installation-img-16.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-16.png)

이렇게 열거나 혹은 윈도우키 + r 을 누르면 '실행' 이라는 창이 하나 뜬다.
거기에 cmd 라고 기입해도 좋다.

![0090-190-talking-java-runtime-installation-img-17.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-17.png)

그러면 다음과 같은 검정 화면이 하나 뜬다.

![0090-190-talking-java-runtime-installation-img-18.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-18.png)

이 화면에서
java -version
이라고 입력해보자.

![0090-190-talking-java-runtime-installation-img-19.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-19.png)

위와 같이 설치한 자바 버전이 나오면 설치는 잘 된 것이다.
그렇다면 다음 명령어도 입력해보자.
javac
어떤 결과가 나오는가?

![0090-190-talking-java-runtime-installation-img-20.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-20.png)

javac 라는게 생소할거다.
javac에서 c는 compile 을 의미한다.
compile 이란 java로 작성된 프로그램을 컴퓨터가 이해할 수 있는 언어로 번역해주라는 명령어이다.

분명히 자바를 설치 했는데, 왜 저 명령을 알 수 없다고 하지?
그건 환경변수 문제이다.
환경변수에 대해 이곳을 참고해주면 좋겠다.

간략하게 언급하자면, 운영체제에게 '내가 이런 명령어를 쓰면 어디서든 쓸 수 있게 해줘!' 하고 등록하는 곳이 환경변수이다.
javac 라는 명령에 대해 이러한 설정이 되어있지 않기 때문에 컴퓨터가 모른다고 하는거다.
javac가 어디 있는지부터 확인해보자.

javac는 처음 자바를 설치할 때 경로를 따로 수정하지 않았다면, 보통 다음과 같은 곳에 존재한다.
(혹시 해당 위치에 없다면 javac를 탐색기에서 검색 하거나, 설치할 때 경로를 기억해뒀다면 쉽게 찾을 수 있다.)

![0090-190-talking-java-runtime-installation-img-21.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-21.png)

c:\Program Files\Java 경로에 가면 내가 받은 jdk와 jre가 설치되어 있는것을 볼 수 있다.
그리고 설치한 jdk의 버전 폴더에 들어간 다음 bin 이라는 폴더에 들어가보면
java를 설치하면 사용할 수 있는 명령들이 나열되어 있다.
여기에 javac 라는 명령이 있는것을 알 수 있다.

우리는 여기있는 명령을 사용하기 위해서 환경변수라는 곳에 이 경로를 등록해줄 것이다.
환경변수를 등록하는 곳은 몇비트의 운영체제가 설치 되었는지 확인했던 화면에 있다.
우선 윈도우7에서의 등록하는 화면을 보고나서 윈도우10에서의 화면이 어떻게 생겼는지 살펴보겠다.

![0090-190-talking-java-runtime-installation-img-22.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-22.png)

좌측에 '고급 시스템 설정' 을 클릭하면 '시스템 속성' 창이 하나 뜬다.
여기서 '환경변수' 버틀을 클릭하면 환경변수를 등록할 수 있는 화면이 나타난다.

위쪽의 환경변수는 현재 접속중인 계정에 대해서만 등록을 하는 부분이고
아래쪽은 모든 사용자 계정에 대해 사용할 수 있도록 등록해주는 부분이다.

하나의 컴퓨터에 여러 사용자 계정을 등록해서 사용한다면 모르겠지만,
그렇지 않다면 (혹은 그렇다 하더라도) 시스템 변수 쪽에 추가를 해주도록 하다.
'새로 만들기'를 선택하자.

![0090-190-talking-java-runtime-installation-img-23.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-23.png)

우선 JAVA_HOME 을 등록해주자.
이 경로는 jdk 버전이 써진 폴더 경로 까지만 넣어주자.
JAVA_HOME 을 따로 등록하는 이유는 java를 사용하는 다른 프로그램에서 JAVA_HOME 이라는 이름의 환경 변수를 참조하는 경우가 있기 때문이다.
그냥 바로 PATH에 등록해도 상관 없지만, 음.. 관행이라 생각하고 JAVA_HOME을 넣어주자.
(백슬러시 \ 를 주의해서 넣어주자)

![0090-190-talking-java-runtime-installation-img-24.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-24.png)

등록하고나면 시스템 변수 쪽에 PATH 라는 이미 등록되어있는 항목이 있다.
이 내용을 수정해줘야 한다.

![0090-190-talking-java-runtime-installation-img-25.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-25.png)

PATH 를 편집하면 위와같은 화면이 나온다.
이때 정말 주의애햐 할 것은, 철자 하나라도 오탈자가 생기면 안된다.
커서를 맨 뒤로 이동시키고
#### ;%JAVA_HOME%\bin
을 정확하게 입력하자.
맨 앞의 세미콜론 (;) 은 앞서 등록한 내용이 거기까지임을 알려주는 것이다.
그리고 %JAVA_HOME%은 환경변수에 방금 등록한 JAVA_HOME의 경로를 그대로 가지고 온 것이다.
이 경로에 맨 뒤에 백슬러시 (\)를 넣지 않았으므로 \bin 이라고 해서
C:\Program Files\Java\jdk1.8.0_181\bin
이라는 경로를 등록해준게 된다.

윈도우10의 경우 다음과 같이 생겼다.

![0090-190-talking-java-runtime-installation-img-26.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-26.png)

새로만들기를 통해 기입한 내용은 다음과 같다.
%JAVA_HOME%\bin
혹시 이 화면이 좀 더 복잡하게 느껴진다면, 텍스트 편집 버튼을 클릭해서 윈도우7 에서처럼 편집할 수 있으니 참고 바란다.
(JAVA_HOME 을 등록하는 부분은 윈도우7 과 동일하므로 생략했다.)

다음은 '텍스트 편집' 버튼을 눌렀을 때 뜨는 창의 모습이다.

![0090-190-talking-java-runtime-installation-img-27.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-27.png)

윈도우7에서와 동일한 규칙으로 값을 입력하면 된다.

여기까지 성공했으면 아까 알 수 없다고 했던 javac 를 명령 프롬프트에 다시 기입해보자.
 환경변수를 수정했으면 명령프롬프트를 끄고 다시 실행해야 적용 된다.

![0090-190-talking-java-runtime-installation-img-28.png](/tech-blog/resources/images/migration/0090-190-talking-java-runtime-installation/img-28.png)

여기까지 잘 적용 했다면, 아까와는 다르게 뭔가 주루룩 나왔다.
잘 보면 javac 라는 명령어를 어떻게 사용하는지에 대한 설명 (usage) 이 나온 것이다.

그러면 이제 정말 본격적으로 자바 소스를 작성할 준비가 됐다.
다음부터는 본격적으로 소스를 작성해 보겠다.
