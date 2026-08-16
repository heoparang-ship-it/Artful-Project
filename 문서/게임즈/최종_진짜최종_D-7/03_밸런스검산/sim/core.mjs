/**
 * core.mjs — 《최종_진짜최종: D-7》 엔진 독립 시뮬레이션 코어 (레퍼런스 구현)
 *
 * 근거: GDD v4.0 18.1 "시뮬레이션 코어: 엔진 독립" / 발주서 6.2-2)
 * 원칙:
 *  - 의존성 0. `phaser`·`window`·`document` 참조 0건(발주서 6.2-2 수용 기준).
 *  - 모든 함수는 순수 함수다. 인자로 받은 객체를 변형하지 않고 새 값을 반환한다.
 *  - 밸런스 수식은 이 모듈이 소유한다. 조건 DSL은 상태 조회만 한다(발주서 6.5-2).
 *  - 수치는 GDD 정본 그대로다. 이 파일에서 상수를 바꾸면 AC-BAN-01 위반이다.
 *
 * @module core
 */

export const GDD_VERSION = '4.0';
export const SCHEMA_VERSION = '4.0.0';

/* ------------------------------------------------------------------------- *
 * 0. 공용 유틸
 * ------------------------------------------------------------------------- */

/**
 * 값을 [lo, hi] 구간으로 클램프한다.
 * @param {number} v
 * @param {number} lo
 * @param {number} hi
 * @returns {number}
 */
export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

/* ------------------------------------------------------------------------- *
 * 1. 정본 데이터 — 인물 / 슬롯 / 자원 / 난이도
 * ------------------------------------------------------------------------- */

/**
 * 인물 능력치 정본. (GDD 3.2~3.6, 9.5.1)
 * 키 순서는 GDD 표기 순서이며, 평균 집중력 산정(6.2)의 합산 순서로도 쓰인다.
 * @type {Readonly<Object<string, {name: string, plan: number, direct: number, manage: number, post: number, focusMax: number, staminaMax: number}>>}
 */
export const CHARACTERS = Object.freeze({
  HP: { name: '허파랑', plan: 9, direct: 10, manage: 7, post: 6, focusMax: 90, staminaMax: 80 },
  YL: { name: '이영림', plan: 10, direct: 9, manage: 7, post: 5, focusMax: 85, staminaMax: 75 },
  HM: { name: '이혜미', plan: 7, direct: 6, manage: 10, post: 8, focusMax: 90, staminaMax: 80 },
  MR: { name: '손미림', plan: 6, direct: 9, manage: 8, post: 10, focusMax: 80, staminaMax: 75 },
  PL: { name: '플레이어', plan: 6, direct: 6, manage: 6, post: 6, focusMax: 85, staminaMax: 90 },
});

/** 인물 키 정본 순서. (GDD 3장) @type {ReadonlyArray<string>} */
export const CHARACTER_ORDER = Object.freeze(['HP', 'YL', 'HM', 'MR', 'PL']);

/**
 * 업무 슬롯 6종. (GDD 8.1 / 9.5.1 "슬롯 주요 트랙과 대응 능력치")
 * focusCost·staminaCost는 기본 소모, stat은 개인 산출에 쓰는 대응 능력치,
 * track은 개인 산출이 적립되는 주요 트랙이다.
 * @type {Readonly<Object<string, {label: string, focusCost: number, staminaCost: number, stat: string|null, track: string|null}>>}
 */
export const SLOTS = Object.freeze({
  기획: { label: '기획·구성', focusCost: 6, staminaCost: 3, stat: 'plan', track: 'story' },
  프리: { label: '프리프로덕션', focusCost: 5, staminaCost: 4, stat: 'manage', track: 'story' },
  촬영: { label: '촬영·현장', focusCost: 7, staminaCost: 9, stat: 'direct', track: 'footage' },
  편집: { label: '편집·모션', focusCost: 8, staminaCost: 6, stat: 'post', track: 'post' },
  QC: { label: '최종 납품 QC', focusCost: 7, staminaCost: 5, stat: 'post', track: 'master' },
  회복: { label: '정리·회복', focusCost: -14, staminaCost: -10, stat: null, track: null },
});

/**
 * 플레이어 패시브 핸드오프의 인접 공정. (GDD 9.5.1 전제 5)
 * @type {Readonly<Object<string, string>>}
 */
export const NEXT_TRACK = Object.freeze({ story: 'footage', footage: 'post', post: 'master', master: 'post' });

/** 트랙 4종 초기값. (GDD 5.1) */
export const TRACK_INIT = Object.freeze({ story: 12, footage: 0, post: 0, master: 0 });

/** 보조 자원 초기값·범위. (GDD 5.2) */
export const RESOURCE_SPEC = Object.freeze({
  clientTrust: { init: 50, min: 0, max: 100 },
  sourceIntegrity: { init: 75, min: 0, max: 100 },
  budget: { init: 3000000, min: -1000000, max: 7000000 },
  revisionDebt: { init: 0, min: 0, max: 60 },
  coffee: { init: 6, min: 0, max: 20 },
  snack: { init: 4, min: 0, max: 15 },
  fear: { init: 0, min: 0, max: 100 },
  audienceResonance: { init: 0, min: 0, max: 100 },
});

/**
 * 난이도 4단계. (GDD 6.4 — 발주서 6.3-5 "데이터로 구현하며 하드코딩을 금지")
 * gateDelta는 5.3 게이트 6항목(트랙 4종·무결성·신뢰)에 일괄 가산하는 값이다.
 * encounterBase는 6.2 "기본 30%" 항의 치환값이다.
 * @type {Readonly<Object<string, {label: string, encounterBase: number, gateDelta: number, budget: number, dailyDebt: number, retakeMult: number, restoreLimit: number|null}>>}
 */
export const DIFFICULTY = Object.freeze({
  rough_cut: { label: '가편집', encounterBase: 22, gateDelta: -10, budget: 4000000, dailyDebt: 0, retakeMult: 0.8, restoreLimit: null },
  main_cut: { label: '본편집', encounterBase: 30, gateDelta: 0, budget: 3000000, dailyDebt: 0, retakeMult: 1.0, restoreLimit: null },
  directors_cut: { label: '감독판', encounterBase: 38, gateDelta: 5, budget: 2500000, dailyDebt: 1, retakeMult: 1.25, restoreLimit: null },
  uncompressed: { label: '무압축', encounterBase: 46, gateDelta: 10, budget: 2000000, dailyDebt: 2, retakeMult: 1.6, restoreLimit: 3 },
});

/** 난이도 키 정본 순서. (GDD 6.4) */
export const DIFFICULTY_ORDER = Object.freeze(['rough_cut', 'main_cut', 'directors_cut', 'uncompressed']);

/** 일차 라벨. D-7을 1일차, D-0을 8일차로 센다. (GDD 13.1 v4.0 보정 ②) */
export const DAYS = Object.freeze(['D-7', 'D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1']);

/** D-0 게이트 기준치(본편집). (GDD 5.3) */
export const GATE_BASE = Object.freeze({
  story: 80, footage: 85, post: 80, master: 75, sourceIntegrity: 65, clientTrust: 45,
});

/** 치명 누락 플래그 5종. (GDD 5.3) */
export const CRITICAL_MISS_FLAGS = Object.freeze([
  '미동의 출연자', '미확인 음악', '분실 원본', '코덱 불일치', '자막 미검수',
]);

/* ------------------------------------------------------------------------- *
 * 2. 개인 산출 / 컨디션 계수
 * ------------------------------------------------------------------------- */

/**
 * 컨디션 계수. (GDD 8.2)
 *   컨디션 계수 = 0.5 + 0.005 × min(집중력, 체력)
 * 계수는 그날 아침(배치 시점) 값으로 고정하고, 슬롯 소모는 산출 확정 후 적용한다(GDD 9.5.1).
 * @param {number} focus 집중력
 * @param {number} stamina 체력
 * @returns {number} 컨디션 계수
 */
export function conditionCoefficient(focus, stamina) {
  return 0.5 + 0.005 * Math.max(0, Math.min(focus, stamina));
}

/**
 * 개인 산출. (GDD 8.2 / 9.5.1 산출 결합 규칙)
 *   개인 산출 = 해당 능력치 × 컨디션 계수 × 장비·시너지 보정
 * 프레임 드롭(GDD 6.3 산출 -35%)은 penalty=0.65로 전달한다.
 * @param {{stat: number, focus: number, stamina: number, mult?: number, penalty?: number}} arg
 * @returns {number} 개인 산출값
 */
export function personalOutput({ stat, focus, stamina, mult = 1.0, penalty = 1.0 }) {
  return stat * conditionCoefficient(focus, stamina) * mult * penalty;
}

/**
 * 슬롯 실행 1회의 트랙 증가에서 '개인 산출 합'을 구한다. (GDD 9.5.1)
 *   Σ 수행자 개인 산출 → 슬롯 주요 트랙에 적립
 * 합산 순서는 members 배열 순서를 그대로 따른다(부동소수 재현성).
 * @param {{slot: string, members: string[], cond: Object<string, {focus: number, stamina: number}>, mult?: number, framedrop?: Set<string>}} arg
 * @returns {number}
 */
export function slotOutput({ slot, members, cond, mult = 1.0, framedrop = null }) {
  const spec = SLOTS[slot];
  if (!spec || spec.stat === null) return 0;
  let out = 0;
  for (const m of members) {
    const c = cond[m];
    out += personalOutput({
      stat: CHARACTERS[m][spec.stat],
      focus: c.focus,
      stamina: c.stamina,
      mult,
      penalty: framedrop && framedrop.has(m) ? 0.65 : 1.0,
    });
  }
  return out;
}

/* ------------------------------------------------------------------------- *
 * 3. 컨펌 판정 (페이즈 5)
 * ------------------------------------------------------------------------- */

/**
 * 컨펌 성공률. (GDD 6.1 페이즈 5 컨펌 판정)
 *   55 + (기획·서사 ÷ 4) + (클라이언트 신뢰 − 50) × 0.4 − (수정 부채 ÷ 2)
 * 페어 '브리프 잠금' +20%p, 이영림 액티브, 상태이상 '컨펌 공포' −15%p 등은 bonus로 합산한다.
 * 최종값은 5~95%로 클램프한다.
 * @param {{story: number, clientTrust: number, revisionDebt: number, bonus?: number}} arg
 * @returns {number} 성공률(%)
 */
export function confirmRate({ story, clientTrust, revisionDebt, bonus = 0 }) {
  const raw = 55 + story / 4 + (clientTrust - 50) * 0.4 - revisionDebt / 2 + bonus;
  return clamp(raw, 5, 95);
}

/**
 * 컨펌 결과 적용값. (GDD 6.1 페이즈 5 결과표)
 * D-4는 중간 컨펌으로 결과가 2배 가중된다(성공 신뢰 +6 / 실패 부채 +8).
 * @param {{rate: number, isMidterm?: boolean, roll?: number|null, failStreak?: number}} arg
 *   roll이 null이면 GDD 9.5.1 전제 3의 기대값 근사(성공률 50 이상이면 성공)를 쓴다.
 * @returns {{success: boolean, trustDelta: number, debtDelta: number, failStreak: number, confirmFear: boolean}}
 */
export function resolveConfirm({ rate, isMidterm = false, roll = null, failStreak = 0 }) {
  const success = roll === null ? rate >= 50 : roll * 100 < rate;
  if (success) {
    return { success: true, trustDelta: isMidterm ? 6 : 3, debtDelta: 0, failStreak: 0, confirmFear: false };
  }
  const streak = failStreak + 1;
  return {
    success: false,
    trustDelta: -3,
    debtDelta: isMidterm ? 8 : 4,
    failStreak: streak,
    confirmFear: streak >= 2, // 2회 연속 실패 → 상태이상 '컨펌 공포'(GDD 6.3)
  };
}

/* ------------------------------------------------------------------------- *
 * 4. 업무 판정 (크리티컬 / 실수)
 * ------------------------------------------------------------------------- */

/**
 * 크리티컬 확률. (GDD 8.2 업무 판정)
 *   10 + 적합 인물 배치 5 + 요구 장비 완비 5 + 페어 시너지 명시 효과 + 전공 보정 5
 * 상한 40%.
 * @param {{fitCast?: boolean, gearComplete?: boolean, pairBonus?: number, majorMatch?: boolean}} arg
 * @returns {number} 확률(%)
 */
export function criticalChance({ fitCast = false, gearComplete = false, pairBonus = 0, majorMatch = false }) {
  const raw = 10 + (fitCast ? 5 : 0) + (gearComplete ? 5 : 0) + pairBonus + (majorMatch ? 5 : 0);
  return Math.min(40, raw);
}

/**
 * 실수(제작사고) 확률. (GDD 8.2 업무 판정)
 *   5 + (집중 또는 체력 40 미만 10) + (25 미만 20 — 40 미만 보정 대체)
 *     + (요구 장비 미비 15) − (정리·회복 배치 보정 10, GDD 8.3)
 * 상한 60%.
 * @param {{focus: number, stamina: number, gearMissing?: boolean, restedYesterday?: boolean}} arg
 * @returns {number} 확률(%)
 */
export function mistakeChance({ focus, stamina, gearMissing = false, restedYesterday = false }) {
  const low = Math.min(focus, stamina);
  let raw = 5;
  if (low < 25) raw += 20;
  else if (low < 40) raw += 10;
  if (gearMissing) raw += 15;
  raw = Math.min(60, raw);
  if (restedYesterday) raw -= 10;
  return Math.max(0, raw);
}

/**
 * 업무 판정. 산출 확정 직전에 크리티컬과 실수를 순서대로 1회씩 판정하고,
 * 동시에 나오면 실수가 우선한다. (GDD 8.2)
 * @param {{critChance: number, missChance: number, rollCrit: number, rollMiss: number}} arg
 *   rollCrit·rollMiss는 production 스트림의 [0,1) 난수.
 * @returns {{result: 'critical'|'mistake'|'success', critical: boolean, mistake: boolean}}
 */
export function resolveWork({ critChance, missChance, rollCrit, rollMiss }) {
  const critical = rollCrit * 100 < critChance;
  const mistake = rollMiss * 100 < missChance;
  if (mistake) return { result: 'mistake', critical: false, mistake: true };
  if (critical) return { result: 'critical', critical: true, mistake: false };
  return { result: 'success', critical: false, mistake: false };
}

/**
 * 실패 결과가 명시되지 않은 카드의 기본 실수 처리. (GDD 8.2)
 *   산출 절반 + 수정 부채 +2
 * @param {number} output
 * @returns {{output: number, revisionDebt: number}}
 */
export function defaultMistakePenalty(output) {
  return { output: output / 2, revisionDebt: 2 };
}

/* ------------------------------------------------------------------------- *
 * 5. 이면 조우율 (6.2) — 식 불변 원칙
 * ------------------------------------------------------------------------- */

/**
 * 이면 조우율. (GDD 6.2 / 난이도별 기본률 6.4)
 *   기본률(난이도)
 *   + 야근 인원 1명당 7%p
 *   + 평균 집중력 40 미만이면 15%p
 *   + 수정 부채 10당 4%p
 *   + D-4부터 하루당 5%p 누적
 *   − 원본 무결성 80 이상이면 10%p
 *
 * **식 불변 원칙(GDD 6.2 v4.0 확정)**: 위 여섯 항이 전부다. 이 식에 없는 당일 가감 항을
 * 추가하는 구현은 AC-BAN-01 위반이다. 밤에 영향을 주는 이벤트·아이템·괴이는 IT-34 방식
 * (개별 괴이 출현률 분포만 변경)으로만 처리하며 이 함수를 건드리지 않는다.
 * 유일한 예외는 6.4의 난이도별 기본률로, 새 항이 아니라 "기본 30%" 항의 치환이다.
 *
 * @param {{difficulty?: string, overtimeCount: number, avgFocus: number, revisionDebt: number, dayIndex: number, sourceIntegrity: number}} arg
 *   dayIndex는 0=D-7 … 6=D-1. D-4(=3)부터 5×(dayIndex−2)를 가산한다.
 * @returns {number} 조우율(%), 5~95 클램프
 */
export function backStudioEncounterRate({
  difficulty = 'main_cut', overtimeCount, avgFocus, revisionDebt, dayIndex, sourceIntegrity,
}) {
  return clamp(encounterRateRaw({ difficulty, overtimeCount, avgFocus, revisionDebt, dayIndex, sourceIntegrity }), 5, 95);
}

/**
 * 이면 조우율의 클램프 전 원값. 검증 테스트(19.5.3 3번)에서 항별 합산을 대조할 때 쓴다.
 * (GDD 6.2)
 * @param {{difficulty?: string, overtimeCount: number, avgFocus: number, revisionDebt: number, dayIndex: number, sourceIntegrity: number}} arg
 * @returns {number}
 */
export function encounterRateRaw({
  difficulty = 'main_cut', overtimeCount, avgFocus, revisionDebt, dayIndex, sourceIntegrity,
}) {
  const spec = DIFFICULTY[difficulty];
  if (!spec) throw new Error(`unknown difficulty: ${difficulty}`);
  let r = spec.encounterBase;          // ① 기본률(6.4가 6.2의 "기본 30%"를 치환)
  r += 7 * overtimeCount;              // ② 야근 인원 1명당 +7%p
  if (avgFocus < 40) r += 15;          // ③ 평균 집중력 40 미만 +15%p
  r += 4 * Math.floor(revisionDebt / 10); // ④ 수정 부채 10당 +4%p
  if (dayIndex >= 3) r += 5 * (dayIndex - 2); // ⑤ D-4부터 하루당 +5%p 누적
  if (sourceIntegrity >= 80) r -= 10;  // ⑥ 원본 무결성 80 이상 −10%p
  return r;
}

/* ------------------------------------------------------------------------- *
 * 6. 담력 판정 (11.2)
 * ------------------------------------------------------------------------- */

/**
 * 담력 성공률. (GDD 11.2 공포 판정)
 *   65 + (플레이어 집중력 − 50) ÷ 5 + (도감 등록 시 15)
 *      + (무결성 80 이상 +10 / 40 미만 −10) − 공포 ÷ 4 − 수정 부채 ÷ 3
 * 최종값 5~95% 클램프.
 * 예시 검증(GDD 11.2): 집중 60·도감 등록·무결성 82·공포 20·부채 12 → 83%.
 * @param {{playerFocus: number, codexRegistered?: boolean, sourceIntegrity: number, fear: number, revisionDebt: number}} arg
 * @returns {number} 성공률(%)
 */
export function braveryRate({ playerFocus, codexRegistered = false, sourceIntegrity, fear, revisionDebt }) {
  let r = 65;
  r += (playerFocus - 50) / 5;
  if (codexRegistered) r += 15;
  if (sourceIntegrity >= 80) r += 10;
  else if (sourceIntegrity < 40) r -= 10;
  r -= fear / 4;
  r -= revisionDebt / 3;
  return clamp(r, 5, 95);
}

/* ------------------------------------------------------------------------- *
 * 7. D-0 게이트 / 납품 점수 / 엔딩
 * ------------------------------------------------------------------------- */

/**
 * 난이도별 D-0 게이트 기준치. (GDD 5.3 + 6.4 "D-0 게이트 전 항목 ±")
 * @param {string} [difficulty]
 * @returns {{story: number, footage: number, post: number, master: number, sourceIntegrity: number, clientTrust: number}}
 */
export function gateThresholds(difficulty = 'main_cut') {
  const d = DIFFICULTY[difficulty];
  if (!d) throw new Error(`unknown difficulty: ${difficulty}`);
  const out = {};
  for (const [k, v] of Object.entries(GATE_BASE)) out[k] = v + d.gateDelta;
  return out;
}

/**
 * D-0 게이트 판정. 7항목 전부 충족해야 납품 검수가 시작된다. (GDD 5.3)
 * 치명 누락 플래그 0개 조건은 전 난이도 동일하다(GDD 6.4).
 * @param {{tracks: {story: number, footage: number, post: number, master: number}, resources: {sourceIntegrity: number, clientTrust: number}, criticalMisses?: string[]}} state
 * @param {string} [difficulty]
 * @returns {{passed: boolean, checks: Array<{key: string, value: number, threshold: number, ok: boolean}>, criticalMissOk: boolean}}
 */
export function d0Gate(state, difficulty = 'main_cut') {
  const th = gateThresholds(difficulty);
  const val = {
    story: state.tracks.story,
    footage: state.tracks.footage,
    post: state.tracks.post,
    master: state.tracks.master,
    sourceIntegrity: state.resources.sourceIntegrity,
    clientTrust: state.resources.clientTrust,
  };
  const checks = Object.keys(GATE_BASE).map((k) => ({ key: k, value: val[k], threshold: th[k], ok: val[k] >= th[k] }));
  const criticalMissOk = (state.criticalMisses ?? []).length === 0;
  return { passed: checks.every((c) => c.ok) && criticalMissOk, checks, criticalMissOk };
}

/**
 * 최종 납품 점수. (GDD 5.3 공식 / 9.5.6 8단계 검산)
 *   기획×0.20 + 촬영×0.25 + 편집×0.25 + 마스터×0.15
 *   + 무결성×0.10 + 신뢰×0.05 − 수정 부채×0.35
 *   (관객 공감 60 이상이면 +3 — GDD 5.2 보조 자원 운용 보강)
 * @param {{tracks: {story: number, footage: number, post: number, master: number}, resources: {sourceIntegrity: number, clientTrust: number, revisionDebt: number, audienceResonance?: number}}} state
 * @returns {number} 납품 점수
 */
export function deliveryScore(state) {
  const t = state.tracks;
  const r = state.resources;
  let s = t.story * 0.20 + t.footage * 0.25 + t.post * 0.25 + t.master * 0.15
    + r.sourceIntegrity * 0.10 + r.clientTrust * 0.05 - r.revisionDebt * 0.35;
  if ((r.audienceResonance ?? 0) >= 60) s += 3;
  return s;
}

/**
 * 납품 점수 티어. (GDD 5.3 표)
 * @param {number} score
 * @returns {'fail'|'barely'|'good'|'masterpiece'}
 */
export function deliveryTier(score) {
  if (score < 75) return 'fail';
  if (score < 85) return 'barely';
  if (score < 95) return 'good';
  return 'masterpiece';
}

/**
 * 엔딩별 최초 달성 리테이크 노트 보상. (GDD 12장 'v4.0 신설 열')
 * @type {Readonly<Object<string, number>>}
 */
export const ENDING_REWARD = Object.freeze({
  'ED-01': 60, 'ED-02': 70, 'ED-03': 80, 'ED-04': 25, 'ED-05': 20, 'ED-06': 30,
  'ED-07': 30, 'ED-08': 30, 'ED-09': 40, 'ED-10': 20, 'ED-11': 150, 'ED-12': 100,
});

/**
 * 엔딩 판정. 우선순위는 GDD 12.2를 그대로 따른다.
 *  1) 즉시 실패형 ED-05·ED-09·ED-10
 *  2) D-0 기술 실패형 ED-06·ED-07·ED-08
 *  3) 진엔딩 ED-11 → 4) 특수 굿엔딩 ED-12
 *  5) 성공 티어 ED-03 → ED-02 → ED-01 → 6) 기본 실패 ED-04
 * @param {object} state 런 상태
 * @param {string} [difficulty]
 * @returns {{id: string, score: number, gate: ReturnType<typeof d0Gate>}}
 */
export function resolveEnding(state, difficulty = 'main_cut') {
  const r = state.resources;
  const f = state.flags ?? {};
  const gate = d0Gate(state, difficulty);
  const score = deliveryScore(state);

  // 1) 즉시 실패형
  if (r.sourceIntegrity <= 0) return { id: 'ED-05', score, gate };
  if (r.fear >= 100 || f.gh15Unowned === true) return { id: 'ED-09', score, gate };
  if ((f.collapsedCrew ?? 0) >= 3) return { id: 'ED-10', score, gate };
  // 2) D-0 기술 실패형
  if (f.criticalSpecError === true) return { id: 'ED-06', score, gate };
  if (f.renderLoop === true) return { id: 'ED-07', score, gate };
  if (r.revisionDebt >= 60) return { id: 'ED-08', score, gate };
  // 3) 진엔딩
  if (f.traceableMaster === true && score >= 85 && gate.passed) return { id: 'ED-11', score, gate };
  // 4) 특수 굿엔딩
  if (gate.passed && score >= 90 && (state.stats?.totalOvertime ?? 0) === 0 && r.revisionDebt <= 10) {
    return { id: 'ED-12', score, gate };
  }
  // 5) 성공 티어
  if (gate.passed) {
    if (score >= 95 && r.sourceIntegrity >= 90 && (state.stats?.totalOvertime ?? 0) <= 2) return { id: 'ED-03', score, gate };
    if (score >= 85 && (f.allCrewStayed ?? true)) return { id: 'ED-02', score, gate };
    if (score >= 75) return { id: 'ED-01', score, gate };
  }
  // 6) 기본 실패
  return { id: 'ED-04', score, gate };
}

/* ------------------------------------------------------------------------- *
 * 8. 리테이크 노트 획득식 (13.1)
 * ------------------------------------------------------------------------- */

/**
 * 리테이크 노트 획득량. (GDD 13.1 획득식 + v4.0 보정 ①②)
 *   도달 일차 × 8 + 최종 납품 점수 + 신규 괴이 도감 × 12 + 새 엔딩 × 40 + 원본 무결성 ÷ 2
 * 보정 ① 최초 달성 엔딩은 '새 엔딩 × 40' 대신 12장 보상표의 차등값(20~150)으로 지급.
 * 보정 ② 합계에 난이도 배율을 곱한다(가편집 0.8 / 본편집 1.0 / 감독판 1.25 / 무압축 1.6).
 * 도달 일차는 D-7을 1일차, D-0을 8일차로 센다.
 * @param {{dayReached: number, deliveryScore: number, newCodexCount?: number, newEndings?: string[], sourceIntegrity: number, difficulty?: string}} arg
 * @returns {{total: number, breakdown: {day: number, score: number, codex: number, endings: number, integrity: number}, mult: number}}
 */
export function retakeNotes({
  dayReached, deliveryScore: score, newCodexCount = 0, newEndings = [], sourceIntegrity, difficulty = 'main_cut',
}) {
  const d = DIFFICULTY[difficulty];
  if (!d) throw new Error(`unknown difficulty: ${difficulty}`);
  const dayPart = dayReached * 8;
  const codexPart = newCodexCount * 12;
  // 보정 ①: 최초 달성 엔딩은 보상표 차등값, 표에 없는 엔딩은 기준값 40.
  const endingPart = newEndings.reduce((acc, id) => acc + (ENDING_REWARD[id] ?? 40), 0);
  const integrityPart = sourceIntegrity / 2;
  const sum = dayPart + score + codexPart + endingPart + integrityPart;
  return {
    total: sum * d.retakeMult,
    breakdown: { day: dayPart, score, codex: codexPart, endings: endingPart, integrity: integrityPart },
    mult: d.retakeMult,
  };
}

/* ------------------------------------------------------------------------- *
 * 9. 커피·간식 총공급 제동 (7.3 / 9.5.5) — AC-MEM-06 · AC-MEM-08
 * ------------------------------------------------------------------------- */

/** 밈 레이어 출처 판별 정규식. OF-21~30 / IT-31~38 / GH-16~19. (GDD 7.3 서두) */
const MEME_SOURCE = /^(OF-(2[1-9]|30)|IT-3[1-8]|GH-1[6-9])$/;

/**
 * 출처 ID가 밈 레이어(OF-21~30·IT-31~38·GH-16~19)에 속하는지. (GDD 7.3)
 * @param {string} id
 * @returns {boolean}
 */
export function isMemeSource(id) {
  return MEME_SOURCE.test(id);
}

/**
 * 커피·간식 공급 제동 상수. (GDD 7.3 / 9.5.5 확정치)
 *   커피 초기 6 + IT-28(+5) × 2 + 밈 레이어 +2 = 18 (보유 상한 20)
 *   간식 초기 4 + IT-29(+4) × 2 + 밈 레이어 +2 = 14 (보유 상한 15)
 */
export const SUPPLY_CAP = Object.freeze({
  coffeeTotal: 18, snackTotal: 14,
  coffeeHold: 20, snackHold: 15,
  memeCoffee: 2, memeSnack: 2,
  it28Limit: 2, it29Limit: 2,
});

/**
 * 공급 원장 생성. 초기 보유는 GDD 5.2(커피 6 / 간식 4).
 * @returns {{coffee: number, snack: number, coffeeGained: number, snackGained: number, itemCount: Object<string, number>, memeCoffee: number, memeSnack: number, seenInstances: string[], log: Array<object>}}
 */
export function createSupplyLedger() {
  return {
    coffee: RESOURCE_SPEC.coffee.init,
    snack: RESOURCE_SPEC.snack.init,
    coffeeGained: 0,
    snackGained: 0,
    itemCount: {},
    memeCoffee: 0,
    memeSnack: 0,
    seenInstances: [],
    log: [],
  };
}

/**
 * IT-28·IT-29의 스폰 가능 여부. 2회 획득한 런에서는 잔여 일차에 재스폰하지 않는다.
 * (GDD 7.3 런당 획득 상한 / AC-MEM-08 ㉡)
 * @param {ReturnType<typeof createSupplyLedger>} ledger
 * @param {string} itemId
 * @returns {boolean}
 */
export function canSpawn(ledger, itemId) {
  if (itemId === 'IT-28') return (ledger.itemCount['IT-28'] ?? 0) < SUPPLY_CAP.it28Limit;
  if (itemId === 'IT-29') return (ledger.itemCount['IT-29'] ?? 0) < SUPPLY_CAP.it29Limit;
  if (itemId === 'IT-33') return (ledger.itemCount['IT-33'] ?? 0) < 1; // 런당 1회 (GDD 7.3)
  return true;
}

/**
 * 자원 획득 적용. 두 카운터를 **분리**해 운영한다. (GDD 7.3 / AC-MEM-08 단서 3)
 *  - IT-28·IT-29: 런당 획득 횟수 상한(각 2회). 상한 도달 후 스폰 차단.
 *  - 밈 레이어(OF-21~30·IT-31~38·GH-16~19): 커피 통산 +2 / 간식 통산 +2.
 *    상한 도달 후의 획득은 **0으로 기록**한다(획득 문구는 표시, 자원은 증가하지 않음).
 * 획득 1회의 정의: 인벤토리 최초 편입 시점. 드롭 후 재획득은 카운터 미증가·자원 미재지급
 * (GDD 7.3 '획득 1회의 정의' / AC-MEM-08 단서 6). instanceId로 동일 실물을 식별한다.
 * @param {ReturnType<typeof createSupplyLedger>} ledger
 * @param {{sourceId: string, instanceId?: string, coffee?: number, snack?: number, day?: string}} gain
 * @returns {{ledger: ReturnType<typeof createSupplyLedger>, grantedCoffee: number, grantedSnack: number, counted: boolean, reason: string}}
 */
export function applySupplyGain(ledger, { sourceId, instanceId = null, coffee = 0, snack = 0, day = null }) {
  const next = {
    ...ledger,
    itemCount: { ...ledger.itemCount },
    seenInstances: ledger.seenInstances.slice(),
    log: ledger.log.slice(),
  };
  const inst = instanceId ?? `${sourceId}#singleton`;

  // 획득 1회의 정의 — 동일 실물의 재획득은 카운터 미증가·자원 미재지급.
  if (next.seenInstances.includes(inst)) {
    next.log.push({ day, sourceId, instanceId: inst, coffee: 0, snack: 0, reason: 'redundant_pickup' });
    return { ledger: next, grantedCoffee: 0, grantedSnack: 0, counted: false, reason: 'redundant_pickup' };
  }

  // 획득 횟수 상한 (IT-28 / IT-29 / IT-33)
  if (!canSpawn(next, sourceId)) {
    next.log.push({ day, sourceId, instanceId: inst, coffee: 0, snack: 0, reason: 'pickup_limit' });
    return { ledger: next, grantedCoffee: 0, grantedSnack: 0, counted: false, reason: 'pickup_limit' };
  }

  next.seenInstances.push(inst);
  next.itemCount[sourceId] = (next.itemCount[sourceId] ?? 0) + 1;

  let gc = coffee;
  let gs = snack;
  let reason = 'granted';

  // 밈 레이어 통산 상한 (커피 +2 / 간식 +2) — IT-28·IT-29 카운터와 별개.
  if (isMemeSource(sourceId)) {
    const roomC = Math.max(0, SUPPLY_CAP.memeCoffee - next.memeCoffee);
    const roomS = Math.max(0, SUPPLY_CAP.memeSnack - next.memeSnack);
    const clipped = gc > roomC || gs > roomS;
    gc = Math.min(gc, roomC);
    gs = Math.min(gs, roomS);
    if (clipped) {
      // 상한에 **도달한 뒤**의 획득은 자원 0으로 기록한다(AC-MEM-06 ㉣).
      // 여유가 남아 일부만 반영된 경우는 'meme_partial'로 구분한다.
      reason = gc === 0 && gs === 0 ? 'meme_cap' : 'meme_partial';
    }
    next.memeCoffee += gc;
    next.memeSnack += gs;
  }

  next.coffeeGained += gc;
  next.snackGained += gs;
  next.coffee = Math.min(SUPPLY_CAP.coffeeHold, next.coffee + gc);
  next.snack = Math.min(SUPPLY_CAP.snackHold, next.snack + gs);
  next.log.push({ day, sourceId, instanceId: inst, coffee: gc, snack: gs, reason });
  return { ledger: next, grantedCoffee: gc, grantedSnack: gs, counted: true, reason };
}

/**
 * 총공급 제동 검사. (AC-MEM-06 ㉠~㉤)
 * @param {ReturnType<typeof createSupplyLedger>} ledger
 * @returns {{ok: boolean, coffeeTotal: number, snackTotal: number, checks: Array<{key: string, ok: boolean, detail: string}>}}
 */
export function auditSupply(ledger) {
  const coffeeTotal = RESOURCE_SPEC.coffee.init + ledger.coffeeGained;
  const snackTotal = RESOURCE_SPEC.snack.init + ledger.snackGained;
  const it28 = ledger.itemCount['IT-28'] ?? 0;
  const it29 = ledger.itemCount['IT-29'] ?? 0;
  // 상한 도달 후 획득('meme_cap')·횟수 초과('pickup_limit')·재획득('redundant_pickup')은
  // 반드시 자원 0으로 기록되어야 한다. 여유가 남아 일부만 반영된 'meme_partial'은 정상 지급이다.
  const overCapZero = ledger.log
    .filter((e) => e.reason === 'meme_cap' || e.reason === 'pickup_limit' || e.reason === 'redundant_pickup')
    .every((e) => e.coffee === 0 && e.snack === 0);
  const checks = [
    { key: '㉠ 초기 6 + 커피 획득 ≤ 18', ok: coffeeTotal <= SUPPLY_CAP.coffeeTotal, detail: `${coffeeTotal}` },
    { key: '㉡ 초기 4 + 간식 획득 ≤ 14', ok: snackTotal <= SUPPLY_CAP.snackTotal, detail: `${snackTotal}` },
    { key: '㉢ 밈 레이어 통산 커피 ≤ +2 / 간식 ≤ +2', ok: ledger.memeCoffee <= SUPPLY_CAP.memeCoffee && ledger.memeSnack <= SUPPLY_CAP.memeSnack, detail: `커피 +${ledger.memeCoffee} / 간식 +${ledger.memeSnack}` },
    { key: '㉣ 상한 도달 후 획득은 로그에 0으로 기록', ok: overCapZero, detail: overCapZero ? '전건 0' : '0 아닌 기록 존재' },
    { key: '㉤ IT-28·IT-29 통산 획득 각 2회 이하', ok: it28 <= SUPPLY_CAP.it28Limit && it29 <= SUPPLY_CAP.it29Limit, detail: `IT-28 ${it28}회 / IT-29 ${it29}회` },
  ];
  return { ok: checks.every((c) => c.ok), coffeeTotal, snackTotal, checks };
}

/* ------------------------------------------------------------------------- *
 * 10. 진엔딩 체인 (11.4)
 * ------------------------------------------------------------------------- */

/**
 * 진엔딩 체인 단계 정본. (GDD 11.4 / QA 체크리스트 3항)
 * requires는 이전 단계 플래그, gate는 추가 조건이다. 순서 위반 진입은 불가하다.
 * @type {ReadonlyArray<{id: string, requires: string[], gate?: (f: object) => boolean, sets: string[]}>}
 */
export const TRUE_END_CHAIN = Object.freeze([
  { id: 'IT-30', requires: [], sets: ['it30Owned'] },
  { id: 'GH-08', requires: ['it30Owned'], sets: ['gh08Entered'] },
  { id: 'GH-09', requires: ['gh08Entered'], sets: ['gh09Asked'] },
  {
    id: 'LEDGER',
    requires: ['gh09Asked'],
    gate: (f) => (f.creditLedgerPieces ?? 0) >= 3 && (f.rightsManifestPct ?? 0) >= 80,
    sets: ['ledgerComplete'],
  },
  { id: 'GH-14', requires: ['ledgerComplete'], sets: ['gh14Restored'] },
  { id: 'GH-15', requires: ['gh14Restored'], sets: ['traceableMaster'] },
]);

/** 크레딧 장부 조각 지급처 3곳. GH-07은 원본 로그 단서만 준다. (GDD 11.4 / QA 4항) */
export const LEDGER_PIECE_SOURCES = Object.freeze(['GH-04', 'GH-09', 'GH-12']);

/**
 * 진엔딩 체인 단계 진행. 순서·게이트를 만족하지 못하면 거부한다. (GDD 11.4)
 * @param {object} flags 현재 플래그(변형하지 않는다)
 * @param {string} stepId
 * @returns {{ok: boolean, flags: object, reason: string}}
 */
export function advanceTrueEndChain(flags, stepId) {
  const step = TRUE_END_CHAIN.find((s) => s.id === stepId);
  if (!step) return { ok: false, flags, reason: `unknown step: ${stepId}` };
  for (const req of step.requires) {
    if (flags[req] !== true) return { ok: false, flags, reason: `order violation: ${stepId} requires ${req}` };
  }
  if (step.gate && !step.gate(flags)) return { ok: false, flags, reason: `gate unmet: ${stepId}` };
  const next = { ...flags };
  for (const k of step.sets) next[k] = true;
  return { ok: true, flags: next, reason: 'ok' };
}

/* ------------------------------------------------------------------------- *
 * 11. 세이브 (18.7)
 * ------------------------------------------------------------------------- */

/**
 * 런 세이브 직렬화. 키는 camelCase, 콘텐츠 ID는 원전 표기 문자열. (GDD 18.7)
 * `rng`는 스트림별 호출 카운트이며, 시드 + 카운트만으로 18.5의 결정적 랜덤을 복원한다.
 * @param {object} run 런 상태
 * @returns {string} JSON 문자열
 */
export function serializeRun(run) {
  // 알 수 없는 키(벤더 확장·후속 스키마)는 삭제하지 않고 그대로 실어 보낸다.
  return JSON.stringify({
    ...run,
    schemaVersion: SCHEMA_VERSION,
    seed: run.seed,
    difficulty: run.difficulty,
    day: run.day,
    phase: run.phase,
    state: run.state,
    rng: run.rng,
    eventLog: run.eventLog ?? [],
    cooldowns: run.cooldowns ?? {},
    reservedChains: run.reservedChains ?? [],
    confirmFailStreak: run.confirmFailStreak ?? 0,
    restoreUsed: run.restoreUsed ?? 0,
  });
}

/**
 * 런 세이브 역직렬화. 알 수 없는 키는 삭제하지 않고 보존한다. (GDD 18.7 마이그레이션 1줄 규칙)
 * @param {string} json
 * @returns {object}
 */
export function deserializeRun(json) {
  const raw = JSON.parse(json);
  return {
    ...raw,
    eventLog: raw.eventLog ?? [],
    cooldowns: raw.cooldowns ?? {},
    reservedChains: raw.reservedChains ?? [],
    confirmFailStreak: raw.confirmFailStreak ?? 0,
    restoreUsed: raw.restoreUsed ?? 0,
  };
}

/**
 * 상태 해시. 키를 재귀 정렬해 직렬화 순서에 의존하지 않는 지문을 만든다.
 * (QA 체크리스트 6항 "상태 해시 일치" 판정용)
 * @param {*} value
 * @returns {string} 8자리 16진 해시
 */
export function stateHash(value) {
  const canon = canonicalize(value);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < canon.length; i += 1) {
    const c = canon.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c + i, 0x85ebca6b) >>> 0;
  }
  return ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
}

function canonicalize(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null';
  if (Array.isArray(v)) return `[${v.map(canonicalize).join(',')}]`;
  const keys = Object.keys(v).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(v[k])}`).join(',')}}`;
}

/**
 * 18.3 상태 스키마의 빈 런 상태를 만든다. (GDD 18.3 / 5.1 / 5.2)
 * @param {string} [difficulty]
 * @returns {object}
 */
export function createRunState(difficulty = 'main_cut') {
  const d = DIFFICULTY[difficulty];
  const characters = {};
  for (const k of CHARACTER_ORDER) {
    characters[k] = { focus: CHARACTERS[k].focusMax, hp: CHARACTERS[k].staminaMax, bond: 0 };
  }
  return {
    tracks: { ...TRACK_INIT },
    resources: {
      clientTrust: RESOURCE_SPEC.clientTrust.init,
      sourceIntegrity: RESOURCE_SPEC.sourceIntegrity.init,
      budget: d.budget,
      revisionDebt: RESOURCE_SPEC.revisionDebt.init,
      coffee: RESOURCE_SPEC.coffee.init,
      snack: RESOURCE_SPEC.snack.init,
      fear: RESOURCE_SPEC.fear.init,
      audienceResonance: RESOURCE_SPEC.audienceResonance.init,
    },
    characters,
    flags: { creditLedgerPieces: 0, rightsManifestPct: 0, traceableMaster: false },
    criticalMisses: [],
    stats: { totalOvertime: 0, maxDayReached: 1 },
  };
}
