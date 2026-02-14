이번에는 map 에 요소를 추가하는 실습을 한다.

앞서 작성한 myDict.go 파일에 다음 내용을 추가 한다.

```go
var errWordExists = errors.New("That word already exists")

// Add a word to the dictionary
func (d Dictionary) Add(word, def string) error {

	// [if style]
	_, err := d.Search(word)

	if err == errNotFound {
		d[word] = def
	} else if err == nil {
		return errWordExists
	}

	return nil

	// [switch style]
	/*
		_, err := d.Search(word)

		switch err {
		case errNotFound:
			d[word] = def
		case nil:
			return errWordExists
		}

		return nil
	*/
}
```

아래 주석으로 작성한 부분은 switch 문법을 사용할 때의 예시이다.

지금 실행해 볼 예시는 if 구절이다.

Dictionary 에서 같은 이름의 key 가 이미 등록 되어 있으면 error 를 반환하고 그렇지 않으면 값을 추가한다.

Search 메소드가 반환하는 결과 중 err 값만 사용할 것이기 때문에, _ 를 사용해서 무시하도록 했다.

새로 추가한 메소드를 사용하는 'part2_myDict_main.go' 파일을 다음과 같이 작성 했다.

```go
package main

import (
	"fmt"
	"myDict"
)

func main() {
	dictionary := myDict.Dictionary{}

	word := "hello"
	definition := "Greeting"

	// 첫번째 값 추가
	err := dictionary.Add(word, definition)

	if err != nil {
		fmt.Println(err)
	}

	hello, _ := dictionary.Search(word)
	fmt.Println("found", word, "definition:", hello)

	// 같은 값을 한번 더 추가해서 결과 확인
	err2 := dictionary.Add(word, definition)
	if err2 != nil {
		fmt.Println(err2)
	}

}
```

![0126-287-go-bank-dictionary-projects-add-method-in-map-img-01.jpg](/tech-blog/resources/images/migration/0126-287-go-bank-dictionary-projects-add-method-in-map/img-01.jpg)

예상한 결과가 나온 것을 확인할 수 있다.

이번 실습을 할 때 조금 이상한게 있었다.

그건 Search 나 Add 메소드를 작성할 때 struct 의 receiver 와 같이 * 연산자를 사용하지 않았다는 점이다.

궁금해서 * 연산자를 추가해서 실습해 보았는데, 다음과 같은 오류가 출력 되었다.

```go
invalid operation: d[word] (type *Dictionary does not support indexing)
```

이것과 관련하여 검색한 내용의 일부를 첨부한다.

<table>
<tbody>
<tr>
<td>You&nbsp;are&nbsp;trying&nbsp;to&nbsp;index&nbsp;on&nbsp;the&nbsp;pointer&nbsp;rather&nbsp;than&nbsp;the&nbsp;map&nbsp;itself.&nbsp;Kind&nbsp;of&nbsp;confusing&nbsp;because&nbsp;usually&nbsp;with&nbsp;pointers&nbsp;vs.&nbsp;values&nbsp;dereferencing&nbsp;is&nbsp;automatic&nbsp;for&nbsp;structs.&nbsp;If&nbsp;your&nbsp;struct&nbsp;is&nbsp;just&nbsp;a&nbsp;map,&nbsp;however,&nbsp;it's&nbsp;only&nbsp;passed&nbsp;in&nbsp;by&nbsp;reference&nbsp;anyway&nbsp;so&nbsp;you&nbsp;don't&nbsp;have&nbsp;to&nbsp;worry&nbsp;about&nbsp;creating&nbsp;methods&nbsp;that&nbsp;act&nbsp;on&nbsp;pointers&nbsp;to&nbsp;avoid&nbsp;copying&nbsp;the&nbsp;entire&nbsp;structure&nbsp;every&nbsp;time.</td>
</tr>
</tbody>
</table>

[관련 질문, 응답 링크](https://stackoverflow.com/questions/36463608/go-invalid-operation-type-mapkeyvalue-does-not-support-indexing)
