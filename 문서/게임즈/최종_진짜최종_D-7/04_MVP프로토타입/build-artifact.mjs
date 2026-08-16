/* index.html → 아티팩트 배포본(artifact.html) 변환
   아티팩트는 <!doctype>…<head>…</head><body>를 자체 생성하므로
   문서 스켈레톤을 벗기고 본문만 남긴다. 데이터는 인라인 전용으로 고정. */
import { readFileSync, writeFileSync } from 'node:fs';

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

const out = `<title>${title}</title>\n<style>\n${style}\n</style>\n${body}\n`;
writeFileSync(new URL('./artifact.html', import.meta.url), out);

const kb = n => (n / 1024).toFixed(0) + 'KB';
console.log(`제목      : ${title}`);
console.log(`입력      : ${kb(src.length)}  →  출력 ${kb(out.length)}`);
console.log(`검증      : doctype/html/head/body 태그 ${/<(!doctype|html|head|body)[\s>]/i.test(out) ? '잔존 ✗' : '제거됨 ✓'}`);
console.log(`            fetch('data/ 잔존 ${out.includes("fetch('data/") ? '✗' : '없음 ✓'}`);
console.log(`            인라인 데이터 ${out.includes('id="ffd7-data"') ? '있음 ✓' : '없음 ✗'}`);
console.log(`            외부 호스트 참조 ${/(https?:)?\/\/(?!\/)[a-z0-9-]+\./i.test(out.replace(/https:\/\/claude\.ai/g,'')) ? '발견 ✗' : '없음 ✓'}`);
