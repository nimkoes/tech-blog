---
title: >-
  Go 'WEB SERVER WITH ECHO' : Setup Part One, modify to callable scraper &
  download echo
description: >-
  Go echo 웹 서버를 만들기 위해 job scrapper의 main 함수를 검색어를 받는 MyScrap 패키지 함수로 바꿔 main.go에서 호출하고, go get으로 echo 패키지를 설치했다.
publishedAt: '2021-05-30'
updatedAt: '2021-05-30'
tags:
  - Go
  - Web Server
  - Echo
status: needs-review
---
이번에는 go echo 서버를 만들어 본다.

본격적으로 만들어보기에 앞서 필요한 사전 작업들을 해보자.

우선 main package 에 있던 main function 을 다른 package 로 만들고, 실행이 아닌 호출 가능한 형태로 변경하려 한다.

![VS Code 탐색기에서 main.go를 myScrap 폴더로 옮겨 myScrap.go로 이름을 바꾼 구조](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-01.jpg)

우선 myScrap 라는 이름의 폴더를 만들고 그 안에 main.go 파일을 옮긴다.

그리고 main.go 파일의 이름을 myScrap.go 로 이름을 변경한다.

myScrap.go 가 된 파일을 열고

1. package 이름 변경

2. main function 이름을 myScrap function 으로 변경

3. 전역변수 baseURL 을 myScrap function 내부로 이동

4. myScrap function 에 string 타입의 변수 term 을 받아서 검색어로 사용할 수 있도록 baseURL 을 수정

한다.

전역변수를 지역변수로 옮긴 다음에는 다른 function 에서 사용할 수 있도록 매개변수로 추가해 준다.

![myScrap.go에서 package 이름, term을 받는 MyScrap 함수, 함수 안 baseURL을 바꾼 부분을 표시한 코드](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-02.jpg)

![MyScrap 함수에서 baseURL을 getPages와 getPage 호출의 매개변수로 넘기도록 바꾼 코드](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-03.jpg)

그리고 myScrap 을 사용하는 main.go 파일을 만들어 보자.

![VS Code 탐색기에서 myScrap 폴더 옆에 새 main.go 파일을 만든 구조](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-04.jpg)

새로 작성한 main.go 는 다음과 같다.

```go
package main

import "learngo/part4_job_scrapper/part4_1_getPages_part_one/myScrap"

func main() {
	myScrap.MyScrap("term")
}
```

![새 main.go로 MyScrap을 호출해 indeed 페이지 5개를 요청하고 Done, extracted : 250이 출력된 터미널](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-05.jpg)

실행 결과 여전히 잘 동작하는 것을 확인할 수 있다.

마지막으로 echo 패키지를 설치만 해보자.

go get github.com/labstack/echo 명령어로 패키지를 설치 한다.

![go get github.com/labstack/echo 명령으로 echo 패키지를 설치한 터미널](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-06.jpg)

![설치 후 workspace_go/src/github.com/labstack 아래 echo 폴더가 생긴 디렉토리 구조](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-07.jpg)

사용은 다음시간에 해볼 수 있을것 같다.
