이번에는 Channel 로 주고 받는 데이터를 bool 타입이 아닌 string 타입을 사용해보자.

아래는 수정한 main_goroutine.go 파일이다.

```go
package main

import (
	"fmt"
	"time"
)

func main() {

	// 길이 2 의 문자열 배열 생성
	people := [5]string{"nico", "nimkoes", "go", "java", "spring"}

	// bool 타입을 주고받을 수 있는 channel 생성, c 는 임의의 이름으로 사용 가능
	c := make(chan string)

	// 반복문을 실행 하면서 두 개의 goroutine 을 실행
	for _, person := range people {
		// channel 을 같이 전달
		go isSexy(person, c)
	}

	fmt.Println("waiting... ")

	// main function 은 channel 로부터 받는 값을 기다린다.
	// 기다린다는 것은 스레드를 종료하지 않는다는 것을 의미한다.
	fmt.Println(<-c)
	fmt.Println(<-c)
	fmt.Println(<-c)
	fmt.Println(<-c)
	fmt.Println(<-c)

	fmt.Println("DONE !")
}

func isSexy(person string, c chan string) {
	// 5초 동안 스레드를 멈춘다.
	time.Sleep(time.Second * 3)

	// channel 로 bool 값을 전달한다.
	c <- person + " is sexy"
}
```

이전 예제와 달라진 부분은 people 배열의 요소 수를 5로 늘렸고

channel 을 통해 주고 받을 데이터의 타입을 string 으로 바꾼 것과

channel 이 응답 받을 데이터를 기다리는 것을 확인하기 위해 (blocking 하는 것을 확인하기 위해) '<- c' 작업 전 후로 문자열을 출력한 것이다.

마지막으로 'isSexy' function 의 sleep 5초가 너무 긴 것 같아서 3초로 줄였다.

실행하면 다음과 같다.

![0132-293-go-url-checker-go-routines-channels-recap-channel-response-receive-using-img-01.gif](/tech-blog/resources/images/migration/0132-293-go-url-checker-go-routines-channels-recap-channel-response-receive-using/img-01.gif)

프로그램을 실행하면 'waiting...' 문자열이 출력 되고, 설정한 3초 동안 다른 스레드에서 channel 을 통해 전달하는 결과를 '<- c' 에서 기다린다.

blocking 관련해서 개선하는 부분에 대해서 다음에 다룰것 같다.

우선 의도한대로 잘 동작하는 코드를 작성하긴 했는데, 'fmt.Println(<-c)' 코드가 배열 길이가 길어질수록 반복해서 나타나고 있다.

반복해서 나타나는 중복 코드는 나쁜 냄새가 나는 코드다.

그래서 이걸 반복문을 사용해서 다음과 같이 개선할 수 있다.

```go
for i := 0; i < len(people); i++ {
	fmt.Println(<-c)
}
```

이제부터는 people 배열의 길이에 상관 없이 channel 을 통해 받는 값을 처리할 수 있게 되었다.

실행 결과는 동일하기 때문에 최종 수정한 코드만 첨부 한다.

```go
package main

import (
	"fmt"
	"time"
)

func main() {

	// 길이 2 의 문자열 배열 생성
	people := [5]string{"nico", "nimkoes", "go", "java", "spring"}

	// bool 타입을 주고받을 수 있는 channel 생성, c 는 임의의 이름으로 사용 가능
	c := make(chan string)

	// 반복문을 실행 하면서 두 개의 goroutine 을 실행
	for _, person := range people {
		// channel 을 같이 전달
		go isSexy(person, c)
	}

	fmt.Println("waiting... ")

	for i := 0; i < len(people); i++ {
		fmt.Println(<-c)
	}

	fmt.Println("DONE !")
}

func isSexy(person string, c chan string) {
	// 5초 동안 스레드를 멈춘다.
	time.Sleep(time.Second * 3)

	// channel 로 bool 값을 전달한다.
	c <- person + " is sexy"
}
```
