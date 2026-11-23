---
title: 모델은 무엇이고, 학습과 추론은 어떻게 다른가
description: >-
  모델을 구조와 파라미터로 나누어 살펴보고, 학습이 파라미터를 바꾸는 과정인 반면 추론은 학습된 값을 읽어 출력을 계산하는 과정이라는 차이를 Java와 Kotlin 예제로 확인한다. LLM의 사전 학습, 미세 조정, RLHF와 무상태 대화가 동작하는 방식도 함께 정리한다.
publishedAt: '2026-11-23'
updatedAt: '2026-11-23'
tags:
  - AI
  - 머신러닝
  - LLM
  - 모델
  - 학습
  - 추론
status: published
reviewedAt: '2026-11-23'
sources:
  - 'https://platform.claude.com/docs/en/about-claude/glossary'
  - 'https://platform.claude.com/docs/en/models/overview'
  - 'https://platform.claude.com/docs/en/build-with-claude/working-with-messages'
  - 'https://platform.claude.com/docs/en/build-with-claude/context-windows'
  - 'https://platform.claude.com/docs/en/api/versioning?version=2026-10-21'
  - 'https://code.claude.com/docs/en/how-claude-code-works'
  - 'https://code.claude.com/docs/en/prompt-caching'
  - 'https://arxiv.org/abs/2204.05862'
---
# 개요

앞선 글에서는 AI, 머신러닝, 생성형 AI, LLM의 관계를 살펴봤다. 머신러닝은 사람이 모든 규칙을 직접 작성하는 대신 데이터에서 규칙을 찾는다.

그렇다면 찾은 규칙은 어디에 어떤 형태로 저장될까. 저장된 규칙을 실제로 사용할 때는 무슨 일이 일어날까.

이 질문에 답하려면 모델, 파라미터, 학습, 추론을 구분해야 한다.

- 모델은 입력을 받아 출력을 계산하는 구조와 숫자의 묶음이다.
- 파라미터는 학습하는 동안 컴퓨터가 조정하는 모델 내부의 숫자다.
- 학습은 예측과 정답의 차이가 줄어들도록 파라미터를 바꾼다.
- 추론은 학습이 끝난 모델의 파라미터를 읽어 출력을 계산한다.
- 모델은 요청 사이의 대화를 스스로 기억하지 않는다.

이 글에서는 다음 내용을 순서대로 확인한다.

1. 모델의 구조와 파라미터
2. 학습과 추론의 차이
3. 사전 학습, 미세 조정, RLHF
4. 지식 기준 시점과 최신 정보의 한계
5. 모델이 대화를 이어 가는 방식
6. Java와 Kotlin으로 직접 확인하는 예제

예제 출력은 OpenJDK 21.0.6과 Kotlin 2.2.20에서 확인했다. Claude Code 명령은 원문을 작성한 2026년 11월 14일 당시 2.1.322 버전에서 확인한 결과다. 프로그램 버전과 공식 문서 내용은 이후 달라질 수 있다.

# 모델은 구조와 파라미터의 묶음이다

백엔드 개발자에게 익숙한 애플리케이션의 빌드와 실행으로 먼저 비교해 보자.

| 시점 | Spring 애플리케이션 | 모델 |
|---|---|---|
| 만드는 시점 | 소스 코드를 컴파일하고 빌드하여 실행 파일을 만든다 | 데이터로 학습하여 파라미터를 정한다 |
| 쓰는 시점 | 실행 파일이 요청을 받아 응답한다 | 모델이 입력을 받아 출력을 계산한다 |

컴파일과 학습이 같은 일이라는 뜻은 아니다. 컴파일은 사람이 작성한 규칙을 실행 가능한 형태로 옮긴다. 학습은 데이터에서 규칙을 찾는다.

두 과정은 만들어지는 시점과 사용되는 시점이 나뉜다는 점에서 비슷하다. 실행 중인 요청 하나가 애플리케이션 코드를 다시 작성하지 않듯, 추론 요청 하나가 모델의 파라미터를 다시 학습시키지는 않는다.

모델은 크게 두 부분으로 나눌 수 있다.

- 구조: 입력을 어떤 순서로 계산할지 정한 틀
- 파라미터: 그 틀 안에서 계산에 사용하는 숫자

하루 주문 건수로 결제 서버의 평균 응답 시간을 예측하는 가장 단순한 모델을 생각해 보자.

```text
응답 시간 = w × 주문 건수 + b
```

`w × 주문 건수 + b`는 구조다. `w`와 `b`는 파라미터다. 같은 구조를 사용해도 두 파라미터가 다르면 예측 결과도 달라진다.

학습 전에는 알맞은 `w`와 `b`를 모른다. 학습은 과거 주문 건수와 응답 시간을 비교하면서 두 값을 찾는다.

LLM도 원리는 같다. 구조는 Transformer와 같은 신경망이고, 파라미터는 신경망의 연결마다 붙은 가중치다. 단순 예제에는 파라미터가 두 개뿐이지만 LLM에는 매우 많은 파라미터가 있다.

파라미터는 지식을 문장으로 저장하지 않는다. 예를 들어 “Spring Boot는 Java 프레임워크다”라는 문장이 데이터베이스의 한 행처럼 들어 있는 것이 아니다. 많은 숫자가 함께 작용하여 그런 문장을 만들 확률이 높아지도록 조정되어 있다.

이 때문에 모델에서 특정 지식 하나만 찾아 지우거나 고치는 일은 데이터베이스 값을 수정하는 것처럼 단순하지 않다.

# 학습은 파라미터를 바꾼다

학습은 다음 과정을 반복한다.

```text
학습 데이터에서 사례 선택
        ↓
현재 파라미터로 예측
        ↓
예측과 정답의 차이인 손실 계산
        ↓
손실이 줄어드는 방향으로 파라미터 수정
        ↓
처음부터 반복
```

손실은 모델의 예측이 정답과 얼마나 다른지를 나타내는 값이다. 값이 작을수록 예측이 정답에 가깝다.

경사 하강법은 손실이 줄어드는 방향으로 파라미터를 조금씩 옮기는 대표적인 학습 방법이다.

학습 과정에는 사람이 미리 정하는 값도 있다. 한 번에 파라미터를 얼마나 옮길지 정하는 학습률과, 데이터를 몇 번 반복해서 볼지 정하는 횟수가 대표적이다. 이를 하이퍼파라미터라고 한다.

| 구분 | 누가 정하는가 | 언제 정하는가 | 예시 |
|---|---|---|---|
| 파라미터 | 학습 과정 | 학습 중 계속 변경 | `w`, `b` |
| 하이퍼파라미터 | 사람 | 학습 전 | 학습률 `0.05`, 반복 횟수 `5000` |
| 입력 | 사용자 | 추론할 때마다 | 주문 건수 `6`, `7`, `8` |

학습률이 너무 크면 정답에 가까운 값을 지나칠 수 있다. 너무 작으면 학습이 지나치게 느려지거나 정해진 반복 횟수 안에 충분히 가까워지지 못한다.

# 추론은 파라미터를 읽는다

추론은 학습이 끝난 모델에 새로운 입력을 넣고 출력을 얻는 과정이다.

Claude Code에 “이 테스트가 왜 실패하는지 확인해 줘”라고 입력하는 순간도 추론에 해당한다. Claude Code가 요청을 구성하고 모델이 파라미터를 읽어 출력 토큰을 계산한다.

이 과정에서 모델의 파라미터는 바뀌지 않는다.

대화에 사내 문서를 붙였다고 해서 모델이 그 문서를 새로 학습하는 것도 아니다. 문서를 붙이는 일은 이번 요청의 입력을 늘린다. 다음 요청에 문서가 다시 포함되지 않으면 모델은 그 내용을 참고할 수 없다.

Anthropic은 컨텍스트 창을 학습 데이터와 구분되는 모델의 작업 기억으로 설명한다. 학습 데이터는 파라미터를 만드는 데 사용된다. 컨텍스트 창은 한 번의 응답을 만들 때 참고할 입력과 출력의 범위다.

| 하고 싶은 일 | 실제로 일어나는 일 | 파라미터 변경 |
|---|---|---|
| 대화에 사내 문서 붙이기 | 이번 요청의 입력이 늘어난다 | 없음 |
| `CLAUDE.md`에 팀 규칙 적기 | Claude Code가 규칙을 세션 입력에 포함한다 | 없음 |
| 모델을 사내 데이터로 다시 학습하기 | 미세 조정을 수행한다 | 있음 |

Claude API는 현재 일반 사용자를 위한 미세 조정 기능을 제공하지 않는다. 필요한 정보를 프롬프트, 파일, 검색 도구로 제공하는 것과 모델의 파라미터를 다시 학습하는 일을 구분해야 한다.

# LLM이 만들어지는 과정

Claude 같은 LLM은 한 번의 학습만으로 만들어지지 않는다. 개념을 단순화하면 다음 과정을 거친다.

```text
사전 학습
방대한 글에서 다음 토큰 예측
        ↓
미세 조정
추가 데이터로 작업과 형식 조정
        ↓
RLHF
사람이 선호하는 답을 내도록 조정
        ↓
배포된 모델
        ↓
사용자의 추론 요청
```

앞의 세 과정은 파라미터를 바꾼다. 배포된 모델을 사용하는 추론은 파라미터를 바꾸지 않는다.

## 사전 학습

사전 학습은 정답 표시가 없는 방대한 글을 이용해 언어 모델을 처음 학습시키는 과정이다. 앞에 나온 글을 바탕으로 다음 토큰을 예측하면서 언어, 사실, 코드의 패턴을 익힌다.

다음 토큰을 잘 예측한다고 해서 사람의 질문에 유용하게 답하거나 지시를 잘 따르는 것은 아니다. 이 차이를 줄이기 위해 추가 학습이 필요하다.

## 미세 조정

미세 조정은 사전 학습한 모델을 추가 데이터로 더 학습시키는 과정이다. 특정 작업, 출력 형식, 말투에 맞추는 데 사용할 수 있다.

추가 데이터의 품질과 편향도 결과에 반영될 수 있으므로 데이터 선정과 평가 기준이 필요하다.

## RLHF

RLHF는 사람이 여러 답변에 매긴 선호를 이용해 더 선호되는 답을 만들도록 훈련하는 방법이다.

사람이 두 개 이상의 답변을 비교하고 순위를 정하면, 강화 학습 과정이 높은 순위의 답과 비슷한 출력을 선호하도록 파라미터를 조정한다.

## 네 단계 비교

| 단계 | 파라미터 변경 | 주체 | 배우는 내용 |
|---|---|---|---|
| 사전 학습 | 변경됨 | 모델 제작사 | 언어, 사실, 코드의 패턴과 다음 토큰 예측 |
| 미세 조정 | 변경됨 | 모델 제작사 또는 지원 서비스 사용자 | 특정 작업과 형식 |
| RLHF | 변경됨 | 모델 제작사 | 사람이 더 선호하는 답 |
| 추론 | 변경되지 않음 | API, 채팅, 코딩 도구 사용자 | 학습하지 않고 입력에 대한 출력만 계산 |

# 지식 기준 시점

모델은 학습 데이터에 포함된 내용으로 파라미터를 만든다. 학습 데이터를 모은 마지막 시점 이후의 일은 파라미터에 들어 있지 않다.

Anthropic 모델 문서는 두 날짜를 구분한다.

- Reliable knowledge cutoff: 모델의 지식이 가장 넓고 신뢰할 수 있는 마지막 시점
- Training data cutoff: 학습에 사용한 데이터의 더 넓은 범위

2026년 11월 23일에 공식 모델 문서를 다시 확인했다. Claude Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5의 두 기준 시점은 모두 2026년 6월로 안내되어 있다.

지식 기준 시점은 실무에서 다음 문제를 만든다.

- 기준 시점 뒤에 나온 라이브러리와 API를 모를 수 있다.
- 바뀐 설정을 예전 방식으로 설명할 수 있다.
- 회사 내부 코드와 문서를 처음부터 알 수 없다.
- 오늘 발생한 장애 로그를 입력 없이 알 수 없다.

해결 방법은 필요한 정보를 실행 시점에 입력으로 제공하는 것이다. 공식 문서를 첨부하거나 파일·웹 검색 도구를 사용하게 할 수 있다.

RAG도 외부 지식에서 필요한 정보를 찾고 컨텍스트 창에 넣어 답을 만들게 한다. 이는 실행 시점의 정보 제공이며 모델 자체를 다시 학습하는 과정이 아니다.

# 모델은 요청 사이의 대화를 기억하지 않는다

Messages API는 기본적으로 무상태다. 클라이언트가 매 요청에 대화 기록 전체를 포함해야 한다.

잘 만든 REST API가 요청 사이의 클라이언트 상태를 서버 메모리에 의존하지 않는 것과 비슷하다. 인증이 필요하면 요청마다 토큰을 보내듯, 대화가 필요하면 요청마다 앞선 메시지를 보낸다.

```text
사용자: 첫 번째 메시지
클라이언트 → 모델: [첫 번째 메시지]
모델 → 클라이언트: 첫 번째 응답

사용자: 두 번째 메시지
클라이언트 → 모델: [첫 번째 메시지, 첫 번째 응답, 두 번째 메시지]
모델 → 클라이언트: 두 번째 응답

사용자: 세 번째 메시지
클라이언트 → 모델: [첫 번째 메시지, 첫 번째 응답,
                    두 번째 메시지, 두 번째 응답,
                    세 번째 메시지]
```

대화 기록을 가지고 있는 주체는 모델이 아니라 클라이언트다. 모델은 현재 요청에 포함된 내용만 참고한다.

이 구조에서 다음 결과가 나온다.

1. 대화가 길어질수록 요청의 입력 토큰이 늘어난다.
2. 새 세션은 이전 대화가 없는 상태로 시작한다.
3. 세션 이어 가기는 저장한 기록을 다시 읽어 보내는 일이다.
4. 반복되는 앞부분의 계산을 줄이기 위해 프롬프트 캐싱이 필요하다.

Messages API에는 message threads라는 베타 기능도 있다. API 서버가 대화를 잠시 보관하므로 이후 요청에서는 새 메시지만 보낼 수 있다. 공식 문서 기준으로 마지막 요청 후 5분이 지나면 스레드가 만료되고, 마지막 사용 후 늦어도 1시간 안에는 삭제된다.

이 기능도 모델이 대화를 학습한다는 뜻은 아니다. 대화를 보관하는 위치가 클라이언트에서 API 서버로 옮겨질 뿐이다.

# 같은 입력도 결과가 달라질 수 있다

파라미터가 같아도 추론 결과가 항상 같지는 않다. 모델은 다음 토큰 후보의 확률을 계산하고 그 확률을 바탕으로 토큰을 선택한다. 선택 과정에는 무작위성이 포함될 수 있다.

따라서 LLM을 테스트할 때 전체 응답 문자열이 완전히 같은지를 기준으로 삼으면 불안정해진다.

다음 항목을 검사하는 편이 낫다.

- 필요한 출력 형식을 지켰는가
- 필수 항목이 모두 들어 있는가
- 금지된 내용이 없는가
- 답의 사실 관계가 맞는가
- 실행 가능한 코드인가

최신 Claude API 버전 `2026-10-21`에서는 `temperature`, `top_p`, `top_k` 요청 파라미터가 제거되었다. 이 값을 보내면 모델과 값에 관계없이 400 오류가 발생한다. 이전 API 버전에서도 Claude 4.7 이후 모델은 기본값이 아닌 샘플링 값을 거부한다.

# 예제 1: 학습과 추론에서 파라미터 확인하기

하루 주문 건수가 증가할 때 결제 서버의 평균 응답 시간이 어떻게 달라지는지 예측해 보자.

과거 5일의 데이터는 설명을 위해 정확한 직선 위에 놓았다. 실제 운영 데이터는 이처럼 깔끔하지 않다.

모델 구조는 `w × x + b`다. `x`는 하루 주문 건수이고 `w`와 `b`가 파라미터다.

## Java

```java
public class TrainThenInfer {

    // 하루 주문 건수(천 건 단위)와 결제 서버 평균 응답 시간(ms)
    static final double[] X = {1, 2, 3, 4, 5};
    static final double[] Y = {120, 140, 160, 180, 200};

    // 모델 = 구조(y = w * x + b) + 파라미터(w, b)
    static double w = 0, b = 0;

    // 추론은 파라미터를 읽기만 한다.
    static double predict(double x) {
        return w * x + b;
    }

    // 학습은 파라미터를 바꾼다.
    static void train(int epochs, double learningRate) {
        for (int epoch = 1; epoch <= epochs; epoch++) {
            double gradientW = 0;
            double gradientB = 0;
            double loss = 0;

            for (int i = 0; i < X.length; i++) {
                double error = predict(X[i]) - Y[i];
                gradientW += 2 * error * X[i];
                gradientB += 2 * error;
                loss += error * error;
            }

            w -= learningRate * gradientW / X.length;
            b -= learningRate * gradientB / X.length;

            if (epoch == 1 || epoch == 100 || epoch == epochs) {
                System.out.printf(
                    "[학습] epoch=%d loss=%.3f w=%.3f b=%.3f%n",
                    epoch,
                    loss / X.length,
                    w,
                    b
                );
            }
        }
    }

    public static void main(String[] args) {
        System.out.printf(
            "[학습 전] w=%.3f b=%.3f predict(6)=%.1f%n",
            w,
            b,
            predict(6)
        );

        train(5000, 0.05);

        for (int call = 1; call <= 3; call++) {
            double x = 5 + call;
            System.out.printf(
                "[추론 %d] predict(%.0f)=%.1f w=%.3f b=%.3f%n",
                call,
                x,
                predict(x),
                w,
                b
            );
        }
    }
}
```

## Kotlin

```kotlin
// 하루 주문 건수(천 건 단위)와 결제 서버 평균 응답 시간(ms)
val xValues = doubleArrayOf(1.0, 2.0, 3.0, 4.0, 5.0)
val yValues = doubleArrayOf(120.0, 140.0, 160.0, 180.0, 200.0)

// 모델 = 구조(y = w * x + b) + 파라미터(w, b)
var w = 0.0
var b = 0.0

// 추론은 파라미터를 읽기만 한다.
fun predict(x: Double) = w * x + b

// 학습은 파라미터를 바꾼다.
fun train(epochs: Int, learningRate: Double) {
    for (epoch in 1..epochs) {
        var gradientW = 0.0
        var gradientB = 0.0
        var loss = 0.0

        for (i in xValues.indices) {
            val error = predict(xValues[i]) - yValues[i]
            gradientW += 2 * error * xValues[i]
            gradientB += 2 * error
            loss += error * error
        }

        w -= learningRate * gradientW / xValues.size
        b -= learningRate * gradientB / xValues.size

        if (epoch == 1 || epoch == 100 || epoch == epochs) {
            println(
                "[학습] epoch=%d loss=%.3f w=%.3f b=%.3f"
                    .format(epoch, loss / xValues.size, w, b)
            )
        }
    }
}

fun main() {
    println(
        "[학습 전] w=%.3f b=%.3f predict(6)=%.1f"
            .format(w, b, predict(6.0))
    )

    train(5000, 0.05)

    for (call in 1..3) {
        val x = 5.0 + call
        println(
            "[추론 %d] predict(%.0f)=%.1f w=%.3f b=%.3f"
                .format(call, x, predict(x), w, b)
        )
    }
}
```

다음 명령으로 실행할 수 있다.

```bash
java TrainThenInfer.java
kotlinc TrainThenInfer.kt -include-runtime -d train.jar && java -jar train.jar
```

Java와 Kotlin의 실행 결과는 같다.

```text
[학습 전] w=0.000 b=0.000 predict(6)=0.0
[학습] epoch=1 loss=26400.000 w=52.000 b=16.000
[학습] epoch=100 loss=47.899 w=24.417 b=84.052
[학습] epoch=5000 loss=0.000 w=20.000 b=100.000
[추론 1] predict(6)=220.0 w=20.000 b=100.000
[추론 2] predict(7)=240.0 w=20.000 b=100.000
[추론 3] predict(8)=260.0 w=20.000 b=100.000
```

학습 전에는 모든 파라미터가 0이므로 6천 건의 응답 시간을 0ms로 예측한다. 구조만 있고 파라미터가 정해지지 않은 상태다.

학습하면서 손실은 `26400`에서 `47.899`, 마지막에는 `0`까지 줄어든다. 그동안 `w`와 `b`도 계속 달라진다.

학습이 찾은 `w=20`, `b=100`은 주문이 천 건 늘 때마다 응답 시간이 20ms 늘고, 기본 응답 시간이 100ms라는 뜻이다. 사람이 이 값을 직접 알려주지 않았다.

추론에서는 입력을 6, 7, 8로 바꿔도 `w=20`, `b=100`이 그대로다. 추론을 여러 번 해도 모델은 새로 학습하지 않는다.

# 예제 2: 대화 전체를 다시 보내기

고객 상담 화면에 LLM을 연결한다고 가정하자. 고객은 첫 메시지에서 주문 번호를 말하고, 두 번째 메시지에서 그 번호를 다시 묻는다.

실제 API를 호출하지 않고, 현재 요청에 포함된 메시지만 볼 수 있는 `fakeModel`로 무상태 동작을 확인한다.

- 클라이언트 A는 기록을 저장하고 요청마다 전체 대화를 보낸다.
- 클라이언트 B는 새 메시지만 보낸다.

## Java

```java
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StatelessChat {

    record Message(String role, String content) {}

    static String fakeModel(List<Message> messages) {
        String last = messages.get(messages.size() - 1).content();

        if (last.contains("주문 번호가 뭐")) {
            Pattern pattern = Pattern.compile("주문 번호는 (\\S+)");

            for (Message message : messages) {
                Matcher matcher = pattern.matcher(message.content());
                if (matcher.find()) {
                    return "주문 번호는 " + matcher.group(1) + " 입니다.";
                }
            }

            return "이 요청에는 주문 번호 정보가 없습니다.";
        }

        return "알겠습니다.";
    }

    static void resendFullHistory() {
        List<Message> history = new ArrayList<>();

        for (String userText : List.of(
            "제 주문 번호는 ORD-7 입니다. 취소하고 싶어요.",
            "아까 말한 제 주문 번호가 뭐였죠?"
        )) {
            history.add(new Message("user", userText));
            String reply = fakeModel(List.copyOf(history));
            System.out.println(
                "[A] 보낸 메시지 " + history.size() + "개 -> " + reply
            );
            history.add(new Message("assistant", reply));
        }
    }

    static void sendOnlyLatest() {
        for (String userText : List.of(
            "제 주문 번호는 ORD-7 입니다. 취소하고 싶어요.",
            "아까 말한 제 주문 번호가 뭐였죠?"
        )) {
            String reply = fakeModel(
                List.of(new Message("user", userText))
            );
            System.out.println("[B] 보낸 메시지 1개 -> " + reply);
        }
    }

    public static void main(String[] args) {
        resendFullHistory();
        sendOnlyLatest();
    }
}
```

## Kotlin

```kotlin
data class Message(val role: String, val content: String)

fun fakeModel(messages: List<Message>): String {
    val last = messages.last().content

    if ("주문 번호가 뭐" in last) {
        val pattern = Regex("주문 번호는 (\\S+)")

        messages.forEach { message ->
            pattern.find(message.content)?.let {
                return "주문 번호는 ${it.groupValues[1]} 입니다."
            }
        }

        return "이 요청에는 주문 번호 정보가 없습니다."
    }

    return "알겠습니다."
}

val turns = listOf(
    "제 주문 번호는 ORD-7 입니다. 취소하고 싶어요.",
    "아까 말한 제 주문 번호가 뭐였죠?",
)

fun resendFullHistory() {
    val history = mutableListOf<Message>()

    for (userText in turns) {
        history += Message("user", userText)
        val reply = fakeModel(history.toList())
        println("[A] 보낸 메시지 ${history.size}개 -> $reply")
        history += Message("assistant", reply)
    }
}

fun sendOnlyLatest() {
    for (userText in turns) {
        val reply = fakeModel(listOf(Message("user", userText)))
        println("[B] 보낸 메시지 1개 -> $reply")
    }
}

fun main() {
    resendFullHistory()
    sendOnlyLatest()
}
```

실행 결과는 다음과 같다.

```text
[A] 보낸 메시지 1개 -> 알겠습니다.
[A] 보낸 메시지 3개 -> 주문 번호는 ORD-7 입니다.
[B] 보낸 메시지 1개 -> 알겠습니다.
[B] 보낸 메시지 1개 -> 이 요청에는 주문 번호 정보가 없습니다.
```

클라이언트 A의 두 번째 요청에는 첫 질문, 첫 응답, 두 번째 질문이 모두 들어 있다. 모델은 현재 요청 안에서 주문 번호를 찾을 수 있다.

클라이언트 B는 새 질문 하나만 보냈다. 첫 메시지를 볼 방법이 없으므로 주문 번호를 답할 수 없다.

대화가 길어지면 클라이언트 A가 보내는 요청도 커진다. 열 번째 사용자 요청에는 사용자와 응답을 합쳐 19개의 메시지가 들어간다.

## 실제 Messages API 요청

실제 API에서도 메시지를 순서대로 쌓아 보낸다. 다음 요청은 공식 문서의 여러 대화 차례 예시와 같은 구조다.

```json
{
  "model": "claude-opus-5-5",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "Hello, Claude"},
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "Can you describe LLMs to me?"}
  ]
}
```

Java SDK에서도 같은 순서로 기록을 넣는다.

```java
AnthropicClient client = AnthropicOkHttpClient.fromEnv();

MessageCreateParams params = MessageCreateParams.builder()
    .model(Model.CLAUDE_OPUS_5_5)
    .maxTokens(1024L)
    .addUserMessage("Hello, Claude")
    .addAssistantMessage("Hello!")
    .addUserMessage("Can you describe LLMs to me?")
    .build();

Message response = client.messages().create(params);
System.out.println(response);
```

Kotlin에서도 Java SDK를 사용할 수 있다.

```kotlin
val client: AnthropicClient = AnthropicOkHttpClient.fromEnv()

val params = MessageCreateParams.builder()
    .model(Model.CLAUDE_OPUS_5_5)
    .maxTokens(1024L)
    .addUserMessage("Hello, Claude")
    .addAssistantMessage("Hello!")
    .addUserMessage("Can you describe LLMs to me?")
    .build()

val response = client.messages().create(params)
println(response)
```

공식 문서의 예시 응답은 세 메시지 전체를 입력 토큰으로 계산한다.

```json
{
  "id": "msg_018gCsTGsXkYJVqYPxTgDHBU",
  "type": "message",
  "role": "assistant",
  "content": [
    {"type": "text", "text": "Sure, I'd be happy to provide..."}
  ],
  "model": "claude-opus-5-5",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 30,
    "output_tokens": 309
  }
}
```

첫 메시지만 보낸 공식 예시의 입력은 12토큰이다. 세 메시지를 보낸 예시는 30토큰이다. 숫자는 모델과 시점에 따라 달라질 수 있지만, 대화 기록을 다시 보낼수록 입력이 늘어난다는 점은 같다.

응답의 `id`는 메시지 하나의 식별자다. 기본 Messages API에서는 이 값만 다음 요청에 넣어 대화를 이어 가지 않는다. 앞선 응답의 `content`를 `assistant` 메시지로 추가하고 새 `user` 메시지를 붙여 전체 기록을 다시 보낸다.

# 예제 3: Claude Code의 세션 이어 가기

Claude Code에서 이전 대화를 이어 갈 수 있는 이유도 모델의 기억이 아니다. 저장된 세션 기록을 다시 읽어 요청에 포함하기 때문이다.

다음 명령은 설정을 바꾸지 않고 도움말과 세션 파일 개수만 조회한다.

```bash
claude --help | grep -A1 -- '-c, --continue'
claude --help | grep -A2 -- '-r, --resume'
claude --help | grep -A2 -- '--no-session-persistence'
ls -1 ~/.claude/projects/<프로젝트 폴더>/*.jsonl | wc -l
```

원문 작성 환경에서 확인한 결과는 다음과 같았다. 마지막 파일 개수는 환경마다 다르다.

```text
  -c, --continue                        Continue the most recent conversation in
                                        the current directory
  -r, --resume [value]                  Resume a conversation by session ID or
                                        name, or open interactive picker with
                                        optional search term
  --no-session-persistence              Disable session persistence - sessions
                                        will not be saved to disk and cannot be
                                        resumed (only works with --print)
620
```

`--continue`는 현재 디렉터리에서 가장 최근 대화를 이어 간다. `--resume`은 세션 ID나 이름으로 저장된 대화를 다시 연다.

`--no-session-persistence`를 사용하면 세션을 디스크에 저장하지 않으므로 다시 이어 갈 수 없다. 이어 가기가 저장 기록에 의존한다는 점을 알 수 있다.

Claude Code 공식 문서에 따르면 메시지, 도구 사용, 결과는 `~/.claude/projects/` 아래의 JSONL 파일에 저장된다. 세션을 이어 가면 이 기록을 읽어 다시 요청에 포함한다.

새 세션에도 계속 적용해야 하는 규칙은 대화에만 남기지 않는 편이 좋다. `CLAUDE.md`와 같은 파일에 기록하면 Claude Code가 새 세션의 입력에 다시 포함할 수 있다.

# API와 모델 버전에 따른 차이

학습, 파라미터, 추론, 무상태라는 핵심 개념은 버전에 따라 달라지지 않는다. 다만 API 요청 형식과 모델 기능은 달라질 수 있다.

| 항목 | 과거 방식 | 2026년 11월 23일 공식 문서 기준 |
|---|---|---|
| `temperature`, `top_p`, `top_k` | 요청 값으로 토큰 선택의 무작위성 조절 | API `2026-10-21`에서 제거됨. 포함하면 400 오류 |
| 응답 미리 채우기 | 마지막 `assistant` 메시지에 응답 앞부분 입력 | Claude 4.6 이후 모델에서 지원하지 않음. 구조화된 출력이나 시스템 지시 사용 |
| 대화 기록 | 클라이언트가 매번 전체 기록 전송 | 기본 방식은 동일. message threads 베타 사용 시 API가 잠시 보관 |
| 지식 기준 시점 | 모델마다 다름 | 최신 네 모델의 Reliable knowledge cutoff와 Training data cutoff는 2026년 6월 |

SDK를 사용하면 SDK의 주요 버전에 따라 API 버전도 달라질 수 있다. 기존 통합을 업데이트할 때는 모델명만 바꾸지 말고 API 버전의 마이그레이션 문서도 확인해야 한다.

# 실무에서는 무엇부터 바꿔야 하는가

모델이 원하는 결과를 내지 못할 때 바로 미세 조정부터 생각할 필요는 없다. 바꿀 수 있는 위치를 비용이 낮은 순서로 살펴보는 편이 좋다.

1. 프롬프트의 목표, 제약, 출력 형식을 명확하게 작성한다.
2. 사내 규칙, 최신 문서, 관련 코드를 입력에 추가한다.
3. 파일 읽기, 테스트 실행, 웹 검색과 같은 도구를 제공한다.
4. 품질, 속도, 비용에 맞는 다른 모델을 검토한다.
5. 충분한 데이터와 평가 기준이 있을 때 미세 조정을 검토한다.

Spring 서버가 LLM API를 직접 호출한다면 대화 기록을 관리하는 책임도 서버에 있다. 세션별 메시지를 데이터베이스나 캐시에 저장하고, 요청할 때 필요한 기록을 가져와 `messages`에 넣어야 한다.

기록이 길어지면 입력 토큰, 응답 시간, 비용이 증가한다. 오래된 내용을 요약하거나 작업 단위로 세션을 나누는 전략이 필요하다.

Claude Code를 사용할 때도 새 세션은 이전 대화를 모른다고 가정해야 한다. 계속 지켜야 할 규칙은 `CLAUDE.md`에 적고, 긴 작업의 진행 상태와 결정은 저장소의 문서로 남기는 편이 안전하다.

# 자주 발생하는 문제

| 증상 | 원인 | 해결 방법 |
|---|---|---|
| 새 세션이 어제 알려 준 팀 규칙을 지키지 않는다 | 새 세션에는 이전 대화가 없다 | 계속 적용할 규칙을 `CLAUDE.md`에 기록한다 |
| 한 번 붙인 사내 문서를 다음 대화에서 모른다 | 문서 첨부는 학습이 아니라 현재 입력이다 | 필요한 요청에 다시 넣거나 파일을 읽게 한다 |
| 직접 만든 챗봇이 앞 대화를 기억하지 못한다 | 새 메시지만 API로 보냈다 | 필요한 대화 기록 전체를 `messages`에 포함한다 |
| 최신 라이브러리를 예전 방식으로 설명한다 | 지식 기준 시점 이후의 정보다 | 공식 문서를 확인하거나 검색 도구를 사용한다 |
| 같은 프롬프트의 결과가 조금씩 다르다 | 토큰 선택에 무작위성이 있다 | 문자열 전체 대신 형식과 사실을 검사한다 |
| 대화가 길수록 느리고 비싸진다 | 앞선 기록을 매 요청에 다시 보낸다 | 세션을 나누고 불필요한 기록을 줄인다 |
| 사내 데이터로 학습하면 모두 해결된다고 생각한다 | 입력 변경과 파라미터 변경을 혼동한다 | 입력, 도구, 모델 교체를 먼저 검토한다 |

# 이해 확인

1. **추론을 세 번 실행해도 `w`와 `b`가 그대로인 이유는 무엇인가?**
   - 추론은 파라미터를 읽어 출력을 계산할 뿐 수정하지 않기 때문이다.
2. **학습률 `0.05`는 파라미터인가?**
   - 아니다. 사람이 학습 전에 정한 하이퍼파라미터다. 학습 과정이 정하는 값은 `w`와 `b`다.
3. **사전 학습만 마친 언어 모델이 바로 지시를 잘 따르지 못하는 이유는 무엇인가?**
   - 사전 학습은 주로 다음 토큰을 예측하는 능력을 만든다. 질문에 유용하게 답하고 사람의 지시를 따르는 능력은 추가 학습과 조정이 필요하다.
4. **대화에 사내 위키를 붙이면 모델의 파라미터가 바뀌는가?**
   - 바뀌지 않는다. 문서는 현재 요청의 컨텍스트에 들어갈 뿐이다.
5. **새 메시지만 보낸 챗봇이 앞의 주문 번호를 모르는 이유는 무엇인가?**
   - Messages API가 무상태이기 때문이다. 첫 메시지가 현재 요청에 포함되지 않았다.
6. **`claude --continue`로 이전 대화를 이어 갈 수 있는 이유는 무엇인가?**
   - Claude Code가 로컬에 저장한 세션 기록을 다시 읽어 요청에 포함하기 때문이다.

# 정리

모델은 입력을 계산하는 구조와 학습으로 정해진 파라미터의 묶음이다. 파라미터는 지식을 문장이 아니라 많은 숫자의 관계로 담는다.

학습은 손실이 줄어들도록 파라미터를 수정한다. 추론은 학습된 파라미터를 읽어 새 입력의 출력을 계산한다. 추론을 반복해도 모델이 그 대화를 새로 학습하지 않는다.

LLM은 사전 학습, 미세 조정, RLHF 같은 과정을 거쳐 만들어진다. 사용자가 API나 채팅, 코딩 도구에서 모델을 쓰는 순간은 추론이다.

모델은 지식 기준 시점 이후의 정보나 회사 내부 데이터를 처음부터 알지 못한다. 최신 문서, 관련 코드, 검색 결과를 입력이나 도구로 제공해야 한다.

모델은 요청 사이의 대화를 기억하지 않는다. 클라이언트가 앞선 기록을 저장하고 매 요청에 다시 보낸다. Claude Code의 세션 이어 가기도 저장된 기록을 다시 사용하는 기능이다.

같은 입력의 출력도 달라질 수 있다. LLM의 결과는 문장 전체가 같은지가 아니라 형식, 필수 항목, 사실, 실행 결과를 기준으로 검증해야 한다.

다음 글에서는 LLM의 구조인 Transformer를 열어 보고, Attention이 문장 안의 관계를 어떻게 계산하는지 살펴본다.

# 용어 정의

- **모델**: 입력을 받아 출력을 계산하는 구조와 학습으로 정해진 파라미터의 묶음이다.
- **학습 데이터**: 모델이 관계를 찾는 데 사용하는 과거 사례의 모음이다.
- **파라미터**: 학습 과정에서 컴퓨터가 조정하는 모델 내부의 숫자다. 추론할 때는 바뀌지 않는다.
- **학습**: 예측과 정답의 차이인 손실이 줄어들도록 파라미터를 바꾸는 과정이다.
- **추론**: 학습이 끝난 모델에 새 입력을 넣어 출력을 얻는 과정이다.
- **LLM**: 많은 파라미터와 방대한 글을 이용해 학습한 대규모 언어 모델이다.
- **언어 모델**: 앞의 문맥을 보고 다음 토큰의 확률을 계산하는 모델이다.
- **토큰**: 모델이 글을 처리하는 단위다. 단어, 단어의 일부, 문자 등에 대응할 수 있다.
- **사전 학습**: 정답 표시가 없는 방대한 글로 언어 모델을 처음 학습시키는 과정이다.
- **미세 조정**: 사전 학습한 모델을 추가 데이터로 더 학습하여 특정 작업이나 형식에 맞추는 과정이다.
- **RLHF**: 사람이 답변에 매긴 선호를 이용해 더 선호되는 답을 만들도록 모델을 훈련하는 방법이다.
- **강화 학습**: 행동 결과로 받은 보상이 커지는 방향으로 행동 방식을 바꾸는 학습 방법이다.
- **Transformer**: 오늘날 LLM에서 널리 사용하는 신경망 구조다.
- **신경망**: 계산 단위를 여러 개 연결하고 층으로 쌓아 입력에서 출력을 계산하는 모델 구조다.
- **가중치**: 어떤 입력이 결과에 얼마나 영향을 주는지를 나타내는 파라미터다.
- **손실**: 모델의 예측과 정답이 얼마나 다른지를 나타내는 값이다.
- **경사 하강법**: 손실이 줄어드는 방향으로 파라미터를 조금씩 옮기는 학습 방법이다.
- **학습률**: 경사 하강법에서 파라미터를 한 번에 얼마나 옮길지 정하는 값이다.
- **하이퍼파라미터**: 사람이 학습 전에 정하는 학습 방식의 설정값이다.
- **지식 기준 시점**: 모델의 지식이 가장 넓고 신뢰할 수 있는 마지막 시점이다.
- **컨텍스트 창**: 모델이 한 번의 응답을 만들 때 참고할 수 있는 입력과 출력 전체의 범위다.
- **RAG**: 외부 지식을 실행 시점에 찾아 컨텍스트에 넣고 그 정보를 바탕으로 답을 만들게 하는 방법이다.
- **무상태**: 서버가 요청 사이의 클라이언트 상태를 기억하지 않는 성질이다.
- **REST API**: HTTP 요청의 주소와 메서드로 자원을 다루는 웹 API 설계 방식이다.
- **HTTP**: 웹에서 요청과 응답을 주고받는 통신 규약이다.
- **API**: 프로그램이 다른 프로그램의 기능을 호출할 때 따르는 약속이다.
- **프롬프트**: 모델에게 보내는 질문, 지시, 자료를 포함한 입력이다.
- **시스템 프롬프트**: 대화 앞에 놓여 모델의 역할과 행동 방식을 정하는 지시다.
- **프롬프트 캐싱**: 이전 요청과 같은 앞부분의 계산 결과를 재사용하는 기능이다.
- **세션**: Claude Code에서 하나의 대화 기록으로 묶이는 작업 단위다.
- **Claude Code**: Claude 모델에 파일, 터미널, Git 등의 도구를 연결한 코딩 에이전트다.
- **`CLAUDE.md`**: Claude Code가 프로젝트 지시로 읽는 마크다운 파일이다.
- **message threads**: API 서버가 대화를 잠시 보관하여 새 메시지만 보낼 수 있게 하는 베타 기능이다.
- **베타**: 정식 출시 전에 먼저 제공되는 단계로 동작이 바뀔 수 있다.
- **SDK**: 특정 서비스를 코드에서 쉽게 사용하도록 제공하는 라이브러리 묶음이다.
- **빌더**: 필요한 값을 메서드로 채운 뒤 객체를 생성하는 코드 작성 방식이다.
- **JSON**: 이름과 값의 쌍으로 데이터를 표현하는 텍스트 형식이다.
- **JSONL**: 한 줄에 JSON 객체 하나를 기록하는 텍스트 파일 형식이다.
- **prefill**: 응답의 앞부분을 미리 넣어 출력 형식을 유도하는 기법이다.
- **구조화된 출력**: 모델 응답이 정해진 JSON 구조를 따르도록 하는 기능이다.

# 참고 자료

- [Anthropic Glossary](https://platform.claude.com/docs/en/about-claude/glossary) — 공식 문서
- [Anthropic Models overview](https://platform.claude.com/docs/en/models/overview) — 공식 문서
- [Using the Messages API](https://platform.claude.com/docs/en/build-with-claude/working-with-messages) — 공식 문서
- [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows) — 공식 문서
- [API versions](https://platform.claude.com/docs/en/api/versioning?version=2026-10-21) — 공식 문서
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) — 공식 문서
- [How Claude Code uses prompt caching](https://code.claude.com/docs/en/prompt-caching) — 공식 문서
- [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2204.05862) — RLHF 관련 논문
