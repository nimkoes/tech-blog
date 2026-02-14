Go 의 struct 를 공부할 겸 간단한 bank account 를 생성하는 예제를 만들어 본다.

우선 accounts 폴더를 만들고 그 아래 accounts.go 파일을 만든다.

![0121-282-go-bank-dictionary-projects-account-newaccount-img-01.jpg](/tech-blog/resources/images/migration/0121-282-go-bank-dictionary-projects-account-newaccount/img-01.jpg)

accounts.go 는 실행의 주체로 사용하지 않을 것이기 때문에 main function 을 만들지 않는다.

사용 할 struct 를 정의하는데, 이름과 잔액 정보를 가지고 있도록 다음과 같이 만든다.

```go
package accounts

type Account struct {
	Owner   string
	Balance int
}
```

이 파일에서 주목할 점은 struct 인 Account 와 그 안에 선언한 Owner, Balanace 가 영문자 대문자로 시작한다는 점이다.

이렇게 작성하면 struct 를 export 하겠다는 의미이고, Owner 과 Balance 에 대해 외부의 접근을 허용하겠다는 것을 뜻한다.

그래서 part2_bank_and_dic_prj 폴더에 만든 main.go 에서 다음과 같이 직접 접근해서 사용할 수 있다.

```go
package main

import (
	"accounts"
	"fmt"
)

func main() {
	myAccount := accounts.Account{Owner: "nimkoes", Balance: 2147483627}
	fmt.Println(myAccount)
}
```

![0121-282-go-bank-dictionary-projects-account-newaccount-img-02.jpg](/tech-blog/resources/images/migration/0121-282-go-bank-dictionary-projects-account-newaccount/img-02.jpg)

편하진 하지만 이렇게 마음대로 접근하는 것을 원하지 않을수 있다.

예시이긴 하지만 계정 정보에 이렇게 직접 접근이 가능하다면 의도하지 않은 변경이 쉽게 발생할 수 있기 때문이다.

그래서 정의한 Account struct 에 대해 constructor 를 만들어 줄 것이다.

우선 다음과 같이 accounts.go 파일을 수정해서, 외부에서 직접 접근이 불가능 하도록 만든다.

```go
package accounts

type account struct {
	owner   string
	balance int
}
```

그리고 account struct 에 대한 constructor function 을 다음과 같이 정의한다.

*** constructor 라는 표현을 계속 사용하지만, Go 는 constructor 를 지원하지 않는다. 그래서 아래 예시와 같이 constructor-like factory function 을 만들어서 관례처럼 사용한다.*

```go
package accounts

type account struct {
	owner   string
	balance int
}

func NewAccount(pOwner string) *account {
	returnAccount := account{owner: pOwner, balance: 0}
	return &returnAccount
}
```

![0121-282-go-bank-dictionary-projects-account-newaccount-img-03.jpg](/tech-blog/resources/images/migration/0121-282-go-bank-dictionary-projects-account-newaccount/img-03.jpg)

NewAccount function 을 통해서만 struct 에 접근이 가능하도록 하고, 이 function 은 account struct 에 대한 constructor 역할을 한다.

NewAccount constructor-like factory function 을 사용하는 main.go 코드를 작성하고 실행해보자.

```go
package main

import (
	"accounts"
	"fmt"
)

func main() {
	myAccount := accounts.NewAccount("Nimkoes")
	fmt.Println(myAccount)
}
```

![0121-282-go-bank-dictionary-projects-account-newaccount-img-04.jpg](/tech-blog/resources/images/migration/0121-282-go-bank-dictionary-projects-account-newaccount/img-04.jpg)

실행 결과를 보면 &{Nimkoes 0} 즉, 주소값이 반환 되었다.

즉, accounts.NewAccount("Nimkoes") 의 실행 결과, 내부에서 만든 struct 에 대한 "값" 이 아닌 "주소 값" 이라는 것은 "생성한 값에 대한 사본"이 아닌 "생성한 값을 참조할 수 있는 주소" 를 반환했음을 뜻한다.

사본을 생성하지 않았다는 것은 불필요한 값을 생성하지 않고, 실제로 생성한 값을 사용한다는 것을 뜻한다.
