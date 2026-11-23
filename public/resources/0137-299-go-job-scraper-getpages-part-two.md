---
title: 'Go ''JOB SCRAPER'' : getPages part two'
description: >-
  Go goquery의 Find와 Each로 Indeed 검색 결과의 pagination 링크 수를 세고, URL의 start 파라미터 규칙을 이용해 페이지별 요청 URL을 만드는 getPages 코드를 정리했다.
publishedAt: '2021-05-29'
updatedAt: '2021-05-29'
tags:
  - Go
  - Job Scraper
  - Web Scraping
status: needs-review
---
이번에는 'part one' 에서 goquery 를 사용해 가져온 Document 를 다뤄보려고 한다.

```go
doc.Find(".pagination")
```

코드를 사용해서 DOM 의 '.pagination' 클래스 요소를 찾았는데, 참조 연산을 해보면 Each 라는 공개된 function 이 있다.

![VS Code에서 goquery Selection의 Each 함수가 인덱스와 Selection을 받는 함수를 인자로 받는다는 설명 팝업](/tech-blog/resources/images/migration/0137-299-go-job-scraper-getpages-part-two/img-01.jpg)

Each function 에 대한 설명을 보면, 매개값으로 function 을 전달 받는다.

```go
doc.Find(".pagination").Each(func(i int, s *goquery.Selection) {
	fmt.Println(s.Html())
})
```

i 는 Find 함수로 '.patination' 클래스를 찾은 요소들을 배열 형태로 가져왔다고 했을 때 그 index 이고

s 는 실제로 선택한 요소를 뜻한다.

이건 마치 jQuery 를 사용하는 것 같다.

이 코드를 실행하면 선택한 요소의 Html 을 출력하라고 했으니, 다음과 같은 결과를 볼 수 있다.

![Each로 .pagination 요소의 Html을 출력해 pagination-list ul 태그가 한 줄로 길게 찍힌 터미널](/tech-blog/resources/images/migration/0137-299-go-job-scraper-getpages-part-two/img-02.jpg)

에디터를 사용해서 줄 정리를 조금 하면 다음과 같다.

![출력된 pagination HTML을 줄 정리해 li 안에 start 값이 다른 a 링크 5개가 보이는 에디터 화면](/tech-blog/resources/images/migration/0137-299-go-job-scraper-getpages-part-two/img-03.jpg)

doc.Find 를 조금 수정해서 이 요소 내에 링크가 (a 태그가) 몇 개 있는지 출력해보자.

```go
doc.Find(".pagination").Each(func(i int, s *goquery.Selection) {
	fmt.Println(s.Find("a").Length())
})
```

![pagination 안의 a 태그 개수를 세는 코드를 실행해 5가 출력된 터미널](/tech-blog/resources/images/migration/0137-299-go-job-scraper-getpages-part-two/img-04.jpg)

위에 html 코드를 출력한 결과를 보면 그 안에 'a' 태그가 5개 있는 것을 볼 수 있고

![Indeed 검색 결과 하단 페이지 번호에서 2, 3, 4, 5, 다음 링크 5개를 표시한 화면](/tech-blog/resources/images/migration/0137-299-go-job-scraper-getpages-part-two/img-05.jpg)

실제 사이트에서 보면 2, 3, 4, 5, > 의 5개의 링크가 있는 것을 볼 수 있다.

다음으로 baseURL 을 보면 규칙이 하나 있는 것을 볼 수 있다.

![Indeed 검색 결과 페이지마다 URL의 start 값이 0, 50, 100, 150, 200으로 늘어나는 규칙을 표시한 브라우저 화면](/tech-blog/resources/images/migration/0137-299-go-job-scraper-getpages-part-two/img-06.jpg)

검색 결과 페이지와 URL 의 query paramter 의 start 값이 관련이 있다.

그래서 다음과 같이 코드를 개선할 수 있다.

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/PuerkitoBio/goquery"
)

var baseURL string = "https://kr.indeed.com/jobs?q=python&limit=50"

func main() {
	totalPaces := getPages()
	fmt.Println(totalPaces)

	for i := 0; i < totalPaces; i++ {
		getPage(i)
	}
}

func getPage(page int) {
	pageURL := baseURL + "&start=" + strconv.Itoa(page*50)
	fmt.Println("Requesting", pageURL)
}

func getPages() int {
	pages := 0
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

	doc.Find(".pagination").Each(func(i int, s *goquery.Selection) {
		pages = s.Find("a").Length()
	})

	return pages
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

![getPages로 구한 5페이지만큼 start 값을 바꾼 Indeed 요청 URL 5개를 출력한 터미널](/tech-blog/resources/images/migration/0137-299-go-job-scraper-getpages-part-two/img-07.jpg)

getPages function 으로 현재 보고있는 페이지에 페이징 처리 되어있는 링크의 개수를 출력하고

그 개수만큼 반복 하면서 query string 의 start 값을 바꿔가며

1, 2, 3, 4, 5 페이지의 URL 을 출력하도록 했다.

goquery 가 DOM 요소에 쉽게 접근할 수 있어서 할 수 있는게 많을것 같다.
