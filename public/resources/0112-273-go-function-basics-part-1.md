Go 에서 함수는 아주 쉽다.

'func' 키워드를 사용해서 선언한다.

두 수를 전달 받아 곱한 결과를 반환하는 'multiply' 를 작성해보자.

```go
package main

import "fmt"

func multiply(a, b) {
	return a * b
}

func main() {
	fmt.Println(multiply(2, 2))
}
```

그런데 위와 같이 작성하고 실행하면 많은 오류를 만나게 된다.

![0112-273-go-function-basics-part-1-img-01.jpg](/tech-blog/resources/images/migration/0112-273-go-function-basics-part-1/img-01.jpg)

그 이유는 Go 도 Java 와 마찬가지로 함수를 선언할 때 전달받을 타입과 반환 타입을 정해줘야 한다.

그래서 다음과 같이 고쳐서 작성해야 한다.

```go
package main

import "fmt"

func multiply(a int, b int) int {
	return a * b
}

func main() {
	fmt.Println(multiply(2, 2))
}
```

매개변수 타입을 지정하는 위치와 반환 타입을 지정하는 위치가 Java 와 많이 달라 어색함이 없지 않지만 이렇게 작성 하는것도 재밌기도 하고 좋은것 같다.

만약 매개변수 타입이 모두 같다면 위 코드를 다음과 같이 조금 더 축약해서 작성할 수 있다.

```go
package main

import "fmt"

func multiply(a, b int) int {
	return a * b
}

func main() {
	fmt.Println(multiply(2, 2))
}
```

Go 의 함수에는 굉장히 독특한게 있다.

미친소리 같지만 return 값이 여러개일 수 있다.

다음은 문자열을 하나 받아서 그 길이와 영문 대문자로 만든 문자열을 반환하는 함수이다.

```go
func lenAndUpper(name string) (int, string) {
	return len(name), strings.ToUpper(name)
}
```

이 함수를 사용하는 코드는 다음과 같다.

```go
package main

import (
	"fmt"
	"strings"
)

func multiply(a, b int) int {
	return a * b
}

func lenAndUpper(name string) (int, string) {
	return len(name), strings.ToUpper(name)
}

func main() {
	fmt.Println(multiply(2, 2))

	totalLength, upperName := lenAndUpper("nimkoes")
	fmt.Println(totalLength, upperName)
}
```

위 코드를 실행한 결과는 다음과 같다.

![0112-273-go-function-basics-part-1-img-02.jpg](/tech-blog/resources/images/migration/0112-273-go-function-basics-part-1/img-02.jpg)

함수를 실행하는 코드를 자세히 보면 어디서 본 것 같은데, javascript 의 구조 분해 할당 같은 느낌이다.

```go
totalLength, upperName := lenAndUpper("nimkoes")
```

그럼 만약 두 값중 하나만 사용하고 싶으면 어떻게 할 수 있을까.

이때는 언더바 (_) 를 사용해서 컴파일러가 해당 값을 무시하도록 할 수 있다.

예를 들어 길이에 대한 정보만 사용하려 한다면 다음과 같이 함수를 호출할 수 있다.

```go
myTotalLength, _ := lenAndUpper("xxxelppa")
fmt.Println(myTotalLength)
```

함수의 매개변수를 작성할 때 몇개의 인자가 사용될지 모르는 경우 유용하게 사용할 수 있는게 있다.

다른 언어에서와 마찬가지로 ... 을 사용할 수 있다.

```go
func repeatMe(words ...string) {
	fmt.Println(words)
}
```

위 함수를 포함하여 실행하는 코드는 다음과 같다.

```go
package main

import (
	"fmt"
	"strings"
)

func multiply(a, b int) int {
	return a * b
}

func lenAndUpper(name string) (int, string) {
	return len(name), strings.ToUpper(name)
}

func repeatMe(words ...string) {
	fmt.Println(words)
}

func main() {
	fmt.Println(multiply(2, 2))

	totalLength, upperName := lenAndUpper("nimkoes")
	fmt.Println(totalLength, upperName)

	myTotalLength, _ := lenAndUpper("xxxelppa")
	fmt.Println(myTotalLength)

	repeatMe("nimkoes", "test", "nico", "go", "java")
}
```

![0112-273-go-function-basics-part-1-img-03.jpg](/tech-blog/resources/images/migration/0112-273-go-function-basics-part-1/img-03.jpg)
