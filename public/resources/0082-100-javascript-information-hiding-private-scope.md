javascript에 대해 막연하게 단순하고 쉬운 스크립트 언어 라고만 생각했다.

굉장히 후회하고 또 반성하고 있다.

늦게나마 javascript에 대해 알아보는데, 새로운걸 알아갈수록 기쁘다기보다 부끄러운 마음이 더 크다.

일반적으로 프로그래밍 언어를 시작할 때 배우는 java나 c를 가지고 예를 들어보자. (java를 기준으로 알아볼 예정이다.)

```java
if(true) {
    String name = "xxxelppa";
}

System.out.println("이름 : " + name);
```

소스상에 위와 같은 부분이 있다고 하자.

장담하건데 "cannot be resolved to a variable' 라는 컴파일 오류가 발생할 것이다.

왜냐면 name이라는 변수는 if 조건절 안에 선언된 변수이기 때문이다.

그렇다면 이 에러를 해결하기 위해서 어떻게 해야할까.

여러가지 방법이 있겠지만 다음과 같이 해결할 수 있다.

```java
String name = "";

if(true) {
    name = "xxxelppa";
}

System.out.println("이름 : " + name);
```

이렇게 수정을 하면 1라인에 선언된 name이라는 문자열 변수를 7라인에서도 바라볼 수 있기 때문에 에러가 발생하지 않는다.

이것이 바로 변수의 범위, scope 이다.

java에서는 일반적으로 중괄호가 그 scope를 결정하는 역할을 한다.

그렇다면 javascript에서는 어떨까

개발자 도구를 켜고(f12) 실습해보자.

```javascript
if(true) {
    var name = "xxxelppa";
}

console.log("이름 : " + name);
```

이런 코드를 실행 시키면 어떻게 될까?

앞서 java에서 알아본 바에 의하면 이 코드는 무조건 에러가 발생한다.

왜냐하면 if 조건절 안에 name이 선언 되어있고, console.log 는 조건절 범위 밖에 위치하면서 name을 바라보려 하기 때문이다.

하지만 실행 결과는 놀랍게도

이름 : xxxelppa

라고 잘 나온다.

왜 이러는 걸까.

다양한 관점에서 'var 가 전역 변수를 선언하는 예약어겠지' 라던가

'선언 하면 전부 전역 변수인가?' 라는 생각을 할지도 모르겠다.

하지만 지금은 변수의 범위, scope에 대해 얘기를 하려 하기 때문에, 눈치가 빠르다면 if 조건절의 중괄호는 scope를 생성하지 않는구나 라고 생각할 수 있겠다.

결론부터 얘기하면 javascript에서 변수의 scope를 생성하는 경우는 딱 세가지이다.

1. function

2. with

3. catch

이 세가지 예약어를 통해서만 scope이 생성되며, 그 이외의 경우에는 scope를 생성하지 않는다.

(이번에는 function에 대해서만 알아보려 한다.)

이런 관점에서 다음의 코드를 작성해보자.

```javascript
function testFunc() {
    var name2 = "xxxelppa";
}

console.log("이름 : " + name2);
```

if대신 function을 사용했을 뿐인데, 실행해보면 "Uncaught ReferenceError: name2 is not defined" 라는 에러를 발생할 것이다.

즉, function안에 선언된 name2는 testFunc 함수 내부에서만 사용할 수 있다는 뜻이다.

이제 이런 성질을 이용해서 private한 변수를 생성할 수 있다.

그 발상의 근거는 (개인적인 의견이다.)

1. 외부에서는 function안에 선언된 변수에 접근할 수 없다.

2. 내부함수 속에있는 변수에 접근할 수 있는 함수를 선언하고 이 함수만 리턴해버리면 변수에는 직접 접근할 수 없다.

2번의 설명이 좀 복잡하지만 다음 간단한 예제를 보면 금방 이해할 수 있다.

```javascript
function temp() {
    var innerVar;

    return {
        getInnerVar : function() {
            return innerVar;
        },
        setInnerVar : function(param) {
            innerVar = param;
        }
    }
}

var test = temp();
```

코드를 보면 1라인에서 temp라는 함수를 하나 정의 하고 있다.

이 temp라는 함수는 innerVar이라는 변수를 하나 가지고 있는데,

앞서 살펴보았듯 function의 외부에서는 직접 접근이 불가능하다.

그리고 이 temp라는 함수는 오브젝트를 리턴 해버리는데

getInnerVar 라는 키값에 function을 하나 value로 가지고

setInnerVar 라는 키값에도 function을 하나 value로 가지는

단순한 키-값 쌍의 오브젝트이다.

이 두개의 오브젝트는 innerVar에 접근하여 값을 설정, 반환 하는 역할을 한다.

그런 이유로 14라인에서 test에 담긴 내용을 보면 다음과 같다.

![0082-100-javascript-information-hiding-private-scope-img-01.jpg](/tech-blog/resources/images/migration/0082-100-javascript-information-hiding-private-scope/img-01.jpg)

개발자 도구로 test라는 변수에 담긴 내용을 출력해본 결과이다.

그럼 이제 test에 담긴 두개의 함수를 사용해보자.

![0082-100-javascript-information-hiding-private-scope-img-02.png](/tech-blog/resources/images/migration/0082-100-javascript-information-hiding-private-scope/img-02.png)

이 결과를 가지고 무엇을 알 수 있을까?

바로 java에서 private 변수를 선언한 것처럼 직접 변수에 접근할 수 없고

개발자가 작성한 getter와 setter를 통해서만 변수에 접근할 수 있다는 것을 뜻한다.

다시말해, 개발단계에서 개발자가 의도한 방식 이외의 접근을 막는다는 것이다.
