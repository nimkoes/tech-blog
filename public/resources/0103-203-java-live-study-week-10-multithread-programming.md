## 자바의 멀티쓰레드 프로그래밍에 대해 학습하세요.

---

### 학습할 것

- Thread 클래스와 Runnable 인터페이스
- 쓰레드의 상태
- 쓰레드의 우선순위
- Main 쓰레드
- 동기화
- 데드락

---

멀티쓰레드에 대해 알아보기 전에 미리 알아야 할 것들이 조금 있다.

OS(운영체제)에서 실행중인 하나의 프로그램을 프로세스라고 한다. 작업 관리자를 열어보면, 현재 운영체제에서 실행중인 프로세스들을 볼 수 있다.

![0103-203-java-live-study-week-10-multithread-programming-img-01.jpg](/tech-blog/resources/images/migration/0103-203-java-live-study-week-10-multithread-programming/img-01.jpg)

이것들은 OS 로부터 메모리를 할당 받아 동작한다.

그리고 멀티 태스킹이라는 것도 있다.

딘어에서 느껴지는 것 그대로 동시에 여러가지 일을 처리하는 것을 말한다.

작업 관리자를 보면 동시에 여러가지 프로그램이 실행되고 있는 것을 볼 수 있는데, 이것도 멀티 태스킹의 하나라고 할 수 있다.

그렇다고 해서 멀티 태스킹이라는 것이 꼭 OS 레벨에서 동시에 여러 프로세스를 실행 하는 것만을 뜻하지는 않는다.

하나의 프로세스 안에서도 동시에 여러가지 일을 처리할 수 있다.

예를 들면 카카오톡 pc버전에서 메시지를 보내면서 파일을 전송 한다던가 하는 것들을 동시에 할 수 있다.

이렇게 하나의 프로세스 안에서 동시에 여러가지 작업을 할 수 있는 것은 각 작업마다 서로 다른 쓰레드를 생성하기 때문이다.

쓰레드는 작업 흐름이라고 할 수 있는데, 카카오톡의 예시에서 처럼 하나의 프로세스는 여러개의 쓰레드를 생성해서 동시에 처리할 수 있다.

이것을 멀티 쓰레드 라고 한다. 멀티 프로세스와는 서로 다른 것이다.

이 둘을 구분해야 하는 이유가 있다.

멀티 프로세스에서 각자의 프로세스는 OS로부터 서로 다른 메모리를 할당받아 독립적으로 동작하기 때문에, 하나의 프로세스가 문제가 생겼다고 해도 다른 프로세스에 영향을 주지 않는다.

즉, 카카오톡 메신저가 문제가 생겨 비정상 강제 종료를 하게 되었다고 해서 인터넷 브라우저나 IDE가 같이 종료되어 버리지 않는다.

하지만 같은 프로세스 안에서는 얘기가 다르다. 멀티 쓰레드 환경에서 하나의 쓰레드에 문제가 생기면, 그 쓰레드가 속한 프로세스 자체가 죽어버릴 수 있기 때문이다.

그리고 동시성(concurrency)과 병렬성(parallelism)이 있다.

멀티 쓰레드가 실행 될 때 이 두가지 중 하나로 실행된다.

이것은 cpu의 코어의 수와도 연관이 있는데, 하나의 코어에서 여러 쓰레드가 실행되는 것을 동시성,

멀티 코어를 사용할 때 각 코어별로 개별 쓰레드가 실행 되는 것을 병렬성 이라고 한다.

만약 코어의 수가 쓰레드의 수보다 많다면, 병렬성으로 쓰레드를 실행하면 되는데

코어의 수보다 쓰레드의 수가 더 많을 경우 동시성을 고려하지 않을 수 없다.

동시성을 고려 한다는 것은, 하나의 코어에서 여러 쓰레드를 실행 할 때 병렬로 실행하는 것처럼 보이지만

사실을 병렬로 처리하지 못하고 한 순간에는 하나의 쓰레드만 처리할 수 있어서 번갈아 가면서 처리하게 되는데

그 번갈아 가면서 수행하는게 워낙 빠르기 때문에 각자 병렬로 실행 되는 것처럼 보일 뿐이다.

#### Thread 클래스와 Runnable 인터페이스

---

Thread 클래스와 Runnable 인터페이스 모두 자바에서 쓰레드를 생성할 때 사용하는 것들이다.

다음 예제 코드의 주석을 참고하여 어떻게 쓰레드를 생성할 수 있는지 확인해보려 한다.

```java
package me.xxxelppa.study.week10;

public class Exam_001 {
    public static void main(String[] args) {

        // Runnable 객체를 생성자 매개변수로 념겨줘서 생성하는 방법
        Thread myThread_1 = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("MT_1 :: Runnable 객체를 Thread 클래스 생성자 매개변수로 사용");
            }
        });

        // 위와 같은 방법이지만, 람다를 사용한 방법
        Thread myThread_2 = new Thread(() -> {
            System.out.println("MT_2 :: 람다를 사용하여 Runnable 객체를 Thread 클래스 생성자 매개변수로 사용");
        });

        // Thread 클래스를 상속 받은 클래스를 사용한 방법
        Thread myThread_3 = new MyThreadClass();

        // 익명 객체를 사용해서 쓰레드를 생성
        Thread myThread_4 = new Thread() {
            @Override
            public void run() {
                System.out.println("MT_4 :: 익명 객체를 사용");
            }
        };

        // 생성한 쓰레드를 실행하기 위해서는 Thread 클래스의 start 메소드를 사용
        myThread_1.start();
        myThread_2.start();
        myThread_3.start();
        myThread_4.start();

    }
}

class MyThreadClass extends Thread {
    @Override
    public void run() {
        System.out.println("MT_3 :: Thread 클래스를 상속받아서 생성한 쓰레드 :: run 메소드를 override 한다.");
    }
}
```

<table>
<tbody>
<tr>
<td><span>MT_2&nbsp;::&nbsp;람다를&nbsp;사용하여&nbsp;Runnable&nbsp;객체를&nbsp;Thread&nbsp;클래스&nbsp;생성자&nbsp;매개변수로&nbsp;사용 </span><br><span>MT_4&nbsp;::&nbsp;익명&nbsp;객체를&nbsp;사용 </span><br><span>MT_3&nbsp;::&nbsp;Thread&nbsp;클래스를&nbsp;상속받아서&nbsp;생성한&nbsp;쓰레드&nbsp;::&nbsp;run&nbsp;메소드를&nbsp;override&nbsp;한다. </span><br><span>MT_1&nbsp;::&nbsp;Runnable&nbsp;객체를&nbsp;Thread&nbsp;클래스&nbsp;생성자&nbsp;매개변수로&nbsp;사용</span></td>
</tr>
</tbody>
</table>

실행 결과를 보면 쓰레드를 실행한 순서대로 출력되지 않은 것을 볼 수 있다.

왜냐하면 각자 쓰레드를 시작은 했지만 실제로 자원을 할당 받아 특정한 한 순간에 실행되고 있는 쓰레드는 하나이기 때문에 언제 어떤 쓰레드가 자원을 할당 받아 실행될지는 알 수 없기 때문이다. (이 예제 코드를 기준으로)

그러면 별로 차이가 없어 보이는 Thread 클래스를 사용하는 것과 Runnable 인터페이스를 사용하는것에 어떤 차이가 있을까.

사실 이 질문에 이유가 있다. 클래스와 인터페이스의 차이이다.

쓰레드를 만들기 위해 클래스 상속을 받아버리면, 정말로 상속 받아야 할 클래스를 상속받지 못할 수 있기 때문에 보통 Runnable 인터페이스를 구현해서 쓰레드를 만든다.

또 다른점은 Thread 클래스가 Runnable 인터페이스 구현 객체를 전달 받아 실행할 수 있기 때문에 Runnable 구현 객체를 재사용할 수 있다.

```java
package me.xxxelppa.study.week10;

public class Exam_002 {
    public static void main(String[] args) {

        new Thread(new MyRunnableClass()).start();

    }
}

class MyRunnableClass implements Runnable {
    @Override
    public void run() {
        System.out.println("Runnable 인터페이스를 구현하여 쓰레드 생성");
    }
}
```

<table>
<tbody>
<tr>
<td><span>Runnable&nbsp;인터페이스를&nbsp;구현하여&nbsp;쓰레드&nbsp;생성</span></td>
</tr>
</tbody>
</table>

#### 쓰레드의 상태

---

쓰레드에는 몇가지 상태가 있다.

이 상태는 열거 상수로 정의되어 확인해볼 수 있는데, 지금은 상태의 종류에 대해서만 알아보려 한다.

1. NEW

: 쓰레드가 생성 되었지만 아직 start 는 호출하지 않은 상태

2. RUNNABLE

: 실행 대기중인 상태로 언제든 실행 상태가 될 수 있는 상태

3. WAITING

: 일시 정지 중 하나로 다른 쓰레드의 notify 를 기다리는 상태

4. TIMED_WAITING

: 일시 정지 중 하나로 일정 시간 동안 기다리는 상태

5. BLOCKED

: 일시 정지 중 하나로 공유 객체의 락이 풀리기를 기다리는 상태

공유 객체의 락이라는 것은, 공유 객체에 대해 이미 다른 쓰레드가 사용중일 때 다른 쓰레드가 사용하지 못하도록 동기화 한 것을 말한다.

6. TERMINETED

: 모든 실행을 마친 상태

다음 예제를 통해 쓰레드의 상태를 출력해보는 것을 확인해보자.

```java
package me.xxxelppa.study.week10;

public class Exam_007 {
    public static void main(String[] args) {
        ThreadStateChecker threadStateChecker = new ThreadStateChecker(new MyTargetThread());
        threadStateChecker.start();
    }
}

class ThreadStateChecker extends Thread {
    Thread thread;

    public ThreadStateChecker(Thread thread) {
        this.thread = thread;
    }

    @Override
    public void run() {
        while(true) {
            State myState = thread.getState();
            System.out.println("쓰레드의 상태 : " + myState);

            if(myState == State.NEW) thread.start();
            if(myState == State.TERMINATED) break;

            // 0.5초 통안 쓰레드 일시 정지
            try { Thread.sleep(500); } catch (Exception e) { }
        }
    }
}

class MyTargetThread extends Thread {
    @Override
    public void run() {
        for(long i = 0; i < 5000000000l; ++i) { }

        // 1.5초 동안 쓰레드 일시 정지
        try { Thread.sleep(1500); } catch (Exception e) { }

        for(long i = 0; i < 5000000000l; ++i) { }
    }
}
```

<table>
<tbody>
<tr>
<td><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;NEW </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;RUNNABLE </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;RUNNABLE </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;RUNNABLE </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;TIMED_WAITING </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;TIMED_WAITING </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;TIMED_WAITING </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;RUNNABLE </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;RUNNABLE </span><br><span>쓰레드의&nbsp;상태&nbsp;:&nbsp;TERMINATED</span></td>
</tr>
</tbody>
</table>

쓰레드 두 개를 만들어서, 하나는 실행중인 쓰레드의 상태를 체크하는 쓰레드와

상태를 체크 당할 쓰레드를 만들어 상태가 어떻게 바뀌는지 확인해 보았다.

상태를 체크 당할 MyTargetThread가 실행 상태임을 확인하기 위해 for문을 공회전 하는 것을 넣었다.

상태를 체크 할 ThreadStateChecker 에서는

아직 쓰레드가 시작 전이라면 start 시키고, 종료 되었다면 break 로 while 문을 종료 하도록 했다.

쓰레드는 이렇게 몇가지 상태를 가질 수 있는데, 이 상태 값을 가지고 쓰레드의 동작을 제어할 수 있다.

[Thread 클래스에 대한 자세한 정보는 api 문서를 참고하는게 좋을것 같다.](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html)

이 중에 상태 제어와 관련있는 몇가지 메소드들은 다음과 같다.

## Thread 클래스에 정의

- void interrupt()

- void join()

- void join(long millis)

- void join(long millis, int nanos)

- void resume()

- static void sleep(long millis)

- static void sleep(long millis, int nanos)

- void stop()

- void suspend()

- static void yield()

## Object 클래스에 정의

- notify()

- notifyAll()

- wait()

- wait(long millis)

- wait(long millis, int nanos)

java 8 api 문서를 기준으로 목록을 작성해 보았다. 취소선으로 작성된 것들은 안정성 문제로 deprecated 된 것들이다.

[interrupted]

이 메소드가 호출 된 쓰레드는 자신이 일시정지 상태가 되었을 때 InterruptedException 을 발생시킨다.

즉, 호출 했다고 바로 예외가 발생하지 않는다.

```java
package me.xxxelppa.study.week10;

public class Exam_008 {
    public static void main(String[] args) throws InterruptedException {
        Thread thread = new MyInterruptedTest();
        thread.start();

        // 2초 후에 interrupted 를 호출한다.
        Thread.sleep(2000);
        System.out.println("interrupt 호출");
        thread.interrupt();
    }
}

class MyInterruptedTest extends Thread {
    @Override
    public void run() {
        boolean flag = true;

        while(flag) {
            long sum = 0;
            try {
                System.out.println("쓰레드가 무엇인가 하는중");
                for(long i = 0; i < 2000000000; ++i) sum += i;
                System.out.println("합계 : " + sum);
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println("쓰레드 작업 종료");
                flag = false;
            }
        }
    }
}
```

<table>
<tbody>
<tr>
<td><span>쓰레드가&nbsp;무엇인가&nbsp;하는중 </span><br><span>합계&nbsp;:&nbsp;1999999999000000000 </span><br><span>쓰레드가&nbsp;무엇인가&nbsp;하는중 </span><br><span>interrupt&nbsp;호출 </span><br><span>합계&nbsp;:&nbsp;1999999999000000000 </span><br><span>쓰레드&nbsp;작업&nbsp;종료</span></td>
</tr>
</tbody>
</table>

실행 결과를 보면, 쓰레드가 무엇인가 하는 도중에 interrupt 가 호출 되었지만, sleep 으로 일시 정지 상태가 되었을 때 비로소 예외가 발생한 것을 확인할 수 있다.

[yield]

이 메소드를 호출한 쓰레드는 자신과 레이스 컨디션에 놓여있는 다른 쓰레드 중, 자신과 우선순위가 같거나 높은 쓰레드가 더 많은 실행을 할 수 있도록 양보한다.

```java
package me.xxxelppa.study.week10;

public class Exam_009 {
    public static void main(String[] args) {
        MyThread_1 myThread_1 = new MyThread_1();
        MyThread_2 myThread_2 = new MyThread_2();

        myThread_1.start();
        myThread_2.start();

        try { Thread.sleep(1000); } catch (InterruptedException e) { }
        System.out.println("========== myThread_1 양보 시작 ==========");
        myThread_1.callYield = true;

        try { Thread.sleep(1500); } catch (InterruptedException e) { }
        System.out.println("========== myThread_1 양보 종료 ==========");
        myThread_1.callYield = false;

        try { Thread.sleep(1000); } catch (InterruptedException e) { }
        myThread_1.isBreak = true;
        myThread_2.isBreak = true;
    }
}

class MyThread_1 extends Thread {
    public boolean isBreak = false;
    public boolean callYield = false;

    @Override
    public void run() {
        while(!isBreak) {
            if(callYield) {
                Thread.yield();
            } else {
                System.out.println("Thread_1 작업중");
                try { Thread.sleep(300); } catch (InterruptedException e) { }
            }
        }
        System.out.println("Thread_1 작업 종료");
    }
}

class MyThread_2 extends Thread {
    public boolean isBreak = false;

    @Override
    public void run() {
        while(!isBreak) {
            System.out.println("\t\tThread_2 작업중");
            try { Thread.sleep(300); } catch (InterruptedException e) { }
        }
        System.out.println("Thread_2 작업 종료");
    }
}
```

<table>
<tbody>
<tr>
<td><span>Thread_1&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_1&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_1&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_1&nbsp;작업중 </span><br><span>==========&nbsp;myThread_1&nbsp;양보&nbsp;시작&nbsp;========== </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>==========&nbsp;myThread_1&nbsp;양보&nbsp;종료&nbsp;========== </span><br><span>Thread_1&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_1&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_1&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업중 </span><br><span>Thread_1&nbsp;작업중 </span><br><span>Thread_2&nbsp;작업&nbsp;종료 </span><br><span>Thread_1&nbsp;작업&nbsp;종료</span></td>
</tr>
</tbody>
</table>

구분하기 쉽기 위해 Thread_2 가 작업중인 내용은 tab 간격을 주었다.

실제로 myThread_1 이 양보를 시작한 순간부터는 myThread_2 가 더 많은 실행을 할 수 있도록 양보한 것을 확인할 수 있다.

[join]

쓰레드를 사용하면 각 작업에 대해 각자 독립적인 작업 흐름을 가지고 처리할 수 있다.

하지만 이렇게 독립적으로 실행을 할 때, 반드시 어떤 작업 보다 먼저 또는 어떤 작업보다 나중에 실행 되어야만 하는 경우가 있다.

예를 들면 방에 들어가려면 문이 열려 있어야만 들어갈 수 있다. 문을 열지도 않고 들어가려고 하면 원치 않는 결과를 만들 수 있다. (문에 머리를 박는다던가 하는..)

이런 경우에 사용할 수 있는게 join 메소드 이다.

```java
package me.xxxelppa.study.week10;

public class Exam_010 {
    public static void main(String[] args) {
        Thread thread = new MyRoom();
        thread.start();

        System.out.println("방에 들어가고 싶습니다.");

        // main 쓰레드에서 thread 쓰레드가 끝나기를 기다립니다.
        try { thread.join(); } catch (InterruptedException e) { }

        System.out.println("문이 열렸으니 방에 들어갑니다.");

    }
}

class MyRoom extends Thread {
    @Override
    public void run() {
        openDoor();
    }

    public void openDoor() {
        System.out.println("\t>> 문을 여는데 2초가 걸립니다.");
        try { Thread.sleep(2000); } catch (InterruptedException e) { }
        System.out.println("\t>> 문이 열렸습니다.");
    }
}
```

<table>
<tbody>
<tr>
<td><span>방에&nbsp;들어가고&nbsp;싶습니다. </span><br><span>&gt;&gt;&nbsp;문을&nbsp;여는데&nbsp;2초가&nbsp;걸립니다. </span><br><span>&gt;&gt;&nbsp;문이&nbsp;열렸습니다. </span><br><span>문이&nbsp;열렸으니&nbsp;방에&nbsp;들어갑니다.</span></td>
</tr>
</tbody>
</table>

같은 join 메소드지만 long 타입의 millis 와 int 타입의 nanos 를 받는 오버로딩 된 메소드들이 있다.

이 값을 넘겨주면, 해당 시간 동안만 종료 되기를 기다리고, 그 시간이 초과하면 기다리지 않고 쓰레드를 계속 진행 한다.

[wait, notify, notifyAll]

wait 메소드는 쓰레드를 일시 정지 상태로 만든다. 그리고 notify 메소드는 wait에 의해 일시 정지 된 상태의 쓰레드를 실행 대기 상태로 만든다. 마지막으로 notifyAll 은 wait에 의해 일시 정지 된 모든 쓰레드들을 실행 대기 상태로 만든다.

주의할 것은.

이 세가지 메소드는 반드시 동기화 메소드 또는 동기화 블록 내에서만 사용 할 수 있다는 것이다.

wait와 notify를 사용해서 서로 번갈아가며 실행하는 쓰레드 예제를 만들어 보았다.

```java
package me.xxxelppa.study.week10;

public class Exam_011 {
    public static void main(String[] args) {
        MySharedClass mySharedClass = new MySharedClass();
        int workCount = 3;

        MyWorker_1 myWorker_1 = new MyWorker_1(mySharedClass, workCount);
        MyWorker_2 myWorker_2 = new MyWorker_2(mySharedClass, workCount);

        myWorker_1.start();
        myWorker_2.start();

    }
}

class MySharedClass {
    public synchronized void doWork_worker_1() {
        System.out.println("worker 1 작업 중");
        notify();
        try { wait(); } catch (InterruptedException e) { }
    }

    public synchronized void doWork_worker_2() {
        System.out.println("worker 2 작업 중");
        notify();
        try { wait(); } catch (InterruptedException e) { }
    }
}

class MyWorker_1 extends Thread {
    MySharedClass mySharedClass;
    int workCount;

    public MyWorker_1(MySharedClass mySharedClass, int workCount) {
        this.workCount = workCount;
        this.mySharedClass = mySharedClass;
    }

    @Override
    public void run() {
        for(int i = 0; i < workCount; ++i) {
            mySharedClass.doWork_worker_1();
        }
    }
}

class MyWorker_2 extends Thread {
    MySharedClass mySharedClass;
    int workCount;

    public MyWorker_2(MySharedClass mySharedClass, int workCount) {
        this.workCount = workCount;
        this.mySharedClass = mySharedClass;
    }

    @Override
    public void run() {
        for(int i = 0; i < workCount; ++i) {
            mySharedClass.doWork_worker_2();
        }
    }
}
```

<table>
<tbody>
<tr>
<td><span>worker&nbsp;1&nbsp;작업&nbsp;중 </span><br><span>worker&nbsp;2&nbsp;작업&nbsp;중 </span><br><span>worker&nbsp;1&nbsp;작업&nbsp;중 </span><br><span>worker&nbsp;2&nbsp;작업&nbsp;중 </span><br><span>worker&nbsp;1&nbsp;작업&nbsp;중 </span><br><span>worker&nbsp;2&nbsp;작업&nbsp;중</span></td>
</tr>
</tbody>
</table>

#### 쓰레드 우선순위

---

앞서 쓰레드가 실행될 때 동시성과 병렬성 이라는 것이 있다고 했다.

쓰레드가 코어의 수보다 많아서 동시성으로 처리 되어야 할 경우 어떤 규칙(?)을 가지고 실행할지 알아야 하는데, 스케줄링 이라고 한다.

이 스케줄링은 두 가지 방식이 있는데, 하나가 우선순위 방식이고 또 다른 방식은 round robin 이라고 한다.

우선순위 방식이란 우선순위가 더 높은 쓰레드가 더 많은 실행 시간을 가지도록 하는 것이고, round robin 방식은 자원을 점유하는 시간은 정해져 있는 상태에서 서로 돌아가면서 그 시간동안 실행하는 방식을 말한다.

이 스레드의 우선순위는 사용자(개발자)가 정할 수 있다.

우선순위는 1 ~ 10까지 설정할 수 있고, 10이 가장 높은 우선순위를 나타낸다. 그리고 아무 우선순위도 할당하지 않으면 기본 값으로 5를 갖는다.

```java
package me.xxxelppa.study.week10;

public class Exam_003 {
    public static void main(String[] args) {
        Thread myThread_1 = new MyRunnableThread("첫번째 쓰레드");
        Thread myThread_2 = new MyRunnableThread("두번째 쓰레드");

        myThread_2.setPriority(Thread.MAX_PRIORITY);
        myThread_1.setPriority(3);

        myThread_1.start();
        myThread_2.start();
    }
}

class MyRunnableThread extends Thread {
    public MyRunnableThread(String name) {
        setName(name);
    }

    @Override
    public void run() {
        int sum = 0;
        for(int i = 0; i < 2147483647; ++i) {sum += i;}
        System.out.println(getName());
    }
}
```

<table>
<tbody>
<tr>
<td><span>두번째 쓰레드</span><br><span>첫번째 쓰레드</span></td>
</tr>
</tbody>
</table>

하지만 절대적으로 그 우선순위를 따르지는 않는다.

그래도 테스트 해보면 얼추 높은 우선순위를 할당한 쓰레드가 대부분 먼저 끝나는 것을 확인할 수 있다.

#### Main 쓰레드

---

일반적인 모든 Java 어플리케이션(프로그램)은 Main 이라는 쓰레드를 가지고 있다.

이 Main 쓰레드는 main이라는 메소드로부터 시작할 수 있다.

지금까지 지겹도록(?) 봐온 public static void main(String[] ar) 이게 바로 그 Main 쓰레드를 실행 시킨 메소드 이다.

처음 자바를 배울 당시에 '자바 프로그램은 main() 에서 시작해서 main() 에서 끝난다' 라는 말을 들은 적이 있다.

지금 생각해보면 100% 맞는 말은 아닌것 같지만 처음엔 그렇게 생각하는게 마음이 편할것 같다.

그렇기 때문에 지금 시점에서 일반적인 자바 프로그램을 만들어서 멀티 쓰레드를 구현하려면

Main 쓰레드를 실행 할 main() 메소드 안에서 새로운 쓰레드를 만들어 줘야 한다.

그리고 새롭게 생성한 쓰레드는 Main 쓰레드를 실행 할 main 메소드가 종료될 때 같이 종료 되도록 할 수도 있고,

main 쓰레드가 종료 되는 것과 상관 없이 별도로 생성한 쓰레드가 독자적으로 실행하다 종료되게 할 수도 있다.

```java
package me.xxxelppa.study.week10;

public class Exam_004 {
    public static void main(String[] args) {
        System.out.println(Thread.currentThread().getName());
    }
}
```

<table>
<tbody>
<tr>
<td><span>main</span></td>
</tr>
</tbody>
</table>

현재 실행중인 쓰레드의 이름을 출력 해보았다.

#### 동기화

---

동기화 관련되어 문제가 발생할 수 있는 경우는, 멀티 쓰레드를 구현 하면서 공유 객체를 사용할 때이다.

여러 쓰레드에서 같은 객체를 공유해서 사용한다고 생각해보자.

돈을 넣고 빼는 것을 예로 생각해보자.

만약 동시에 여러 대의 ATM 기기를 점유하고 있다고 생각하자.

현재 계좌에 잔액이 1,000원이 있다.

여러대의 ATM 기계에서 잔액을 조외하면 전부 1,000원이 있다고 할 것이다.

만약 그 순간 다섯 대의 ATM 기계에서 동시에 1,000원을 출금 한다면 어떻게 될까?

5,000원이 나올까?

이런 경우를 방지하기 위해 동기화 (synchronized)라는 것을 사용한다. (또는 임계 영역(critical section)이라고도 한다.)

동기화를 사용하지 않은 예제 상황을 만들어 보면 다음과 같다.

```java
package me.xxxelppa.study.week10;

public class Exam_005 {
    public static void main(String[] args) {
        MyAccount myAccount = new MyAccount();

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                myAccount.withdrawal(1000);
            }
        };

        Thread myThread_1 = new Thread(runnable);
        Thread myThread_2 = new Thread(runnable);
        Thread myThread_3 = new Thread(runnable);

        myThread_1.start();
        myThread_2.start();
        myThread_3.start();
    }
}

class MyAccount {
    private int myMoney = 1000;

    public int withdrawal(int money) {
        System.out.println(">>> 출금 시작");

        // 찾으려는 금액보다 잔고가 많은 경우에만 출금
        if(this.myMoney < money) {
            System.out.println(" :: 잔액이 부족합니다.");
            System.out.println(">>> 출금 종료");
            return 0;
        }

        int returnMoney = money;

        // 인출 하는데 1초가 걸린다고 가정
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println(" :: 찾으신 금액 : " + money);
        this.myMoney -= money;

        System.out.println(">>> 출금 종료");
        return returnMoney;
    }
}
```

<table>
<tbody>
<tr>
<td><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&nbsp;::&nbsp;찾으신&nbsp;금액&nbsp;:&nbsp;1000 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료 </span><br><span>&nbsp;::&nbsp;찾으신&nbsp;금액&nbsp;:&nbsp;1000 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료 </span><br><span>&nbsp;::&nbsp;찾으신&nbsp;금액&nbsp;:&nbsp;1000 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료</span></td>
</tr>
</tbody>
</table>

통장 잔액이 1,000원 인데 3,000원을 찾는 매직이 벌어질 수 있다. *(이렇게 부자가 됩니다.)*

찾는 입장에서는 행복할 수 있을지도 모르지만.. 아무튼 이런 일은 생기면 안된다.

이런 문제가 생긴 이유는, 공유 객체에 대한 동기화가 되지 않았기 때문이다.

아직 한 사람에 대한 출금 처리가 완료되지 않았는데, 또 다른 사람이 와서 출금을 요청했기 떄문에

또 다른 사람의 입장에서도 잔액이 남아있어서 출금이 가능했다는 문제이다.

그래서 동시에 접근했을 때 문제가 될 수 있는 부분에 대해서 동기화 처리를 해주어야 한다.

자바에서는 synchronized 키워드를 사용한다.

이 키워드를 사용하면 한 번에 하나의 쓰레드만 해당 자원에 접근해서 사용할 수 있도록 제한할 수 있다.

```java
package me.xxxelppa.study.week10;

public class Exam_005 {
    public static void main(String[] args) {
        MyAccount myAccount = new MyAccount();

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                myAccount.withdrawal(1000);
            }
        };

        Thread myThread_1 = new Thread(runnable);
        Thread myThread_2 = new Thread(runnable);
        Thread myThread_3 = new Thread(runnable);

        myThread_1.start();
        myThread_2.start();
        myThread_3.start();
    }
}

class MyAccount {
    private int myMoney = 1000;

    public synchronized int withdrawal(int money) {
        System.out.println(">>> 출금 시작");

        // 찾으려는 금액보다 잔고가 많은 경우에만 출금
        if(this.myMoney < money) {
            System.out.println(" :: 잔액이 부족합니다.");
            System.out.println(">>> 출금 종료");
            return 0;
        }

        int returnMoney = money;

        // 인출 하는데 1초가 걸린다고 가정
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println(" :: 찾으신 금액 : " + money);
        this.myMoney -= money;

        System.out.println(">>> 출금 종료");
        return returnMoney;
    }
}
```

<table>
<tbody>
<tr>
<td><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&nbsp;::&nbsp;찾으신&nbsp;금액&nbsp;:&nbsp;1000 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&nbsp;::&nbsp;잔액이&nbsp;부족합니다. </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&nbsp;::&nbsp;잔액이&nbsp;부족합니다. </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료</span></td>
</tr>
</tbody>
</table>

앞선 예제와 비교해서 수정한 것은 27라인에 synchronized 하나뿐인데 의도한 대로 잘 동작하는것을 볼 수 있다.

마지막으로 synchronized 블록이 있다.

위에서 처럼 메소드에도 이 키워드를 붙여서 사용할 수 있지만, 이 키워드 자체로 블록을 만들어 사용할 수 있다.

이 블록을 사용하면, 메소드 전체에 대해 동기화(또는 락)을 걸어버리는 대신 메소드 내에서 특정 부분 특정 객체에 대해 락을 걸어 사용할 수 있다.

```java
package me.xxxelppa.study.week10;

public class Exam_005 {
    public static void main(String[] args) {
        MyAccount myAccount = new MyAccount();

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                myAccount.withdrawal(1000);
            }
        };

        Thread myThread_1 = new Thread(runnable);
        Thread myThread_2 = new Thread(runnable);
        Thread myThread_3 = new Thread(runnable);

        myThread_1.start();
        myThread_2.start();
        myThread_3.start();
    }
}

class MyAccount {
    private int myMoney = 1000;

    public int withdrawal(int money) {
        System.out.println(">>> 출금 시작");

        int returnMoney = money;

        synchronized(this) { // 동기화 하려는 공유 객체를 넣어준다. this를 넣으면 자기 자신이 공유 객체임을 뜻한다.
            // 찾으려는 금액보다 잔고가 많은 경우에만 출금
            if(this.myMoney < money) {
                System.out.println(" :: 잔액이 부족합니다.");
                System.out.println(">>> 출금 종료");
                return 0;
            }

            // 인출 하는데 1초가 걸린다고 가정
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            System.out.println(" :: 찾으신 금액 : " + money);
            this.myMoney -= money;
        }

        System.out.println(">>> 출금 종료");
        return returnMoney;
    }
}
```

<table>
<tbody>
<tr>
<td><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;시작 </span><br><span>&nbsp;::&nbsp;찾으신&nbsp;금액&nbsp;:&nbsp;1000 </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료 </span><br><span>&nbsp;::&nbsp;잔액이&nbsp;부족합니다. </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료 </span><br><span>&nbsp;::&nbsp;잔액이&nbsp;부족합니다. </span><br><span>&gt;&gt;&gt;&nbsp;출금&nbsp;종료</span></td>
</tr>
</tbody>
</table>

동기화 메소드를 사용했을 때와 비교해보면, 동기화 블록은 해당 영역에 대해서만 동기화를 하기 때문에

해당 임계 영역을 만나기 전까지 동시 호출은 가능한 것을 볼 수 있다.

#### 데드락

---

데드락은 다른 말료 교착상태 라고도 한다.

교착 상태란 쉽게 말해서 오도가도 못하는 난처한 상태이다.

공유 객체에 대해 복수의 쓰레드가 서로 다른 쓰레드의 실행이 끝나기를 기다리고 있는 상태를 말한다.

데드락을 볼 수 있는 예제가 있어서 만들어 보았다.

```java
package me.xxxelppa.study.week10;

public class Exam_006 {
    public static Object myLockObj_1 = new Object();
    public static Object myLockObj2 = new Object();

    public static void main(String[] args) {
        MyThread_1 myThread_1 = new MyThread_1();
        MyThread_2 myThread_2 = new MyThread_2();

        myThread_1.start();
        myThread_2.start();
    }
    static class MyThread_1 extends Thread {
        @Override
        public void run() {
            synchronized (myLockObj_1) {
                System.out.println("Thread 1 : Holding [myLockObj_1]");
                try { Thread.sleep(10); } catch (InterruptedException e) { e.printStackTrace();}
                System.out.println("Thread 1 : Waiting for [myLockObj_2]");
                synchronized (myLockObj2) {
                    System.out.println("Thread 1 : Holding [myLockObj_1] & [myLockObj_2]");
                }
            }
        }
    }

    static class MyThread_2 extends Thread {
        @Override
        public void run() {
            synchronized (myLockObj2) {
                System.out.println("Thread 2 : Holding [myLockObj_2]");
                try { Thread.sleep(10); } catch (InterruptedException e) { e.printStackTrace(); }
                System.out.println("Thread 2 : Waiting for [myLockObj_1]");
                synchronized (myLockObj_1) {
                    System.out.println("Thread 2 : Holding [myLockObj_1] & [myLockObj_2]");
                }
            }
        }
    }
}
```

![0103-203-java-live-study-week-10-multithread-programming-img-02.png](/tech-blog/resources/images/migration/0103-203-java-live-study-week-10-multithread-programming/img-02.png)

코드 내용은 단순하다.

Thread 1 은 시작 하자마자 myLockObj_1 객체에 락을 걸고 10ms 이후 myLockIObj_2 에 락을 건다.

Thread 2 는 시작 하자마자 myLockObj_2 객체에 락을 걸고 10ms 이후 myLockIObj_1 에 락을 건다.

대략 10ms 이후 서로 상대방이 락을 건 객체를 사용하려 하기 때문에

서로 끝나기를 무한정 기다리는 상황이 만들어졌다.

데드락이 걸리는 경우에는 어느 한쪽을 강제로 종료하는 방법밖에 없다고 한다.

[교착상태(deadlock)와 그 해결방안을 알아보자.](https://webie.tistory.com/99)

[Deadlock에 빠지지 않는 다양한 방법](https://goscala.tistory.com/171)
