지난번에 이쁘지않게(?) 출력된 결과를 보기 좋게 정리를 하면서 시작 하려 한다.

[Go 의 strings 에 대한 document](https://golang.org/pkg/strings/) 를 보면 사용할 수 있는 다양한 function 들이 있다.

그 중에 Trim, Fields, Join 을 사용해서 다음과 같은 function 을 만들었다.

```go
func cleanString(str string) string {
	// strings.TrimSpace -> 문자열의 양 끝 공백 제거
	// strings.Fields    -> 문자열을 공백 기준으로 모두 잘라 []string 으로 만듬
	// strings.Join      -> 구분자로 이어진 문자열을 만듬
	// [ex]
	// "   가나다  라    마바사    "
	// TrimSpace      -> "가나다  라    마바사"
	// Fields (array) -> "가나다", "라", "마바사"
	// Join " " 구분자 -> "가나다 라 마바사"
	return strings.Join(strings.Fields(strings.TrimSpace(str)), " ")
}
```

그리고 앞서 작성한 getPage function 에서 title 과 location 에 대해 cleanString function 을 사용해서 정리하도록 수정한다.

```go
func getPage(page int) {
	pageURL := baseURL + "&start=" + strconv.Itoa(page*50)
	fmt.Println("Requesting", pageURL)

	res, err := http.Get(pageURL)

	checkErr(err)
	checkCode(res)

	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	checkErr(err)

	searchCards := doc.Find(".jobsearch-SerpJobCard")

	searchCards.Each(func(i int, card *goquery.Selection) {
		id, _ := card.Attr("data-jk")
		title := cleanString(card.Find(".title > a").Text())
		location := cleanString(card.Find(".sjcl").Text())

		fmt.Println(id, title, location)
	})
}
```

실행 결과를 보면 이전에 출력했을 때 보다 훨씬 정리되어 보기 편해졌다.

![0139-301-go-job-scraper-extractjob-part-two-img-01.jpg](/tech-blog/resources/images/migration/0139-301-go-job-scraper-extractjob-part-two/img-01.jpg)

getPage function 의 searchCard.Each 내용이 복잡해지고 있기 때문에, 별도의 function 을 만들어서 다음과 같이 분리 한다.

```go
func getPage(page int) {
	pageURL := baseURL + "&start=" + strconv.Itoa(page*50)
	fmt.Println("Requesting", pageURL)

	res, err := http.Get(pageURL)

	checkErr(err)
	checkCode(res)

	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	checkErr(err)

	searchCards := doc.Find(".jobsearch-SerpJobCard")

	searchCards.Each(func(i int, card *goquery.Selection) {
		extractJob(card)
	})
}

func extractJob(card *goquery.Selection) {
	id, _ := card.Attr("data-jk")
	title := cleanString(card.Find(".title > a").Text())
	location := cleanString(card.Find(".sjcl").Text())

	fmt.Println(id, title, location)
}
```

결국 하는 일은 똑같지만 *goquery.Selection 타입의 card 에서 정보를 추출하는 부분을 별도의 function 으로 분리했다.

그리고 struct 에서 정의했는데 수집하지 않았던 sarary 와 summary 도 같이 가져오도록 extractJob function 을 수정 했다.

```go
func extractJob(card *goquery.Selection) {
	id, _ := card.Attr("data-jk")
	title := cleanString(card.Find(".title > a").Text())
	location := cleanString(card.Find(".sjcl").Text())
	salary := cleanString(card.Find(".salaryText").Text())
	summary := cleanString(card.Find(".summary").Text())

	fmt.Println(id, title, location, salary, summary)
}
```

![0139-301-go-job-scraper-extractjob-part-two-img-02.jpg](/tech-blog/resources/images/migration/0139-301-go-job-scraper-extractjob-part-two/img-02.jpg)

이 코드를 struct 를 사용하는 코드로 개선해보자.

우선 extractJob function 이 fmt.Println 으로 출력하는 부분에 대해 struct 를 생성하고 반환하도록 수정한다.

```go
func extractJob(card *goquery.Selection) extractedJob {
	id, _ := card.Attr("data-jk")
	title := cleanString(card.Find(".title > a").Text())
	location := cleanString(card.Find(".sjcl").Text())
	salary := cleanString(card.Find(".salaryText").Text())
	summary := cleanString(card.Find(".summary").Text())

	return extractedJob{
		id:       id,
		title:    title,
		location: location,
		salary:   salary,
		summary:  summary}
}
```

반환 타입의 extractedJob 은 전역에 선언된 struct 타입이다.

extractJob function 을 호출해서 사용하고있는 getPage function 에 대해 extractedJob struct 를 타입으로 가지는 jobs slice 를 선언하고

```go
var jobs []extractedJob
```

extractJob function 실행 결과 반환하는 값을 하나씩 추가하도록 한다.

```go
func getPage(page int) []extractedJob {

	var jobs []extractedJob

	pageURL := baseURL + "&start=" + strconv.Itoa(page*50)
	fmt.Println("Requesting", pageURL)

	res, err := http.Get(pageURL)

	checkErr(err)
	checkCode(res)

	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	checkErr(err)

	searchCards := doc.Find(".jobsearch-SerpJobCard")

	searchCards.Each(func(i int, card *goquery.Selection) {
		job := extractJob(card)
		jobs = append(jobs, job)
	})

	return jobs
}
```

그리고 getPage function 은 []extractedJob 타입의 값인 jobs 를 반환한다.

마지막으로 getPage function 을 호출하는 main function 에서도 getPage function 이 반환하는 []extractedJob 타입의 값을 추가할 수 있도록 slice 를 선언하고 append 하도록 한다.

```go
func main() {

	var jobs []extractedJob

	totalPaces := getPages()

	for i := 0; i < totalPaces; i++ {
		extractedJobs := getPage(i)
		jobs = append(jobs, extractedJobs...)
	}

	fmt.Println(jobs)
}
```

그리고 마지막에 fmt.Println 으로 결과를 출력하면 다음과 같은 결과를 볼 수 있다.

![0139-301-go-job-scraper-extractjob-part-two-img-03.jpg](/tech-blog/resources/images/migration/0139-301-go-job-scraper-extractjob-part-two/img-03.jpg)

길어서 일부만 출력 했지만 붉은색 네모 표시한 부분을 보면, 추출한 데이터가 struct 형태로 잘 만들어 졌으며, 전체 데이터가 배열의 요소로 추가되어 만들어진 것을 확인할 수 있다.

마지막으로 지금까지 작성한 전체 코드를 첨부 한다.

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type extractedJob struct {
	id       string
	title    string
	location string
	salary   string
	summary  string
}

var baseURL string = "https://kr.indeed.com/jobs?q=python&limit=50"

func main() {

	var jobs []extractedJob

	totalPaces := getPages()

	for i := 0; i < totalPaces; i++ {
		extractedJobs := getPage(i)
		jobs = append(jobs, extractedJobs...)
	}

	fmt.Println(jobs)
}

func getPage(page int) []extractedJob {

	var jobs []extractedJob

	pageURL := baseURL + "&start=" + strconv.Itoa(page*50)
	fmt.Println("Requesting", pageURL)

	res, err := http.Get(pageURL)

	checkErr(err)
	checkCode(res)

	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	checkErr(err)

	searchCards := doc.Find(".jobsearch-SerpJobCard")

	searchCards.Each(func(i int, card *goquery.Selection) {
		job := extractJob(card)
		jobs = append(jobs, job)
	})

	return jobs
}

func extractJob(card *goquery.Selection) extractedJob {
	id, _ := card.Attr("data-jk")
	title := cleanString(card.Find(".title > a").Text())
	location := cleanString(card.Find(".sjcl").Text())
	salary := cleanString(card.Find(".salaryText").Text())
	summary := cleanString(card.Find(".summary").Text())

	return extractedJob{
		id:       id,
		title:    title,
		location: location,
		salary:   salary,
		summary:  summary}
}

func cleanString(str string) string {
	// strings.TrimSpace -> 문자열의 양 끝 공백 제거
	// strings.Fields    -> 문자열을 공백 기준으로 모두 잘라 []string 으로 만듬
	// strings.Join      -> 구분자로 이어진 문자열을 만듬
	// [ex]
	// "   가나다  라    마바사    "
	// TrimSpace      -> "가나다  라    마바사"
	// Fields (array) -> "가나다", "라", "마바사"
	// Join " " 구분자 -> "가나다 라 마바사"
	return strings.Join(strings.Fields(strings.TrimSpace(str)), " ")
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

지금은 페이징 처리 된 페이지 하나씩 순차적으로 처리 했지만, 사실 이 데이터들은 순서를 가질 필요가 없기 때문에 병렬 또는 동시에 처리되어도 무방하다.

동시 처리 했을 때 얼마나 성능이 좋아질지 예상되기 때문에 다음 내용이 기대 된다.
