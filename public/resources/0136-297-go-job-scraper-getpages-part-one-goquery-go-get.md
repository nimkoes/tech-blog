JOB SCRAPPER 프로젝트에서는 [indeed 홈페이지](https://kr.indeed.com/?from=gnav-jobsearch--jasx)를 활용한다.

아무 검색어를 넣고 검색을 해보자. 검색 결과 얼마나 많은 페이지가 있는지 알아내야 한다.

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-01.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-01.jpg)

스크롤을 맨 아래로 내리면 페이징 처리 되어있는 것을 볼 수 있다.

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-02.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-02.jpg)

그리고 주소창을 보면 'start' 라는 query parameter 가 있는 것을 확인할 수 있다.

우선 goroutine 을 사용하지 않고 구현을 해보고, 그 다음 goroutine 을 사용해볼 예정이다.

HTML 을 navigate 하고 필요한 HTML 요소를 찾아내기 위해 'goquery' 라는 것을 사용한다.

'goquery' 는 'jQuery' 와 같은 건데, 단지 go 를 위해 만든 것이다.

설치하는 방법은 간단하다.

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-03.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-03.jpg)

VS Code 의 TERMINAL 에 입력해준다.

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-04.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-04.jpg)

설치가 되었으니 실습을 하기 위해 'part4_job_scrapper' 패키지를 만들고 그 안에 'main.go' 파일을 생성한다.

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-05.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-05.jpg)

'main.go' 파일도 생성 했으니, 앞으로 할 일을 정리해보자.

우선 페이징 처리 되어있던 각 페이지를 가져온 다음 각 페이지의 job 들을 추출해서 excel 파일로 저장 하는 프로그램을 만들 것이다.

우선 indeed 페이지의 url 을 복사해서 다음과 같이 'main.go' 파일을 작성 한다.

```go
package main

import "net/http"

var baseURL string = "https://kr.indeed.com/jobs?q=java&limit=50"

func main() {
	pages := getPages()
}

func getPages() int {
	res, err := http.Get(baseURL)
	return 0
}
```

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-06.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-06.jpg)

이 상태로 실행 해보면, 정의 했지만 사용하지 않은 변수에 대해서만 언급하고 별다른 오류는 없어 보인다.

이제 goquery 를 사용해보자.

goquery 를 사용하는 방법은 매우 쉽다. 그저 'res.body' (응답 데이터의 body) 를 goquery 에 넘겨주면 된다.

우선 예외 처리를 먼저 해주자.

```go
package main

import (
	"log"
	"net/http"
)

var baseURL string = "https://kr.indeed.com/jobs?q=python&limit=50"

func main() {
	getPages()
}

func getPages() int {
	res, err := http.Get(baseURL)

	// err 가 있으면 프로그램 종료
	if err != nil {
		log.Fatalln(err)
	}

	// response status 가 200 (정상) 이 아니면 프로그램 종료
	if res.StatusCode != 200 {
		log.Fatalln("Request failed with Status:", res.Status)
	}
	return 0
}
```

이 외에도 계속해서 예외 (error) 체크를 해줘야 하기 때문에, 이것을 별도의 function 으로 만들어 보자.

그러면 다음과 같이 코드가 간결해진다.

```go
package main

import (
	"log"
	"net/http"
)

var baseURL string = "https://kr.indeed.com/jobs?q=python&limit=50"

func main() {
	getPages()
}

func getPages() int {
	res, err := http.Get(baseURL)

	checkErr(err)
	checkCode(res)

	return 0
}

// err 가 있으면 프로그램 종료
func checkErr(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}

// response status 가 200 (정상) 이 아니면 프로그램 종료
func checkCode(res *http.Response) {
	if res.StatusCode != 200 {
		log.Fatalln("Request failed with Status:", res.Status)
	}
}
```

func checkCode 에서 res 의 타입이 *httpResponse 인 이유는

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-07.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-07.jpg)

res 값의 타입이 *http.Response 이기 때문이다.

다음으로 goquery document 를 사용해보자.

main function 을 다음과 같이 수정한다.

```go
func getPages() int {
	res, err := http.Get(baseURL)

	checkErr(err)
	checkCode(res)

	defer res.Body.Close()

	/*
	 * res.body 는 기본적으로 byte 데이터 IO 를 하기 때문에
	 * 사용한 다음에 자원 해제 (close) 해줘야 한다.
	  * 메모리 누수를 막기 위해 defer 구문을 사용해서 닫아준다.
	 */
	doc, err := goquery.NewDocumentFromReader(res.Body)

	return 0
}
```

그러면 import 영역에 'goquery' 가 추가 된다.

```go
import (
	"log"
	"net/http"

	"github.com/PuerkitoBio/goquery"
)
```

하지만 이게 잘 안될 수 있다.

문제는 강의를 녹화할 당시의 버전과 지금 실습하고 있는 버전이 달라서 go 의 env 값 중 다른 부분이 있을 수 있다.

go 의 환경변수 정보는 'go env' 명령으로 확인할 수 있다.

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-08.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-08.jpg)

대략 위와 같이 출력이 되는데, 이 중 'GO111MODULE' 라는 값이 있다.

이 값의 기본값이 버전이 바뀌면서 on 이 되어 있는데, 그러면 go get 으로 goquery 모듈을 다운받으면 src 가 아닌 mod 영역에 생긴다.

그래서 다음 명령어로 이 값을 'off' 로 바꿔주어야 한다.

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-09.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-09.jpg)

강의 초반 환경변수나 모듈에 대한 설명을 하지 않아 원인을 찾는데 애먹었다.

이 설정을 변경하고나면 go get .. 명령으로 goquery 를 받으면 src 영역에 제대로 다운되는 것을 확인할 수 있다.

참고로 Go 에는 크게 두 가지 환경 변수가 있다.

GOROOT 와 GOPATH 인데, GOROOT 는 Go 가 설치 된 path 이고, GOPATH 는 workspace path 이다.

eclipse IDE 를 사용해서 Java 를 해본적이 있다면, 실행할 때 지정하는 workspace 경로와 같은 의미이다.

다시 본문으로 돌아와서, 지금까지 작성한 goquery 를 사용해서 doc 을 출력하는 예제 코드와 실행 결과는 다음과 같다.

```go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/PuerkitoBio/goquery"
)

var baseURL string = "https://kr.indeed.com/jobs?q=python&limit=50"

func main() {
	getPages()
}

func getPages() int {
	res, err := http.Get(baseURL)

	checkErr(err)
	checkCode(res)

	defer res.Body.Close()

	/*
	 * res.body 는 기본적으로 byte 데이터 IO 를 하기 때문에
	 * 사용한 다음에 자원 해제 (close) 해줘야 한다.
	  * 메모리 누수를 막기 위해 defer 구문을 사용해서 닫아준다.
	*/
	doc, err := goquery.NewDocumentFromReader(res.Body)

	checkErr(err)

	fmt.Println(doc)

	return 0
}

// err 가 있으면 프로그램 종료
func checkErr(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}

// response status 가 200 (정상) 이 아니면 프로그램 종료
func checkCode(res *http.Response) {
	if res.StatusCode != 200 {
		log.Fatalln("Request failed with Status:", res.Status)
	}
}
```

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-10.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-10.jpg)

goquery document 를 보면 사용할 수 있는 다양한 function 들이 있는데, 그 중에서 find 를 사용해 볼 것이다.

find function 을 사용하면 dom 요소에 접근할 수 있는것 같다.

페이징 관련된 요소에 접근하기 위해, baseURL 로 접속해서 개발자 도구의 선택자로 요소 정보를 확인한다.

![0136-297-go-job-scraper-getpages-part-one-goquery-go-get-img-11.jpg](/tech-blog/resources/images/migration/0136-297-go-job-scraper-getpages-part-one-goquery-go-get/img-11.jpg)

해당 요소의 class 값이 'pagination' 인 것을 확인할 수 있다.

이 값을 find 에서 사용하면 다음과 같이 작성할 수 있다.

```go
doc.Find(".pagination")
```

본 강의의 내용이 여기에서 멈췄기 때문에 우선 여기까지 정리하고, 다음 내용은 다음 포스트에서 다루기로 한다.
