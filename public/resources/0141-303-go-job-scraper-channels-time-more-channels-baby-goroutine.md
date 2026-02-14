원하는 결과가 나왔지만 결과가 나오기까지 시간이 생각보다 오래 걸린다.

그래서 이것을 개선하기 위해 goroutine 을 적용할 계획을 세워보려 한다.

지금까지 작성한 코드의 실행 흐름은 다음과 같다.

![0141-303-go-job-scraper-channels-time-more-channels-baby-goroutine-img-01.jpg](/tech-blog/resources/images/migration/0141-303-go-job-scraper-channels-time-more-channels-baby-goroutine/img-01.jpg)

생각해보면 각각의 모든 작업들은 서로 모두 독립된 작업이다.

그래서 만약 getPage 와 extractJob function 이 동시에 처리할 수 있다면 단순한 계산으로 250배 빨라질 수 있는 여지가 있는 셈이다.

즉, 위와 같은 실행 흐름을 다음과 같이 바꿔보려는 것이다.

![0141-303-go-job-scraper-channels-time-more-channels-baby-goroutine-img-02.jpg](/tech-blog/resources/images/migration/0141-303-go-job-scraper-channels-time-more-channels-baby-goroutine/img-02.jpg)

대충 봐도 성능이 대폭 향상될 수 있을것 같아 보인다.

우선 getPage 와 extractJob function 사이에 channel 을 만들고 데이터를 주고 받을 수 있도록 수정한다.

```go
func getPage(page int) []extractedJob {

	var jobs []extractedJob

	// 데이터를 주고 받을 channel 을 생성
	c := make(chan extractedJob)

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
		// goroutine 으로 만들고 channel 을 넘겨준다.
		go extractJob(card, c)
	})

	// channel 로 부터 전달 받을 값의 수는 searchCards 의 길이와 동일하므로 반복문으로 작성한다.
	for i := 0; i < searchCards.Length(); i++ {
		job := <-c
		jobs = append(jobs, job)
	}

	return jobs
}

// channel 의 방향을 읽어오는 것만 허용하도록 하고 extractedJob 타입을 받도록 한다.
func extractJob(card *goquery.Selection, c chan<- extractedJob) {
	id, _ := card.Attr("data-jk")
	title := cleanString(card.Find(".title > a").Text())
	location := cleanString(card.Find(".sjcl").Text())
	salary := cleanString(card.Find(".salaryText").Text())
	summary := cleanString(card.Find(".summary").Text())

	// return 이 없어지고 channel 에 데이터를 전송 하는 것으로 수정한다.
	c <- extractedJob{
		id:       id,
		title:    title,
		location: location,
		salary:   salary,
		summary:  summary}
}
```

goroutine 을 사용해서 channel 을 통해 데이터를 주고 받는 것에 대한 설명은 해당 위치에 주석으로 작성 했다.

다음으로 getPage 와 main function 사이에 channel 을 만들어 goroutine 을 사용하도록 해보자.

```go
func main() {

	var jobs []extractedJob

	// 데이터를 주고 받을 channel 생성
	c := make(chan []extractedJob)

	totalPages := getPages()

	for i := 0; i < totalPages; i++ {
		// goroutine 으로 만들고 channel 을 넘겨준다.
		go getPage(i, c)
	}

	// channel 로 부터 전달 받을 값의 수는 totalPages 수와 동일하므로 반복문으로 작성한다.
	for i := 0; i < totalPages; i++ {
		extractJobs := <-c
		jobs = append(jobs, extractJobs...)
	}

	writeJobs(jobs)
	fmt.Println("Done, extracted :", len(jobs))
}

func getPage(page int, mainC chan<- []extractedJob) {

	var jobs []extractedJob

	// 데이터를 주고 받을 channel 을 생성
	c := make(chan extractedJob)

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
		// goroutine 으로 만들고 channel 을 넘겨준다.
		go extractJob(card, c)
	})

	// channel 로 부터 전달 받을 값의 수는 searchCards 의 길이와 동일하므로 반복문으로 작성한다.
	for i := 0; i < searchCards.Length(); i++ {
		job := <-c
		jobs = append(jobs, job)
	}

	// return 이 없어지고 channel 에 데이터를 전송 하는 것으로 수정한다.
	mainC <- jobs
}
```

goroutine 을 사용해서 channel 을 통해 데이터를 주고 받는 것에 대한 설명은 해당 위치에 주석으로 작성 했다.

마지막으로 파일에 쓰는 부분에도 goroutine 을 적용해봤다.

```go
func writeJobs(jobs []extractedJob) {
	file, err := os.Create("jobs.csv")
	checkErr(err)

	c := make(chan []string)

	w := csv.NewWriter(file)
	defer w.Flush()

	headers := []string{"ID", "Title", "Location", "Salary", "Summary"}

	wErr := w.Write(headers)
	checkErr(wErr)

	for _, job := range jobs {
		go writeDetail(job, c)
	}

	for i := 0; i < len(jobs); i++ {
		jobSlice := <-c
		jwErr := w.Write(jobSlice)
		checkErr(jwErr)
	}

}

func writeDetail(data extractedJob, c chan<- []string) {
	c <- []string{"https://kr.indeed.com/viewjob?jk=" + data.id, data.title, data.location, data.salary, data.summary}
}
```

아래는 작성한 전체 코드와 goroutine 적용 전과 후를 비교한 결과다.

```go
package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"net/http"
	"os"
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

	// 데이터를 주고 받을 channel 생성
	c := make(chan []extractedJob)

	totalPages := getPages()

	for i := 0; i < totalPages; i++ {
		// goroutine 으로 만들고 channel 을 넘겨준다.
		go getPage(i, c)
	}

	// channel 로 부터 전달 받을 값의 수는 totalPages 수와 동일하므로 반복문으로 작성한다.
	for i := 0; i < totalPages; i++ {
		extractJobs := <-c
		jobs = append(jobs, extractJobs...)
	}

	writeJobs(jobs)
	fmt.Println("Done, extracted :", len(jobs))
}

func writeJobs(jobs []extractedJob) {
	file, err := os.Create("jobs.csv")
	checkErr(err)

	c := make(chan []string)

	w := csv.NewWriter(file)
	defer w.Flush()

	headers := []string{"ID", "Title", "Location", "Salary", "Summary"}

	wErr := w.Write(headers)
	checkErr(wErr)

	for _, job := range jobs {
		go writeDetail(job, c)
	}

	for i := 0; i < len(jobs); i++ {
		jobSlice := <-c
		jwErr := w.Write(jobSlice)
		checkErr(jwErr)
	}

}

func writeDetail(data extractedJob, c chan<- []string) {
	c <- []string{"https://kr.indeed.com/viewjob?jk=" + data.id, data.title, data.location, data.salary, data.summary}
}

func getPage(page int, mainC chan<- []extractedJob) {

	var jobs []extractedJob

	// 데이터를 주고 받을 channel 을 생성
	c := make(chan extractedJob)

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
		// goroutine 으로 만들고 channel 을 넘겨준다.
		go extractJob(card, c)
	})

	// channel 로 부터 전달 받을 값의 수는 searchCards 의 길이와 동일하므로 반복문으로 작성한다.
	for i := 0; i < searchCards.Length(); i++ {
		job := <-c
		jobs = append(jobs, job)
	}

	// return 이 없어지고 channel 에 데이터를 전송 하는 것으로 수정한다.
	mainC <- jobs
}

// channel 의 방향을 읽어오는 것만 허용하도록 하고 extractedJob 타입을 받도록 한다.
func extractJob(card *goquery.Selection, c chan<- extractedJob) {
	id, _ := card.Attr("data-jk")
	title := cleanString(card.Find(".title > a").Text())
	location := cleanString(card.Find(".sjcl").Text())
	salary := cleanString(card.Find(".salaryText").Text())
	summary := cleanString(card.Find(".summary").Text())

	// return 이 없어지고 channel 에 데이터를 전송 하는 것으로 수정한다.
	c <- extractedJob{
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

![0141-303-go-job-scraper-channels-time-more-channels-baby-goroutine-img-03.gif](/tech-blog/resources/images/migration/0141-303-go-job-scraper-channels-time-more-channels-baby-goroutine/img-03.gif)

goroutine 을 적용하기 전에는 page 순서대로 실행하는 것을 볼 수 있다.

![0141-303-go-job-scraper-channels-time-more-channels-baby-goroutine-img-04.gif](/tech-blog/resources/images/migration/0141-303-go-job-scraper-channels-time-more-channels-baby-goroutine/img-04.gif)

goroutine 을 사용한 실행 결과이다.

대충 봐도 속도 차이가 많이 나는것을 확인할 수 있다.
