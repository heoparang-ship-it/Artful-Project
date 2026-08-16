# 캐릭터 작화 프롬프트 팩 (재작화용)

> 근거: [아트 발주서 2.7 작화 규격](../02_발주서/ART-RFP-FINAL-FINAL-D7.md) · [인물 성격 캐논 v2](../01_기획서/CHARACTER-CANON-V2.md) · [아트 1차 검수 보고](./ART-REVIEW-01.md)
> 용도: 이미지 생성 AI 프롬프트 및 작화 지시서. 그대로 복사해 사용한다.
> **주의**: 생성형 AI 산출물의 **직접 납품은 금지**(발주서 2.5-2)다. 본 팩은 컨셉·프리비즈·방향 합의용이며, 최종 납품 에셋은 작가의 작업물이어야 하고 AI 보조 사용 시 도구·구간을 고지한다.

---

## 0. 공통 스타일 블록 (모든 프롬프트에 그대로 붙인다)

```
STYLE RULES (strict, non-negotiable):
- Japanese seinen manga TV-anime style. Flat cel shading ONLY: one base tone
  plus one hard-edged shadow tone. NO gradients, NO airbrush blending,
  NO rim light, NO bloom, NO glossy highlights on skin or hair.
- Thick hand-inked linework with uneven tapering weight and visible brush
  pressure. Outer contour heavier than interior detail lines.
- Muted desaturated palette: dull grey-browns, washed navy, sickly
  fluorescent green-grey. At most one or two saturated accents in frame.
- Face: realistic adult proportions, plain and unglamorous. Narrow
  heavy-lidded eyes, SMALL flat pupils with NO catchlight sparkle, visible
  dark under-eye shadows, slightly asymmetric ordinary features, plain
  haircut with no glossy streaks. DEADPAN blank expression as default.
- Ordinary rumpled real clothing with natural creases and wear.
  NO tactical belts, pouches, buckles or gadget straps.
- Static, matter-of-fact composition under flat ordinary office lighting.
  Subtle film grain over the whole image.
- Full body, plain neutral background (no scenery), character sheet style.

AVOID ENTIRELY: glossy digital airbrush, idealized handsome/pretty face,
big sparkling eyes, dramatic rim lighting, dynamic heroic pose, saturated
cinematic color grading, revealing or sexualized clothing, real-world brand
logos or their parodies, webtoon clipart look with uniform vector lines.
```

**한글 요약(작가 지시용)**: 세이넨 만화 원작 TV 애니 작화. 플랫 셀 2톤·하드 엣지, 그라데이션/에어브러시/림라이트/광택 금지. 붓압 있는 잉크선(굵기 불균일). 저채도, 고채도는 화면당 1~2점만. 얼굴은 성인 실비율·평범·눈 반짝임 없음·눈 밑 그늘·기본 무표정. 평범하고 낡은 옷, 택티컬 장식 금지. 정적 구도 + 필름 그레인. 배경 없음.

---

## 1. 허파랑 — 대표 / 크리에이티브 프로듀서

**컨셉 한 줄**: 사소한 것까지 전부 화면에 묻는 사람. 토큰이 떨어지면 스스로 결정하지 못한다.

```
[공통 스타일 블록을 여기에 붙인다]

CHARACTER:
A Korean man in his late 30s, head of a tiny five-person video production
company. Full body, standing, character sheet pose.

- Build: average, slightly slumped from long hours. Not heroic.
- Face: tired and matter-of-fact. Narrow heavy-lidded eyes, small flat
  pupils, no sparkle. Visible dark under-eye shadows. Plain slightly messy
  hair, faint stubble. Round Leon-style glasses with thin metal frames.
  Default expression is deadpan, but the EYEBROWS are raised slightly —
  the face of a man who is certain, on a body that is exhausted.
- Clothing: a sporty short-sleeve tee in a WASHED, DESATURATED lime tone
  (faded, chalky — NOT neon, NOT vivid), plain worn blue jeans, ordinary
  sneakers. Natural creases, lived-in.
- SIGNATURE PROP (must be present): he holds a tablet in one hand at all
  times, screen turned slightly outward toward the viewer. On the screen,
  a 2x2 grid of four small generated thumbnail images. A thin notification
  banner sits along the top edge of the tablet screen.
- Secondary: a thick wad of sticky notes covered in handwriting, clipped to
  the tablet case or sticking out of a pocket.
- Silhouette read: one hand always holding a screen, the other mid-gesture
  — reads as "a man showing you something" in black silhouette alone.
```

**작화 체크**: 태블릿이 없으면 불합격(AC-PSN-01). 형광색은 반드시 채도를 낮춘 계열로(2.7-4). 안경은 캐릭터 식별 요소이므로 전 에셋에 유지.

---

## 2. 이영림 — 콘텐츠 기획 / 스토리·브랜드 디렉터

**컨셉 한 줄**: 낮엔 기획자, 밤엔 자기 채널. 두 개의 삶을 하루에 접어 넣는 사람. 5인 중 유일하게 자세가 무너지지 않는다.

```
[공통 스타일 블록을 여기에 붙인다]

CHARACTER:
A Korean woman in her late 20s, content planner at a small video production
company who also runs her own channel after hours. Full body, standing,
character sheet pose.

- Build: ordinary. Posture is the point — she stands straight with squared
  shoulders and a wide stance while everyone around her is slouching.
  She is the only one in the team whose posture never collapses.
- Face: plain and ordinary, NOT glamorous. Narrow heavy-lidded eyes, small
  flat pupils, no catchlight, faint under-eye shadows. Plain practical
  haircut. Default deadpan, but the OUTER ENDS OF HER EYEBROWS sit slightly
  raised — a permanently optimistic resting face.
- CLOTHING (the key design idea — a deliberate top/bottom mismatch):
  UPPER BODY is put together for being on camera — a clean pressed blouse
  or neat knit in a muted tone, collar straightened.
  LOWER BODY is comfortable work-from-the-floor wear — worn loose
  sweatpants or track bottoms, and plain slippers or beaten sneakers.
  The contrast is hidden when seated and revealed when standing.
  Fully covered, workplace-appropriate, NOT revealing.
- SIGNATURE PROPS (must be present): TWO bags — a work backpack on her back
  and a small shooting pouch slung across her body. Around her neck hang
  BOTH a company lanyard ID and a small clip-on microphone.
- Secondary: a folded ring light under one arm, a selfie stick handle
  sticking out of the pouch, two phones (one in hand, one in a pocket),
  two power banks.
- Silhouette read: two bags plus two things around the neck — reads as
  "someone carrying two jobs at once" in black silhouette alone.
```

**작화 체크**: 상·하반신 대비가 앉은 컷에서는 숨겨지고 선 컷에서 드러나야 한다(AC-PSN-08). 노출 있는 복장·신체 강조는 발주서 2.5-5 위반으로 즉시 반려. 가방 둘과 목의 두 물건이 없으면 불합격.

---

## 3. 이혜미 — 제작 PM / 운영·리서치·납품 QA

**컨셉 한 줄**: 팀에서 가장 먼저 아는 사람. 남들이 못 보는 걸 보고, 혼자 감당하다 터진다.

```
[공통 스타일 블록을 여기에 붙인다]

CHARACTER:
A Korean woman in her early 30s, production manager at a small video
production company. Full body, standing, character sheet pose.

- Build: the LONGEST and LEANEST silhouette of the five — tall, long limbs,
  so her gestures read large even in black silhouette. Her SHOULDERS SIT
  SLIGHTLY RAISED, a permanent low-grade tension.
- Face: sharp and alert but plain and ordinary — not pretty, not ugly.
  Narrow heavy-lidded eyes, small flat pupils, no catchlight, clear dark
  under-eye shadows. Hair always in a messy, hastily tied-up bun with
  loose strands escaping.
  DEFAULT EXPRESSION IS DEADPAN — NOT angry, NOT annoyed. The only marker
  is ONE VERTICAL CREASE between her eyebrows, always present. The face of
  someone perpetually one second before speaking and holding it in.
- Clothing: a plain black fitted short-sleeve tee, plain black skinny jeans,
  simple office slippers with NO brand marking or logo of any kind.
  A small black clover-shaped pendant on a thin chain.
- SIGNATURE PROPS (must be present): a handheld LABEL PRINTER held or
  clipped at her hip, and a clipboard covered in colored index tabs.
- Secondary: a checklist thick with sticky tabs, a lanyard.
- Silhouette read: tallest and thinnest outline, raised shoulders, label
  printer at the hip.
```

**작화 체크**: 기본 표정을 '짜증'으로 그리면 2.7-3 위반(AC-STY-04). 감정은 별도 '폭발' 차분에서만 드러내며, 그 차분은 반드시 '미안해함' 차분과 세트로 제작한다(AC-PSN-07). 신발에 실존 브랜드·패러디 표기 금지(2.5-6). **라벨 프린터는 버릇 동작과 밤 연출까지 걸린 핵심 소품이라 누락 시 3개 채널이 동시에 무너진다.**

---

## 4. 손미림 — 비주얼 디렉터 / 촬영·편집

**컨셉 한 줄**: 멀쩡해 보이는데 속이 전부 헤비메탈. 다 받아주면서 시간표는 칼같다.

```
[공통 스타일 블록을 여기에 붙인다]

CHARACTER:
A Korean woman in her late 20s, visual director (camera and editing) at a
small video production company. Full body, standing, character sheet pose.

- Build: ordinary, slightly rounded and compact outline. Short stride stance.
- Face: plain and ordinary with a gentle cast. Narrow heavy-lidded eyes,
  small flat pupils, NO catchlight sparkle, faint under-eye shadows.
  Neat chin-length bob haircut. Default deadpan, but the CORNERS OF HER
  MOUTH turn up very slightly. Her cuteness must come ONLY from the rounded
  silhouette, short stance and mouth line — never from big or shiny eyes.
- CLOTHING (the key design idea — a hidden layer):
  She is THE ONLY ONE OF THE FIVE WHO IS PROPERLY DRESSED. A crisp
  well-fitted shirt, sleeves neatly rolled, tucked into clean tailored
  trousers, proper shoes. Everything pressed and coordinated while the rest
  of the team is rumpled.
  UNDERNEATH, a black band tee is layered — only a SLIVER of its harsh
  graphic print shows at the open collar. It must be easy to miss.
  Do NOT put a large visible metal logo on the outer shirt.
- SIGNATURE PROPS (must be present): a compact camera in one hand,
  over-ear headphones resting around her neck, and a weekly planner ruled
  into fine time blocks with color tabs, tucked under one arm.
- Secondary: safety pins on a lapel, a tiny travel steamer clipped to a bag.
- Silhouette read: the only tidy, fully-coordinated outline among five
  scruffy ones — a viewer should pick her out instantly as "the one who is
  actually dressed".
```

**작화 체크**: 로고를 크게 드러내면 "아무도 눈치채지 못하는 반전"이 죽는다. 큰 카고·가방바지는 "유일하게 갖춰 입은 실루엣"과 정반대라 AC-PSN-06을 구조적으로 통과할 수 없다. 헤비메탈은 목깃 사이 밴드 티 + 모니터 뒤 스티커 + 편집 중 발박자(애니메이션) + 헤드폰 누설음(사운드)으로 분산한다.

---

## 5. 김신입 (플레이어) — 신입 AP / 제작 코디네이터

**컨셉 한 줄**: 파트 사이에서 누락되는 것을 연결하는 사람. 하루가 갈수록 소지품이 늘어난다.

```
[공통 스타일 블록을 여기에 붙인다]

CHARACTER:
A young Korean person in their mid-20s, brand-new assistant producer at a
small video production company, three months into the job. Full body,
standing, character sheet pose. Gender-neutral read is acceptable.

- Build: small and compact next to the others, slightly hunched under the
  weight of what they are carrying.
- Face: plain, young, tired. Narrow heavy-lidded eyes, small flat pupils,
  no catchlight, under-eye shadows already forming. Plain cheap haircut.
  Default deadpan with a faint braced quality — someone waiting to be
  handed one more thing.
- Clothing: an oversized cheap jacket that does not fit well, plain shirt
  underneath, plain trousers, worn sneakers. Everything slightly too big.
- SIGNATURE PROP (the character's whole idea): CABLES AND BAGS ACCUMULATE
  ON THEM. Coiled cables over one shoulder, a tote bag, a shoulder bag, a
  slate tucked under one arm, an SSD and card reader clipped to a belt loop
  by a carabiner. The load should look like it grew by accident, not like
  designed tactical gear.
- A company lanyard ID hangs at their chest, the newest and cleanest object
  on their whole body.
- Silhouette read: a small figure buried under other people's equipment.
```

**작화 체크**: 5인째다. 이 캐릭터가 없으면 시트 5식·초상 22점 물량이 성립하지 않는다. 사원증만 유일하게 깨끗한 대비가 신입의 핵심 표현.

---

## 6. 5인 라인업 프롬프트 (실루엣 테스트용)

캐릭터 시트 승인 시 **5인을 나란히 놓고 판정**한다(AC-CHR-03·AC-PSN-06). 라인업 이미지를 별도로 만든다.

```
[공통 스타일 블록을 여기에 붙인다]

Five Korean coworkers of a small video production company standing in a
flat, static line-up facing the viewer, full body, evenly spaced, plain
neutral background. Deadpan expressions, awkward stillness.

Left to right:
1. Late-30s man, round Leon-style glasses, desaturated lime tee and jeans,
   holding a tablet turned outward with a 2x2 grid of thumbnails.
2. Late-20s woman, squared shoulders and upright posture, neat blouse on
   top and loose track bottoms below, two bags, lanyard AND clip mic at
   her neck, folded ring light under one arm.
3. Early-30s woman, tallest and leanest, raised shoulders, messy tied-up
   bun, all black tee and skinny jeans, one vertical crease between the
   brows, label printer at her hip and a tab-covered clipboard.
4. Late-20s woman, the ONLY properly dressed one — crisp shirt, tailored
   trousers, neat bob, headphones around her neck, camera in hand, a fine
   ruled planner under her arm, a sliver of a black band tee visible at
   her open collar.
5. Mid-20s newcomer, small and compact, oversized cheap jacket, buried
   under coiled cables and bags, a slate under one arm, the cleanest
   lanyard of the five.

The contrast between #4 (put together) and the other four (rumpled) must
read at a glance.
```

**판정 기준**: 이 이미지를 흑백 실루엣으로 변환했을 때, 판정단 3인 중 2인 이상이 ① 5인을 서로 구분하고 ② 4번을 "유일하게 갖춰 입은 인물"로 지목하면 합격.

---

## 7. 재작화 시 반드시 피할 것 (1차 검수 반려 사유)

| # | 항목 | 사유 |
|---|---|---|
| 1 | 노출 복장·신체 강조 | 발주서 2.5-5 — 인물은 일하는 직업인으로 그린다. 발견 즉시 반려 |
| 2 | 실존 브랜드·패러디 로고 | 2.5-6 — 상표 리스크. 소품 브랜드는 전부 가상 표기 |
| 3 | 기본 표정을 감정으로 고정 | 2.7-3 — 기본은 무표정. 감정은 별도 차분에서만 |
| 4 | 체형을 수치·직접 지시로 기술 | 2.4-2 부칙 ㉯ — 실루엣 언어로만 규정 |
| 5 | 대면적 고채도(형광·핑크) | 2.7-4 — 고채도는 화면당 1~2점. 밤에 REC만 살아 있어야 한다 |
| 6 | 웹툰 클립아트 톤(균일 선·그라데이션) | 2.7-1·2 — 세이넨 애니 작화 문법 |
| 7 | 상시 소품 누락 | AC-PSN-01 — 시트·스프라이트·초상 전 계열에 일관 등장 |
| 8 | 손미림 로고 대노출 / 큰 가방바지 | AC-PSN-06 — 반전 소실 및 실루엣 대비 역전 |

## 8. 다음 단계

1. 위 프롬프트로 **러프 5인 + 키비주얼 1점**을 만든다.
2. 실명 4인이 각자 자기 캐릭터 러프에 **서면 승인**한다(발주서 2.4-4·7.4). 승인 전 완성 시트 착수 금지.
3. 승인 후 M2 1차분: 완성 시트 5식(40컷) · 초상 22점 · 탑다운 스프라이트 60프레임.
4. 비율은 2단 레지스터를 따른다 — 인게임 탑다운 스프라이트는 2.5등신 SD, 초상·카드 일러·키비주얼은 7~7.5등신 실비율(발주서 2.4-1).
