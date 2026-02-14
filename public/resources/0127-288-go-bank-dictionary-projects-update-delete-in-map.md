이번에는 map 에 저장된 값을 수정하고 삭제하는 실습을 한다.

먼저 'part2_myDict_main.go' 파일을 먼저 작성하고, 'myDict.go' 파일을 작성하는 순서로 진행한다.

이건 마치 TDD 를 하는 느낌이다.

```go
package main

import (
	"fmt"
	"myDict"
)

func main() {
	dictionary := myDict.Dictionary{}

	baseWord := "hello"

	// 값을 추가
	dictionary.Add(baseWord, "First")

	// 저장된 값을 수정
	err := dictionary.Update(baseWord, "Second")
	if err != nil {
		fmt.Println(err)
	}

	// 저장된 값을 조회 한 다음 출력
	word, _ := dictionary.Search(baseWord)
	fmt.Println(word)
}
```

내용이 단순해서 코드의 주석만 보고도 어떤 동작을 할지 충분히 예상 가능하다.

다음은 'myDict.go' 에 추가한 Update 코드이다.

```go
var errCantUpdate = errors.New("Cant update non-existing word")

// Update a word
func (d Dictionary) Update(word, definition string) error {
	_, err := d.Search(word)
	switch err {
	case nil:
		// 단어를 찾는데 err 가 nil -> 찾는데 성공했으므로 그 값을 업데이트
		d[word] = definition
	case errNotFound:
		// 단어를 찾는데 실패 -> 존재하지 않는 값은 업데이트 할 수 없음
		return errCantUpdate
	}
	return nil
}
```

값을 수정 하려면, map 에 값이 존재해야 하기 때문에 Search 메소드를 사용해서 확인한다.

다음은 이미 작성한 'part2_myDict_main.go' 의 실행 결과이다.

![0127-288-go-bank-dictionary-projects-update-delete-in-map-img-01.jpg](/tech-blog/resources/images/migration/0127-288-go-bank-dictionary-projects-update-delete-in-map/img-01.jpg)

기대한 대로 'First' 가 'Second' 로 수정되어 출력된 것을 확인할 수 있다.

마지막으로 'myDict.go' 파일에 Delete 메소드를 추가해보자.

```go
// Delete a word
func (d Dictionary) Delete(word string) {
	// 값의 존재 여부를 판단해서 error 처리를 할 수도 있다.
	// api 에 따르면 delete 메소드는 삭제 할 값이 없다고 오류를 반환하지 않는다.
	delete(d, word)
}
```

이 메소드가 잘 동작하는지 확인하기 위해 'part2_myDict_main.go' 파일을 다음과 같이 수정한다.

```go
package main

import (
	"fmt"
	"myDict"
)

func main() {
	dictionary := myDict.Dictionary{}

	baseWord := "hello"

	// 값을 추가
	dictionary.Add(baseWord, "First")

	// 저장된 값을 수정
	err := dictionary.Update(baseWord, "Second")
	if err != nil {
		fmt.Println(err)
	}

	// 저장된 값을 조회 한 다음 출력
	word, _ := dictionary.Search(baseWord)
	fmt.Println(word)

	fmt.Println()

	// 삭제 테스트 코드 작성
	fmt.Println("========== 삭제 테스트 시작 ==========")
	dictionary.Delete(baseWord)
	word, err = dictionary.Search(baseWord)

	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(word)
	}
}
```

삭제 테스트 코드를 추가하고 실행하면 다음과 같은 결과가 나온다.

![0127-288-go-bank-dictionary-projects-update-delete-in-map-img-02.jpg](/tech-blog/resources/images/migration/0127-288-go-bank-dictionary-projects-update-delete-in-map/img-02.jpg)

여기까지 아주 간단한 Bank Account 와 Dictionary Map 예제를 만들어 보면서 Go 에 익숙해져 보았다.

아직 활용 할 수준은 아니지만 활용하고싶은 언어다.
