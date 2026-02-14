지난번 Methods part One 에서 Deposit method 를 호출했을 때 account 값이 수정되지 않은 것을 확인했다.

그 이유는 Go 에서 function, method 를 사용할 때 object, struct 등에 대해 복사본을 사용하기 때문이다.

지금의 경우 Deposit 메소드의 receiver 에서 복사본이 사용 됐다.

```go
// Deposit + amount on your account
func (a account) Deposit(amount int) {
	a.balance += amount
}
```

여기서 사본을 사용하지 않고 원본을 사용하게 하기 위해서는 다음과 같이 * 연산자를 사용해야 한다.

```go
// Deposit + amount on your account
func (a *account) Deposit(amount int) {
	a.balance += amount
}
```

이것을 pointer receiver 라고 한다.

다음으로 계좌에서 출금하는 메소드를 accounts.go 파일에 추가한다.

```go
// Withdraw x amount from your account
func (a *account) Withdraw(amount int) {
	a.balance -= amount
}
```

여기서도 사본이 아닌 원본을 참조해야 하기 때문에 pointer receiver 를 사용했다.

Withdraw 메소드를 사용하도록 main.go 파일을 다음과 같이 수정했다.

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
	myAccount.Withdraw(20)
	fmt.Println(myAccount.Balance())
}
```

![0123-284-go-bank-dictionary-projects-methods-part-two-img-01.jpg](/tech-blog/resources/images/migration/0123-284-go-bank-dictionary-projects-methods-part-two/img-01.jpg)

계산은 잘 되었지만, 계좌에 잔액이 음수가 되는걸 바라지 않을 수 있다.

하지만 Go 에는 다른 언어들에 있는 예외 상황에 대한 exception 같은 것이 없다.

즉, try ~ catch 같은 것들이 없기 때문에 error 상황에 대해 직접 체크하고 경우에 따라 error 를 반환하는 작업을 해줘야 한다.

accounts.go 에 정의한 Withdraw 메소드를 다음과 같이 수정한다.

```go
// Withdraw x amount from your account
func (a *account) Withdraw(amount int) error {
	if a.balance < amount {
		return errors.New("Can not withdraw. you are poor.")
	}

	a.balance -= amount
	return nil
}
```

반환 값의 타입이 error 라고 정의 하였으며, 이 타입은 오류에 대한 정보거나 오류가 없다는 nil 값을 사용할 수 있다.

그래서 if 조건문이 참이면 error 를 반환 하지만, 그렇지 않을 경우 balance 를 계산한 다음 nil 을 반환한다.

다시 main.go 를 실행해보면 다음과 같이 값이 변하지 않은 것을 볼 수 있다.

![0123-284-go-bank-dictionary-projects-methods-part-two-img-02.jpg](/tech-blog/resources/images/migration/0123-284-go-bank-dictionary-projects-methods-part-two/img-02.jpg)

다른 언어와 비교했을 때 이런 결과가 나온게 좀 어색하다.

왜냐하면 error 를 던지면 런타임에 프로그램이 종료 된다거나, 오류 메시지를 출력해 주는데 전혀 그렇지 않고 있다.

여기서 다른 언어와 다른 점은 error 에 대해 사용자가 직접 다뤄줘야 한다는 것이다.

어쨌든 accounts.go 의 Withdraw 는 error 를 반환하고 있기 때문에 main.go 에서 다음과 같이 error 를 다룰 수 있다.

```go
package main

import (
	"accounts"
	"fmt"
	"log"
)

func main() {
	myAccount := accounts.NewAccount("Nimkoes")
	myAccount.Deposit(10)
	fmt.Println(myAccount.Balance())

	err := myAccount.Withdraw(20)
	if err != nil {
		log.Fatalln(err)
	}
	fmt.Println(myAccount.Balance())
}
```

![0123-284-go-bank-dictionary-projects-methods-part-two-img-03.jpg](/tech-blog/resources/images/migration/0123-284-go-bank-dictionary-projects-methods-part-two/img-03.jpg)

반환 받은 err 이 nil 이 아니라면 실행하는 코드이다.

이렇게 수정하고 실행하면 다음과 같은 결과가 나온다.

![0123-284-go-bank-dictionary-projects-methods-part-two-img-04.jpg](/tech-blog/resources/images/migration/0123-284-go-bank-dictionary-projects-methods-part-two/img-04.jpg)

log.Fatalln 다음의 fmt.Println 을 실행하지 않고 프로그램을 종료한 것을 확인할 수 있다.

마지막으로 accounts.go 에서 Withdraw 메소드에 작성했던 error 코드를 조금 더 개선할 수 있다.

```go
var errNoMoney = errors.New("Can not withdraw. you are poor.")

// Withdraw x amount from your account
func (a *account) Withdraw(amount int) error {
	if a.balance < amount {
		return errNoMoney
	}

	a.balance -= amount
	return nil
}
```

errNoMoney 라는 변수에 errors.New 를 담고, Withdraw 메소드에서 return 할 때 이 변수를 반환하는 방법이다.

이렇게 하면 error 관리가 편해질 수 있을것 같다.

실행 결과는 같기 때문에 생략하고, 지금까지 작성 된 account.go 와 main.go 전체 코드를 첨부한다.

```go
package main

import (
	"accounts"
	"fmt"
	"log"
)

func main() {
	myAccount := accounts.NewAccount("Nimkoes")
	myAccount.Deposit(10)
	fmt.Println(myAccount.Balance())

	err := myAccount.Withdraw(20)
	if err != nil {
		log.Fatalln(err)
	}
	fmt.Println(myAccount.Balance())
}
```

```go
package accounts

import "errors"

type account struct {
	owner   string
	balance int
}

var errNoMoney = errors.New("Can not withdraw. you are poor.")

// NewAccount creates account
func NewAccount(pOwner string) *account {
	returnAccount := account{owner: pOwner, balance: 0}
	return &returnAccount
}

// Deposit x amount on your account
func (a *account) Deposit(amount int) {
	a.balance += amount
}

// Balance of your account
func (a account) Balance() int {
	return a.balance
}

// Withdraw x amount from your account
func (a *account) Withdraw(amount int) error {
	if a.balance < amount {
		return errNoMoney
	}

	a.balance -= amount
	return nil
}
```
