---
title: Go 의 상수와 변수
description: >-
  Go에서 const로 상수를, var로 변수를 선언하는 방법과 타입을 이름 뒤에 쓰는 문법, untyped 상수, 사용하지 않은 변수 오류, := 축약 선언의 제약을 정리했다.
publishedAt: '2021-05-16'
updatedAt: '2021-05-16'
tags:
  - Go
  - Variable
status: needs-review
---
Go 에서 상수는 'const' 키워드를 사용해서 선언할 수 있다.

```go
const name string = "nimkoes"
```

![VS Code에서 타입 없이 선언한 상수 name에 마우스를 올리면 const name untyped string으로 표시되는 모습](/tech-blog/resources/images/migration/0111-272-go-constants-and-variables/img-01.jpg)

특이한게 있다면, 타입을 명시하지 않으면 'untyped' 라는게 붙고, 값을 토대로 추론한 타입도 같이 명시 되었다.

그리고 타입을 명시하면 'untyped' 가 사라진다.

![상수에 string 타입을 명시하자 VS Code 툴팁에서 untyped가 사라진 모습](/tech-blog/resources/images/migration/0111-272-go-constants-and-variables/img-02.jpg)

또 다른게 있다면, 타입을 변수의 뒤에 명시한다.

지금까지는 보통 타입을 먼저 쓰고, 그 타입의 값을 담을 변수의 이름을 작성했는데 Go 에서는 그 순서가 반대다.

약간 "문자열 타입의 변수 name 입니다." 라고 하던게 "name 변수 입니다. 근데 이제 string 타입인" 이라고 하는 느낌이다.

변수 선언은 'const' 대신 'var' 을 쓴다.

```go
var nickname string = "nickname"
```

![go run 실행 시 nickname declared but not used 오류로 컴파일이 실패한 터미널](/tech-blog/resources/images/migration/0111-272-go-constants-and-variables/img-03.jpg)

신기한건 상수일때는 안그랬는데 변수일때는 선언을 하고 사용하지 않으면 프로그램이 실행되지 않는다.

변수 선언에 대해서 다음과 같이 축약해서 사용 할 수 있다.

```go
another := "another"
```

이 때 주의할 것은 func (함수) 안에서만 사용할 수 있고, 이렇게 사용한 변수의 타입은 Go 가 사용 할 타입을 정해준다.

그리고 이런 축약형은 변수에만 사용할 수 있다.
