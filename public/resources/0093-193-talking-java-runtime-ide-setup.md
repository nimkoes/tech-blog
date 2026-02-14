### 4. 자바 실행 환경 :****조금 더 즐거운 통합 개발 환경.

---

지금까지 알아본 내용을 토대로 프로그램 개발 과정을 생각해보자.

1. 메모장을 실행시킨다.

2. 프로그래밍 언어 (자바) 문법에 맞춰 원하는 프로그램을 작성한다.

3. 고급언어로 작성한 프로그램을 컴퓨터가 이해할 수 있도록 번역 (컴파일) 한다.

4. 오류가 발생했다면 오류를 수정한다.

5. 컴파일 결과물을 실행하기 위해 명령 프롬프트를 실행한다.

6. 명령 프롬프트에서 실행할 파일 (자바에서는 .class 확장자를 갖는 바이트 코드 파일)을 실행시킨다.

7. 결과를 확인한다.

생략된 과정들 (예를들면 컴파일 하기 위해 자바를 설치하고, 명령 프롬프트에서 컴파일 및 실행 시키기 위해 환경변수를 등록하는 일)도 있지만 대충 생각해도 꽤 많은 작업을 해야 비로소 프로그램을 실행시킬 수 있다.

생각해보면 2번 과정에서 프로그램을 어떻게 작성하는지에 대한 내용만 달라질 뿐, 그 외의 과정들은 프로그램을 만들 때마다 반복하고 있음을 알 수 있다.

프로그래밍 언어를 공부할 때 이 사실을 하나 기억하고 있으면 좋겠는 사실이 하나 있다.

일반적으로 했던 일을 또 하는 반복작업을 싫어하고 또 이러한 부분에 대해 내가 아닌 누군가 자동으로 해주길 바라고 있다는 것이다.

그리고 보통 이 피할 수 없는 반복 작업들을 피하는 방법의 패러다임은 (사견이지만) '사람이 할 일을 컴퓨터에게 시켜라' 이다.

첨언이 길었다.

본격적으로 위에서 말한 반복 작업을 어떻게 피하는지 통합 개발 환경을 구축하면서 생각해보자.

다양한 통합 개발 환경을 제공하는 프로그램들이 있지만 보편적으로 많이 사용하고 접하기 쉬운 eclipse IDE 로 알아보려 한다.

[프로그램을 다운받기 위해 사이트로 이동한다.](https://www.eclipse.org/)

![0093-193-talking-java-runtime-ide-setup-img-01.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-01.png)

그러면 현재 기준 위와 같은 화면을 볼 수 있다.

여기서 바로 다운로드 버튼을 누르지 말고 스크롤을 아래로 내려보자.

![0093-193-talking-java-runtime-ide-setup-img-02.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-02.png)

그러면 아래쪽에 Other에 IDE and Tools 링크가 존재한다.

이 링크를 눌러 이동하자.

![0093-193-talking-java-runtime-ide-setup-img-03.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-03.png)

위와 같은 화면이 나왔으면 Download 버튼을 클릭하자.

![0093-193-talking-java-runtime-ide-setup-img-04.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-04.png)

그러면 위와 같은 화면이 나타난다.

이클립스가 종류가 참 많다.

엔터프라이즈급 자바 개발을 위한 IDE, 자바 개발을 위한 IDE, C/C++ 개발을 위한 IDE 등등

자신에 맞는 이클립스를 다운 받으면 된다.

지금 화면은 가장 최신 버전을 먼저 보여주고 있는데, 이클립스마다 설치 되어 있어야 하는 JDK 버전이 다르므로 반드시 확인해야한다.

먼저 자신이 사용할 JDK 버전을 골랐으면 그 버전에 맞는 이클립스 버전을 MORE DOWNLOADS 에서 선택해서 다운받으면 된다.

추가적으로 이 화면의 위쪽을 보면 다음과 같은 Release 라는 링크가 있다.

![0093-193-talking-java-runtime-ide-setup-img-05.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-05.png)

링크를 클릭해보면 위와 같이 지금까지 배포한 버전들에 대한 링크가 존재한다.

각 버전들이 언제 출시 되었는지 다음 표를 참고하자.

위키백과에서 검색한 결과중 일부를 가져온 것이다.

![0093-193-talking-java-runtime-ide-setup-img-06.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-06.png)

안드로이드 버전에서도 볼 수 있는데, 버전명의 첫 문자가 알파벳 순서로 증가하는걸 볼 수 있다.

그냥.. TMI다.

![0093-193-talking-java-runtime-ide-setup-img-07.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-07.png)

아무튼 그래서 Mars 링크를 클릭하면 위와 같이 더 다양한 종류의 패키지들을 볼 수 있다.

처음 봤을때는 그냥 무조건 최신 버전을 받았던 기억이다.

정리하면 다음과 같다.

<table>
<tbody>
<tr>
<td>M</td>
<td>Milestone</td>
</tr>
<tr>
<td>RC</td>
<td>Release Candidates</td>
</tr>
<tr>
<td>R</td>
<td>Release</td>
</tr>
<tr>
<td>SR</td>
<td>Stable Builds</td>
</tr>
<tr>
<td>RTM</td>
<td>Release to Manufacturing</td>
</tr>
</tbody>
</table>

RC같은 경우 정식 배포 하기 위한 후보군들에 붙인다.

위로 올라갈 수록 최신 버전으로 이전 버전들 보다는 안정적인 배포 버전이라 생각하면 될 것 같다.

개인적으로 버전의 네이밍 룰을 알고난 이후부터 되도록이면 R 버전을 다운받는다.

[** eclipse build type 참고](http://download.eclipse.org/eclipse/downloads/build_types.html)

![0093-193-talking-java-runtime-ide-setup-img-08.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-08.png)

얘기가 조금 다른 길로 샜는데 다시 돌아와서 Java EE Developer 의 윈도우 64비트 버전을 다운 받았다.

![0093-193-talking-java-runtime-ide-setup-img-09.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-09.png)

그러면 위와 같이 브라우저에 설정되어있는 경로에 이클립스가 다운 받아진다.

![0093-193-talking-java-runtime-ide-setup-img-10.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-10.png)

다운받은 파일의 압축을 풀면 위와 같은 파일들이 포함되어 있는걸 볼 수 있다.

누가 봐도 실행파일로 보이는 eclipse.exe 파일을 실행 시켜보자.

![0093-193-talking-java-runtime-ide-setup-img-11.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-11.png)

![0093-193-talking-java-runtime-ide-setup-img-12.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-12.png)

처음 실행 시키면 workspace 경로를 설정하라는 안내가 나온다.

실수로 생각없이 다시 묻지 않기를 선택해서 바로 welcome 페이지가 뜨면서 실행된 화면이다.

혹시 workspace 위치를 변경 하려면 다음과 같이 하면 된다.

![0093-193-talking-java-runtime-ide-setup-img-13.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-13.png)

![0093-193-talking-java-runtime-ide-setup-img-14.jpg](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-14.jpg)

workspace는 단어의 뜻 그대로 작업공간을 의미한다.

굳이 폴더 이름이 workspace일 필요는 없지만 편의상 이름을 수정하지는 않는다.

여기서 지정한 곳을 기준으로 작업한 내용이 저장된다.

![0093-193-talking-java-runtime-ide-setup-img-15.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-15.png)

앞서 메모장에서와 동일한 작업을 하는 프로그램을 만들기 위해 프로젝트를 생성해보자.

Project Explorer 영역에서 마우스 우클릭을 하고 New 의 Project를 선택한다.

만약 Project Explorer가 보이지 않는다면 이클립스 상단의 Quick Access를 활용하면 된다.

![0093-193-talking-java-runtime-ide-setup-img-16.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-16.png)

![0093-193-talking-java-runtime-ide-setup-img-17.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-17.png)

이렇게 바로 검색을 통해 찾아내는 방법이 있다.

그런데 만약 Quick Access를 찾을 수 없다면 다른 방법이 있다.

메뉴에서 Package Explorer를 찾아내 보여주는 방법이다.

![0093-193-talking-java-runtime-ide-setup-img-18.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-18.png)

상단의 Window > Show View > Package Explorer 를 바로 선택 하거나.

필요한 view가 목록에 없을 경우 맨 아래 Other... 를 선택한다.

![0093-193-talking-java-runtime-ide-setup-img-19.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-19.png)

Other... 를 선택하면 보여줄 수 있는 모든 View 목록이 나오는데, 위치를 안다면 찾아가도 된다.

만약 이름만 기억이 난다면 다음과 같이 검색을 통해 한번에 찾아내는 방법도 있다.

![0093-193-talking-java-runtime-ide-setup-img-20.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-20.png)

![0093-193-talking-java-runtime-ide-setup-img-21.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-21.png)

얘기가 조금 돌아갔지만, Package Explorer 영역에서 New > Project 를 선택하면 위와 같은 창이 뜬다.

![0093-193-talking-java-runtime-ide-setup-img-22.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-22.png)

어디에 있는지 알면 바로 선택해도 되고, 그게 아니면 검색을 통해 Java Project를 찾아 선택한다.

![0093-193-talking-java-runtime-ide-setup-img-23.jpg](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-23.jpg)

Java Project를 선택하면 프로젝트 생성 마법사 창이 뜬다.

보이는 항목 중에 Use default location 을 보면 앞서 설정한 workspace 경로가 입력 되어 있다.

체크박스를 해제하면 다른 위치에 만들 수 있겠지만 추천하지는 않는다.

![0093-193-talking-java-runtime-ide-setup-img-24.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-24.png)

Project name을 기입하면 아래 생성되는 위치가 실시간으로 바뀌고 있는것을 볼 수 있다.

그리고 JRE 버전도 프로젝트 생성시 설정할 수 있다.

Project layout 항목을 보면 생성한 프로젝트 최상위 위치에 소스파일과 클래스 파일을 같이 둘지

아니면 소스와 클래스 파일을 서로 다른 폴더에 구분할지 설정하는 부분이다.

설정이 완료 되었으면 Finish 버튼을 선택한다.

![0093-193-talking-java-runtime-ide-setup-img-25.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-25.png)

그러면 알림창이 하나 뜨면서 perspective 를 변환할 것인지 물어본다.

perspective는 사전적으로 어떠한 관점을 뜻하는 단어다.

그런 의미에서 본다면 앞으로 할 작업을 어떤 관점에서 하겠냐고 이해하면 좋겠다.

![0093-193-talking-java-runtime-ide-setup-img-26.jpg](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-26.jpg)

eclipse IDE의 perspective는 보통 우측 상단에 표시된다.

현재 Java EE 로 설정 되어 있으므로 단순 Java 프로젝트를 위한 Java perspective로 전환할 것인가를 물어보는 것이다.

![0093-193-talking-java-runtime-ide-setup-img-27.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-27.png)

그렇게 하겠다고 Yes 버튼을 클릭하면 우측 상단의 Java perspective가 생기며 활성화 되는 것을 볼 수 있다.

그러면서 크게 차이는 못느낄수 있지만 Java 개발에 최적화된 기본 View 들을 제공해주고 있다.

얼마든지 언제든지 작업 환경에 따라 바꿔줄 수 있으므로 부담 가지지 말자.

![0093-193-talking-java-runtime-ide-setup-img-28.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-28.png)

이제 좌측에 보면 TestPrj 이름을 갖는 Java 프로젝트가 생성된 것을 볼 수 있다.

![0093-193-talking-java-runtime-ide-setup-img-29.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-29.png)

그럼 이번엔 앞서 메모장에서 만들었던 것과 동일한 작업을 하는 소스 파일을 생성해보자.

src를 마우스 우클릭을 하고 New > Class 를 선택한다.

![0093-193-talking-java-runtime-ide-setup-img-30.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-30.png)

파일이 생성될 Source folder 경로가 나오며 해당 위치에 생성할 소스 파일의 이름을 지정해주도록 되어 있다.

또한 중간 쯤에 보면 Which method stubs would you like to create? 항목이 있다.

이것들은 IDE에서 제공하는 기능으로 자바 파일 생성시 빈번하게 반복하는 작업을 대신 해줄까? 하는 내용이다.

선택을 해도 좋고 안해도 상관 없다.

![0093-193-talking-java-runtime-ide-setup-img-31.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-31.png)

Finish를 클릭하면 TestPrj 프로젝트 하위에 TestClass.java 파일이 생성되는 것을 볼 수 있다.

![0093-193-talking-java-runtime-ide-setup-img-32.jpg](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-32.jpg)

eclipse 실행시 설정했던 workspace 경로를 따라가서 생성한 프로젝트 하위의 src 폴더를 열어보면 파일이 생성되어 있는것을 볼 수 있다.

![0093-193-talking-java-runtime-ide-setup-img-33.jpg](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-33.jpg)

앞서 메모장에서 테스트한 내용을 기억할지 모르겠다.

그때는 .java 파일을 javac 컴파일 명령어로 처리를 했어야 .class 파일이 만들어졌다.

하지만 이클립스 IDE를 사용하면 (설정에서 안하게 할 수도 있지만, 기본 설정을 수정하지 않으면) 위와같이 bin이라는 경로에 .class 파일이 자동으로 생긴 것을 확인할 수 있다.

![0093-193-talking-java-runtime-ide-setup-img-34.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-34.png)

앞에서 다루었던 Hello, World! 문자열을 출력한 예제를 작성해보자.

![0093-193-talking-java-runtime-ide-setup-img-35.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-35.png)

이것 역시 메모장에서는

1. 명령 프롬프트 실행 (cmd)

2. .java 파일의 경로로 이동

3. javac 명령으로 컴파일

4. .class 파일을 java 명령으로 실행

하는 과정을 거쳐야 실행 결과를 받아볼 수 있었다.

하지만 이클립스 IDE에서는 실행과 관련된 Run 메뉴 하위의 Run As > Java Application 을 선택하면 된다.

![0093-193-talking-java-runtime-ide-setup-img-36.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-36.png)

그러면 이클립스 자체에 Console 이라는 view 가 생기면서 그곳에 실행 결과가 출력된다.

정말 편리하지 않은가?

심지어 ctrl + F11 키를 누르거나 Alt + Shift + X, J 단축키로도 한번에 실행할 수 있다.

메모장으로 프로그램을 작성할 때보다 훨씬 시간과 노력이 줄어드는것을 대출 봐도 알 수 있다.

그럼에도 처음에는 메모장에서 프로그램을 작성하는 연습을 하기를 추천하다.

![0093-193-talking-java-runtime-ide-setup-img-37.png](/tech-blog/resources/images/migration/0093-193-talking-java-runtime-ide-setup/img-37.png)

이번에는 마지막으로 괜히 명령프롬프트를 활용해서 .class 파일을 찾아가 실행시킨 화면이다.

어떻게 실행시켜도 상관 없다는것을 보여주고 싶었다.

지금까지 나름의 자바 정리를 해봤다.

처음부터 되도록이면 다 설명을 해보고 싶은 욕심에 전달이 잘 됐을지 걱정이다.
한창 정리하다가 그만하게 될까도 걱정이었는데 그래도 어떻게든 마무리 하게 되어 다행이다.
