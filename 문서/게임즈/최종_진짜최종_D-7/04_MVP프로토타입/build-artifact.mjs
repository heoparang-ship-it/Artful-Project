/* index.html → 아티팩트 배포본(artifact.html) 변환
   아티팩트는 <!doctype>…<head>…</head><body>를 자체 생성하므로
   문서 스켈레톤을 벗기고 본문만 남긴다. 데이터는 인라인 전용으로 고정. */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const src = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const pick = (re, name) => {
  const m = src.match(re);
  if (!m) throw new Error(`추출 실패: ${name}`);
  return m[1];
};

const title = pick(/<title>([\s\S]*?)<\/title>/, '<title>').replace(/\s*\(MVP\)\s*$/, '').trim();
const style = pick(/<style>([\s\S]*?)<\/style>/, '<style>');
let body   = pick(/<body>([\s\S]*?)<\/body>/, '<body>');

// 아티팩트는 동일 출처에 data/*.json이 없다. fetch 분기를 제거해
// 실패 요청 5건과 CSP 콘솔 노이즈를 없애고 인라인 임베드만 쓴다.
const FETCH_BLOCK = /  let raw = null, src = 'embed';\n  if\(location\.protocol[\s\S]*?\}catch\(e\)\{ raw = null; \}\n  \}\n/;
if (!FETCH_BLOCK.test(body)) throw new Error('fetch 분기 패턴 불일치 — index.html 변경됨, 스크립트 갱신 필요');
body = body.replace(FETCH_BLOCK, "  let raw = null, src = 'embed';\n");

/* 05_아트/plates/ 의 이미지를 data URI로 인라인한다.
   아티팩트는 외부 호스트를 못 부르므로 파일을 통째로 실어야 한다.
   파일이 없으면 슬롯이 비고, 게임은 그 항목만 도형으로 그린다. */
const PLATE_DIR = new URL('../05_아트/plates/', import.meta.url);
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const plates = {};
let plateBytes = 0;
if (existsSync(PLATE_DIR)) {
  for (const f of readdirSync(PLATE_DIR).sort()) {
    const ext = f.slice(f.lastIndexOf('.')).toLowerCase();
    if (!MIME[ext]) continue;
    const buf = readFileSync(new URL(f, PLATE_DIR));
    plates[f.slice(0, -ext.length)] = `data:${MIME[ext]};base64,${buf.toString('base64')}`;
    plateBytes += buf.length;
  }
}
const plateTag = Object.keys(plates).length
  ? `<script>window.FFD7_PLATES=${JSON.stringify(plates)};</script>\n` : '';

const out = `<title>${title}</title>\n<style>\n${style}\n</style>\n${plateTag}${body}\n`;
writeFileSync(new URL('./artifact.html', import.meta.url), out);

const kb = n => (n / 1024).toFixed(0) + 'KB';
console.log(`제목      : ${title}`);
console.log(`입력      : ${kb(src.length)}  →  출력 ${kb(out.length)}`);
console.log(`검증      : doctype/html/head/body 태그 ${/<(!doctype|html|head|body)[\s>]/i.test(out) ? '잔존 ✗' : '제거됨 ✓'}`);
console.log(`            fetch('data/ 잔존 ${out.includes("fetch('data/") ? '✗' : '없음 ✓'}`);
console.log(`            인라인 데이터 ${out.includes('id="ffd7-data"') ? '있음 ✓' : '없음 ✗'}`);
const pk = Object.keys(plates);
console.log(`이미지 플레이트: ${pk.length ? pk.join(', ') + `  (${kb(plateBytes)})` : '없음 — 전 항목 도형 렌더링'}`);
if ((out.length) > 15.5 * 1024 * 1024) console.log('!! 16MB 한도 초과 — 플레이트를 줄이거나 압축할 것');
console.log(`            외부 호스트 참조 ${/(https?:)?\/\/(?!\/)[a-z0-9-]+\./i.test(out.replace(/https:\/\/claude\.ai/g,'')) ? '발견 ✗' : '없음 ✓'}`);
