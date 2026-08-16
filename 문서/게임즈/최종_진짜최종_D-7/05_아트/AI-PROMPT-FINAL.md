# 최종 이미지 생성 프롬프트 (다른 AI에 지시용)

> 그림체 확정: **2020년대 세이넨 만화 원작 TV 애니메이션 작화** (체인소맨 계열)
> 근거: [아트 발주서 2.7](../02_발주서/ART-RFP-FINAL-FINAL-D7.md) · [작화 해부 사양서](./ARTSTYLE-SPEC.md) · [인물 캐논 v2](../01_기획서/CHARACTER-CANON-V2.md)
>
> **사용 규칙**: 본 프롬프트의 산출물은 **컨셉·방향 합의용 레퍼런스**다. 발주서 2.5-2에 따라 생성형 AI 산출물의 직접 납품은 금지이며, 최종 납품 에셋은 작가의 작업물이어야 한다. 특정 작품명을 프롬프트에 넣어 그 작품을 모사하도록 지시하지 않는다 — 아래는 전부 화풍의 **속성 서술**이며, 그것이 결과물도 더 정확하다.

---

## 1. 마스터 스타일 블록

모든 프롬프트에 이 블록을 그대로 붙인다. **이 블록이 결과의 80%를 결정한다.**

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

## 2. 인물별 프롬프트

각 프롬프트는 **[마스터 스타일 블록] + 아래 CHARACTER 블록** 순으로 붙여 사용한다. 권장 비율 3:4 또는 2:3.

### 2.1 허파랑 — 대표 / 크리에이티브 프로듀서

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

### 2.2 이영림 — 콘텐츠 기획 / 스토리 디렉터

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

### 2.3 이혜미 — 제작 PM / 운영·납품 QA

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

### 2.4 손미림 — 비주얼 디렉터 / 촬영·편집

```
CHARACTER: A Korean woman in her late 20s, visual director at a small video
production company. Full body, standing, character sheet pose.

Build: ordinary, slightly rounded compact outline, short stance.
Face: plain and ordinary with a gentle cast. Narrow heavy-lidded eyes,
small flat pupils, NO catchlight, faint under-eye shadows. Neat chin-length
bob. Deadpan, but the CORNERS OF HER MOUTH turn up very slightly. Any
impression of cuteness must come only from the rounded silhouette and the
mouth line, never from large or shiny eyes.
CLOTHING — a hidden layer: she is THE ONLY ONE OF THE TEAM WHO IS PROPERLY
DRESSED. A crisp well-fitted shirt with sleeves neatly rolled, tucked into
clean tailored trousers, proper shoes. Everything pressed and coordinated
while her coworkers are rumpled. UNDERNEATH, a black band tee is layered —
only a SLIVER of its harsh graphic print shows at the open collar, easy to
miss. Do NOT put a large visible logo on the outer shirt.
KEY PROPS: a compact camera in one hand, over-ear headphones resting around
her neck, and a weekly planner ruled into fine time blocks with color tabs
tucked under one arm. Safety pins on a lapel.
Silhouette read: the only tidy fully-coordinated outline among scruffy ones.
```

### 2.5 김신입 — 신입 AP / 제작 코디네이터 (플레이어)

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

---

## 3. 5인 라인업 (실루엣 판정용)

캐릭터 승인은 5인을 나란히 놓고 판정한다. 비율 16:9 권장.

```
[마스터 스타일 블록]

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
4. Late-20s woman, the ONLY properly dressed one — crisp shirt, tailored
   trousers, neat bob, headphones around her neck, camera in hand, a fine
   ruled planner under her arm, a sliver of black band tee at her collar.
5. Mid-20s newcomer, small and compact, oversized cheap jacket, buried under
   coiled cables and bags, a slate under one arm, the cleanest lanyard.

The contrast between #4 (put together) and the other four (rumpled) must
read at a glance, even in pure black silhouette.
```

---

## 4. 결과가 어긋날 때 — 증상별 처방

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

---

## 5. 사용 순서

1. **마스터 블록 단독 테스트** — 아무 인물 하나(예: 허파랑)로 3~4장 생성해 톤이 잡히는지 먼저 확인한다. 톤이 안 잡히면 4장의 처방을 적용해 마스터 블록부터 고친다. 인물을 늘리는 것은 그다음이다.
2. **5인 개별 생성** — 각 2~4장씩.
3. **라인업 생성** — 실루엣 대비 확인.
4. **흑백 변환 판정** — 라인업을 흑백 실루엣으로 바꿔, 5인이 서로 구분되고 손미림이 "유일하게 갖춰 입은 인물"로 지목되는지 확인한다(AC-CHR-03·AC-PSN-06).
5. **승인 후** — 이 결과물은 작가에게 넘기는 **방향 레퍼런스**다. 작가는 이것을 보고 그리되 그 위에 대고 그리지 않으며, 최종 납품 에셋은 작가의 작업물이다(발주서 2.5-2).
6. **실명 4인 본인 컨펌** — 러프 단계에서 각자 자기 캐릭터를 서면 승인해야 후속 공정에 착수한다(발주서 2.4-4·7.4).
