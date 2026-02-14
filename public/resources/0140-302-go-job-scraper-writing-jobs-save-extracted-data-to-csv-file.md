이번에는 추출한 정보를 csv 파일로 저장 해보자.

[Go 에는 csv 관련 패키지가 있다.](https://golang.org/pkg/encoding/csv/#example_Writer)

csv 파일을 만드는 writeJobs function 을 다음과 같이 만든다.

```go
func writeJobs(jobs []extractedJob) {
	file, err := os.Create("jobs.csv")

	checkErr(err)

	w := csv.NewWriter(file)
	defer w.Flush()

	headers := []string{"ID", "Title", "Location", "Salary", "Summary"}

	wErr := w.Write(headers)
	checkErr(wErr)
}
```

이 코드를 실행하면 'jobs.csv' 파일을 만들고, 생성된 파일을 열어보면 다음과 같이 header 에 정의한 내용이 작성되어 있는것을 볼 수 있다.

![0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file-img-01.jpg](/tech-blog/resources/images/migration/0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file/img-01.jpg)

![0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file-img-02.jpg](/tech-blog/resources/images/migration/0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file/img-02.jpg)

참고로 csv 는 comma separated variables 의 줄임말로 데이터를 콤마로 구분해서 저장하는 방식이다.

writeJobs function 의 매개변수로 넘어온 []extractedJob 타입의 jobs 를 직접 파일에 써보자.

다음과 같이 for 문을 추가하고 실행해보자.

```go
func writeJobs(jobs []extractedJob) {
	file, err := os.Create("jobs.csv")

	checkErr(err)

	w := csv.NewWriter(file)
	defer w.Flush()

	headers := []string{"ID", "Title", "Location", "Salary", "Summary"}

	wErr := w.Write(headers)
	checkErr(wErr)

	for _, job := range jobs {
		jobSlice := []string{job.id, job.title, job.location, job.salary, job.summary}
		jwErr := w.Write(jobSlice)
		checkErr(jwErr)
	}
}
```

![0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file-img-03.jpg](/tech-blog/resources/images/migration/0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file/img-03.jpg)

너무 작아서 잘 안보이겠지만, 맨 위에 빨강 네모에 header 가 출력되고, 그 아래 추출한 데이터들이 잘 써진것을 볼 수 있다.

excel 에서 열어도 되지만, 간단하게 확인해보기 위해 [csv 파일을 정리해서 보여주는 홈페이지에서 확인해보자.](http://convertcsv.com/csv-viewer-editor.htm)

![0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file-img-04.jpg](/tech-blog/resources/images/migration/0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file/img-04.jpg)

1A 영역을 한 번 클릭하고, csv 파일의 내용을 전체 복사한 다음에 붙여넣는다.

![0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file-img-05.jpg](/tech-blog/resources/images/migration/0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file/img-05.jpg)

깔끔하게 정리되어 보기 좋게 출려되는 것을 확인할 수 있다.

마지막으로 ID 에 해당하는 데이터는 그 job 의 상세 페이지로 이동하는 링크가 되어야 한다.

그래서 csv 파일에 쓸 때 다음과 같이 링크가 될 수 있도록 저장되는 내용을 수정해야 한다.

```go
for _, job := range jobs {
	jobSlice := []string{"https://kr.indeed.com/viewjob?jk=" + job.id, job.title, job.location, job.salary, job.summary}
	jwErr := w.Write(jobSlice)
	checkErr(jwErr)
}
```

for 문에서 job.id 대신 "https://kr.indeed.com/viewjob?jk=" + job.id 로 저장될 수 있도록 수정한다.

![0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file-img-06.jpg](/tech-blog/resources/images/migration/0140-302-go-job-scraper-writing-jobs-save-extracted-data-to-csv-file/img-06.jpg)

그러면 이제 위와 같이 url 이 저장 되고 링크를 열어보면 job 의 상세 정보를 볼 수 있는 페이지로 바로 이동할 수 있다.

다음은 지금까지 작성한 전체 코드이다.

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

	totalPaces := getPages()

	for i := 0; i < totalPaces; i++ {
		extractedJobs := getPage(i)
		jobs = append(jobs, extractedJobs...)
	}

	writeJobs(jobs)
	fmt.Println("Done, extracted :", len(jobs))
}

func writeJobs(jobs []extractedJob) {
	file, err := os.Create("jobs.csv")

	checkErr(err)

	w := csv.NewWriter(file)
	defer w.Flush()

	headers := []string{"ID", "Title", "Location", "Salary", "Summary"}

	wErr := w.Write(headers)
	checkErr(wErr)

	for _, job := range jobs {
		jobSlice := []string{"https://kr.indeed.com/viewjob?jk=" + job.id, job.title, job.location, job.salary, job.summary}
		jwErr := w.Write(jobSlice)
		checkErr(jwErr)
	}
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
