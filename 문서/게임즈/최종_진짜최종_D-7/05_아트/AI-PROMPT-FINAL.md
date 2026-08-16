# 캐릭터 작화 지시서 · 완결본

**이 파일 하나로 작업이 끝나도록 만들었다.** 다른 문서를 열 필요 없다. 발주서·기획서에 흩어져 있던 규격, 금지 조항, 인물 설정, 합격 판정 기준을 전부 이 안에 옮겨 적었다. 참조 링크는 하나도 없다.

- **대상**: 이미지 생성 AI에 지시하는 사람, 그리고 그 결과를 보고 그릴 작가
- **결과물의 지위**: 아래 프롬프트로 생성된 이미지는 **방향 합의용 레퍼런스**다. 생성물을 그대로 납품하는 것은 금지되어 있고(§1 절대 규칙 2번), 최종 납품 에셋은 작가가 그린 것이어야 한다
- **작품명을 프롬프트에 넣지 않는다**: 아래는 전부 화풍의 속성 서술이다. 특정 작품을 지목해 모사시키는 것은 금지 조항이며, 속성 서술 쪽이 결과 통제도 더 정확하다

---

## 목차

| § | 내용 | 누가 읽나 |
|---|---|---|
| 1 | 절대 규칙 — 위반 시 즉시 반려 | 전원 |
| 2 | 마스터 스타일 블록 (복붙용) | 프롬프트 담당 |
| 3 | 작화 해부 — 선·음영·얼굴·색의 수치 | 작가 |
| 4 | 인물 5인 프롬프트 (복붙용) | 프롬프트 담당 |
| 5 | 라인업 프롬프트 (실루엣 판정용) | 프롬프트 담당 |
| 6 | 추가 컷 — 표정 시트 · 밤 버전 · SD 스프라이트 | 프롬프트 담당 |
| 7 | 인물 캐논 — 왜 그런 소품을 드는가 | 작가 |
| 8 | 결과가 어긋날 때 — 증상별 처방 | 프롬프트 담당 |
| 9 | 합격 판정 체크리스트 | 검수자 |
| 10 | 작업 순서 | 전원 |

---

## 1. 절대 규칙 — 위반 시 검수와 무관하게 즉시 반려

다른 항목을 전부 충족해도 아래를 어기면 단독 반려 사유다. 2번·7번은 중대 하자다.

1. **실사 사진·영상의 트레이싱, 실제 인물 초상의 복제 금지.** 등장인물 4인은 실존 인물을 모델로 하지만, 사진을 대고 그리지 않는다
2. **생성형 AI 산출물의 직접 납품 금지.** 컨셉·프리비즈 단계의 AI 보조는 허용하되 사용 도구와 사용 구간을 사전 고지해야 한다. 무고지 사용은 중대 하자
3. **공포 클리셰의 직접 묘사 금지.** 피·상처·신체 훼손, 점프스케어용 귀신 안면 클로즈업, 종교 상징 호러. 이 게임의 공포는 "평범한 화면 하나가 미세하게 틀렸다"로만 표현한다
4. **타 작품과의 실질적 유사 금지.** 특정 애니·게임의 트레이드 드레스 차용, 기존 상용 에셋팩 사용·개변. 프롬프트에 작품명을 넣지 않는 이유가 이것이다
5. **과도한 모에화·선정적 신체 묘사·연령 하향 표현 금지.** 인물은 일하는 직업인으로 그린다. 노출 의상, 신체 강조, 미성년화 전부 해당
6. **실존 브랜드 로고·실제 거래처명·제3자 초상의 화면 내 등장 금지.** 소품의 브랜드는 전부 가상 표기. 명품 브랜드 패러디도 이 조항에 걸린다
7. **크레딧 위반 금지.** 참여 작가를 숨기는 고스트 작업, 재하도급 무고지. 게임 크레딧에는 참여 작가 전원이 실명(또는 본인이 택한 표기)으로 명기된다
8. **낮/밤을 단일 반전·색조회전 필터로 처리하는 제작 방식 금지.** 밤 버전은 별도 작화다

**실명 인물 특약.** 등장인물 4인(허파랑·이영림·이혜미·손미림)은 실존 인물이다. 러프 단계에서 **각자 자기 캐릭터를 서면 승인**해야 후속 공정에 착수한다. 신체 치수·외모 평가·사생활에 해당하는 지시는 문서에 적지 않으며, 아래 인물 서술이 실루엣과 소품 중심인 것은 그 때문이다.

---

## 2. 마스터 스타일 블록

**모든 프롬프트 맨 앞에 이 블록을 그대로 붙인다. 이 블록이 결과의 80%를 결정한다.**

```
2020s seinen manga TV anime art style, hand-drawn animation cel.

LINE: thick hand-inked linework drawn with a brush pen. Line weight is
uneven and tapers at the start and end of each stroke. Outer contour lines
are noticeably heavier than interior detail lines. Single confident strokes,
not redrawn or cleaned up. Some contour lines break and leave gaps on the
lit side.

SHADING: flat cel shading, exactly two tones — one base tone plus one
hard-edged shadow tone. Shadow shapes are angular polygons with sharp
corners, never soft blobs. Absolutely NO gradient, NO airbrush, NO soft
blending, NO rim light, NO bloom, NO specular highlight on skin or hair.
Matte surfaces throughout.

FACE: realistic adult proportions. Plain, ordinary, unglamorous features —
this person looks like a real coworker, not a protagonist. Narrow
heavy-lidded eyes with a thick straight upper eyelid line that overlaps the
iris. Pupils are SMALL and FLAT with NO catchlight and NO sparkle. Lower
eyelid line thin or omitted. Visible dark shadows under the eyes. Eyebrows
thin, low, close to the eyes. Nose reduced to a nostril mark and a short
shadow, no nose bridge line. Mouth is a single thin line. Expression is
DEADPAN and blank by default.

HAIR: broken into 3 to 5 large clumps, not fine strands. One angular shadow
shape inside each clump. Pointed splitting tips. NO glossy highlight bands.

COLOR: muted desaturated palette — dull grey-browns, washed navy, sickly
fluorescent green-grey, sallow skin. Shadow tones shift toward grey-violet
rather than just going darker. At most one or two saturated accent points
in the entire frame.

BODY: 7 to 7.5 heads tall. Narrow shoulders, thin neck, posture slightly
collapsed. Ordinary non-heroic build. Clothing hangs slightly away from the
body with few large fold shapes, short creases only at the joints, natural
wear and sag.

COMPOSITION: static, matter-of-fact, camera at eye level, flat ordinary
indoor lighting, generous negative space. Character sheet framing, full
body, plain neutral background with no scenery.

FINISH: subtle film grain over the entire image, faint paper texture.
```

**네거티브 프롬프트** (지원하는 도구에 입력):

```
glossy, airbrush, gradient shading, soft shading, rim light, bloom, lens
flare, specular highlight, sparkle eyes, big eyes, catchlight, bishonen,
pretty boy, idol, beautiful face, moe, chibi, webtoon, vector art, clean
uniform lines, saturated colors, neon, cinematic color grading, teal and
orange, dynamic action pose, heroic pose, tactical gear, belts, pouches,
cleavage, revealing clothing, swimwear, brand logo, watermark, text,
3d render, photorealistic
```

---

## 3. 작화 해부 — 손으로 그릴 때의 수치

프롬프트는 AI를 위한 것이고, 이 절은 **작가를 위한 것**이다. 같은 목표를 수치로 옮겼다.

### 3.1 선

| 항목 | 규격 |
|---|---|
| 외곽선 굵기 | 1920×1080 기준 **3~5px** |
| 내부 디테일선 굵기 | **1.5~2.5px** — 외곽선의 절반 이하 |
| 굵기 변화 | 한 획 안에서 시작·끝이 가늘어진다(테이퍼). 붓펜 또는 압력 감지 브러시. 균일 굵기 벡터선은 불합격 |
| 획 수 | 한 번에 긋는다. 덧그려 다듬은 흔적, 여러 획을 이어 붙인 윤곽은 불합격 |
| 선 끊김 | 빛을 받는 쪽 윤곽선은 **일부러 끊어 비워둔다**. 닫힌 윤곽으로 전부 감싸지 않는다 |
| 밀도 | 축소했을 때 뭉개지는 과밀 선 금지. 디테일은 선이 아니라 색면으로 처리 |

**예외**: UI 아이콘·테두리 프레임은 축소 시인성을 위해 테이퍼 규정을 완화할 수 있다. 음영·채도·질감 규정은 예외 없다.

### 3.2 음영

| 항목 | 규격 |
|---|---|
| 톤 수 | 베이스 1톤 + 그림자 1톤. **복잡한 부위만 최대 2톤** |
| 경계 | 하드 엣지. 안티에일리어싱 1px 이내. 그라데이션 0 |
| 그림자 형태 | 각진 다각형. 꺾이는 각은 **30°~60° 사이의 예각 위주**, 부드러운 곡선 덩어리 금지 |
| 그림자 색 | 베이스를 어둡게만 하지 않는다. **명도를 내리면서 색상을 회보라 쪽으로 5~15° 회전**시킨다 |
| 금지 | 에어브러시 블렌딩, 인물 윤곽을 따라 흐르는 림라이트, 블룸, 렌즈플레어, 피부·머리카락 광택 하이라이트 |

### 3.3 얼굴

| 항목 | 규격 |
|---|---|
| 비율 | 성인 실비율. 눈 위치는 머리 세로 중앙 |
| 눈 | 가로로 길고 세로로 좁다. **윗눈꺼풀 선이 굵고 곧으며 홍채 상단을 1/4~1/3 덮는다.** 아랫눈꺼풀 선은 얇거나 생략 |
| 동공 | **작고 평평하다. 캐치라이트 없음.** 흰 점 하나도 넣지 않는다 |
| 눈 밑 | 그늘이 항상 보인다 |
| 눈썹 | 얇고 낮게, 눈에 가깝게 |
| 코 | 콧구멍 표시 + 짧은 그림자. **콧대 선을 긋지 않는다** |
| 입 | 단선 1획 |
| 기본 표정 | **무표정(deadpan)**. 감정 과잉 표정은 불합격 |
| 좌우 | 완벽 대칭 금지. 미세한 비대칭을 남긴다 |
| 금지 | 미형·미소년 얼굴, 크고 반짝이는 눈, 이상화된 날카로운 턱선, 보정된 매끈한 피부 |

### 3.4 머리카락

3~5개의 큰 덩어리로 쪼갠다. 가는 가닥 다발 금지. 덩어리마다 각진 그림자 1개. 끝은 뾰족하게 갈라진다. **광택 줄(하이라이트 밴드) 금지.**

### 3.5 색

전반 저채도. 회갈색·탁한 남색·형광등 녹회색 중심.

| 색 | 값 | 지위 |
|---|---|---|
| REC 레드 | `#E2493B` | **발주 확정.** 녹화 표시등 계열, 화면당 최대 1지점 |
| 액센트 옐로 | `#E8B34B` | **발주 확정.** 경고·강조, 화면당 최대 1지점 |
| 피부 베이스 | `#DBBFA8` | 참고 좌표, 작가 조정 가능 |
| 피부 그림자 | `#B29289` | 참고 좌표. 베이스 대비 색상이 보라 쪽 |
| 형광등 벽면 | `#C6C9BE` | 참고 좌표 |
| 사무실 회갈 | `#8A7F73` | 참고 좌표 |
| 탁한 남색 | `#4A5568` | 참고 좌표 |
| 선 색 | `#241F1C` | 순흑(`#000000`) 사용 금지 |

**고채도 총량 제한: 화면당 채도 높은 지점 2개 이하.** 대면적 고채도(예: 형광색 티셔츠 전면, 쨍한 분홍 가방)는 이 규정 위반이다. 시네마틱 틸앤오렌지 그레이딩, 네온 과포화 금지.

### 3.6 질감

전 에셋에 미세한 필름 그레인 또는 종이 질감, **불투명도 3~8%**. 질감 0의 매끈한 디지털 표면 금지. 질감 과다로 축소 시 노이즈 덩어리가 되는 것도 금지.

### 3.7 비율 2단 레지스터

작업물은 두 종류의 비율을 쓴다. 섞지 않는다.

| 레지스터 | 등신 | 쓰이는 곳 |
|---|---|---|
| 실비율 | **7~7.5등신** | 초상, 카드 일러스트, 키비주얼, 캐릭터 시트 — 위 §3.3 얼굴 규격 전면 적용 |
| SD | **2.5등신** | 인게임 탑다운 스프라이트(64×96px) — 축소 시인성 우선, 얼굴은 점·선으로 축약 |

SD에서도 저채도·플랫 셀·실루엣 구분은 유지한다. SD는 **모에화가 아니라 축약**이다.

### 3.8 왜 이렇게 그리는가

이 게임의 인물은 판타지 영웅이 아니라 마감에 시달리는 직업인이다. 얼굴이 잘생겨지고 조명이 극적으로 바뀌는 순간, **낮의 블랙코미디와 밤의 공포가 동시에 죽는다.** 낮의 웃음은 "이 사람들이 진짜 저렇게 생겼고 진짜 저렇게 일한다"에서 나오고, 밤의 공포는 "평범한 화면 하나가 미세하게 틀렸다"에서 나온다. 둘 다 그림이 평범하고 정직할 때만 작동한다.

---

## 4. 인물별 프롬프트

**사용법: [§2 마스터 스타일 블록] + 아래 CHARACTER 블록**, 이 순서로 이어 붙인다. 권장 비율 3:4 또는 2:3.

### 4.1 허파랑 — 대표 / 크리에이티브 프로듀서

```
CHARACTER: A Korean man in his late 30s, head of a five-person video
production company. Full body, standing, character sheet pose.

Build: average, slightly slumped from long hours.
Face: tired and certain at the same time. Round Leon-style glasses with
thin metal frames. Plain slightly messy hair, faint stubble. Deadpan mouth,
but the EYEBROWS are raised slightly — a man who is sure, on a body that is
exhausted. Heavy dark shadows under the eyes.
Clothing: a sporty short-sleeve tee in a WASHED CHALKY LIME tone — faded and
desaturated, absolutely not neon. Plain worn blue jeans, ordinary sneakers.
KEY PROP: he holds a tablet in one hand, screen angled outward toward the
viewer, showing a 2x2 grid of four small thumbnail images and a thin
notification banner along the top edge. His other hand is raised mid-gesture.
Secondary: a thick wad of handwritten sticky notes clipped to the tablet case.
Silhouette read: one hand always holding a screen, the other gesturing —
reads as "a man showing you something" in pure black silhouette.
```

### 4.2 이영림 — 콘텐츠 기획 / 스토리 디렉터

```
CHARACTER: A Korean woman in her late 20s, content planner at a small video
production company who also runs her own channel after hours. Full body,
standing, character sheet pose.

Build: ordinary. POSTURE IS THE POINT — she stands straight with squared
shoulders and a wide stance while everyone around her slouches. The only
person on the team whose posture never collapses.
Face: plain and ordinary, not glamorous. Narrow heavy-lidded eyes, small
flat pupils, no catchlight, faint under-eye shadows. Plain practical
haircut. Deadpan mouth, but the OUTER ENDS OF HER EYEBROWS sit slightly
raised — a permanently optimistic resting face.
CLOTHING — a deliberate top/bottom mismatch: UPPER BODY is put together for
being on camera, a clean pressed blouse in a muted tone with the collar
straightened. LOWER BODY is comfortable floor-work wear, loose worn track
bottoms and beaten sneakers. Fully covered, workplace appropriate.
KEY PROPS: TWO bags — a work backpack on her back and a small shooting pouch
slung across her body. Around her neck hang BOTH a company lanyard ID and a
small clip-on microphone. A folded ring light under one arm, a selfie stick
handle in the pouch, two phones, two power banks.
Silhouette read: two bags plus two things at the neck — "someone carrying
two jobs at once".
```

### 4.3 이혜미 — 제작 PM / 운영·납품 QA

```
CHARACTER: A Korean woman in her early 30s, production manager at a small
video production company. Full body, standing, character sheet pose.

Build: the LONGEST and LEANEST silhouette of the team — tall with long
limbs, so her gestures read large even in black silhouette. Her SHOULDERS
SIT SLIGHTLY RAISED, a permanent low-grade tension.
Face: sharp and alert but plain and ordinary. Narrow heavy-lidded eyes,
small flat pupils, no catchlight, clear dark under-eye shadows. Hair in a
messy hastily tied-up bun with loose strands escaping.
EXPRESSION IS DEADPAN — not angry, not scowling. The only marker is ONE
VERTICAL CREASE between her eyebrows, always present. The face of someone
perpetually one second before speaking and holding it in.
Clothing: a plain black fitted short-sleeve tee, plain black skinny jeans,
simple office slippers with NO brand marking of any kind. A small black
clover-shaped pendant on a thin chain.
KEY PROPS: a handheld LABEL PRINTER held or clipped at her hip, and a
clipboard covered in colored index tabs. A checklist thick with sticky tabs.
Silhouette read: tallest and thinnest outline, raised shoulders, label
printer at the hip.
```

### 4.4 손미림 — 비주얼 디렉터 / 촬영·편집

```
CHARACTER: A Korean woman in her late 20s, visual director at a small video
production company. Full body, standing, character sheet pose.

Build: small and compact with a rounded outline and a short stance. Do NOT
state or imply a specific height in the sheet or in any label.
Face: plain and ordinary with a gentle cast. Narrow heavy-lidded eyes,
small flat pupils, NO catchlight, faint under-eye shadows. Neat chin-length
bob. Deadpan, but the CORNERS OF HER MOUTH turn up very slightly. Any
impression of cuteness must come only from the rounded silhouette and the
mouth line, never from large or shiny eyes.
CLOTHING — THE SILHOUETTE SPLITS: a fitted short-sleeve band tee on top,
worn with VERY WIDE loose-cut trousers that fall straight and pool at the
shoes. Narrow above, broad below. She is the only person on the team whose
upper and lower halves read as different widths.
The band tee graphic is a fictional monster illustration with NO text and NO
readable logo. She wears it openly — nothing here is hidden.
KEY PROPS: a compact camera in one hand, over-ear headphones resting around
her neck, and a weekly planner ruled into fine time blocks with color tabs
tucked under one arm. Safety pins on a lapel.
Silhouette read: the only figure that splits — narrow on top, wide below,
short and compact. Reads as a T shape in pure black.
```

> **주의 — '멀쩡해 보인다'를 옷이 아니라 질서로 전달한다.** 그녀는 5인 중 옷을 가장 편하게 입었지만, **자기 반경 1m가 자로 잰 듯 정돈되어 있다.** 15분 그리드 스케줄 보드, 색 라벨로 구획된 플래너, 색깔별로 감긴 케이블, 남의 옷깃을 정리해 주는 손. 옷은 느슨하고 주변은 정확하다 — 이 어긋남이 이 인물이다.
>
> 헤비메탈도 더 이상 숨기지 않는다. **대놓고 밴드 티를 입고 있는데 아무도 물어보지 않는다.** 원래 캐논의 *"본인은 숨기지 않지만 아무도 눈치채지 못한다"* 가 그대로 성립하며, 이유만 바뀐다 — 겉이 멀쩡해서가 아니라 **동료의 취향에 아무도 관심이 없어서**다.
>
> **이영림과 섞지 말 것.** 이영림도 상·하 대비를 갖지만 축이 다르다 — 이영림은 **격식 대비**(위는 촬영용 정돈, 아래는 편한 옷), 손미림은 **폭 대비**(위는 붙고 아래는 넓다). 그래서 흑백 실루엣에서는 손미림만 잡히고(격식은 실루엣에 안 나온다), 컬러 전신에서는 둘이 각각 다른 이유로 잡힌다. 이영림에게 통 넓은 하의를 입히면 두 인물의 식별 근거가 같이 무너진다.

### 4.5 김신입 — 신입 AP / 제작 코디네이터 (플레이어)

```
CHARACTER: A young Korean person in their mid-20s, brand-new assistant
producer at a small video production company, three months into the job.
Full body, standing, character sheet pose. Gender-neutral read is fine.

Build: small and compact next to the others, slightly hunched under the
weight of what they are carrying.
Face: plain, young, tired. Narrow heavy-lidded eyes, small flat pupils, no
catchlight, under-eye shadows already forming. Plain cheap haircut. Deadpan
with a faintly braced quality — someone waiting to be handed one more thing.
Clothing: an oversized cheap jacket that does not fit, plain shirt, plain
trousers, worn sneakers. Everything slightly too big.
KEY PROP — the whole character: CABLES AND BAGS ACCUMULATE ON THEM. Coiled
cables over one shoulder, a tote bag, a shoulder bag, a film slate under one
arm, an SSD and card reader clipped to a belt loop with a carabiner. The
load must look accidental, gathered over a day — not like designed gear.
A company lanyard ID at the chest is the newest and cleanest object on them.
Silhouette read: a small figure buried under other people's equipment.
```

### 4.6 소품에 관한 단서

라벨 프린터·클립보드·접이식 링라이트·셀카봉·플래너·카메라 등은 **손에 들거나 가방·책상에 둔 형태**여야 한다. 같은 소품을 벨트·하네스·스트랩으로 몸에 결속해 장비화하면 "택티컬 복장" 위반이다. 소지품이지 장비가 아니다.

---

## 5. 5인 라인업 — 실루엣 판정용

캐릭터 승인은 5인을 나란히 놓고 판정한다. 비율 16:9 권장.

```
[여기에 §2 마스터 스타일 블록을 붙인다]

Five Korean coworkers of a small video production company standing in a
flat static line-up facing the viewer, full body, evenly spaced, plain
neutral background. Deadpan expressions, awkward stillness, no interaction.

Left to right:
1. Late-30s man, round Leon-style glasses, washed chalky lime tee and jeans,
   holding a tablet turned outward showing a 2x2 grid of thumbnails.
2. Late-20s woman, squared shoulders and upright posture, neat pressed
   blouse on top and loose track bottoms below, two bags, a lanyard AND a
   clip mic at her neck, folded ring light under one arm.
3. Early-30s woman, tallest and leanest, raised shoulders, messy tied-up
   bun, all black tee and skinny jeans, one vertical crease between the
   brows, label printer at her hip, tab-covered clipboard.
4. Late-20s woman, short and compact, neat bob, headphones around her neck,
   camera in hand, a fine ruled planner under her arm. A FITTED band tee on
   top with VERY WIDE loose trousers below — narrow above, broad below.
5. Mid-20s newcomer, small and compact, oversized cheap jacket, buried under
   coiled cables and bags, a slate under one arm, the cleanest lanyard.

#4 must be the only figure whose upper and lower halves are different
widths. That split must read at a glance, even in pure black silhouette.
```

---

## 6. 추가 컷

### 6.1 표정 시트 (인물당 1장)

```
[§2 마스터 스타일 블록] + [해당 인물의 §4 CHARACTER 블록]

EXPRESSION SHEET: the same character's head and shoulders repeated in a
3x2 grid, six panels, plain neutral background, identical framing in each.

The BASELINE is deadpan. Every variation is a MINIMAL deviation from it —
eyebrow angle, eyelid height, mouth line length. The face never opens up.
Panels: 1) neutral 2) listening 3) faint doubt 4) suppressed irritation
5) exhaustion 6) the one moment of real feeling — still almost blank.

Eyes stay narrow and heavy-lidded in all six. Pupils stay small and flat
with no catchlight in all six. No open-mouth shouting, no tears, no blush,
no anime emotion symbols, no sweat drops, no vein marks.
```

### 6.2 밤(이면) 버전 — 인물당 1장

낮 그림에 색조 필터를 씌우는 것이 아니라 **별도 작화**다.

```
[§2 마스터 스타일 블록] + [해당 인물의 §4 CHARACTER 블록]

NIGHT VERSION: the same character, same clothes, same props, standing in
the same static pose in an office at night with the ceiling lights off.

Lighting comes only from monitor glow — a flat cold grey-blue wash from one
side, still rendered as hard-edged two-tone cel shading, NOT as a gradient
and NOT as rim light. The shadow tone shifts further toward grey-violet.
Overall saturation drops further; the two saturated accent points remain and
now read as the only colour in frame.

ONE THING IS WRONG and it is small: a single detail that does not belong,
placed quietly and never emphasised. No horror lighting, no blood, no wounds,
no distorted ghost face, no glowing eyes, no religious symbols. The image
must look ordinary at first glance and wrong at second glance.
```

### 6.3 SD 탑다운 스프라이트 (인게임용)

```
Top-down game sprite of a Korean office worker, 2.5 heads tall super
deformed proportions, drawn in flat two-tone cel shading with thick uneven
hand-inked outlines, muted desaturated palette, viewed from a high angle.

The face is reduced to simple marks — small flat dots for eyes, a short line
for the mouth. No large shiny eyes, no cute moe styling. This is an
ABBREVIATION of a realistic design, not a cute redesign.

Readable at 64x96 pixels: the character must be identifiable purely by
silhouette, hair shape, clothing colour block, and the one prop they always
carry. Plain transparent background, no shadow blob, no outline glow.

[여기에 해당 인물의 실루엣 한 줄 + 상시 소품 1개만 영어로 적는다.
 예: "Tall thin figure with raised shoulders, messy tied-up bun, all black
 clothing, a label printer at the hip."]
```

---

## 7. 인물 캐논 — 왜 그런 소품을 드는가

작가가 이유를 알고 그려야 디테일이 살아난다. **성격은 표정이 아니라 5개 채널로 전달한다** — 전 인물 무표정이 기본값이기 때문이다.

### 7.1 5채널 표

| 인물 | ① 실루엣 | ② 상시 소품 | ③ 버릇 동작 | ④ 주변 환경 | ⑤ 밤의 왜곡 |
|---|---|---|---|---|---|
| **허파랑** | 한 손엔 항상 화면, 다른 손은 넓은 제스처. 화면을 보지 않는 컷이 게임 전체에 없다 | 4분할 생성 그리드가 뜬 태블릿, 프롬프트 포스트잇, 상단에 늘 떠 있는 잔량 알림 배너 | 화면을 상대 쪽으로 돌려 보여준다. 질문받으면 사람이 아니라 화면을 먼저 본다 | 모니터 테두리에 프롬프트 포스트잇 도배, 미채택 생성 시안 출력물, 결제 알림 문자 | 4분할 그리드에 아무도 만들지 않은 다섯 번째 이미지 |
| **이영림** | 가방 둘 + 사원증과 마이크. **5인 중 유일하게 자세가 무너지지 않는다** | 접이식 링라이트, 셀카봉, 보조배터리 2, 폰 2대, 팀원 책상의 간식과 응원 포스트잇 | 나쁜 소식을 듣고 **0.5초 멈췄다가** 웃으며 대안을 말한다 | 5인 중 그녀 자리에만 조명이 하나 더 켜져 있다 | 사무실 조명이 전부 꺼져도 그녀의 링라이트만 안 꺼진다. 비추는 자리에 아무도 없다 |
| **이혜미** | 가장 길고 가는 실루엣. **어깨가 항상 조금 올라가 있다** | 라벨 프린터, 클립보드, 색인 탭 체크리스트 | 화나면 라벨 프린터 강타. 소리가 나면 **5인 중 가장 먼저 돌아본다** | 자리 주변 라벨 도배 | 그녀가 붙인 라벨에 아직 일어나지 않은 사고의 이름 |
| **손미림** | 5인 중 유일하게 상·하 실루엣 폭이 갈린다 — 붙는 밴드 티 + 통 넓은 바지, 작고 둥근 윤곽 | 카메라, 헤드폰, 분 단위 플래너, 옷핀 | 남의 옷깃을 정리해 준다. 편집 중 **발로 더블베이스 박자를 밟는다**(본인은 모른다) | **옷은 가장 편하게 입었는데 자기 반경 1m만 자로 잰 듯 정돈돼 있다** — 15분 그리드 스케줄 보드, 색 라벨 플래너, 색깔별로 감긴 케이블. 모니터 뒤편 앉은 사람 시선에서만 보이는 밴드 스티커 | 헤드폰이 책상에 놓인 채 소리가 샌다. 다가가면 음악이 아니라 룸톤이다 |
| **김신입** | 늘어나는 케이블에 파묻힌 작은 형체 | 케이블, 토트백, 숄더백, 슬레이트, SSD와 카드리더 | 받은 것을 계속 받는다 | 자리가 없다. 남의 자리 모서리를 빌려 쓴다 | 유일하게 본다 |

### 7.2 인물 한 줄 요약

| 인물 | 한 줄 | 낮의 축 | 감춘 것 |
|---|---|---|---|
| 허파랑 | 기술적 낙관 — 사소한 것까지 전부 AI에게 시킨다 | 내민 화면 | 혼자서는 결정하지 못한다 |
| 이영림 | 정서적 낙관 — 온에어 상태가 기본값인 사람 | 꺼지지 않는 조명 | 언제 힘든지 아무도 모른다 |
| 이혜미 | 먼저 아는 사람 — 예민함이 결함이 아니라 직업 능력 | 라벨과 긴장한 어깨 | 혼자 감당하다 터진다 |
| 손미림 | 다 받아주는 계획주의자 | 혼자만 갈라지는 실루엣 | 전부 헤비메탈이다 — 숨기지도 않는데 아무도 안 묻는다 |
| 김신입 | 연결자 | 늘어나는 케이블 | 유일하게 본다 |

**설계 원칙 — 다섯 사람 모두 겉과 속이 다르다.** 다만 어긋남의 방향이 전부 다르다: 허파랑은 확신 뒤에 공백, 이영림은 밝음 뒤에 소진, 이혜미는 예민함 뒤에 고립, 손미림은 단정함 뒤에 소음. 이 게임의 공포가 "출처 없는 것"에 관한 것이므로 인물 설계도 같은 문법을 따른다 — **낮에 보이는 것은 전부 출처가 있고, 밤에 돌아오는 것에는 없다.**

### 7.3 시각 축 분리 (충돌 방지)

이영림과 이혜미의 구분 축을 섞지 않는다.

- **이영림 = 광량.** 조명이 하나 더 켜져 있다. 저채도 원칙은 불변, 채도가 아니라 밝기로만 구분
- **이혜미 = 채도.** 주변만 미세하게 따뜻하다. 고채도 지점 계수에서는 제외

이영림은 밝고, 이혜미는 따뜻하다.

### 7.4 감정 노출은 게임 전체에 단 한 번

전 인물 무표정이 기본값이므로 **감정이 드러나는 컷은 희소자원**이다. 그 자원을 이영림에게 한 번만 쓴다: 진엔딩 직전 단 한 컷에서 **이영림의 올라간 눈썹 끝이 평평해진다.** 대사도 표정 변화도 없이 눈썹 각도 하나만 바뀌고, 그 컷 이후 다시 원래대로 돌아온다. 아트는 이 1컷을 별도 지정 컷으로 제작한다.

---

## 8. 결과가 어긋날 때 — 증상별 처방

| 증상 | 프롬프트에 추가 |
|---|---|
| 얼굴이 잘생기게 나온다 | `plain unremarkable face, ordinary features, not attractive, tired office worker face, slightly asymmetric features` |
| 눈이 크고 반짝인다 | `narrow slit eyes, tiny flat pupils, no catchlight, no eye shine, heavy upper eyelid covering the iris` |
| 그림자가 부드럽다 | `hard-edged two-tone cel shading only, angular shadow shapes with sharp corners, zero gradient` |
| 광택·림라이트가 낀다 | `completely matte surfaces, no specular, no rim light, no backlight, flat frontal fluorescent lighting` |
| 선이 균일하고 깔끔하다 | `uneven brush-pen linework, visible pressure variation, tapering strokes, slightly rough contour` |
| 색이 화려하다 | `heavily desaturated, muted greyed palette, low chroma, almost monochrome with one accent` |
| 웹툰·벡터 느낌이 난다 | `hand-drawn animation cel, traditional ink and paint, film grain, not vector, not digital clean art` |
| 포즈가 역동적이다 | `standing still, static neutral pose, arms relaxed, no action, no dynamic angle` |
| 옷에 장식이 붙는다 | `plain everyday office clothing, no belts, no pouches, no straps, no accessories beyond what is specified` |
| 배경이 그려진다 | `plain flat neutral background, no scenery, no environment, character sheet only` |
| 머리에 광택 줄이 생긴다 | `matte hair, no highlight band, no shine, hair broken into large angular clumps` |
| 인물이 너무 어려 보인다 | `adult in their late twenties to late thirties, realistic adult proportions, working professional` |
| 밤 컷이 호러 조명이 된다 | `ordinary dark office, flat monitor glow only, no dramatic lighting, no horror lighting, looks mundane` |

---

## 9. 합격 판정 체크리스트

각 항목은 **판정단 3인 중 2인 합의**로 판정한다. 하나라도 불합격이면 반려다.

### 9.1 작화 규격

- [ ] 외곽선이 내부선보다 눈에 띄게 굵고, 한 획 안에서 굵기가 변한다
- [ ] 그림자가 2톤이며 경계가 하드 엣지다. 그라데이션이 0이다
- [ ] 그림자 형태가 각져 있다. 부드러운 덩어리가 없다
- [ ] 림라이트·블룸·광택 하이라이트가 없다
- [ ] 눈이 가늘고 동공이 작고 평평하며 **캐치라이트가 하나도 없다**
- [ ] 기본 표정이 무표정이다
- [ ] 머리카락에 광택 줄이 없다
- [ ] 화면 내 고채도 지점이 **2개 이하**다
- [ ] 필름 그레인 또는 종이 질감이 3~8% 얹혀 있다
- [ ] 실비율 컷이 7~7.5등신이다 / SD가 2.5등신이다

### 9.2 캐릭터

- [ ] 5인을 **흑백 실루엣으로 변환해도 서로 구분된다**
- [ ] 흑백 실루엣에서 손미림이 "상·하 폭 대비가 가장 큰 인물"로 지목된다
- [ ] 인물별 상시 소품이 전부 들어 있다 (허파랑=태블릿+포스트잇+알림배너 / 이영림=링라이트+가방2+마이크 / 이혜미=라벨프린터+클립보드 / 손미림=카메라+헤드폰+플래너 / 김신입=케이블+가방+슬레이트)
- [ ] 이영림의 앉은 컷과 선 컷을 나란히 놓으면 상·하반신 격차가 지목된다
- [ ] 이혜미가 화난 얼굴이 아니라 **무표정 + 눈썹 사이 세로 주름 1줄**이다
- [ ] 손미림의 밴드 티 그래픽에 판독 가능한 글자·로고가 없다 (가상 몬스터 도안만)
- [ ] 김신입의 장비 더미가 **설계된 기어가 아니라 하루 동안 쌓인 짐**으로 보인다

### 9.3 금지 사항

- [ ] 실존 브랜드 로고·패러디 브랜드가 없다
- [ ] 노출·신체 강조·연령 하향 표현이 없다
- [ ] 택티컬 벨트·파우치·하네스가 없다
- [ ] 히어로 포즈·역동적 액션 구도가 없다
- [ ] 밤 컷이 낮 컷의 색조 필터가 아니라 별도 작화다
- [ ] 밤 컷에 피·상처·귀신 얼굴·종교 상징이 없다
- [ ] 워터마크·서명·텍스트가 없다

### 9.4 절차

- [ ] 실명 4인이 각자 자기 캐릭터를 **서면 승인**했다 (러프 단계, 후속 공정 착수 전제)
- [ ] AI 보조를 사용했다면 사용 도구와 사용 구간을 사전 고지했다
- [ ] 최종 납품 에셋이 생성물이 아니라 작가의 작업물이다

---

## 10. 작업 순서

1. **마스터 블록 단독 테스트.** 아무 인물 하나(예: 허파랑)로 3~4장 생성해 톤이 잡히는지 먼저 확인한다. 톤이 안 잡히면 §8 처방으로 **마스터 블록부터 고친다.** 인물을 늘리는 건 그다음이다. 여기서 시간을 쓰는 게 전체를 줄인다
2. **5인 개별 생성.** 각 2~4장씩
3. **라인업 생성** (§5). 실루엣 대비 확인
4. **흑백 변환 판정.** 라인업을 흑백 실루엣으로 바꿔 §9.2의 첫 두 항목을 판정한다. 여기서 걸리면 인물 디자인 자체를 고쳐야 한다 — 프롬프트 문제가 아니다
5. **표정 시트·밤 버전** (§6.1·6.2) 생성
6. **§9 체크리스트 전항 판정**
7. **실명 4인 본인 컨펌.** 러프 단계에서 각자 서면 승인
8. **작가 인계.** 생성물은 방향 레퍼런스다. 작가는 이것을 보고 그리되 **그 위에 대고 그리지 않으며**, 최종 납품 에셋은 작가의 작업물이다
