Go 에는 일반적으로 생각하는 배열을 표현하는 두 가지 방법이 있다.

하나는 다른 언어에서 보던 것과 같은 배열이고, 다른 하나는 슬라이스(slice) 라고 하는게 있다.

기본적인 선언 방법은 다음과 같다.

```go
package main

import "fmt"

func main() {
	// array 사용 방법 1
	example_array_ver1 := [5]string{"arr_nimkoes", "arr_go", "arr_java"}

	// array 사용 방법 2
	example_array_ver2 := [...]string{"kim", "lee", "park", "choi"}

	// slice 사용 방법
	example_slice := []string{"nimkoes", "go", "java"}
	example_slice = append(example_slice, "new_elem") // 배열 요소를 추가

	fmt.Println(example_array_ver1)
	fmt.Println(example_array_ver2)
	fmt.Println(example_slice)
}
```

![0118-279-go-array-slice-img-01.jpg](/tech-blog/resources/images/migration/0118-279-go-array-slice/img-01.jpg)

'array 사용 방법 1' 을 보면, 내가 만들 배열의 길이를 고정하는 방법이다.

그래서 출력 결과를 보면, 공백 두 개가 같이 출력 된 것으로 보인다.

'array 사용 방법 2' 같은 경우에는, 길이를 고정하지는 않지만 처음 선언할 때 작성한 길이만큼 고정되어 생성 된다.

'slice 사용 방법' 같은 경우, 기본적으로 배열과 같은데 길이를 동적으로 늘릴 수 있다.

늘리는 방법은 append 를 사용하는 것인데, 아무래도 call by value 인것 같다.

reference 였다면 example_slice에 다시 담아주지 않아도 됐을거기 때문이다.

대부분 slice 를 사용하게 될 거라고 하는데, 아무래도 길이를 동적으로 조정할 수 있기 때문인것 같다.

그래도 고정 길이를 사용해야만 하는 경우가 있을 수 있기 때문에 두가지 방법 모두 알아두는게 좋을것 같다.
