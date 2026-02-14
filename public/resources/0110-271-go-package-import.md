앞서 Hello World 문자열을 출력하는 코드를 Go로 작성해 보았다.

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello World!")
}
```

fmt 를 직접 import 한 적이 없는데, IDE 에서 알아서 자동으로 추가해 주었다.

fmt 는 Go 가 가지고 있는 패키지 중 하나로 formatting 을 위한 package 이다.

import 관련해서 javascript 의 경우 function 을 export 해주고 싶은 경우 모듈을 export 하겠다고 명시해 주어야 한다.

Go 에서는 function 을 export 해주고 싶다면 function 을 영문자 대문자로 시작하면 된다.

정말 그런지 확인해보기 위해 현재 프로젝트의 최상위에 'something' 폴더를 만들고 그 안에 'something.go' 파일을 만들었다.

![0110-271-go-package-import-img-01.jpg](/tech-blog/resources/images/migration/0110-271-go-package-import/img-01.jpg)

'something.go' 의 파일 내용은 다음과 같다.

```go
package something

import "fmt"

func sayBye() {
	fmt.Println("Bye")
}

func SayHello() {
	fmt.Println("Hello")
}
```

여기서 주목할 점은 'SayHello' function 이 영문자 대문자로 시작 한다는 것이다.

그럼 다시 main.go 로 돌아가서 다음과 같이 내용을 추가 한다.

```go
package main

import (
	"fmt"

	"something"
)

func main() {
	fmt.Println("Hello World!")

	something.SayHello()
	something.sayBye()
}
```

그랬더니 아예 'something' 자체를 전혀 찾지 못했다.

이유가 무엇일까 생각해보니, 처음 프로젝트를 생성할 때 Go 가 설치되는 기본 경로에 있는 src 디렉토리 하위에서 작업 하기를 권장했었다.

import 해서 쓸 수 있는건 아무래도 이 경로에 있어야 하는것 같아서 그 위치로 새로 만든 'someting'을 옮겨 보았다.

![0110-271-go-package-import-img-02.jpg](/tech-blog/resources/images/migration/0110-271-go-package-import/img-02.jpg)

그랬더니 'something' 을 전혀 찾지 못해 발생하던 오류는 사라졌다.

그리고 실행해보니 'sayBye' 에서 다음과 같이 오류가 발생했다.

![0110-271-go-package-import-img-03.jpg](/tech-blog/resources/images/migration/0110-271-go-package-import/img-03.jpg)

'cannot refer to unexpected name something.sayBye'

그래서 'something.sayBye' 를 주석처리하고 실행 해봤더니 정상적으로 동작하는걸 볼 수 있었다.

```go
package main

import (
	"fmt"

	"something"
)

func main() {
	fmt.Println("Hello World!")

	something.SayHello()
	// something.sayBye()
}
```

![0110-271-go-package-import-img-04.jpg](/tech-blog/resources/images/migration/0110-271-go-package-import/img-04.jpg)

마지막으로 지나가듯 언급한 내용인데, 이렇게 function 을 정의할 때 export 하지 않는 것에 대해 영문자 소문자를 사용하는것이 마치 private 접근 제한자를 사용하는 것과 같다.
