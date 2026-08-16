# 아트 2차 검수 보고 — AI_PROMPT_FINAL_PASS 레퍼런스 패키지

> 검수 대상: `AI_PROMPT_FINAL_PASS/README.md` (제출본)
> 기준 문서: `AI-PROMPT-FINAL.md` 고정 리비전 `82bc5b0`, `CHARACTER-CANON-V2.md`, `ART-RFP-FINAL-FINAL-D7.md`
> **검수 범위 한정**: 이미지가 제출되지 않아 README가 선언한 수정사항만 대조한 **서면 검수**다. 작화 규격(지시서 §9.1) 10항은 판정하지 못했다.

---

## 0. 총평

프로세스 위생은 좋다 — 고정 리비전 링크, 프리비즈 지위 명시, 트레이싱 금지·크레딧·고지 5개 전제 명문화, 밤 버전 별도 작화. 여기까지는 발주서를 정확히 읽은 결과다.

문제는 "사용자 수정사항 반영" 6줄이다. **6줄 중 3줄이 발주서 금지 조항 또는 캐릭터 캐논을 무효화하며, 그중 2건은 1차 검수(`ART-REVIEW-01.md`)에서 이미 반려한 항목의 재발이다.** 공통 원인은 하나로 보인다 — 인물의 **인상**을 손보면서 그 인상을 만들던 **구조**를 같이 뜯어냈다.

차단 3건 / 높음 2건 / 확인 불가 1건.

---

## 1. 차단 — 재생성 없이는 진행 불가

### B-1. 손미림 — 반전 소실 + 실루엣 대비 역전 (**1차 M-2 재발**)

| 항목 | 제출 스펙 | 기준 |
|---|---|---|
| 상·하의 | "일본식 오버핏 와이드 팬츠와 오버핏 상의" | **5인 중 유일하게 갖춰 입은 실루엣** (ART-RFP 2.4-2, 캐논 v2 §4.2, 지시서 §4.4·§7.1) |
| 헤비메탈 | "글자 없는 가상 헤비메탈 괴물 그래픽 티셔츠" (겉옷) | **겉은 멀쩡, 속이 헤비메탈.** 셔츠 **안**에 밴드 티, 목깃 사이로 프린트가 아주 조금만 |
| 키 | "가장 작은 키" | 실존 인물 신체 지시. 캐논 표현은 "둥근 컴팩트한 실루엣·짧은 보폭" |

**왜 차단인가.** 지시서 §9.2 두 번째 판정 항목이 *"흑백 실루엣에서 손미림이 '유일하게 갖춰 입은 인물'로 지목된다"* 이다. 오버핏 상하의로 그리면 그녀가 5인 중 **가장 후줄근한** 실루엣이 되어 이 항목이 판정 불가가 된다. 체크리스트 1항목 불합격 = 반려다.

더 큰 손실은 캐릭터다. 이 인물의 설계는 *"본인은 숨기지 않는데 아무도 눈치채지 못한다 — 겉모습이 너무 멀쩡해서"* 이다. 메탈을 겉옷에 인쇄하는 순간 숨긴 것이 없어지고, 밤의 왜곡(§7.1 ⑤ 헤드폰에서 새는 룸톤)이 걸릴 데가 사라진다.

1차 검수 M-2에서 "엄청 큰 가방바지" + "과장된 헤비메탈 로고"를 같은 사유로 반려했다. 동일 패턴이다.

### B-2. 이영림 — 2.5-5 위반 재발 + 의상 구조 소실 (**1차 B-1 재발**)

| 항목 | 제출 스펙 | 저촉 |
|---|---|---|
| 체형 | "날씬한 체형" | 실존 인물 신체 치수 지시. 1차 H-3에서 이혜미 "체형: 매우 마름"을 실루엣 언어로 교체한 것과 동일 문제 |
| 인상 | "화려하게 정돈된 … 인상" | 지시서 §3.3 얼굴 규격 **"평범하고 미화되지 않은"**. 1차 B-1이 반려한 "4명 중 가장 화려함"과 동일 |
| 직업상 | "콘텐츠·피트니스 인플루언서" | 캐논 변경. 그녀는 **콘텐츠 기획 / 스토리 디렉터**이고 개인 채널도 제작 계열이다. 피트니스는 캐논에 없다 |
| 하의 | "짧은 불투명 레깅스" | 캐논은 `loose worn track bottoms`(현장 작업용 편한 하의). ART-RFP 2.5-5 선정적 신체 묘사 금지선에 재접근 |

**가장 큰 손실은 위 표에 없다.** 이영림 의상의 핵심은 **상·하 의도적 미스매치**다 — 상의는 카메라에 잡히므로 정돈, 하의는 현장에서 바닥에 앉으므로 편한 옷. 이 어긋남 하나가 "두 가지 일을 동시에 하는 사람"을 옷만으로 설명한다. "화려하게 정돈된 + 레깅스"는 위아래가 한 방향으로 통일돼 **미스매치가 사라지고, 캐릭터의 시각적 농담이 통째로 없어진다.**

부수 충돌: "날씬한 체형"은 이혜미의 유일한 실루엣 식별자(*5인 중 가장 길고 가는*)와 겹쳐 두 인물의 흑백 실루엣 구분을 약화시킨다.

README는 *"직업인 설정을 유지하고 노출·성적 강조는 넣지 않았다"* 고 적었으나, 날씬한 체형 + 화려한 인상 + 짧은 레깅스의 조합은 1차 B-1이 차단한 구성이 표현만 바뀌어 돌아온 것이다.

### B-3. 목 주변 요소 전면 제거 — 실루엣 판정 장치 파손

"명찰, 사원증, 회사 ID, 목걸이, 펜던트, 목줄형 스트랩 등 목 주변 요소를 제거했다."

| 인물 | 잃은 것 | 근거 |
|---|---|---|
| **이영림** | 사원증 + 클립 마이크 | ① 실루엣이 *"가방 둘 + **사원증과 마이크** → 두 가지 일을 동시에 지고 있는 사람"*. 목의 두 물건이 실루엣 읽기의 **절반**이다 (캐논 v2 §1.2, 지시서 §4.2·§7.1) |
| **김신입** | 사원증 | *"몸에 걸친 것 중 가장 새것이고 깨끗한 물건"* — 이 인물이 신입임을 말하는 **유일한** 장치 (지시서 §4.5) |
| **이혜미** | 클로버 펜던트 | 지시서 §4.3 |

라인업 프롬프트(§5)의 판정문 `a lanyard AND a clip mic at her neck`(#2), `the cleanest lanyard`(#5)가 함께 무효가 된다.

**진단은 맞고 처방이 틀렸다.** 제거 사유는 AI가 명찰에 읽히는 글자·로고를 그려 §1-6(실존 브랜드·판독 가능 로고 금지)과 네거티브 프롬프트 `text`에 걸린 것으로 보인다. 그건 실재하는 문제다. 다만 해법은 **물건을 없애는 것이 아니라 카드 면을 비우는 것**이다. §4의 처방 참조.

---

## 2. 높음

### H-1. 김신입 성별 고정 — 기획 결정을 아트에서 처리함

지시서 §4.5는 `Gender-neutral read is fine`이다. 김신입은 **플레이어 캐릭터**이므로 성별 고정은 이입 설계에 직접 영향을 주는 기획 결정이며, 레퍼런스 생성 단계에서 확정할 사안이 아니다. 발주자 확인 필요.

(참고: 허파랑 남성 / 이영림·이혜미·손미림 여성은 실존 인물 그대로이므로 '수정사항'이 아니라 원래 캐논이다.)

### H-2. 본인 컨펌 없이 실명 인물 설정을 변경함

이영림을 "피트니스 인플루언서 인상"으로 바꾼 것은 직업 정체성 변경이며, ART-RFP 2.4-4·7.4의 **실명 인물 본인 서면 승인 대상**이다. README 「현재 상태」는 *"실명 인물 서면 승인: 이 패키지에 포함하지 않음"* 이라고 적었는데, 승인 절차 밖에서 승인 대상 항목을 바꾼 것이 문제다. 순서가 뒤집혔다.

---

## 3. 확인 불가 — 이미지 미제출

지시서 §9.1 작화 규격 10항(외곽선/내부선 굵기비, 2톤 하드엣지, 그림자 각, 캐치라이트 부재, 머리 광택 줄, 고채도 2지점 이하, 그레인 3~8%, 등신 2단 레지스터)을 **하나도 판정하지 못했다.**

덧붙여, README의 수정사항 6줄이 전부 의상·성별·소품이고 **작화 규격에 대한 언급이 한 줄도 없다.** 1차 검수 H-1이 "웹툰 스타일 클립아트 → 세이넨 애니 작화"를 요구했으므로, 이 축이 실제로 이동했는지가 이번 패키지의 핵심 판정 대상이다. 이미지 제출 후 재검수한다.

---

## 4. 처방 — 재생성용 프롬프트 교정

### 4-1. 목 주변 요소: 없애지 말고 비운다

제거 대신 아래를 해당 인물 CHARACTER 블록 끝에 추가한다.

```
The ID card hanging at the neck is BLANK — a plain flat coloured rectangle
with NO text, NO photo, NO logo, NO symbols of any kind. It reads purely as
a shape in silhouette. Same for any tag or strap: shape only, never legible.
```

네거티브 프롬프트에 추가: `legible text on badge, readable ID card, printed name tag, company logo`

### 4-2. 이영림 — 원래 구조로 복귀

교체 대상: "날씬한 체형 / 화려하게 정돈된 / 피트니스 / 짧은 레깅스"

```
Build: ordinary, NOT slim, NOT styled. POSTURE IS THE POINT — she stands
straight with squared shoulders while everyone around her slouches.
Face: plain and ordinary, NOT glamorous, NOT made up. The only marker is
that the outer ends of her eyebrows sit slightly raised.
CLOTHING — the mismatch IS the character: UPPER BODY is put together for
being on camera, a clean pressed blouse in a muted tone. LOWER BODY is
comfortable floor-work wear, LOOSE worn track bottoms and beaten sneakers.
The top and bottom must look like they came from two different days.
NOT leggings, NOT fitted, NOT athletic wear, NOT coordinated.
She is a content planner and story director who also runs her own channel
after hours — a production person, NOT a fitness influencer.
```

### 4-3. 손미림 — 반전 복구

교체 대상: "가장 작은 키 / 오버핏 와이드 팬츠 / 오버핏 상의 / 겉옷 메탈 그래픽"

```
Build: rounded compact outline with a short stance. Do not specify height.
CLOTHING — she is THE ONLY ONE OF THE TEAM WHO IS PROPERLY DRESSED. A crisp
well-fitted shirt with sleeves neatly rolled, TUCKED IN, clean tailored
trousers, proper shoes. Everything pressed and coordinated while her four
coworkers are rumpled and oversized. NOT oversized, NOT wide-leg, NOT baggy.
'Properly dressed' means TIDY, not expensive — same ordinary everyday
garments as the others, only pressed and colour-matched. No high fashion,
no glossy fabric.
HIDDEN LAYER: a black band tee is worn UNDERNEATH the shirt. Only a SLIVER
of its graphic shows at the open collar, small enough to miss. The graphic
is a fictional monster illustration with NO text. Do NOT put any graphic on
the outer shirt.
```

### 4-4. 김신입 — 성별 처리

발주자 확인 전까지 `Gender-neutral read is fine`을 유지하고, 성별을 고정한 변형은 별도 후보로만 보관한다.

---

## 5. 조치 순서

| 우선 | 항목 | 조치 |
|---|---|---|
| 1 | B-1 손미림 | §4-3으로 재생성. 흑백 실루엣에서 '유일하게 갖춰 입은 인물' 지목 여부로 판정 |
| 2 | B-2 이영림 | §4-2로 재생성. 상·하 미스매치 복구 확인 |
| 3 | B-3 목 요소 | §4-1로 복원(제거가 아니라 무지 처리) |
| 4 | H-1 김신입 성별 | 발주자 확인 |
| 5 | H-2 컨펌 순서 | 이영림 설정 변경분은 본인 승인 전까지 미반영 |
| 6 | 작화 규격 | 이미지 제출 → §9.1 10항 재검수 |

---

## 6. 유지할 것

되돌리지 말아야 할 판단들이다.

- 고정 리비전(`82bc5b0`) 링크로 기준 문서를 못 박은 것
- 밤 버전을 색조 반전이 아닌 별도 작화로 만든 것 (지시서 §1-8)
- 생성물의 지위를 프리비즈로 한정하고 트레이싱 금지·크레딧·AI 고지를 문서에 명문화한 것
- **이혜미**를 캐논대로 유지한 것 — 가장 길고 가는 실루엣, 올린 어깨, 세로 미간 주름. 5인 중 유일하게 손대지 않았고, 유일하게 문제가 없다
- 그래픽에서 글자를 뺀 판단 (§1-6 대응). 방향은 맞다 — 적용 범위만 틀렸다
- `docs/`에 출처·적용 변형·검수 메모를 남긴 것
