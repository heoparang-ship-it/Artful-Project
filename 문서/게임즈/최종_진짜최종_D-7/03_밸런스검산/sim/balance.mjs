/**
 * balance.mjs — GDD 9.5 표준 7일 시뮬레이션 3종(ⓐ 무계획 / ⓑ 균형 / ⓒ 극한)
 *
 * 근거: GDD v4.0 9.5 밸런스 검산 / 9.5.1 검산 전제 / 9.5.2 시뮬레이션 3종 / 9.5.6 점수 검산
 * 대조 대상: 03_밸런스검산/balance-sim-final-final-d7.py (발주서 6.3-1 기준값 재현 스크립트)
 * 재현 기준(발주서 6.3-2): ⓐ 57.1±0.1 / ⓑ 92.44±0.01 / ⓒ 94.9±0.1
 *
 * 이 파일은 파이썬 정본과 **연산 순서까지 1:1로 대응**한다. 부동소수 결과가 비트 단위로
 * 같아야 하므로, 합산 순서(멤버 배열 순서·인물 정본 순서)와 클램프 시점을 바꾸지 않는다.
 *
 * 실행: node balance.mjs        (표 출력 + 기준값 대조, 불일치 시 exit 1)
 *       node balance.mjs --json (결과 JSON만 출력)
 *
 * @module balance
 */

import {
  CHARACTERS, CHARACTER_ORDER, SLOTS, NEXT_TRACK,
  conditionCoefficient, confirmRate, backStudioEncounterRate, encounterRateRaw,
  deliveryScore, deliveryTier, d0Gate, DAYS,
} from './core.mjs';

/* ------------------------------------------------------------------------- *
 * 검산 전용 매핑
 * ------------------------------------------------------------------------- */

/** 검산 표기(P/S/E/M) ↔ 정본 트랙 키. (GDD 5.1) */
const TRACK_KEY = { P: 'story', S: 'footage', E: 'post', M: 'master' };

/** 슬롯 → 검산 표기 주요 트랙. (GDD 8.1 / 9.5.1) */
const SLOT_MAIN = { 기획: 'P', 프리: 'P', 촬영: 'S', 편집: 'E', QC: 'M' };

/** 플레이어 패시브 핸드오프의 인접 공정(검산 표기). (GDD 9.5.1 전제 5) */
const NEXT = { P: 'S', S: 'E', E: 'M', M: 'E' };

/** 슬롯 대응 능력치(검산 표기). (GDD 9.5.1) */
const SLOT_STAT = { 기획: 'plan', 프리: 'manage', 촬영: 'direct', 편집: 'post', QC: 'post' };

/* ------------------------------------------------------------------------- *
 * 산출 적립 — 패시브·페어 처리 (GDD 9.5.1 전제 5)
 * ------------------------------------------------------------------------- */

/**
 * 슬롯 실행 결과를 자원에 적립한다.
 * 처리 순서(정본): ① 이영림 패시브 → ② 페어 '스토리보드가 움직인다' → ③ 플레이어 핸드오프
 * → ④ 트랙 P·S·E·M 순서로 상한 100 적용 → ⑤ 보조 자원.
 * @param {object} R 자원 상태(직접 갱신)
 * @param {Object<string, number>} gains
 * @param {string[]} members
 * @param {string} slot
 * @param {string} main 검산 표기 주요 트랙
 */
function applyGains(R, gains, members, slot, main) {
  // 이영림 패시브: 이영림이 참여한 기획 획득의 20%를 관객 공감으로 전환(기획은 80% 적립).
  if (members.includes('YL') && (gains.P ?? 0) > 0) {
    const conv = gains.P * 0.20;
    gains.P -= conv;
    R.emp = Math.min(100, R.emp + conv);
  }
  // 페어 '스토리보드가 움직인다'(이영림+손미림, 기획 슬롯): 기획 진척 30%를 편집으로 전이.
  if (members.length === 2 && members.includes('YL') && members.includes('MR')
      && slot === '기획' && (gains.P ?? 0) > 0) {
    const mv = gains.P * 0.30;
    gains.P -= mv;
    gains.E = (gains.E ?? 0) + mv;
  }
  // 플레이어 패시브 핸드오프: 주 트랙 획득의 15% 사본을 인접 공정 트랙에 전달.
  if (members.includes('PL') && (gains[main] ?? 0) > 0 && NEXT[main]) {
    gains[NEXT[main]] = (gains[NEXT[main]] ?? 0) + gains[main] * 0.15;
  }
  for (const k of ['P', 'S', 'E', 'M']) {
    if (k in gains) R[k] = Math.min(100, R[k] + gains[k]);
  }
  if ('integ' in gains) R.integ = Math.max(0, Math.min(100, R.integ + gains.integ));
  if ('trust' in gains) R.trust = Math.max(0, Math.min(100, R.trust + gains.trust));
  if ('debt' in gains) R.debt = Math.max(0, Math.min(60, R.debt + gains.debt));
  if ('emp' in gains) R.emp = Math.min(100, R.emp + gains.emp);
}

/* ------------------------------------------------------------------------- *
 * 훅 (액티브·이벤트) — GDD 3장 패시브·액티브 / 9.5.1 전제 5
 * ------------------------------------------------------------------------- */

const hDebt = (v) => (R) => { R.debt = Math.max(0, Math.min(60, R.debt + v)); };
const hInteg = (v) => (R) => { R.integ = Math.max(0, Math.min(100, R.integ + v)); };

/** 이혜미 액티브 '전수 검수': 무결성 +8, 부채 -3, 본인 집중 -10. */
const hInspect = (R, P) => {
  R.integ = Math.min(100, R.integ + 8);
  R.debt = Math.max(0, R.debt - 3);
  P.HM.F = Math.max(0, P.HM.F - 10);
};

/** 손미림 액티브 '살릴 수 있는 컷': 촬영 +5, 편집 +4. */
const hSalvage = (R) => {
  R.S = Math.min(100, R.S + 5);
  R.E = Math.min(100, R.E + 4);
};

/** 허파랑 액티브 '총괄 판단': 트랙 간 진척 이동. */
const hMove = (src, dst, amt) => (R) => {
  const mv = Math.min(amt, R[src]);
  R[src] -= mv;
  R[dst] = Math.min(100, R[dst] + mv);
};

/** 허파랑 패시브 '확장 거절': 부채 -4, 전원 집중 +3. */
const hRefuse = (R, P) => {
  R.debt = Math.max(0, R.debt - 4);
  for (const k of CHARACTER_ORDER) P[k].F = Math.min(CHARACTERS[k].focusMax, P[k].F + 3);
};

/* ------------------------------------------------------------------------- *
 * 7일 런 실행
 * ------------------------------------------------------------------------- */

/**
 * 표준 7일 런 1회. 확률 항은 0으로 고정한 기대 중립 검산이다(GDD 9.5.1 전제 1).
 * @param {string} name 라인 이름
 * @param {object} sched 일차별 배치 스케줄
 * @param {{useShare?: boolean, fearPerEnc?: number, verbose?: boolean}} [opt]
 *   useShare: 제작일보 '기록 공유'(공포 -5/일, GDD 5.2) 사용 여부
 *   fearPerEnc: 조우 1회당 평균 공포 증가(GDD 9.5.1 전제 6, ⓒ는 12)
 * @returns {{R: object, rows: object[], lines: string[]}}
 */
export function runLine(name, sched, { useShare = true, fearPerEnc = 6.0, verbose = true } = {}) {
  /** 인물별 집중(F)·체력(S). 초기값은 각자의 최대치. (GDD 3장) */
  const P = {};
  for (const k of CHARACTER_ORDER) P[k] = { F: CHARACTERS[k].focusMax, S: CHARACTERS[k].staminaMax };

  const R = { P: 12.0, S: 0.0, E: 0.0, M: 0.0, integ: 75.0, trust: 50.0, debt: 0.0, fear: 0.0, emp: 0.0, coffee: 6.0 };

  const framedrop = new Set();
  const consecNight = {};
  const lastDaySlot = {};
  for (const k of CHARACTER_ORDER) { consecNight[k] = 0; lastDaySlot[k] = null; }

  const rows = [];
  const lines = [];
  const say = (s) => { lines.push(s); if (verbose) console.log(s); };

  say('');
  say(`===== ${name} =====`);

  for (let di = 0; di < DAYS.length; di += 1) {
    const day = DAYS[di];
    const entry = sched[day];

    // 커피 0이면 전원 집중 -5 (GDD 5.2)
    if (R.coffee <= 0) {
      for (const k of CHARACTER_ORDER) P[k].F = Math.max(0, P[k].F - 5);
    }
    R.coffee = Math.min(20, R.coffee + (entry.coffee_in ?? 0));

    const workedToday = new Set();

    // ---- 낮 슬롯 ----
    for (const act of (entry.day ?? [])) {
      const [slot, members, card, mult] = act;
      for (const m of members) workedToday.add(m);

      if (slot === '회복') {
        // 정리·회복: 집중 +14 / 체력 +10, 각자 최대치 상한 (GDD 8.1)
        for (const m of members) {
          P[m].F = Math.min(CHARACTERS[m].focusMax, P[m].F + 14);
          P[m].S = Math.min(CHARACTERS[m].staminaMax, P[m].S + 10);
        }
        continue; // 회복 수행자는 lastDaySlot을 갱신하지 않는다(정본 동작).
      }

      const spec = SLOTS[slot];
      const main = SLOT_MAIN[slot];
      const stat = SLOT_STAT[slot];

      // 개인 산출 합 = Σ 능력치 × 컨디션 계수 × 보정 (GDD 8.2 / 9.5.1)
      let out = 0.0;
      for (const m of members) {
        let o = CHARACTERS[m][stat] * conditionCoefficient(P[m].F, P[m].S) * mult;
        if (framedrop.has(m)) o *= 0.65; // 프레임 드롭 산출 -35% (GDD 6.3)
        out += o;
      }

      const gains = { ...card };
      gains[main] = (gains[main] ?? 0.0) + out;
      applyGains(R, gains, members, slot, main);

      // 소모는 산출 확정 후 적용 (GDD 9.5.1)
      for (const m of members) {
        let fCost = spec.focusCost;
        let sCost = spec.staminaCost;
        if (members.includes('PL') && m !== 'PL') fCost *= 0.7; // 플레이어 패시브: 동료 집중 소모 ×0.7
        if (lastDaySlot[m] === slot) { fCost += 3; sCost += 3; } // 2일 연속 동일 고강도 슬롯 (GDD 8.3)
        P[m].F = Math.max(0, P[m].F - fCost);
        P[m].S = Math.max(0, P[m].S - sCost);
      }
      for (const m of members) lastDaySlot[m] = slot;
    }
    for (const m of CHARACTER_ORDER) if (!workedToday.has(m)) lastDaySlot[m] = null;

    // ---- 액티브·이벤트 훅 ----
    for (const hook of (entry.hooks ?? [])) hook(R, P);

    // ---- 페이즈 5 컨펌 (D-6부터) ---- (GDD 6.1)
    let conf = '';
    if (di >= 1) {
      const rate = confirmRate({ story: R.P, clientTrust: R.trust, revisionDebt: R.debt });
      const mid = day === 'D-4'; // 중간 컨펌은 결과 2배 가중
      if (rate >= 50) { // GDD 9.5.1 전제 3: 기대값 근사
        R.trust = Math.min(100, R.trust + (mid ? 6 : 3));
        conf = `컨펌 ${pyFixed(rate, 0)}% 성공`;
      } else {
        R.debt = Math.min(60, R.debt + (mid ? 8 : 4));
        R.trust = Math.max(0, R.trust - 3);
        conf = `컨펌 ${pyFixed(rate, 0)}% 실패`;
      }
    }

    // ---- 야근 ---- (GDD 6.2)
    const night = entry.night;
    let nWorkers = 0;
    if (night) {
      const [slot, members, card, mult] = night;
      const need = members.length; // 커피 1인당 1
      if (R.coffee >= need) {
        R.coffee -= need;
        nWorkers = need;
        const main = SLOT_MAIN[slot];
        const stat = SLOT_STAT[slot];
        let out = 0.0;
        for (const m of members) {
          let o = CHARACTERS[m][stat] * conditionCoefficient(P[m].F, P[m].S) * mult;
          if (framedrop.has(m)) o *= 0.65;
          out += o;
        }
        // 야근 실행은 산출·카드값 모두 ×0.65 (GDD 6.2 / 9.5.1)
        const gains = {};
        for (const [k, v] of Object.entries(card)) gains[k] = v * 0.65;
        gains[main] = (gains[main] ?? 0.0) + out * 0.65;
        applyGains(R, gains, members, slot, main);
        for (const m of members) {
          P[m].F = Math.max(0, P[m].F - 8);   // 참여자 집중 -8
          P[m].S = Math.max(0, P[m].S - 10);  // 참여자 체력 -10
          consecNight[m] += 1;
          if (consecNight[m] >= 3) framedrop.add(m); // 3일 연속 야근 → 프레임 드롭 확정
        }
        for (const m of CHARACTER_ORDER) if (!members.includes(m)) consecNight[m] = 0;
      } else {
        conf += ' | 커피 부족→야근 불발'; // 커피 이코노미 제동 (GDD 9.5.5)
        for (const m of CHARACTER_ORDER) consecNight[m] = 0;
      }
    } else {
      for (const m of CHARACTER_ORDER) consecNight[m] = 0;
    }

    // ---- 이면 조우율 → 공포 기대치 ---- (GDD 6.2 / 9.5.1 전제 6·7)
    let avgF = 0;
    for (const k of CHARACTER_ORDER) avgF += P[k].F;
    avgF /= 5;
    const encArgs = {
      difficulty: 'main_cut',
      overtimeCount: nWorkers,
      avgFocus: avgF,
      revisionDebt: R.debt,
      dayIndex: di,
      sourceIntegrity: R.integ,
    };
    const rateEnc = backStudioEncounterRate(encArgs);
    // 정본 파이썬은 0~100 클램프, core.mjs는 GDD 확정치인 5~95 클램프를 쓴다.
    // ⓐⓑⓒ 전 구간의 원값은 20~66이므로 두 클램프의 결과는 동일하다(아래에서 검증).
    const rawEnc = encounterRateRaw(encArgs);
    if (rawEnc < 5 || rawEnc > 95) {
      throw new Error(`조우율 원값 ${rawEnc}이 5~95 밖 — 파이썬(0~100)과 재현 불일치 가능 (${name} ${day})`);
    }

    R.fear += (rateEnc / 100) * fearPerEnc;
    if (entry.night_integ_loss) R.integ = Math.max(0, R.integ - (rateEnc / 100) * 4);
    if (useShare) R.fear = Math.max(0, R.fear - 5); // 제작일보 '기록 공유' -5/일 (GDD 5.2)

    rows.push({
      day, P: R.P, S: R.S, E: R.E, M: R.M, integ: R.integ, debt: R.debt, fear: R.fear,
      mrF: P.MR.F, mrS: P.MR.S, plF: P.PL.F, plS: P.PL.S,
      trust: R.trust, emp: R.emp, coffee: R.coffee, enc: rateEnc, conf,
    });

    say(`${day}: P${pad(pyFixed(R.P, 1), 6)} S${pad(pyFixed(R.S, 1), 6)} E${pad(pyFixed(R.E, 1), 6)} M${pad(pyFixed(R.M, 1), 6)} `
      + `| 무결성${pad(pyFixed(R.integ, 1), 6)} 부채${pad(pyFixed(R.debt, 1), 4)} 공포${pad(pyFixed(R.fear, 1), 5)} `
      + `| MR ${pyFixed(P.MR.F, 0)}/${pyFixed(P.MR.S, 0)} PL ${pyFixed(P.PL.F, 0)}/${pyFixed(P.PL.S, 0)} `
      + `| 신뢰${pyFixed(R.trust, 0)} 공감${pyFixed(R.emp, 1)} 커피${pyFixed(R.coffee, 0)} 조우${pyFixed(rateEnc, 0)}% ${conf}`);
  }

  return { R, rows, lines };
}

/* ------------------------------------------------------------------------- *
 * 배치 스케줄 3종 (GDD 9.5.2)
 * ------------------------------------------------------------------------- */

/** ⓐ 무계획 — 야근 없음, 적합 인물 무시, 페어·콤보 무자각, 기록 공유 미사용. */
export const LINE_A = {
  'D-7': { day: [['기획', ['MR', 'PL'], { P: 8, emp: 4 }, 1.0, '핵심구조'],
    ['프리', ['HP', 'YL'], { integ: 6, P: 3 }, 1.0, '자료인수']] },
  'D-6': { day: [['기획', ['PL', 'HM'], { P: 7 }, 1.0, '콘티'],
    ['프리', ['YL', 'MR'], { S: 4 }, 1.0, '로케']] },
  'D-5': { day: [['촬영', ['MR', 'YL'], { S: 12 }, 1.1, '부두(카메라만)'],
    ['회복', ['HM', 'PL'], {}, 1.0, '']] },
  'D-4': { day: [['편집', ['MR', 'PL'], { E: 10 }, 1.0, '러프컷'],
    ['회복', ['HP', 'YL'], {}, 1.0, '']] },
  'D-3': { day: [['편집', ['MR', 'PL'], { E: 8 }, 1.0, '그래픽'],
    ['회복', ['HP', 'YL'], {}, 1.0, '']] },
  'D-2': { day: [['편집', ['MR', 'PL'], { E: 8 }, 1.0, '음악'],
    ['회복', ['HP', 'YL'], {}, 1.0, '']] },
  'D-1': { day: [['QC', ['HM', 'MR'], { M: 12 }, 1.0, '최종 납품본 QC(요구 E60 충족)']] },
};

/** ⓑ 균형 — 페어·콤보 활용, 야근 2회, 백업·권리·규격 실행, 기록 공유 사용. */
export const LINE_B = {
  'D-7': {
    day: [['기획', ['YL', 'HP'], { P: 6, debt: -2 }, 1.25, '브리프 잠금+한문장한장면'],
      ['프리', ['HM', 'PL'], { integ: 6, P: 3 }, 1.0, '자료인수'],
      ['회복', ['MR'], {}, 1.0, '']],
  },
  'D-6': {
    day: [['기획', ['YL', 'MR'], { P: 7 }, 1.0, '콘티(스토리보드 전이)'],
      ['프리', ['HM', 'PL'], { S: 4 }, 1.0, '로케'],
      ['촬영', ['HP'], { S: 8, P: 4 }, 1.2, '인터뷰(IT-14/16)']],
  },
  'D-5': {
    day: [['촬영', ['MR', 'HP'], { S: 18 }, 1.2, '부두+콘셉트투프레임(+6)+카메라·콘티'],
      ['QC', ['HM', 'PL'], { integ: 8 }, 1.0, '백업'],
      ['회복', ['YL'], {}, 1.0, '']],
    hooks: [hInteg(10), hRefuse],
    night: ['편집', ['MR', 'PL'], { E: 10 }, 1.0, '야근① 러프컷'],
  },
  'D-4': {
    day: [['편집', ['MR', 'PL'], { E: 8 }, 1.0, '그래픽'],
      ['기획', ['YL', 'HP'], { P: 8, emp: 4 }, 1.25, '핵심구조+한문장한장면'],
      ['회복', ['HM'], {}, 1.0, '']],
    hooks: [hDebt(-2), hRefuse],
    night: ['편집', ['MR', 'PL'], { E: 8 }, 1.0, '야근② 음악·사운드'],
  },
  'D-3': {
    day: [['촬영', ['MR', 'PL'], { S: 9 }, 1.0, '보충 촬영(요구 편집25)'],
      ['QC', ['HM', 'YL'], { M: 6, integ: 4 }, 1.0, '권리·크레딧'],
      ['회복', ['HP'], {}, 1.0, '']],
  },
  'D-2': {
    day: [['편집', ['MR', 'HP'], { E: 10 }, 1.0, '파인컷(요구 E45·S60)'],
      ['QC', ['HM', 'PL'], { M: 7 }, 1.0, '규격 테스트'],
      ['회복', ['YL'], {}, 1.0, '']],
    hooks: [hInspect, hSalvage],
  },
  'D-1': {
    day: [['QC', ['HM', 'MR'], { M: 12 }, 1.0, '최종 납품본 QC(요구 E60)'],
      ['편집', ['YL', 'PL'], { E: 8 }, 1.0, '색보정(요구 E55·IT-22)'],
      ['회복', ['HP'], {}, 1.0, '']],
    hooks: [hMove('E', 'M', 6)],
  },
};

/** ⓒ 극한 — 매일 야근 시도. 커피 이코노미(GDD 9.5.5)가 D-1 야근을 차단한다. */
export const LINE_C = {
  'D-7': {
    day: [['기획', ['YL', 'HP'], { P: 6, debt: -2 }, 1.25, '브리프 잠금'],
      ['프리', ['HM', 'PL'], { integ: 6, P: 3 }, 1.0, '자료인수'],
      ['회복', ['MR'], {}, 1.0, '']],
    night: ['기획', ['MR', 'PL', 'YL'], { P: 8, emp: 4 }, 1.0, '야근 핵심구조'],
    night_integ_loss: true,
  },
  'D-6': {
    day: [['기획', ['YL', 'MR'], { P: 7 }, 1.0, '콘티'],
      ['프리', ['HM', 'PL'], { S: 4 }, 1.0, '로케'],
      ['촬영', ['HP'], { S: 8, P: 4 }, 1.2, '인터뷰']],
    coffee_in: 5,
    night: ['촬영', ['MR', 'PL', 'HP'], { S: 8, P: 4 }, 1.2, '야근 인터뷰 반복'],
    night_integ_loss: true,
  },
  'D-5': {
    day: [['촬영', ['MR', 'HP'], { S: 18 }, 1.2, '부두+콘셉트투프레임'],
      ['QC', ['HM', 'PL'], { integ: 8 }, 1.0, '백업'],
      ['기획', ['YL'], { P: 8, emp: 4 }, 1.0, '핵심구조 반복']],
    night: ['편집', ['MR', 'PL', 'HM'], { E: 10 }, 1.0, '야근 러프컷'],
    night_integ_loss: true,
  },
  'D-4': {
    day: [['편집', ['MR', 'PL'], { E: 8 }, 1.0, '그래픽'],
      ['기획', ['YL', 'HP'], { P: 8, emp: 4 }, 1.25, '핵심구조 반복'],
      ['QC', ['HM'], { M: 6, integ: 4 }, 1.0, '권리·크레딧']],
    coffee_in: 5,
    // 확장 수락①: 촬영 +8 (게이트 +5는 별도 기록)
    hooks: [(R) => { R.S = Math.min(100, R.S + 8); R.debt = Math.min(60, R.debt + 0); }],
    night: ['편집', ['MR', 'PL', 'YL'], { E: 8 }, 1.0, '야근 음악'],
    night_integ_loss: true,
  },
  'D-3': {
    day: [['촬영', ['MR', 'PL'], { S: 9 }, 1.0, '보충(요구 E25)'],
      ['QC', ['HM'], { M: 7 }, 1.0, '규격'],
      ['기획', ['YL', 'HP'], { P: 8, emp: 4 }, 1.25, '핵심구조 반복']],
    night: ['QC', ['MR', 'PL', 'HM'], { M: 6, integ: 4 }, 1.0, '야근 권리 반복'],
    night_integ_loss: true,
  },
  'D-2': {
    day: [['편집', ['MR', 'HP'], { E: 10 }, 1.0, '파인컷(요구 E45·S60)'],
      ['QC', ['HM', 'PL'], { M: 7 }, 1.0, '규격 반복'],
      ['기획', ['YL'], { P: 8, emp: 4 }, 1.0, '핵심구조 반복']],
    night: ['편집', ['MR'], { E: 8 }, 1.0, '야근 색보정(요구 E55)'],
    night_integ_loss: true,
  },
  'D-1': {
    day: [['QC', ['HM', 'MR'], { M: 12 }, 1.0, '최종QC(요구 E60)'],
      ['편집', ['YL', 'PL'], { E: 8 }, 1.0, '그래픽 반복'],
      ['기획', ['HP'], { P: 8, emp: 4 }, 1.0, '핵심구조 반복']],
    night: ['QC', ['MR', 'PL', 'HM'], { M: 7 }, 1.0, '야근 시도(커피 부족 예상)'],
    night_integ_loss: true,
  },
};

/* ------------------------------------------------------------------------- *
 * 결과 집계
 * ------------------------------------------------------------------------- */

/** 검산 자원(R)을 core.mjs의 상태 스키마로 변환한다. (GDD 18.3) */
export function toCoreState(R) {
  return {
    tracks: { story: R.P, footage: R.S, post: R.E, master: R.M },
    resources: {
      sourceIntegrity: R.integ, clientTrust: R.trust, revisionDebt: R.debt,
      audienceResonance: R.emp, fear: R.fear, coffee: R.coffee,
    },
    criticalMisses: [],
  };
}

/** 발주서 6.3-2 재현 기준값. */
export const REFERENCE = Object.freeze({
  'ⓐ': { score: 57.07, tol: 0.1 },
  'ⓑ': { score: 92.44, tol: 0.01 },
  'ⓒ': { score: 94.92, tol: 0.1 },
});

/**
 * ⓐ·ⓑ·ⓒ 3종을 실행하고 기준값과 대조한다.
 * @param {{verbose?: boolean}} [opt]
 * @returns {{results: object[], allMatch: boolean}}
 */
export function runAll({ verbose = true } = {}) {
  const specs = [
    ['ⓐ', 'ⓐ 무계획', LINE_A, { useShare: false, fearPerEnc: 6.0 }],
    ['ⓑ', 'ⓑ 균형', LINE_B, { useShare: true, fearPerEnc: 6.0 }],
    ['ⓒ', 'ⓒ 극한', LINE_C, { useShare: true, fearPerEnc: 12.0 }],
  ];
  const results = [];
  for (const [tag, name, sched, opt] of specs) {
    const { R, rows } = runLine(name, sched, { ...opt, verbose });
    const state = toCoreState(R);
    const score = deliveryScore(state);
    const gate = d0Gate(state, 'main_cut');
    results.push({ tag, name, R, rows, state, score, gate, tier: deliveryTier(score) });
  }

  if (verbose) {
    for (const r of results) {
      const g = r.gate.checks
        .map((c) => `${GATE_LABEL[c.key]} ${c.threshold}${c.ok ? '○' : '×'}`)
        .join(', ');
      console.log(`\n${r.tag} 최종: 점수 ${pyFixed(r.score, 2)} | 게이트: ${g}`);
    }
    console.log('');
    console.log('--- 발주서 6.3-2 재현 대조 (기준: balance-sim-final-final-d7.py) ---');
  }

  let allMatch = true;
  for (const r of results) {
    const ref = REFERENCE[r.tag];
    const diff = Math.abs(r.score - ref.score);
    const ok = diff <= ref.tol;
    if (!ok) allMatch = false;
    r.referenceOk = ok;
    r.referenceDiff = diff;
    if (verbose) {
      console.log(`${r.tag} 기준 ${ref.score.toFixed(2)} ±${ref.tol} / 실측 ${pyFixed(r.score, 2)} / 차이 ${diff.toExponential(3)} → ${ok ? '재현 일치' : '재현 불일치'}`);
    }
  }
  return { results, allMatch };
}

const GATE_LABEL = {
  story: '기획', footage: '촬영', post: '편집', master: '마스터',
  sourceIntegrity: '무결성', clientTrust: '신뢰',
};

/* ------------------------------------------------------------------------- *
 * 출력 유틸 — 파이썬 포맷 재현
 * ------------------------------------------------------------------------- */

/**
 * Python `format(v, '.Nf')` 재현 포맷.
 * JS `toFixed`는 double의 정확한 값으로 반올림하므로 대부분 Python과 같지만,
 * 정확히 .5로 떨어지는 tie에서만 Python은 round-half-even, JS는 round-half-up을 쓴다.
 * tie(= v×10^d가 정수가 아니면서 그 2배가 정수)일 때만 짝수 반올림으로 바꾼다.
 */
function pyFixed(v, d) {
  if (!Number.isFinite(v)) return String(v);
  const neg = v < 0;
  const a = Math.abs(v);
  if (a >= 1e21) return v.toFixed(d);

  // double의 정확한 십진 전개를 얻어 tie 여부를 판정한다.
  // (v × 10^d 를 float으로 곱하면 64.55×10 = 645.5처럼 없는 tie가 생긴다.)
  const s = a.toFixed(Math.min(100, d + 25));
  const dot = s.indexOf('.');
  const digits = s.slice(0, dot) + s.slice(dot + 1);
  const cut = dot + d;
  const rest = digits.slice(cut);
  const isTie = rest[0] === '5' && /^0*$/.test(rest.slice(1));
  if (!isTie) return v.toFixed(d);

  // 정확한 tie → Python 기본인 round-half-even
  let n = BigInt(digits.slice(0, cut));
  if (n % 2n === 1n) n += 1n;
  const ns = n.toString().padStart(cut, '0');
  const intPart = d === 0 ? ns : (ns.slice(0, ns.length - d) || '0');
  const fracPart = d === 0 ? '' : `.${ns.slice(ns.length - d)}`;
  return `${neg ? '-' : ''}${intPart}${fracPart}`;
}

function pad(s, w) {
  return s.length >= w ? s : ' '.repeat(w - s.length) + s;
}

export { pyFixed };

/* ------------------------------------------------------------------------- *
 * CLI
 * ------------------------------------------------------------------------- */

// 경로에 비ASCII 문자가 있으면 import.meta.url이 퍼센트 인코딩되므로 URL로 정규화해 비교한다.
const isMain = (() => {
  try {
    return new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;
  } catch { return false; }
})();
if (isMain) {
  const json = process.argv.includes('--json');
  const { results, allMatch } = runAll({ verbose: !json });
  if (json) {
    console.log(JSON.stringify(results.map((r) => ({
      tag: r.tag,
      name: r.name,
      score: Number(r.score.toFixed(6)),
      tier: r.tier,
      gatePassed: r.gate.passed,
      tracks: r.state.tracks,
      resources: r.state.resources,
      referenceOk: r.referenceOk,
    })), null, 2));
  }
  if (!allMatch) {
    console.error('\n[FAIL] 파이썬 정본과 점수가 재현되지 않았습니다. 위 차이값을 확인하십시오.');
    process.exit(1);
  }
  if (!json) console.log('\n[OK] ⓐ·ⓑ·ⓒ 3종 전부 파이썬 정본 기준값을 재현했습니다.');
}
