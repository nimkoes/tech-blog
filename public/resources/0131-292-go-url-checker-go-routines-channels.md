---
title: 'Go ''URL CHECKER & GO ROUTINES'' : Channels'
description: >-
  Go channel을 make로 만들어 goroutine과 main function 사이에 값을 주고받는 방법과, main이 channel 수신을 기다리는 동안 종료되지 않는 동작을 예제로 정리했다.
publishedAt: '2021-05-23'
updatedAt: '2021-05-23'
tags:
  - Go
  - URL Checker
  - Goroutine
  - Channel
  - HTTP
status: needs-review
---
Channel 은 goroutine 과 main function 사이 또는 goroutine 간 정보 전달을 하기 위한 방법 이다.

앞서 make 가 map 을 만들기 위한 function 이라고 정리 했었는데, make function 은 slice, map 그리고 channel 을 만들 수 있는 function 이 맞는것 같다.

![Go 언어 명세에서 make로 slice, map, channel을 만드는 호출 형태를 설명한 부분](/tech-blog/resources/images/migration/0131-292-go-url-checker-go-routines-channels/img-01.jpg)

아무튼, 이번에는 channel 이라는 것을 사용해보려 한다.

코드에 대한 설명은 주석에 작성 하였다.

```go
package main

import (
	"fmt"
	"time"
)

func main() {

	// 길이 2 의 문자열 배열 생성
	people := [2]string{"nico", "nimkoes"}

	// bool 타입을 주고받을 수 있는 channel 생성, c 는 임의의 이름으로 사용 가능
	c := make(chan bool)

	// 반복문을 실행 하면서 두 개의 goroutine 을 실행
	for _, person := range people {
		// channel 을 같이 전달
		go isSexy(person, c)
	}

	// main function 은 channel 로부터 받는 값을 기다린다.
	// 기다린다는 것은 스레드를 종료하지 않는다는 것을 의미한다.
	fmt.Println(<-c)
	fmt.Println(<-c)
}

func isSexy(person string, c chan bool) {
	// 5초 동안 스레드를 멈춘다.
	time.Sleep(time.Second * 5)
	fmt.Println(person)

	// channel 로 bool 값을 전달한다.
	c <- true
}
```

![goroutine 두 개가 5초 뒤 nico와 nimkoes를 출력하고 main이 channel 값 true 두 개를 받는 실행 과정](/tech-blog/resources/images/migration/0131-292-go-url-checker-go-routines-channels/img-02.gif)

실행 결과를 보면 main function 이 goroutine 을 실행하고 바로 종료하지 않고, channel 을 통해 값을 전달 받기를 기다리는 것을 확인할 수 있다.

추가로 확인할 수 있는건, person 과 bool 결과가 쌍을 이루지 않고 person 을 모두 출력한 다음 bool 결과를 출력 하였는데, 그 이유는 각 스레드가 병렬 처리 되고 있기 때문이다.

여러번 실행 하다보면 다음과 같이 person 다음에 bool 값을 출력하는 것도 볼 수 있다.

![병렬 실행 순서에 따라 이름 다음에 바로 true가 번갈아 출력된 실행 결과](/tech-blog/resources/images/migration/0131-292-go-url-checker-go-routines-channels/img-03.jpg)
