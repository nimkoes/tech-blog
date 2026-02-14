많은 사람들을 만나본게 아니라 확실히는 모르겠지만,

처음 언어를 시작하는 사람들의 대부분이 API에 대해 생각하지 않는 것 같다.

이번엔 JAVA API에 대해 알아보려 한다.

개인적으로 무언가 새로운 것을 알아갈 때 그 사전적 **정의**부터 찾아본다.

<table>
<tbody>
<tr>
<td>API&nbsp;:&nbsp;Application&nbsp;Programming&nbsp;Interface <br>응용&nbsp;프로그램&nbsp;프로그래밍&nbsp;인터페이스 <br><br>응용&nbsp;프로그램에서&nbsp;사용할&nbsp;수&nbsp;있도록,&nbsp;운영체제나&nbsp;프로그래밍&nbsp;언어가&nbsp;제공하는&nbsp;기능을&nbsp;제어할&nbsp;수&nbsp;있게&nbsp;만든&nbsp;인터페이스를&nbsp;뜻한다. <br>주로&nbsp;파일&nbsp;제어,&nbsp;창&nbsp;제어,&nbsp;화상&nbsp;처리,&nbsp;문자&nbsp;제어&nbsp;등을&nbsp;위한&nbsp;인터페이스를&nbsp;제공한다. <br><br>-&nbsp;우리&nbsp;모두의&nbsp;백과사전&nbsp;위키백과</td>
</tr>
</tbody>
</table>

첫 번째 줄에 주목해 보자

"응용 프로그램에서 사용할 수 있도록, 운영체제나 프로그래밍 언어가 제공하는 기능"

즉, **기본적으로 제공해주고 있다**라는 말이다.

그런 의미에서 JAVA API문서를 열어보자

JAVA API라고 검색하면 아주 쉽게 접근할 수 있다.

![0061-27-java-api-reference-mindset-img-01.png](/tech-blog/resources/images/migration/0061-27-java-api-reference-mindset/img-01.png)

들어가보면 대략 이런 구성이다.

우측 영역의 상단을 보면 이렇게 써있다.

Java Platform, Standard Edition 7 API Specification

***첫 번째, Standard Edition이란 우리가 오라클 자바 홈페이지에서 jdk나 jre를 다운받을 때 SE라는 것을 본 적이 있을 것이다.***

<table>
<tbody>
<tr>
<td>자바는&nbsp;그&nbsp;사용&nbsp;용도에&nbsp;따라서&nbsp;크게&nbsp;세&nbsp;가지로&nbsp;분류할&nbsp;수&nbsp;있다. <br><br>&nbsp;-&nbsp;SE&nbsp;:&nbsp;Standard&nbsp;Edition <br>&nbsp;-&nbsp;EE&nbsp;:&nbsp;Enterprise&nbsp;Edition <br>&nbsp;-&nbsp;ME&nbsp;:&nbsp;Micro&nbsp;Edition <br><br>지금은&nbsp;api에&nbsp;대해&nbsp;알아보기도&nbsp;했으므로&nbsp;이것들에&nbsp;대한&nbsp;조금&nbsp;더&nbsp;자세한&nbsp;설명은&nbsp;다음에&nbsp;따로&nbsp;작성해야겠다.</td>
</tr>
</tbody>
</table>

2015년 10월을 기준으로 java는 8버전 까지 나와있는 상태이지만

지금 보고 있는 것은 7버전의 api 문서이다

그리고 API Specification 이라고 써있는 것을 보아하니 API의 자세한 스펙에 관한 문서임을 짐작할 수 있다.

***두 번째, 좌측 상단 영역은 package 영역이다.***

이것 저것 눌러보면 알겠지만 내가 선택한 package에 따라 하단의 Classes 리스트가 변하는 것을 볼 수 있다.

이렇게 좌측 상단 package영역에서 내가 찾고있는 package를 선택하면

해당 package 하위에 포함되어있는 class들의 목록을 확인할 수 있다.

(Packages 문구 위의All Classes를 누르고 ctrl + f 로 찾고있는 class이름을 검색하면 보다 빠르게? 원하는 Class에 대한 명세를 찾아볼 수 있다.)

***세 번째, java 코드 작성시 내가 import하지 않아도 default 값으로 import 되어 있는 java.lang 패키지를 열어보자.***

![0061-27-java-api-reference-mindset-img-02.png](/tech-blog/resources/images/migration/0061-27-java-api-reference-mindset/img-02.png)

packages에서 java.lang을 찾아 누르면 좌측 하단에 해당 package가 명시되고

그 아래 java.lang package 안에 있는 Interface, Classes, Enums, Exceptions, Errors, Annotation Types 등이

abc순서로 리스트업 되어 있는 것을 볼 수 있다.

참고로 우리가 무의식적으로 import 구문을 사용하여 특정 package를 삽입한다는 것은

그 package안에 있는 Class들을 가져다 사용 하겠다는 의미이다.

그리고 앞서 api의 정의에서 살펴 봤지만, 프로그래밍 언어에서 제공하는 기능 이라는 것이다

기본적으로 제공 되는 것이기 때문에 우리는 힘들게 구현하지 않고서 그저 가져다 사용하면 된다는 뜻이다.

이 내용에 대해서는 바로 아래 조금 더 자세히 설명하겠다.

***네 번째, 우리가 처음 언어를 배우던 때가 기억이 날지 모르겠다.***

나같은 경우에는 '백문이 불여일타', '선 코딩 후 이해' 스타일로 언어를 배웠었다

그때 우리 모두가 생각없이(?) 받아적은 그 문구

System.out.println("Hello, World!");

여기서 도대체 System은 무엇이며 out은 뭐 내보내는 건가?

println? print? 아는 단어인데 뭐 출력하려면 이렇게 써야 하는거구나

라고 통째로 받아들인 이 문장에 대해 이제는 어느정도 알때도 되었다고 생각한다.

그러면 Classes에서 System을 찾아서 눌러보자.

java에 약속이 있는 것은 알고 있을 것이다.

그래도 혹시나 아직 모를 분들을 위해 사족을 달자면

Class 이름은 영문 대문자로 시작하고, method 이름은 소문자로 시작하는 경우가 대부분이다.

그렇기 때문에 이제는 System을 보는 우리는 'System 클래스구나'라고 알아야 한다.

![0061-27-java-api-reference-mindset-img-03.png](/tech-blog/resources/images/migration/0061-27-java-api-reference-mindset/img-03.png)

좀 크고 길지만, 그래도 일부를 가져와 보았다

여기서 한가지 더 생각하고 넘어가자, 지금 우리가 보고 있는 것은 java.lang 패키지의 "일부"이다.

앞서 얘기했듯 lang 패키지는 개발하는 식에 작성하지 않아도 기본적으로 import 되어 있는 패키지라고 말했다.

즉 우리는 이렇게 많은 클래스와 메서드를 따로 구현하거나 선언하지 않아도 아무 제약 없이 가져다 사용할 수 있다.!!

첫번째 네모박스는 상속 관계를 나타내 준다.

이 정보로 System Class는 Object Class를 상속받았음을 알 수 있다.

그리고 바로 아래 그 Class에 대한 설명이 달려 있다.

System Class는 몇가지 유용한 필드와 메서드들을 가지고 있다는 그런 내용인것 같다.

두번째 세번째 네모박스에는 필드와 메서드의 요약 정보를 리스트업 해서 보여준다.

자 여기 익숙한게 보인다. 바로 out

static으로 선언된 이 out은 표준 출력 스트림 이라고 나와있다. (static과 스트림에 대해서는 다음에 다루겠다.)

조금 더 내려와 네번째 다섯번째 네모박스에는 필드와 메서드에 대한 자세한 내용이 적혀있다.

(사실 이것을 일일이 찾을 필요 없이 Summary영역에서 링크를 클릭하면 자세한 내용이 적힌 부분으로 스크롤이 옮겨간다.)

Field Detail의 out만 봐도 이것이 어떤 것인지 자세한 설명과 함께

어떻게 사용하는지에 대해 알아야 할 것들에 대해 자세히 기입되어 있다.

#### 마지막으로 이제 api 문서를 보고 내가 필요한 Class를 찾아 가져다 사용하면 된다.

이제 앞에서 주저리 주저리 두서없이 써내려간 것을 정리해보자

1. API는 백과사전과 같다고 생각하면 좋다

- 우리가 사전에서 말을 찾아서 그 의미를 알고 어떻게 사용하는지 보고 문장에 적용하여 말을 한다.

이것과 마찬가지로 내가 필요로 하는 기능을 api문서에서 찾고 어떻게 사용하는지 설명을 보고

내가 필요한 부분에 적절하게 적용하여 사용하면 된다.

- 특히 이 api는 "기본적으로"제공하기 때문에 특별한 제약 없이 사용할 수 있는 장점이 있다.

2. 클래스 이름은 대문자로 시작, 메서드 이름은 소문자로 시작

- 만일 이름이 두 단어 이상이라면 단어의 첫 문자만 대문자로 작성한다.

3. 자주 사용하는 api들은 기억해두면 고생하지 않고 쉽고 간결한 코드를 작성할 수 있다.

- 실제로 학생시절 교수님이 숫자를 입력 받아서 제곱근을 계산해 출력하는 간단한 프로그램 작성을

지시한 적이 있었다. (물론 api를 참고하지 않는다는 조건이 있었지만) 머리를 굴리고 굴려서

제곱근을 구했던 기억이 있다.

하지만 허무하게도 (그때 당시에는 반복문, 조건문에 대해서만 알고 있었기 때문에 다른 클래스를 만든다거나

메서드를 따로 작성해서 호출해서 사용할 생각은 하지 못하던 시절이다.)

sqrt함수를 사용하면, 그것도 미리 정의되어 있어서 호출하기만 하면 되는 것을 그렇게 고생했다는게 억울한 기억이 있다.

(아마도 api의 중요함을 겸사겸사 어필하고 싶으셨던것 같다.

아무리 백문이 불여일타라지만

어느정도 걷는데 익숙해 졌다면, 고개 들고 앞을 보며 어디로 갈건데 어떻게 가는게 좋을지

주변 살펴 가는게 좋지 않을까 생각한다.
