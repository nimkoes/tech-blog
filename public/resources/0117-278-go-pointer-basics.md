아주 오래전이지만 C 언어를 공부한 적이 있었다.

Go 언어를 배워보기로 하기를 잘한것 같다.

처음 프로그래밍 언어를 배울 때 이런 얘기를 들었다.

Java 는 Class 에서 (상속 등과 관련된), C 는 포인터에서 많이 포기를 한다고,,

그래서 포인터에 겁을 먹은적이 있었는데, 깊고 복잡한 내용이 아니면 포기할 정도는 아니라고 생각 했다.

아무튼,

포인터 관련된 연산자는 크게 두가지가 있다.

하나는 & 다른 하나는 *

& 는 그 변수의 주소값을 확인할 때 사용하고, * 는 주소가 가리키는 값을 확인할 때 사용한다.

여기서 주소라고 하는 것은 메모리의 주소를 뜻한다.

다음 코드를 보자.

```go
package main

import "fmt"

func main() {
	a := 2
	b := &a

	fmt.Println(a, b)
}
```

![0117-278-go-pointer-basics-img-01.jpg](/tech-blog/resources/images/migration/0117-278-go-pointer-basics/img-01.jpg)

실행 결과를 보면, a 는 2 가 출력 되었는데, b 는 0xc000ac058 이라는 값이 출력 되었다.

0x 는 16진수를 나타낼 때 사용하는 값으로, 16진수 c000ac058 이 주소 값이다.

(주소 값은 항상 바뀌니 출력 예시와 다른 값이 나왔다고 이상하게 생각할건 없다. 같으면 그게 더 무서울 것 같다.)

위에 작성한 예시를 그림으로 나타내면 다음과 같다.

![0117-278-go-pointer-basics-img-02.jpg](/tech-blog/resources/images/migration/0117-278-go-pointer-basics/img-02.jpg)

a 의 메모리상의 위치 (주소) 는 c000ac058 이다.

그리고 그 위치에 담긴 값은 2 이다.

b 의 값으로 a 의 위치 (주소) 를 담았다.

그래서 b 의 값은 c000ac058 이다.

* 연산자를 사용하면 주소가 가리키고있는 곳의 값을 참조할 수 (접근할 수, 확인할 수) 있다.

그렇기 때문에 *a 는 불가능하고, *b 는 c000ac058 이라는 주소가 가리키는 위치의 값인 2를 참조할 수 있다.

```go
package main

import "fmt"

func main() {
	a := 2
	b := &a

	fmt.Println(a, b)
	fmt.Println(*b)
}
```

![0117-278-go-pointer-basics-img-03.jpg](/tech-blog/resources/images/migration/0117-278-go-pointer-basics/img-03.jpg)

그래서 위 예시를 실행해보면 *b 의 실행 결과 2 가 출력된 것을 확인할 수 있다.

이 내용을 잘 이해하고 머릿속에서 그려져야 혼란스럽지 않을 수 있다.

다음 코드를 보고 실행 결과를 예상해보자.

```go
package main

import "fmt"

func main() {
	a := 2
	b := &a

	fmt.Println(a, b)
	fmt.Println(*b)

	// 실행 결과 예상
	myValue := 10
	anotherValue := &myValue
	*anotherValue = 21
	myValue = 17

	fmt.Println(myValue, *anotherValue)
	fmt.Println((&myValue == anotherValue), (myValue == *anotherValue))
}
```

그리 복잡한 예시가 아니므로 '// 실행 결과 예상' 주석 아래에 작성한 코드의 실행 결과가 무엇으로 나올지 알 수 있어야 한다.

![0117-278-go-pointer-basics-img-04.jpg](/tech-blog/resources/images/migration/0117-278-go-pointer-basics/img-04.jpg)

처음엔 가벼운 마음으로 시작 했는데, 갈 수록 관심이 가는 언어이다.
