이번에는 go echo 서버를 만들어 본다.

본격적으로 만들어보기에 앞서 필요한 사전 작업들을 해보자.

우선 main package 에 있던 main function 을 다른 package 로 만들고, 실행이 아닌 호출 가능한 형태로 변경하려 한다.

![0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo-img-01.jpg](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-01.jpg)

우선 myScrap 라는 이름의 폴더를 만들고 그 안에 main.go 파일을 옮긴다.

그리고 main.go 파일의 이름을 myScrap.go 로 이름을 변경한다.

myScrap.go 가 된 파일을 열고

1. package 이름 변경

2. main function 이름을 myScrap function 으로 변경

3. 전역변수 baseURL 을 myScrap function 내부로 이동

4. myScrap function 에 string 타입의 변수 term 을 받아서 검색어로 사용할 수 있도록 baseURL 을 수정

한다.

전역변수를 지역변수로 옮긴 다음에는 다른 function 에서 사용할 수 있도록 매개변수로 추가해 준다.

![0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo-img-02.jpg](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-02.jpg)

![0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo-img-03.jpg](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-03.jpg)

그리고 myScrap 을 사용하는 main.go 파일을 만들어 보자.

![0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo-img-04.jpg](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-04.jpg)

새로 작성한 main.go 는 다음과 같다.

```go
package main

import "learngo/part4_job_scrapper/part4_1_getPages_part_one/myScrap"

func main() {
	myScrap.MyScrap("term")
}
```

![0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo-img-05.jpg](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-05.jpg)

실행 결과 여전히 잘 동작하는 것을 확인할 수 있다.

마지막으로 echo 패키지를 설치만 해보자.

go get github.com/labstack/echo 명령어로 패키지를 설치 한다.

![0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo-img-06.jpg](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-06.jpg)

![0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo-img-07.jpg](/tech-blog/resources/images/migration/0142-304-go-web-server-with-echo-setup-part-one-modify-to-callable-scraper-downlo/img-07.jpg)

사용은 다음시간에 해볼 수 있을것 같다.
