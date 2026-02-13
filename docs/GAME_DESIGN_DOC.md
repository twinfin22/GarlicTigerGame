# Garlic Tiger — 게임 설계 문서 v2.0

## 컨셉 한 줄 요약

단군신화에서 포기한 호랑이가 4000년 만에 재도전 — 현대 한국 문화를 체험하며 마늘을 모아 한국인이 된다.

---

## 1. 스토리

### 오프닝 시퀀스

화면이 어둡다. 텍스트가 한 줄씩 나타난다:

> 옛날 옛적, 곰과 호랑이에게 기회가 주어졌다.
> Long ago, a bear and a tiger were given a chance.
>
> 마늘과 쑥을 먹고 100일을 버티면, 인간이 될 수 있다고.
> Eat garlic and mugwort for 100 days, and you shall become human.
>
> 곰은 해냈다.
> The bear made it.
>
> 호랑이는... 포기했다.
> The tiger... gave up.

(잠시 정적)

> ...4000년이 지났다.
> ...4000 years have passed.

화면 전환 — 현대 서울 풍경 (픽셀아트). 호랑이가 서울 거리 한쪽에 서있다.

> 호랑이는 여전히 바깥에서 한국을 바라보고 있다.
> The tiger is still watching Korea from the outside.
>
> 이번에는 포기하지 않겠다. 다시 도전한다.
> This time, no giving up. Time to try again.
>
> 한국인처럼 행동하면, 마늘이 모인다.
> Act like a Korean, and the garlic will come.
>
> 마늘 5개를 모으면... 드디어 한국인이 될 수 있다.
> Collect 5 garlics... and finally become Korean.

### 스토리 프레임

- 호랑이 = 한국에 관심 있는 외국인 (플레이어 자신)
- 마늘 = 한국 문화를 이해했다는 증거 (단군신화 상징)
- "한국인처럼 행동할 때마다" 마늘 1개 획득
- 5개 모으면 변환 완성 → 한국인이 됨

### 핵심 감정

"한국 좋아하는데 나는 아직 밖에 있는 사람" → 게임을 통해 "안쪽"으로 들어가는 경험

---

## 2. 퀴즈 & 변환 단계

### 퀴즈 순서

모든 대사는 **한영 병기**. NPC는 한국어로 말하고, 아래에 영어 번역이 나온다.

---

#### 퀴즈 1: 식당 아줌마 — "내가 쏠!"

**장소**: 식당 (오버월드에 식당 건물 타일)

**NPC**: 곱슬 파마, 앞치마, 물티슈로 테이블 치는 아줌마

**대화**:
> 아이고~ 반찬 3번이나 리필했으면서!
> Aigoo~ You ate everything! Even the side dishes I refilled 3 times!
>
> *테이블 탁!*
> *slaps wet rag on table*
>
> 6명이서 총 45,000원이야.
> 45,000 won total. Six of you ate.

**질문**:
> 자, 누가 낼 거야?
> So... who's paying?

**선택지**:
- A: 카카오페이로 1/N 하자 / Let's split it equally on KakaoPay
- B: 나는 내가 먹은 것만 낼게... / I'll just pay for what I ordered...
- C: 내가 쏠! / I got this one!

**정답**: C

**오답 피드백**:
> 아이고~ 더치페이? 한국에서는 누가 한 턱 내! 다음에 걔가 쏘면 돼. 그게 정이야!
> Aigoo~ Splitting the bill? In Korea, someone always treats! They'll get you back next time. That's how 정 works!

**정답 피드백**:
> 이게 바로 한국식이지! "내가 쏠" 문화가 한국인의 깊은 우정을 만드는 거야.
> That's the spirit! 내가 쏠 culture is how Koreans build deep friendships!

**변환 1: 목/척추 부드러워짐**
> 뭐야?! 호랑이의 목이... 부드러워지고 있다?!
> What?! The tiger's neck... is getting flexible?!
>
> 이제 하루에 20번이고 고개를 숙일 수 있다!
> Can now bow 20 times a day with ease!

**게임플레이 영향**: 이후 NPC 근처를 지나갈 때 호랑이가 자동으로 꾸벅 인사하는 이펙트. 말풍선에 "꾸벅!" 표시.

---

#### 퀴즈 2: 엘리베이터 — 빨리빨리

**장소**: 아파트 건물 (오버월드에 아파트 타일)

**NPC**: 없음 (상황 자체가 퀴즈)

**대화**:
> *엘리베이터에 탔다.*
> *You step into the elevator.*
>
> *1초가 지났다. 문이 안 닫힌다.*
> *1 second passes. The door hasn't closed.*
>
> *2초가 지났다. 아직도 안 닫힌다.*
> *2 seconds pass. Still open.*

**질문**:
> 다음으로 해야 할 일은?
> What do you do next?

**선택지**:
- A: 기다린다. 자동으로 닫히겠지. / Wait. It'll close automatically.
- B: 닫힘 버튼을 한 번 누른다. / Press the close button once.
- C: 닫힘 버튼이 닳아 없어질 때까지 연타한다. / Mash the close button until it wears out.

**정답**: C

**오답 피드백**:
> 한국에서 2초는 영원이야. 빨리빨리! 그 닫힘 버튼은 닳으라고 있는 거야!
> In Korea, 2 seconds is an eternity. 빨리빨리! That close button exists to be worn out!

**정답 피드백**:
> 빨리빨리 정신 완벽! 한국 엘리베이터 닫힘 버튼은 세계에서 가장 많이 눌리는 버튼이야.
> Perfect 빨리빨리 spirit! Korean elevator close buttons are the most pressed buttons in the world.

**변환 2: 털 빠짐**
> 뭐야?! 호랑이의 털이... 빠지고 있다?!
> What?! The tiger's fur... is falling out?!
>
> 피부가 점점 매끈해진다...
> The skin is getting smoother...

**게임플레이 영향**: 호랑이 스프라이트가 매끈해짐 (줄무늬 감소). 이동 속도 약간 빨라짐 (빨리빨리 체질).

---

#### 퀴즈 3: 지하철 할머니 — 어르신 공경

**장소**: 지하철역 입구 (오버월드에 지하철 타일)

**NPC**: 북한산 등산 풀장비 (선바이저, 조끼, 등산 스틱), 주머니에 귤

**대화**:
> *2호선 출퇴근 시간. 만원 지하철.*
> *Line 2, rush hour. Packed subway.*
>
> *등산복 풀장비 할머니가 옆에 서신다.*
> *An ajumma in FULL hiking gear stands next to you.*
>
> *큰 한숨* 요즘 젊은 것들...
> *LOUD sigh* 요즘 젊은 것들... (These days, young people...)

**질문**:
> 할머니가 너를 쳐다보고 계신다. 어떻게 할래?
> She's eyeing you. What do you do?

**선택지**:
- A: 눈 피하고 자는 척한다 / Avoid eye contact, pretend to sleep
- B: 이어폰 끼고 K-pop 볼륨 올린다 / Put on headphones, turn up the K-pop
- C: 할머니, 짐 들어드릴까요? / Excuse me, halmeoni. Can I help you with your bag?

**정답**: C

**오답 피드백**:
> 할머니가 널 시험하고 있었어! 한국에서 어르신을 먼저 도와드리는 건 정말 존경받는 행동이야. 공짜 귤 기회를 놓쳤다!
> She was testing you! In Korea, proactively helping elders is deeply respected. You missed a free tangerine!

**정답 피드백**:
> 할머니가 주머니에서 귤을 꺼내 주신다. 이건 최고의 영예야. 한국 할머니에게 입양당했다!
> She hands you a tangerine from her pocket. This is the highest honor. You've been adopted by a Korean grandma!

**변환 3: "TH" 발음 불가**
> 뭐야?! 호랑이의 혀가... 변하고 있다?!
> What?! The tiger's tongue... is changing?!
>
> "Three" → "Seuree"
> "Think" → "Sink"
>
> 이제 TH 발음이 안 된다!
> Can no longer pronounce "TH"!

**게임플레이 영향**: 이후 영어 텍스트에서 "th"가 자동으로 "s"로 바뀜. 예: "the" → "se", "that" → "sat". 가끔 말풍선에 "...seuree?" 표시. NPC들이 호랑이의 변한 발음에 반응.

---

#### 퀴즈 4: 치킨집 — 눈치

**장소**: 치킨집 (오버월드에 치킨집 타일)

**NPC**: 친구들 (여러 명이 테이블에 앉아있음)

**대화**:
> *치맥 중. 치킨 한 마리가 거의 끝났다.*
> *Chimaek in progress. The chicken is almost gone.*
>
> *접시에 마지막 한 조각이 남아있다.*
> *One last piece sits on the plate.*
>
> *아무도 손을 대지 않는다.*
> *Nobody touches it.*
>
> *...*
> *...*
>
> *여전히 아무도 안 먹는다.*
> *Still, nobody eats it.*

**질문**:
> 마지막 한 조각. 어떻게 할래?
> The last piece. What do you do?

**선택지**:
- A: 맛있게 먹는다! 아까우니까. / Eat it! Can't let it go to waste.
- B: "아 나 배불러~" 하면서 안 먹는다. / "아 I'm so full~" and don't eat it.
- C: "야 너 먹어" 하고 남한테 양보한다. / "Here, you eat it" and offer to someone.

**정답**: B

**오답 피드백**:
> 눈치 실패! 한국에서 마지막 한 조각은 아무도 안 먹어. "배부르다"고 하면서 다 같이 남기는 게 예의야. 그 치킨은 영원히 접시 위에 남는 거야.
> 눈치 fail! In Korea, nobody eats the last piece. You all say "I'm full" and leave it. That chicken stays on the plate forever.

**정답 피드백**:
> 완벽한 눈치! 마지막 한 조각을 안 먹는 것 — 그게 한국의 미학이야. 너 이제 눈치 레벨: 한국인.
> Perfect 눈치! Not eating the last piece — that's the Korean aesthetic. Your 눈치 level: Korean.

**변환 4: 팔다리 짧아짐 / 허리 길어짐**
> 뭐야?! 호랑이의 몸 비율이... 변하고 있다?!
> What?! The tiger's body proportions... are changing?!
>
> 팔다리가 짧아지고, 허리가 길어진다!
> Limbs getting shorter, torso getting longer!

**게임플레이 영향**: 호랑이 스프라이트 비율 변화 (짧은 팔다리, 긴 허리). 시각적으로 재밌는 변화.

---

#### 퀴즈 5: 친구 — 한국어 응답 체계

**장소**: 카페 (오버월드에 카페 타일)

**NPC**: 한국인 친구

**대화**:
> *친구와 카페에서 수다 중*
> *Chatting with a friend at a cafe*
>
> 야, 너 내일 학원 안 가?
> Hey, aren't you NOT going to academy tomorrow?

**질문**:
> 안 간다. 뭐라고 대답해야 할까?
> You're not going. How should you answer?

**선택지**:
- A: 응, 안 가. / Yes, I'm not going. (한국식 / Korean way)
- B: 아니, 안 가. / No, I'm not going. (영어식 / English way)
- C: 음... 아직 모르겠어. / Hmm... not sure yet.

**정답**: A

**오답 피드백**:
> 한국어에서는 상대방 말이 맞으면 "응"이야! "안 가?" → 맞아, 안 가 → "응, 안 가." 영어식으로 "No"라고 하면 한국인은 "아 그럼 간다는 거야?" 하고 헷갈려!
> In Korean, "응" confirms the other person is correct! "Aren't you going?" → Right, I'm not → "응, 안 가." If you say "No" in English style, Koreans get confused: "Oh so you ARE going?"

**정답 피드백**:
> 축하해! 한국어 응답 체계를 완벽하게 이해했어! 이제 네 뇌는 한국어로 작동한다!
> Congrats! You've mastered the Korean response system! Your brain now operates in Korean!

**변환 5: 머리 검정 — 최종 변환 완성**
> 뭐야?! 호랑이의 머리카락이... 까매지고 있다!
> What?! The tiger's hair... is turning jet black!
>
> 변환 완료! 호랑이가 한국인이 되었습니다!
> Transformation complete! The tiger has become Korean!

**게임플레이 영향**: 최종 형태. 스프라이트 완전 변환 — 매끈한 피부, 짧은 팔다리, 긴 허리, 검은 머리, 자동 꾸벅 인사, "th" 발음 불가인 완전체 한국인 호랑이.

---

## 3. 오버월드

### 맵 구성

포켓몬 골드 스타일의 스크롤링 오버월드. 5개 장소가 맵에 배치되어 있고, 플레이어가 직접 찾아가서 NPC와 상호작용한다. (랜덤 인카운터 아님)

**장소 배치**:

```
┌──────────────────────────────────┐
│                                  │
│   [식당]          [아파트/엘베]   │
│     🍚               🏢         │
│                                  │
│          [지하철역]              │
│             🚇                   │
│                                  │
│   [치킨집]          [카페]       │
│     🍗               ☕         │
│                                  │
│        ★ 시작 위치               │
│                                  │
└──────────────────────────────────┘
```

### 장소 사이 요소

퀴즈 사이에 지루하지 않도록 상호작용 가능한 소소한 요소들:

- **표지판**: "성수동 방면 →", "강남 ↓" 등 한국 도로 표지판. 읽으면 한영 병기 텍스트.
- **자판기**: A버튼으로 상호작용하면 바나나맛 우유 이펙트 ("바나나맛 우유 획득!" 메시지)
- **비둘기 떼**: 앞에 가면 흩어지는 이펙트
- **전단지 아줌마**: 지나가면 "전단지요~" 대사 표시
- **편의점**: 들어가면 "삼각김밥의 유혹을 느낀다..." 텍스트

### 이동 & NPC 배치

- NPC는 각 장소 앞에 서있거나 건물 안에 있음
- 건물에 다가가서 A버튼 → 내부 진입 → NPC 대화 → 퀴즈 시작
- 장소 순서는 자유 (어디든 먼저 갈 수 있음)
- 단, 퀴즈 난이도는 순서와 무관 (모두 독립적)
- 클리어한 장소에 다시 가면 NPC가 "이미 마늘을 받았잖아!" 라고 함

### 호랑이 시각적 변화

오버월드에서 퀴즈 클리어할 때마다 호랑이 스프라이트가 점진적으로 변함:
- 0/5: 풀 호랑이 (주황, 줄무늬, 큰 체형)
- 1/5: 목이 유연해짐 + NPC 근처에서 꾸벅 이펙트
- 2/5: 털 감소, 매끈해짐
- 3/5: 말풍선에 "seuree?" 가끔 표시
- 4/5: 비율 변화 (짧은 팔다리)
- 5/5: 검은 머리 완전체

---

## 4. 오답 처리

### 게임오버 없음 — 재도전 가능

오답 선택 시:
1. NPC가 오답 피드백을 준다 (한영 병기, 유머러스하게)
2. "다시 해볼래? / Try again?" 선택지 표시
3. "응!" 선택 → 같은 퀴즈 재시작
4. "나중에..." 선택 → 오버월드로 복귀, 해당 NPC 나중에 다시 방문 가능

### 오답 횟수 기록

- 각 퀴즈별 오답 횟수를 기록
- 엔딩 화면에서 "X번 만에 한국인이 되었다!" 표시
- 0 오답 = "천재 호랑이" 칭호
- 공유 시 오답 횟수도 포함 → "내 호랑이는 7번 틀리고 한국인이 됐다 ㅋㅋ"

---

## 5. 엔딩

### 5/5 클리어 엔딩

**변환 완료 연출** (포켓몬 진화 스타일):
1. 최종 퀴즈 정답 후 → 화면 플래시
2. 호랑이 최종 형태 대형 스프라이트 표시
3. 축하 텍스트:
   > 축하합니다!
   > Congratulations!
   >
   > 호랑이가 한국인이 되었습니다!
   > The tiger has become Korean!

**"내 호랑이" 결과 카드**:
```
┌─────────────────────────┐
│     나의 호랑이           │
│     My Tiger             │
│                          │
│    [최종 호랑이 스프라이트]  │
│                          │
│    한국인화: 5/5 ██████  │
│    Korean Level: 5/5     │
│                          │
│  ✓ 꾸벅 인사 마스터       │
│  ✓ 빨리빨리 체질          │
│  ✓ "Seuree" 발음         │
│  ✓ 눈치 레벨: 한국인      │
│  ✓ 응/아니 완벽 구사       │
│                          │
│  X번 만에 한국인 달성!     │
│                          │
│  [공유하기]  [쿠폰 받기]   │
└─────────────────────────┘
```

**로컬노마드 20% 쿠폰**:
- "쿠폰 받기" 버튼 → 쿠폰 코드 표시 + 로컬노마드 링크
- "이 호랑이가 증명합니다. 당신은 한국인입니다. 🐯"
- 쿠폰은 5/5 클리어한 사람만 받을 수 있음

### 중간 탈락 / 미완료 공유

5/5 미만이어도 언제든 공유 가능:

```
┌─────────────────────────┐
│     나의 호랑이           │
│     My Tiger             │
│                          │
│   [현재 단계 스프라이트]    │
│                          │
│   한국인화: 3/5 ████░░   │
│                          │
│   "TH 발음은 포기했다"    │
│   "Has given up on TH"   │
│                          │
│  [공유하기]  [계속하기]    │
└─────────────────────────┘
```

**단계별 공유 문구**:
- 0/5: "아직 100% 호랑이. 한국은 먼 나라..." / Still 100% tiger.
- 1/5: "고개는 숙일 줄 안다" / At least knows how to bow.
- 2/5: "빨리빨리 체질이 되어가는 중" / Becoming a 빨리빨리 person.
- 3/5: "TH 발음은 포기했다" / Has given up on TH.
- 4/5: "거의 한국인인데... 아직 1개 남았다" / Almost Korean... one more to go.
- 5/5: "호랑이에서 한국인이 되었습니다 🐯" / Tiger → Korean. Complete.

### 바이럴 루프

```
실패한 호랑이 공유 (웃김) → 친구 클릭 → 게임 시작 → 본인도 공유
                                                        ↓
성공한 호랑이 공유 (자랑) → 친구 클릭 → "나도 해볼게" → 클리어 → 쿠폰
```

- 실패가 오히려 더 바이럴 (3/5 "TH 포기" 호랑이가 5/5보다 웃김)
- 친구: "ㅋㅋ 뭐야 이거" → 게임 진입
- 쿠폰은 5/5만 → 끝까지 플레이 동기 부여

---

## 6. 전체 흐름 요약

```
Boot (로고)
  ↓
Title (GARLIC TIGER — Press Start)
  ↓
Intro (단군신화 오프닝 — 한영 병기)
  ↓
Overworld (서울 맵 — 5개 장소 탐색)
  ├→ 장소 1: 식당 → 퀴즈 1 → 변환 1 (꾸벅)
  ├→ 장소 2: 아파트 → 퀴즈 2 → 변환 2 (털 빠짐)
  ├→ 장소 3: 지하철역 → 퀴즈 3 → 변환 3 (TH 불가)
  ├→ 장소 4: 치킨집 → 퀴즈 4 → 변환 4 (비율 변화)
  ├→ 장소 5: 카페 → 퀴즈 5 → 변환 5 (검은 머리)
  ├→ (미니 이벤트: 표지판, 자판기, 비둘기, 전단지)
  ↓
5/5 달성 시 → Victory (변환 완료 연출)
  ↓
결과 카드 (내 호랑이 상태 + 공유)
  ↓
쿠폰 (로컬노마드 20% 할인)
```

---

## 7. 기술 참고

- 해상도: 160×144 (GBC) → CSS 정수배 스케일링
- 모든 대사: 한영 병기 (한국어 먼저, 영어 아래)
- 폰트: Press Start 2P
- 대화창: 포켓몬 골드 스타일 (하단 32px, 2줄)
- 배틀/퀴즈 화면: 포켓몬 골드 배틀 레이아웃
- 사운드: Web Audio API (8-bit 스타일)
- 배포: Vercel
- 쿠폰: 클리어 시 코드 발급 or 링크 제공
