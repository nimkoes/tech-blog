---
title: AI, 머신러닝, 생성형 AI, LLM은 어떻게 다른가
description: >-
  AI, 머신러닝, 딥러닝, 생성형 AI, LLM의 포함 관계를 구분하고, 규칙 기반 프로그램과 학습 모델의 차이, LLM이 다음 토큰을 예측해 글을 만드는 방식, 모델과 코딩 에이전트의 차이를 정리했다.
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
tags:
  - AI
  - 머신러닝
  - 생성형 AI
  - LLM
status: published
reviewedAt: '2026-11-22'
sources:
  - 'https://platform.claude.com/docs/en/about-claude/glossary'
  - 'https://platform.claude.com/docs/en/models/overview'
  - 'https://code.claude.com/docs/en/overview'
  - 'https://code.claude.com/docs/en/how-claude-code-works'
  - 'https://code.claude.com/docs/en/glossary'
  - 'https://arxiv.org/abs/1706.03762'
---
# 개요

AI, 머신러닝, 딥러닝, 생성형 AI, LLM은 비슷한 문맥에서 자주 사용된다. 하지만 모두 같은 의미는 아니다.

이 개념을 구분하지 않으면 규칙으로 해결할 수 있는 문제에 LLM을 사용하거나, 생성 모델의 결과를 일반 프로그램의 계산 결과처럼 신뢰하는 문제가 생긴다.

각 개념이 무엇을 포함하고, 실제 개발에서는 어떻게 구분해야 하는지 정리한다.

이 글에서는 다음 내용을 순서대로 확인한다.

1. AI, 머신러닝, 딥러닝, 생성형 AI, LLM의 포함 관계
2. 규칙 기반 프로그램과 학습 기반 모델의 차이
3. 다음 토큰 예측으로 문장이 만들어지는 과정
4. 모델, 채팅 서비스, 코딩 에이전트의 역할 차이
5. 실제 문제에서 어떤 방식을 선택해야 하는지

# AI부터 LLM까지의 관계

가장 넓은 개념은 AI다.

```text
AI
└── 머신러닝
    └── 딥러닝
        └── 생성형 AI
            └── LLM
```

이 관계는 개념을 이해하기 위해 단순화한 것이다. 실제 제품은 규칙 기반 코드와 여러 모델을 함께 사용하기도 한다. 딥러닝을 사용하지 않는 생성 기법도 있으므로 모든 기술을 이 구조에 엄격하게 끼워 맞출 필요는 없다.

## 모델과 학습

일반 프로그램은 입력을 사람이 작성한 규칙에 넣어 출력을 만든다.

```text
입력 → 사람이 작성한 규칙 → 출력
```

머신러닝은 과거 입력과 정답을 이용해 먼저 모델을 학습한다. 여기서 모델은 입력을 받아 출력을 계산하는 구조와, 학습으로 정해진 파라미터의 묶음이다.

```text
과거 입력과 정답 → 학습 → 모델
새 입력 → 모델 → 출력
```

규칙과 모델은 경쟁 관계가 아니다. 실제 백엔드 서비스에서는 요청 검증, 권한 확인, 저장 같은 명확한 처리는 일반 코드가 맡고, 사람이 규칙을 모두 쓰기 어려운 판단에만 모델을 사용한다.

## AI

AI는 사람이 판단하던 일을 컴퓨터가 수행하도록 만드는 기술 전반을 가리킨다.

정해진 규칙에 따라 동작하는 프로그램도 넓은 의미에서는 AI라고 부를 수 있다. 다만 실무에서 단순히 “AI를 사용한다”라고 말하면 정확한 구현 방식을 알기 어렵다.

가능하면 다음처럼 구체적인 표현을 사용하는 편이 좋다.

- 규칙 기반 프로그램
- 머신러닝 분류 모델
- 생성형 AI
- LLM
- 코딩 에이전트

## 머신러닝

머신러닝은 사람이 모든 규칙을 직접 작성하지 않는다. 과거 데이터와 정답을 제공하면 컴퓨터가 그 관계를 찾아낸다.

학습에는 주로 다음 정보가 필요하다.

- 학습 데이터
- 모델이 참고할 특징
- 모델이 맞혀야 할 목표

주문 사기 탐지라면 주문 금액과 최근 결제 실패 횟수를 특징으로 사용할 수 있다. 과거 주문이 실제로 사기였는지를 정답으로 제공하면 모델은 두 값과 사기 여부의 관계를 학습한다.

학습 과정에서 조정되는 숫자를 파라미터라고 한다.

## 딥러닝

딥러닝은 여러 층으로 구성된 신경망을 사용하는 머신러닝 방법이다.

전통적인 머신러닝은 사람이 어떤 특징을 사용할지 직접 정하는 경우가 많다. 딥러닝은 충분한 데이터가 있다면 필요한 특징을 모델이 학습할 수 있다.

LLM도 딥러닝 모델에 해당한다. 오늘날 LLM에서 널리 사용하는 Transformer 구조는 2017년 발표된 「Attention Is All You Need」 논문에서 제안되었다.

## 생성형 AI

생성형 AI는 학습한 데이터의 패턴을 바탕으로 새로운 결과물을 만든다.

결과물은 글, 코드, 이미지, 음성 등이 될 수 있다. 이미지를 만드는 모델도 생성형 AI이지만 LLM은 아니다.

분류 모델과 생성 모델의 차이는 출력에서 드러난다.

- 분류 모델은 미리 정해진 답 중 하나를 고른다.
- 생성 모델은 정해지지 않은 새로운 결과물을 만든다.

새로운 결과를 만들 수 있다는 것은 그럴듯하지만 사실이 아닌 결과도 만들 수 있다는 뜻이다. 따라서 생성 결과는 항상 검증해야 한다.

## LLM

LLM은 많은 파라미터를 가진 언어 모델이다. 방대한 텍스트를 학습하여 질문에 답하고, 글을 요약하고, 코드를 작성할 수 있다.

LLM은 생성형 AI의 한 종류다. 생성형 AI가 모두 LLM인 것은 아니다.

Anthropic 공식 용어집은 Claude의 바탕 모델이 방대한 글을 이용해 다음 내용을 예측하도록 사전 학습되고, 미세 조정과 사람 피드백을 이용한 학습을 거친다고 설명한다. 사전 학습은 기본 언어 능력을 만들고, 미세 조정과 RLHF는 특정 작업과 사람의 선호에 더 잘 맞도록 조정하는 과정이다.

2026년 11월 22일에 확인한 Anthropic 모델 개요에는 Claude Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5가 안내되어 있다. 이 이름은 모델을 구분한다. Claude Code 같은 도구의 프로그램 버전과는 별개다. 최신 모델 목록은 시간이 지나면 달라질 수 있으므로 실제 선택 전에는 공식 모델 개요를 다시 확인해야 한다.

# 규칙 기반 프로그램과 머신러닝의 차이

주문 사기 여부를 판단하는 간단한 예제를 생각해 보자.

다음과 같은 업무 규칙이 있다고 가정한다.

- 최근 10분 동안 결제 실패가 3회 이상이면 차단한다.
- 주문 금액이 100만 원 이상이면 사람이 검토한다.
- 카드 발급 국가와 배송 국가가 다르면 사람이 검토한다.

Java에서는 다음과 같이 작성할 수 있다.

```java
import java.util.List;

public class RuleBasedFraudCheck {

    record OrderSignal(
        String id,
        long amount,
        String cardCountry,
        String shipCountry,
        int recentFailures
    ) {}

    enum Decision {
        APPROVE,
        REVIEW,
        BLOCK
    }

    static Decision check(OrderSignal order) {
        if (order.recentFailures() >= 3) {
            return Decision.BLOCK;
        }
        if (order.amount() >= 1_000_000) {
            return Decision.REVIEW;
        }
        if (!order.cardCountry().equals(order.shipCountry())) {
            return Decision.REVIEW;
        }
        return Decision.APPROVE;
    }

    public static void main(String[] args) {
        List<OrderSignal> orders = List.of(
            new OrderSignal("A-1001", 35_000, "KR", "KR", 0),
            new OrderSignal("A-1002", 1_200_000, "KR", "KR", 0),
            new OrderSignal("A-1003", 89_000, "US", "KR", 1),
            new OrderSignal("A-1004", 15_000, "KR", "KR", 4),
            new OrderSignal("A-1005", 990_000, "KR", "KR", 2)
        );

        for (OrderSignal order : orders) {
            System.out.println(order.id() + " -> " + check(order));
        }
    }
}
```

같은 코드를 Kotlin으로 작성하면 다음과 같다.

```kotlin
data class OrderSignal(
    val id: String,
    val amount: Long,
    val cardCountry: String,
    val shipCountry: String,
    val recentFailures: Int,
)

enum class Decision {
    APPROVE,
    REVIEW,
    BLOCK,
}

fun check(order: OrderSignal): Decision = when {
    order.recentFailures >= 3 -> Decision.BLOCK
    order.amount >= 1_000_000 -> Decision.REVIEW
    order.cardCountry != order.shipCountry -> Decision.REVIEW
    else -> Decision.APPROVE
}

fun main() {
    val orders = listOf(
        OrderSignal("A-1001", 35_000, "KR", "KR", 0),
        OrderSignal("A-1002", 1_200_000, "KR", "KR", 0),
        OrderSignal("A-1003", 89_000, "US", "KR", 1),
        OrderSignal("A-1004", 15_000, "KR", "KR", 4),
        OrderSignal("A-1005", 990_000, "KR", "KR", 2),
    )

    orders.forEach { println("${it.id} -> ${check(it)}") }
}
```

Java 21과 Kotlin에서 각각 다음 명령으로 실행할 수 있다.

```bash
java RuleBasedFraudCheck.java
kotlinc RuleBasedFraudCheck.kt -include-runtime -d rule.jar && java -jar rule.jar
```

판단 결과는 명확하다.

```text
A-1001 -> APPROVE
A-1002 -> REVIEW
A-1003 -> REVIEW
A-1004 -> BLOCK
A-1005 -> APPROVE
```

`A-1002`는 금액 규칙, `A-1003`은 국가 불일치 규칙, `A-1004`는 결제 실패 횟수 규칙에 걸렸다. 어느 조건 때문에 결과가 나왔는지 코드를 보고 바로 설명할 수 있다.

`A-1005`가 99만 원의 주문이고 최근 결제 실패가 2회라면 모든 규칙을 통과한다.

하지만 금액과 결제 실패 횟수를 함께 보면 의심스러운 주문일 수 있다. 이를 잡으려면 다음과 같은 규칙을 추가해야 한다.

```java
if (order.amount() >= 900_000 && order.recentFailures() >= 2) {
    return Decision.REVIEW;
}
```

고려할 신호가 많아질수록 조합도 빠르게 증가한다. 사람이 모든 조합을 규칙으로 관리하기 어려워지는 지점에서 머신러닝을 검토할 수 있다.

# 데이터에서 판단 기준 학습하기

같은 문제를 로지스틱 회귀 모델로 처리할 수 있다.

이번에는 다음 두 가지 특징만 사용한다.

```text
x1 = 주문 금액
x2 = 최근 결제 실패 횟수
```

모델은 다음과 같은 계산을 한다.

```java
double probability = sigmoid(
    weightForAmount * amount
        + weightForFailures * recentFailures
        + bias
);
```

`weightForAmount`, `weightForFailures`, `bias`는 사람이 직접 정하지 않는다. 학습 데이터의 예측 결과와 실제 정답의 차이가 줄어들도록 반복해서 조정한다.

아래 예제는 정상 주문 6건과 사기 주문 6건을 사용한다. 주문 금액은 100만 원 단위로 바꾸어 입력한다. `Y`의 `0`은 정상, `1`은 사기로 판명된 주문이다.

Java 전체 코드는 다음과 같다.

```java
public class LearnedFraudCheck {

    static final double[][] X = {
        {0.03, 0}, {0.12, 0}, {0.50, 1}, {0.08, 0}, {0.30, 0}, {0.05, 1},
        {0.95, 2}, {1.40, 1}, {0.70, 3}, {1.10, 2}, {0.20, 4}, {0.85, 3}
    };
    static final int[] Y = {0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1};

    static double sigmoid(double z) {
        return 1.0 / (1.0 + Math.exp(-z));
    }

    public static void main(String[] args) {
        double w1 = 0;
        double w2 = 0;
        double b = 0;
        double learningRate = 0.5;

        for (int epoch = 1; epoch <= 3000; epoch++) {
            double gradient1 = 0;
            double gradient2 = 0;
            double gradientBias = 0;
            double loss = 0;

            for (int i = 0; i < X.length; i++) {
                double probability = sigmoid(w1 * X[i][0] + w2 * X[i][1] + b);
                double error = probability - Y[i];

                gradient1 += error * X[i][0];
                gradient2 += error * X[i][1];
                gradientBias += error;
                loss += -(Y[i] * Math.log(probability)
                    + (1 - Y[i]) * Math.log(1 - probability));
            }

            w1 -= learningRate * gradient1 / X.length;
            w2 -= learningRate * gradient2 / X.length;
            b -= learningRate * gradientBias / X.length;

            if (epoch == 1 || epoch == 10 || epoch == 100 || epoch == 3000) {
                System.out.printf(
                    "epoch=%4d loss=%.4f w1=%.3f w2=%.3f b=%.3f%n",
                    epoch, loss / X.length, w1, w2, b
                );
            }
        }

        String[] ids = {"A-1001", "A-1002", "A-1003", "A-1004", "A-1005"};
        double[][] fresh = {
            {0.035, 0}, {1.2, 0}, {0.089, 1}, {0.015, 4}, {0.99, 2}
        };

        for (int i = 0; i < ids.length; i++) {
            double probability = sigmoid(w1 * fresh[i][0] + w2 * fresh[i][1] + b);
            System.out.printf("%s fraudProbability=%.2f%n", ids[i], probability);
        }
    }
}
```

Kotlin 전체 코드는 다음과 같다.

```kotlin
import kotlin.math.exp
import kotlin.math.ln

val X = arrayOf(
    doubleArrayOf(0.03, 0.0), doubleArrayOf(0.12, 0.0),
    doubleArrayOf(0.50, 1.0), doubleArrayOf(0.08, 0.0),
    doubleArrayOf(0.30, 0.0), doubleArrayOf(0.05, 1.0),
    doubleArrayOf(0.95, 2.0), doubleArrayOf(1.40, 1.0),
    doubleArrayOf(0.70, 3.0), doubleArrayOf(1.10, 2.0),
    doubleArrayOf(0.20, 4.0), doubleArrayOf(0.85, 3.0),
)
val Y = intArrayOf(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1)

fun sigmoid(z: Double) = 1.0 / (1.0 + exp(-z))

fun main() {
    var w1 = 0.0
    var w2 = 0.0
    var b = 0.0
    val learningRate = 0.5

    for (epoch in 1..3000) {
        var gradient1 = 0.0
        var gradient2 = 0.0
        var gradientBias = 0.0
        var loss = 0.0

        for (i in X.indices) {
            val probability = sigmoid(w1 * X[i][0] + w2 * X[i][1] + b)
            val error = probability - Y[i]

            gradient1 += error * X[i][0]
            gradient2 += error * X[i][1]
            gradientBias += error
            loss += -(Y[i] * ln(probability) + (1 - Y[i]) * ln(1 - probability))
        }

        w1 -= learningRate * gradient1 / X.size
        w2 -= learningRate * gradient2 / X.size
        b -= learningRate * gradientBias / X.size

        if (epoch in setOf(1, 10, 100, 3000)) {
            println(
                "epoch=%4d loss=%.4f w1=%.3f w2=%.3f b=%.3f"
                    .format(epoch, loss / X.size, w1, w2, b)
            )
        }
    }

    val ids = listOf("A-1001", "A-1002", "A-1003", "A-1004", "A-1005")
    val fresh = listOf(
        doubleArrayOf(0.035, 0.0), doubleArrayOf(1.2, 0.0),
        doubleArrayOf(0.089, 1.0), doubleArrayOf(0.015, 4.0),
        doubleArrayOf(0.99, 2.0),
    )

    ids.forEachIndexed { index, id ->
        val probability = sigmoid(w1 * fresh[index][0] + w2 * fresh[index][1] + b)
        println("%s fraudProbability=%.2f".format(id, probability))
    }
}
```

12건의 과거 주문을 사용해 3,000번 학습한 예제에서는 다음과 같은 파라미터가 만들어졌다.

```text
w1 = 7.470
w2 = 3.790
b  = -10.307
```

학습이 진행되면서 손실도 줄었다.

```text
epoch=   1 loss=0.6931 w1=0.086 w2=0.271 b=0.000
epoch=  10 loss=0.3963 w1=0.342 w2=0.847 b=-0.633
epoch= 100 loss=0.1201 w1=1.828 w2=1.892 b=-3.241
epoch=3000 loss=0.0086 w1=7.470 w2=3.790 b=-10.307
```

같은 주문을 모델에 입력하면 결과가 달라진다.

```text
A-1001 fraudProbability=0.00
A-1002 fraudProbability=0.21
A-1003 fraudProbability=0.00
A-1004 fraudProbability=0.99
A-1005 fraudProbability=0.99
```

규칙 기반 코드가 놓친 `A-1005`는 높은 사기 확률을 얻었다. 주문 금액과 결제 실패 횟수를 따로 판단하지 않고 하나의 조합으로 계산했기 때문이다.

`A-1002`는 금액이 120만 원이지만 결제 실패가 없어 0.21이 나왔다. 규칙은 금액만 보고 검토 대상으로 보냈지만, 모델은 학습 데이터에서 고액이어도 실패가 없으면 정상일 가능성이 높다는 관계를 반영했다. 어느 판단이 옳은지는 모델이 아니라 업무 기준으로 결정해야 한다.

반대로 카드 발급 국가와 배송 국가가 다른 `A-1003`은 위험 주문으로 판단하지 못했다. 모델에 국가 정보를 입력하지 않았기 때문이다.

모델은 제공받은 특징과 학습 데이터 안에 있는 관계만 알 수 있다.

첫 반복의 손실 0.6931은 모든 주문에 50% 확률을 주는 상태에 가깝다. 학습을 반복하면서 손실이 0.0086까지 줄어든다. 학습은 정답과 예측의 차이가 줄어드는 방향으로 파라미터를 계속 고치는 과정이다. 학습률 0.5와 반복 횟수 3,000은 사람이 정했지만, 최종 가중치와 편향은 데이터에서 계산되었다.

| 구분 | 규칙 기반 | 학습 기반 |
|---|---|---|
| 판단 기준 | 사람이 코드로 작성한다 | 데이터에서 파라미터를 학습한다 |
| 결과 설명 | 어떤 조건에 해당했는지 확인하기 쉽다 | 파라미터와 특징의 관계를 해석해야 한다 |
| 새로운 조합 | 사람이 예상한 조합만 처리한다 | 학습 데이터에 비슷한 관계가 있으면 처리할 수 있다 |
| 학습 데이터에 없는 위험 | 규칙으로 추가할 수 있다 | 학습할 수 없다 |
| 변경 방법 | 코드를 수정하고 배포한다 | 데이터를 준비하고 다시 학습한다 |

두 방식 중 하나만 선택해야 하는 것은 아니다. 실제 서비스에서는 명확한 조건을 규칙으로 처리하고, 규칙으로 표현하기 어려운 조합만 모델에 맡기는 방식이 실용적이다.

```java
public Decision decide(OrderSignal signal) {
    Decision decision = fraudRule.check(signal);

    if (decision != Decision.APPROVE) {
        return decision;
    }

    double probability = fraudScoreClient.fraudProbability(signal);

    return probability >= 0.9
        ? Decision.REVIEW
        : Decision.APPROVE;
}
```

Kotlin에서는 같은 흐름을 다음처럼 작성할 수 있다.

```kotlin
fun decide(signal: OrderSignal): Decision {
    val decision = fraudRule.check(signal)

    if (decision != Decision.APPROVE) {
        return decision
    }

    val probability = fraudScoreClient.fraudProbability(signal)

    return if (probability >= 0.9) {
        Decision.REVIEW
    } else {
        Decision.APPROVE
    }
}
```

모델의 점수만으로 주문을 즉시 차단하지 않고 사람의 검토 대상으로 보내는 것도 중요하다. 잘못된 판단이 실제 고객에게 피해를 줄 수 있기 때문이다.

# LLM은 어떻게 글을 만드는가

LLM이 글을 만드는 기본 원리는 다음 토큰을 예측하는 것이다.

모델은 앞의 내용을 보고 다음에 올 가능성이 높은 토큰을 고른다. 선택한 토큰을 기존 문장에 붙인 다음, 다시 다음 토큰을 예측한다.

```text
주문 취소 요청 을
→ 접수
→ 주문 취소 요청 을 접수
→ 했습니다
→ 주문 취소 요청 을 접수 했습니다
```

한 번에 문장 전체를 작성하는 것이 아니다. 토큰을 하나씩 선택하는 과정을 종료 조건에 도달할 때까지 반복한다.

## 작은 언어 모델로 확인하기

다음과 같은 문장이 학습 데이터에 있다고 가정한다.

```text
주문 취소 요청 을 받았습니다 .
주문 취소 는 배송 전 에만 가능 합니다 .
주문 생성 요청 을 접수 했습니다 .
환불 요청 을 접수 했습니다 .
주문 취소 요청 은 고객센터 로 문의 하세요 .
```

바로 앞 토큰 하나만 보고 다음 토큰의 확률을 정하는 모델을 바이그램 모델이라고 한다. 아래 코드는 문장에 등장한 토큰 쌍의 횟수를 세고, 가장 많이 등장한 다음 토큰을 반복해서 선택한다.

Java 전체 코드는 다음과 같다.

```java
import java.util.Map;
import java.util.TreeMap;

public class NextTokenToy {
    public static void main(String[] args) {
        String corpus = """
            주문 취소 요청 을 받았습니다 .
            주문 취소 는 배송 전 에만 가능 합니다 .
            주문 생성 요청 을 접수 했습니다 .
            환불 요청 을 접수 했습니다 .
            주문 취소 요청 은 고객센터 로 문의 하세요 .
            """;

        Map<String, Map<String, Integer>> counts = new TreeMap<>();

        for (String line : corpus.strip().split("\n")) {
            String[] tokens = line.strip().split(" ");
            for (int i = 0; i + 1 < tokens.length; i++) {
                counts
                    .computeIfAbsent(tokens[i], key -> new TreeMap<>())
                    .merge(tokens[i + 1], 1, Integer::sum);
            }
        }

        Map<String, Integer> afterOrder = counts.get("주문");
        int total = afterOrder.values().stream().mapToInt(Integer::intValue).sum();
        afterOrder.forEach((token, count) ->
            System.out.printf("P(%s | 주문) = %d/%d%n", token, count, total)
        );

        StringBuilder output = new StringBuilder("주문");
        String current = "주문";

        for (int step = 0; step < 8 && counts.containsKey(current); step++) {
            current = counts.get(current).entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElseThrow()
                .getKey();
            output.append(' ').append(current);
            if (current.equals(".")) break;
        }

        System.out.println("생성 결과: " + output);
    }
}
```

Kotlin 전체 코드는 다음과 같다.

```kotlin
fun main() {
    val corpus = """
        주문 취소 요청 을 받았습니다 .
        주문 취소 는 배송 전 에만 가능 합니다 .
        주문 생성 요청 을 접수 했습니다 .
        환불 요청 을 접수 했습니다 .
        주문 취소 요청 은 고객센터 로 문의 하세요 .
    """.trimIndent()

    val counts = sortedMapOf<String, java.util.TreeMap<String, Int>>()

    corpus.lines().forEach { line ->
        line.split(" ").zipWithNext().forEach { (before, after) ->
            counts.getOrPut(before) { java.util.TreeMap() }
                .merge(after, 1, Int::plus)
        }
    }

    val afterOrder = counts.getValue("주문")
    val total = afterOrder.values.sum()
    afterOrder.forEach { (token, count) ->
        println("P($token | 주문) = $count/$total")
    }

    val output = StringBuilder("주문")
    var current = "주문"

    for (step in 0 until 8) {
        val next = counts[current] ?: break
        current = next.entries.maxBy { it.value }.key
        output.append(' ').append(current)
        if (current == ".") break
    }

    println("생성 결과: $output")
}
```

여기서 `주문` 다음에 나온 토큰을 세어 보면 다음과 같다.

```text
P(생성 | 주문) = 1/4
P(취소 | 주문) = 3/4
생성 결과: 주문 취소 요청 을 접수 했습니다 .
```

`주문` 다음에는 `취소`가 더 자주 등장했다. 가장 높은 확률의 토큰을 계속 선택하면 다음 문장이 만들어진다.

```text
주문 취소 요청 을 접수 했습니다 .
```

이 문장은 학습 데이터에 그대로 존재하지 않는다.

학습 데이터에 있던 `주문 취소 요청 을 받았습니다`와 `주문 생성 요청 을 접수했습니다`의 패턴이 이어져 새로운 문장이 만들어졌다.

구체적으로는 `주문 → 취소 → 요청 → 을 → 접수 → 했습니다 → .` 순서로 토큰을 하나씩 붙였다. `을` 다음에는 `접수`가 두 번, `받았습니다`가 한 번 등장했기 때문에 `접수`가 선택되었다. 이 장난감 모델에서는 이렇게 센 횟수가 파라미터 역할을 한다.

실제 LLM은 앞 토큰 하나만 보는 단순한 방식보다 훨씬 복잡하다. 앞에서 작성된 전체 문맥을 참고하고 신경망을 사용해 다음 토큰의 확률을 계산한다. 하지만 다음 토큰을 선택하고 이어 붙인다는 기본 구조는 같다.

이 방식은 새로운 문장을 만들 수 있다는 장점이 있다. 동시에 실제로 주문이 접수되지 않았는데도 “주문 취소 요청을 접수했습니다”라는 문장을 만들 수 있다.

LLM이 만든 문장은 자연스러움과 사실 여부를 따로 확인해야 한다.

# 모델과 채팅 서비스와 코딩 에이전트

모델, 채팅 서비스, 코딩 에이전트는 서로 다른 역할을 한다.

| 구분 | 역할 |
|---|---|
| 모델 | 입력을 받아 출력할 토큰을 계산한다 |
| 채팅 서비스 | 모델을 대화 화면에서 사용할 수 있게 한다 |
| 코딩 에이전트 | 모델에 파일 읽기, 수정, 명령 실행 같은 도구를 연결한다 |

Claude 모델 자체는 파일을 직접 열거나 터미널 명령을 실행하지 않는다. 입력받은 내용을 바탕으로 다음 응답을 만든다.

Claude Code와 같은 코딩 에이전트는 모델의 응답을 바탕으로 실제 도구를 실행한다. 공식 문서에서는 이 과정을 컨텍스트 수집, 행동, 결과 검증의 반복으로 설명한다.

```text
사용자
  ↓
코딩 에이전트
  ├── 파일 읽기
  ├── 파일 수정
  ├── 명령 실행
  └── 권한 확인
  ↓
LLM
  ↓
다음 행동 또는 답변 생성
```

예를 들어 모델이 특정 파일을 읽어야 한다고 판단하면, 코딩 에이전트가 파일을 읽는다. 읽은 내용은 다시 모델의 입력으로 전달된다.

무엇을 읽을지 판단하는 것은 모델이고, 실제 파일을 읽는 것은 코딩 에이전트다.

이 구분은 문제를 분석할 때도 도움이 된다.

- 프로그램 버전 문제인가
- 사용한 모델의 문제인가
- 모델에 제공한 정보가 부족한가
- 파일이나 명령을 실행할 권한이 없는가

코딩 도구를 업데이트했다고 해서 사용하는 모델까지 자동으로 같은 방식으로 변경되는 것은 아니다. 프로그램과 모델은 별도로 구분해야 한다.

실제로 설치된 Claude Code의 프로그램 버전과 모델 선택 옵션은 조회 명령으로 구분할 수 있다.

```bash
claude --version
claude --help | grep -A3 -- '--model <model>'
```

이 글을 처음 작성할 때 확인한 결과는 다음과 같았다.

```text
2.1.322 (Claude Code)
  --model <model>                       Model for the current session. Provide
                                        an alias for the latest model (e.g.
                                        'fable', 'opus', or 'sonnet') or a
                                        model's full name.
```

`2.1.322`는 로컬에 설치된 Claude Code 프로그램의 버전이다. `--model`은 그 프로그램 안에서 사용할 모델을 선택하는 별도 옵션이다. 지금 명령을 실행하면 프로그램 업데이트에 따라 다른 버전이 표시될 수 있다.

# 자주 헷갈리는 개념 비교

| 헷갈리는 개념 | 차이 | 확인할 질문 |
|---|---|---|
| AI와 머신러닝 | AI가 더 넓다. 규칙 기반 시스템도 넓은 의미의 AI지만 머신러닝은 아니다. | 데이터로 학습한 파라미터가 있는가? |
| 머신러닝과 딥러닝 | 딥러닝은 여러 층의 신경망을 사용하는 머신러닝이다. 로지스틱 회귀는 딥러닝이 아니다. | 여러 층의 신경망을 사용하는가? |
| 생성형 AI와 LLM | LLM은 글을 다루는 생성형 AI다. 이미지 생성 모델은 LLM이 아니다. | 언어의 토큰을 이어 결과를 만드는가? |
| 분류 모델과 생성 모델 | 분류는 정해진 답 중 하나를 고르고, 생성은 새로운 결과물을 만든다. | 답의 후보가 미리 정해져 있는가? |
| 모델과 코딩 에이전트 | 모델은 응답을 만들고, 코딩 에이전트는 파일과 명령을 실제로 다룬다. | 실제 행동을 실행하는 주체는 무엇인가? |
| 프로그램 버전과 모델 | 프로그램 버전은 설치된 도구의 버전이고, 모델은 도구 안에서 선택해 사용하는 대상이다. | 업데이트된 것이 프로그램인가, 모델인가? |

# 어떤 방식을 선택해야 하는가

모든 문제를 LLM으로 해결할 필요는 없다.

규칙이 명확하다면 일반 코드가 가장 좋은 선택이다. 계산 결과가 정확하고, 빠르며, 판단 이유를 설명하기 쉽다.

과거 데이터에서 숫자나 분류 결과를 예측해야 한다면 머신러닝을 검토할 수 있다. 사기 확률, 배송 지연 시간, 상품 추천 등이 여기에 해당한다.

글이나 코드를 생성하거나 긴 문서를 요약해야 한다면 LLM이 적합할 수 있다.

최신 정보나 회사 내부 정보가 필요하다면 검색이나 사내 시스템을 연결해야 한다. 모델이 모든 최신 정보와 내부 데이터를 알고 있다고 가정해서는 안 된다.

결과가 틀렸을 때 피해가 크다면 검증 과정과 사람의 승인을 둬야 한다. 생성 결과를 결제나 데이터 변경에 바로 연결하는 것은 위험하다.

# 자주 발생하는 실수

## 모든 자동화를 AI라고 부른다

AI라는 말은 범위가 넓다. 실제 구현 방식을 알기 어렵기 때문에 규칙 기반, 머신러닝, LLM과 같이 더 구체적인 이름을 사용하는 편이 좋다.

## 정확한 계산을 LLM에 맡긴다

할인 금액이나 세금처럼 규칙이 명확한 계산은 일반 코드로 처리해야 한다. LLM의 출력은 같은 정확성을 보장하지 않는다.

## 모델이 보지 못한 정보도 판단할 수 있다고 생각한다

국가 정보를 특징으로 제공하지 않은 사기 탐지 모델은 국가 간 불일치를 판단할 수 없다. 모델은 입력으로 받은 정보만 사용한다.

## 생성된 문장을 사실로 받아들인다

LLM은 사실을 조회해서 문장을 만드는 것이 아니라, 문맥상 가능성이 높은 토큰을 선택한다. 중요한 정보는 원문이나 공식 문서와 대조해야 한다.

## 모델과 코딩 도구를 같은 것으로 생각한다

모델은 응답을 만들고, 코딩 도구는 파일과 터미널을 조작한다. 문제가 발생하면 어느 층에서 생긴 문제인지 구분해야 한다.

## 운영 데이터를 그대로 입력한다

모델 서비스에는 입력 내용이 전송될 수 있다. 연습과 테스트에는 가짜 데이터를 사용하고, 운영 데이터는 조직의 보안 기준에 따라 처리해야 한다.

# 이해 확인

1. **if 문으로 만든 사기 탐지는 머신러닝인가?**
   - 아니다. 넓은 뜻의 AI라고 부를 수는 있지만, 데이터로 학습한 파라미터가 없으므로 머신러닝은 아니다.
2. **로지스틱 회귀 예제의 `w1=7.470`은 누가 정했는가?**
   - 학습 과정이 정했다. 사람이 정한 값은 학습률과 반복 횟수다.
3. **모델이 국가가 다른 `A-1003`을 위험하다고 판단하지 못한 이유는 무엇인가?**
   - 국가 정보를 특징으로 제공하지 않았기 때문이다.
4. **생성형 AI와 LLM은 같은 말인가?**
   - 아니다. LLM은 글을 다루는 생성형 AI의 한 종류다.
5. **LLM은 긴 답변을 어떻게 만드는가?**
   - 지금까지의 문맥을 보고 다음 토큰을 예측해 붙이는 과정을 종료할 때까지 반복한다.
6. **코딩 에이전트가 파일을 수정할 때 실제 파일 쓰기를 실행하는 것은 모델인가?**
   - 아니다. 무엇을 수정할지 판단하고 내용을 제안하는 것은 모델이지만, 실제 도구를 실행하는 것은 에이전트 하네스다.

# 정리

AI는 가장 넓은 개념이다. 머신러닝은 데이터에서 규칙을 찾고, 딥러닝은 깊은 신경망을 사용하는 머신러닝 방법이다. 생성형 AI는 새로운 결과물을 만들며, LLM은 그중 언어를 다루는 모델이다.

규칙 기반 프로그램은 판단 과정을 설명하기 쉽고 결과가 명확하다. 머신러닝은 사람이 모든 조건을 작성하기 어려운 문제에서 데이터의 관계를 찾을 수 있다. 두 방식은 경쟁 관계가 아니며 함께 사용할 수 있다.

LLM은 앞의 문맥을 바탕으로 다음 토큰을 예측하는 과정을 반복한다. 이 때문에 자연스러운 글을 만들 수 있지만, 자연스러운 문장이 반드시 사실인 것은 아니다.

마지막으로 모델과 모델을 사용하는 도구를 구분해야 한다. LLM은 응답을 만들고, 코딩 에이전트는 파일과 명령을 실제로 다룬다.

다음 글에서는 모델의 구조와 학습 파라미터, 사전 학습, 미세 조정, RLHF, 추론의 차이를 더 자세히 다룬다.

# 용어 정의

- **AI**: 사람이 수행하던 판단, 예측, 생성 작업을 컴퓨터가 수행하도록 만드는 기술 전반이다.
- **머신러닝**: 사람이 모든 규칙을 작성하는 대신 데이터에서 규칙을 학습하는 방법이다.
- **딥러닝**: 여러 층으로 구성된 신경망을 사용하는 머신러닝 방법이다.
- **생성형 AI**: 학습한 데이터의 패턴을 바탕으로 새로운 글, 코드, 이미지, 음성 등을 만드는 AI다.
- **LLM**: 방대한 텍스트를 학습하고 다음 토큰을 예측하여 글을 만드는 대규모 언어 모델이다.
- **언어 모델**: 앞의 문맥을 바탕으로 다음 토큰의 확률을 계산하는 모델이다.
- **모델**: 입력을 받아 출력을 계산하는 구조와 학습으로 정해진 숫자의 묶음이다.
- **신경망**: 계산 단위를 여러 개 연결하고 층으로 쌓아 입력에서 출력을 계산하는 모델 구조다.
- **가중치**: 어떤 입력이 결과에 얼마나 영향을 주는지 나타내는 파라미터다.
- **학습 데이터**: 모델이 관계를 찾는 데 사용하는 과거 사례의 모음이다.
- **특징**: 모델이 판단할 때 입력으로 사용하는 값이다.
- **파라미터**: 학습 과정에서 조정되는 모델 내부의 숫자다.
- **Transformer**: 2017년 논문 「Attention Is All You Need」에서 제안된 신경망 구조다. 오늘날 LLM에서 널리 사용한다.
- **분류 모델**: 입력을 사기·정상처럼 미리 정해진 답 중 하나로 나누는 모델이다.
- **토큰**: 언어 모델이 글을 처리하는 단위다. 단어 전체, 단어의 일부, 문자, 바이트 등이 될 수 있다.
- **바이트**: 컴퓨터가 데이터를 저장하는 기본 단위다. 8비트로 이루어진다.
- **미세 조정**: 사전 학습한 모델을 추가 데이터로 더 학습해 특정 작업이나 형식에 맞추는 과정이다.
- **RLHF**: 사람이 답변에 매긴 선호를 이용해 모델이 더 나은 답을 내도록 훈련하는 방법이다.
- **강화 학습**: 행동의 결과로 얻은 보상이 커지는 방향으로 행동 방식을 바꾸는 학습 방법이다.
- **사전 학습**: 방대한 데이터로 모델의 기본 파라미터를 먼저 학습하는 과정이다.
- **자기 회귀 언어 모델**: 앞서 만든 출력을 다음 예측의 입력에 다시 넣어 토큰을 하나씩 이어 만드는 언어 모델이다.
- **손실**: 모델의 예측과 실제 정답이 얼마나 다른지를 나타내는 값이다.
- **로지스틱 회귀**: 특징마다 가중치를 곱해 더한 값을 0과 1 사이의 확률로 바꾸는 분류 모델이다.
- **경사 하강법**: 손실이 줄어드는 방향으로 파라미터를 조금씩 조정하는 학습 방법이다.
- **학습률**: 경사 하강법이 한 번에 파라미터를 얼마나 바꿀지 정하는 값이다.
- **바이그램 모델**: 바로 앞 토큰 하나만 보고 다음 토큰의 확률을 정하는 단순한 언어 모델이다.
- **채팅 서비스**: 모델을 대화 화면에서 사용할 수 있도록 만든 제품이다.
- **코딩 에이전트**: 모델에 파일 읽기, 수정, 명령 실행 등의 도구를 연결한 프로그램이다.
- **에이전트 하네스**: 모델이 도구를 사용하고 작업을 반복할 수 있도록 실행 환경과 컨텍스트를 관리하는 계층이다.
- **도구**: 에이전트가 실행할 수 있는 행동이다. 파일 읽기, 코드 수정, 명령 실행 등이 있다.
- **컨텍스트**: 모델이 한 번의 응답을 만들 때 볼 수 있도록 입력에 담은 정보 전체다.
- **Claude Code**: Claude 모델에 파일, 터미널, Git 등의 도구를 연결한 코딩 에이전트다.
- **API**: 프로그램이 다른 프로그램의 기능을 호출할 때 따르는 약속이다.
- **HTTP**: 웹에서 요청과 응답을 주고받는 통신 규약이다.
- **IDE**: 코드 편집, 빌드, 디버깅 기능을 한 환경에 모은 개발 도구다.
- **셸**: 사용자가 입력한 명령을 운영체제에 전달해 실행하는 프로그램이다.
- **Git**: 파일 변경 이력을 기록하고 여러 작업을 합치는 분산 버전 관리 도구다.
- **브랜치**: 다른 작업과 섞이지 않도록 분리한 Git 변경 이력의 갈래다.
- **PR**: 한 브랜치의 변경을 다른 브랜치에 합치기 전에 검토를 요청하는 절차다.

# 참고 자료

- [Anthropic Glossary](https://platform.claude.com/docs/en/about-claude/glossary) — 공식 문서
- [Anthropic Models overview](https://platform.claude.com/docs/en/models/overview) — 공식 문서
- [Claude Code Overview](https://code.claude.com/docs/en/overview) — 공식 문서
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) — 공식 문서
- [Claude Code Glossary](https://code.claude.com/docs/en/glossary) — 공식 문서
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — 원 논문
