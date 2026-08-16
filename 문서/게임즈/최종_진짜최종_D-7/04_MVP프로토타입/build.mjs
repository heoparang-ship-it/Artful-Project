#!/usr/bin/env node
/* =============================================================================
   최종_진짜최종: D-7 — MVP 콘텐츠 임베드 빌드
   -----------------------------------------------------------------------------
   목적
     data/*.json 을 읽어 index.html 의 데이터 블록을 갱신한다.
     기획자는 코드를 한 줄도 고치지 않고 data/*.json 만 수정한 뒤
     `node build.mjs` 를 실행하면 이벤트·괴이·아이템·플레이버가 게임에 반영된다.

   왜 필요한가
     index.html 은 file:// 로 바로 열려야 한다(발주서 MVP 배포 조건).
     file:// 에서는 fetch 가 CORS 로 차단되므로 JSON 을 인라인으로 심는다.
     http(s) 로 서빙할 때는 index.html 이 먼저 data/*.json 을 fetch 하므로
     빌드 없이도 즉시 반영된다 — 빌드는 file:// 배포본 갱신용이다.

   사용법
     node build.mjs            # data/*.json → index.html 데이터 블록 갱신
     node build.mjs --check    # 갱신 없이 정원·구조만 검사(종료 코드로 보고)

   의존성 0. Node.js 18+ 표준 모듈만 사용한다.
   ============================================================================= */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, 'data');
const HTML = join(HERE, 'index.html');
const START = '<!--BUILD:DATA:START-->';
const END   = '<!--BUILD:DATA:END-->';

/* 정원 — data/schema.md §8.1 V-02 */
const EXPECT = {
  events: 30, chains: 5, ghosts: 19, items: 38,
  loading: 50, productionLog: 30, messenger: 26, dialogue: 30, props: 30, endingLines: 20,
};

const FILES = ['events', 'ghosts', 'items', 'flavor', 'memes'];

function readJson(name) {
  const p = join(DATA, name + '.json');
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`[FAIL] ${name}.json 파싱 실패 — ${e.message}`);
    process.exit(1);
  }
}

function verify(raw) {
  const errs = [];
  const got = {
    events: raw.events?.events?.length ?? 0,
    chains: raw.events?.chains?.length ?? 0,
    ghosts: raw.ghosts?.ghosts?.length ?? 0,
    items:  raw.items?.items?.length ?? 0,
    loading: raw.flavor?.loading?.length ?? 0,
    productionLog: raw.flavor?.productionLog?.length ?? 0,
    messenger: raw.flavor?.messenger?.length ?? 0,
    dialogue: raw.flavor?.dialogue?.length ?? 0,
    props: raw.flavor?.props?.length ?? 0,
    endingLines: raw.flavor?.endingLines?.length ?? 0,
  };
  for (const [k, n] of Object.entries(EXPECT)) {
    if (got[k] !== n) errs.push(`정원 불일치 ${k}: ${got[k]} (기대 ${n})`);
  }

  /* ID 형식·유일성 */
  const seen = new Set();
  const checkIds = (list, re, label) => {
    for (const o of list || []) {
      if (!re.test(o.id)) errs.push(`${label} ID 형식 위반: ${o.id}`);
      if (seen.has(o.id)) errs.push(`${label} ID 중복: ${o.id}`);
      seen.add(o.id);
    }
  };
  checkIds(raw.events?.events, /^OF-\d{2}$/, '이벤트');
  checkIds(raw.events?.chains, /^CH-\d{2}$/, '체인');
  checkIds(raw.ghosts?.ghosts, /^GH-\d{2}$/, '괴이');
  checkIds(raw.items?.items,  /^IT-\d{2}$/, '아이템');
  for (const c of raw.events?.chains || [])
    for (const st of c.stages || [])
      if (!/^OF-\d{2}-S\d$/.test(st.id)) errs.push(`체인 단계 ID 형식 위반: ${st.id}`);

  /* 정본 불변 — 조우율 가감 항 0건 (schema.md V-16) */
  const blob = JSON.stringify([raw.events, raw.ghosts, raw.items]);
  for (const bad of ['encounterRate', 'encounterBonus', 'encounterMod']) {
    if (blob.includes(bad)) errs.push(`정본 위반 — 이면 조우율 가감 필드 발견: ${bad}`);
  }

  /* 현실 이벤트 30종은 전부 once (V-23) */
  for (const e of raw.events?.events || [])
    if (e.once !== true) errs.push(`once 위반: ${e.id}`);

  /* D-1(7)·D-0(8)에 밈 이벤트 편성 금지 (V-24) */
  for (const e of raw.events?.events || [])
    if (e.memeLayer && (e.days || []).some(d => d >= 7))
      errs.push(`밈 이벤트가 D-1 이후에 편성됨: ${e.id}`);

  /* 일차별 밈 점유율 70% 이하 (V-25) */
  for (let d = 1; d <= 8; d++) {
    let meme = 0, total = 0;
    for (const e of raw.events?.events || []) {
      if (!(e.days || []).includes(d)) continue;
      let w = e.weight || 0;
      if (e.memeLayer && e.decayFromDay && d >= e.decayFromDay) w = Math.floor(w * 0.5);
      total += w;
      if (e.memeLayer) meme += w;
    }
    if (total > 0 && meme / total > 0.70)
      errs.push(`밈 점유율 초과 D-${8 - d}: ${(meme / total * 100).toFixed(1)}%`);
  }

  /* 크레딧 장부 조각 지급처 정확히 3곳 (V-20) */
  const ledger = (raw.ghosts?.ghosts || []).filter(g => g.givesCreditLedgerPiece);
  if (ledger.length !== 3) errs.push(`크레딧 장부 조각 지급처 ${ledger.length}곳 (기대 3곳: GH-04·GH-09·GH-12)`);

  /* IT-28·IT-29 런당 획득 상한 2 (GDD 7.3) */
  for (const id of ['IT-28', 'IT-29']) {
    const it = (raw.items?.items || []).find(x => x.id === id);
    if (!it) errs.push(`${id} 없음`);
    else if (it.runLimit !== 2) errs.push(`${id} runLimit ${it.runLimit} (기대 2)`);
  }

  /* 밈 커피·간식 아이템의 통산 상한 표기 (V-19) */
  for (const it of raw.items?.items || []) {
    const givesFood = (it.effect || []).some(e => e.type === 'resource' && (e.target === 'coffee' || e.target === 'snack'));
    if (it.memeLayer && givesFood && !it.memeCapped)
      errs.push(`밈 레이어 커피·간식 아이템에 memeCapped 없음: ${it.id}`);
  }

  return { errs, got };
}

const raw = Object.fromEntries(FILES.map(n => [n, readJson(n)]));
const { errs, got } = verify(raw);

console.log('── 콘텐츠 정원 ──');
for (const [k, n] of Object.entries(EXPECT)) {
  console.log(`  ${k.padEnd(14)} ${String(got[k]).padStart(3)} / ${n}  ${got[k] === n ? 'OK' : 'MISMATCH'}`);
}
const flavorTotal = ['loading', 'productionLog', 'messenger', 'dialogue', 'props', 'endingLines']
  .reduce((a, k) => a + got[k], 0);
console.log(`  플레이버 합계   ${flavorTotal} / 186`);

if (errs.length) {
  console.error('\n── 검증 오류 ──');
  for (const e of errs) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\n검증 통과 — 오류 0건');

if (process.argv.includes('--check')) process.exit(0);

/* ---- index.html 데이터 블록 갱신 ---- */
let html = readFileSync(HTML, 'utf8');
const a = html.indexOf(START), b = html.indexOf(END);
if (a < 0 || b < 0) {
  console.error(`[FAIL] index.html 에서 ${START} … ${END} 마커를 찾지 못했습니다.`);
  process.exit(1);
}

const payload = {
  events: { events: raw.events.events, chains: raw.events.chains },
  ghosts: { ghosts: raw.ghosts.ghosts },
  items:  { items: raw.items.items },
  flavor: {
    loading: raw.flavor.loading, productionLog: raw.flavor.productionLog,
    messenger: raw.flavor.messenger, dialogue: raw.flavor.dialogue,
    props: raw.flavor.props, endingLines: raw.flavor.endingLines,
  },
  memes:  { pairs: raw.memes.pairs, memes: raw.memes.memes },
  builtAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
};

/* `<` 를 이스케이프해 </script> 조기 종료를 원천 차단한다(JSON 규격 내 이스케이프) */
const json = JSON.stringify(payload).replace(/</g, '\\u003c');
const block = `${START}\n<script id="ffd7-data" type="application/json">${json}<\/script>\n${END}`;

html = html.slice(0, a) + block + html.slice(b + END.length);
writeFileSync(HTML, html, 'utf8');

console.log(`\nindex.html 데이터 블록 갱신 완료 — ${(json.length / 1024).toFixed(1)} KB 임베드 (${payload.builtAt})`);
console.log('file:// 로 index.html 을 바로 열어 확인할 수 있습니다.');
