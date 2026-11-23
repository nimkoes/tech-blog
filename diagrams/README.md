# 본문 도식 (SVG)

블로그 본문 도식을 손으로 작성한 SVG 로 다시 그릴 때 쓰는 규칙과 생성 스크립트.

- 결과물: `public/resources/images/<주제>/redraw/NNNN-XX.svg` (원본 `NNNN-XX.png` 와 같은 번호)
- 대부분의 SVG 는 파일을 직접 고친다. 스크립트로 만드는 것은 아래 표에 있는 것뿐이다.

| 스크립트 | 만드는 파일 | 실행 |
|---|---|---|
| `kubernetes/gen_0013_pod_lifecycle.py` | `0013-01`, `0013-04` ~ `0013-23` | `python3 diagrams/kubernetes/gen_0013_pod_lifecycle.py` |

`0013-04` ~ `0013-23` 은 완성도 한 장이 단계별로 쌓이는 그림이라 좌표를 스크립트에 한 번만 정의한다. 이 파일들은 SVG 를 직접 고치지 말고 스크립트를 고친 뒤 다시 생성한다.

## 폰트 넣기 (그림을 만들거나 고친 뒤 마지막에 반드시 실행)

`<img>` 로 넣은 SVG 는 페이지의 웹폰트를 쓸 수 없다. 사이트와 같은 폰트(Pretendard, JetBrains Mono)로 보이도록
그림에 쓰인 글자만 잘라 SVG 안에 넣는다. 다시 실행해도 결과가 같으므로 그림을 고칠 때마다 돌리면 된다.

```sh
pip install fonttools brotli          # 최초 1회
npm ci                                # node_modules 의 폰트를 쓴다
python3 diagrams/embed_fonts.py       # 전체. 파일이나 폴더를 인자로 주면 그것만
```

SVG 를 직접 고칠 때는 `<style id="embedded-fonts">` 블록은 건드리지 말고 그림 부분만 고친 뒤 위 명령을 다시 실행한다.

## 확인 방법

```sh
xmllint --noout <file>.svg
rsvg-convert -w 1000 <file>.svg -o /tmp/check.png   # 원본과 나란히 보고 비교
```

원본 정보(객체, 관계, 라벨, 숫자, 화살표 방향)가 하나도 빠지지 않았는지, 글자 넘침·겹침·잘림이 없는지, 화살촉이 상자에 가려지지 않았는지 본다.
`rsvg-convert` 는 SVG 안에 넣은 폰트를 쓰지 않으므로, 글자 폭은 브라우저에서 SVG 를 직접 열어 최종 확인한다.

## 스타일 규칙

기준 파일: `public/resources/images/kubernetes/redraw/0006-02.svg`. 애매하면 이 파일을 열어 그대로 따른다.

### 캔버스
- `<svg xmlns width=W height=H viewBox="0 0 W H">`, W 는 보통 640~760, 여러 패널이면 1000 안팎
- 첫 요소: `<rect width=W height=H rx="16" fill="#f8fafc"/>` (다크 모드에서도 밝은 카드로 보이게)
- 여백 20px 이상
- 루트 font-family: `'Pretendard','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif` (embed_fonts.py 가 넣는 Pretendard 가 쓰인다)
- IP·포트·명령어·YAML 값: `font-family="'JetBrains Mono',Menlo,monospace"`
- 외부 폰트/이미지/스크립트 참조 금지, 단일 파일 자급

### 글자
- 객체 이름 14~15 bold, 일반 13, 보조 12 (12 미만 금지). 본문 #334155, 진한 제목 #0f172a, 흐린 #64748b
- 원본 글자는 그대로 옮기되 오타·맞춤법만 바로잡는다

### 객체 색
| 객체 | 모양 | 채움 | 테두리 | 글자 |
|---|---|---|---|---|
| Cluster | rx14 점선 | #eef2ff | #a5b4fc dasharray 6 4 | 라벨 #4338ca bold |
| Node | rx12 | #f1f5f9 | #94a3b8 | #334155, IP 는 #475569 mono |
| Pod | rx12 | #22c55e | 없음 | 흰색, 보조 #dcfce7 |
| Container / App | rx10 | #ffffff | #22c55e | #15803d |
| Service | rx12 | #0ea5e9 | 없음 | 흰색, 보조 #e0f2fe |
| Load Balancer | rx12 | #0369a1 | 없음 | 흰색, 보조 #e0f2fe |
| Controller 류 (ReplicaSet, Deployment, DaemonSet, Job …) | rx12 | #f97316 | 없음 | 흰색, 보조 #ffedd5 |
| 저장소 (Volume, PV, PVC) | rx12 | #8b5cf6 | 없음 | 흰색, 보조 #ede9fe |
| 설정 (ConfigMap, Secret) | rx12 | #eab308 | 없음 | #422006 |
| Namespace | rx14 점선 | #fefce8 | #facc15 | #a16207 bold |
| 외부/사용자/클라이언트 | 알약 | #ffffff | #94a3b8 | #334155 |
| 메모/설명 | rx10 | #ffffff | #cbd5e1 | 제목 #0f172a bold, 항목 "· " |
| 포트·라벨 칩 | 알약 h22 | #ffffff | 해당 객체색 1.5px | 해당 객체 진한색, mono, ":9000" |
| 상태 강조 (Running 등) | rx6 | #bbf7d0 | 없음 | #166534 bold |
| 실패/오류 | — | #fee2e2 | #ef4444 | #b91c1c |
| 기타 박스 | rx10 | #ffffff | #cbd5e1 | #334155 |

- 원본이 색으로 구분하던 범주 (A/B/C, 서비스 타입별 등) 는 순서대로 #3b82f6, #f97316, #8b5cf6, #22c55e, #ec4899
- 단계 번호 태그 (1-1, 2-1 …): 객체 왼쪽 위 바깥에 12px bold #64748b

### 시리즈 안에서 정한 약속
- 버전: v1 은 파랑 #3b82f6, v2 는 주황 #f97316 (원본 색이 그림마다 달라도 통일)
- Taint 는 보라, Toleration 은 연한 주황. 짝은 색이 아니라 같은 key/value 글자로 보여준다
- Pod 단계 (chap.12): Pending 파랑, Running 초록, Succeeded 주황, Failed 빨강, Unknown 회색
- 단계별로 쌓이는 그림은 이전 단계 대비 새로 생기거나 바뀐 것만 #f59e0b 2.5px 테두리로 강조

### 선/화살표
- 기본: stroke #64748b 2px, marker `<path d="M0 1L9 5L0 9z">` (viewBox 0 0 10 10, refX 9, markerWidth 7)
- 꺾은선 (H/V) 우선, 곡선은 의미상 필요할 때만
- 화살표는 상자보다 나중에 그려서 화살촉이 가려지지 않게 한다
- 차단/불가: 점선 #94a3b8 + 흰 원 (r12, #ef4444 2px) 안 X
- 삭제/장애 표시 X: #ef4444 2.4px

### 아이콘
- 상표 로고 (AWS, GCP, Azure, Docker, Kubernetes 등) 는 그리지 않고 알약 텍스트 배지로
- 사람·서버·DB 등은 #334155 단색 기하 도형으로 단순하게

### 범위
- 장식 (그림자, 그라디언트, 3D, 클립아트) 은 버리고 정보만 옮긴다
- 화면 캡처 (터미널, 대시보드, 코드) 는 그리지 않는다. 코드는 본문 코드 블록으로 충분하다
- 원본 내용이 틀려 보이면 그림만 고치지 말고 본문과 함께 확인한다
