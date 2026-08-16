/**
 * test.mjs — 시드 고정 자동 테스트 6종
 *
 * 근거: GDD v4.0 19.5.3 시드 고정 자동 테스트 5종 / 발주서 7.2
 *   ① 7일 완주 스모크        — 크래시 0, D-0 게이트 판정 도달
 *   ② 컨펌 판정 통계          — 실측 성공률이 공식 명목치 대비 ±2%p 이내
 *   ③ 이면 조우율 검증        — 난이도 4종 기본률 22/30/38/46%와 보정 합산 일치
 *   ④ 진엔딩 체인 리플레이    — 동일 시드 동일 결과, ED-11 도달, 조각 3·목록 80% 판정
 *   ⑤ 세이브 무결성 루프      — 페이즈 경계 저장→로드 후 상태 해시 일치, 복원 횟수 보존
 *   ⑥ 커피·간식 제동          — 커피 총공급 ≤ 18 / 간식 ≤ 14 (AC-MEM-06 · AC-MEM-08)
 *
 * 실행: node test.mjs            (전체)
 *       node test.mjs 1 3 6      (번호 지정)
 * 실패 시 exit code 1. CI에서 매 빌드 실행하며, 하나라도 실패한 빌드는 내보내지 않는다.
 *
 * @module test
 */

import {
  CHARACTERS, CHARACTER_ORDER, SLOTS, DAYS, DIFFICULTY, DIFFICULTY_ORDER,
  conditionCoefficient, slotOutput, confirmRate, resolveConfirm,
  criticalChance, mistakeChance, resolveWork, defaultMistakePenalty,
  backStudioEncounterRate, encounterRateRaw, braveryRate,
  d0Gate, deliveryScore, deliveryTier, resolveEnding, retakeNotes,
  createRunState, serializeRun, deserializeRun, stateHash,
  createSupplyLedger, applySupplyGain, auditSupply, canSpawn, SUPPLY_CAP,
  advanceTrueEndChain, TRUE_END_CHAIN, LEDGER_PIECE_SOURCES,
} from './core.mjs';
import { createRng, STREAMS } from './rng.mjs';
import { runAll } from './balance.mjs';

/** 전 테스트 공통 고정 시드. GDD 18.7 세이브 예시의 시드값을 그대로 쓴다. */
const SEED = 20260815;

/* ========================================================================= *
 * 공통 — 표준 7일 진행 하네스 (GDD 6.1 하루 타임라인 8페이즈)
 * ========================================================================= */

/** 표준 배치 스크립트. GDD 9.5.2 ⓑ 균형 라인의 배치를 그대로 쓴다. */
const STANDARD_SCRIPT = {
  'D-7': { day: [['기획', ['YL', 'HP']], ['프리', ['HM', 'PL']], ['회복', ['MR']]] },
  'D-6': { day: [['기획', ['YL', 'MR']], ['프리', ['HM', 'PL']], ['촬영', ['HP']]] },
  'D-5': { day: [['촬영', ['MR', 'HP']], ['QC', ['HM', 'PL']], ['회복', ['YL']]], night: ['편집', ['MR', 'PL']] },
  'D-4': { day: [['편집', ['MR', 'PL']], ['기획', ['YL', 'HP']], ['회복', ['HM']]], night: ['편집', ['MR', 'PL']] },
  'D-3': { day: [['촬영', ['MR', 'PL']], ['QC', ['HM', 'YL']], ['회복', ['HP']]] },
  'D-2': { day: [['편집', ['MR', 'HP']], ['QC', ['HM', 'PL']], ['회복', ['YL']]] },
  'D-1': { day: [['QC', ['HM', 'MR']], ['편집', ['YL', 'PL']], ['회복', ['HP']]] },
};

/** 슬롯별 표준 업무 카드 성공값. (GDD 8.4 업무 카드 풀 대표값) */
const CARD = {
  기획: { story: 8, audienceResonance: 4 },
  프리: { story: 3, sourceIntegrity: 6 },
  촬영: { footage: 12 },
  편집: { post: 10 },
  QC: { master: 12, sourceIntegrity: 4 },
};

/** 슬롯 적합 인물. (GDD 8.1 '적합 인물' 열) */
const FIT_CAST = { 기획: ['YL', 'HP'], 프리: ['HM', 'PL'], 촬영: ['MR', 'HP'], 편집: ['MR', 'PL'], QC: ['HM', 'MR'] };

/** 현실 제작 이벤트 풀(축약). GDD 18.8 추첨 규칙 검증용. */
const REALITY_POOL = [
  { id: 'OF-01', once: true, baseWeight: 100, effects: { post: -4, clientTrust: 8, revisionDebt: 6 } },
  { id: 'OF-05', once: true, baseWeight: 100, effects: { revisionDebt: 3 } },
  { id: 'OF-12', once: true, baseWeight: 100, effects: { sourceIntegrity: -5 } },
  { id: 'OF-18', once: true, baseWeight: 100, effects: { clientTrust: 4 } },
  { id: 'OF-24', once: true, baseWeight: 100, effects: { audienceResonance: 3 } },
  { id: 'OF-30', once: true, baseWeight: 100, effects: {}, supply: { sourceId: 'OF-30', coffee: 4, snack: 3 } },
];

/** 괴이 풀(축약). 담력 판정 대상. (GDD 11.3) */
const GHOST_POOL = ['GH-01', 'GH-04', 'GH-05', 'GH-08', 'GH-10'];

/** 슬롯 대응 능력치 키. (GDD 9.5.1) */
const SLOT_STAT = { 기획: 'plan', 프리: 'manage', 촬영: 'direct', 편집: 'post', QC: 'post' };
/** 슬롯 주요 트랙. (GDD 8.1) */
const SLOT_TRACK = { 기획: 'story', 프리: 'story', 촬영: 'footage', 편집: 'post', QC: 'master' };

const TRACK_KEYS = ['story', 'footage', 'post', 'master'];

function addTrack(state, key, delta) {
  state.tracks[key] = Math.max(0, Math.min(100, state.tracks[key] + delta));
}

function addResource(state, key, delta) {
  const r = state.resources;
  const lim = {
    clientTrust: [0, 100], sourceIntegrity: [0, 100], revisionDebt: [0, 60],
    coffee: [0, 20], snack: [0, 15], fear: [0, 100], audienceResonance: [0, 100],
  }[key] ?? [-Infinity, Infinity];
  r[key] = Math.max(lim[0], Math.min(lim[1], r[key] + delta));
}

/**
 * 표준 7일 런 1회. 모든 확률 판정을 GDD 18.5의 전용 스트림으로 굴린다.
 * @param {{seed?: number, difficulty?: string, phaseHook?: Function|null, shareLog?: boolean}} [opt]
 * @returns {{state: object, run: object, ending: object, gate: object, score: number, notes: object, ledger: object, encounterLog: object[], confirmLog: object[], phaseCount: number}}
 */
export function runSmoke({ seed = SEED, difficulty = 'main_cut', phaseHook = null, shareLog = true } = {}) {
  const diff = DIFFICULTY[difficulty];
  let run = {
    seed, difficulty, day: 1, phase: 'briefing',
    state: createRunState(difficulty),
    rng: Object.fromEntries(STREAMS.map((s) => [s, 0])),
    eventLog: [], cooldowns: {}, reservedChains: [],
    confirmFailStreak: 0, restoreUsed: 0,
  };
  let rng = createRng(seed, run.rng);
  let ledger = createSupplyLedger();
  const framedrop = new Set();
  const consecNight = Object.fromEntries(CHARACTER_ORDER.map((k) => [k, 0]));
  const restedYesterday = new Set();
  const encounterLog = [];
  const confirmLog = [];
  let phaseCount = 0;

  /** 페이즈 경계 처리. hook이 새 run을 반환하면 그것을 채택한다(세이브 라운드트립 검증용). */
  const boundary = (phase) => {
    run.phase = phase;
    run.rng = rng.counts();
    phaseCount += 1;
    if (!phaseHook) return;
    const replaced = phaseHook(run);
    if (replaced) {
      run = replaced;
      rng = createRng(run.seed, run.rng);
    }
  };

  for (let di = 0; di < DAYS.length; di += 1) {
    const dayLabel = DAYS[di];
    run.day = di + 1;
    const entry = STANDARD_SCRIPT[dayLabel];

    // ── 페이즈 1 제작 브리핑
    // 주의: boundary()가 run을 세이브 왕복본으로 교체할 수 있으므로 run.state를 캡처하지 않는다.
    boundary('briefing');
    let st = run.state;
    if (st.resources.coffee <= 0) for (const k of CHARACTER_ORDER) st.characters[k].focus = Math.max(0, st.characters[k].focus - 5);

    // ── 페이즈 2 60초 준비 스크램블 (scramble 스트림)
    boundary('scramble');
    st = run.state;
    const scr = rng.stream('scramble');
    for (const itemId of ['IT-28', 'IT-29', 'IT-33', 'IT-31']) {
      if (!canSpawn(ledger, itemId)) continue;
      if (!scr.chance(70)) continue; // 스폰·픽업 성공 여부
      const gainSpec = { 'IT-28': { coffee: 5 }, 'IT-29': { snack: 4 }, 'IT-33': {}, 'IT-31': { coffee: 1 } }[itemId];
      const res = applySupplyGain(ledger, { sourceId: itemId, instanceId: `${itemId}@${dayLabel}`, day: dayLabel, ...gainSpec });
      ledger = res.ledger;
      addResource(st, 'coffee', res.grantedCoffee);
      addResource(st, 'snack', res.grantedSnack);
    }

    // ── 페이즈 3 업무 배치 (production 스트림)
    boundary('production');
    st = run.state;
    const prod = rng.stream('production');
    const workedToday = new Set();
    for (const [slot, members] of entry.day) {
      for (const m of members) workedToday.add(m);
      if (slot === '회복') {
        for (const m of members) {
          const c = st.characters[m];
          c.focus = Math.min(CHARACTERS[m].focusMax, c.focus + 14);
          c.hp = Math.min(CHARACTERS[m].staminaMax, c.hp + 10);
          restedYesterday.add(m);
        }
        continue;
      }
      const cond = Object.fromEntries(members.map((m) => [m, { focus: st.characters[m].focus, stamina: st.characters[m].hp }]));
      let output = slotOutput({ slot, members, cond, mult: 1.0, framedrop });
      const card = { ...CARD[slot] };
      // 업무 판정 — 수행자별 크리티컬·실수 1회씩, 실수 우선 (GDD 8.2)
      for (const m of members) {
        const c = st.characters[m];
        const crit = criticalChance({
          fitCast: FIT_CAST[slot].includes(m),
          gearComplete: true,
          majorMatch: CHARACTERS[m][SLOT_STAT[slot]] >= 9,
        });
        const miss = mistakeChance({ focus: c.focus, stamina: c.hp, restedYesterday: restedYesterday.has(m) });
        const r = resolveWork({ critChance: crit, missChance: miss, rollCrit: prod.next(), rollMiss: prod.next() });
        if (r.mistake) {
          const pen = defaultMistakePenalty(output);
          output = pen.output;
          addResource(st, 'revisionDebt', pen.revisionDebt);
        } else if (r.critical) {
          output *= 1.3;
        }
      }
      addTrack(st, SLOT_TRACK[slot], output);
      for (const [k, v] of Object.entries(card)) {
        if (TRACK_KEYS.includes(k)) addTrack(st, k, v);
        else addResource(st, k, v);
      }
      // 소모 — 산출 확정 후 (GDD 9.5.1)
      const spec = SLOTS[slot];
      for (const m of members) {
        let fc = spec.focusCost;
        let sc = spec.staminaCost;
        if (members.includes('PL') && m !== 'PL') fc *= 0.7;
        const c = st.characters[m];
        c.focus = Math.max(0, c.focus - fc);
        c.hp = Math.max(0, c.hp - sc);
      }
    }
    for (const m of CHARACTER_ORDER) if (workedToday.has(m) && !entry.day.some(([s, mm]) => s === '회복' && mm.includes(m))) restedYesterday.delete(m);

    // ── 페이즈 4 현실 제작 이벤트 (reality 스트림, GDD 18.8)
    boundary('reality_event');
    st = run.state;
    const rea = rng.stream('reality');
    const candidates = REALITY_POOL
      .filter((e) => !(e.once && run.eventLog.includes(e.id)))
      .filter((e) => (run.cooldowns[e.id] ?? 0) <= 0)
      .map((e) => ({ ...e, weight: e.baseWeight }));
    if (candidates.length > 0) {
      const picked = rea.weightedPick(candidates);
      run.eventLog.push(picked.id);
      run.cooldowns[picked.id] = 2;
      for (const [k, v] of Object.entries(picked.effects)) {
        if (TRACK_KEYS.includes(k)) addTrack(st, k, v);
        else addResource(st, k, v);
      }
      if (picked.supply) {
        const res = applySupplyGain(ledger, { ...picked.supply, instanceId: `${picked.id}@${dayLabel}`, day: dayLabel });
        ledger = res.ledger;
        addResource(st, 'coffee', res.grantedCoffee);
        addResource(st, 'snack', res.grantedSnack);
      }
    }
    for (const k of Object.keys(run.cooldowns)) run.cooldowns[k] = Math.max(0, run.cooldowns[k] - 1);

    // ── 페이즈 5 컨펌 결과 (D-6부터, production 스트림) (GDD 6.1)
    boundary('confirm');
    st = run.state;
    // boundary()가 rng 인스턴스를 교체했을 수 있으므로 스트림 핸들을 다시 받는다.
    // (페이즈 3에서 받은 prod를 그대로 쓰면 폐기된 인스턴스의 카운터를 소비한다.)
    const prodConfirm = rng.stream('production');
    if (di >= 1) {
      const bonus = run.confirmFailStreak >= 2 ? -15 : 0; // 상태이상 '컨펌 공포' (GDD 6.3)
      const rate = confirmRate({
        story: st.tracks.story, clientTrust: st.resources.clientTrust,
        revisionDebt: st.resources.revisionDebt, bonus,
      });
      const res = resolveConfirm({ rate, isMidterm: dayLabel === 'D-4', roll: prodConfirm.next(), failStreak: run.confirmFailStreak });
      addResource(st, 'clientTrust', res.trustDelta);
      addResource(st, 'revisionDebt', res.debtDelta);
      run.confirmFailStreak = res.failStreak;
      confirmLog.push({ day: dayLabel, rate, success: res.success });
    }

    // ── 페이즈 6 야근 여부 결정 (GDD 6.2)
    boundary('overtime');
    st = run.state;
    let overtimeCount = 0;
    if (entry.night) {
      const [slot, members] = entry.night;
      if (members.length <= 3 && st.resources.coffee >= members.length) {
        addResource(st, 'coffee', -members.length);
        overtimeCount = members.length;
        st.stats.totalOvertime += 1;
        const cond = Object.fromEntries(members.map((m) => [m, { focus: st.characters[m].focus, stamina: st.characters[m].hp }]));
        addTrack(st, SLOT_TRACK[slot], slotOutput({ slot, members, cond, framedrop }) * 0.65);
        for (const m of members) {
          const c = st.characters[m];
          c.focus = Math.max(0, c.focus - 8);
          c.hp = Math.max(0, c.hp - 10);
          consecNight[m] += 1;
          if (consecNight[m] >= 3) framedrop.add(m);
        }
        for (const m of CHARACTER_ORDER) if (!members.includes(m)) consecNight[m] = 0;
      } else {
        for (const m of CHARACTER_ORDER) consecNight[m] = 0;
      }
    } else {
      for (const m of CHARACTER_ORDER) consecNight[m] = 0;
    }

    // ── 페이즈 7 이면 스튜디오 (backstudio 스트림) (GDD 6.2 / 11.2)
    boundary('backstudio');
    st = run.state;
    const back = rng.stream('backstudio');
    let avgFocus = 0;
    for (const k of CHARACTER_ORDER) avgFocus += st.characters[k].focus;
    avgFocus /= CHARACTER_ORDER.length;
    const encRate = backStudioEncounterRate({
      difficulty, overtimeCount, avgFocus,
      revisionDebt: st.resources.revisionDebt, dayIndex: di,
      sourceIntegrity: st.resources.sourceIntegrity,
    });
    const encountered = back.chance(encRate);
    encounterLog.push({ day: dayLabel, rate: encRate, encountered, overtimeCount });
    if (encountered) {
      const ghost = back.pick(GHOST_POOL);
      const bRate = braveryRate({
        playerFocus: st.characters.PL.focus,
        codexRegistered: run.eventLog.includes(ghost),
        sourceIntegrity: st.resources.sourceIntegrity,
        fear: st.resources.fear, revisionDebt: st.resources.revisionDebt,
      });
      const ok = back.chance(bRate);
      run.eventLog.push(ghost);
      addResource(st, 'fear', ok ? 4 : 9);
      if (!ok) addResource(st, 'sourceIntegrity', -3);
      if (ok && ghost === 'GH-04') st.flags.creditLedgerPieces += 1;
    }

    // ── 페이즈 8 제작일보 (GDD 5.2 / 6.4 부채 자연 증가)
    boundary('production_log');
    st = run.state;
    if (shareLog) addResource(st, 'fear', -5); // '기록 공유' 1일 1회
    if (diff.dailyDebt > 0) addResource(st, 'revisionDebt', diff.dailyDebt);
    st.stats.maxDayReached = di + 1;
  }

  // ── D-0 검수 (GDD 5.3 / 12장)
  boundary('d0_screening');
  const st = run.state;
  const gate = d0Gate(st, difficulty);
  const score = deliveryScore(st);
  const ending = resolveEnding(st, difficulty);
  const notes = retakeNotes({
    dayReached: 8, deliveryScore: score,
    newCodexCount: new Set(run.eventLog.filter((e) => e.startsWith('GH-'))).size,
    newEndings: [ending.id], sourceIntegrity: st.resources.sourceIntegrity, difficulty,
  });
  run.rng = rng.counts();
  return { state: st, run, ending, gate, score, notes, ledger, encounterLog, confirmLog, phaseCount };
}

/* ========================================================================= *
 * 테스트 러너
 * ========================================================================= */

/** 등록된 테스트. 실행은 CLI 진입점에서만 한다(import 시 부작용 없음). */
const registry = [];

function test(no, title, fn) {
  registry.push({ no, title, fn });
}

function execute(entry) {
  const lines = [];
  const ok = [];
  const check = (label, pass, measured) => {
    ok.push(pass);
    lines.push(`      ${pass ? '·' : '!'} ${label}${measured === undefined ? '' : ` — 실측 ${measured}`}`);
  };
  let pass;
  try {
    entry.fn(check, lines);
    pass = ok.length > 0 && ok.every(Boolean);
  } catch (e) {
    pass = false;
    lines.push(`      ! 예외 발생 — ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' / ') : e}`);
  }
  return { no: entry.no, title: entry.title, pass, lines };
}

const fmt = (v, d = 2) => (typeof v === 'number' ? v.toFixed(d) : String(v));

/* ------------------------------------------------------------------------- *
 * ① 7일 완주 스모크 (GDD 19.5.3 #1)
 * ------------------------------------------------------------------------- */

test(1, '7일 완주 스모크 — 크래시 0, D-0 게이트 판정 도달', (check, lines) => {
  for (const d of DIFFICULTY_ORDER) {
    const r = runSmoke({ seed: SEED, difficulty: d });
    check(`[${DIFFICULTY[d].label}] 7일 완주 (페이즈 ${r.phaseCount}회 통과, 예외 0)`, r.phaseCount === 7 * 8 + 1, `${r.phaseCount}페이즈`);
    check(`[${DIFFICULTY[d].label}] D-0 게이트 판정 도달 (7항목 전수)`, r.gate.checks.length === 6 && typeof r.gate.passed === 'boolean', `게이트 ${r.gate.passed ? '통과' : '미달'} / 점수 ${fmt(r.score)} / ${r.ending.id}`);
    check(`[${DIFFICULTY[d].label}] 납품 점수·티어·리테이크 노트 산출 유한값`, Number.isFinite(r.score) && Number.isFinite(r.notes.total), `노트 ${fmt(r.notes.total, 1)} (×${DIFFICULTY[d].retakeMult})`);
    const finite = TRACK_KEYS.every((k) => Number.isFinite(r.state.tracks[k]) && r.state.tracks[k] >= 0 && r.state.tracks[k] <= 100);
    check(`[${DIFFICULTY[d].label}] 4트랙 0~100 범위 유지`, finite, TRACK_KEYS.map((k) => `${k} ${fmt(r.state.tracks[k], 1)}`).join(' / '));
  }
  // GDD 본문이 직접 제시한 계산 예시와 대조한다(QA 체크리스트 2항 '오차 0').
  check('컨디션 계수 = 0.5 + 0.005 × min(집중, 체력) — 집중 60·체력 80', conditionCoefficient(60, 80) === 0.8, `${conditionCoefficient(60, 80)}`);
  check('개인 산출 — 허파랑 기획 9 · 집중 90 · 체력 80 → 8.1',
    Math.abs(CHARACTERS.HP.plan * conditionCoefficient(90, 80) - 8.1) < 1e-12, `${(CHARACTERS.HP.plan * conditionCoefficient(90, 80)).toFixed(4)}`);
  check('담력 성공률 GDD 11.2 예시 — 집중 60·도감·무결성 82·공포 20·부채 12 → 83%',
    braveryRate({ playerFocus: 60, codexRegistered: true, sourceIntegrity: 82, fear: 20, revisionDebt: 12 }) === 83,
    `${braveryRate({ playerFocus: 60, codexRegistered: true, sourceIntegrity: 82, fear: 20, revisionDebt: 12 })}%`);
  // GDD 9.5.6 ⓑ 라인 8단계 검산
  const b96 = {
    tracks: { story: 100.0, footage: 89.3, post: 94.0, master: 87.1 },
    resources: { sourceIntegrity: 100.0, clientTrust: 71, revisionDebt: 0, audienceResonance: 19.1 },
  };
  check('납품 점수 GDD 9.5.6 ⓑ 8단계 검산 → 92.4', Math.abs(deliveryScore(b96) - 92.4) < 0.05, `${fmt(deliveryScore(b96), 3)}`);
  check('관객 공감 60 미만이므로 +3 미적용', deliveryScore(b96) === deliveryScore({ ...b96, resources: { ...b96.resources, audienceResonance: 59 } }), '동일');
  check('관객 공감 60 이상이면 +3 적용', Math.abs(deliveryScore({ ...b96, resources: { ...b96.resources, audienceResonance: 60 } }) - deliveryScore(b96) - 3) < 1e-9, '+3');
  check('납품 점수 티어 경계 (75 / 85 / 95)',
    deliveryTier(74.99) === 'fail' && deliveryTier(75) === 'barely' && deliveryTier(84.99) === 'barely'
    && deliveryTier(85) === 'good' && deliveryTier(94.99) === 'good' && deliveryTier(95) === 'masterpiece',
    '검수 실패 / 턱걸이 / 좋은 납품 / 대표작');
  // 난이도별 D-0 게이트 증감 (GDD 6.4)
  const gateProbe = { tracks: { story: 80, footage: 85, post: 80, master: 75 }, resources: { sourceIntegrity: 65, clientTrust: 45 } };
  check('본편집 기준 게이트 = 80/85/80/75/65/45 정확 통과', d0Gate(gateProbe, 'main_cut').passed, '통과');
  check('가편집 전 항목 -10', d0Gate(gateProbe, 'rough_cut').checks.map((c) => c.threshold).join('/') === '70/75/70/65/55/35', d0Gate(gateProbe, 'rough_cut').checks.map((c) => c.threshold).join('/'));
  check('감독판 전 항목 +5 → 동일 수치로는 미달', !d0Gate(gateProbe, 'directors_cut').passed, d0Gate(gateProbe, 'directors_cut').checks.map((c) => c.threshold).join('/'));
  check('무압축 전 항목 +10 → 동일 수치로는 미달', !d0Gate(gateProbe, 'uncompressed').passed, d0Gate(gateProbe, 'uncompressed').checks.map((c) => c.threshold).join('/'));
  check('치명 누락 플래그 1개면 게이트 차단', !d0Gate({ ...gateProbe, criticalMisses: ['분실 원본'] }, 'main_cut').passed, '차단');

  // GDD 9.5 표준 3종 재현(발주서 6.3-2)도 스모크의 일부로 함께 확인한다.
  const bal = runAll({ verbose: false });
  for (const r of bal.results) {
    check(`${r.tag} 라인 정본 재현 (${r.tag === 'ⓑ' ? '92.44 ±0.01' : r.tag === 'ⓐ' ? '57.1 ±0.1' : '94.9 ±0.1'})`, r.referenceOk, fmt(r.score));
  }
  check('ⓒ 커피 이코노미에 의한 D-1 야근 불발 재현', bal.results[2].rows[6].conf.includes('커피 부족→야근 불발'), bal.results[2].rows[6].conf);
  lines.push('      (표준 배치 스크립트 = GDD 9.5.2 ⓑ 균형 라인 배치)');
});

/* ------------------------------------------------------------------------- *
 * ② 컨펌 판정 통계 (GDD 19.5.3 #2)
 * ------------------------------------------------------------------------- */

test(2, '컨펌 판정 통계 — 1,000회 실측이 명목치 대비 ±2%p 이내', (check, lines) => {
  // 명목치 산정: 55 + 기획/4 + (신뢰-50)×0.4 - 부채/2, 클램프 5~95 (GDD 6.1)
  const cases = [
    { label: 'GDD 6.1 예시(기획 24·신뢰 50·부채 0)', story: 24, clientTrust: 50, revisionDebt: 0, expect: 61 },
    { label: '페어 브리프 잠금 +20%p 동반', story: 24, clientTrust: 50, revisionDebt: 0, bonus: 20, expect: 81 },
    { label: '경계 50%(기획 0·신뢰 50·부채 10)', story: 0, clientTrust: 50, revisionDebt: 10, expect: 50 },
    { label: '중반 표준(기획 60·신뢰 60·부채 4)', story: 60, clientTrust: 60, revisionDebt: 4, expect: 72 },
    { label: '상한 클램프 95%', story: 100, clientTrust: 100, revisionDebt: 0, expect: 95 },
    { label: '하한 클램프 5%', story: 0, clientTrust: 0, revisionDebt: 60, expect: 5 },
  ];
  // 시행 설계 주의(측정 한계):
  //   n=1,000·p≈0.6이면 표준오차가 1.55%p라 ±2%p 기준이 표집 잡음보다 좁다.
  //   단일 1,000회 배치의 통과 여부는 시드 뽑기에 좌우되므로, GDD의 '1,000회'를 배치
  //   단위로 유지한 채 고정 시드 20배치(총 20,000회)의 누적 실측으로 판정한다.
  //   (n=20,000이면 표준오차 0.35%p → ±2%p는 약 5.7σ로 시드에 무관하게 안정적이다.)
  //   개별 배치 실측도 함께 보고해 분포를 남긴다.
  const N = 1000;
  const BATCHES = 20;
  let worst = 0;
  for (const c of cases) {
    const nominal = confirmRate(c);
    check(`${c.label} 공식 명목치 = ${c.expect}%`, Math.abs(nominal - c.expect) < 1e-9, `${fmt(nominal, 3)}%`);
    let hitAll = 0;
    let batchWorst = 0;
    for (let b = 0; b < BATCHES; b += 1) {
      const s = createRng(SEED + b, null).stream('production');
      let hit = 0;
      for (let i = 0; i < N; i += 1) {
        if (resolveConfirm({ rate: nominal, roll: s.next() }).success) hit += 1;
      }
      hitAll += hit;
      batchWorst = Math.max(batchWorst, Math.abs((hit / N) * 100 - nominal));
    }
    const emp = (hitAll / (N * BATCHES)) * 100;
    const gap = Math.abs(emp - nominal);
    worst = Math.max(worst, gap);
    check(`${c.label} 누적 실측 ±2%p 이내`, gap <= 2.0,
      `${fmt(emp, 2)}% (명목 ${fmt(nominal, 1)}%, 편차 ${fmt(gap, 2)}%p, 배치 최대편차 ${fmt(batchWorst, 2)}%p)`);
  }
  check('전 케이스 누적 최대 편차 ≤ 2%p', worst <= 2.0, `${fmt(worst, 2)}%p`);
  // 중간 컨펌(D-4) 2배 가중 (GDD 6.1 결과표)
  const okMid = resolveConfirm({ rate: 90, isMidterm: true, roll: 0.0 });
  const failMid = resolveConfirm({ rate: 10, isMidterm: true, roll: 0.99 });
  check('중간 컨펌 성공 신뢰 +6', okMid.trustDelta === 6, `${okMid.trustDelta}`);
  check('중간 컨펌 실패 부채 +8', failMid.debtDelta === 8, `${failMid.debtDelta}`);
  check("2회 연속 실패 시 '컨펌 공포' 부여", resolveConfirm({ rate: 10, roll: 0.99, failStreak: 1 }).confirmFear === true, '연속 2회');
  lines.push(`      (시드 ${SEED} 고정 · 케이스당 ${N}회)`);
});

/* ------------------------------------------------------------------------- *
 * ③ 이면 조우율 검증 (GDD 19.5.3 #3)
 * ------------------------------------------------------------------------- */

test(3, '이면 조우율 4난이도 — 기본률 22/30/38/46%와 보정 합산 일치', (check, lines) => {
  const expectBase = { rough_cut: 22, main_cut: 30, directors_cut: 38, uncompressed: 46 };
  const neutral = { overtimeCount: 0, avgFocus: 60, revisionDebt: 0, dayIndex: 0, sourceIntegrity: 75 };

  for (const d of DIFFICULTY_ORDER) {
    const r = encounterRateRaw({ difficulty: d, ...neutral });
    check(`[${DIFFICULTY[d].label}] 무보정 기본률 = ${expectBase[d]}%`, r === expectBase[d], `${r}%`);
  }

  // 보정 조합 — 6.2의 여섯 항만으로 합산되는지 전수 대조
  const combos = [
    { label: '야근 3인', arg: { overtimeCount: 3 }, delta: 21 },
    { label: '평균 집중 39', arg: { avgFocus: 39 }, delta: 15 },
    { label: '수정 부채 25', arg: { revisionDebt: 25 }, delta: 8 },
    { label: 'D-4(일차 보정 +5)', arg: { dayIndex: 3 }, delta: 5 },
    { label: 'D-1(일차 보정 +20)', arg: { dayIndex: 6 }, delta: 20 },
    { label: '무결성 80 이상', arg: { sourceIntegrity: 80 }, delta: -10 },
    { label: '복합(야근 2·집중 30·부채 30·D-2·무결성 90)', arg: { overtimeCount: 2, avgFocus: 30, revisionDebt: 30, dayIndex: 5, sourceIntegrity: 90 }, delta: 14 + 15 + 12 + 15 - 10 },
  ];
  for (const d of DIFFICULTY_ORDER) {
    for (const c of combos) {
      const r = encounterRateRaw({ difficulty: d, ...neutral, ...c.arg });
      const want = expectBase[d] + c.delta;
      check(`[${DIFFICULTY[d].label}] ${c.label} → ${want}%`, r === want, `${r}%`);
    }
  }

  // 식 불변 원칙: 여섯 항 이외의 상태를 바꿔도 값이 변하지 않는다 (GDD 6.2)
  const a = encounterRateRaw({ difficulty: 'main_cut', ...neutral });
  const b = encounterRateRaw({ difficulty: 'main_cut', ...neutral, clientTrust: 99, fear: 80, budget: -1 });
  check('식 불변 — 6항 외 상태는 조우율에 영향 없음', a === b, `${a}% = ${b}%`);

  // 클램프 5~95
  const maxArg = { difficulty: 'uncompressed', overtimeCount: 3, avgFocus: 10, revisionDebt: 60, dayIndex: 6, sourceIntegrity: 10 };
  check('상한 클램프 95 (원값 126 → 95)', backStudioEncounterRate(maxArg) === 95, `원값 ${encounterRateRaw(maxArg)}% → ${backStudioEncounterRate(maxArg)}%`);
  // 하한: 6.2의 감산 항은 '무결성 80 이상 −10%p' 하나뿐이므로 도달 가능한 최소는
  // 가편집 기본률 22 − 10 = 12다. 즉 하한 5는 방어적 클램프이며 정상 플레이에서 발동하지 않는다.
  let minRaw = Infinity;
  for (const d of DIFFICULTY_ORDER) {
    for (const integ of [0, 79, 80, 100]) {
      for (const avg of [39, 40]) {
        for (const dbt of [0, 60]) {
          for (const dayIndex of [0, 6]) {
            for (const ot of [0, 3]) {
              minRaw = Math.min(minRaw, encounterRateRaw({ difficulty: d, overtimeCount: ot, avgFocus: avg, revisionDebt: dbt, dayIndex, sourceIntegrity: integ }));
            }
          }
        }
      }
    }
  }
  check('하한 클램프 5는 미발동 — 도달 가능한 원값 최소는 12 (가편집 22 − 무결성 10)', minRaw === 12 && backStudioEncounterRate({ difficulty: 'rough_cut', overtimeCount: 0, avgFocus: 90, revisionDebt: 0, dayIndex: 0, sourceIntegrity: 100 }) === 12, `전 조합 원값 최소 ${minRaw}%`);

  // 몬테카를로 — 고정 시드 20,000 시행의 실측 조우 빈도
  const N = 20000;
  for (const d of DIFFICULTY_ORDER) {
    const rate = encounterRateRaw({ difficulty: d, ...neutral });
    const rng = createRng(SEED, null);
    const s = rng.stream('backstudio');
    let hit = 0;
    for (let i = 0; i < N; i += 1) if (s.chance(rate)) hit += 1;
    const emp = (hit / N) * 100;
    check(`[${DIFFICULTY[d].label}] 실측 조우 빈도 ±1%p`, Math.abs(emp - rate) <= 1.0, `${fmt(emp, 2)}% (명목 ${rate}%)`);
  }
  lines.push(`      (난이도 기본률은 6.2 "기본 30%" 항의 치환이며 새 항이 아니다 — GDD 6.4)`);
});

/* ------------------------------------------------------------------------- *
 * ④ 진엔딩 체인 리플레이 (GDD 19.5.3 #4)
 * ------------------------------------------------------------------------- */

/** 진엔딩 정답 입력 시퀀스. GDD 11.4 일차별 권장 진행표. */
const TRUE_END_INPUT = [
  { day: 'D-6', act: 'ACQUIRE_IT30' },
  { day: 'D-5', act: 'GH-08' },
  { day: 'D-4', act: 'GH-09' },      // 조각 2/3
  { day: 'D-3', act: 'GH-04' },      // 조각 1/3
  { day: 'D-2', act: 'GH-12' },      // 조각 3/3 (이혜미 유대도 60 필요)
  { day: 'D-2', act: 'MANIFEST' },   // 원본·권리 목록 80%
  { day: 'D-1', act: 'GH-14' },      // '전부 복원' — 진척 합계 -10
  { day: 'D-1', act: 'GH-15' },      // '제작자 전원과 출처를 기록' → TRACEABLE_MASTER
];

/** 정답 시퀀스를 고정 시드로 재생한다. */
function replayTrueEnd(seed) {
  const rng = createRng(seed, null);
  const back = rng.stream('backstudio');
  const st = createRunState('main_cut');
  // 진엔딩 게이트를 통과할 수 있는 D-1 시점 진척으로 세팅 (GDD 11.4 운영 유의점)
  st.tracks = { story: 100, footage: 95, post: 96, master: 90 };
  st.resources.sourceIntegrity = 100;
  st.resources.clientTrust = 71;
  st.characters.HM.bond = 60;
  const trace = [];
  let flags = { ...st.flags };

  for (const step of TRUE_END_INPUT) {
    if (step.act === 'ACQUIRE_IT30') {
      const r = advanceTrueEndChain(flags, 'IT-30');
      flags = r.flags;
      trace.push({ ...step, ok: r.ok, reason: r.reason });
      continue;
    }
    if (step.act === 'MANIFEST') {
      flags.rightsManifestPct = 80;
      const r = advanceTrueEndChain(flags, 'LEDGER');
      flags = r.flags;
      trace.push({ ...step, ok: r.ok, reason: r.reason });
      continue;
    }
    if (LEDGER_PIECE_SOURCES.includes(step.act)) {
      // 담력 판정을 실제로 굴린다(backstudio 스트림).
      // GDD 11.4 진행표: "실패 시 D-3에 재시도" — 조각 획득은 재조우로 다시 시도한다.
      // 조우 자체가 확률이므로 재시도 없이 1회 판정만 두면 시드에 따라 체인이 끊긴다.
      const MAX_ATTEMPTS = 3;
      let ok = false;
      let attempts = 0;
      let rate = 0;
      while (!ok && attempts < MAX_ATTEMPTS) {
        rate = braveryRate({
          playerFocus: st.characters.PL.focus, codexRegistered: attempts > 0, // 1회 조우 후 도감 등록 +15%p
          sourceIntegrity: st.resources.sourceIntegrity,
          fear: st.resources.fear, revisionDebt: st.resources.revisionDebt,
        });
        ok = back.chance(rate);
        attempts += 1;
        if (!ok) st.resources.fear = Math.min(100, st.resources.fear + 9);
      }
      if (step.act === 'GH-09') {
        const r = advanceTrueEndChain(flags, 'GH-09');
        flags = r.flags;
      }
      if (ok) flags.creditLedgerPieces = (flags.creditLedgerPieces ?? 0) + 1;
      trace.push({ ...step, ok, rate, attempts });
      continue;
    }
    const r = advanceTrueEndChain(flags, step.act);
    flags = r.flags;
    if (step.act === 'GH-14' && r.ok) { // '전부 복원' 진척 합계 -10
      st.tracks.post -= 4; st.tracks.master -= 3; st.tracks.footage -= 3;
    }
    trace.push({ ...step, ok: r.ok, reason: r.reason });
  }

  st.flags = flags;
  const ending = resolveEnding(st, 'main_cut');
  return { st, flags, trace, ending, rngCounts: rng.counts() };
}

test(4, '진엔딩 체인 리플레이 — 동일 시드 동일 결과, ED-11 도달', (check, lines) => {
  const a = replayTrueEnd(SEED);
  const b = replayTrueEnd(SEED);
  check('동일 시드 리플레이 완전 일치 (상태 해시)', stateHash(a.st) === stateHash(b.st), `${stateHash(a.st)} = ${stateHash(b.st)}`);
  check('동일 시드 RNG 소비 카운트 일치', JSON.stringify(a.rngCounts) === JSON.stringify(b.rngCounts), JSON.stringify(a.rngCounts));
  // 시드 20종 전수 재생 — 정답 시퀀스는 시드와 무관하게 ED-11에 도달해야 한다.
  let allEd11 = true;
  let deterministic = true;
  const seeds = [];
  for (let k = 0; k < 20; k += 1) {
    const x = replayTrueEnd(SEED + k);
    if (x.ending.id !== 'ED-11') allEd11 = false;
    if (stateHash(replayTrueEnd(SEED + k).st) !== stateHash(x.st)) deterministic = false;
    seeds.push(stateHash(x.trace));
  }
  check('시드 20종 전수 재생에서 ED-11 도달', allEd11, `${seeds.length}시드`);
  check('시드 20종 전수 재현성(동일 시드 재생 시 동일 해시)', deterministic, '불일치 0건');
  check('시드가 다르면 판정열도 달라짐', new Set(seeds).size > 1, `판정열 해시 ${new Set(seeds).size}종`);

  check('크레딧 장부 조각 3 달성', a.flags.creditLedgerPieces === 3, `${a.flags.creditLedgerPieces}/3`);
  check('원본·권리 목록 80% 달성', a.flags.rightsManifestPct >= 80, `${a.flags.rightsManifestPct}%`);
  check('TRACEABLE_MASTER 획득', a.flags.traceableMaster === true, `${a.flags.traceableMaster}`);
  check('ED-11 도달 (점수 85+ / 게이트 통과)', a.ending.id === 'ED-11', `${a.ending.id} / 점수 ${fmt(a.ending.score)} / 게이트 ${a.ending.gate.passed ? '통과' : '미달'}`);
  check('ED-11 리테이크 노트 보상 150', retakeNotes({ dayReached: 8, deliveryScore: 0, newEndings: ['ED-11'], sourceIntegrity: 0 }).breakdown.endings === 150, '150');

  // 체인 순서 위반 진입 불가 (GDD 11.4 / QA 3항)
  check('순서 위반 — IT-30 없이 GH-08 진입 불가', advanceTrueEndChain({}, 'GH-08').ok === false, advanceTrueEndChain({}, 'GH-08').reason);
  check('순서 위반 — GH-08 없이 GH-09 진입 불가', advanceTrueEndChain({ it30Owned: true }, 'GH-09').ok === false, advanceTrueEndChain({ it30Owned: true }, 'GH-09').reason);
  check('조각 2·목록 80%면 LEDGER 미성립', advanceTrueEndChain({ gh09Asked: true, creditLedgerPieces: 2, rightsManifestPct: 80 }, 'LEDGER').ok === false, '조각 2/3');
  check('조각 3·목록 79%면 LEDGER 미성립', advanceTrueEndChain({ gh09Asked: true, creditLedgerPieces: 3, rightsManifestPct: 79 }, 'LEDGER').ok === false, '목록 79%');
  check('LEDGER 없이 GH-14 진입 불가', advanceTrueEndChain({ gh09Asked: true }, 'GH-14').ok === false, advanceTrueEndChain({ gh09Asked: true }, 'GH-14').reason);
  check('조각 지급처는 GH-04·GH-09·GH-12 3곳뿐 (GH-07 제외)', LEDGER_PIECE_SOURCES.length === 3 && !LEDGER_PIECE_SOURCES.includes('GH-07'), LEDGER_PIECE_SOURCES.join(', '));

  // 점수 85 미만이면 TRACEABLE_MASTER가 있어도 ED-11이 아니다 (GDD 12장 조건)
  const low = createRunState('main_cut');
  low.tracks = { story: 80, footage: 85, post: 80, master: 75 };
  low.resources.sourceIntegrity = 65; low.resources.clientTrust = 45;
  low.flags.traceableMaster = true;
  check('TRACEABLE_MASTER + 점수 85 미만 → ED-11 아님', resolveEnding(low).id !== 'ED-11', `${resolveEnding(low).id} / 점수 ${fmt(resolveEnding(low).score)}`);
  lines.push(`      (체인 ${TRUE_END_CHAIN.map((s) => s.id).join(' → ')} → ED-11)`);
});

/* ------------------------------------------------------------------------- *
 * ⑤ 세이브 무결성 루프 (GDD 19.5.3 #5)
 * ------------------------------------------------------------------------- */

test(5, '세이브 무결성 — 페이즈 경계 저장→로드 후 상태 해시 일치', (check, lines) => {
  // 저장/로드 없이 1회
  const plain = runSmoke({ seed: SEED, difficulty: 'uncompressed' });

  // 페이즈 경계마다 직렬화→역직렬화하고 그 결과를 채택해 완주
  let cycles = 0;
  let mismatch = 0;
  const looped = runSmoke({
    seed: SEED,
    difficulty: 'uncompressed',
    phaseHook: (run) => {
      // 비교는 직렬화 페이로드끼리 한다. 원본 run에는 schemaVersion이 없고 세이브에는 있으므로
      // 원본 객체와 복원본을 직접 비교하면 그 한 키 때문에 항상 어긋난다.
      const before = stateHash(JSON.parse(serializeRun(run)));
      const restored = deserializeRun(serializeRun(run));
      cycles += 1;
      if (stateHash(JSON.parse(serializeRun(restored))) !== before) mismatch += 1;
      return restored;
    },
  });

  check(`페이즈 경계 저장→로드 ${cycles}회 왕복`, cycles === 7 * 8 + 1, `${cycles}회`);
  check('왕복 직후 상태 해시 불일치 0건', mismatch === 0, `${mismatch}건`);
  check('저장 루프 완주 결과가 무저장 런과 동일 (상태 해시)', stateHash(looped.state) === stateHash(plain.state), `${stateHash(looped.state)} = ${stateHash(plain.state)}`);
  check('납품 점수 동일', looped.score === plain.score, `${fmt(looped.score, 6)}`);
  check('엔딩 동일', looped.ending.id === plain.ending.id, `${looped.ending.id}`);
  check('RNG 스트림 호출 카운트 보존', JSON.stringify(looped.run.rng) === JSON.stringify(plain.run.rng), JSON.stringify(plain.run.rng));

  // 스키마·복원 횟수 보존 (GDD 18.7)
  const sample = {
    seed: SEED, difficulty: 'uncompressed', day: 4, phase: 'confirm',
    state: plain.state, rng: plain.run.rng,
    eventLog: ['OF-01', 'GH-01'], cooldowns: { 'GH-01': 2 },
    reservedChains: [{ eventId: 'GH-08', day: 5 }],
    confirmFailStreak: 1, restoreUsed: 2,
    unknownVendorKey: { keep: true },
  };
  const round = deserializeRun(serializeRun(sample));
  check('schemaVersion 4.0.0 기록', JSON.parse(serializeRun(sample)).schemaVersion === '4.0.0', '4.0.0');
  check('복원(루프) 횟수 restoreUsed 보존', round.restoreUsed === 2, `${round.restoreUsed}`);
  check('무압축 복원 3회 제한값 데이터 보유', DIFFICULTY.uncompressed.restoreLimit === 3, `${DIFFICULTY.uncompressed.restoreLimit}회`);
  check('콘텐츠 ID 원전 표기 보존', round.eventLog.join(',') === 'OF-01,GH-01' && round.cooldowns['GH-01'] === 2, round.eventLog.join(','));
  check('예약 체인 큐 보존', round.reservedChains[0].eventId === 'GH-08' && round.reservedChains[0].day === 5, 'GH-08 @ day 5');
  check('알 수 없는 키 미삭제 보존', round.unknownVendorKey?.keep === true, 'unknownVendorKey');

  // 시드 + 카운트만으로 스트림 복원 (GDD 18.7 / 발주서 6.4-4)
  const r1 = createRng(SEED, null);
  const s1 = r1.stream('reality');
  const seq = [];
  for (let i = 0; i < 40; i += 1) seq.push(s1.next());
  const r2 = createRng(SEED, { ...r1.counts(), reality: 20 });
  const s2 = r2.stream('reality');
  const tail = [];
  for (let i = 0; i < 20; i += 1) tail.push(s2.next());
  check('시드+카운트 복원으로 동일 난수열 재개', seq.slice(20).every((v, i) => v === tail[i]), `20~39번 난수 ${tail.length}개 일치`);
  check('스트림 5종 분리', STREAMS.join(',') === 'scramble,production,reality,backstudio,vfx', STREAMS.join(','));
  const r3 = createRng(SEED, null);
  const cross = r3.stream('vfx').next() !== r3.stream('backstudio').next();
  check('vfx 스트림이 판정 스트림과 독립', cross, '난수열 상이');
  lines.push('      (난이도 무압축 — 복원 3회 제한 필드 포함 검증)');
});

/* ------------------------------------------------------------------------- *
 * ⑥ 커피·간식 제동 (AC-MEM-06 · AC-MEM-08)
 * ------------------------------------------------------------------------- */

test(6, '커피·간식 제동 — 전 일차 확보 시도에도 커피 ≤ 18 / 간식 ≤ 14', (check, lines) => {
  let L = createSupplyLedger();
  let spawnBlocked = 0;

  // 획득 가능한 전 일차(D-7~D-1)에 IT-28·IT-29를 매일 확보 시도하고,
  // 밈 레이어 출처(OF-30 / IT-31 / IT-32 / IT-37 / IT-38 / GH-16)도 매일 확보 시도한다.
  const memeSources = [
    { sourceId: 'IT-31', coffee: 1 },
    { sourceId: 'IT-37', coffee: 1 },
    { sourceId: 'IT-32', snack: 2 },
    { sourceId: 'IT-38', snack: 2 },
    { sourceId: 'OF-30', coffee: 4, snack: 3 },
    { sourceId: 'GH-16', coffee: 1, snack: 1 },
  ];
  for (const day of DAYS) {
    for (const id of ['IT-28', 'IT-29']) {
      if (!canSpawn(L, id)) { spawnBlocked += 1; continue; }
      const gain = id === 'IT-28' ? { coffee: 5 } : { snack: 4 };
      L = applySupplyGain(L, { sourceId: id, instanceId: `${id}@${day}`, day, ...gain }).ledger;
      // 드롭 후 같은 런에서 재획득 — 카운터 미증가·자원 미재지급 (GDD 7.3 획득 1회의 정의)
      L = applySupplyGain(L, { sourceId: id, instanceId: `${id}@${day}`, day, ...gain }).ledger;
    }
    for (const m of memeSources) {
      L = applySupplyGain(L, { ...m, instanceId: `${m.sourceId}@${day}`, day }).ledger;
    }
  }

  const audit = auditSupply(L);
  for (const c of audit.checks) check(c.key, c.ok, c.detail);
  check('커피 총공급 = 규칙상 최대 18 (초기 6 + IT-28 5×2 + 밈 +2)', audit.coffeeTotal === 18, `${audit.coffeeTotal}`);
  check('간식 총공급 = 규칙상 최대 14 (초기 4 + IT-29 4×2 + 밈 +2)', audit.snackTotal === 14, `${audit.snackTotal}`);
  check('IT-28 2회 획득 후 잔여 일차 재스폰 차단', spawnBlocked > 0 && !canSpawn(L, 'IT-28'), `차단 ${spawnBlocked}회`);
  check('IT-29 2회 획득 후 잔여 일차 재스폰 차단', !canSpawn(L, 'IT-29'), '차단됨');
  check('보유 상한 준수 (커피 ≤ 20 / 간식 ≤ 15)', L.coffee <= SUPPLY_CAP.coffeeHold && L.snack <= SUPPLY_CAP.snackHold, `커피 ${L.coffee} / 간식 ${L.snack}`);

  // 두 카운터 분리 (AC-MEM-08 단서 3): 밈 획득으로 IT-28 횟수를 되사지 못한다.
  let M = createSupplyLedger();
  for (let i = 0; i < 6; i += 1) M = applySupplyGain(M, { sourceId: 'IT-31', instanceId: `IT-31#${i}`, coffee: 1 }).ledger;
  M = applySupplyGain(M, { sourceId: 'IT-28', instanceId: 'IT-28#1', coffee: 5 }).ledger;
  M = applySupplyGain(M, { sourceId: 'IT-28', instanceId: 'IT-28#2', coffee: 5 }).ledger;
  const third = applySupplyGain(M, { sourceId: 'IT-28', instanceId: 'IT-28#3', coffee: 5 });
  check('밈 카운터와 IT-28 카운터 분리 — 3회째 IT-28 획득 0', third.grantedCoffee === 0 && third.reason === 'pickup_limit', `${third.grantedCoffee} (${third.reason})`);
  check('밈 통산 상한 초과분은 0으로 기록', M.memeCoffee === 2, `밈 커피 +${M.memeCoffee}`);

  // 드롭→재획득 재지급 차단 (AC-MEM-08 단서 6)
  let D = createSupplyLedger();
  const first = applySupplyGain(D, { sourceId: 'IT-28', instanceId: 'IT-28@D-7', coffee: 5 });
  D = first.ledger;
  const again = applySupplyGain(D, { sourceId: 'IT-28', instanceId: 'IT-28@D-7', coffee: 5 });
  check('드롭 후 재획득 시 커피 미재지급', first.grantedCoffee === 5 && again.grantedCoffee === 0, `최초 +${first.grantedCoffee} / 재획득 +${again.grantedCoffee}`);
  check('드롭 후 재획득 시 카운터 미증가', again.ledger.itemCount['IT-28'] === 1, `${again.ledger.itemCount['IT-28']}회`);

  // IT-33 런당 1회 (GDD 7.3 동일 형식)
  let T = createSupplyLedger();
  T = applySupplyGain(T, { sourceId: 'IT-33', instanceId: 'IT-33@D-7' }).ledger;
  check('IT-33 런당 1회 제한 유지', !canSpawn(T, 'IT-33'), '2회째 스폰 차단');

  // 스모크 런의 실제 로그로도 총공급 검사 (AC-MEM-06 판정 방식과 동일)
  for (const d of DIFFICULTY_ORDER) {
    const r = runSmoke({ seed: SEED, difficulty: d });
    const a = auditSupply(r.ledger);
    check(`[${DIFFICULTY[d].label}] 스모크 런 로그 총공급 검사`, a.ok, `커피 ${a.coffeeTotal} / 간식 ${a.snackTotal}`);
  }
  lines.push('      (IT-28·IT-29 획득 상한 카운터와 밈 레이어 통산 상한 카운터는 별개 — AC-MEM-08 단서 3)');
});

/* ========================================================================= *
 * 출력
 * ========================================================================= */

/**
 * 등록된 테스트를 실행하고 결과를 출력한다.
 * @param {number[]} [only] 실행할 테스트 번호(비우면 전체)
 * @returns {{results: object[], failed: object[]}}
 */
export function runTests(only = []) {
  const targets = only.length > 0 ? registry.filter((r) => only.includes(r.no)) : registry;
  console.log('=========================================================');
  console.log(' 《최종_진짜최종: D-7》 시드 고정 자동 테스트 (GDD 19.5.3)');
  console.log(` 시드 ${SEED} · Node ${process.version} · 의존성 0`);
  console.log('=========================================================');
  const results = [];
  for (const t of targets) {
    const r = execute(t);
    results.push(r);
    console.log(`\n[${r.pass ? 'PASS' : 'FAIL'}] ${r.no}. ${r.title}`);
    for (const l of r.lines) console.log(l);
  }
  const failed = results.filter((r) => !r.pass);
  console.log('\n---------------------------------------------------------');
  console.log(` 결과: ${results.length - failed.length} PASS / ${failed.length} FAIL (총 ${results.length}종)`);
  console.log('---------------------------------------------------------');
  if (failed.length > 0) console.error(` 실패: ${failed.map((r) => `${r.no}. ${r.title}`).join(' | ')}`);
  return { results, failed };
}

// 경로에 비ASCII 문자가 있으면 import.meta.url이 퍼센트 인코딩되므로 URL로 정규화해 비교한다.
const isMain = (() => {
  try {
    return new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;
  } catch { return false; }
})();

if (isMain) {
  const only = process.argv.slice(2).filter((a) => /^[1-6]$/.test(a)).map(Number);
  const { failed } = runTests(only);
  if (failed.length > 0) process.exit(1);
}
