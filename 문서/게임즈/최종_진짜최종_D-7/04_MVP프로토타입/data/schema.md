# 《최종_진짜최종: D-7》 콘텐츠 JSON 스키마 정의서

- 버전: `schemaVersion` 4.0.0
- 정본 근거: `01_기획서/FINAL-FINAL-D7-GDD.md` v4.0 — 18.3 상태 스키마 / 18.4 이벤트 데이터 / 18.5 결정적 랜덤 / 18.6 조건 DSL / 18.7 세이브 구조 / 18.8 이벤트 추첨
- 검수 근거: `02_발주서/DEV-RFP-ACCEPTANCE-SPEC.md` AC-BAN-03(콘텐츠 하드코딩 0건) · AC-BAN-13(스키마 검증 통과) / `02_발주서/DEV-RFP-FINAL-FINAL-D7.md` 6.5 · 8.5
- 적용 범위: `data/` 아래 전 콘텐츠 JSON — `events.json`, `ghosts.json`, `items.json`, `flavor.json`

본 문서는 데이터 작성자 전원의 단일 계약서다. 여기에 정의되지 않은 필드·연산자·플래그는 쓸 수 없다. 새 필드가 필요하면 본 문서를 먼저 개정한다(발주서 6.4-4 상태 스키마 변경 절차와 동일).

---

## 0. 절대 원칙 5조

| 번호 | 원칙 | 근거 |
|---|---|---|
| 1 | 데이터는 상태를 **조회·변경**만 한다. 밸런스 **수식은 시뮬레이션 코어가 소유**하며 데이터가 수식을 정의하지 않는다 | GDD 18.6 |
| 2 | **이면 조우율 식(6.2)에 항을 추가하는 데이터를 만들지 않는다.** 조우율 가감(`±%p`)을 표현하는 연산자는 본 스키마에 존재하지 않는다 | GDD 6.2 식 불변 원칙 |
| 3 | 밤에 영향을 주는 효과는 **`spawnWeight` 연산자(개별 괴이 출현률 분포 변경) 하나로만** 기술한다. 밤 조우 총량은 불변이고 조우 대상만 재배분된다 | GDD 6.2 · 7.3 IT-34 · 10장 운용 규칙 · 11.3 신규 4종 편입 원칙 |
| 4 | 담력·컨펌·업무 판정의 **기본식과 계수는 데이터에 적지 않는다.** 데이터는 GDD가 명시한 개별 보정(`checkMod`)과 판정 호출(`check`)만 기술한다 | GDD 10장 판정 참조 · 11.2 |
| 5 | 한국어 원문은 **GDD 표기 그대로** 옮긴다. 수치·문장을 요약·반올림·의역하지 않는다 | 발주서 8.5-1 |

---

## 1. 공통 규약

### 1.1 파일 최상위 구조

모든 콘텐츠 JSON은 아래 4개 키를 최상위에 둔다.

```json
{
  "schemaVersion": "4.0.0",
  "kind": "events",
  "source": "FINAL-FINAL-D7-GDD.md v4.0 10장",
  "<컬렉션 키>": [ ... ]
}
```

| 키 | 타입 | 설명 |
|---|---|---|
| `schemaVersion` | string | `"4.0.0"` 고정. GDD 18.7 마이그레이션 규칙 대상 |
| `kind` | string | `events` / `ghosts` / `items` / `flavor` 중 하나 |
| `source` | string | 정본 출처(문서명 + 버전 + 장 번호) |
| 컬렉션 키 | array | `events`+`chains` / `ghosts` / `items` / `flavor` |

### 1.2 표기 규칙

| 항목 | 규칙 | 예 |
|---|---|---|
| JSON 내부 키 | camelCase | `braveCheck`, `spawnWeightModifiers` |
| 콘텐츠 ID | 원전 표기 그대로 문자열 | `"OF-01"`, `"GH-16"`, `"IT-30"`, `"PK-07"`, `"ED-11"` |
| DSL 안의 ID | 하이픈을 밑줄로 치환 | `codex.GH_04`, `pack.PK_07` |
| 인코딩 | UTF-8, 개행 LF, 들여쓰기 공백 2 | — |
| 주석 | JSON 주석 금지. 설명은 `note` 필드에 문자열로 | — |
| 미확정값 | **금지.** `null`·`"TBD"`·빈 배열로 회피하지 않는다. GDD에 수치가 없으면 §3.3 '수치 없는 결과' 규약을 쓴다 | — |

### 1.3 일차 스케일 (GDD 18.6)

| `day` | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| 표기 | D-7 | D-6 | D-5 | D-4 | D-3 | D-2 | D-1 | D-0 |

- `days` 필드는 **정수 배열**로 쓴다. 비연속 창(OF-03의 D-6·D-4)을 표현해야 하므로 범위 객체를 쓰지 않는다.
- `dayLabel` 필드에 GDD 원문 표기를 병기한다(`"D-6·D-4"`).

### 1.4 슬롯 키 (GDD 8.1)

| 키 | 슬롯 | 주요 트랙 | 적합 인물 |
|---|---|---|---|
| `planning` | 기획·구성 | 기획·서사 | 이영림, 허파랑 |
| `preproduction` | 프리프로덕션 | 기획·서사, 원본 무결성 | 이혜미, 플레이어 |
| `shooting` | 촬영·현장 | 촬영·원본 | 손미림, 허파랑 |
| `editing` | 편집·모션 | 편집·후반 | 손미림, 플레이어 |
| `deliveryQC` | 최종 납품 QC | 마스터·납품, 원본 무결성 | 이혜미, 손미림 |
| `recovery` | 정리·회복 | 회복, 수정 부채 감소 | 전원 |
| `any` | 슬롯 미지정(원문이 "업무 슬롯"으로만 적은 경우) | — | — |

### 1.5 인물 키 (GDD 18.6 · 3장)

`heoparang`(허파랑) / `leeyounglim`(이영림) / `leehyemi`(이혜미) / `sonmirim`(손미림) / `player`(플레이어)

집합 대상 키는 §3.2 `char` 연산자 표를 따른다.

---

## 2. 조건 DSL (GDD 18.6 준거)

### 2.1 문법

```
expr        := or_expr
or_expr     := and_expr { "||" and_expr }
and_expr    := unary_expr { "&&" unary_expr }
unary_expr  := [ "!" ] ( comparison | "(" expr ")" )
comparison  := ref op literal | ref          (ref 단독은 불리언 필드)
op          := "==" | "!=" | ">=" | "<=" | ">" | "<"
literal     := 정수 | true | false | "문자열"
```

### 2.2 연산자

| 종류 | 연산자 | 비고 |
|---|---|---|
| 비교 | `== != >= <= > <` | 정수·문자열·불리언. 문자열은 `==`·`!=`만 허용 |
| 논리 | `&& \|\| !` | 단락 평가 |
| 그룹 | `( )` | 우선순위: `( )` > `!` > 비교 > `&&` > `\|\|` |

산술(`+ - * /`)·대입·함수 호출은 **지원하지 않는다.**

### 2.3 참조 가능 필드

| 분류 | 필드 | 타입·범위 |
|---|---|---|
| 진행 | `day` | 정수 1~8 |
| 진행 | `phase` | `briefing` / `scramble` / `production` / `reality_event` / `confirm` / `overtime` / `backstudio` / `production_log` / `d0_screening` |
| 진행 | `difficulty` | `rough_cut` / `main_cut` / `director_cut` / `uncompressed` |
| 트랙 | `story`, `footage`, `post`, `master` | 정수 0~100 |
| 자원 | `clientTrust`, `sourceIntegrity`, `fear`, `audienceResonance` | 정수 0~100 |
| 자원 | `budget` | 정수 −1000000~7000000 (**원 단위**) |
| 자원 | `revisionDebt` | 정수 0~60 |
| 자원 | `coffee`, `snack` | 정수 0 이상 |
| 인물 | `char.<id>.focus` / `.hp` / `.bond` | 정수 0~100 |
| 플래그 | `flag.<name>` | 불리언 또는 정수. §2.5 레지스트리 등재분만 사용 |
| 도감 | `codex.<괴이ID>` | 불리언. `codex.GH_04` |
| 모듈 | `pack.<모듈ID>` | 불리언. `pack.PK_07` |
| 당일 | `overtimeToday` | 정수 0~3 |
| 당일 | `confirmFailStreak` | 정수 |

- 트랙·자원은 접두어 없이 참조한다(`post >= 15`).
- 표에 없는 최상위 필드는 쓸 수 없다. 파생값은 반드시 `flag.<name>`으로 참조한다.

### 2.4 평가 규칙

- 평가 시점은 이벤트 추첨 직전. 상태 스냅샷에 대해 1회 평가한다.
- 미설정 flag는 `false`(정수 플래그는 `0`)로 평가한다.
- 존재하지 않는 필드 참조·파싱 실패는 전체 조건을 `false`로 만들고 경고 로그를 남긴다. 런은 중단하지 않는다.
- 빈 문자열 `""` 또는 필드 생략은 **항상 참**으로 평가한다(전제 없음).

### 2.5 플래그 레지스트리

**본 표에 없는 플래그명은 사용 금지.** 새 플래그는 표에 행을 추가한 뒤에만 쓴다.

#### (a) GDD 18.3 · 18.6 등재분

| 플래그 | 타입 | 산출 근거 |
|---|---|---|
| `flag.source0000Seen` | bool | GDD 18.3 |
| `flag.creditLedgerPieces` | int 0~3 | GDD 18.6 · 11.3 크레딧 장부 조각 3곳(GH-04·09·12) |
| `flag.traceableMaster` | bool | GDD 18.3 · 11.4 진엔딩 플래그 TRACEABLE_MASTER |

#### (b) 부록 D.0.2 참조 파생 플래그 11종

| 플래그 | 타입 | 산출 근거 |
|---|---|---|
| `flag.overtimeStreak` | int | 연속 야근 일수(6.2·6.3) |
| `flag.overtimeRunTotal` | int | 런 누적 야근 일수 |
| `flag.restoreUsed` | int | 타임루프 복원 횟수(2.5·18.7) |
| `flag.restSlotUsed` | bool | 당일 정리·회복 슬롯 배치 여부(8.1) |
| `flag.confirmPassedToday` | bool | 당일 페이즈 5 컨펌 결과(6.1) |
| `flag.footageGainToday` | int | 당일 촬영·원본 증가분(15.5) |
| `flag.postGainToday` | int | 당일 편집·후반 증가분(15.5) |
| `flag.masterFirstDay` | int | 마스터·납품이 1 이상으로 처음 올라온 날 |
| `flag.criticalMissing` | int | 치명 누락 플래그 개수(5.3) |
| `flag.backstudioToday` | bool | 당일 이면 조우 발생 여부(6.2) |
| `flag.statusFrameDrop` 외 | bool | 6.3 상태이상 표의 부여 여부 |

#### (c) 배치·보유 플래그 (기계 파생 · 값은 코어가 매 페이즈 갱신)

| 플래그 | 타입 | 산출 근거 |
|---|---|---|
| `flag.assignedHeoparang` · `flag.assignedLeeyounglim` · `flag.assignedLeehyemi` · `flag.assignedSonmirim` · `flag.assignedPlayer` | bool | 당일 업무 슬롯 배치 여부(8.3). GDD의 "○○ 배치 필요" 표기를 기계화 |
| `flag.hasIT07` · `flag.hasIT09` · `flag.hasIT12` · `flag.hasIT16` · `flag.hasIT18` · `flag.hasIT19` · `flag.hasIT20` · `flag.hasIT26` · `flag.hasIT27` · `flag.hasIT30` | bool | 인벤토리 보유 여부(7.2·7.3). 명명 규칙 `flag.hasIT<두 자리>`. 아이템 데이터가 늘어나면 같은 규칙으로 행을 추가한다 |
| `flag.gearRequirementMet` | bool | 8.2 업무 판정의 '요구 장비 완비' 판정과 동일 기준. GDD가 품목을 특정하지 않고 "장비 필요"로만 적은 자리에 사용 |
| `flag.requiredGearMissing` | bool | 위의 부정. 8.2 '요구 장비 미비'와 동일 기준. OF-06 가중치 보정용 |
| `flag.pairConceptToFrame` | bool | 페어 '콘셉트 투 프레임'(허파랑×손미림) 성립(4.1) |
| `flag.pairStoryboardMoves` | bool | 페어 '스토리보드가 움직인다'(이영림×손미림) 성립(4.1) |

#### (d) 페이즈·슬롯 가동 플래그

| 플래그 | 타입 | 산출 근거 |
|---|---|---|
| `flag.postSlotActiveToday` | bool | 당일 편집·모션 슬롯 가동(OF-08 발생 조건) |
| `flag.shootSlotActiveToday` | bool | 당일 촬영·현장 슬롯 가동(OF-23 발생 조건) |
| `flag.renderSlotActiveToday` | bool | 당일 렌더 작업 가동(OF-16 발생 조건) |
| `flag.outdoorShootPlanned` | bool | 야외 촬영 예정일(OF-05 발생 조건) |
| `flag.printoutDoneOnce` | bool | 프리프로덕션 슬롯에서 출력물(콜시트·출연 동의서) 1회 이상 출력(GH-17 전제) |
| `flag.recordingExists` | bool | 회의·인터뷰 녹음 파일 1개 이상 존재(GH-04 전제, 기본 충족) |
| `flag.confirmDoneOnce` | bool | 컨펌(하루 페이즈 5) 1회 이상 수행(GH-12 전제) |
| `flag.confirmPassedYesterday` | bool | **전일** 컨펌 성공 여부. OF-22 가중치 보정 전용 — 이벤트는 18:00, 컨펌 결과는 19:00이므로 당일 결과를 참조할 수 없다(10장 OF-22 주석) |
| `flag.midConfirmDone` | bool | D-4 중간 컨펌 수행 여부(6.1 페이즈 5). OF-01 발생 전제 |
| `flag.ftueBuild` | bool | FTUE·MVP 수직절단 빌드 여부(14장·19.1). OF-01의 D-7 고정 발생 예외 전용 |
| `flag.overtimeTonight` | bool | 당일 야근 선택 확정 여부(6.2) |
| `flag.overtimeLockedToday` | bool | 당일 야근 선택 불가(OF-22 선택 B) |

#### (e) 진엔딩·수집 카운터

| 플래그 | 타입 | 산출 근거 |
|---|---|---|
| `flag.rightsManifest` | int 0~100 | 원본·권리 목록 진행률(%). GH-15 출현 조건 80 이상, 11.4 진엔딩 체인 |
| `flag.sourceLogClues` | int | 원본 로그 단서 누계(GH-07·10.5·10.6·GH-16·GH-19). 크레딧 장부 조각과 별도 아이콘(11.3) |
| `flag.metadataFragments` | int | 메타데이터 조각 누계(GH-01·GH-18) |
| `flag.holidayFragments` | int | 휴일 조각 누계(GH-13·OF-29 선택 A) |
| `flag.trueEndingFlag` | int | 진엔딩 플래그 누계(GH-05 '보류하고 출처 추적') |
| `flag.ghostRepelCharge` | int | 괴이 1회 격퇴 수단 보유 수(GH-08 '버튼 제거') |
| `flag.gh08Entered` | bool | GH-08 '진입' 완료. GH-09 조우 테이블 등재 전제 |
| `flag.gh14ChainOpen` | bool | GH-08 '이름 없는 미니DV 태그'로 GH-14 체인 개방 |
| `flag.gh09Done` | bool | GH-09 '누구인지 묻기' 완료. GH-15 전제 |
| `flag.gh14Done` | bool | GH-14 크레딧 시트 복원 완료. GH-15 전제 |
| `flag.gh19HandoverSigned` | bool | GH-19 '인수인계 문서 기입' 담력 판정 성공. GH-14 '전부 복원' 대가 −10 → −6 완화(11.3) |

#### (f) 낮→밤 연결 플래그 (괴이 출현 전제)

| 플래그 | 타입 | 산출 근거 |
|---|---|---|
| `flag.of22Occurred` | bool | OF-22 '저녁이나 하죠' 발생(GH-18 분포 상향 전제) |
| `flag.of26Handled` | bool | OF-26 '용지 걸림' 처리(GH-17 전제) |
| `flag.of27Handled` | bool | OF-27 '전임자 계정' 처리, 선택 무관(GH-19 전제) |
| `flag.of30Handled` | bool | OF-30 '탕비실 재고 조사' 처리, 선택 무관(GH-16 전제) |
| `flag.of30DiscardedUnnamed` | bool | OF-30 선택 C에서 이름 없는 음식 3개 폐기(GH-16 출현률 +5%p 전제) |
| `flag.nameFieldBlankConfirmed` | bool | GH-18 '답장 쓰기' 40% 악결과 — 이름 칸 공란 확정. 기록물 계열(GH-16·17·19) 분포 상향 전제 |

#### (g) 이벤트 결과 플래그 — 수치 없는 결과

GDD가 결과를 **수치 없이 서술만 한 자리**에 사용한다(§3.3). 값은 전부 bool이며, 서술 원문은 해당 효과의 `note`에 그대로 남긴다.

`flag.nextFeedbackVisible`(GDD 18.4 원문) · `flag.briefResolved` · `flag.briefConflictUnresolved` · `flag.locationSafe` · `flag.locationPermitGranted` · `flag.shootGapToday` · `flag.interviewLockedTomorrow` · `flag.rainMasterCut` · `flag.gearDamageRisk` · `flag.qualityMismatch` · `flag.shootTimeSpent` · `flag.batteryIncidentSafe` · `flag.keyCutLost` · `flag.postBurden` · `flag.noDamage` · `flag.storageShortage` · `flag.audioQualityRisk` · `flag.continuityTimeAndStaminaLoss` · `flag.consentResolved` · `flag.consentMissing` · `flag.scopeLocked` · `flag.extraDeliverableDone` · `flag.fontRightsCleared` · `flag.qualityLoss` · `flag.deliveryTestDone` · `flag.fullRerender` · `flag.subtitleSyncIncident` · `flag.criticalSubtitleCleared` · `flag.renderRestartOk` · `flag.postPartialLoss` · `flag.deliverableReady` · `flag.onSiteConversionPressure` · `flag.backupMasterUsed` · `flag.fullRemaster` · `flag.scopeNegotiated` · `flag.versionLogKept` · `flag.versionRestored` · `flag.rechecksWithdrawn` · `flag.extraRequestChainClosed` · `flag.routerRecovered` · `flag.gh01LongerVersion` · `flag.gh10Clue` · `flag.sceneShootLocked` · `flag.fifthChannelRisk` · `flag.roomToneIsolated` · `flag.nightContamination` · `flag.sourceRemains` · `flag.gh16LabelReturns` · `flag.workerFieldBlank`

#### (h) 밈 레이어 통산 상한 카운터 (GDD 7.3 · 10장 운용 규칙 · 11.3)

| 플래그 | 타입 | 산출 근거 |
|---|---|---|
| `flag.memeCoffeeGranted` | int 0~2 | 밈 레이어(OF-21~30 · IT-31~38 · GH-16~19) 커피 획득 런 통산. **상한 2** |
| `flag.memeSnackGranted` | int 0~2 | 동일 출처 간식 획득 런 통산. **상한 2** |

- 세 출처는 **하나의 런 카운터를 공유**한다.
- 상한 도달 후 동일 출처의 획득은 **0으로 처리**한다 — 선택지 문구와 연출은 그대로 출력하고 자원만 증가하지 않는다.
- 커피 소모를 무효화하는 효과(IT-37)도 실질 공급이므로 같은 카운터에 산입한다.
- 규칙상 도달 가능한 최대: **커피 18 / 간식 14**(GDD 9.5.5).

---

## 3. effects 연산자 명세

### 3.1 공통 필드

모든 effect 오브젝트는 `op`를 반드시 갖는다. 아래는 전 연산자 공통 선택 필드다.

| 필드 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `op` | string | — | **필수.** §3.2의 14종 중 하나 |
| `when` | string | `immediate` | 적용 시점. `immediate` / `endOfDay` / `nextDay` / `tonight` / `nextNight` / `d0` |
| `require` | string(DSL) | `""` | 이 효과만의 추가 조건. 거짓이면 해당 효과 1건만 건너뛴다 |
| `cap` | string | 없음 | `"memeLayer"` 지정 시 §2.5(h) 런 카운터를 소비하고 상한 초과분은 0으로 처리 |
| `note` | string | 없음 | GDD 원문 표기·해석 근거. 수치 없는 결과와 해석이 개입한 자리에는 **필수** |

### 3.2 연산자 14종

| # | `op` | 필수 필드 | 값 규약 |
|---|---|---|---|
| 1 | `track` | `target`, `delta` | `target`: `story` / `footage` / `post` / `master` / `total`. `total`은 "진척 합계 −10"(GH-14)처럼 GDD가 합계로 적은 자리 전용이며 트랙 배분은 시뮬 코어가 소유한다 |
| 2 | `resource` | `target`, `delta` | `target`: `clientTrust` / `sourceIntegrity` / `budget` / `revisionDebt` / `coffee` / `snack` / `fear` / `audienceResonance`. **`budget`은 `unit` 필수** |
| 3 | `char` | `target`, `stat`, `delta` | `stat`: `focus` / `hp` / `bond`. `target`: 인물 키 또는 집합 키(아래) |
| 4 | `flag` | `target` + (`value` 또는 `delta`) | `value`=대입(bool/int/string), `delta`=정수 가감. `target`은 §2.5 등재 플래그명. **예외 1건** — 18.6·18.7의 정수 카운터 `confirmFailStreak`는 플래그가 아니지만 `flag` 연산자로 직접 가감할 수 있다(GDD 10.3 2단계 "'컨펌 공포' 연속 실패 카운트 1 누적") |
| 5 | `status` | `target`, `mode` | `target`: 6.3 상태이상명. `mode`: `apply` / `clear` |
| 6 | `slot` | `target`, `mode` | `mode`: `consume`(`value`=슬롯 개수) / `outputPct`(`value`=%p) / `outputMul`(`value`=배율) / `delay`(`value`=일수) / `lock` / `dropAfternoon` / `dropMorning` |
| 7 | `spawnWeight` | `target` + (`delta` 또는 `mode`) | **밤에 작용하는 유일한 연산자.** `target`: 괴이 ID 또는 계열 배열. `delta`=%p(원문에 수치가 있을 때), `mode`=`raise`/`lower`(원문이 방향만 명시할 때). `scope`: `tonight`(기본) / `nextNight` / `run`. 별도 `delayDays`로 출현 지연 표현 |
| 8 | `item` | `target`, `mode` | `mode`: `grant` / `consume` |
| 9 | `eventDeck` | `mode` | `mode`: `preview` / `hide` / `reroll`. `count` 기본 1. `scope`: `reality`(기본) / `any` |
| 10 | `chain` | `target`, `mode` | `mode`: `reserve`(체인 스테이지 예약, `delay` 기본 1) / `end`(체인 종료) |
| 11 | `ending` | `target` | 즉시 엔딩 분기. `target`: `ED-09` 등 |
| 12 | `check` | `checkType`, `onSuccess`, `onFail` | `checkType`: `confirm` / `task` / `brave`. 선택: `actor`(수행자), `statKey`(업무 판정의 기준 능력치), `weighted`(false면 원문 '가중 없음'), `modifier`(%p). **판정 기본식은 데이터에 적지 않는다** |
| 13 | `random` | `chance`, `onHit`, `onMiss` | `chance`=`onHit` 발생 확률(%). GDD가 확률을 명시한 자리 전용. `chanceAlt`+`chanceAltCondition`으로 조건부 확률(GH-17 이혜미 유대도 60 이상 40%→20%) 표현 |
| 14 | `checkMod` | `checkType`, `delta` | GDD가 명시한 **개별 판정 보정만** 표현한다. `target`(적용 대상 괴이·선택지), `scope`(`firstEncounter` / `run` / `tonight`). 조우율 보정에는 **사용 금지** |

#### `char.target` 집합 키

| 키 | 대상 | 근거 |
|---|---|---|
| `all` | 5인 전원 | GDD "전원 집중력 −6" 등 |
| `assigned` | 당일 업무 슬롯 배치 인원 전원 | GDD "당일 배치 인원 전원"(OF-28 C) |
| `overtimeMembers` | 당일 야근 참여자 | GDD 6.2 |
| `actor` | 해당 선택지의 행위자 | GDD "결제자"(OF-23 A), "구매자"(OF-30 A) |
| `subject` | 이벤트가 지정한 대상 인물 | GDD "해당 인물"(OF-29) |
| 인물 키 5종 | 개인 | §1.5 |

#### `budget` 단위 규약

- GDD 5.2·9.5.5·10장 표의 예산 표기는 **만원 단위**다(초기 300 = 300만 원, OF-04 C = −30만 원).
- DSL 참조 필드 `budget`은 **원 단위**다(18.6, 18.3 예시 `2140000`).
- 따라서 예산 효과는 원문 숫자를 그대로 두고 `unit`을 명시한다.

```json
{ "op": "resource", "target": "budget", "delta": -30, "unit": "만원" }
```

시뮬 코어는 `unit: "만원"`을 10,000배해 `budget` 필드에 적용한다. DSL 조건은 원 단위로 적는다(`budget < 1000000`).

### 3.3 수치 없는 결과 규약

GDD가 결과를 "안전", "시간 소모", "화질 불일치"처럼 **문장으로만** 적은 자리에서는 숫자를 만들어 넣지 않는다.

```json
{ "op": "flag", "target": "qualityMismatch", "value": true, "note": "GDD 10장 OF-06 선택 A 원문 '화질 불일치' — 수치 미명시" }
```

- 플래그는 §2.5(g)에 등재한다.
- `note`에 **원문 문구와 "수치 미명시"** 를 반드시 남긴다.
- 검증기는 (g) 계열 플래그를 쓰는 효과에 `note`가 없으면 오류로 판정한다.

### 3.4 해석이 개입한 자리 표기 의무

GDD 표기를 정본 자원으로 옮기며 판단이 들어간 경우, `note`에 **원문 + 매핑 근거**를 남긴다. 본 데이터의 해당 건은 아래 4건이 전부다.

| 자리 | 원문 | 매핑 | 근거 |
|---|---|---|---|
| OF-16 선택 C | 화질 점수 −5 | `track master −5` | 프록시 마스터 납품이므로 5.1 마스터·납품(최종 규격·QC) 트랙 소관 |
| OF-20 선택 B | 품질 −4 | `track master −4` | 간이 변환 결과물의 규격 품질이므로 동일 소관 |
| OF-13 선택 C | 사운드 슬롯 추가 요구 | `slot editing consume 1` | 8.1 슬롯 6종에 사운드 슬롯이 없고 사운드 작업은 편집·모션 슬롯이 수행 |
| CH-01 3단계 | 버전 잠금 메타 모듈 | `pack.PK_04` | 13.2 PK-04 '버전 네이밍 규칙' |

---

## 4. `events.json` — 현실 제작 이벤트

### 4.1 최상위

```json
{ "schemaVersion": "4.0.0", "kind": "events", "source": "...", "events": [], "chains": [] }
```

- `events` — OF-01~30 **정확히 30건**. 증감 금지(GDD 10장).
- `chains` — 체인 2단계·3단계 정의. 30종 정원 밖이며 `id`는 `OF-XX-S2` 형식.

### 4.2 이벤트 오브젝트

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ● | `"OF-01"` |
| `name` | string | ● | GDD 이벤트명 |
| `phase` | string | ● | 전 이벤트 `"reality_event"`(18:00, GDD 10장 운용 규칙) |
| `days` | int[] | ● | §1.3 스케일 |
| `dayLabel` | string | ● | GDD 원문 표기 |
| `weight` | int | ● | 기본 추첨 가중치. GDD 10장 '발생 조건' 열의 % 값을 그대로 쓴다. **GDD 18.8 의사코드의 `e.baseWeight`가 이 값이다**(런타임 `w = baseWeight × tagModifier × repeatPenalty`). 확정 발생 이벤트는 `0` |
| `weightModifiers` | object[] | | `{condition(DSL), delta, note}`. GDD의 "+10%p" 조건부 가중 |
| `condition` | string(DSL) | ● | 발생 전제. 전제 없으면 `""` |
| `once` | bool | ● | 현실 이벤트 30종은 **전부 `true`**(GDD 18.8) |
| `cooldown` | int | | 현실 이벤트는 once이므로 쓰지 않는다(18.8) |
| `forced` | object | | `{condition, note}`. '확정' 표기 이벤트. 추첨보다 우선하며 그날 기본 1건으로 계산 |
| `ftueOverride` | object | | `{days, condition, note}`. FTUE·MVP 빌드 전용 예외(OF-01) |
| `memeLayer` | bool | ● | OF-21~30은 `true`. 70% 밈 밀도 상한·D-2~D-0 ×0.5 감쇠 대상 판별용(GDD 10.7) |
| `decayFromDay` | int | | 밈 이벤트의 후반 감쇠 시작 일차. `6`(D-2) 고정 |
| `text` | string | ● | 상황 텍스트. GDD 원문 |
| `choices` | object[] | ● | §4.3 |
| `chain` | string | | 연결된 체인 ID(`"CH-01"`) |
| `tags` | string[] | | 18.8 `tagModifier` 입력. `수정` / `촬영` / `납품` / `권리` / `사람` / `돈` / `인프라` / `근태` / `탕비실` |
| `note` | string | | 운용 주석 |

### 4.3 choice 오브젝트

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ● | 소문자 스네이크. 이벤트 내 유일 |
| `label` | string | ● | GDD 선택지 표기 그대로 |
| `slot` | string | ● | `"A"` / `"B"` / `"C"` / `"D"` — GDD 선택 열 위치. `"D"`는 선택지가 4개인 GH-15 전용 |
| `kind` | string | ● | `safe` / `gamble` / `value` (GDD 10장 "선택지는 안전·도박·가치 선택으로 구성") |
| `requires` | object | | `{ "dsl": "...", "text": "..." }`. **하드 요구.** GDD "○○ 배치 필요", "IT-26 필요" |
| `favors` | string[] | | **소프트 우대.** GDD "이영림 특기" 등. 미충족이어도 선택 가능 |
| `effects` | object[] | ● | §3 |
| `result` | string | ● | 결과 텍스트. GDD 효과 문구를 서술문 1~2문장으로 옮긴 화면 출력용 문장 |
| `resultOnFail` | string | | `check`·`random`이 있는 선택지의 실패 결과 텍스트 |
| `note` | string | | |

### 4.4 chain 오브젝트

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ● | `"CH-01"` |
| `name` | string | ● | GDD 체인 제목 |
| `source` | string | ● | GDD 절 번호(`"10.1"`) |
| `root` | string | ● | 1단계 이벤트 ID |
| `stages` | object[] | ● | 아래 |

stage 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ● | `"OF-01-S2"` |
| `name` | string | ● | 단계 제목 |
| `phase` | string | ● | `"reality_event"`. GDD 10.2 예외(D-1 수락 시 당일 야근 페이즈)는 `phaseFallback`에 기술 |
| `trigger` | object | ● | `{ "event": "OF-01", "choices": ["full_recut"], "delay": 1, "forced": true }` |
| `condition` | string(DSL) | ● | 예약도 조건을 만족해야 발동(18.8 2단계) |
| `text` | string | ● | 상황 텍스트 |
| `choices` | object[] | △ | §4.3과 동일 |
| `autoOutcomes` | object[] | △ | 선택이 아니라 상태 분기인 단계(CH-01 3단계). `{order, condition, effects, result}`. `order` 오름차순 첫 일치 1건만 적용 |
| `next` | string | | 다음 단계 ID |

`choices`와 `autoOutcomes` 중 정확히 하나만 존재해야 한다.

---

## 5. `ghosts.json` — 이면 괴이

### 5.1 최상위

```json
{ "schemaVersion": "4.0.0", "kind": "ghosts", "source": "...", "ghosts": [] }
```

`ghosts` — GH-01~19 **정확히 19건**(GDD 11.3).

### 5.2 괴이 오브젝트

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ● | `"GH-01"` |
| `name` | string | ● | GDD 괴이명 |
| `phase` | string | ● | 전 괴이 `"backstudio"` |
| `appearCondition` | object | ● | §5.3 |
| `text` | string | ● | 상황 텍스트. GDD 원문 |
| `choices` | object[] | ● | §5.4 |
| `failureDefinition` | object | ● | §5.5 |
| `codexRegisterCondition` | string | ● | GDD '도감 등록 조건' 원문 |
| `codexEntry` | object | ● | `{ "front": "...", "back": "..." }`. 앞면=플레이어 제작일지, 뒷면=SOURCE_0000 주석(GDD 13.3) |
| `dayPair` | object | ● | §5.6 |
| `spawnWeightModifiers` | object[] | | §5.7 |
| `memeLayer` | bool | ● | GH-16~19는 `true` |
| `givesCreditLedgerPiece` | int | ● | 0 또는 조각 번호(1·2·3). GH-04=1, GH-09=2, GH-12=3, 그 외 0(GDD 11.3 고정) |
| `note` | string | | |

### 5.3 appearCondition

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `days` | int[] | ● | §1.3 |
| `dayLabel` | string | ● | GDD 원문 |
| `dsl` | string | ● | 전제 조건. 없으면 `""` |
| `text` | string | ● | GDD '출현 조건' 원문 |
| `zone` | string | | 야간 진입 구역. `miniStudio` / `pantryArchive` / `office` / `playerDesk` / `floor4` |
| `oncePerRun` | bool | ● | GH-16~19는 `true`(GDD 11.3 신규 4종 편입 원칙) |
| `retriggerable` | bool | ● | GH-08은 `true`(재조우 가능) |
| `cooldown` | int | ● | 기본 `2`(GDD 18.8). `oncePerRun`이 true면 무의미하나 값은 유지 |
| `priority` | string | | `"top"` — GH-01 첫 야근 조우 테이블 최상단 우선 출현 |
| `recommendedDays` | int[] | | GDD가 '권장'으로만 적은 일차(GH-08·GH-14) |

### 5.4 괴이 choice 오브젝트

§4.3과 동일하되 아래를 추가한다.

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `braveCheck` | bool | ● | 담력 판정 필요 여부. **`true`인 선택지의 실패 처리는 `failureDefinition`이 정본**이며, 성공 효과만 `effects`에 적는다 |
| `explicitRisk` | bool | ● | GDD '명시 리스크' 여부. `true`면 `effects` 안에 `random`으로 확률과 악결과를 기술 |
| `kind` | string | ● | `safe` / `gamble` / `value` |

- 담력 판정의 기본식·계수는 데이터에 적지 않는다(GDD 11.2). `braveCheck: true` 하나로 코어가 판정한다.
- GDD가 명시한 개별 보정만 `checkMod`로 적는다(예: OF-27 선택 C의 GH-09 '누구인지 묻기' +10%p).

### 5.5 failureDefinition

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `text` | string | ● | GDD '실패 정의' 원문 |
| `braveChoices` | string[] | ● | 담력 판정 선택지 id 목록 |
| `riskChoices` | string[] | ● | 명시 리스크 선택지 id 목록 |
| `effects` | object[] | ● | 실패 시 적용 효과. 전용 상태이상이 없으면 `status apply 타임코드 오염` |
| `status` | string | ● | 연결 상태이상명. GH-04=다섯 번째 채널 / GH-05=동행 컷 / GH-10=렌더 루프 / GH-14=크레딧 소실 / 그 외=타임코드 오염 |

### 5.6 dayPair — 낮의 짝

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `text` | string | ● | 낮의 짝 서술 |
| `refs` | string[] | ● | 참조 ID(`OF-30` / `PR-04` / `P-01` / `IT-30` 등) |
| `source` | string | ● | 근거. `"GDD 11.3 낮의 짝"`(GH-16~19) / `"GDD 부록 C.1 낮→밤 페어"`(P-01~15 대응분) / `"GDD 11.3 출현 조건(낮의 전제)"`(나머지) |

### 5.7 spawnWeightModifiers

**밤에 작용하는 유일한 표현 수단.**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `condition` | string(DSL) | ● | 발동 조건 |
| `delta` | int | △ | %p. GDD가 수치를 명시한 경우 |
| `mode` | string | △ | `raise` / `lower`. GDD가 방향만 명시한 경우 |
| `scope` | string | ● | `tonight` / `nextNight` / `run` |
| `delayDays` | int | | 출현 지연 일수(10.5 선택 B의 GH-09 1일 지연) |
| `source` | string | ● | GDD 근거 위치 |
| `note` | string | ● | "6.2 이면 조우율 식 불변, 밤 조우 총량 불변" 명시 |

`delta`와 `mode`는 **정확히 하나만** 존재해야 한다.

---

## 6. `items.json` — 아이템 38종 (작성 가이드)

### 6.1 최상위

```json
{ "schemaVersion": "4.0.0", "kind": "items", "source": "FINAL-FINAL-D7-GDD.md v4.0 7.3", "items": [] }
```

`items` — IT-01~38 **정확히 38건**.

### 6.2 아이템 오브젝트

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ● | `"IT-01"` |
| `name` | string | ● | GDD 아이템명 |
| `slots` | int | ● | GDD '칸' 열. **변경 금지** |
| `effectText` | string | ● | GDD '효과' 열 원문 그대로 |
| `effects` | object[] | ● | §3 연산자로 기계화한 효과 |
| `flavor` | string | ● | GDD '플레이버' 열 원문 그대로. **낮 1줄(1~2문장)** |
| `hudBorder` | string | ● | `문서` / `장비` / `권리·원본` / `이면` — 15.2 기존 4종만. **신설 금지** |
| `memeLayer` | bool | ● | IT-31~38은 `true` |
| `zones` | string[] | ● | 등장 구역(7.1) |
| `spawnChance` | int | ● | 일일 스폰 확률(%). IT-31~38은 GDD 표 값 |
| `spawnChanceModifiers` | object[] | | `{condition, value, note}`. IT-35의 "야근 누적 1회 이상이면 40%" |
| `spawnDays` | int[] | ● | 등장 일차 |
| `respawn` | string | ● | `daily` / `oncePerRun` / `cooldown3d` / `none` |
| `acquireLimit` | int | | 런당 최대 획득 횟수. **IT-28=2, IT-29=2, IT-33=1**(GDD 7.3 규칙). 획득 1회 = 인벤토리 최초 편입 시점 |
| `capCounter` | string | | `"memeLayer"` — IT-31·32·37·38의 커피·간식 획득에 필수 |
| `nightRecovery` | string | | GDD '밤 회수 귀속' 열. **아이템 자리에 밤 문안을 쓰지 않는다** — 참조만 |
| `note` | string | | |

### 6.3 아이템 작성 금칙

1. IT-01~30의 **ID·이름·칸·효과값 변경 금지**. v4.0에서 추가된 것은 IT-28·IT-29의 획득 횟수 제한뿐이다.
2. 신설 8종(IT-31~38)은 D-0 게이트 6항목·납품 점수 공식·치명 누락 플래그 5종 어디에도 기여하지 않는다.
3. HUD 테두리 4종 외 신설 금지.
4. 어떤 아이템도 야근 진척에 보너스를 주지 않는다(GDD 21장 6번).
5. 커피·간식을 주는 밈 아이템에는 `capCounter: "memeLayer"`가 **필수**다.
6. 밤에 영향을 주는 아이템 효과(IT-34)는 `spawnWeight` 연산자로만 적는다.

---

## 7. `flavor.json` — 플레이버 텍스트 186줄 (작성 가이드)

### 7.1 최상위

```json
{ "schemaVersion": "4.0.0", "kind": "flavor", "source": "FINAL-FINAL-D7-GDD.md v4.0 부록 D", "flavor": [] }
```

### 7.2 계열과 정원 (GDD 부록 D)

| `category` | ID 형식 | 풀 크기 | 1런 노출 상한 |
|---|---|---|---|
| `loading` | `L-01`~`L-50` | 50 (낮 41 / 밤 6 / 복원 3) | 회차당 낮 20종 |
| `dailyLog` | `R-01`~`R-30` | 30 | 하루 1줄 · 런 5줄 |
| `messenger` | `N-01`~`N-26` | 26 | 하루 2건 · 런 9건 |
| `dialogue` | `C-HP-01`~`C-PL-06` | 30 (5인 × 6줄) | 런 12줄 (인물당 낮 2줄 + 밤 런 2줄) |
| `prop` | `PR-01`~`PR-30` | 30 | 화면당 3개 |
| `endingLine` | `E-01`~`E-12`, `EV-01`~`EV-08` | 20 | 엔딩당 1줄 |

합계 **186줄**.

### 7.3 flavor 오브젝트

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ● | 위 표의 ID 형식 |
| `category` | string | ● | 위 표의 키 |
| `text` | string | ● | 화면 출력 문장. **한 글자도 바꾸지 않고 GDD 원문** |
| `condition` | string(DSL) | ● | 표시 조건. 무조건이면 `""` |
| `priority` | int | | 낮을수록 우선(D.2 운용 규칙) |
| `memeRef` | string[] | ● | 연계 밈 ID(`MM-049`). 없으면 `[]` — 70% 상한의 분자에 넣지 않는다 |
| `pairRef` | string | | 낮→밤 페어 ID(`P-01`). 페어 열에만 사용 |
| `timeOfDay` | string | ● | `day` / `night` / `restore` |
| `subtype` | string | | 계열 내 구분. loading: `common`/`dayTransition`/`night`/`restore`. messenger: `대표`/`디렉터`/`PM`/`시스템` |
| `speaker` | string | | dialogue 전용. 인물 키 |
| `zone` | string | | prop 전용. 배치 구역(7.1) |
| `artNote` | string | | prop 전용. GDD '아트 지시' 열 |
| `nightVariant` | string | | prop 전용. GDD '밤 버전' 열 |
| `appliesTo` | string[] | | endingLine 전용. 적용 엔딩 ID 배열 |
| `replaces` | bool | | endingLine 변형(EV) 전용. `true` — 기본 문장을 **대체**하며 추가 출력이 아니다 |

### 7.4 플레이버 작성 금칙

1. **시스템 영향 0.** `effects` 필드가 존재해서는 안 된다. 문장은 상태를 읽기만 한다.
2. 새 자원·새 판정·새 선택지를 만들지 않는다.
3. 표시 조건은 전량 §2 DSL. 접두어 없는 임의 필드 사용 금지(`restoreUsed` 단독 표기는 문법 위반 → `flag.restoreUsed`).
4. 금지 밈 7종(MM-012·028·060·078·079·096·107)과 자리 없음 20종(MM-002·007·022·024·025·026·038·043·044·046·048·055·057·058·059·065·066·082·090·094) 인용 0건.
5. 밤의 '다섯 → 여섯' 인원수 수사는 **런당 최대 2회**이며 정본 자리는 P-05와 PR-01 밤 버전 둘뿐이다. 그 밖의 밤 문안은 **'이름 칸 공란'·'21:57 시각'** 두 오염축으로만 쓴다.
6. 야근·헌신을 성취로 서술하지 않는다. 야근 문장에는 대가를 함께 적는다.
7. 웃음의 과녁은 사람이 아니라 상황과 구조다. 5인 중 누구도 무능·태만·비하 대상이 되지 않는다.
8. 실존 브랜드·소프트웨어·거래처·계약 금액·메일 원문 표기 금지.

---

## 8. 검증 규칙 (validator)

검증기는 아래를 전부 통과해야 0오류를 보고한다. CI와 로컬 CLI 양쪽에서 실행 가능해야 한다(발주서 6.5-4).

### 8.1 구조

| # | 규칙 | 위반 시 |
|---|---|---|
| V-01 | 파일이 유효한 JSON이고 `schemaVersion`·`kind`·`source`가 존재한다 | 오류 |
| V-02 | 정원 일치: events 30 / chains 5 / ghosts 19 / items 38 / flavor 186 | 오류 |
| V-03 | ID 유일성·형식 일치(`OF-\d{2}`, `GH-\d{2}`, `IT-\d{2}`, `CH-\d{2}`, `OF-\d{2}-S\d`) | 오류 |
| V-04 | 정의되지 않은 필드가 존재하지 않는다 | 오류 |

### 8.2 조건 DSL

| # | 규칙 | 위반 시 |
|---|---|---|
| V-05 | 모든 `condition`·`dsl`·`require` 문자열이 §2.1 문법으로 파싱된다 | 오류 |
| V-06 | 참조 필드가 §2.3 표에 등재되어 있다 | 오류 |
| V-07 | 모든 `flag.<name>`이 §2.5 레지스트리에 등재되어 있다 | 오류 |
| V-08 | 산술 연산자·함수 호출이 0건이다 | 오류 |
| V-09 | 접두어 없는 미등재 최상위 필드가 0건이다 | 오류 |

### 8.3 효과

| # | 규칙 | 위반 시 |
|---|---|---|
| V-10 | 모든 `op`가 §3.2의 14종 안에 있다 | 오류 |
| V-11 | `resource.target == "budget"`이면 `unit`이 존재한다 | 오류 |
| V-12 | §2.5(g) 계열 플래그를 쓰는 효과에 `note`가 있다 | 오류 |
| V-13 | `flag` 연산자는 `value`와 `delta` 중 정확히 하나만 갖는다 | 오류 |
| V-14 | `spawnWeight`는 `delta`와 `mode` 중 정확히 하나만 갖는다 | 오류 |
| V-15 | 참조된 ID(`item.target`, `spawnWeight.target`, `chain.target`, `ending.target`, `status.target`)가 실재한다 | 오류 |

### 8.4 정본 불변 (핵심)

| # | 규칙 | 위반 시 |
|---|---|---|
| V-16 | **이면 조우율에 가감하는 연산자·필드가 0건이다.** `encounterRate`·`encounterBonus` 등 어떤 이름으로도 존재해서는 안 된다 | 오류(정본 위반) |
| V-17 | 밤에 작용하는 효과는 `spawnWeight`뿐이며, 모든 `spawnWeight`에 "6.2 이면 조우율 식 불변, 밤 조우 총량 불변" 취지의 `note`가 있다 | 오류(정본 위반) |
| V-18 | 담력·컨펌·업무 판정의 **기본식·계수를 재정의하는 데이터가 0건이다.** `checkMod`는 GDD가 명시한 개별 보정에만 쓰이고 근거 `note`를 갖는다 | 오류(정본 위반) |
| V-19 | 커피·간식을 증가시키는 밈 레이어(OF-21~30 / IT-31~38 / GH-16~19) 효과 전건에 `cap: "memeLayer"`가 있다 | 오류(정본 위반) |
| V-20 | 크레딧 장부 조각 지급처가 GH-04·GH-09·GH-12 **3곳뿐**이다(`givesCreditLedgerPiece != 0`인 괴이가 정확히 3건) | 오류(정본 위반) |
| V-21 | 신규 괴이 GH-16~19의 단일 선택 트랙 진척이 **+10 이하**이고, +10을 주는 선택에 원본 무결성 손실이 동반된다 | 오류(정본 위반) |
| V-22 | GH-16~19가 새 상태이상을 만들지 않는다(실패는 전부 '타임코드 오염') | 오류(정본 위반) |
| V-23 | 현실 이벤트 30종의 `once`가 전부 `true`다 | 오류 |
| V-24 | D-1(day 7)·D-0(day 8)에 `memeLayer: true` 이벤트가 편성되지 않았다(GDD 10.7) | 오류 |
| V-25 | 일차별 밈 점유율이 70% 이하다(GDD 10.7 검산표와 대조) | 오류 |

### 8.5 밈 밀도 대조표 (V-25 기준값 · GDD 10.7)

| 일차 | 기존 20종 | 밈 10종(감쇠 반영) | 합계 | 밈 점유율 |
|---|---|---|---|---|
| D-7 | 35 | 0 | 35 | 0% |
| D-6 | 95 | 140 | 235 | 59.6% |
| D-5 | 155 | 180 | 335 | 53.7% |
| D-4 | 240 | 225 | 465 | 48.4% |
| D-3 | 295 | 170 | 465 | 36.6% |
| D-2 | 270 | 37 (감쇠 전 75) | 307 | 12.1% |
| D-1 | 170 | 0 | 170 | 0% |

D-2~D-0 구간은 밈 이벤트 가중치에 ×0.5를 적용하고 **소수 내림**한다(25→12 / 30→15 / 20→10).

---

## 9. 작성 체크리스트

- [ ] 정원이 맞는가(events 30 / chains 5 / ghosts 19 / items 38 / flavor 186)
- [ ] GDD 표의 수치를 한 건도 빠뜨리거나 반올림하지 않았는가
- [ ] `TBD`·`null`·빈 문자열로 회피한 값이 0건인가
- [ ] 예산 효과에 `unit: "만원"`을 붙였는가
- [ ] 수치 없는 결과에 `note`(원문 + "수치 미명시")를 남겼는가
- [ ] 밤에 작용하는 효과를 `spawnWeight`로만 적었는가
- [ ] 조우율 가감 항을 만들지 않았는가
- [ ] 밈 레이어 커피·간식에 `cap: "memeLayer"`를 붙였는가
- [ ] 사용한 모든 `flag.<name>`이 §2.5에 등재되어 있는가
- [ ] `node -e "JSON.parse(require('fs').readFileSync('<파일>','utf8'))"` 가 통과하는가
