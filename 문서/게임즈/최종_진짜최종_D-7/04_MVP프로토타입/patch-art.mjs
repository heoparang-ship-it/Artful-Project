/* index.base.html(그리기 층 이전 원본) + art.js → index.html 생성.
   항상 원본에서 다시 빌드하므로 몇 번을 돌려도 결과가 같고,
   art.js를 고친 뒤 재실행하면 그대로 반영된다. 실행: node patch-art.mjs */
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = new URL('./index.base.html', import.meta.url);
const HTML = new URL('./index.html', import.meta.url);
let s = readFileSync(BASE, 'utf8');
const art = readFileSync(new URL('./art.js', import.meta.url), 'utf8');
const steps = [];

function must(cond, msg) { if (!cond) { console.error('✗ ' + msg); process.exit(1); } }
function sub(name, from, to) {
  const before = s;
  s = s.replace(from, to);
  must(s !== before, `${name}: 패턴 불일치 — index.html이 바뀌었다. patch-art.mjs 갱신 필요`);
  steps.push(name);
}

/* 1. ART 모듈 주입 (마커 사이 교체 → 멱등) */
const block = `/* ART:BEGIN */\n${art}\n/* ART:END */`;
sub('ART 모듈 주입', 'const ROOM_BY_NAME = Object.fromEntries(ROOMS.map(r=>[r.n,r]));',
  `const ROOM_BY_NAME = Object.fromEntries(ROOMS.map(r=>[r.n,r]));\n${block}`);

/* 2. 스크램블 렌더 — 회색 점·겹친 라벨·흰 사각형을 걷어낸다 */
const OLD_DRAW = `    cx2.clearRect(0,0,cv.width,cv.height);
    ROOMS.forEach(r => {
      cx2.strokeStyle='#2c2f37'; cx2.strokeRect(r.x*CW+2, r.y*CH+2, r.w*CW-4, r.h*CH-4);
      cx2.fillStyle='#565a64'; cx2.font='11px sans-serif'; cx2.fillText(r.n, r.x*CW+8, r.y*CH+16);
    });
    cx2.fillStyle='#3a3f4a'; cx2.fillRect(0, 3*CH+2, cv.width, CH-4);
    SC.items.forEach(o => {
      cx2.fillStyle = o.key ? '#e8b34b' : (o.it.memeLayer ? '#6ba3c4' : '#8f95a3');
      cx2.beginPath(); cx2.arc(o.x*CW, o.y*CH, 7, 0, 7); cx2.fill();
      cx2.fillStyle='#c9c7bf'; cx2.font='10px sans-serif';
      cx2.fillText(o.it.name.slice(0,10), o.x*CW-20, o.y*CH+18);
    });
    cx2.fillStyle='#e8e6df'; cx2.fillRect(SC.px*CW-8, SC.py*CH-11, 16, 22);
    cx2.fillStyle='#14161a'; cx2.fillRect(SC.px*CW-5, SC.py*CH-8, 10, 5);`;

const NEW_DRAW = `    cx2.clearRect(0,0,cv.width,cv.height);
    cx2.fillStyle = ART.C.floorAlt; cx2.fillRect(0,0,cv.width,cv.height);
    ROOMS.forEach((r,i) => {
      cx2.fillStyle = (i%2) ? ART.C.floor : ART.C.floorAlt;
      cx2.fillRect(r.x*CW, r.y*CH, r.w*CW, r.h*CH);
      ART.furniture(cx2, r, CW, CH, false);
      cx2.strokeStyle = ART.C.wall; cx2.lineWidth = 1.5;
      cx2.strokeRect(r.x*CW+1, r.y*CH+1, r.w*CW-2, r.h*CH-2);
      cx2.fillStyle = ART.C.label; cx2.font = '600 11px system-ui,sans-serif';
      cx2.fillText(r.n, r.x*CW+8, r.y*CH+16);
    });
    cx2.fillStyle = '#262a32'; cx2.fillRect(0, 3*CH, cv.width, CH);
    cx2.fillStyle = ART.C.wall; cx2.fillRect(0, 3*CH, cv.width, 1); cx2.fillRect(0, 4*CH-1, cv.width, 1);
    let near = null, nd = 1e9;
    SC.items.forEach(o => { const d = Math.hypot(o.x-SC.px, o.y-SC.py); if(d < nd){ nd = d; near = o; } });
    const beat = Math.sin(now/380)*0.5 + 0.5;
    SC.items.forEach(o => {
      const col = o.key ? ART.C.accent : (o.it.memeLayer ? ART.C.meme : ART.C.plain);
      ART.itemGlyph(cx2, o.x*CW, o.y*CH, ART.glyphKind(o.it.name), col, o.key ? beat : 0);
    });
    if(near && nd < 2.8) ART.label(cx2, near.it.name, near.x*CW, near.y*CH - 14);
    ART.crew(cx2, 'you', SC.px*CW, SC.py*CH + 11, CH/13, '#e8e6df', Math.ceil(invUsed()/2));
    const tot = ($('optSlow').checked ? 90 : 60), frac = clamp(SC.t/tot, 0, 1);
    cx2.fillStyle = '#191c22'; cx2.fillRect(0, 0, cv.width, 4);
    cx2.fillStyle = SC.t < 10 ? ART.C.rec : ART.C.accent; cx2.fillRect(0, 0, cv.width*frac, 4);`;

sub('스크램블 렌더 교체', OLD_DRAW, NEW_DRAW);

/* 3. 배치 화면 인물 카드 — 텍스트 알약에 실루엣을 붙인다 */
const OLD_CHIP = '    return `<span class="chip ${selChar===k?\'sel\':\'\'} ${S.assign[k]!==undefined?\'used\':\'\'}" data-ch="${k}">${esc(c.name)} <span class="st">집중 ${Math.round(st.focus)} · 체력 ${Math.round(st.hp)}${st.bond?` · 유대 ${st.bond}`:\'\'}</span></span>`;';
const NEW_CHIP = '    return `<span class="chip crew ${selChar===k?\'sel\':\'\'} ${S.assign[k]!==undefined?\'used\':\'\'}" data-ch="${k}"><canvas class="cwc" width="58" height="56" data-crew="${k}"></canvas><span class="cwt"><b>${esc(c.name)}</b><span class="st">집중 ${Math.round(st.focus)} · 체력 ${Math.round(st.hp)}${st.bond?` · 유대 ${st.bond}`:\'\'}</span><span class="cwg"><i style="width:${clamp(st.focus/c.focusMax*100,0,100)}%"></i></span><span class="cwg hp"><i style="width:${clamp(st.hp/c.hpMax*100,0,100)}%"></i></span></span></span>`;';
sub('인물 카드 교체', OLD_CHIP, NEW_CHIP);

/* 실루엣 그리기 호출 + 슬롯에 배치된 인물 표시 */
const CREWMAP = `const CREW_ART = {heoparang:'heo', leeyounglim:'lyl', leehyemi:'lhm', sonmirim:'smr', player:'you'};
function paintCrew(){
  document.querySelectorAll('canvas.cwc').forEach(cv => {
    const k = CREW_ART[cv.dataset.crew]; if(!k) return;
    ART.crewChip(cv, k, cv.closest('.chip')?.classList.contains('used') ? '#5b6068' : null);
  });
}`;
sub('paintCrew 정의', 'function renderBoard(){', `${CREWMAP}\nfunction renderBoard(){`);

const OLD_TAIL = "  if(hasMod('PK-15') && S.deckPreviewList) $('bdNote').innerHTML += `<div class=\"sm dim\">전체 회고 — 오늘 이벤트 후보: ${S.deckPreviewList}</div>`;\n}";
const NEW_TAIL = "  if(hasMod('PK-15') && S.deckPreviewList) $('bdNote').innerHTML += `<div class=\"sm dim\">전체 회고 — 오늘 이벤트 후보: ${S.deckPreviewList}</div>`;\n  paintCrew();\n  try{ paintStage(); }catch(e){}\n}";
sub('paintCrew 호출', OLD_TAIL, NEW_TAIL);

/* 슬롯의 배치 인원을 이름 텍스트 → 실루엣으로 */
const OLD_WHO = 'const s = SLOTS[sk], who = (usedIn[sk]||[]).map(k => CHARS[k].name).join(\', \');';
const NEW_WHO = 'const s = SLOTS[sk], who = (usedIn[sk]||[]).map(k => `<span class="mini"><canvas class="cwc" width="44" height="42" data-crew="${k}"></canvas>${esc(CHARS[k].name)}</span>`).join(\'\');';
sub('슬롯 배치 표시', OLD_WHO, NEW_WHO);

/* 5. 상시 사무실 씬 — HUD 바로 아래에 붙여 플레이 내내 보이게 한다 */
sub('무대 캔버스 삽입', '<div id="hud"></div>',
  '<div id="hud"></div>\n<canvas id="stageCv" width="1120" height="430"></canvas>');

const STAGE_FN = `
/* 화면별 시각 — 하루의 진행을 벽시계로 읽게 한다 */
const STAGE_CLOCK = {board:[9,0], event:[14,20], overtime:[19,0], night:[21,57], log:[23,10], ending:[18,0]};
const STAGE_ON = ['board','event','overtime','night','log'];
let stageScreen = 'board';
function paintStage(){
  const cv = $('stageCv'); if(!cv || !S) return;
  const [hh,mm] = STAGE_CLOCK[stageScreen] || [9,0];
  const isNight = ['overtime','night','log'].includes(stageScreen) || document.body.classList.contains('night');
  const usedIn = {};
  Object.entries(S.assign||{}).forEach(([c,sl]) => { usedIn[c] = sl; });
  const crew = CHKEYS.map(k => {
    const c = CHARS[k], stt = S.ch[k], sl = usedIn[k];
    return {
      k: CREW_ART[k], name: c.name,
      cond: Math.min(stt.focus/c.focusMax, stt.hp/c.hpMax),
      away: stageScreen === 'board' && sl === undefined,
      label: sl !== undefined && SLOTS[sl] ? SLOTS[sl].name : '',
    };
  });
  ART.stage(cv.getContext('2d'), cv.width, cv.height, {
    day: S.day, hour: hh, min: mm, night: isNight,
    crew, coffee: S.res.coffee, debt: S.res.revisionDebt, rec: isNight,
  });
}`;
sub('paintStage 정의', 'function renderHud(){', `${STAGE_FN}\nfunction renderHud(){`);

/* 상태가 바뀔 때마다 씬도 다시 그린다 */
sub('paintStage 갱신 훅', "function renderHud(){\n  if(!S){ $('hud').innerHTML=''; return; }",
  "function renderHud(){\n  if(!S){ $('hud').innerHTML=''; return; }\n  try{ paintStage(); }catch(e){}");

/* 화면 전환 시 표시 여부 + 시각 갱신 */
sub('무대 표시 전환',
  "  $('hud').classList.toggle('on', !['title','dialog','codex'].includes(id));",
  "  $('hud').classList.toggle('on', !['title','dialog','codex'].includes(id));\n" +
  "  if(STAGE_ON.includes(id)) stageScreen = id;\n" +
  "  $('stageCv').classList.toggle('on', STAGE_ON.includes(id));\n" +
  "  try{ if(STAGE_ON.includes(id)) paintStage(); }catch(e){}");

/* 4. CSS */
/* 전역 canvas{width:100%}(위 34행)가 카드용 캔버스까지 늘린다.
   인물 캔버스는 픽셀 크기를 고정하고 배경·테두리도 지운다. */
const CSS = `
/* --- 그리기 층 --- */
canvas.cwc{width:auto!important;background:none;border:0;border-radius:0;flex:0 0 auto;display:block}
.chip.crew{display:inline-flex;align-items:center;gap:9px;padding:6px 12px 6px 7px;text-align:left;vertical-align:top;white-space:nowrap}
.chip.crew .cwt{display:flex;flex-direction:column;gap:3px;line-height:1.25}
.chip.crew .cwt b{font-size:.98em;font-weight:600}
.chip.crew .st{white-space:nowrap}
.cwg{display:block;width:84px;height:3px;background:#2c2f37;border-radius:2px;overflow:hidden}
.cwg i{display:block;height:100%;background:var(--accent)}
.cwg.hp i{background:#6b8f7a}
.slot .who{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.slot .who .mini{display:inline-flex;flex-direction:column;align-items:center;gap:2px;font-size:.78em;color:var(--dim)}
#scCv{border-radius:4px}
#stageCv{display:none;width:100%;max-width:1120px;margin:0 auto;background:none;border:0;border-bottom:1px solid var(--line);border-radius:0}
#stageCv.on{display:block}
`;
sub('CSS 추가', '</style>', `${CSS}</style>`);

writeFileSync(HTML, s);
console.log(steps.map(x => '  ✓ ' + x).join('\n'));
console.log(`\nindex.html ${(s.length/1024).toFixed(0)}KB`);
