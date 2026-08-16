/* ============================================================
   그리기 층 — 납품 아트 없이 캔버스로 그린다
   ------------------------------------------------------------
   아트 발주분 376점은 아직 작화 전이다. 그때까지 전 요소를 절차적으로
   그리되, 인물은 캐논 ① 실루엣 채널을 그대로 구현한다 — 소품과 형태만으로
   5인이 구분되어야 한다(ART-RFP 2.4-2 실루엣 테스트 · 부속서 D AC-CHR-03).
   즉 이 층은 임시 대체물이 아니라 실루엣 설계의 실행 검증이다.

   팔레트는 작화 지시서 §3.5 확정값을 쓴다.
   빌드: node patch-art.mjs  (index.html의 ART:BEGIN~END 사이를 교체)
   ============================================================ */
const ART = (() => {
  const C = {
    ink:      '#241f1c',   // 선 색 — 순흑 금지(§3.5)
    rec:      '#e2493b',   // 발주 확정
    accent:   '#e8b34b',   // 발주 확정
    floor:    '#20232a',
    floorAlt: '#1c1f25',
    wall:     '#2c2f37',
    furn:     '#2a2e36',
    furnTop:  '#343947',
    screen:   '#3d4655',
    label:    '#7d838f',
    meme:     '#6ba3c4',
    plain:    '#8f95a3',
  };

  /* 방 이름 → 배치할 집기. 탑다운이므로 사각형 조합으로 충분히 읽힌다 */
  const FURNITURE = {
    '기획 회의실': [
      ['table', .8, .9, 2.4, 1.2], ['chair', .5, 1.2, .3, .3], ['chair', .5, 1.8, .3, .3],
      ['chair', 3.4, 1.2, .3, .3], ['chair', 3.4, 1.8, .3, .3], ['board', .6, .25, 2.8, .22],
    ],
    '공용 데스크': [
      ['desk', .35, .75, 1.5, .75], ['screen', .55, .8, .5, .3],
      ['desk', 2.15, .75, 1.5, .75], ['screen', 2.35, .8, .5, .3],
      ['desk', .35, 1.9, 1.5, .75], ['screen', .55, 1.95, .5, .3],
      ['desk', 2.15, 1.9, 1.5, .75], ['screen', 2.35, 1.95, .5, .3],
      ['divider', 1.95, .7, .06, 2],
    ],
    '편집실': [
      ['desk', .4, 1, 1.4, .9], ['screen', .55, 1.05, .95, .42],
      ['desk', 2.2, 1, 1.4, .9], ['screen', 2.35, 1.05, .95, .42],
      ['shelf', .4, .25, 3.2, .3],
    ],
    '미니 스튜디오': [
      ['roll', .4, .3, .35, 2.4], ['stand', 2.6, .8, .28], ['stand', 3.3, 1.9, .28],
      ['tripod', 1.7, 1.5, .3], ['table', 2.2, 2.2, 1.2, .5],
    ],
    '장비실': [
      ['shelf', .3, .3, 3.4, .4], ['shelf', .3, 1.1, 3.4, .4], ['shelf', .3, 1.9, 3.4, .4],
      ['case', .5, 2.5, .7, .4], ['case', 1.4, 2.5, .7, .4], ['case', 2.3, 2.5, .7, .4],
    ],
    '탕비실·아카이브': [
      ['fridge', .35, .3, .8, 1], ['sink', 1.4, .3, 1.6, .5],
      ['shelf', .3, 1.7, 3.4, .35], ['shelf', .3, 2.35, 3.4, .35],
      ['table', 2.3, .95, 1.2, .5],
    ],
  };

  function furniture(cx, room, CW, CH, night) {
    const list = FURNITURE[room.n] || [];
    const ox = room.x * CW, oy = room.y * CH;
    for (const [kind, x, y, w, h] of list) {
      const X = ox + x * CW, Y = oy + y * CH, W = w * CW, H = (h || 0) * CH;
      cx.fillStyle = C.furn;
      switch (kind) {
        case 'table': case 'desk': case 'case':
          cx.fillRect(X, Y, W, H);
          cx.fillStyle = C.furnTop; cx.fillRect(X, Y, W, Math.max(2, H * .22));
          break;
        case 'shelf': case 'divider': case 'board': case 'sink':
          cx.fillRect(X, Y, W, H); break;
        case 'fridge':
          cx.fillRect(X, Y, W, H);
          cx.fillStyle = C.furnTop; cx.fillRect(X + W - 4, Y + H * .3, 3, H * .3);
          break;
        case 'roll':
          cx.fillRect(X, Y, W, H);
          cx.fillStyle = C.furnTop; cx.fillRect(X, Y, W, 3);
          break;
        case 'screen':
          cx.fillStyle = night ? C.screen : '#39414f';
          cx.fillRect(X, Y, W, H);
          break;
        case 'stand': {
          const r = w * CW;
          cx.strokeStyle = C.furn; cx.lineWidth = 2;
          cx.beginPath(); cx.arc(X, Y, r, 0, 7); cx.stroke();
          cx.beginPath(); cx.moveTo(X - r, Y + r); cx.lineTo(X + r, Y + r); cx.stroke();
          break;
        }
        case 'tripod': {
          const r = w * CW;
          cx.strokeStyle = C.furn; cx.lineWidth = 2; cx.beginPath();
          for (const a of [-2.2, -0.9, 0.5]) { cx.moveTo(X, Y); cx.lineTo(X + Math.cos(a) * r, Y + Math.sin(a) * r * -1 + r); }
          cx.stroke();
          break;
        }
        case 'chair':
          cx.beginPath(); cx.arc(X, Y, w * CW, 0, 7); cx.fill(); break;
      }
    }
  }

  /* 아이템 이름 → 아이콘 종류. 회색 점 대신 형태로 구분한다 */
  function glyphKind(name) {
    const n = String(name);
    if (/케이블|전원|멀티탭|연장/.test(n)) return 'cable';
    if (/SSD|카드|리더|메모리|드라이브|백업/.test(n)) return 'drive';
    if (/카메라|렌즈|짐벌|촬영기/.test(n)) return 'camera';
    if (/조명|LED|라이트|반사판/.test(n)) return 'light';
    if (/마이크|녹음|오디오/.test(n)) return 'mic';
    if (/배터리|충전/.test(n)) return 'battery';
    if (/커피|간식|음료|텀블러|도시락/.test(n)) return 'cup';
    if (/헤드폰|모니터링/.test(n)) return 'phones';
    if (/삼각대|트라이포드/.test(n)) return 'tripod';
    if (/슬레이트/.test(n)) return 'slate';
    if (/문서|계약|규격서|리포트|콜시트|라이선스|동의|견적|기획안|리스트|메모/.test(n)) return 'doc';
    return 'box';
  }

  function itemGlyph(cx, x, y, kind, color, pulse) {
    const s = 7;
    cx.save(); cx.translate(x, y);
    if (pulse) { // 필수품은 옅은 후광
      cx.fillStyle = color + '22';
      cx.beginPath(); cx.arc(0, 0, s + 5 + pulse * 2, 0, 7); cx.fill();
    }
    cx.fillStyle = color; cx.strokeStyle = color; cx.lineWidth = 1.7;
    cx.lineCap = 'round'; cx.lineJoin = 'round';
    switch (kind) {
      case 'cable':
        cx.beginPath(); cx.arc(0, 0, s - 1, 0, 7); cx.stroke();
        cx.beginPath(); cx.arc(0, 0, s - 4.5, 0, 7); cx.stroke(); break;
      case 'drive':
        cx.fillRect(-s + 1, -s + 2, s * 2 - 2, s * 2 - 4);
        cx.fillStyle = C.floor; cx.fillRect(-s + 3, -s + 4, s * 2 - 6, 2.5); break;
      case 'camera':
        cx.fillRect(-s, -s + 3, s * 2, s * 2 - 5);
        cx.fillStyle = C.floor; cx.beginPath(); cx.arc(0, 1, 3, 0, 7); cx.fill();
        cx.fillStyle = color; cx.fillRect(-2, -s + 1, 5, 2); break;
      case 'light':
        cx.beginPath(); cx.arc(0, 0, s - 3, 0, 7); cx.fill();
        cx.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; cx.moveTo(Math.cos(a) * (s - 1.5), Math.sin(a) * (s - 1.5)); cx.lineTo(Math.cos(a) * s * 1.25, Math.sin(a) * s * 1.25); }
        cx.stroke(); break;
      case 'mic':
        cx.beginPath(); cx.roundRect(-2.5, -s, 5, s + 2, 2.5); cx.fill();
        cx.beginPath(); cx.moveTo(0, 2); cx.lineTo(0, s); cx.moveTo(-3.5, s); cx.lineTo(3.5, s); cx.stroke(); break;
      case 'battery':
        cx.fillRect(-s + 1, -4, s * 2 - 3, 8); cx.fillRect(s - 2, -2, 2.5, 4); break;
      case 'cup':
        cx.beginPath(); cx.moveTo(-4.5, -s + 2); cx.lineTo(4.5, -s + 2); cx.lineTo(3, s - 1); cx.lineTo(-3, s - 1); cx.closePath(); cx.fill();
        cx.beginPath(); cx.arc(5.5, -1, 3, -1.2, 1.2); cx.stroke(); break;
      case 'phones':
        cx.beginPath(); cx.arc(0, 1, s - 1, Math.PI, 0); cx.stroke();
        cx.fillRect(-s, 0, 3, 5); cx.fillRect(s - 3, 0, 3, 5); break;
      case 'tripod':
        cx.beginPath(); cx.moveTo(0, -s); cx.lineTo(0, 1);
        cx.moveTo(0, 1); cx.lineTo(-5, s); cx.moveTo(0, 1); cx.lineTo(5, s); cx.moveTo(0, 1); cx.lineTo(0, s);
        cx.stroke(); break;
      case 'slate':
        cx.fillRect(-s, -2, s * 2, s - 1);
        cx.beginPath(); cx.moveTo(-s, -3); cx.lineTo(s, -6); cx.lineTo(s, -2); cx.lineTo(-s, -2); cx.closePath(); cx.fill(); break;
      case 'doc':
        cx.fillRect(-s + 2, -s, s * 2 - 4, s * 2);
        cx.strokeStyle = C.floor; cx.lineWidth = 1.2; cx.beginPath();
        for (let i = -3; i <= 3; i += 3) { cx.moveTo(-s + 4, i); cx.lineTo(s - 4, i); }
        cx.stroke(); break;
      default:
        cx.beginPath(); cx.roundRect(-s + 1, -s + 1, s * 2 - 2, s * 2 - 2, 2); cx.fill();
    }
    cx.restore();
  }

  /* ---- 인물 실루엣 (SD 2.5등신) ----
     캐논 ① 실루엣 채널을 형태로 옮긴다. 순흑으로 칠해도 서로 구분되어야 한다. */
  const CREW = {
    heo: { // 허파랑 — 한 손엔 항상 화면, 다른 손은 넓은 제스처
      tone: '#a8b088', h: 1.0,
      draw(cx, u, col) {
        cx.fillStyle = col;
        cx.fillRect(-1.7 * u, -1.4 * u, 3.4 * u, 2.1 * u);              // 몸
        cx.beginPath(); cx.arc(0, -2.1 * u, .95 * u, 0, 7); cx.fill();   // 머리
        cx.fillRect(-2.9 * u, -1.9 * u, 1.3 * u, .45 * u);              // 든 팔
        cx.fillRect(-3.6 * u, -2.5 * u, 1.5 * u, 1.1 * u);              // 태블릿(바깥으로 내민 화면)
        cx.fillRect(1.6 * u, -1.2 * u, 1.5 * u, .45 * u);               // 제스처 팔
        cx.fillRect(-1.4 * u, .7 * u, 1.1 * u, 1.0 * u); cx.fillRect(.3 * u, .7 * u, 1.1 * u, 1.0 * u);
      },
    },
    lyl: { // 이영림 — 가방 둘 + 목의 두 물건 + 링라이트. 자세가 안 무너진다
      tone: '#9aa6bb', h: 1.0,
      draw(cx, u, col) {
        cx.fillStyle = col;
        cx.fillRect(-2.2 * u, -1.5 * u, .6 * u, 1.5 * u);               // 백팩(뒤로 튀어나옴)
        cx.fillRect(-1.6 * u, -1.5 * u, 3.2 * u, 2.2 * u);              // 몸 — 어깨 각짐
        cx.beginPath(); cx.arc(0, -2.2 * u, .95 * u, 0, 7); cx.fill();
        cx.fillRect(-.55 * u, -1.35 * u, .28 * u, .8 * u);              // 목 ①사원증
        cx.fillRect(.25 * u, -1.35 * u, .28 * u, .6 * u);               // 목 ②클립 마이크
        cx.fillRect(1.6 * u, -.6 * u, .5 * u, 1.4 * u);                 // 촬영 파우치
        cx.beginPath(); cx.arc(2.6 * u, .1 * u, .85 * u, 0, 7);          // 링라이트
        cx.lineWidth = .35 * u; cx.strokeStyle = col; cx.stroke();
        cx.fillRect(-1.4 * u, .7 * u, 1.1 * u, 1.1 * u); cx.fillRect(.3 * u, .7 * u, 1.1 * u, 1.1 * u);
      },
    },
    lhm: { // 이혜미 — 가장 길고 가늘다. 어깨가 올라가 있다. 허리에 라벨 프린터
      tone: '#767c8a', h: 1.14,
      draw(cx, u, col) {
        cx.fillStyle = col;
        cx.fillRect(-1.25 * u, -1.7 * u, 2.5 * u, 2.4 * u);             // 좁은 몸
        cx.fillRect(-1.5 * u, -1.8 * u, 3.0 * u, .35 * u);              // 올라간 어깨
        cx.beginPath(); cx.arc(0, -2.5 * u, .88 * u, 0, 7); cx.fill();
        cx.beginPath(); cx.arc(.15 * u, -3.15 * u, .5 * u, 0, 7); cx.fill(); // 묶은 머리
        cx.fillRect(1.2 * u, -.35 * u, .85 * u, .7 * u);                // 라벨 프린터
        cx.fillRect(-1.05 * u, .7 * u, .85 * u, 1.5 * u); cx.fillRect(.2 * u, .7 * u, .85 * u, 1.5 * u); // 긴 다리
      },
    },
    smr: { // 손미림 — 상하 폭이 갈린다(붙는 상의 + 통 넓은 바지). 목에 헤드폰
      tone: '#948aa0', h: .88,
      draw(cx, u, col) {
        cx.fillStyle = col;
        cx.fillRect(-1.25 * u, -1.4 * u, 2.5 * u, 1.7 * u);             // 붙는 상의 — 좁다
        cx.beginPath(); cx.arc(0, -2.05 * u, .95 * u, 0, 7); cx.fill();
        cx.fillRect(-1.35 * u, -2.35 * u, 2.7 * u, .55 * u);            // 단발
        cx.beginPath(); cx.arc(0, -1.75 * u, 1.05 * u, Math.PI, 0);      // 목에 건 헤드폰
        cx.lineWidth = .3 * u; cx.strokeStyle = col; cx.stroke();
        cx.beginPath();                                                  // 통 넓은 바지 — 아래로 퍼진다
        cx.moveTo(-1.25 * u, .3 * u); cx.lineTo(1.25 * u, .3 * u);
        cx.lineTo(2.1 * u, 1.9 * u); cx.lineTo(-2.1 * u, 1.9 * u); cx.closePath(); cx.fill();
        cx.fillRect(1.3 * u, -.9 * u, .8 * u, .6 * u);                  // 카메라
      },
    },
    you: { // 플레이어 — 남의 장비에 파묻힌 작은 형체. 짐이 늘어난다
      tone: '#b9b3a6', h: .84,
      draw(cx, u, col, load) {
        cx.fillStyle = col;
        cx.fillRect(-1.75 * u, -1.3 * u, 3.5 * u, 2.0 * u);             // 오버핏 — 몸보다 크다
        cx.beginPath(); cx.arc(0, -1.95 * u, .85 * u, 0, 7); cx.fill();
        cx.fillRect(-1.15 * u, .7 * u, .95 * u, 1.0 * u); cx.fillRect(.2 * u, .7 * u, .95 * u, 1.0 * u);
        const n = Math.min(4, load || 0);
        cx.lineWidth = .26 * u; cx.strokeStyle = col;
        if (n > 0) { cx.beginPath(); cx.arc(-1.9 * u, -.9 * u, .62 * u, 0, 7); cx.stroke(); }  // 케이블 코일
        if (n > 1) { cx.fillRect(1.7 * u, -.7 * u, .6 * u, 1.2 * u); }                          // 토트백
        if (n > 2) { cx.fillRect(-2.5 * u, .1 * u, .55 * u, 1.0 * u); }                         // 숄더백
        if (n > 3) { cx.fillRect(1.5 * u, -1.75 * u, 1.3 * u, .5 * u); }                        // 슬레이트
      },
    },
  };

  /* 인물 1인을 (x, y) 바닥 기준으로 그린다. col을 주면 그 색, 없으면 고유 톤 */
  function crew(cx, key, x, y, unit, col, load) {
    const c = CREW[key]; if (!c) return;
    cx.save(); cx.translate(x, y); cx.scale(c.h, c.h);
    c.draw(cx, unit, col || c.tone, load);
    cx.restore();
  }

  /* 작은 캔버스 하나에 인물 1인을 꽉 차게 — 배치 화면 카드·슬롯용
     세로 최대 점유는 이혜미(가장 큼) 기준 약 6.7u. 그 값으로 u를 잡으면
     5인의 키 차이(c.h)가 캔버스 안에서 그대로 유지된다. */
  function crewChip(canvas, key, col) {
    const cx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    cx.clearRect(0, 0, w, h);
    const c = CREW[key]; if (!c) return;
    const u = h * 0.94 / 6.7;
    crew(cx, key, w / 2, h - 2.25 * u * c.h, u, col);
  }

  function label(cx, text, x, y) {
    cx.font = '600 11px system-ui, sans-serif';
    const w = cx.measureText(text).width;
    cx.fillStyle = 'rgba(20,22,26,.88)';
    cx.beginPath(); cx.roundRect(x - w / 2 - 5, y - 11, w + 10, 16, 3); cx.fill();
    cx.fillStyle = '#e8e6df'; cx.textAlign = 'center'; cx.fillText(text, x, y);
    cx.textAlign = 'left';
  }

  return { C, furniture, glyphKind, itemGlyph, crew, crewChip, label, CREW };
})();
