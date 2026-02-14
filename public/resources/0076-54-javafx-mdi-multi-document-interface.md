답답하면 니들이 뛰라는 말이 있다.

그래서 정리해봤다.

javaFX를 사용해서 MDI (Multi Document Interface)를 개발해야할 경우가 간혹 생길수 있다.

검색을 해보았지만 마땅히 내가 원하는 스타일이 없었다.

그렇다고 이제 와서 javaFX를 *(나는 처음부터 한 번 쭉 훑어 봤지만)*처음부터 볼 수는 없는 노릇이다.

갑자기 javaFX를 사용하게 되어서 아주 급하게 공부를 하고 있었는데, 사용하지 않게 될 가능성이 높아졌다.

그래서 지금까지 알아본 내용이 너무(?) 아까워서 나름의 정리를 해보려 한다.

---

우선 javaFX가 무엇인지 간략하게 살펴보는 것으로 시작한다.

javaFX는 RIA *(Rich Client Application)*을 개발하기 위한 것으로, 크로스 플랫폼을 지원하는 그래픽 패키지 라이브러리 이다. java 7 부터 JDK에 포함되어 있기 때문에 별도의 설치는 필요하지 않다. 그렇다면 왜 javaFX일까?

사실 javaFX이전에 java를 사용하여 UI애플리케이션을 개발할 수 있었다. 아마 많이 들어봤을 AWT와 Swing이 바로 그 기술이다. AWT는 Abstract Window Toolkit의 약어로 OS에서 제공하는 네이티브 UI 컴포넌트를 사용하는 java 라이브러리 이다. 그렇다보니 이 라이브러리의 단점중에 하나가, 어떤 OS환경에서 동작하느냐에 따라 컴포넌트 구성이 변하고 또 그 종류도 많지 않았다. 그리고 나서 바통을 이어받은 것이 Swing이다. Swing의 주된 컨셉은, AWT에서 문제가 되었던, OS에서 제공하는 UI 컴포넌트 사용을 지양하자는 곳에서 부터였다. 쉽게 말해서 서로 다른 OS에서도 동일한 UI 컴포넌트를 제공하기 위해서 였다. 하지만 이게 오히려 단점이 되었고, Swing을 쓰기는 하지만 핵심 가치인 독자적 UI 를 사용하지 않고 기존 AWT처럼 OS에서 제공하는 UI를 억지로 사용했다고 한다. 그러다보니 당연하게도 퍼포먼스가 떨어지고 메모리 낭비가 심해져서 점점 버림받는(?) 기술로 전락하고 말았다.

이런 역사 속에서 MS의 sliverlight와 Adobe의 flash가 성장하자 이들과 경쟁에서 살아남기위해(?) javaFX라는 새로운 것을 들고 나왔다. 하지만 최초 등장했을 당시에는 또 다른 새로운 것을 학습해야하는 부담감에 사용자들로부터 외면을 당한다. *(처음에는 java 언어와 별개로 javaFX 스크립트 언어를 새로 배웠어야 한다고 한다.)* 2007년의 실패(?)를 교훈삼아 별도의 언어 필요 없이 java언어만 알아도 개발할 수 있도록 2011년에 새로운 버전이 release되었다. 그리고 지금은 IOS 애플리케이션 개발을 해보신 분들은 알겠지만, 화면과 비즈니스 로직을 독립시켜 개발할 수 있는 환경을 제공하고 있다.

---

본 내용은 아래 사항들이 이미 갖춰져 있음을 가정한다.

1. jdk 1.7 이상이 설치되어 있다. *(나는 1.8 버전을 설치했다.)*

1. eclipse IDE를 사용한다. *(netBeans를 사용하는 곳이 많았지만 나는 eclipse기준으로 만들었다.)*

2. e(fx)clipse 플러그인이 설치되어 있다.

3. Scene Builder 툴이 설치되어 있고, eclipse에서 화면 개발을 할 수 있도록 설정 되어 있다.

---

그럼 본격적으로 javaFX를 사용해서 MDI 예제 소스를 정리해보자.

이 라이브러리를 사용하게 된 배경이 있다.

사실 버튼이나 메뉴에서 클릭 이벤트를 통해 새로운 화면을 띄워 보는건 복잡하거나 어렵지 않다.

*(스테이지를 Modal창으로 만들면 되기 때문이다.)*

하지만 내가 원하던 화면은 메인화면 ***안에서*** 보여지는 화면이었기 때문에 사용할 수 밖에 없었다.

아래 참고자료에는 내 목적에 부합하지 않는 두 가지가 있다.

1. 화면을 fxml로 분리시키지 않고 java소스로 그리고 있다.

2. 메인 화면에 메뉴가 없다.

주로 이 두가지 문제를 해소하기 위해 나름의 노력을 했다.

*(더 좋은 방법이 분명히 있기 때문에 추후에 다시 한 번 살펴볼 예정이다.)*

눈으로 확인하는게 가장 빠를테니 예제 프로젝트를 실행부터 해보자.

---

참고로, 내려받은 원본 소스 파일 트리는 다음과 같았다.

/src

ㄴ/main

ㄴ/java/br/com/supremeforever

ㄴ/mdi

ㄴ/Exception

ㄴPositionOutOfBoundsException.java

ㄴMDICanvas.java

ㄴMDIEvent.java

ㄴMDIIcon.java

ㄴMDIWindow.java

ㄴUtility.java

ㄴMain.java

ㄴMyContentController.java

ㄴ/resources

ㄴ/assets

ㄴWindowIcon.png

ㄴclose.png

ㄴmaximize.png

ㄴminimize.png

ㄴrestore.png

ㄴ/style

ㄴDarkTheme.css

ㄴDefaultTheme.css

ㄴMyContent.fxml

ㄴ/test/java/br/com/supremeforever/mdi

ㄴMDICanvasTest.java

ㄴSupremeForeverMdiTestSuit.java

그래서 테스트 관련된 부분을 제외하고 jar로 묶기 위해 좀더 단순하게 묶었다.

/com/tistory/xxxelppa/mdi

ㄴMDICanvas.java

ㄴMDIEvent.java

ㄴMDIIcon.java

ㄴMDIWindow.java

ㄴPositionOutOfBoundsException.java

ㄴUtility.java

*(resources들은 생략했다. 그리고 굳이 트리 구조를 설명한 이유는 참고 문서와 내가 작성한 문서가 상이하기 때문이다.)*

명령 프롬프트에서 해당 디렉토리로 이동한 다음

jar -cvf mdilib.jar .

이 명령어를 통해 jar 파일로 묶은 결과이다.

 jar 파일 :

mdilib.jar

다운로드

 예제 프로젝트 :

xxxelppa_MDI.zip

다운로드

이 예제 파일 exlipse에서 Import > Existing Project into Workspace 로 추가해준 다음.

jar파일을 프로젝트의 Java Build Path의 Libraries에 추가해주면 된다.

실행이 되었다면 두 가지 문제를 어떻게 해결했는지 보자.

*(추가로 주석을 달았기 때문에 아래 첨부한 소스와 첨부 파일의 소스가 조금 상이할 수 있으나 실행시에 영향을 주는 부분은 없다.)*

1. 화면을 fxml로 분리시키지 않고 java소스로 그리고 있다.

***-> 40라인, 118라인***

2. 메인 화면에 메뉴가 없다.

***-> 46 ~ 64 라인 : 메뉴 생성***

***-> 70 ~ 94 라인 : 메뉴 등록***

***-> 97 ~ 136 라인 : 메뉴 클릭 이벤트 바인딩***

```java
package com.tistory.xxxelppa.view;

import java.io.IOException;
import java.io.InputStream;

import com.tistory.xxxelppa.mdi.MDICanvas;
import com.tistory.xxxelppa.mdi.MDIWindow;

import javafx.application.Application;
import javafx.application.HostServices;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.Menu;
import javafx.scene.control.MenuBar;
import javafx.scene.control.MenuItem;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;

public class MainAppController extends Application {

    int count = 0;
    int i = 1;
    public static HostServices hostServices;

    private Stage primaryStage;
    public static MDICanvas mdiCanvas;
    BorderPane mainPane = new BorderPane();

    // constructor
    public MainAppController() {
    }

    @Override
    public void start(Stage primaryStage) throws IOException {

        FXMLLoader loader = new FXMLLoader();
        loader.setLocation(getClass().getResource("MainApp.fxml"));

        // main화면을 BorderPane으로 만들고 fxml 편집툴인 scene builder에서 상단에 menuBar를 추가한다.
        mainPane = (BorderPane)loader.load();

        // 메뉴 초기화
        final String pMenu[][] = new String[][] {
            // 메뉴 타이틀
            {
                "menu_1"            // 첫 번째 메뉴
                , "menu_2"          // 두 번째 메뉴
            },
            // 첫 번째 메뉴 목록
            {
                "TestPage_1"
                , "TestPage_2"
                , "TestPage_3"
                , "Exit"
            },
            // 두 번째 메뉴 목록
            {
                "TestPage_4"
            }
        };

        mdiCanvas = new MDICanvas(MDICanvas.Theme.DARK);    // CSS 설정
        mdiCanvas.setPrefSize(1500, 800);                   // main 화면 (BorderPane)의 크기 설정

        /*
         * 상단 메뉴 생성 _ 2017.05.30 HSM
         */
        MenuBar menuBar = new MenuBar();
        // 상위 메뉴 생성
        Menu menu[] = new Menu[pMenu[0].length];
        for(int i = 0; i < menu.length; ++i) {
            menu[i] = new Menu(pMenu[0][i]);
        }
        // 하위 메뉴 생성
        MenuItem mi[][] = new MenuItem[pMenu[0].length][];
        for(int i = 0; i < pMenu[0].length; ++i) {
            mi[i] = new MenuItem[pMenu[i+1].length];
            for(int j = 0; j < pMenu[i+1].length; ++j) {
                mi[i][j] = new MenuItem(pMenu[i+1][j]);
            }
        }
        // 하위 메뉴 상위 메뉴에 등록
        for(int i = 0; i < pMenu[0].length; ++i) {
            menu[i].getItems().addAll(mi[i]);
        }
        // 메뉴바에 상위 메뉴 등록
        menuBar.getMenus().addAll(menu);
        // 메뉴바 화면에 등록
        mainPane.setTop(menuBar);

        // 메뉴 이벤트 등록
        for(int i = 0; i < pMenu[0].length; ++i) {
            for(int j = 0; j < mi[i].length; ++j) {
                final String pViewName = mi[i][j].getText();

                mi[i][j].setOnAction(event -> {
                    Node content = null;
                    MDIWindow mdiWindow;
                    try {

                        if(pViewName.equals("Exit")) {
                            System.exit(0);
                        } else {
                            /*
                             * 메뉴 화면은 /view 디렉토리 하위에 생성한다.
                             * 화면 이름 작명 규칙
                             *    1. 위에서 생성한 메뉴 이름의 공백을 제거한다.
                             *    2. 화면 이름 뒤에 _View 를 붙여 화면임을 명시한다.
                             *    ex> 메뉴 이름이 'Personal Date Input' 이라면 이 화면은 'PersonalDataInput_View.fxml'파일명을 가져야 한다.
                             *    마음에 들지 않는다면 다른 규칙을 적용해도 된다.
                             */
                            content = FXMLLoader.load(getClass().getResource("../view/" + pViewName.replace(" ", "") + "_View.fxml"));

                            InputStream in = getClass().getResourceAsStream("../resources/assets/" + "windowIcon.png");
                            Image imgWindowIcon = new Image(in);
                            ImageView imvWindowIcon = new ImageView(imgWindowIcon);

                            mdiWindow = new MDIWindow(pViewName, imvWindowIcon, pViewName, content);

                            // 화면별 사이즈는 switch case 태워도 괜찮을 듯... ? 번호 or 화면 명으로 분기
                            mdiWindow.setPrefSize(500, 400);

                            mdiCanvas.addMDIWindow(mdiWindow);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }
        }

        mainPane.setCenter(mdiCanvas);

        Scene scene = new Scene(mainPane);

        // 메인 화면 타이틀
        primaryStage.setTitle("xxxelppa MDI TST PRJ");

        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
```

각 화면에서 발생하는 이벤트에 대해서는 따로 controller class를 만들어서 scene builder를 통해 @FXML 로 선언한 이벤트를 등록해주면 된다. *(첨부한 예제 소스에는 MDI화면당 controller class를 만들지 않았다.)*

메뉴를 등록하는 부분을 라이브러리에 포함시키려고 했지만, 무슨 이유에서인지 포함시키지 않았다. *(기억나지 않는다.. 따로 수정해도 좋을 것 같다..)* 마지막으로 새로운 메뉴를 만드는 방법에 대해 말하려 한다.

메뉴를 생성한 부분의 소스를 따로 살펴보자.

```java
        // 메뉴 초기화
        final String pMenu[][] = new String[][] {
            // 메뉴 타이틀
            {
                "menu_1"            // 첫 번째 메뉴
                , "menu_2"          // 두 번째 메뉴
            },
            // 첫 번째 메뉴 목록
            {
                "TestPage_1"
                , "TestPage_2"
                , "TestPage_3"
                , "Exit"
            },
            // 두 번째 메뉴 목록
            {
                "TestPage_4"
            }
        };
```

위와같이 pMenu 배열을 생성하면 다음과 같은 메뉴가 만들어진다.

<table>
<tbody>
<tr>
<td>
<p><span></span><span>&nbsp;menu_1</span></p>
</td>
<td>
<p><span><span>&nbsp;menu_2</span></span></p>
</td>
</tr>
<tr>
<td>
<p>&nbsp;TestPage_1</p>
</td>
<td>
<p>&nbsp;TestPage_4</p>
</td>
</tr>
<tr>
<td>
<p>&nbsp;TestPage_2</p>
</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>
<p>&nbsp;TestPage_3</p>
</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>&nbsp;Exit</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>

말로 길게 설명하는 것 보다 세번째 munu를 생성한 소스를 보는게 이해가 더 빠를 것 같다.

```java
        // 메뉴 초기화
        final String pMenu[][] = new String[][] {
            // 메뉴 타이틀
            {
                "menu_1"            // 첫 번째 메뉴
                , "menu_2"          // 두 번째 메뉴
                , "menu_new"        // 세 번째 메뉴
            },
            // 첫 번째 메뉴 목록
            {
                "TestPage_1"
                , "TestPage_2"
                , "TestPage_3"
                , "Exit"
            },
            // 두 번째 메뉴 목록
            {
                "TestPage_4"
            },
            // 세 번째 메뉴 목록
            {
                "TestPage_NEW"
            }
        };
```

바뀐 부분은 ***7 라인, 14 라인, 20 ~ 23 라인 이다.***

수정 이후 실행 결과 메뉴는 다음과 같이 만들어진다.

<table>
<tbody>
<tr>
<td>
<p><span></span><span>&nbsp;menu_1</span></p>
</td>
<td>
<p><span><span>&nbsp;menu_2</span></span></p>
</td>
<td>
<p>&nbsp;menu_new</p>
</td>
</tr>
<tr>
<td>
<p>&nbsp;TestPage_1</p>
</td>
<td>
<p>&nbsp;TestPage_4</p>
</td>
<td>&nbsp;TestPage_NEW</td>
</tr>
<tr>
<td>
<p>&nbsp;TestPage_2</p>
</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>
<p>&nbsp;TestPage_3</p>
</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>&nbsp;Exit</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>

아래는 실행시켜본 결과 화면이다.

메인 화면 안에서 MDI 화면들이 보이고

각 화면 크기 조절이 가능하고

메뉴는 보이는 것과 같이 등록이 되고

최소화 했을 경우 좌측 하단에 보이는 것과 같이 나타나진다.

![0076-54-javafx-mdi-multi-document-interface-img-01.jpg](/tech-blog/resources/images/migration/0076-54-javafx-mdi-multi-document-interface/img-01.jpg)

 중간에 예제 프로젝트 소스를 첨부 했으니 원하는 대로 만들어 사용하면 될 것 같다.

소스 참고 : [github _ lincolnminto](https://github.com/lincolnminto/javaFXMDI)

영상 참고 : [youtube _ Lincoln Minto](https://www.youtube.com/watch?v=Q-5c1zPFaGY)
