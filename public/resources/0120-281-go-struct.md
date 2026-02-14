Struct 는 Object 와 유사 하면서 map 보다 조금 더 유연하다.

C에서 봤던 구조체와 비슷한 느낌을 가지고 있는것 같다.

```go
package main

import "fmt"

// Go 의 struct 에는 constructor (생성자) 가 없다.
// 우리가 constructor 를 직접 실행해 줘야 한다. -> 생성자가 없다고 했는데 실행해줘야 한다는 말을 이해하지 못함.
type person struct {
	name    string
	age     int
	favFood []string
}

func main() {
	myFood := []string{"kimchi", "ramen"}

	// struct 사용 방법 1, 순서대로 타입에 맞게 값을 입력 (권장하지 않음)
	nimkoes_ver1 := person{"nimkoes", 17, myFood}
	nimkoes_ver2 := person{"nimkoes", 21, []string{"kimchi_2", "ramen_2"}}

	// struct 사용 방법 2, key 를 명시하는 방법 (권장하는 방법)
	nimkoes_ver3 := person{name: "nk", favFood: []string{"I", "eat", "something"}}

	// 방법 1 과 방법 2 를 혼용할 수 없다. (mixture of field:value and value elements in struct literalcompilerMixedStructLit)
	// nimkoes_ver4 := person{name: "nk", []string{"I", "eat", "something"}}

	fmt.Println(nimkoes_ver1.name, nimkoes_ver1.age, nimkoes_ver1.favFood)
	fmt.Println(nimkoes_ver1)
	fmt.Println(nimkoes_ver2)

	fmt.Println(nimkoes_ver3)
}
```

![0120-281-go-struct-img-01.jpg](/tech-blog/resources/images/migration/0120-281-go-struct/img-01.jpg)

앞으로 학습 하면서 constructor 가 없는데, 직접 호출해야 한다는게 무슨 말인지 이해하는게 필요하다.

위 예제를 만들어 보면서 재밌었던건, '사용 방법 2' 에서 값을 명시하지 않으면 그 타입의 기본 값을 자동으로 사용한다는 점이다.

그리고 '사용 방법 1' 을 사용할 때는 struct 에 정의한 모든 값을 입력 해야 오류가 발생하지 않는다.

그도 그럴것이 값이 몇개 빠져있으면, 어느 변수에 값을 매칭해야 할지 모르기 때문이다.

여기까지 Go 의 struct 에 대해 알아보는 것으로 기본적인 이론에 대해 학습이 끝났다.

다음부터는 토이 프로젝트를 만들어 보면서 언어에 익숙해질 예정이다.
