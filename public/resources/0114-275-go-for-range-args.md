Go 에서 반복문은 오직 for 를 사용해서만 가능하다.

어떻게 보면 다양한 형태의 for 문을 사용 했었는데 하나로 통일 된게 더 좋을수도 있겠다.

개수가 정해지지 않은 여러개의 정수를 전달받아 합을 반환하는 함수를 만들어 보자.

```go
package main

import "fmt"

func superAdd(numbers ...int) int {
	fmt.Println("without index")
	for number := range numbers {
		fmt.Print(number)
	}

	fmt.Println()
	fmt.Println()
	fmt.Println("with index")
	for index, number := range numbers {
		fmt.Println(index, number)
	}

	fmt.Println()
	fmt.Println()
	fmt.Println("ignore index")
	for _, number := range numbers {
		fmt.Println(number)
	}

	fmt.Println()
	fmt.Println()
	fmt.Println("without range")
	for i := 0; i < len(numbers); i++ {
		fmt.Println(i, numbers[i])
	}

	return 1
}

func main() {
	superAdd(1, 2, 3, 4, 5, 6)
}
```

![0114-275-go-for-range-args-img-01.jpg](/tech-blog/resources/images/migration/0114-275-go-for-range-args/img-01.jpg)

'range' 키워드는 오직 반복문에서 사용하기 위한 것으로, 배열 형태를 사용할 때 같이 사용 한다.

이 때, 'without index' 와 'with index' 의 차이를 보면, range 를 사용했을 때 첫번째 값으로 요소의 값이 아닌 배열의 index 를 사용 한다는 것이다.

그래서 'without index' 의 예시를 보면 0부터 5까지 출력한 것을 확인할 수 있다.

값도 한 번에 가지고 오려면 'with index' 처럼 for 문에 두 개의 변수를 사용하면 된다.

만약 index 는 필요 없고 값만 사용하려면 ignore index' 처럼, 언버다 (_) 를 사용하면 그 값이 무시 된다.

range 를 사용하지 않고 for 문을 사용할 수 있는데, 그 예시는 위의 'without range' 이다.

여기서 또 하나 발견한게 있는데, 소괄호를 사용하지 않는다는 것도 있지만, 전위 증가 연산자를 사용할 수 없었다.

i++ 은 실행이 되는데 ++i 는 컴파일 오류가 발생한다.
