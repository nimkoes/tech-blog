---
title: 'Go ''BANK & DICTIONARY PROJECTS'' : Finishing Up'
description: >-
  Go struct를 출력할 때 자동으로 호출되는 String 메서드를 정의해 은행 계좌 출력 형식을 바꾸는 방법과 owner를 바꾸고 읽는 ChangeOwner, Owner 메서드를 정리했다.
publishedAt: '2021-05-21'
updatedAt: '2021-05-21'
tags:
  - Go
  - Bank & Dictionary
status: needs-review
---
Go 에는 다른 언어와 유사하게 사용자가 실행하지 않아도 자동으로 실행해주는 메소드가 있다.

예를 들면 Python 에서 class 를 출력하면 class 의 __str__ 을 호출 한다거나

Java 에서 객체를 출력하면 toString() 을 호출 하는 것과 같다.

본격적으로 알아보기에 앞서 account struct 의 owner 값을 수정하고 가져올 수 있는 메소드를 만들었다.

```go
// ChangeOwner of the account
func (a *account) ChangeOwner(newOwner string) {
	a.owner = newOwner
}

// Owner of the account
func (a account) Owner() string {
	return a.owner
}
```

Go 에서 struct 를 출력하면 다음과 같은 결과를 볼 수 있다.

```go
package main

import (
	"accounts"
	"fmt"
)

func main() {
	myAccount := accounts.NewAccount("Nimkoes")
	myAccount.Deposit(10)
	fmt.Println(myAccount)
}
```

![account struct를 그대로 출력해 &{Nimkoes 10}이 나온 go run 실행 결과](/tech-blog/resources/images/migration/0124-285-go-bank-dictionary-projects-finishing-up/img-01.jpg)

&{Nimkoes 10} 이 부분이 struct 를 바로 출력하면 그 안의 값을 보여주도록 만들어져 있는것 같다.

만약 이 값을 다른 형식으로 보여주고 싶으면 struct 에 대해 receiver 를 가지는 string 을 반환하는 String 메소드를 정의하면 된다.

```go
func (a account) String() string {
	return fmt.Sprint(a.Owner(), "'s account.\nHas : ", a.Balance())
}
```

accounts.go 에 추가한 이 메소드는 account struct 를 출력하면 자동으로 호출되어 실행하게 된다.

앞서 작성했던 main.go 를 다시 실행 시키면 다음과 같은 결과를 볼 수 있다.

![String 메서드를 정의한 뒤 Nimkoes's account. Has : 10 형식으로 출력된 go run 실행 결과](/tech-blog/resources/images/migration/0124-285-go-bank-dictionary-projects-finishing-up/img-02.jpg)
