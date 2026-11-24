---
title: Transformer와 Attention은 문맥을 어떻게 계산하는가
description: >-
  Transformer가 토큰을 임베딩으로 바꾸고 Self-Attention으로 문맥을 섞는 과정을 Query, Key, Value와 softmax 계산으로 살펴본다. 멀티헤드 어텐션, 위치 인코딩, 인과 마스크, 긴 컨텍스트의 계산량과 context rot을 Java와 Kotlin 예제로 확인한다.
publishedAt: '2026-11-25'
updatedAt: '2026-11-25'
tags:
  - AI
  - LLM
  - Transformer
  - Attention
  - Context Window
status: published
reviewedAt: '2026-11-25'
sources:
  - 'https://arxiv.org/abs/1706.03762'
  - 'https://arxiv.org/html/1706.03762v7'
  - 'https://platform.claude.com/docs/en/build-with-claude/context-windows'
  - 'https://platform.claude.com/docs/en/about-claude/glossary'
  - 'https://platform.claude.com/docs/en/models/overview'
  - 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices'
  - 'https://www.anthropic.com/research/effective-context-engineering-for-ai-agents'
  - 'https://code.claude.com/docs/en/best-practices'
---
# 개요

앞선 글에서는 모델이 구조와 파라미터의 묶음이고, 추론할 때는 학습된 파라미터를 읽어 다음 토큰을 계산한다는 점을 살펴봤다.

이번에는 모델 안쪽으로 한 단계 더 들어간다. 같은 단어도 주변 문장에 따라 뜻이 달라지는 이유와, LLM이 문장 안의 관계를 어떤 계산으로 처리하는지 알아본다.

핵심은 Transformer와 Attention이다.

- Transformer는 토큰 사이의 관계를 Attention으로 계산하는 신경망 구조다.
- Attention은 관련도 점수를 매기고, 합이 1인 비중으로 바꾸고, 그 비중대로 정보를 섞는다.
- Self-Attention은 같은 입력 안의 토큰들이 서로를 참고하게 한다.
- 글을 생성하는 모델은 인과 마스크로 아직 만들지 않은 뒤쪽 토큰을 보지 못하게 한다.
- 표준 Self-Attention에서 토큰이 `n`개라면 비교 관계는 `n²`개로 늘어난다.
- 컨텍스트 창이 크더라도 관련 없는 정보를 모두 넣는 것이 항상 유리하지는 않다.

이 글에서는 다음 내용을 순서대로 확인한다.

1. 토큰이 숫자 벡터로 바뀌는 과정
2. Query, Key, Value로 Attention을 계산하는 방법
3. 멀티헤드 어텐션과 위치 인코딩의 역할
4. 인코더, 디코더, 인과 마스크의 차이
5. 긴 컨텍스트에서 계산량과 정보 회수율이 달라지는 이유
6. Java와 Kotlin으로 직접 확인하는 네 가지 예제

예제의 점수와 벡터는 계산을 설명하기 위해 정한 값이다. 실제 모델의 내부 값을 가져온 것이 아니다. 출력은 OpenJDK 21.0.6과 Kotlin 2.2.20에서 확인했다.

# 문맥은 단어 하나만으로 정해지지 않는다

다음 두 문장을 보자.

```text
주문 취소 후 환불은 결제 수단으로 돌아간다.
쿠폰 환불은 다음 주문에서 쓸 수 있는 적립금으로 돌아간다.
```

두 문장 모두 “환불은 … 돌아간다”라는 구조를 가진다. 첫 문장에서 돈이 돌아가는 곳은 결제 수단이고, 두 번째 문장에서는 적립금이다.

`돌아간다`라는 단어 하나만 봐서는 이 차이를 알 수 없다. 주변의 `결제 수단`, `적립금`, `쿠폰`을 함께 봐야 한다.

Transformer 이전에는 문장을 처리할 때 RNN이 널리 사용됐다. RNN은 토큰을 앞에서부터 하나씩 읽으며 이전 단계의 정보를 다음 단계로 넘긴다. 멀리 떨어진 단어의 관계를 전달하려면 여러 단계를 거쳐야 하고, 앞 계산이 끝나야 다음 계산을 할 수 있다.

2017년 「Attention Is All You Need」 논문은 순환 구조 없이 Attention을 중심으로 문장을 처리하는 Transformer를 제안했다.

# Transformer의 전체 흐름

글이 다음 토큰으로 바뀌는 흐름을 먼저 보면 다음과 같다.

```text
입력 글
  ↓
토큰으로 분리
  ↓
각 토큰을 임베딩 벡터로 변환
  ↓
위치 정보 추가
  ↓
Self-Attention과 피드포워드 계산
  ↓
같은 구조를 여러 층 반복
  ↓
다음 토큰 후보마다 확률 계산
  ↓
토큰 하나를 고르고 입력 끝에 추가
  ↓
다음 토큰을 만들기 위해 반복
```

원 논문의 기본 Transformer는 인코더와 디코더에 같은 구조의 층을 각각 6개씩 쌓았다. 층 하나에는 Attention과 피드포워드 계산이 들어간다.

Attention은 토큰끼리 정보를 주고받게 한다. 피드포워드 네트워크는 다른 토큰을 섞지 않고 각 토큰의 벡터를 따로 변환한다.

원 논문의 층 수와 벡터 크기는 2017년 번역 모델의 설정이다. 현재 상용 LLM의 내부 층 수와 구조를 같은 값이라고 보면 안 된다.

# 임베딩은 토큰을 숫자로 바꾼다

컴퓨터는 글자를 그대로 계산하지 못한다. 먼저 글을 토큰으로 나누고, 각 토큰을 숫자 벡터로 바꾼다.

벡터는 숫자를 순서대로 나열한 것이다.

```text
[0.2, -1.3, 0.7]
```

벡터에 들어 있는 숫자의 개수를 차원이라고 한다. 원 논문의 기본 모델은 `d_model = 512`를 사용했다. 토큰 하나를 숫자 512개로 표현했다는 뜻이다.

토큰을 벡터로 바꾼 결과를 임베딩이라고 한다. 임베딩 값은 사람이 직접 작성하지 않는다. 다음 토큰을 잘 맞히는 방향으로 학습되며, 비슷한 문맥에서 사용되는 토큰은 비슷한 벡터를 갖는 경향이 생긴다.

임베딩만으로는 현재 문장의 문맥이 반영되지 않는다. 앞의 두 문장에 나온 `돌아간다`는 처음에는 같은 임베딩에서 시작한다. 주변 토큰의 정보를 섞은 다음에야 서로 다른 문맥의 벡터가 된다.

이 작업을 Self-Attention이 수행한다.

# Self-Attention의 세 단계

Self-Attention은 같은 입력 안의 토큰들이 서로를 참고해 자신의 벡터를 갱신하는 계산이다. 바깥 문서나 인터넷을 검색하는 기능이 아니다.

각 토큰의 벡터에서는 세 가지 벡터를 만든다.

| 이름 | 역할 | 계산에서 놓이는 위치 |
|---|---|---|
| Query | 현재 토큰이 어떤 정보를 찾는지 표현한다 | 관련도 점수의 기준 |
| Key | 각 토큰이 어떤 정보와 잘 맞는지 표현한다 | Query와 비교할 대상 |
| Value | 각 토큰이 실제로 전달할 정보를 담는다 | 가중치를 곱해 섞을 값 |

Query, Key, Value는 토큰 벡터에 서로 다른 학습 행렬을 곱해 만든다. 이 행렬 안의 숫자도 모델의 파라미터다.

`환불은`이라는 토큰의 벡터를 갱신한다고 생각해 보자.

## 1단계: 관련도 점수 계산

`환불은`의 Query와 문장 안 각 토큰의 Key를 내적한다.

내적은 길이가 같은 두 벡터에서 같은 위치의 숫자끼리 곱한 뒤 모두 더하는 계산이다. 두 벡터가 같은 방향을 가리킬수록 값이 커지는 성질이 있다.

내적 결과는 `√d_k`로 나눈다. `d_k`는 Key 벡터의 차원이다. 차원이 커질수록 내적 값이 지나치게 커져 softmax의 기울기가 매우 작아지는 문제를 줄이기 위한 처리다.

## 2단계: 점수를 비중으로 변환

점수 목록에 softmax를 적용한다.

softmax는 각 값에 지수 함수를 적용하고 전체 합으로 나눈다. 결과는 모두 0과 1 사이이고, 합은 1이 된다. 점수가 높은 토큰은 더 큰 비중을 받는다.

이 비중을 어텐션 가중치라고 한다.

## 3단계: Value를 가중 평균

각 토큰의 Value에 해당 토큰의 어텐션 가중치를 곱해 모두 더한다.

비중이 큰 토큰의 정보는 많이 섞이고, 비중이 작은 토큰의 정보는 적게 섞인다. 이렇게 만든 결과가 `환불은`의 새로운 벡터다.

원 논문의 식은 이 세 단계를 한 줄로 표현한다.

```text
Attention(Q, K, V) = softmax(Q × Kᵀ ÷ √d_k) × V
```

- `Q × Kᵀ`: 모든 Query와 Key의 내적을 계산한다.
- `÷ √d_k`: 점수의 크기를 조정한다.
- `softmax(...)`: 점수를 합이 1인 가중치로 바꾼다.
- `× V`: 가중치대로 Value를 섞는다.

이 방식을 Scaled Dot-Product Attention이라고 한다.

```text
현재 토큰의 벡터 ─→ Query ─┐
                            ├─→ 내적과 크기 조정 ─→ softmax ─┐
모든 토큰의 벡터 ─→ Key ───┘                              │
모든 토큰의 벡터 ─→ Value ────────────────────────────────┴─→ 새 벡터
```

가중치는 정보를 섞는 비율이다. 특정 가중치가 높다고 해서 모델이 그 내용을 사실로 검증했다는 뜻은 아니다. 가중치만으로 모델의 판단 이유를 완전히 설명할 수도 없다.

# Self-Attention이 RNN과 다른 점

Self-Attention의 중요한 특징은 다음과 같다.

## 여러 토큰을 병렬로 계산할 수 있다

RNN은 이전 토큰의 계산 결과가 다음 토큰에 필요하다. Self-Attention은 모든 Query와 Key의 관계를 행렬 연산으로 한꺼번에 계산할 수 있다.

원 논문은 층 하나의 순차 연산 수를 Self-Attention은 `O(1)`, 순환 층은 `O(n)`으로 비교했다. 이 특성은 GPU에서 병렬로 학습하기에 유리하다.

## 멀리 떨어진 토큰도 한 번에 연결한다

첫 토큰과 마지막 토큰도 한 번의 Attention 계산으로 직접 비교한다. 원 논문에서 두 토큰 사이의 최대 경로 길이는 Self-Attention이 `O(1)`, 순환 층이 `O(n)`이다.

## 모든 토큰 쌍을 비교한다

장점만 있는 것은 아니다. 표준 Self-Attention은 토큰이 `n`개라면 `n × n`개의 관계를 계산한다. 입력이 길어질수록 계산량과 메모리 사용량이 빠르게 늘어난다.

# 멀티헤드 어텐션

문장 안의 관계는 한 종류가 아니다.

`환불은`은 `취소`와 사건의 흐름으로 연결되고, `결제 수단으로`와는 돈이 돌아갈 위치로 연결된다. 하나의 점수 체계만으로 여러 관계를 표현하기는 어렵다.

멀티헤드 어텐션은 Query, Key, Value를 여러 묶음으로 나누고, 묶음마다 Attention을 따로 계산한다. 묶음 하나를 헤드라고 한다.

```text
head_i = Attention(Q × W_i^Q, K × W_i^K, V × W_i^V)
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) × W^O
```

- 각 헤드는 서로 다른 `W_i^Q`, `W_i^K`, `W_i^V` 행렬을 학습한다.
- `Concat`은 각 헤드의 결과를 이어 붙인다.
- `W^O`는 이어 붙인 결과를 다시 원래 벡터 크기로 변환한다.

원 논문의 기본 모델은 헤드 8개를 사용했고, 헤드마다 Key와 Value의 차원은 64였다. `64 × 8 = 512`이므로 전체 벡터 크기와 맞는다.

헤드마다 서로 다른 관계에 반응하도록 학습될 수 있다. 다만 “3번 헤드는 주어와 동사만 담당한다”처럼 하나의 역할에 정확히 대응한다고 단정할 수는 없다. 역할은 학습 결과로 생기며 사람이 미리 지정하지 않는다.

# 위치 인코딩은 토큰의 순서를 알려 준다

Attention의 내적과 가중 평균만으로는 토큰의 순서를 알 수 없다.

```text
주문을 취소한 뒤 결제를 환불한다.
결제를 환불한 뒤 주문을 취소한다.
```

두 문장은 같은 단어를 포함하지만 순서가 다르고 의미도 다르다. 모델이 이 차이를 알 수 있도록 각 토큰의 위치를 벡터로 만들어 임베딩에 더한다.

원 논문은 사인과 코사인 함수로 위치 인코딩을 만들었다.

```text
PE(pos, 2i)   = sin(pos / 10000^(2i / d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i / d_model))
```

`pos`는 토큰의 위치이고 `i`는 벡터 안의 칸 번호다. 칸마다 주기가 다른 값을 사용하므로 위치마다 다른 숫자 무늬가 생긴다. 같은 토큰도 문장 속 위치가 다르면 서로 다른 입력 벡터가 된다.

오늘날 모델은 다른 위치 표현 방법을 사용할 수 있다. Claude의 구체적인 위치 처리 방식은 확인한 공식 문서에 공개되어 있지 않다.

# 인코더, 디코더, 인과 마스크

원 논문의 Transformer는 번역을 위해 인코더와 디코더를 함께 사용했다.

| 부분 | 역할 | 볼 수 있는 토큰 |
|---|---|---|
| 인코더 | 번역할 원문 전체를 문맥 벡터로 변환한다 | 원문의 앞뒤 모든 토큰 |
| 디코더 | 지금까지 만든 번역문을 보고 다음 토큰을 만든다 | 앞서 만든 출력과 인코더의 원문 벡터 |

디코더가 아직 만들지 않은 뒤쪽 토큰을 보면 정답을 미리 보는 문제가 생긴다. 이를 막기 위해 현재 위치보다 뒤에 있는 Attention 점수를 음의 무한대로 바꾼다.

```text
현재 위치보다 뒤의 점수 = -∞
exp(-∞) = 0
softmax 결과 = 0
```

이 장치를 인과 마스크라고 한다. 각 토큰이 자기 자신과 앞쪽 토큰만 보게 한다.

지금까지 만든 출력을 다시 입력에 포함해 다음 토큰을 하나씩 생성하는 방식을 자기회귀라고 한다. Anthropic 공식 용어집은 Claude의 바탕 모델을 다음 내용을 예측하도록 사전 학습한 자기회귀 언어 모델로 설명한다.

글 생성에는 인코더 없이 인과 마스크를 사용하는 층만 쌓은 디코더 전용 구조가 널리 쓰인다. 사용자의 질문과 모델의 답은 하나의 토큰 흐름으로 이어지고, 답의 각 토큰은 질문과 자기보다 앞서 생성된 답을 참고한다.

Claude의 세부 층 수, 헤드 수, 위치 처리 방식은 공개된 공식 문서만으로 확인할 수 없다. 원 논문의 구조를 Claude의 실제 내부 구조라고 단정해서는 안 된다.

# 입력이 길어지면 n² 관계가 생긴다

표준 Self-Attention은 모든 Query와 Key를 비교한다. 토큰이 `n`개라면 비교 쌍은 `n²`개다.

원 논문은 층 하나의 특성을 다음과 같이 비교했다. `d`는 벡터 차원이다.

| 층 종류 | 층 하나의 계산량 | 순차 연산 수 | 두 토큰 사이 최대 경로 |
|---|---|---|---|
| Self-Attention | `O(n² × d)` | `O(1)` | `O(1)` |
| 순환 층 | `O(n × d²)` | `O(n)` | `O(n)` |

2017년 번역 문장은 보통 수십 토큰이고 원 논문의 `d_model`은 512였다. 원 논문은 `n`이 `d`보다 작을 때 Self-Attention이 순환 층보다 계산상 유리하다고 설명한다.

2026년 11월 25일에 확인한 Anthropic 모델 문서에서 현재 Claude 모델의 컨텍스트 창은 최대 100만 토큰으로 안내되어 있다. 실제 상용 모델은 긴 입력을 효율적으로 처리하기 위한 여러 최적화를 사용할 수 있다. 내부 구현이 공개되지 않았으므로 `n²` 표만으로 실제 Claude의 비용이나 응답 시간을 계산할 수는 없다.

기억할 점은 입력이 길어질수록 모델이 처리해야 할 관계와 비용이 커진다는 사실이다.

# 긴 컨텍스트가 항상 좋은 것은 아니다

컨텍스트 창은 모델이 한 번의 응답을 만들 때 참고할 수 있는 전체 텍스트 범위다. 학습에 사용한 대규모 데이터와는 다르며, 현재 요청의 작업 기억에 가깝다.

Anthropic의 Context windows 문서는 컨텍스트가 커지면 더 복잡하고 긴 요청을 처리할 수 있지만, 정보가 많다고 자동으로 더 좋은 결과가 나오는 것은 아니라고 설명한다. 토큰 수가 늘수록 정확도와 정보 회수율이 떨어지는 현상을 context rot이라고 부른다.

Anthropic의 컨텍스트 엔지니어링 글은 다음 요인을 설명한다.

- Transformer에서는 토큰 사이에 매우 많은 관계가 생긴다.
- 긴 입력 전체에 모델의 제한된 주의 능력을 나눠 써야 한다.
- 학습 데이터에는 아주 긴 입력보다 짧은 입력이 더 흔하다.
- 학습할 때보다 긴 입력을 지원하기 위한 위치 정보 보간은 정밀도에 영향을 줄 수 있다.
- 성능은 특정 길이에서 갑자기 무너지기보다 입력이 길어지면서 점진적으로 낮아질 수 있다.

어텐션 가중치의 합이 1이라는 사실은 비교 대상이 많을수록 비중이 여러 곳에 분산될 수 있다는 계산상의 직관을 준다. 하지만 실제 모델의 정보 회수 성능을 softmax 하나만으로 설명할 수는 없다. 층, 헤드, 학습 데이터, 위치 처리, 모델 구조가 함께 영향을 준다.

Claude Code 공식 문서도 컨텍스트를 잘 관리해야 더 좋은 답을 얻고 비용을 줄일 수 있다고 안내한다. 컨텍스트 창의 크기는 가능한 입력의 상한이지, 관련 없는 자료까지 모두 넣으라는 권장이 아니다.

# Attention이 하지 않는 일

| 오해 | 실제 동작 |
|---|---|
| Attention은 사람이 집중하는 것과 같다 | 학습된 행렬로 내적, softmax, 가중 평균을 수행하는 계산이다 |
| 가중치가 높으면 사실로 검증된 내용이다 | 가중치는 정보를 섞는 비율이며 사실 검증 결과가 아니다 |
| Self-Attention이 바깥 문서를 검색한다 | 현재 입력에 들어온 토큰끼리만 계산한다 |
| 모델이 지난 요청을 스스로 기억한다 | 지난 대화가 현재 요청에 다시 포함되어야 볼 수 있다 |
| 컨텍스트 창이 크면 모든 정보를 같은 품질로 찾는다 | 입력이 길어질수록 정확도와 회수율이 낮아질 수 있다 |

# 예제 1: softmax로 Attention 가중치 만들기

다음 환불 정책 문장을 사용한다.

```text
주문 취소 후 환불은 결제 수단으로 돌아간다
```

설명을 단순하게 만들기 위해 띄어쓰기 단위로 토큰을 나눴다고 가정한다. 실제 토크나이저는 이와 다르게 나눌 수 있다.

`환불은`이 각 토큰을 얼마나 참고할지 계산해 보자. 실제 모델은 Query와 Key의 내적으로 점수를 만들지만, 여기서는 계산을 확인하기 위해 점수를 직접 정한다.

| 토큰 | 점수 | 점수를 정한 이유 |
|---|---:|---|
| 주문 | 2.0 | 무엇의 환불인지 알려 준다 |
| 취소 | 2.5 | 환불이 일어난 원인이다 |
| 후 | 0.2 | 순서를 나타내지만 정보가 적다 |
| 환불은 | 1.0 | 현재 처리하는 토큰이다 |
| 결제 | 2.2 | 돈이 어디서 왔는지 알려 준다 |
| 수단으로 | 2.4 | 돈이 돌아갈 곳이다 |
| 돌아간다 | 1.5 | 환불에 일어나는 동작이다 |

softmax는 각 점수에 지수 함수를 적용하고 전체 합으로 나눈다.

```text
e^2.0 ≈ 7.39   e^2.5 ≈ 12.18   e^0.2 ≈ 1.22   e^1.0 ≈ 2.72
e^2.2 ≈ 9.03   e^2.4 ≈ 11.02   e^1.5 ≈ 4.48
합계 ≈ 48.04

취소의 가중치 = 12.18 ÷ 48.04 ≈ 0.254
후의 가중치   =  1.22 ÷ 48.04 ≈ 0.025
```

나머지 값은 코드로 확인한다.

Java 코드는 다음과 같다.

```java
import java.util.Arrays;

public class SoftmaxTable {

    static double[] softmax(double[] scores) {
        // 큰 지수 값으로 인한 오버플로를 막기 위해 최댓값을 뺀다.
        double max = Arrays.stream(scores).max().orElse(0);
        double[] exp = Arrays.stream(scores)
            .map(score -> Math.exp(score - max))
            .toArray();
        double sum = Arrays.stream(exp).sum();

        return Arrays.stream(exp)
            .map(value -> value / sum)
            .toArray();
    }

    public static void main(String[] args) {
        String[] tokens = {
            "주문", "취소", "후", "환불은", "결제", "수단으로", "돌아간다"
        };
        double[] scores = {2.0, 2.5, 0.2, 1.0, 2.2, 2.4, 1.5};
        double[] weights = softmax(scores);

        System.out.println("질의 단어: 환불은");
        double total = 0;

        for (int i = 0; i < tokens.length; i++) {
            System.out.printf(
                "점수=%4.1f  가중치=%.3f  %s%n",
                scores[i],
                weights[i],
                tokens[i]
            );
            total += weights[i];
        }

        System.out.printf("가중치 합=%.3f%n", total);
    }
}
```

같은 계산을 Kotlin으로 작성하면 다음과 같다.

```kotlin
import kotlin.math.exp

fun softmax(scores: DoubleArray): DoubleArray {
    // 큰 지수 값으로 인한 오버플로를 막기 위해 최댓값을 뺀다.
    val max = scores.max()
    val expValues = scores.map { exp(it - max) }
    val sum = expValues.sum()

    return expValues.map { it / sum }.toDoubleArray()
}

fun main() {
    val tokens = listOf(
        "주문", "취소", "후", "환불은", "결제", "수단으로", "돌아간다"
    )
    val scores = doubleArrayOf(2.0, 2.5, 0.2, 1.0, 2.2, 2.4, 1.5)
    val weights = softmax(scores)

    println("질의 단어: 환불은")
    tokens.indices.forEach { index ->
        println(
            "점수=%4.1f  가중치=%.3f  %s".format(
                scores[index],
                weights[index],
                tokens[index],
            )
        )
    }
    println("가중치 합=%.3f".format(weights.sum()))
}
```

실행 결과는 다음과 같다.

```text
질의 단어: 환불은
점수= 2.0  가중치=0.154  주문
점수= 2.5  가중치=0.254  취소
점수= 0.2  가중치=0.025  후
점수= 1.0  가중치=0.057  환불은
점수= 2.2  가중치=0.188  결제
점수= 2.4  가중치=0.229  수단으로
점수= 1.5  가중치=0.093  돌아간다
가중치 합=1.000
```

가중치의 합은 1이다. 점수가 2.5인 `취소`의 가중치는 0.254이고, 점수가 0.2인 `후`는 0.025다. 지수 함수 때문에 점수 차이가 가중치에서 더 크게 벌어진다.

실제 모델의 점수는 사람이 정하지 않는다. 학습된 Query와 Key 행렬이 만든다. 이 예제는 softmax가 점수를 비중으로 바꾸는 모양을 확인하기 위한 것이다.

# 예제 2: Self-Attention과 인과 마스크 계산

토큰 세 개와 2차원 벡터로 `softmax(Q × Kᵀ ÷ √d_k) × V`를 끝까지 계산해 보자.

Q, K, V는 계산을 따라가기 쉽게 정한 값이다.

| 토큰 | Query | Key | Value |
|---|---|---|---|
| 주문 | `[1, 0]` | `[1, 0]` | `[10, 0]` |
| 취소 | `[0, 1]` | `[0, 1]` | `[0, 10]` |
| 환불 | `[1, 1]` | `[1, 1]` | `[5, 5]` |

Java 코드는 다음과 같다.

```java
public class TinyAttention {

    static final String[] TOKENS = {"주문", "취소", "환불"};
    static final double[][] Q = {{1, 0}, {0, 1}, {1, 1}};
    static final double[][] K = {{1, 0}, {0, 1}, {1, 1}};
    static final double[][] V = {{10, 0}, {0, 10}, {5, 5}};

    public static void main(String[] args) {
        System.out.println("== 마스크 없음 (모든 토큰이 서로를 봄) ==");
        run(false);

        System.out.println("== 인과 마스크 (앞쪽 토큰만 봄) ==");
        run(true);
    }

    static void run(boolean causal) {
        int tokenCount = TOKENS.length;
        int keyDimension = Q[0].length;

        for (int queryIndex = 0; queryIndex < tokenCount; queryIndex++) {
            double[] scores = new double[tokenCount];

            for (int keyIndex = 0; keyIndex < tokenCount; keyIndex++) {
                if (causal && keyIndex > queryIndex) {
                    scores[keyIndex] = Double.NEGATIVE_INFINITY;
                    continue;
                }

                double dotProduct = 0;
                for (int dimension = 0; dimension < keyDimension; dimension++) {
                    dotProduct += Q[queryIndex][dimension] * K[keyIndex][dimension];
                }
                scores[keyIndex] = dotProduct / Math.sqrt(keyDimension);
            }

            double[] weights = softmax(scores);
            double[] output = new double[V[0].length];

            for (int valueIndex = 0; valueIndex < tokenCount; valueIndex++) {
                for (int dimension = 0; dimension < output.length; dimension++) {
                    output[dimension] += weights[valueIndex] * V[valueIndex][dimension];
                }
            }

            System.out.printf(
                "%s: 가중치=[%.2f, %.2f, %.2f]  출력=[%.2f, %.2f]%n",
                TOKENS[queryIndex],
                weights[0],
                weights[1],
                weights[2],
                output[0],
                output[1]
            );
        }
    }

    static double[] softmax(double[] scores) {
        double max = Double.NEGATIVE_INFINITY;
        for (double score : scores) {
            max = Math.max(max, score);
        }

        double[] expValues = new double[scores.length];
        double sum = 0;

        for (int i = 0; i < scores.length; i++) {
            expValues[i] = Math.exp(scores[i] - max);
            sum += expValues[i];
        }

        for (int i = 0; i < expValues.length; i++) {
            expValues[i] /= sum;
        }

        return expValues;
    }
}
```

Kotlin 코드는 다음과 같다.

```kotlin
import kotlin.math.exp
import kotlin.math.sqrt

val tokens = listOf("주문", "취소", "환불")
val query = arrayOf(
    doubleArrayOf(1.0, 0.0),
    doubleArrayOf(0.0, 1.0),
    doubleArrayOf(1.0, 1.0),
)
val key = arrayOf(
    doubleArrayOf(1.0, 0.0),
    doubleArrayOf(0.0, 1.0),
    doubleArrayOf(1.0, 1.0),
)
val value = arrayOf(
    doubleArrayOf(10.0, 0.0),
    doubleArrayOf(0.0, 10.0),
    doubleArrayOf(5.0, 5.0),
)

fun softmax(scores: DoubleArray): DoubleArray {
    val max = scores.max()
    val expValues = scores.map { exp(it - max) }
    val sum = expValues.sum()
    return expValues.map { it / sum }.toDoubleArray()
}

fun run(causal: Boolean) {
    val tokenCount = tokens.size
    val keyDimension = query[0].size

    for (queryIndex in 0 until tokenCount) {
        val scores = DoubleArray(tokenCount) { keyIndex ->
            if (causal && keyIndex > queryIndex) {
                Double.NEGATIVE_INFINITY
            } else {
                (0 until keyDimension).sumOf { dimension ->
                    query[queryIndex][dimension] * key[keyIndex][dimension]
                } / sqrt(keyDimension.toDouble())
            }
        }

        val weights = softmax(scores)
        val output = DoubleArray(value[0].size) { dimension ->
            (0 until tokenCount).sumOf { valueIndex ->
                weights[valueIndex] * value[valueIndex][dimension]
            }
        }

        println(
            "%s: 가중치=[%.2f, %.2f, %.2f]  출력=[%.2f, %.2f]".format(
                tokens[queryIndex],
                weights[0],
                weights[1],
                weights[2],
                output[0],
                output[1],
            )
        )
    }
}

fun main() {
    println("== 마스크 없음 (모든 토큰이 서로를 봄) ==")
    run(false)

    println("== 인과 마스크 (앞쪽 토큰만 봄) ==")
    run(true)
}
```

실행 결과는 다음과 같다.

```text
== 마스크 없음 (모든 토큰이 서로를 봄) ==
주문: 가중치=[0.40, 0.20, 0.40]  출력=[6.02, 3.98]
취소: 가중치=[0.20, 0.40, 0.40]  출력=[3.98, 6.02]
환불: 가중치=[0.25, 0.25, 0.50]  출력=[5.00, 5.00]
== 인과 마스크 (앞쪽 토큰만 봄) ==
주문: 가중치=[1.00, 0.00, 0.00]  출력=[10.00, 0.00]
취소: 가중치=[0.33, 0.67, 0.00]  출력=[3.30, 6.70]
환불: 가중치=[0.25, 0.25, 0.50]  출력=[5.00, 5.00]
```

마스크가 없을 때 `주문`의 Query와 세 Key의 내적은 1, 0, 1이다. `√2`로 나누고 softmax를 적용하면 가중치는 0.40, 0.20, 0.40이 된다.

```text
0.40 × [10, 0]
+ 0.20 × [0, 10]
+ 0.40 × [5, 5]
= [6.02, 3.98]
```

원래 `주문`의 Value는 `[10, 0]`이었지만 주변 토큰의 정보가 섞여 `[6.02, 3.98]`이 됐다. 같은 토큰도 주변 문맥이 다르면 다른 벡터가 되는 모습이다.

인과 마스크를 켜면 첫 토큰인 `주문`은 자기 자신만 볼 수 있다. `취소`는 뒤쪽의 `환불`을 볼 수 없으므로 세 번째 가중치가 0이 된다. 남은 두 칸이 합 1을 다시 나눠 가지기 때문에 0.33과 0.67로 바뀐다.

마지막 토큰인 `환불`은 앞쪽 토큰을 모두 볼 수 있으므로 마스크를 적용해도 결과가 같다.

# 예제 3: 토큰 수에 따른 비교 쌍 계산

입력이 길어질 때 표준 Self-Attention의 비교 쌍이 얼마나 늘어나는지 확인한다.

Java 코드는 다음과 같다.

```java
public class PairCount {

    public static void main(String[] args) {
        long[] lengths = {1_000, 10_000, 100_000, 200_000, 1_000_000};
        long base = lengths[0] * lengths[0];

        for (long tokenCount : lengths) {
            long pairs = tokenCount * tokenCount;
            System.out.printf(
                "토큰 %,9d개 -> 쌍 %,22d개 (1,000개 대비 %,d배)%n",
                tokenCount,
                pairs,
                pairs / base
            );
        }
    }
}
```

Kotlin 코드는 다음과 같다.

```kotlin
fun main() {
    val lengths = longArrayOf(1_000, 10_000, 100_000, 200_000, 1_000_000)
    val base = lengths[0] * lengths[0]

    for (tokenCount in lengths) {
        val pairs = tokenCount * tokenCount
        println(
            "토큰 %,9d개 -> 쌍 %,22d개 (1,000개 대비 %,d배)".format(
                tokenCount,
                pairs,
                pairs / base,
            )
        )
    }
}
```

실행 결과는 다음과 같다.

```text
토큰     1,000개 -> 쌍              1,000,000개 (1,000개 대비 1배)
토큰    10,000개 -> 쌍            100,000,000개 (1,000개 대비 100배)
토큰   100,000개 -> 쌍         10,000,000,000개 (1,000개 대비 10,000배)
토큰   200,000개 -> 쌍         40,000,000,000개 (1,000개 대비 40,000배)
토큰 1,000,000개 -> 쌍      1,000,000,000,000개 (1,000개 대비 1,000,000배)
```

토큰이 10배 늘면 비교 쌍은 100배 늘어난다. 1,000개에서 100만 개로 1,000배 늘면 쌍은 100만 배가 된다.

이 값은 표준 Attention 층 하나의 이론적인 쌍 개수다. 실제 계산에는 벡터 차원, 헤드 수, 층 수가 영향을 주고, 상용 모델은 계산과 메모리 사용을 줄이는 최적화를 적용할 수 있다. 이 표로 실제 API 비용이나 응답 시간을 계산하면 안 된다.

# 예제 4: 긴 자료와 질문을 배치하는 방법

긴 정책 문서와 코드를 함께 제공할 때는 자료의 경계와 질문의 위치를 분명하게 만드는 편이 좋다.

Anthropic의 Prompting best practices는 긴 자료를 다룰 때 다음 방법을 권한다.

- 긴 자료를 질문과 지시보다 먼저 배치한다.
- 여러 문서는 XML 태그로 구분하고 출처를 함께 적는다.
- 관련 구절을 먼저 인용하게 한 뒤 판단을 요청한다.

주문 API의 환불 정책과 구현을 함께 검토하는 프롬프트는 다음과 같이 구성할 수 있다.

```markdown
<documents>
  <document index="1">
    <source>docs/refund-policy.md</source>
    <document_content>
    (환불 정책 문서 전문)
    </document_content>
  </document>
  <document index="2">
    <source>src/main/java/com/example/order/OrderService.java</source>
    <document_content>
    (OrderService 코드 전문)
    </document_content>
  </document>
</documents>

먼저 위 두 문서에서 "부분 취소 시 환불 금액 계산"과 관련된 부분을
그대로 인용해 <quotes> 태그 안에 적어 주세요.

그다음 인용한 내용만 근거로 OrderService의 부분 취소 환불 계산이
정책과 어긋나는 곳을 찾아 주세요.

정책 문서에서 찾을 수 없는 내용은 추측하지 말고
"정책에 없음"이라고 적어 주세요.
```

가상의 문서에 대한 응답 형태는 다음과 같다.

```text
<quotes>
[문서 1] "부분 취소 시 쿠폰 할인액은 취소 상품 금액 비율대로 나눠 뺀다."
[문서 2] refundAmount = canceledLine.price() * canceledLine.quantity();
</quotes>

정책과 어긋나는 곳:
- OrderService.partialCancel()의 환불 금액 계산이 쿠폰 할인액을 빼지 않는다.
  정책은 할인액을 취소 상품 금액 비율대로 나눠 빼도록 정했다.

정책에 없음:
- 배송비 환불 여부
```

먼저 인용을 받으면 판단이 어떤 문장에 근거했는지 대조하기 쉽다. 인용이 원문과 정확히 같은지는 사람이 다시 확인해야 한다.

XML 태그는 모델의 기능을 바꾸지 않는다. 긴 입력 안에서 문서와 출처, 질문의 경계를 분명하게 표시하는 방법이다.

Claude Code에서는 내용을 직접 붙여 넣는 대신 파일 경로나 파일 참조 기능을 사용할 수 있다. 어떤 방법을 사용하더라도 관련 자료만 선택하고, 자료와 질문의 구분을 명확하게 해야 한다.

# 원 논문과 현재 Claude를 구분해야 한다

Transformer의 원리를 설명할 때 2017년 원 논문의 설정과 현재 상용 모델의 공개 정보를 섞기 쉽다.

| 항목 | 원 논문 Transformer | Claude 공식 문서에서 확인 가능한 내용 |
|---|---|---|
| 처음 다룬 작업 | 영어·독일어, 영어·프랑스어 기계 번역 | 대화, 코딩, 도구 사용 등 다양한 작업 |
| 구조 | 인코더 6층과 디코더 6층 | 자기회귀 언어 모델이라는 설명만 확인 가능 |
| 벡터와 헤드 | `d_model = 512`, 헤드 8개, 헤드당 64차원 | 세부 층 수, 벡터 크기, 헤드 수는 공개 문서에서 확인할 수 없음 |
| 위치 정보 | 사인·코사인 위치 인코딩 | 구체적인 방식은 공개 문서에서 확인할 수 없음 |
| 입력 길이 | 문장 단위 번역 | 2026년 11월 25일 현재 주요 모델은 최대 100만 토큰 |
| 긴 입력에 대한 안내 | `n < d`일 때 Self-Attention의 계산상 장점을 설명 | 토큰이 늘면 정확도와 회수율이 낮아질 수 있다고 안내 |

원 논문의 `512차원`, `8개 헤드`, `6개 층`은 Transformer를 설명하는 좋은 예다. 하지만 Claude의 실제 구조라고 소개하면 안 된다. 공개된 사실과 설명을 위한 예시를 구분해야 한다.

# 실무에서 적용하는 방법

## 관련 자료만 선택한다

주문 취소 버그를 고친다면 저장소 전체보다 다음 자료부터 제공하는 편이 낫다.

- 오류가 발생한 `OrderService`
- 주문과 환불 도메인 객체
- 관련 테스트
- 실제 오류 로그
- 환불 정책 문서

필요한 정보가 없으면 추가로 읽게 하면 된다. 처음부터 모든 파일과 로그를 넣으면 비용이 늘고 중요한 조건이 묻힐 수 있다.

## 긴 자료는 위에, 질문은 아래에 둔다

정책 문서와 긴 로그를 먼저 배치하고, 모델이 해야 할 일과 출력 형식을 마지막에 둔다. 여러 문서를 함께 사용할 때는 파일명이나 출처를 표시한다.

## 인용과 판단을 분리한다

긴 문서에 근거한 판단이 필요하다면 관련 구절을 먼저 찾게 한다. 다음 단계에서 그 인용만 근거로 비교하거나 결론을 내리게 한다.

이 방법은 모델의 답을 자동으로 사실로 만들어 주지는 않는다. 사람이 원문과 인용을 대조하기 쉽게 만든다.

## 작업이 달라지면 컨텍스트를 나눈다

환불 버그를 해결한 뒤 인증 구조를 설계한다면 새 세션을 사용하는 편이 낫다. 이전 작업의 코드와 로그가 새 작업에 필요하지 않기 때문이다.

계속 적용해야 하는 팀 규칙은 대화에만 남기지 않는다. 저장소의 지침 파일이나 문서에 기록해 새 세션에서도 다시 제공되게 한다.

## Attention을 사실 확인으로 사용하지 않는다

모델이 어떤 단어에 높은 Attention 가중치를 줬다는 사실은 그 문장이 옳다는 증거가 아니다. 정책은 원문으로, 코드는 테스트로, 현재 제품 정보는 공식 문서로 검증해야 한다.

# 자주 발생하는 문제

| 증상 | 원인 | 해결 방법 |
|---|---|---|
| 긴 문서 가운데 있는 중요한 조건을 빠뜨린다 | 토큰이 많아지며 정확도와 회수율이 낮아졌다 | 관련 문서만 남기고, 근거 구절을 먼저 인용하게 한다 |
| 긴 로그를 붙였더니 로그 요약만 하고 질문에 답하지 않는다 | 자료와 질문의 경계가 불분명하다 | 자료를 먼저 배치하고 질문과 출력 형식을 마지막에 둔다 |
| 높은 Attention 가중치를 사실 확인 결과로 해석한다 | 가중치와 검증을 혼동했다 | 원문, 공식 문서, 테스트로 따로 검증한다 |
| 새 세션이 이전에 알려 준 규칙을 모른다 | 현재 입력에 규칙이 포함되지 않았다 | 계속 적용할 규칙을 저장소 지침 파일에 기록한다 |
| 100만 토큰 창이므로 저장소 전체를 넣어도 된다고 생각한다 | 입력 상한과 정보 회수 품질을 같은 것으로 봤다 | 작업에 필요한 범위를 먼저 고른다 |
| 원 논문의 헤드 수와 벡터 크기를 Claude의 구조라고 설명한다 | 공개된 사실과 설명용 예시를 구분하지 않았다 | 모델 공식 문서에서 공개한 정보까지만 사용한다 |

# 이해 확인

1. **Attention 계산의 세 단계는 무엇인가?**
   - Query와 Key로 관련도 점수를 계산하고, softmax로 합이 1인 가중치를 만들고, 그 가중치대로 Value를 섞는다.
2. **인과 마스크를 적용하면 가린 칸 외의 가중치도 바뀌는 이유는 무엇인가?**
   - 가린 칸의 지수 값이 0이 된 뒤, 남은 칸이 합 1을 다시 나눠 가지기 때문이다.
3. **Self-Attention만으로 토큰 순서를 구분하기 어려운 이유는 무엇인가?**
   - 내적과 가중 평균에는 토큰의 위치가 직접 들어 있지 않기 때문이다. 위치 정보를 임베딩에 추가해 해결한다.
4. **토큰 수가 10만 개에서 100만 개로 늘면 표준 Self-Attention의 비교 쌍은 몇 배가 되는가?**
   - 토큰은 10배, 비교 쌍은 `10²`인 100배가 된다.
5. **컨텍스트 창이 크더라도 관련 없는 자료를 모두 넣지 않는 편이 좋은 이유는 무엇인가?**
   - 입력이 길수록 계산과 비용이 늘고, 정확도와 정보 회수율이 낮아지는 context rot이 나타날 수 있기 때문이다.
6. **Self-Attention이 회사의 최신 배포 이력을 자동으로 참고할 수 있는가?**
   - 참고할 수 없다. 현재 입력에 들어온 토큰만 처리한다. 배포 이력은 파일, 검색, 도구 등을 통해 입력에 제공해야 한다.

# 정리

Transformer는 토큰 사이의 관계를 Attention으로 계산한다. 글은 토큰으로 나뉘고, 각 토큰은 임베딩 벡터로 바뀐다. 위치 정보가 토큰 순서를 알려 준다.

Self-Attention은 Query와 Key의 내적으로 관련도 점수를 만들고, softmax로 가중치를 계산하고, 그 가중치대로 Value를 섞는다. 멀티헤드 어텐션은 이 계산을 여러 묶음에서 동시에 수행한다.

글을 생성하는 구조는 인과 마스크를 사용해 아직 만들지 않은 뒤쪽 토큰을 가린다. 모델은 지금까지의 입력과 출력을 바탕으로 다음 토큰을 하나씩 만든다.

표준 Self-Attention의 비교 쌍은 토큰 수의 제곱으로 늘어난다. 상용 모델은 여러 최적화를 적용할 수 있으므로 이론적인 쌍 개수로 실제 비용을 계산할 수는 없다.

컨텍스트 창이 크다고 모든 자료를 넣는 것이 좋은 것은 아니다. 관련 자료만 고르고, 자료의 경계를 표시하고, 질문을 분명하게 작성해야 한다. 긴 문서에서는 근거를 먼저 찾고 판단을 나중에 시키는 방법이 유용하다.

다음 글에서는 글이 토큰으로 나뉘는 과정과, 한국어·영어·코드의 토큰 수가 달라지는 이유를 살펴본다.

# 용어 정의

- **Transformer**: 토큰 사이의 관계를 Attention으로 계산해 문맥을 처리하는 신경망 구조다.
- **신경망**: 숫자를 입력받아 곱셈, 덧셈, 변환을 여러 층에서 반복해 결과를 만드는 계산 구조다.
- **LLM**: 많은 파라미터와 대규모 텍스트로 학습한 언어 모델이다.
- **언어 모델**: 앞의 문맥을 바탕으로 다음 토큰의 확률을 계산하는 모델이다.
- **Attention**: 다른 토큰의 정보를 얼마만큼 섞을지 가중치를 계산하는 연산이다.
- **Self-Attention**: 같은 입력 안의 토큰들이 서로를 참고해 자신의 벡터를 갱신하는 Attention이다.
- **토큰**: 모델이 글을 처리하는 단위다. 단어 전체나 일부, 문장 부호 등에 대응할 수 있다.
- **토크나이저**: 글을 토큰으로 나누고 토큰을 다시 글로 바꾸는 도구다.
- **벡터**: 숫자를 순서대로 나열한 것이다.
- **차원**: 벡터에 들어 있는 숫자의 개수다.
- **임베딩**: 토큰을 학습된 숫자 벡터로 표현한 것이다.
- **파라미터**: 학습 과정에서 정해지는 모델 내부의 숫자다.
- **행렬**: 숫자를 행과 열의 표 형태로 나열한 것이다. 벡터를 다른 벡터로 변환할 때 사용한다.
- **Query**: Attention에서 현재 토큰이 찾으려는 정보를 나타내는 벡터다.
- **Key**: Query와 비교하여 관련도 점수를 만드는 벡터다.
- **Value**: 어텐션 가중치를 곱해 실제로 섞는 정보 벡터다.
- **내적**: 같은 위치의 벡터 값끼리 곱한 뒤 모두 더하는 계산이다.
- **softmax**: 숫자 목록을 0과 1 사이이면서 합이 1인 비중으로 바꾸는 함수다.
- **어텐션 가중치**: 각 토큰의 Value를 얼마만큼 섞을지 나타내는 비중이다.
- **가중 평균**: 각 값에 서로 다른 비중을 곱해 더한 결과다.
- **Scaled Dot-Product Attention**: Query와 Key의 내적을 `√d_k`로 나눈 뒤 softmax를 적용하고 Value를 섞는 Attention 계산 방식이다.
- **멀티헤드 어텐션**: Query, Key, Value를 여러 묶음으로 나눠 Attention을 각각 계산하고 결과를 합치는 방식이다.
- **헤드**: 멀티헤드 어텐션에서 독립된 Query, Key, Value 행렬로 Attention을 계산하는 단위다.
- **피드포워드 네트워크**: Transformer 층에서 각 토큰의 벡터를 다른 토큰과 섞지 않고 변환하는 신경망이다.
- **위치 인코딩**: 토큰의 위치를 벡터로 표현해 임베딩에 추가하는 값이다.
- **인코더**: 원 논문 Transformer에서 입력 문장 전체를 문맥 벡터로 바꾸는 부분이다.
- **디코더**: 지금까지 만든 출력을 참고해 다음 토큰을 생성하는 부분이다.
- **인과 마스크**: 현재 위치보다 뒤의 토큰에 대한 Attention 가중치를 0으로 만들어 미래 정보를 보지 못하게 하는 장치다.
- **자기회귀**: 지금까지 만든 출력을 다시 입력에 포함해 다음 값을 하나씩 생성하는 방식이다.
- **디코더 전용 구조**: 인코더 없이 인과 마스크를 사용하는 Transformer 층으로 다음 토큰을 생성하는 구조다.
- **RNN**: 토큰을 앞에서부터 순서대로 처리하며 이전 단계의 정보를 다음 단계로 전달하는 신경망이다.
- **병렬화**: 여러 계산을 동시에 처리해 전체 시간을 줄이는 방법이다.
- **GPU**: 같은 종류의 계산을 대량으로 병렬 처리하는 데 강한 연산 장치다.
- **시간 복잡도**: 입력 크기가 커질 때 계산량이 어떤 비율로 늘어나는지 나타내는 표기다.
- **컨텍스트 창**: 모델이 한 번의 응답을 만들 때 참고할 수 있는 입력과 출력의 전체 범위다.
- **context rot**: 컨텍스트가 길어질수록 모델이 정보를 정확히 찾고 사용하는 능력이 낮아지는 현상이다.
- **프롬프트**: 모델에 보내는 질문, 지시, 자료를 포함한 입력이다.
- **XML 태그**: `<이름>`과 `</이름>`으로 구간의 시작과 끝을 표시하는 표기다.
- **기계 번역**: 한 언어의 글을 다른 언어로 자동 변환하는 작업이다.
- **에이전트**: 목표를 받아 계획하고 도구를 사용하며 여러 단계를 수행하는 AI 시스템이다.

# 참고 자료

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Transformer 원 논문
- [Attention Is All You Need HTML](https://arxiv.org/html/1706.03762v7) — Attention 식, 멀티헤드 어텐션, 위치 인코딩, 인코더와 디코더, 계산량 관련 논문 본문
- [Claude Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows) — 컨텍스트 창과 context rot 설명
- [Anthropic Glossary](https://platform.claude.com/docs/en/about-claude/glossary) — 컨텍스트 창과 자기회귀 언어 모델 관련 용어
- [Claude Models overview](https://platform.claude.com/docs/en/models/overview) — 현재 모델과 컨텍스트 창 정보
- [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) — 긴 자료 배치, XML 구분, 인용 활용 방법
- [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) — 긴 컨텍스트와 정보 선택에 관한 Anthropic 글
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — Claude Code의 컨텍스트 관리 방법


