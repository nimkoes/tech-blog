Go 에는 function 이외에 method 개념이 있다.

지금까지 알아낸 내용을 기준으로 method 는 struct 와 연관이 있다.

마치 java 에서 멤버 필드의 값을 조작하기 위해 method 를 추가 하는 것처럼, struct 의 값을 조작하기 위해 function 을 정의 하는데, 이 때 사용하는 function 을 method 라고 하는것 같다.

형태는 function 과 매우 유사하다.

이전에 작성했던 account.go 파일을 다음과 같이 수정하여 account struct 의 balance 값을 조작하는 method 를 정의 해보자.

```go
package accounts

type account struct {
	owner   string
	balance int
}

// NewAccount creates account
func NewAccount(pOwner string) *account {
	returnAccount := account{owner: pOwner, balance: 0}
	return &returnAccount
}

// Deposit + amount on your account
func (a account) Deposit(amount int) {
	a.balance += amount
}

// Balance of your account
func (a account) Balance() int {
	return a.balance
}
```

아래 두 개의 func 를 보면 Go 에서의 function 과 조금 다른 모양을 가지고 있다.

func 키워드와 function 의 이름 사이에 (a account) 라는 구절이 추가 되었다.

이것을 receiver (리시버) 라고 부른다.

receiver 는 method 내부에서 사용 할 변수 명과 struct 이름을 소괄호 안에 정의 하는데, 변수 명은 보통 struct 이름의 첫 글자를 영문자 소문자로 나타낸다고 한다.

그래서 지금의 예제에서는 a 를 사용했다.

이렇게 추가한 method 는 main.go 에서 다음과 같이 작성해서 사용할 수 있다.

```go
package main

import (
	"accounts"
	"fmt"
)

func main() {
	myAccount := accounts.NewAccount("Nimkoes")
	myAccount.Deposit(10)
	fmt.Println(myAccount.Balance())
}
```

아무런 문제가 없어 보이는데 막상 실행해보면 다음과 같은 결과가 나온다.

![0122-283-go-bank-dictionary-projects-methods-part-one-img-01.jpg](/tech-blog/resources/images/migration/0122-283-go-bank-dictionary-projects-methods-part-one/img-01.jpg)

분명히 Deposit method 에 정수 10을 넘겨주고 balance 값을 += 연산자로 증가 했는데, 출력해보면 0이 나온다.

이런 결과가 나온 이유는 다음 시간에 다룬다.
