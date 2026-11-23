---
title: Go 개발 환경 설정과 Hello World (using 'VS Code')
description: >-
  Windows에 Go 1.16.4를 설치하고 VS Code에 Go 확장을 더해 main.go로 Hello World를 출력하기까지의 과정을 정리했다. main 패키지와 main 함수가 왜 필요한지도 설명한다.
publishedAt: '2021-05-16'
updatedAt: '2021-05-16'
tags:
  - Go
  - Environment
status: needs-review
---
[Go 를 설치하기 위해 다운로드 사이트에 접속 한다.](https://golang.org/)

![golang.org 메인 페이지에서 Download Go 버튼을 확인하는 Go 설치 첫 단계](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-01.jpg)

'Download Go' 버튼을 클릭한다.

![Go Downloads 페이지에서 OS별 설치 파일 중 Microsoft Windows용 go1.16.4 msi를 고르는 단계](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-02.jpg)

OS 별로 설치 파일이 다른데 현재 윈도우 플랫폼을 사용하고 있기 때문에 'Microsoft Windows' 를 클릭 했다.

![Download and install 페이지로 이동하며 go1.16.4 windows msi 다운로드가 자동으로 시작된 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-03.jpg)

페이지가 이동 하면서 자동으로 다운로드가 시작 되었다.

![Go 1.16.4 설치 마법사의 시작 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-04.jpg)

다운받은 msi 프로그램을 실행해서 Go를 설치 했다.

![Go 1.16.4 설치 마법사에서 라이선스 동의에 체크하는 단계](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-05.jpg)

![Go 설치 마법사의 Destination Folder 단계에서 기본 경로 C:\Program Files\Go를 그대로 두는 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-06.jpg)

강의 에서는 C 루트 디렉토리 하위에 바로 'go' 라는 패키지(폴더)를 만들었는데

설치 프로그램의 기본 경로가 'Program Files' 여서 그냥 냅두기로 했다.

![Go 설치 마법사의 Ready to install 단계에서 Install 버튼을 누르기 직전 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-07.jpg)

![Go 설치 마법사가 파일을 복사하며 설치를 진행 중인 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-08.jpg)

![Go 1.16.4 설치 마법사의 설치 완료 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-09.jpg)

설치가 끝나면 아래와 같이 C:\Program Files\Go 경로 하위에 아래와 같은 것들이 새로 생긴것을 확인할 수 있다.

![설치 후 C:\Program Files\Go 아래에 생긴 bin, pkg, src 등 폴더 목록](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-10.jpg)

![Go 설치 경로의 src\github.com\nimkoes\learngo 폴더에 빈 main.go 파일을 만든 탐색기 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-11.jpg)

그리고 강의의 실습을 하기 위해 만들라고 한 폴더들을 만들었다.

강의 내용대로라면, C 루트에 go 폴더 아래 'src\github.com\{깃헙 계정}\learngo' 를 만들어야 했지만,

설치했을 때 기본 경로에 있는 src 폴더 하위에 만들었다.

![VS Code에서 빈 main.go를 열자 Go 확장 설치를 권하는 알림이 뜬 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-12.jpg)

메모장으로 main.go 파일을 만들고, 이 파일을 VS Code 에서 열었다.

eclipse 를 많이 사용해왔고, 요즘엔 intelliJ 를 사용하고 있는데, VS Code 를 사용하길래 이번에 써보기로 했다.

이것 저것 설치하라고 나오면 전부 설치하라고 해서 설치했는데, 그리 오래 걸리지는 않았다.

![VS Code에 Go 확장 v0.23.0을 설치하고 gopls, dlv 등 Go 도구 설치가 끝난 출력 창](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-13.jpg)

여기서 만든 main.go 라는 파일에 대해 'main 이라는 패키지' 라고 언급 했다.

아무래도 go 파일을 패키지 라고 읽는것 같다.

main 이라는 이름으로 만든것의 의미는 프로젝트를 컴파일 해서 사용하고 싶다는 것을 뜻한다.

이렇게 한다는 것은 서버를 시작하고 그 이후엔 웹을 스크랩 해온다는 것을 뜻한다.

(웹을 스크랩 한다는 것은, 지금 수강하는 Go 강의에서 만드는 프로젝트의 목적이기 때문이다.)

그래서 이런 것들을 하기 위해 main.go 라는 파일이 필요하다.

목적에 따라 프로젝트 컴파일이 필요하지 않을수도 있는데,

예를 들면 다른 사람들과 공유하기 위한 라이브러리를 만든다던가 오픈소스에 기여하는 등의 경우이다.

Java 의 경우도 생각해보면, main 메소드를 포함하는 클래스는 Java 애플리케이션을 구동하기 위해서 만드는 것 처럼 굳이 애플리케이션을 구동할 필요가 없으면 main 메소드 없이 라이브러리로 사용할 수 있도록 .java 파일을 생성하는 것과 같은것 같다.

![VS Code의 main.go에 package main 한 줄만 작성한 상태](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-14.jpg)

Go 에서는 내가 어떤 패키지를 사용할지 명시해 줘야 한다.

지금의 경우 사용 할 package 는 main 이다.

만약 이 상태로 프로그램을 실행 한다면 다음과 같은 오류가 발생 한다.

![VS Code 터미널에서 go run main.go가 파일을 찾지 못해 The system cannot find the file specified 오류를 낸 화면](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-15.jpg)

'The system cannot find the file specified' 라고 하는것으로 보아 main.go 라는 파일을 찾지 못한 것 같다.

TERMINAL 의 경로를 보니 아무래도 이상한 곳에 들어와 있는것 같아서 main.go 가 있는 위치로 이동한 다음 명령어를 실행해 보았다.

![learngo 폴더로 이동해 go run main.go를 실행하자 저장 안 된 빈 파일 때문에 expected package, found EOF 오류가 난 터미널](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-16.jpg)

강의에서 원하는 오류는 'function main is undeclared in the main package' 인데

'expected 'package', found 'EOF'' 오류가 발생했다.

같은 문제인데 혹시 강의에서 사용한 Go 버전과 달라서 메시지가 다른건가 싶은 생각도 해봤지만, 그건 아닌것 같아 보인다.

무엇 때문에 그랬는지 금방 알게 되었다.

수정한 파일을 저장하지 않아서 현재 저장된 파일은 빈 파일이었다.

intelliJ 를 쓰면 기본적으로 수정한 내용이 자동 저장되다보니 깜빡했다.

참고로 EOF 는 end of file 의 줄임 말로, 보통 파일의 맨 마지막을 읽었을 때 반환하는, 구분하는 값이다.

-1 로 판단 하기도 한다.

![파일을 저장한 뒤 go run main.go가 function main is undeclared in the main package 오류를 출력한 터미널](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-17.jpg)

파일을 저장하고 실행 했더니 기대했던 오류가 발생했다.

Go 는 Node.js 와 Python 과 달리 특정 function을 찾는다. 이건 마치 일반적인 Java 애플리케이션에서 main 메소드를 찾는것과 같은 느낌이다.

Go 에서는 이런 프로그램의 시작점으로 main 이라는 함수를 찾는데, 다음과 같이 선언한다.

```go
package main

func main() {

}
```

Go 의 컴파일러는 main package 와 그 안에 있는 main function 을 찾고 프로그램을 시작한다.

여기까지 듣다보니 main 은 컴파일을 위한 것이라는 말을 계속해서 강조한다.

처음에는 Java 와 비교했을 때, main 이 없으면 라이브러리로 제공하기 위함이라고 생각했는데,

Go 에서는 main 이 없으면 컴파일 자체를 하지 않는것 같다.

이 부분에 대해서는 조금 더 지켜봐야겠다.

예외는 없다. Hello World 를 출력 해보자.

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello World!")
}
```

![fmt.Println으로 작성한 main.go를 go run으로 실행해 Hello World!가 출력된 VS Code 터미널](/tech-blog/resources/images/migration/0109-270-go-hello-world-using-vs-code/img-18.jpg)

fmt 가 뭔지 모르겠지만, fmt 를 사용하자 VS Code 가 자동으로 fmt 를 import 해줬다.

Java 에서는 기본 출력에 대해 lang 패키지가 명시하지 않아도 자동으로 추가 되었는데, 이 부분은 조금 다른것 같다.

자동완성을 해주긴 하지만, 어떻게 보면 번거롭고 또 어떻게 보면 보다 명시적이라 좋은것 같다.

Hello World 를 출력 했으니 뭔가 마음이 놓인다.
