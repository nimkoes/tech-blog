Go 의 함수에는 'naked return' 이라는 것이 있다.

이것의 의미는 return 키워드에 굳이 반환 할 변수를 명시하지 않아도 됨을 뜻한다.

part 1 에서 길이와 영문 대문자 변환 결과를 반환하는 함수를 다시 작성해보자.

```go
package main

import (
	"fmt"
	"strings"
)

func lenAndUpper(name string) (length int, uppercase string) {
	length = len(name)
	uppercase = strings.ToUpper(name)
	return
}

func main() {
	totalLength, upper := lenAndUpper("nimkoes")
	fmt.Println(totalLength, upper)
}
```

![0113-274-go-part-2-naked-return-defer-img-01.jpg](/tech-blog/resources/images/migration/0113-274-go-part-2-naked-return-defer/img-01.jpg)

part 1 의 'lenAndUpper' 함수와 다른 부분은 반환 타입을 작성할 때 변수 이름을 같이 넣은 부분이다.

그리고 'return' 키워드에서는 반환하는 값에 대한 아무런 정보가 없다.

호기심이 생겨서 'naked return' 형식으로 함수를 작성하고, return 할 때 명시적으로 다른 값을 반환 해보았는데

return 키워드에 작성한 값의 우선순위가 높은 것으로 확인 했다.

개인적으로 명시적인 코드 작성을 선호해서 'return' 만 써있으면 코드를 읽을 때 혼란스러울 것 같기도 하고,

어쨌든 함수 선언할 때 반환값에 대한 정보가 같이 명시 되어있기 때문에 오히려 보기 편한 것 같기도 하다.

한가지 더 살펴볼 것은 'defer' 라는 것이다.

이것은 함수 실행이 끝난 다음 또 다른 어떤 추가 작업을 하도록 한다.

defer 는 함수가 return 하고난 다음에 실행 된다.

```go
package main

import (
	"fmt"
	"strings"
)

func lenAndUpper(name string) (length int, uppercase string) {
	defer fmt.Println("I'm done")

	fmt.Println("start !")
	length = len(name)
	uppercase = strings.ToUpper(name)
	return
}

func main() {
	totalLength, upper := lenAndUpper("nimkoes")
	fmt.Println(totalLength, upper)
}
```

![0113-274-go-part-2-naked-return-defer-img-02.jpg](/tech-blog/resources/images/migration/0113-274-go-part-2-naked-return-defer/img-02.jpg)

main 함수에서 lenAndUpper 실행을 종료한 다음 defer 를 실행 한 것을 확인할 수 있다.

사용하는 방법은 단순하지만 활용하기 나름일거란 생각이 든다.

궁금한게 생겨서 defer 를 여러줄에 걸쳐 작성할 수 있나 해봤더니 defer 를 매번 작성해 줘야 하는것 같다.

그리고 굳이 함수의 맨 앞에 써 줄 필요도 없으며, 코드 중간에 작성해도 잘 동작 했다.

하지만 이렇게 섞어서 쓰면 유지보수가 많이 힘들것 같다.

마지막으로 여러 defer 를 사용했을 때, 이 구문에 대해 stack 형태로 동작하는 것 같다.

```go
package main

import (
	"fmt"
	"strings"
)

func lenAndUpper(name string) (length int, uppercase string) {
	defer fmt.Println("I'm done")
	defer fmt.Println("second message ?")

	fmt.Println("start !")
	length = len(name)
	defer fmt.Println("third ?")
	uppercase = strings.ToUpper(name)
	return
}

func main() {
	totalLength, upper := lenAndUpper("nimkoes")
	fmt.Println(totalLength, upper)
}
```

위 코드에서 보면, lenAndUpper 에서 3개의 defer 를 사용하고 있는데 실행 결과를 보면 defer 가 작성된 역순으로 실행 된다.

![0113-274-go-part-2-naked-return-defer-img-03.jpg](/tech-blog/resources/images/migration/0113-274-go-part-2-naked-return-defer/img-03.jpg)
