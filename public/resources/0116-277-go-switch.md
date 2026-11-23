---
title: Go 의 switch 사용 방법
description: >-
  Go의 switch 문을 조건식만 쓰는 case 방식과 switch 안에서만 쓰는 변수를 선언하는 방식으로 나눠, else if를 대신하는 사용법을 짧은 예제로 정리했다.
publishedAt: '2021-05-16'
updatedAt: '2021-05-16'
tags:
  - Go
  - switch
status: needs-review
---
Go 에서의 switch 는 다른 언어와 비슷하다.

else if 가 너무 많이 사용되는 등의 경우 사용하면 좋은 문법이다.

```go
package main

import "fmt"

func canIDrink(age int) bool {
	switch {
	case age < 18:
		return false
	case age == 18:
		return true
	case age > 50:
		return false
	}
	return false
}

func canIDrinkVer2(age int) bool {
	switch koreanAge := age + 2; koreanAge {
	case 10:
		return false
	case 18:
		return true
	}
	return false
}

func main() {
	fmt.Println(canIDrink(18))
	fmt.Println(canIDrinkVer2(21))
}
```

![switch 예제를 go run으로 실행해 true와 false가 출력된 터미널](/tech-blog/resources/images/migration/0116-277-go-switch/img-01.jpg)

switch 문에서도 if 와 마찬가지로 switch 안에서만 사용 할 변수를 선언해서 사용할 수 있다.
