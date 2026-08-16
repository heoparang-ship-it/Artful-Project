#!/usr/bin/env node
/* =============================================================================
   최종_진짜최종: D-7 — MVP 헤드리스 스모크 테스트
   -----------------------------------------------------------------------------
   file:// 로 index.html 을 열어 전 구간을 실제로 통과시킨다.
     타이틀 → 스크램블 → 업무 배치 → 현실 이벤트 → 컨펌 → 야근
       → 21:57 전환 → 이면 스튜디오 → 제작일보 → 다음 날 … → D-0 판정
       → 엔딩 → 리테이크 정산
   동시에 브라우저 콘솔 에러·미처리 예외를 0건으로 확인한다.

   사용법
     node smoke.mjs            # 헤드리스 전 구간 통과 검사
     node smoke.mjs --headed   # 창을 띄워 육안 확인

   Playwright 는 전역 설치본을 자동 탐색한다(로컬 node_modules 불필요).
   ============================================================================= */

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const INDEX = join(HERE, 'index.html');
const DATA = join(HERE, 'data');
const HEADED = process.argv.includes('--headed');

/* ---- Playwright 해석 (로컬 → 전역 npm root 폴백) ---- */
const unwrap = m => (m && m.chromium) ? m : (m && m.default) ? m.default : m;
async function loadPlaywright() {
  try { return unwrap(await import('playwright')); } catch {}
  let root = '';
  try { root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(); } catch {}
  for (const base of [root, '/opt/node22/lib/node_modules', '/usr/lib/node_modules', '/usr/local/lib/node_modules']) {
    if (!base) continue;
    const dir = join(base, 'playwright');
    if (!existsSync(dir)) continue;
    for (const entry of ['index.mjs', 'index.js']) {
      const f = join(dir, entry);
      if (existsSync(f)) { const m = unwrap(await import(pathToFileURL(f).href)); if (m && m.chromium) return m; }
    }
  }
  throw new Error('playwright 를 찾지 못했습니다. `npm i -D playwright` 또는 전역 설치가 필요합니다.');
}

/* ---- 결과 집계 ---- */
const checks = [];
let failed = 0;
function ok(name, cond, detail) {
  checks.push({ name, pass: !!cond, detail: detail ?? '' });
  if (!cond) failed++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- 페이지 헬퍼 ---- */
const screenOn = page => page.evaluate(() => {
  const s = document.querySelector('.screen.on');
  return s ? s.id : null;
});
const overlayOn = page => page.$eval('#ovl', n => n.classList.contains('on'));
/* 21:57 전환 오버레이는 화면 위에 덮이므로 걷힐 때까지 조작하지 않는다 */
async function waitOverlayClear(page, timeout = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { if (!(await overlayOn(page))) return; await sleep(80); }
}
async function waitScreen(page, ids, timeout = 15000) {
  const t0 = Date.now();
  const want = Array.isArray(ids) ? ids : [ids];
  while (Date.now() - t0 < timeout) {
    if (await overlayOn(page)) { await sleep(80); continue; }
    const s = await screenOn(page);
    if (want.includes(s)) return s;
    await sleep(60);
  }
  throw new Error(`화면 대기 실패: ${want.join('/')} (현재 ${await screenOn(page)})`);
}
async function press(page, key, ms) {
  await page.keyboard.down(key);
  await sleep(ms);
  await page.keyboard.up(key);
}
async function clickIf(page, sel) {
  const el = await page.$(sel);
  if (!el) return false;
  const dis = await el.evaluate(n => !!n.disabled);
  if (dis) return false;
  await el.click();
  return true;
}
/* 업무 배치: 빈 슬롯이 남아 있는 한 인물을 하나씩 배치한다 */
const assignAll = page => page.evaluate(() => {
  for (let g = 0; g < 15; g++) {
    const go = document.getElementById('bdGo');
    if (!go.disabled) return 'ready';
    const chip = document.querySelector('#bdChars .chip:not(.used)');
    if (!chip) return 'nochip';
    chip.click();
    const slots = [...document.querySelectorAll('#bdSlots .slot:not(.locked)')];
    if (!slots.length) return 'noslot';
    let target = slots.find(s => s.querySelector('.who').textContent.trim() === '—') || slots[0];
    target.click();
  }
  return 'guard';
});
/* 스크램블: 사무실을 훑으며 아이템을 줍는다 */
async function sweepScramble(page, ms = 2600) {
  const seq = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
  const each = Math.max(120, Math.floor(ms / seq.length));
  for (const k of seq) {
    if (await screenOn(page) !== 'scramble') return;
    await press(page, k, each);
  }
}

/* ---- 메인 ---- */
const { chromium } = await loadPlaywright();
const exePath = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({
  headless: !HEADED,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files'],
  ...(existsSync(exePath) ? { executablePath: exePath } : {}),
});

const consoleErrors = [];
const pageErrors = [];
const ctx = await browser.newContext({ viewport: { width: 960, height: 900 } });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e && e.message || e)));

const t0 = Date.now();
console.log('\n===== 최종_진짜최종: D-7 — MVP 스모크 테스트 =====\n');

await page.goto(pathToFileURL(INDEX).href);
await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 });

/* ---------- 1. 데이터 구동 확인 ---------- */
console.log('[1] 데이터 구동 (data/*.json → 인라인 임베드)');
const disk = {
  events: JSON.parse(readFileSync(join(DATA, 'events.json'), 'utf8')),
  ghosts: JSON.parse(readFileSync(join(DATA, 'ghosts.json'), 'utf8')),
  items:  JSON.parse(readFileSync(join(DATA, 'items.json'), 'utf8')),
  flavor: JSON.parse(readFileSync(join(DATA, 'flavor.json'), 'utf8')),
};
const loaded = await page.evaluate(() => ({
  src: window.FFD7.C.src,
  events: window.FFD7.C.events.length,
  chains: window.FFD7.C.chains.length,
  ghosts: window.FFD7.C.ghosts.length,
  items: window.FFD7.C.items.length,
  flavor: ['loading', 'productionLog', 'messenger', 'dialogue', 'props', 'endingLines']
    .reduce((a, k) => a + window.FFD7.C.flavor[k].length, 0),
  firstEventId: window.FFD7.C.events[0].id,
  firstGhostId: window.FFD7.C.ghosts[0].id,
}));
ok('로딩 경로가 file:// 인라인 임베드', loaded.src === 'embed', loaded.src);
ok('현실 이벤트 30종 로드', loaded.events === 30 && loaded.events === disk.events.events.length, `${loaded.events}종`);
ok('체인 5종 로드', loaded.chains === 5, `${loaded.chains}종`);
ok('괴이 19종 로드', loaded.ghosts === 19 && loaded.ghosts === disk.ghosts.ghosts.length, `${loaded.ghosts}종`);
ok('아이템 38종 로드', loaded.items === 38 && loaded.items === disk.items.items.length, `${loaded.items}종`);
ok('플레이버 186줄 로드', loaded.flavor === 186, `${loaded.flavor}줄`);
ok('임베드 내용이 data/*.json 과 동일', loaded.firstEventId === disk.events.events[0].id && loaded.firstGhostId === disk.ghosts.ghosts[0].id);

/* ---------- 2. 조건 DSL 평가기 ---------- */
console.log('\n[2] 조건 DSL 평가기 (GDD 18.6 · eval 금지)');
const dsl = await page.evaluate(() => {
  const G = window.FFD7.G;
  G.newRun();                                   // 상태 생성(대사 화면에서 대기)
  const S = window.FFD7.S;
  S.day = 5; S.res.revisionDebt = 24; S.res.sourceIntegrity = 82; S.flags.midConfirmDone = 1;
  const t = window.FFD7.test;
  return {
    a: t('day == 5 && flag.midConfirmDone'),
    b: t('day == 5 && !flag.midConfirmDone'),
    c: t('sourceIntegrity >= 80 || revisionDebt < 10'),
    d: t('(day >= 2 && day <= 4) || revisionDebt >= 20'),
    e: t(''),
    f: t('flag.neverSetFlagXyz'),
    g: t('day + 1 == 6'),                        // 산술 미지원 → false + 경고
    h: t('codex.GH_01'),
    warnCount: window.FFD7.warnings.length,
  };
});
ok('AND · 플래그 참조', dsl.a === true);
ok('NOT 단항', dsl.b === false);
ok('OR · 비교 연산', dsl.c === true);
ok('괄호 그룹 우선순위', dsl.d === true);
ok('빈 조건은 항상 참', dsl.e === true);
ok('미설정 플래그는 거짓', dsl.f === false);
ok('산술 연산은 문법 위반 → false', dsl.g === false);
ok('codex.<ID> 참조 동작', typeof dsl.h === 'boolean');

/* ---------- 3. 정본 공식 ---------- */
console.log('\n[3] 판정 공식 (GDD 6.1 · 6.2 · 11.2)');
const fx = await page.evaluate(() => {
  const S = window.FFD7.S;
  S.difficulty = 'main_cut';
  S.day = 2; S.tracks.story = 24; S.res.clientTrust = 50; S.res.revisionDebt = 0;
  const confirm1 = window.FFD7.confirmRate(0);            // 55 + 6 + 0 - 0 = 61
  S.res.fear = 20; S.res.revisionDebt = 12; S.res.sourceIntegrity = 82;
  S.ch.player.focus = 60;
  const brave = window.FFD7.braveRate('__none__', 0);      // 65 + 2 + 10 - 5 - 4 = 68
  S.res.revisionDebt = 0; S.res.sourceIntegrity = 75; S.day = 5;
  for (const k of Object.keys(S.ch)) S.ch[k].focus = 60;
  const enc = window.FFD7.encounterRate(2);                // 30 + 14 + 10 = 54
  S.res.sourceIntegrity = 85;
  const enc2 = window.FFD7.encounterRate(2);               // 54 - 10 = 44
  return { confirm1, brave, enc, enc2 };
});
ok('컨펌 성공률 55+기획÷4+(신뢰-50)×0.4-부채÷2', Math.abs(fx.confirm1 - 61) < 0.001, String(fx.confirm1));
ok('담력 성공률 65+집중보정+무결성-공포÷4-부채÷3', Math.abs(fx.brave - 68) < 0.001, String(fx.brave));
ok('이면 조우율 기본30+인원×7+일차 누적', fx.enc === 54, String(fx.enc));
ok('이면 조우율 무결성 80+ 시 -10', fx.enc2 === 44, String(fx.enc2));

/* ---------- 4. 제동 규칙 (커피·간식 상한) ---------- */
console.log('\n[4] 제동 규칙 (IT-28·IT-29 런당 2회 · 밈 레이어 통산 +2)');
const brake2 = await page.evaluate(() => {
  const S = window.FFD7.S;
  S.memeCoffee = 0; S.memeSnack = 0; S.res.coffee = 0; S.res.snack = 0;
  // 엔진의 실제 연산자 경로를 그대로 사용한다
  const ev = window.FFD7.C.events.find(e => e.id === 'OF-30');
  const capped = [];
  const walk = o => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
      if (o.op === 'resource' && o.cap === 'memeLayer') capped.push(o);
      for (const k in o) walk(o[k]);
    }
  };
  walk(ev);
  return { of30Capped: capped.length, sample: capped.map(c => `${c.target}+${c.delta}`) };
});
const brake3 = await page.evaluate(() => {
  const S = window.FFD7.S;
  S.itemGot = {}; S.inv = []; S.res.coffee = 0; S.res.snack = 0; S.memeCoffee = 0; S.memeSnack = 0;
  S.day = 1;
  const it28 = window.FFD7.C.items.find(i => i.id === 'IT-28');
  const it32 = window.FFD7.C.items.find(i => i.id === 'IT-32');
  return { it28Limit: it28.runLimit, it28Effect: it28.effectText, it32Capped: it32.memeCapped };
});
ok('OF-30 커피·간식 지급에 cap:"memeLayer" 존재', brake2.of30Capped >= 2, brake2.sample.join(' / '));
ok('IT-28 런당 획득 상한 2회', brake3.it28Limit === 2, brake3.it28Effect);
ok('IT-32(밈 아이템) 간식은 통산 카운터 대상', brake3.it32Capped === true);

/* ---------- 5. 전 구간 플레이 (스토리 모드 · D-7 → D-0 → 엔딩 → 리테이크) ---------- */
console.log('\n[5] 전 구간 플레이 — D-7 → D-0 → 엔딩 → 리테이크');
await page.reload();
await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
await page.evaluate(() => { try { localStorage.removeItem('ffd7_meta_v2'); } catch (e) {} });

/* 도감 화면 확인 */
await page.click('#btnCodex');
await waitScreen(page, 'codex');
const codexLen = await page.$eval('#cxBody', n => n.textContent.length);
ok('도감 화면 렌더', codexLen > 500, `${codexLen}자`);
await page.click('#btnCxBack');
await waitScreen(page, 'title');

await page.check('#optStory');                     // 야간 추적 → 선택형 카드 (GDD 15.6 스토리 모드)
await page.click('[data-diff="main_cut"]');
await page.click('[data-major="기획"]');
/* GDD 19.5.3 시드 고정 자동 테스트 — 조우 판정을 강제해 이면 구간을 반드시 통과시킨다 */
await page.evaluate(() => { window.FFD7.QA.seed = 20260816; window.FFD7.QA.forceEncounter = true; });
await page.click('#btnNewRun');

const seen = new Set();
let overlaySeen = false, ghostCardSeen = false, braveSeen = false, memeEventSeen = false;
let confirmSeen = false, logCommentSeen = false, toastSeen = false, propsSeen = false;
let daysPlayed = new Set();
let steps = 0;

while (steps++ < 600) {
  const scr = await waitScreen(page,
    ['dialog', 'scramble', 'board', 'event', 'overtime', 'night', 'log', 'ending', 'retake'], 15000);
  seen.add(scr);
  if (scr === 'retake') break;

  if (scr === 'dialog') { await page.click('#dlgBtn'); await sleep(30); continue; }

  if (scr === 'scramble') {
    if (!toastSeen) toastSeen = (await page.$$('#toasts .toast')).length > 0;
    await sweepScramble(page, 2600);
    await clickIf(page, '#btnScEnd');
    continue;
  }

  if (scr === 'board') {
    daysPlayed.add(await page.evaluate(() => window.FFD7.S.day));
    if (!propsSeen) propsSeen = (await page.$eval('#bdProps', n => n.textContent.trim().length)) > 0;
    const r = await assignAll(page);
    if (r !== 'ready') console.log(`      (배치 보조 종료 코드: ${r})`);
    await clickIf(page, '#bdGo');
    continue;
  }

  if (scr === 'event') {
    if (!memeEventSeen) memeEventSeen = await page.$eval('#evBody', n => n.innerHTML.includes('밈 레이어'));
    if (await page.$('#evNext')) { await page.click('#evNext'); continue; }
    if (await page.$('#evAuto')) { await page.click('#evAuto'); continue; }
    const btns = await page.$$('#evBody button[data-ch]');
    let clicked = false;
    for (const b of btns) { if (!(await b.evaluate(n => n.disabled))) { await b.click(); clicked = true; break; } }
    if (!clicked && btns.length) await btns[0].click({ force: true });
    continue;
  }

  if (scr === 'overtime') {
    if (!confirmSeen) confirmSeen = await page.$eval('#otInfo', n => n.innerHTML.includes('컨펌'));
    const canOt = await page.$eval('#otYes', n => !n.disabled);
    if (canOt) {
      await page.click('#otYes');
      for (let i = 0; i < 40; i++) {                         // 21:57 전환 오버레이 관측
        if (await overlayOn(page)) { overlaySeen = true; break; }
        await sleep(60);
      }
      await waitOverlayClear(page);
    } else {
      await page.click('#otNo');
    }
    continue;
  }

  if (scr === 'night') {
    for (let i = 0; i < 60; i++) {
      if (await page.$('#ghNext')) break;
      const b = await page.$('#ntCard button:not([disabled])');
      if (b) {
        ghostCardSeen = true;
        braveSeen = braveSeen || await page.$eval('#ntCard', n => n.innerHTML.includes('담력 판정'));
        await b.click();
        break;
      }
      await press(page, ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'][i % 4], 200);
      if (await screenOn(page) !== 'night') break;
    }
    if (await page.$('#ghNext')) await page.click('#ghNext');
    continue;
  }

  if (scr === 'log') {
    if (!logCommentSeen) logCommentSeen = await page.$eval('#lgBody', n => n.innerHTML.includes('발동 —'));
    await clickIf(page, '#lgShare');
    await page.click('#lgBtn');
    continue;
  }

  if (scr === 'ending') { await page.click('#btnToRetake'); continue; }
}

const runInfo = await page.evaluate(() => ({
  day: window.FFD7.S.day, score: window.FFD7.S.score, endId: window.FFD7.S.endId,
  eventLog: window.FFD7.S.eventLog.map(r => r.id),
  ghostLog: window.FFD7.S.ghostLog,
  inv: window.FFD7.S.inv.map(i => i.id),
  memeCoffee: window.FFD7.S.memeCoffee, memeSnack: window.FFD7.S.memeSnack,
  itemGot: window.FFD7.S.itemGot,
  warnings: window.FFD7.warnings.slice(0, 8),
  warnCount: window.FFD7.warnings.length,
  retake: document.getElementById('rtGain').textContent.trim().slice(0, 160),
}));

ok('스크램블 화면 통과', seen.has('scramble'));
ok('업무 배치 화면 통과', seen.has('board'));
ok('현실 이벤트 화면 통과', seen.has('event'), `발생 ${runInfo.eventLog.length}건: ${runInfo.eventLog.join(',')}`);
ok('컨펌 결과 표시', confirmSeen);
ok('야근 화면 통과', seen.has('overtime'));
ok('21:57 전환 연출 관측', overlaySeen);
ok('이면 스튜디오 진입', seen.has('night'), `조우 ${runInfo.ghostLog.join(',') || '없음'}`);
ok('괴이 카드 선택 처리', ghostCardSeen);
ok('담력 판정 노출', braveSeen);
ok('제작일보 화면 통과', seen.has('log'));
ok('제작일보 코멘트(발동 조건 평가) 노출', logCommentSeen);
ok('사내 메신저 「알림판」 토스트 노출', toastSeen);
ok('배경 소품 문구 노출', propsSeen);
ok('밈 레이어 이벤트 등장', memeEventSeen);
ok('아이템 획득 동작', runInfo.inv.length > 0, `보유 ${runInfo.inv.join(',') || '없음'}`);
ok('D-7 → D-0 8일차 도달', runInfo.day >= 8, `최종 day=${runInfo.day} (${['','D-7','D-6','D-5','D-4','D-3','D-2','D-1','D-0'][runInfo.day] || '?'})`);
ok('D-0 납품 점수 산출', runInfo.score !== null && runInfo.score !== undefined, `점수 ${runInfo.score}`);
ok('엔딩 도달', !!runInfo.endId, `${runInfo.endId}`);
ok('엔딩 화면 통과', seen.has('ending'));
ok('리테이크 정산 화면 도달', seen.has('retake'), runInfo.retake.replace(/\s+/g, ' ').slice(0, 110));
ok('밈 레이어 커피 통산 상한 2 준수', runInfo.memeCoffee <= 2, `커피 카운터 ${runInfo.memeCoffee}`);
ok('밈 레이어 간식 통산 상한 2 준수', runInfo.memeSnack <= 2, `간식 카운터 ${runInfo.memeSnack}`);
ok('IT-28 런당 2회 상한 준수', (runInfo.itemGot['IT-28'] || 0) <= 2, `획득 ${runInfo.itemGot['IT-28'] || 0}회`);
ok('IT-29 런당 2회 상한 준수', (runInfo.itemGot['IT-29'] || 0) <= 2, `획득 ${runInfo.itemGot['IT-29'] || 0}회`);
ok('DSL 경고 0건', runInfo.warnCount === 0, runInfo.warnings.join(' | '));

/* ---------- 5b. D-0 게이트 통과 분기 (엔딩 우선순위 GDD 12.2) ---------- */
console.log('\n[5b] D-0 게이트 통과 분기 · 납품 점수 공식');
await page.reload();
await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
const d0 = await page.evaluate(() => {
  const out = {};
  const setup = (patch) => {
    window.FFD7.G.newRun();
    const S = window.FFD7.S;
    S.day = 8; S.ended = false; S.pendingEnding = null;
    Object.assign(S.tracks, { story: 96, footage: 96, post: 96, master: 96 });
    Object.assign(S.res, { sourceIntegrity: 92, clientTrust: 80, revisionDebt: 0, fear: 0, audienceResonance: 0, budget: 3000000 });
    S.statuses = {}; S.flags = {}; S.otRunTotal = 3; S.otConsecDays = 0;
    Object.assign(S, patch || {});
    window.FFD7.refreshDerivedFlags();
    window.FFD7.d0Screening();
    return { id: S.endId, score: S.score, fails: (S.gateFails || []).length };
  };
  out.best = setup({});                                            // 96/96/96/96·무결성92·신뢰80 → 대표작
  out.trueEnd = setup({ flags: { traceableMaster: true } });        // 진엔딩 플래그
  out.gateFail = (() => {
    window.FFD7.G.newRun();
    const S = window.FFD7.S;
    S.day = 8; S.ended = false;
    Object.assign(S.tracks, { story: 40, footage: 10, post: 10, master: 0 });
    window.FFD7.refreshDerivedFlags(); window.FFD7.d0Screening();
    return { id: S.endId, fails: (S.gateFails || []).length };
  })();
  return out;
});
const expectScore = Math.round((96 * 0.20 + 96 * 0.25 + 96 * 0.25 + 96 * 0.15 + 92 * 0.10 + 80 * 0.05 - 0 * 0.35) * 100) / 100;
ok('납품 점수 = 기획.20+촬영.25+편집.25+마스터.15+무결성.10+신뢰.05-부채.35',
   Math.abs(d0.best.score - expectScore) < 0.011, `${d0.best.score} (기대 ${expectScore})`);
ok('게이트 통과 · 95+ · 무결성 90+ · 야근 2회 이하 아님 → ED-02', d0.best.id === 'ED-02', d0.best.id);
ok('TRACEABLE_MASTER + 85점 이상 → 진엔딩 ED-11', d0.trueEnd.id === 'ED-11', d0.trueEnd.id);
ok('게이트 미달 → ED-04 납품 보류', d0.gateFail.id === 'ED-04', `${d0.gateFail.id} · 미달 ${d0.gateFail.fails}건`);

/* ---------- 6. 야간 캔버스 경로 (스토리 모드 OFF) ---------- */
console.log('\n[6] 야간 캔버스 경로 (스토리 모드 OFF · 내 책상 [종료] 복귀)');
await page.reload();
await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
await page.evaluate(() => { window.FFD7.QA.seed = 4242; window.FFD7.QA.forceEncounter = true; });
await page.click('#btnNewRun');
let canvasNight = false, nightExit = false;
for (let s = 0; s < 120 && !nightExit; s++) {
  const scr = await waitScreen(page, ['dialog', 'scramble', 'board', 'event', 'overtime', 'night', 'log', 'ending'], 15000);
  if (scr === 'dialog') { await page.click('#dlgBtn'); continue; }
  if (scr === 'scramble') { await sweepScramble(page, 1200); await clickIf(page, '#btnScEnd'); continue; }
  if (scr === 'board') { await assignAll(page); await clickIf(page, '#bdGo'); continue; }
  if (scr === 'event') {
    if (await page.$('#evNext')) { await page.click('#evNext'); continue; }
    if (await page.$('#evAuto')) { await page.click('#evAuto'); continue; }
    const btns = await page.$$('#evBody button[data-ch]');
    for (const b of btns) { if (!(await b.evaluate(n => n.disabled))) { await b.click(); break; } }
    continue;
  }
  if (scr === 'overtime') { if (await page.$eval('#otYes', n => !n.disabled)) { await page.click('#otYes'); await waitOverlayClear(page); } else await page.click('#otNo'); continue; }
  if (scr === 'night') {
    canvasNight = await page.$eval('#ntCv', n => n.style.display !== 'none');
    /* 괴이와 마주치면 카드, 아니면 내 책상(9, 1.2)까지 복귀 */
    await press(page, 'ArrowUp', 1200);
    for (let i = 0; i < 14; i++) {
      if (await screenOn(page) !== 'night') break;
      if (await page.$('#ntCard button:not([disabled])')) {
        await page.click('#ntCard button:not([disabled])');
        await page.waitForSelector('#ghNext', { timeout: 5000 });
        await page.click('#ghNext');
        break;
      }
      await press(page, 'ArrowLeft', 120);
    }
    nightExit = true;
    continue;
  }
  if (scr === 'log') { nightExit = true; continue; }
  if (scr === 'ending') { nightExit = true; continue; }
}
ok('야간 캔버스 모드 진입(스토리 모드 OFF)', canvasNight);
ok('야간 구간 정상 종료', nightExit);

/* ---------- 7. 콘솔 에러 ---------- */
console.log('\n[7] 브라우저 콘솔');
ok('미처리 JS 예외 0건', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
ok('console.error 0건', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log('\n===== 결과 =====');
console.log(`  통과 ${checks.length - failed} / ${checks.length}  ·  ${secs}s`);
if (failed) {
  console.log('\n  실패 항목:');
  for (const c of checks) if (!c.pass) console.log(`   ✗ ${c.name} ${c.detail}`);
}
process.exit(failed ? 1 : 0);
