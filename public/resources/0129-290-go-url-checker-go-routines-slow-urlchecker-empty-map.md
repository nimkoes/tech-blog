이번에는 지난번에 작성했던 URL 접속 코드를 조금 개선했다.

개선된 것은 url 에 GET 요청을 보냈을 때 응답 결과를 확인할 수 있도록 map 을 사용하도록 한 부분이다.

정의한 results 이름의 map 은 key, value 타입을 모두 string 으로 사용한다.

map 을 정의할 때 주의할게 있는데, 마치 java 에서 선언만 하고 초기화 시켜주지 않으면 오류가 발생했던 것처럼 Go 에서도 empty 로 초기화 해주는 부분이 있어야 오류가 발생하지 않았다.

```go
// url 접속 결과를 담을 비어있는 map 선언
// 방법 1
results := map[string]string{}

// 방법 2
var results = map[string]string{}

// 방법 3 :: make 는 map 을 만들어주는 함수
var results = make(map[string]string)

// 이 방법은 panic: assignment to entry in nil map 발생
var results map[string]string
```

map 을 선언할 때, 맨 뒤에 중괄호 블럭 {} 을 작성해주거나 '방법 3' 과 같이 make function 을 사용해줘야 한다.

다음은 url 에 대해 GET 요청을 보냈을 때, 그 결과를 map 에 담아 출력하는 예제 코드이다.

```go
package main

import (
	"errors"
	"fmt"
	"net/http"
)

// 사용자 정의 error
var errRequestFailed = errors.New("Request failed")

func main() {

	// url 접속 결과를 담을 비어있는 map 선언
	// 방법 1
	// results := map[string]string{}

	// 방법 2
	// var results = map[string]string{}

	// 방법 3 :: make 는 map 을 만들어주는 함수
	var results = make(map[string]string)

	// 이 방법은 panic: assignment to entry in nil map 발생
	// var results map[string]string

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
		result := "OK"

		err := hitURL(url)

		// function 실행 결과 err 가 있으면 메시지 출력
		if err != nil {
			// err 가 nil 이 아니면 result 를 FAILED 처리
			result = "FAILED"
		}

		// url 에 대한 GET request 결과를 map 에 저장
		results[url] = result
	}

	fmt.Println()

	// 실행 결과 출력
	for url, result := range results {
		fmt.Println(url, result)
	}
}

func hitURL(url string) error {

	// 현재 request 시도 하는 url 출력
	fmt.Println("Checking:", url)

	// Go reference 참고하여 url 에 Get 요청
	resp, err := http.Get(url)

	// err 가 있거나 http 응답 코드가 400 과 같거나 큰 경우 예외 처리
	if err != nil || resp.StatusCode >= 400 {
		fmt.Println(err, resp.StatusCode)
		return errRequestFailed
	}

	return nil
}
```

![0129-290-go-url-checker-go-routines-slow-urlchecker-empty-map-img-01.gif](/tech-blog/resources/images/migration/0129-290-go-url-checker-go-routines-slow-urlchecker-empty-map/img-01.gif)

제목이 Slow URL Checker 인 이유는 각 url 에 대해 동시에 처리가 되지 않고 순차 처리가 되기 때문이다.

각 작업은 독립적으로 서로의 결과에 영향을 주지 않고, 순서 또한 중요하지 않기 때문에 동시에 처리가 되어도 된다.

다음 시간부터 이 코드를 병렬처리 하는 방법이 대한 내용을 시작할 것 같다.
