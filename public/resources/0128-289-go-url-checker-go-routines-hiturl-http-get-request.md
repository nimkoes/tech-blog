---
title: 'Go ''URL CHECKER & GO ROUTINES'' : hitURL, HTTP GET REQUEST'
description: >-
  Go net/http의 http.Get으로 여러 URL에 차례로 요청을 보내 상태 코드 400 이상이면 사용자 정의 error를 반환하는 URL 체커 hitURL 함수를 만들고 실행 결과를 정리했다.
publishedAt: '2021-05-22'
updatedAt: '2021-05-22'
tags:
  - Go
  - URL Checker
  - Goroutine
  - HTTP
status: needs-review
---
이번 시간부터 실행활에 적용할 수 있는 예제를 만들어 본다.

우선 임의의 URL 에 접속하는 예제를 만든다.

![VS Code 탐색기에서 part3_url_checker_and_go_routines 폴더 아래 main.go를 만든 구조](/tech-blog/resources/images/migration/0128-289-go-url-checker-go-routines-hiturl-http-get-request/img-01.jpg)

part3 에 대한 폴더를 만들고 그 안에 main.go 를 다음과 같이 작성한다.

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
		err := hitURL(url)

		// function 실행 결과 err 가 있으면 메시지 출력
		if err != nil {
			fmt.Println(err)
		}
	}
}

func hitURL(url string) error {

	// 현재 request 시도 하는 url 출력
	fmt.Println("Checking:", url)

	// Go reference 참고하여 url 에 Get 요청
	resp, err := http.Get(url)

	// err 가 있거나 http 응답 코드가 400 과 같거나 큰 경우 예외 처리
	if err != nil || resp.StatusCode >= 400 {
		return errRequestFailed
	}

	return nil
}
```

코드에 대한 설명은 주석에 작성하였기 때문에 이해하는데 별다른 어려움은 없을것 같다.

실행 결과는 다음과 같다.

![go run main.go로 URL을 차례로 확인하고 instagram에서만 Request failed가 출력되는 터미널](/tech-blog/resources/images/migration/0128-289-go-url-checker-go-routines-hiturl-http-get-request/img-02.gif)

생각보다 실행 결과가 빠르지 않았지만, 멀티쓰레드로 처리하면 지금보다 많이 빨라질 것 같다.

instagram 같은 경우 Request failed 가 되었는데, response code 를 출력해보니 429 가 나왔다.

429 응답 코드를 찾아보니 일정 시간 동안 너무 많은 요청을 할 경우라고 한다.

"The HTTP 429 Too Many Requests response status code indicates the user has sent too many requests in a given amount of time ("rate limiting")."

한 번 밖에 안했는데 조금 이상해서 브라우저에서 호출해 보았다.

![브라우저 개발자 도구에서 instagram.com GET 요청이 Status Code 200으로 응답한 화면](/tech-blog/resources/images/migration/0128-289-go-url-checker-go-routines-hiturl-http-get-request/img-03.jpg)

브라우저에서 접속했을 대는 200 응답을 받았는데, Go 의 api 를 사용했을 때는 왜 429가 나왔는지는 조금 더 찾아봐야할 것 같다.
