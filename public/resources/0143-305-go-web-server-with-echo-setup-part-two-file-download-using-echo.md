echo 를 시용해서 서버를 만드는 것을 super easy 하다.

main.go 파일을 다음과 같이 수정하자.

```go
package main

import (
	"net/http"

	"github.com/labstack/echo"
)

func main() {
	e := echo.New()
	e.GET("/", handleHome)
	e.Logger.Fatal(e.Start(":1323"))
}

func handleHome(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
```

그리고 실행하면 다음과 같이 실행 결과가 출력 되고, 1323 포트를 통해 접속할 수 있다.

![0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo-img-01.jpg](/tech-blog/resources/images/migration/0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo/img-01.jpg)

![0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo-img-02.jpg](/tech-blog/resources/images/migration/0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo/img-02.jpg)

정상적으로 실행 되는것을 확인하긴 했지만, myScraper 를 전혀 사용하고 있지 못하고 있다.

그래서 문자열을 출력하는 대신, 화면을 출력할 수 있도록 html 파일을 하나 만들어 보자.

![0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo-img-03.jpg](/tech-blog/resources/images/migration/0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo/img-03.jpg)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Go Jobs</title>
</head>
<body>
    <h1>Go Jobs</h1>
    <h3>Indeed.com scraper</h3>

    <form>
        <input placeholder="what job do u want" />
        <button>Search</button>
    </form>
</body>
</html>
```

그리고 이 파일을 사용할 수 있도록 main.go 파일도 다음과 같이 수정한다.

```go
package main

import (
	"github.com/labstack/echo"
)

func main() {
	e := echo.New()
	e.GET("/", handleHome)
	e.Logger.Fatal(e.Start(":1323"))
}

func handleHome(c echo.Context) error {
	return c.File("home.html")
}
```

적용되는 것을 확인해보기 위해 서버를 재시작 하고 다시 접속해보자.

![0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo-img-04.jpg](/tech-blog/resources/images/migration/0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo/img-04.jpg)

그럼 마지막으로 form 의 method 와 action 을 정의하고, main.go 파일에서 echo 의 핸들러를 등록한 다음에 myScrap 패키지의 MyScrap 을 input 으로 받은 값을 넘겨주고 실행하도록 해보자.

그 전에 myScrap.go 파일의 cleanString function 을 외부에서도 사용할 수 있도록 CleanString function 으로 이름을 변경해준다.

이렇게 하면 public 접근을 할 수 있게 되어 외부에서도 호출해서 사용할 수 있게 된다.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Go Jobs</title>
</head>
<body>
    <h1>Go Jobs</h1>
    <h3>Indeed.com scraper</h3>

    <form method="POST" action="/myScrap">
        <input placeholder="what job do u want" name="term"/>
        <button>Search</button>
    </form>
</body>
</html>
```

form 태그에 전송 방식을 POST 로 하고 action 을 /myScrap 으로 입력한다.

그리고 input 태그의 name 속성을 지정하여 핸들러에서 이 값을 사용할 수 있도록 한다.

```go
package main

import (
	"learngo/part4_job_scrapper/part4_1_getPages_part_one/myScrap"
	"os"
	"strings"

	"github.com/labstack/echo"
)

const FILE_NAME string = "jobs.csv"

func main() {
	e := echo.New()
	e.GET("/", handleHome)
	e.POST("/myScrap", handleScrap)
	e.Logger.Fatal(e.Start(":1323"))
}

func handleHome(c echo.Context) error {
	return c.File("home.html")
}

func handleScrap(c echo.Context) error {

	// 실행 이후 서버에서 파일을 삭제한다.
	defer os.Remove(FILE_NAME)

	term := strings.ToLower(myScrap.CleanString(c.FormValue("term")))
	myScrap.MyScrap(term)
	return c.Attachment(FILE_NAME, FILE_NAME)
}
```

handleScrap function 을 정의하고 16라인에서 "/myScrap" POST 요청을 처리 할 핸들러로 등록 한다.

29라인 에서는 myScrap 에서 public 접근을 하도록 수정한 CleanString 을 사용하고, form 태그의 name 속성의 값을 가져와 MyScrap 을 실행할 때 전달하는 매개변수를 처리한다.

31라인의 c.Attachment 는 파일을 다운받을 수 있도록 한다.

여기까지 수정 했으면 서버를 재시작하고 브라우저에서 실행해보자.

![0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo-img-05.jpg](/tech-blog/resources/images/migration/0143-305-go-web-server-with-echo-setup-part-two-file-download-using-echo/img-05.jpg)

정상적으로 실행되는 것을 확인할 수 있다.

[echo 에 대한 더욱 다양한 사용 방법에 대한 document 링크이다.](https://echo.labstack.com/cookbook/)

필요한 기능이 있으면 쉽게 찾아서 사용해볼 수 있을것 같다.
