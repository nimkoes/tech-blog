이번 실습에서는 struct 를 사용하지 않고 'type' 이라는 것을 사용 한다.

그 전에 먼저 myDict 디렉토리를 만들고 그 안에 myDict.go 파일을 생성한다.

그리고 이 파일을 사용 할 main 이 될 파일을 'part2_myDict_main.go' 라는 이름으로 생성했다.

![0125-286-go-bank-dictionary-projects-dictionary-part-one-img-01.jpg](/tech-blog/resources/images/migration/0125-286-go-bank-dictionary-projects-dictionary-part-one/img-01.jpg)

(앞서 예제에서 사용했던 'main.go' 파일도 'part2_account_main.go' 로 이름을 수정했다.)

다음은 map 을 정의한 myDict.go 파일의 코드이다.

```go
package myDict

import "errors"

type Dictionary map[string]string

var errNotFound = errors.New("Not Found")

// Search for a word
func (d Dictionary) Search(word string) (string, error) {
	value, exists := d[word]
	if exists {
		return value, nil
	}

	return "", errNotFound
}
```

[Go 의 map 사용법에 대한 api 문서 링크](https://blog.golang.org/maps)

위 api 문서를 참고하면 map 타입을 정의하는 방법과 map 타입에서 값을 가져오는 방법 등을 알 수 있다.

그 중 가장 기본적인 사용법인 선언하고 값을 찾는 문법을 사용하고, error 에 대한 처리도 해주었다.

다시 봐도 javascipt 의 구조분해 할당이라는 것과 비슷한 느낌을 주는 복수개의 return 값을 정의할 수 있는 부분이 매력적이다.

다음은 이 코드를 사용하는 'part2_myDict_main.go' 파일의 내용과 실행 결과이다.

```go
package main

import (
	"fmt"
	"myDict"
)

func main() {
	dictionary := myDict.Dictionary{"first": "First Word"}

	definition, err := dictionary.Search("second")

	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(definition)
	}
}
```

![0125-286-go-bank-dictionary-projects-dictionary-part-one-img-02.jpg](/tech-blog/resources/images/migration/0125-286-go-bank-dictionary-projects-dictionary-part-one/img-02.jpg)

dictionary 는 "first" 를 키값으로 "First Word" 값을 가지는 map 이다.

이제 Search 메소드를 통해 값을 반환 받으면 definition 과 err 변수에 각각 결과가 담기고

만약 값이 있으면 err 값이 nil 로 definition 을 출력할 것이고, 없으면 위와 같이 'Not Found' 가 출력 된다.

```go
definition, err := dictionary.Search("second")
```

이 코드를

```go
definition, err := dictionary.Search("first")
```

이렇게 고쳐서 실행해보면 'First Word' 결과가 나오는 것을 확인할 수 있다.
