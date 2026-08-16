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

  /* ---- 인물 ----
     한 벌의 파츠(다리·몸통·팔·머리·머리카락·얼굴·소품)를 색 팔레트로 그린다.
     팔레트 전체를 한 색으로 주면 순흑 실루엣 판정 모드가 되고(AC-CHR-03),
     u가 크면 얼굴 표식까지 그린다 — 무표정 규격(작화 지시서 §3.3):
     가는 눈·작고 평평한 동공·캐치라이트 없음·눈 밑 그늘·입은 단선 1획. */
  const SKIN = '#d8bda6', SKIN_S = '#b2907f', INK = '#241f1c';

  /* ---- 이미지 슬롯 ----
     05_아트/plates/ 에 파일이 있으면 빌드 시 여기에 data URI로 실린다.
     실린 항목은 그 그림을 쓰고, 없는 항목만 아래 도형 렌더링으로 그린다.
     그래서 인물 한 명씩 교체해 넣어도 화면이 깨지지 않는다. */
  /* 인물 플레이트는 extract.py가 공통 배율로 뽑아 상대 키가 보존돼 있다.
     가장 큰 인물이 PLATE_BASE px이며, 도형 렌더링의 최대 높이(5.66u)와
     같은 자리를 차지하도록 환산한다. 그래서 그림과 도형을 섞어 써도
     인물 크기가 서로 어긋나지 않는다. */
  const PLATE_BASE = 440, PLATE_MAX_U = 5.66;
  const PLATES = (typeof window !== 'undefined' && window.FFD7_PLATES) || {};
  const IMG = {};
  let platesReady = false;
  function loadPlates(done) {
    const keys = Object.keys(PLATES);
    if (!keys.length) { platesReady = true; done && done(); return; }
    let left = keys.length;
    keys.forEach(k => {
      const im = new Image();
      im.onload = () => { IMG[k] = im; if (!--left) { platesReady = true; done && done(); } };
      im.onerror = () => { if (!--left) { platesReady = true; done && done(); } };
      im.src = PLATES[k];
    });
  }
  const plate = k => IMG[k] || null;

  /* 이미지를 영역에 꽉 채우되 비율 유지 (cover) */
  function drawCover(cx, im, x, y, w, h) {
    const r = Math.max(w / im.width, h / im.height);
    const dw = im.width * r, dh = im.height * r;
    cx.save(); cx.beginPath(); cx.rect(x, y, w, h); cx.clip();
    cx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    cx.restore();
  }

  function face(cx, u, P, opt) {
    if (u < 15 || P.flat) return;                       // 작을 땐 생략, 실루엣 모드는 그리지 않는다
    const e = opt.eyeY == null ? -0.15 * u : opt.eyeY;
    cx.fillStyle = INK;
    cx.fillRect(-0.42 * u, e, 0.26 * u, 0.09 * u);      // 왼눈 — 가로로 긴 단선
    cx.fillRect(0.16 * u, e, 0.26 * u, 0.09 * u);       // 오른눈
    cx.fillStyle = SKIN_S;
    cx.fillRect(-0.42 * u, e + 0.16 * u, 0.26 * u, 0.05 * u);  // 눈 밑 그늘
    cx.fillRect(0.16 * u, e + 0.16 * u, 0.26 * u, 0.05 * u);
    cx.fillStyle = INK;
    if (opt.brow) {                                      // 눈썹 각도 = 그 인물의 기본값
      cx.save(); cx.translate(-0.29 * u, e - 0.16 * u); cx.rotate(opt.brow);
      cx.fillRect(-0.15 * u, 0, 0.3 * u, 0.06 * u); cx.restore();
      cx.save(); cx.translate(0.29 * u, e - 0.16 * u); cx.rotate(-opt.brow);
      cx.fillRect(-0.15 * u, 0, 0.3 * u, 0.06 * u); cx.restore();
    }
    cx.fillRect(-0.1 * u, e + 0.42 * u, 0.2 * u, 0.055 * u);   // 입 — 단선 1획
  }

  /* 공통 몸체. opt로 실루엣 폭을 인물별로 바꾼다 */
  function body(cx, u, P, o) {
    const tw = o.torsoW, th = o.torsoH, lw = o.legW, ll = o.legLen;
    cx.fillStyle = P.cloth2;                                   // 하의
    if (o.wide) {                                              // 통 넓은 바지
      cx.beginPath();
      cx.moveTo(-tw / 2, th * 0); cx.lineTo(tw / 2, 0);
      cx.lineTo(tw * .92, ll); cx.lineTo(-tw * .92, ll); cx.closePath(); cx.fill();
    } else {
      cx.fillRect(-tw / 2 + .05 * u, 0, lw, ll);
      cx.fillRect(tw / 2 - lw - .05 * u, 0, lw, ll);
    }
    cx.fillStyle = INK;                                        // 신발
    cx.fillRect(-tw / 2 + .02 * u, ll - .12 * u, lw + .1 * u, .16 * u);
    cx.fillRect(tw / 2 - lw - .12 * u, ll - .12 * u, lw + .1 * u, .16 * u);
    cx.fillStyle = P.cloth;                                    // 상의
    cx.fillRect(-tw / 2, -th, tw, th);
    cx.fillStyle = P.skin;                                     // 머리
    cx.beginPath(); cx.arc(0, -th - .82 * u, .78 * u, 0, 7); cx.fill();
    cx.fillStyle = P.cloth; cx.fillRect(-.22 * u, -th - .3 * u, .44 * u, .3 * u); // 목
  }

  const CREW = {
    /* 허파랑 — 한 손엔 항상 화면, 다른 손은 넓은 제스처. 눈썹만 올라간 무표정 */
    heo: {
      tone: '#a8b088', h: 1.0, foot: 1.5, tall: 4.65, pal: { cloth: '#a8b088', cloth2: '#4a5568', hair: '#2e2a26' },
      draw(cx, u, P) {
        const th = 1.55 * u;
        body(cx, u, P, { torsoW: 1.75 * u, torsoH: th, legW: .62 * u, legLen: 1.5 * u });
        cx.fillStyle = P.cloth;
        cx.fillRect(-1.62 * u, -th - .05 * u, .62 * u, .34 * u);        // 든 팔
        cx.fillRect(.98 * u, -th + .5 * u, .68 * u, .32 * u);           // 제스처 팔
        cx.fillStyle = P.prop || '#39414f';                              // 태블릿
        cx.fillRect(-2.5 * u, -th - .62 * u, .9 * u, 1.0 * u);
        if (!P.flat) { cx.fillStyle = '#8fa3c4'; cx.fillRect(-2.4 * u, -th - .52 * u, .32 * u, .38 * u);
          cx.fillRect(-2.02 * u, -th - .52 * u, .32 * u, .38 * u);
          cx.fillRect(-2.4 * u, -th - .1 * u, .32 * u, .38 * u); cx.fillRect(-2.02 * u, -th - .1 * u, .32 * u, .38 * u); }
        cx.save(); cx.translate(0, -th - .82 * u);
        cx.fillStyle = P.hair; cx.fillRect(-.8 * u, -.86 * u, 1.6 * u, .62 * u);
        face(cx, u, P, { brow: -.12 });
        if (u >= 15 && !P.flat) {                                        // 동그란 안경
          cx.strokeStyle = INK; cx.lineWidth = .07 * u;
          cx.beginPath(); cx.arc(-.29 * u, -.1 * u, .26 * u, 0, 7); cx.stroke();
          cx.beginPath(); cx.arc(.29 * u, -.1 * u, .26 * u, 0, 7); cx.stroke();
        }
        cx.restore();
      },
    },
    /* 이영림 — 가방 둘·목의 두 물건·링라이트. 자세가 안 무너진다. 눈썹 끝이 올라가 있다 */
    lyl: {
      tone: '#9aa6bb', h: 1.0, foot: 1.5, tall: 4.60, pal: { cloth: '#c9cdd6', cloth2: '#3f4652', hair: '#3a3128' },
      draw(cx, u, P) {
        const th = 1.5 * u;
        cx.fillStyle = P.prop || '#6b7280';
        cx.fillRect(-1.55 * u, -th - .05 * u, .55 * u, 1.25 * u);        // 백팩
        body(cx, u, P, { torsoW: 1.7 * u, torsoH: th, legW: .6 * u, legLen: 1.5 * u });
        cx.fillStyle = P.cloth; cx.fillRect(-1.9 * u, -th - .1 * u, 2 * u, .3 * u); // 각진 어깨
        cx.fillStyle = P.prop || '#6b7280';
        cx.fillRect(.9 * u, -th + .55 * u, .5 * u, 1.1 * u);             // 촬영 파우치
        cx.strokeStyle = P.prop || '#6b7280'; cx.lineWidth = .28 * u;    // 링라이트
        cx.beginPath(); cx.arc(2.1 * u, -.5 * u, .78 * u, 0, 7); cx.stroke();
        cx.fillStyle = INK;                                              // 목의 두 물건
        cx.fillRect(-.4 * u, -th - .25 * u, .16 * u, .8 * u);
        cx.fillRect(.24 * u, -th - .25 * u, .16 * u, .6 * u);
        cx.fillStyle = P.prop || '#8f95a3'; cx.fillRect(-.46 * u, -th + .55 * u, .28 * u, .34 * u);
        cx.save(); cx.translate(0, -th - .82 * u);
        cx.fillStyle = P.hair;
        cx.fillRect(-.82 * u, -.88 * u, 1.64 * u, .78 * u); cx.fillRect(-.86 * u, -.5 * u, .3 * u, .9 * u);
        face(cx, u, P, { brow: .16 });
        cx.restore();
      },
    },
    /* 이혜미 — 가장 길고 가늘다. 어깨가 올라가 있다. 라벨 프린터. 미간 세로 주름 1줄 */
    lhm: {
      tone: '#767c8a', h: 1.12, foot: 1.85, tall: 5.05, pal: { cloth: '#3f434c', cloth2: '#35383f', hair: '#231f1c' },
      draw(cx, u, P) {
        const th = 1.6 * u;
        body(cx, u, P, { torsoW: 1.35 * u, torsoH: th, legW: .5 * u, legLen: 1.85 * u });
        cx.fillStyle = P.cloth; cx.fillRect(-1.02 * u, -th - .2 * u, 2.04 * u, .34 * u); // 올라간 어깨
        cx.fillStyle = P.prop || '#8f95a3';
        cx.fillRect(.78 * u, -.32 * u, .62 * u, .5 * u);                 // 라벨 프린터
        cx.save(); cx.translate(0, -th - .82 * u);
        cx.fillStyle = P.hair;
        cx.fillRect(-.8 * u, -.9 * u, 1.6 * u, .66 * u);
        cx.beginPath(); cx.arc(.15 * u, -1.12 * u, .42 * u, 0, 7); cx.fill();   // 묶은 머리
        face(cx, u, P, { brow: -.06 });
        if (u >= 15 && !P.flat) { cx.fillStyle = INK; cx.fillRect(-.03 * u, -.42 * u, .06 * u, .2 * u); } // 미간 주름
        cx.restore();
      },
    },
    /* 손미림 — 붙는 상의 + 통 넓은 바지. 목에 헤드폰. 입꼬리만 살짝 */
    smr: {
      tone: '#948aa0', h: .9, foot: 1.6, tall: 4.60, pal: { cloth: '#2a2630', cloth2: '#5c5568', hair: '#2b2622' },
      draw(cx, u, P) {
        const th = 1.4 * u;
        body(cx, u, P, { torsoW: 1.3 * u, torsoH: th, legW: .5 * u, legLen: 1.6 * u, wide: true });
        cx.strokeStyle = P.prop || '#8f95a3'; cx.lineWidth = .26 * u;    // 목에 건 헤드폰
        cx.beginPath(); cx.arc(0, -th - .18 * u, .72 * u, Math.PI, 0); cx.stroke();
        cx.fillStyle = P.prop || '#8f95a3';
        cx.fillRect(.72 * u, -th + .35 * u, .55 * u, .42 * u);           // 카메라
        cx.save(); cx.translate(0, -th - .82 * u);
        cx.fillStyle = P.hair; cx.fillRect(-.86 * u, -.9 * u, 1.72 * u, 1.15 * u);  // 단발
        cx.fillStyle = P.skin; cx.beginPath(); cx.arc(0, -.02 * u, .66 * u, 0, Math.PI); cx.fill();
        cx.fillStyle = P.skin; cx.fillRect(-.66 * u, -.34 * u, 1.32 * u, .5 * u);
        face(cx, u, P, { brow: .02 });
        cx.restore();
      },
    },
    /* 플레이어 — 오버핏, 남의 장비에 파묻힌다. 짐은 load로 늘어난다 */
    you: {
      tone: '#b9b3a6', h: .86, foot: 1.4, tall: 4.45, pal: { cloth: '#9a9488', cloth2: '#3d4450', hair: '#2a2622' },
      draw(cx, u, P, load) {
        const th = 1.45 * u;
        body(cx, u, P, { torsoW: 1.85 * u, torsoH: th, legW: .6 * u, legLen: 1.4 * u });
        const n = Math.min(4, load == null ? 2 : load);
        cx.strokeStyle = P.prop || '#8f95a3'; cx.lineWidth = .22 * u;
        cx.fillStyle = P.prop || '#8f95a3';
        if (n > 0) { cx.beginPath(); cx.arc(-1.5 * u, -th + .5 * u, .52 * u, 0, 7); cx.stroke(); }
        if (n > 1) { cx.fillRect(1.05 * u, -th + .45 * u, .5 * u, 1.0 * u); }
        if (n > 2) { cx.fillRect(-1.95 * u, -th + .95 * u, .45 * u, .85 * u); }
        if (n > 3) { cx.fillRect(.95 * u, -th - .35 * u, 1.05 * u, .4 * u); }
        cx.save(); cx.translate(0, -th - .82 * u);
        cx.fillStyle = P.hair; cx.fillRect(-.8 * u, -.9 * u, 1.6 * u, .6 * u);
        face(cx, u, P, { brow: 0 });
        cx.restore();
      },
    },
  };

  /* 인물 1인을 (x, y) 바닥 기준으로 그린다.
     col을 주면 전 파츠를 그 한 색으로 칠한다 = 순흑 실루엣 판정 모드. */
  /* col: 도형 렌더링용 단색(순흑 실루엣 판정 모드에서 지정). 지정하면 항상 도형을 쓴다.
     fade: 0~1 농도. 그림에는 색을 덧입힐 수 없으므로 컨디션·미배치는 농도로 표현한다.
     같은 상태를 도형은 색으로, 그림은 농도로 나타내되 읽히는 의미는 같다. */
  function crew(cx, key, x, y, unit, col, load, fade, flat) {
    const c = CREW[key]; if (!c) return;
    const im = plate('crew-' + key);
    if (im && !flat) {         // flat=true(실루엣 판정)만 도형을 쓴다 — 판정 대상이 그림이 아니라 설계이므로
      const hgt = (im.height / PLATE_BASE) * PLATE_MAX_U * unit;
      const wid = im.width / im.height * hgt;
      const a = fade == null ? 1 : fade;
      if (a < 1) { cx.save(); cx.globalAlpha = a; }
      cx.drawImage(im, x - wid / 2, y - hgt, wid, hgt);
      if (a < 1) cx.restore();
      return;
    }
    const P = col
      ? { cloth: col, cloth2: col, skin: col, hair: col, prop: col, flat: !!flat }
      : Object.assign({ skin: SKIN, prop: '#8f95a3' }, c.pal);
    cx.save();
    cx.translate(x, y - c.foot * c.h * unit);   // 발끝이 y(바닥선)에 닿게
    cx.scale(c.h, c.h);
    c.draw(cx, unit, P, load);
    cx.restore();
  }

  /* 작은 캔버스 하나에 인물 1인을 꽉 차게 — 배치 화면 카드·슬롯용
     세로 최대 점유는 이혜미(가장 큼) 기준 약 6.7u. 그 값으로 u를 잡으면
     5인의 키 차이(c.h)가 캔버스 안에서 그대로 유지된다. */
  function crewChip(canvas, key, col, flat) {
    const cx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    cx.clearRect(0, 0, w, h);
    const c = CREW[key]; if (!c) return;
    const MAX = 5.66;                       // 가장 큰 인물(이혜미)의 전체 높이 × h
    const u = h * 0.95 / MAX;
    crew(cx, key, w / 2, h - 1, u, col, null, null, flat);
  }


  /* ---- 상시 사무실 씬 ----
     60 Seconds의 벙커 화면에 해당한다. 배치·이벤트·야근·이면 내내 떠 있고
     게임 상태에 따라 변한다 — 인물 컨디션, 쌓이는 커피잔, 수정부채 포스트잇,
     낮/밤, D-카운터. 텍스트로만 알던 것을 눈으로 보게 하는 게 목적이다. */
  const STAGE_POS = [
    { k: 'heo', x: .11 }, { k: 'lyl', x: .29 }, { k: 'lhm', x: .47 },
    { k: 'smr', x: .65 }, { k: 'you', x: .84 },
  ];

  function mix(a, b, t) {
    const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
    const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), bl = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function drawTimeline(cx, w, TL, st, night) {
    /* D-카운터 — 편집 타임라인 모티프 */
    cx.fillStyle = night ? '#0c0a16' : '#15181d'; cx.fillRect(0, 0, w, TL);
    const cw = w / 8;
    for (let i = 0; i < 8; i++) {
      const cur = (st.day || 1) - 1 === i, past = i < (st.day || 1) - 1;
      cx.fillStyle = cur ? C.accent : (past ? '#3a3f4a' : '#23262e');
      cx.fillRect(i * cw + 2, 5, cw - 4, TL - 10);
      cx.fillStyle = cur ? '#14161a' : (past ? '#6b7280' : '#4a4f59');
      cx.font = '600 11px system-ui,sans-serif'; cx.textAlign = 'center';
      cx.fillText('D-' + (7 - i), i * cw + cw / 2, TL - 6);
    }
    cx.textAlign = 'left';

  }

  /* overPlate=true 면 배경 그림 위이므로 집기는 건너뛰고 인물·이름표만 얹는다 */
  function drawCrewRow(cx, w, h, TL, FLOOR, st, night, overPlate) {
    /* 책상 5개 + 인물 */
    const u = 31, POS = [.115, .295, .475, .655, .855];
    STAGE_POS.forEach((pos, i) => {
      const x = POS[i] * w, dw = 168, dy = FLOOR - 48;
      if (!overPlate) {
      cx.fillStyle = night ? '#221f38' : '#2b3039'; cx.fillRect(x - dw / 2, dy, dw, 48);
      cx.fillStyle = night ? '#2e2a4c' : '#353b46'; cx.fillRect(x - dw / 2, dy, dw, 7);
      const mw = 62, mh = 42, mx = x - dw / 2 + 12, my = dy - mh - 3;
      cx.fillStyle = night ? '#0c0a16' : '#1f232a'; cx.fillRect(mx, my, mw, mh);
      cx.fillStyle = night ? '#5570a8' : '#39414f'; cx.fillRect(mx + 4, my + 4, mw - 8, mh - 8);
      if (night) { cx.fillStyle = 'rgba(90,120,180,.09)';
        cx.beginPath(); cx.moveTo(mx - 26, my + mh); cx.lineTo(mx + mw + 26, my + mh);
        cx.lineTo(mx + mw + 70, FLOOR); cx.lineTo(mx - 70, FLOOR); cx.closePath(); cx.fill(); }
      }

      const o = (st.crew || []).find(z => z.k === pos.k) || {};
      const cond = o.cond == null ? 1 : clampf(o.cond, 0, 1);
      let tone = null, fade = 1;
      if (o.away) { tone = night ? '#2b2645' : '#3d434e'; fade = .42; }
      else if (cond < .55) {
        tone = mix(night ? '#3d3a5c' : '#565b66', CREW[pos.k].tone, .3 + cond);
        fade = .68 + cond * .55;                  // 지칠수록 옅어지되 사라지지는 않게
      }
      crew(cx, pos.k, x + 46, FLOOR, u, tone, o.load, clampf(fade, .42, 1));

      if (o.label) {
        cx.font = '600 12px system-ui,sans-serif'; cx.textAlign = 'center';
        const lw = cx.measureText(o.label).width;
        cx.fillStyle = night ? 'rgba(74,68,112,.6)' : 'rgba(232,179,75,.18)';
        cx.beginPath(); cx.roundRect(x - lw / 2 - 7, h - 44, lw + 14, 17, 4); cx.fill();
        cx.fillStyle = night ? '#b3a9e0' : C.accent; cx.fillText(o.label, x, h - 32);
        cx.textAlign = 'left';
      }
      if (o.name) {
        cx.font = '600 13px system-ui,sans-serif'; cx.textAlign = 'center';
        cx.fillStyle = o.away ? (night ? '#4a4470' : '#5f6672') : (night ? '#a49ed0' : '#d5d2c9');
        cx.fillText(o.name, x, h - 12); cx.textAlign = 'left';
      }
    });

  }

  function stage(cx, w, h, st) {
    st = st || {};
    const night = !!st.night;
    const TL = 22, FLOOR = h - 88;
    const wall  = night ? '#1a1830' : '#262a33';
    const wallD = night ? '#151327' : '#20242c';
    const floor = night ? '#100e1e' : '#191c23';

    cx.clearRect(0, 0, w, h);
    const bg = plate(night ? 'office-night' : 'office-day');
    if (bg) {                                // 배경판이 있으면 그림이 방을 대신한다
      drawCover(cx, bg, 0, TL, w, h - TL);
      drawTimeline(cx, w, TL, st, night);
      drawCrewRow(cx, w, h, TL, FLOOR, st, night, true);
      return;
    }
    cx.fillStyle = wall; cx.fillRect(0, TL, w, FLOOR - TL);
    cx.fillStyle = wallD; cx.fillRect(0, TL, w, 26);                 // 천장 그림자
    cx.fillStyle = floor; cx.fillRect(0, FLOOR, w, h - FLOOR);
    cx.fillStyle = night ? '#2a2740' : '#333844'; cx.fillRect(0, FLOOR, w, 3);

    drawTimeline(cx, w, TL, st, night);

    /* 형광등 — 밤에는 꺼진다 */
    for (let i = 0; i < 4; i++) {
      const lx = w * (.16 + i * .23);
      cx.fillStyle = night ? '#221f38' : '#c6c9be';
      cx.fillRect(lx - 42, TL + 6, 84, 7);
      if (!night) { cx.fillStyle = 'rgba(198,201,190,.05)';
        cx.beginPath(); cx.moveTo(lx - 42, TL + 13); cx.lineTo(lx + 42, TL + 13);
        cx.lineTo(lx + 120, FLOOR); cx.lineTo(lx - 120, FLOOR); cx.closePath(); cx.fill(); }
    }

    /* 화이트보드 */
    cx.fillStyle = night ? '#221f38' : '#31363f'; cx.fillRect(40, TL + 40, 196, 96);
    cx.strokeStyle = night ? '#2f2b4a' : '#3d434f'; cx.lineWidth = 3; cx.strokeRect(40, TL + 40, 196, 96);
    cx.fillStyle = night ? '#413a68' : '#4d5462';
    for (let i = 0; i < 4; i++) cx.fillRect(54, TL + 58 + i * 18, 70 + (i % 3) * 46, 4);
    cx.fillStyle = night ? '#5b4a6e' : C.rec; cx.fillRect(54, TL + 58 + 3 * 18, 62, 4);

    /* 벽시계 */
    const clx = 282, cly = TL + 66, clr = 22;
    cx.fillStyle = night ? '#221f38' : '#31363f'; cx.beginPath(); cx.arc(clx, cly, clr, 0, 7); cx.fill();
    cx.strokeStyle = night ? '#4a4470' : '#5b626f'; cx.lineWidth = 3;
    cx.beginPath(); cx.arc(clx, cly, clr, 0, 7); cx.stroke();
    const hh = st.hour == null ? 9 : st.hour, mm = st.min || 0;
    const ha = (hh % 12 + mm / 60) / 12 * 6.2832 - 1.5708, ma = mm / 60 * 6.2832 - 1.5708;
    cx.strokeStyle = night ? C.rec : '#a8aeba'; cx.lineWidth = 3; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(clx, cly); cx.lineTo(clx + Math.cos(ha) * 10, cly + Math.sin(ha) * 10); cx.stroke();
    cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(clx, cly); cx.lineTo(clx + Math.cos(ma) * 17, cly + Math.sin(ma) * 17); cx.stroke();
    cx.lineCap = 'butt';

    /* 창문 — 낮은 옅은 하늘, 밤은 검고 사무실이 비친다(책상이 하나 더 많다) */
    const wx = 330, wy = TL + 36, ww = 168, wh = 104;
    cx.fillStyle = night ? '#0b0916' : '#46525f'; cx.fillRect(wx, wy, ww, wh);
    cx.strokeStyle = night ? '#2a2740' : '#3d434f'; cx.lineWidth = 4; cx.strokeRect(wx, wy, ww, wh);
    cx.fillRect(wx + ww / 2 - 2, wy, 4, wh);
    if (night) { cx.fillStyle = 'rgba(120,130,170,.13)';
      for (let i = 0; i < 6; i++) cx.fillRect(wx + 12 + i * 25, wy + wh - 36, 17, 24); }

    /* 선반 — 테이프 박스가 쌓여 있다 */
    cx.fillStyle = night ? '#221f38' : '#2e333d'; cx.fillRect(w - 300, TL + 42, 250, 10);
    cx.fillRect(w - 300, TL + 100, 250, 10);
    for (let i = 0; i < 8; i++) {
      cx.fillStyle = night ? '#332d52' : ['#4a5568', '#5b5347', '#42505c'][i % 3];
      cx.fillRect(w - 292 + i * 30, TL + 42 - 26, 24, 26);
      if (i % 2) cx.fillRect(w - 292 + i * 30, TL + 100 - 24, 24, 24);
    }

    /* 수정부채 → 벽 포스트잇. 빚이 쌓일수록 벽이 지저분해진다 */
    const notes = Math.min(18, Math.round((st.debt || 0) / 3.5));
    for (let i = 0; i < notes; i++) {
      cx.fillStyle = night ? 'rgba(200,180,90,.26)' : 'rgba(232,179,75,.5)';
      cx.fillRect(534 + (i % 6) * 26, TL + 40 + Math.floor(i / 6) * 26, 18, 18);
    }

    drawCrewRow(cx, w, h, TL, FLOOR, st, night, false);

    /* 커피잔 — 남은 잔 수만큼 책상 위에 */
    for (let i = 0; i < Math.min(10, st.coffee || 0); i++) {
      const x = 52 + i * 108, y = FLOOR - 62;
      cx.fillStyle = night ? '#6b6490' : '#a8aeba';
      cx.fillRect(x, y, 11, 13); cx.fillRect(x + 11, y + 3, 4, 6);
    }

    /* 바닥 케이블 — 늘 깔려 있다 */
    cx.strokeStyle = night ? '#1c1930' : '#22262e'; cx.lineWidth = 4;
    cx.beginPath(); cx.moveTo(0, FLOOR + 34);
    for (let i = 0; i <= 8; i++) cx.lineTo(w / 8 * i, FLOOR + 34 + (i % 2 ? 13 : -6));
    cx.stroke();

    if (night) {   // REC 점등
      cx.fillStyle = C.rec; cx.beginPath(); cx.arc(w - 42, TL + 40, 6, 0, 7); cx.fill();
      cx.fillStyle = 'rgba(226,73,59,.10)'; cx.beginPath(); cx.arc(w - 42, TL + 40, 16, 0, 7); cx.fill();
    }
  }

  function clampf(v, a, b) { return v < a ? a : v > b ? b : v; }

  function label(cx, text, x, y) {
    cx.font = '600 11px system-ui, sans-serif';
    const w = cx.measureText(text).width;
    cx.fillStyle = 'rgba(20,22,26,.88)';
    cx.beginPath(); cx.roundRect(x - w / 2 - 5, y - 11, w + 10, 16, 3); cx.fill();
    cx.fillStyle = '#e8e6df'; cx.textAlign = 'center'; cx.fillText(text, x, y);
    cx.textAlign = 'left';
  }

  return { C, furniture, glyphKind, itemGlyph, crew, crewChip, label, stage, loadPlates, plate, CREW };
})();
