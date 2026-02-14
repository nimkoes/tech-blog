지금까지 goroutine 에 대해 알아보았으니 'main.go' 파일에 작성했던 URL Checker 를 goroutine 을 사용해서 개선해보자.

```go
package main

import (
	"errors"
	"fmt"
	"net/http"
)

// channel 을 통해 주고 받을 데이터 타입으로 사용 할 struct 선언
type result struct {
	url    string
	status string
}

// 사용자 정의 error
var errRequestFailed = errors.New("Request failed")

func main() {

	// url 접속 결과를 담을 비어있는 map 선언
	results := make(map[string]string)

	// channel 생성
	c := make(chan result)

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

	// 실행 결과 출력
	for url, result := range results {
		fmt.Println(url, result)
	}
}

func hitURL(url string, c chan<- result) {

	// 현재 request 시도 하는 url 출력
	fmt.Println("Checking:", url)

	// Go reference 참고하여 url 에 Get 요청
	resp, err := http.Get(url)

	// result struct 의 status 값으로 사용 할 변수 선언
	status := "Ok"

	// err 가 있거나 http 응답 코드가 400 과 같거나 큰 경우 예외 처리
	if err != nil || resp.StatusCode >= 400 {
		status = "FAILED"
	}

	c <- result{url: url, status: status}
}
```

기존 'main.go' 와 다른 부분은 다음과 같다.

1. channel 을 사용해서 결과를 주고 받음
2. hitURL function 에서 channel 을 받을 때 'chan<-' 을 사용해서 function 내에서 channel 을 통할 때 방향을 지정. chan 을 중심으로 화살표가 향하고 있으므로 channel 에 데이터를 넣는 것만 하도록 강제했다. 만약 function 내에서 channel 의 데이터를 수신하는것만 하도록 강제 하려면 '<-chan' 으로 작성할 수 있다.

이 프로그램을 실행하면 다음과 같이 아무 결과를 출력하지 않는다.

![0134-295-go-url-checker-go-routines-url-checker-go-routines-img-01.jpg](/tech-blog/resources/images/migration/0134-295-go-url-checker-go-routines-url-checker-go-routines/img-01.jpg)

만약 지금까지 내용을 이해했다면 이렇게 출력되는게 당연하다.

왜냐하면 channel 을 사용해서 hitURL function 을 사용한 main function 의 어느 곳에서도 '<-c' 와 같이 channel 의 데이터를 기다리는 곳이 아무데도 없기 때문이다.

그래서 main 스레드는 goroutine 으로 생성한 별도의 스레드들을 시작했지만 그 실행 결과를 기다리지 않고 바로 종료해버린 것이다.

main function 에서 channel 의 데이터를 기다리는 부분은 다음 포스팅에서 정리한다.

이번 예제에서 기억할 만한 것은, channel 을 사용할 때 function 에서 chan 의 데이터 송수신 방향을 정해놓고 쓸 수 있다는 것이다.
