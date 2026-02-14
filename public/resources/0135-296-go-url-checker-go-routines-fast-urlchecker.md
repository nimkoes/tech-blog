사실 이 전에 작성한 코드로 URL Checker 구현이 끝났지만 출력하는 부분이 없었다.

앞서 다른 예제에서 goroutine 으로 실행한 결과를 channel 을 통해 수신하도록 '<- c' (c 는 channel 변수
) 를 적절하게 작성해 결과를 받아 처리하면 된다.

channel 을 통해 받은 모든 결과에 대해 'result = <-c' 를 생성된 goroutine 에 맞게 작성해도 동작 하지만, for 문을 사용해서 간결하게 작성하는게 더 좋다.

```go
package main

import (
	"errors"
	"fmt"
	"net/http"
)

// channel 을 통해 주고 받을 데이터 타입으로 사용 할 struct 선언
type requestResult struct {
	url    string
	status string
}

// 사용자 정의 error
var errRequestFailed = errors.New("Request failed")

func main() {

	// url 접속 결과를 담을 비어있는 map 선언
	results := make(map[string]string)

	// channel 생성
	c := make(chan requestResult)

	// 접속을 시도 할 url 목록
	urls := []string{
		"https://www.airbnb.com/",
		"https://www.google.com/",
		"https://www.amazon.com/",
		"https://www.reddit.com/",
		"https://www.google.com/",
		"https://soundcloud.com/",
		"https://www.facebook.com/",
		"https://www.instagram.com/",
		"https://academy.nomadcoders.co/",
		"https://xxxelppa.tistory.com/",
		"https://nimkoes.github.io/",
	}

	// 반복문을 사용하여 각 url 에 접속 시도
	for _, url := range urls {
		go hitURL(url, c)
	}

	// 결과를 map 에 담음

	for i := 0; i < len(urls); i++ {
		result := <-c
		results[result.url] = result.status
	}

	// map 에 담긴 결과 출력
	for url, status := range results {
		fmt.Println(url, status)
	}
}

func hitURL(url string, c chan<- requestResult) {

	// Go reference 참고하여 url 에 Get 요청
	resp, err := http.Get(url)

	// requestResult struct 의 status 값으로 사용 할 변수 선언
	status := "Ok"

	// err 가 있거나 http 응답 코드가 400 과 같거나 큰 경우 예외 처리
	if err != nil || resp.StatusCode >= 400 {
		status = "FAILED"
	}

	c <- requestResult{url: url, status: status}
}
```

URL Checker 의 완성된 코드이다.

수정한 것은 '<- c' 를 통해 받은 응답 데이터를 map 에 담고, 반복문을 사용해서 map 의 데이터를 보기 좋게 출력했을 뿐이다.

실행해보면 정말 빠르다는것을 확인할 수 있다.

![0135-296-go-url-checker-go-routines-fast-urlchecker-img-01.gif](/tech-blog/resources/images/migration/0135-296-go-url-checker-go-routines-fast-urlchecker/img-01.gif)

goroutine 을 사용하기 전에는 url 하나씩 순차적으로 확인했던것과 비교했을 때와 비교해보면 엄청나게 빨라진걸 알 수 있다.

체크하는 URL 이 각각 1초, 2초, 3초가 걸린다고 하면, goroutine 을 사용하기 전에는 6초가 걸렸겠지만 지금은 3초에 모든 작업이 끝난다.

작업의 선후관계가 명확한 프로그램이라면 또 고민을 해봐야겠지만, 지금 처럼 서로 독립적인 작업에 대해 쉽고 빠르게 처리할 수 있다.
