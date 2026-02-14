Go 에는 멀티스레드를 생성해서 실행하는게 정말 간단한 것 같다.

예를 들어 Java 같은 경우 Runnable 인터페이스를 구현 한다던가 하는 작업이 필요하고, 그렇게 하려다보면 장황한 코드가 작성 되기도 한다. 물론 람다식을 쓰면 좀 나아지겠지만 말이다.

다른 실행 프로그램과 구분하기 위해 main_goroutine.go 파일을 새롭게 작성 했다.

![0130-291-go-url-checker-go-routines-goroutines-img-01.jpg](/tech-blog/resources/images/migration/0130-291-go-url-checker-go-routines-goroutines/img-01.jpg)

그리고 1초 간격으로 문자열을 출력하는 반복문을 가진 sexyCount 라는 function 을 작성했다.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	sexyCount("nico")
	sexyCount("nimkoes")
}

func sexyCount(person string) {
	for i := 0; i < 5; i++ {
		fmt.Println(person, "is sexy", i)
		time.Sleep(time.Second)
	}
}
```

main function 에서 sexyCount function 을 두 번 호출 해서 사용하고 있는데, 실행하면 다음과 같이 실행 된다.

![0130-291-go-url-checker-go-routines-goroutines-img-02.gif](/tech-blog/resources/images/migration/0130-291-go-url-checker-go-routines-goroutines/img-02.gif)

각 function 을 실행하는데 5초씩, 총 10초가 필요하다.

만약 이 두 function 을 동시에 실행할 수 있다면 다음과 같이 5초가 걸릴 것이다.

![0130-291-go-url-checker-go-routines-goroutines-img-03.gif](/tech-blog/resources/images/migration/0130-291-go-url-checker-go-routines-goroutines/img-03.gif)

이렇게 실행 시간을 반으로 줄이는데 공백을 포함해서 문자 3개만 추가했을 뿐이다.

```go
func main() {
	go sexyCount("nico")
	sexyCount("nimkoes")
}
```

main function 에서 "nico" 문자열을 매개변수로 전달하는 sexyCount 호출할 때 'go ' 를 추가햇을 뿐이다.

이렇게 하면 Go 가 알아서 별도의 스레드를 생성해서 동시에 처리 한다고 한다.

그럼 왜 두 번 호출 하는데 한쪽에만 'go ' 를 붙였을까?

둘 다 붙이고 실행하면 다음과 같이 실행 된다.

```go
func main() {
	go sexyCount("nico")
	go sexyCount("nimkoes")
}
```

![0130-291-go-url-checker-go-routines-goroutines-img-04.gif](/tech-blog/resources/images/migration/0130-291-go-url-checker-go-routines-goroutines/img-04.gif)

다른 언어에 경험이 있다면 이런 결과가 나오는걸 당연하게 생각할 수 있다.

main function 안에서 호출한 각 sexyCount function 에 대해 스레드를 생성해서 실행하고난 다음 main function 의 스레드는 더 이상 할게 없기 때문에 끝나버렸기 때문이다.

그래서 처음 main function 안에서 sexyCount function 을 호출할 때 한쪽에만 'go ' 를 붙여서 붙이지 않은 function 이 main function 이 실행중인 스레드에서 동작하도록 한 것이다.

하지만 이렇게 'go ' 를 포함하지 않는 function 을 하나 남기는 방법으로 처리 하기에는 리스크가 있다.

아직 진도가 거기까지 나가지 못했지만, 다른 언어에서와 마찬가지로 안전하게 처리할 수 있는 장치가 있을거라 생각한다.
