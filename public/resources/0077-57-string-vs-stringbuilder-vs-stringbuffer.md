자바에는 문자열을 처리하기 위한 클래스로 String, StringBuilder, StringBuffer 클래스가 있다.

단순히 문자열을 처리하기 위함이라면 *(예를 들면 System.out.println("문자열"); 이런 경우)* 어떤 것을 사용해도 별다른 차이는 없다고 알고 있다. 하지만 문자열을 더하는 (+) 연산을 할 경우에 퍼포먼스상의 차이가 발생한다.

백번 듣느니 한 번 보는게 낫다.

실제로 아래와 같은 예제는 많은 곳에서 흔히 볼 수 있는 예제일 것이다.

```java
package xxxelppa.tistory.com;

public class StringTest {
    public static void main(String[] ar) {
        long StartTime = 0;
        long EndTime = 0;

        String str;
        StringBuilder strBdr;
        StringBuffer strBfr;

        for(int k = 0; k < 9; ++k) {
            str = new String("문자열");
            strBdr = new StringBuilder("문자열");
            strBfr = new StringBuffer("문자열");

            System.out.println("============== " + (k + 1) + "번째 비교 결과" + " ==============");

            StartTime = System.nanoTime();
            for(int i = 0; i < 10000; ++i) {
                str += i;
            }
            EndTime = System.nanoTime();
            System.out.println("String의 실행 시간\t\t: " + (EndTime - StartTime));

            StartTime = System.nanoTime();
            for(int i = 0; i < 10000; ++i) {
                strBdr.append(i);
            }
            EndTime = System.nanoTime();
            System.out.println("StringBuilder의 실행 시간\t: " + (EndTime - StartTime));

            StartTime = System.nanoTime();
            for(int i = 0; i < 10000; ++i) {
                strBfr.append(i);
            }
            EndTime = System.nanoTime();
            System.out.println("StringBuffer의 실행 시간\t: " + (EndTime - StartTime));
            System.out.println("=============================================");
            System.out.println();

        }

    }
}
```

위 예제는 똑같이 문자열을 더하는 연산을 했을 때 실행 속도를 비교하는 소스이다.

실행 결과는 다음과 같다.

<table>
<tbody>
<tr>
<td>==============&nbsp;1번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;192313252 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;417904 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;613102 <br>======================================= <br><br>==============&nbsp;2번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;165631465 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;427854 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;460046 <br>======================================= <br><br>==============&nbsp;3번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;178263707 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;276554 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;340644 <br>======================================= <br><br>==============&nbsp;4번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;184807363 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;371959 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;376934 <br>======================================= <br><br>==============&nbsp;5번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;178070851 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;436048 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;479068 <br>======================================= <br><br>==============&nbsp;6번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;133046927 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;268945 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;361423 <br>======================================= <br><br>==============&nbsp;7번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;153004492 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;210708 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;355277 <br>======================================= <br><br>==============&nbsp;8번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;137168318 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;289139 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;418782 <br>======================================= <br><br>==============&nbsp;9번째&nbsp;비교&nbsp;결과&nbsp;============== <br>String의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;136230374 <br>StringBuilder의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;309039 <br>StringBuffer의&nbsp;실행&nbsp;시간&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;373129 <br>=======================================</td>
</tr>
</tbody>
</table>

실행 시간 결과는 String > StringBuffer > StringBuilder 순서이다.

그렇다면 왜 이런 결과가 나왔을까?

String은 문자열을 더하기 위해 ***String 공간을 하나 더 만드는 작업***을 한다.

이게 무슨 소리일까? String이라는 클래스가 가지는 특성이라고 받아들일 수 밖에 없다.

String 클래스형 자료형으로 선언된 문자열이 메모리상에 할당이 되면, 이 값을 바꿀 수 없는 값이 된다.

만약 이 문자열이 더해지거나 빼는 연산을 하게 될 경우 기존에 할당한 ***메모리에 저장된 값이 바뀌지 않는다***는 소리다.

```java
String addr100 = new String("문자열A");
String addr101 = new String("문자열B");

addr100 = addr100 + addr101;
```

이 소스가 실행되면 메모리상에서 어떤 일이 생길까?

![0077-57-string-vs-stringbuilder-vs-stringbuffer-img-01.png](/tech-blog/resources/images/migration/0077-57-string-vs-stringbuilder-vs-stringbuffer/img-01.png)

위에 첨부한 이미지를 함께 보자.

만약 메모리상에 위처럼 문자열이 저장 되어있다고 했을 때, 100번지의 "문자열A"와 101번지의 "문자열B"를 더해 새로운 문자열 "문자열A문자열B"를 만든 경우이다.

즉 ***addr100 변수는 100번지를 바라보고 있다가 새로운 102번지를 바라보게*** 된다. *(바라본다 보다 참조한다는 말이 더 옳다)*

그럼 100번지는?

***가비지 컬렉터가 나중에 알아서 처리***해주니 신경쓰지 말자.

String 클래스의 경우 기존 값에 새로운 값을 더하는 것이 아닌, 위와 같이 ***추가 연산이 필요***하기 때문에 StringBuilder나 StringBuffer보다 ***퍼포먼스가 떨어진다.***

그렇기 때문에 문자열 연산에서는 StringBuilder나 StringBuffer 클래스의 사용을 권장한다.

*(내용이 너무 길어질 것 같아서 추가하지 않으려 했지만, 급하면 이 부분은 넘어가도 좋다.)*

지금까지 문자열을 더하는 연산이 빈번하게 발생한 부분은 배치 프로그램에서 쿼리를 작성할 때였다.

다음과 같은 쿼리가 있다고 하자. *(다소 과장된 부분이 있다.)*

```sql
SELECT
    AAA
    , BBB
    , CCC
    , DDD
    , EEE
FROM TEST
WHERE
    1=1
    AND AAA > 100
    AND BBB > 200
    AND CCC > 300
    AND DDD > 400
```

이 때 이 쿼리문을 다음과 같이 변수에 담을 수 있다.

```java
String query = "";

query += "SELECT           ";
query += "    AAA          ";
query += "    , BBB        ";
query += "    , CCC        ";
query += "    , DDD        ";
query += "    , EEE        ";
query += "FROM TEST        ";
query += "WHERE            ";
query += "    1=1          ";
query += "    AND AAA > 100";
query += "    AND BBB > 200";
query += "    AND CCC > 300";
query += "    AND DDD > 400";
```

단순히 더하는게 아니라고 생각해보면 이게 얼마나 재앙인지 이제는 알게 되었으리라 생각한다.

*(위와 같은 경우 반드시 StrinfBuilder 클래스나 StringBuffer 클래스를 사용하기를..)*

그럼 마지막으로, String과 StringBuilder, StringBuffer의 차이는 알겠는데 StringBuilder와 StringBuffer의 차이는 무엇일까?

StringBuilder와 StringBuffer 클래스는 사실 하는 일은 똑같다. 다만 하나의 차이가 있는데 ***동기화 처리의 문제***이다.

StringBuffer클래스는 동기화 *(Synchronized)*를 지원하며 멀티 스레드 환경에서도 동기화를 지원한다. 그렇기 때문에 단일 스레드일 경우 StringBuilder 클래스를, 멀티 스레드일 경우 StringBuffer 클래스의 사용이 권장된다. *(StringBuffer 클래스의 경우 혼용해도 상관없지만, 동기화 처리 문제로 퍼포먼스상의 이슈가 있다고 한다.)*

실제로 맨 위에 예제로 만든 소스의 실행 결과를 보면 ***단일 스레드 환경***에서 ***StringBuilder 클래스가 StringBuffer클래스보다 퍼포먼스가 좋은 것을 확인***할 수 있다.

동기화라는 개념은 어려운게 아니다.

마치 한칸짜리 공중 화장실이라고 생각하면 될 것 같다.

누구나 사용할 수 있지만, 동시에 사용할 수 없도록 하는 것이 동기화이다.

흔히 찾아볼 수 있는 예제이지만, 보다 정확하게 확인하고 싶어서 주소값을 직접 출력 해보고 싶었는데 그렇게 하지 못해 아쉬움이 남는다.
