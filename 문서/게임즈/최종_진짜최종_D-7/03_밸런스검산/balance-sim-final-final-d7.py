# -*- coding: utf-8 -*-
# 《최종_진짜최종: D-7》 9.5 밸런스 검산 시뮬레이터
# 모델: 슬롯 실행 1회의 트랙 증가 = Σ수행자 개인 산출(슬롯 주요 트랙 적립) + 카드 성공값(명시 트랙)
# 개인 산출 = 능력치 × (0.5 + 0.005×min(집중,체력)) × 보정. RNG(크리·실수·이벤트)=0.

STATS = {
    'HP': dict(기획=9, 연출=10, 관리=7, 후반=6, F=90, S=80),   # 허파랑
    'YL': dict(기획=10, 연출=9, 관리=7, 후반=5, F=85, S=75),   # 이영림
    'HM': dict(기획=7, 연출=6, 관리=10, 후반=8, F=90, S=80),   # 이혜미
    'MR': dict(기획=6, 연출=9, 관리=8, 후반=10, F=80, S=75),   # 손미림
    'PL': dict(기획=6, 연출=6, 관리=6, 후반=6, F=85, S=90),    # 플레이어
}
SLOTS = {  # slot: (F cost, S cost, stat, main track)
    '기획': (6, 3, '기획', 'P'),
    '프리': (5, 4, '관리', 'P'),
    '촬영': (7, 9, '연출', 'S'),
    '편집': (8, 6, '후반', 'E'),
    'QC': (7, 5, '후반', 'M'),
}
NEXT = {'P': 'S', 'S': 'E', 'E': 'M', 'M': 'E'}
DAYS = ['D-7', 'D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1']


def coeff(p):
    return 0.5 + 0.005 * max(0, min(p['F'], p['S']))


def run(name, sched, use_share=True, fear_per_enc=6.0):
    P = {k: dict(F=STATS[k]['F'], S=STATS[k]['S']) for k in STATS}
    R = dict(P=12.0, S=0.0, E=0.0, M=0.0, integ=75.0, trust=50.0, debt=0.0,
             fear=0.0, emp=0.0, coffee=6.0)
    framedrop = set()
    consec_night = {k: 0 for k in STATS}
    last_day_slot = {k: None for k in STATS}
    rows = []
    print(f"\n===== {name} =====")
    for di, day in enumerate(DAYS):
        entry = sched[day]
        # 커피 0이면 전원 집중 -5
        if R['coffee'] <= 0:
            for k in P:
                P[k]['F'] = max(0, P[k]['F'] - 5)
        R['coffee'] = min(20, R['coffee'] + entry.get('coffee_in', 0))
        worked_today = set()
        # ---- 낮 슬롯 ----
        for a in entry.get('day', []):
            slot, members, card, mult, note = a
            worked_today.update(members)
            if slot == '회복':
                for m in members:
                    P[m]['F'] = min(STATS[m]['F'], P[m]['F'] + 14)
                    P[m]['S'] = min(STATS[m]['S'], P[m]['S'] + 10)
                continue
            fc, sc, stat, main = SLOTS[slot]
            out = 0.0
            for m in members:
                o = STATS[m][stat] * coeff(P[m]) * mult
                if m in framedrop:
                    o *= 0.65
                out += o
            gains = dict(card)  # copy card gains
            gains[main] = gains.get(main, 0.0) + out
            apply_gains(R, gains, members, slot, main)
            # 소모 (플레이어 패시브: 동료 집중 소모 ×0.7 / 연속 동일 고강도 슬롯 +3)
            for m in members:
                f_cost, s_cost = fc, sc
                if 'PL' in members and m != 'PL':
                    f_cost *= 0.7
                if last_day_slot[m] == slot:
                    f_cost += 3
                    s_cost += 3
                P[m]['F'] = max(0, P[m]['F'] - f_cost)
                P[m]['S'] = max(0, P[m]['S'] - s_cost)
            for m in members:
                last_day_slot[m] = slot
        for m in STATS:
            if m not in worked_today:
                last_day_slot[m] = None
        # ---- 액티브/이벤트 훅 ----
        for hook in entry.get('hooks', []):
            hook(R, P)
        # ---- 컨펌 (D-6부터, 성공률>=50 성공 처리) ----
        conf = ''
        if di >= 1:
            rate = 55 + R['P'] / 4 + (R['trust'] - 50) * 0.4 - R['debt'] / 2
            rate = max(5, min(95, rate))
            mid = (day == 'D-4')
            if rate >= 50:
                R['trust'] = min(100, R['trust'] + (6 if mid else 3))
                conf = f"컨펌 {rate:.0f}% 성공"
            else:
                R['debt'] = min(60, R['debt'] + (8 if mid else 4))
                R['trust'] = max(0, R['trust'] - 3)
                conf = f"컨펌 {rate:.0f}% 실패"
        # ---- 야근 ----
        night = entry.get('night')
        n_workers = 0
        if night:
            slot, members, card, mult, note = night
            need = len(members)
            if R['coffee'] >= need:
                R['coffee'] -= need
                n_workers = need
                fc, sc, stat, main = SLOTS[slot]
                out = 0.0
                for m in members:
                    o = STATS[m][stat] * coeff(P[m]) * mult
                    if m in framedrop:
                        o *= 0.65
                    out += o
                gains = {k: v * 0.65 for k, v in card.items()}
                gains[main] = gains.get(main, 0.0) + out * 0.65
                apply_gains(R, gains, members, slot, main)
                for m in members:
                    P[m]['F'] = max(0, P[m]['F'] - 8)
                    P[m]['S'] = max(0, P[m]['S'] - 10)
                    consec_night[m] += 1
                    if consec_night[m] >= 3:
                        framedrop.add(m)
                for m in STATS:
                    if m not in members:
                        consec_night[m] = 0
            else:
                conf += ' | 커피 부족→야근 불발'
                for m in STATS:
                    consec_night[m] = 0
        else:
            for m in STATS:
                consec_night[m] = 0
        # ---- 이면 조우율 → 공포 기대치 ----
        base = 30 + 7 * n_workers
        avgF = sum(P[k]['F'] for k in P) / 5
        if avgF < 40:
            base += 15
        base += 4 * int(R['debt'] // 10)
        if di >= 3:  # D-4부터 +5/일
            base += 5 * (di - 2)
        if R['integ'] >= 80:
            base -= 10
        rate_enc = max(0, min(100, base))
        R['fear'] += rate_enc / 100 * fear_per_enc
        if entry.get('night_integ_loss'):
            R['integ'] = max(0, R['integ'] - rate_enc / 100 * 4)
        if use_share:
            R['fear'] = max(0, R['fear'] - 5)  # 제작일보 '기록 공유'
        rows.append((day, R['P'], R['S'], R['E'], R['M'], R['integ'], R['debt'],
                     R['fear'], P['MR']['F'], P['MR']['S'], P['PL']['F'], P['PL']['S'],
                     R['trust'], R['emp'], R['coffee'], rate_enc, conf))
        print(f"{day}: P{R['P']:6.1f} S{R['S']:6.1f} E{R['E']:6.1f} M{R['M']:6.1f} "
              f"| 무결성{R['integ']:6.1f} 부채{R['debt']:4.1f} 공포{R['fear']:5.1f} "
              f"| MR {P['MR']['F']:.0f}/{P['MR']['S']:.0f} PL {P['PL']['F']:.0f}/{P['PL']['S']:.0f} "
              f"| 신뢰{R['trust']:.0f} 공감{R['emp']:.1f} 커피{R['coffee']:.0f} 조우{rate_enc:.0f}% {conf}")
    return R, rows


def apply_gains(R, gains, members, slot, main):
    # 이영림 패시브: 이영림 참여 기획 획득의 20% → 관객 공감 전환
    if 'YL' in members and gains.get('P', 0) > 0:
        conv = gains['P'] * 0.20
        gains['P'] -= conv
        R['emp'] = min(100, R['emp'] + conv)
    # 페어 '스토리보드가 움직인다' (YL+MR 기획 슬롯): 기획 진척 30% → 편집 전이
    if set(members) == {'YL', 'MR'} and slot == '기획' and gains.get('P', 0) > 0:
        mv = gains['P'] * 0.30
        gains['P'] -= mv
        gains['E'] = gains.get('E', 0) + mv
    # 플레이어 패시브 핸드오프: 주 트랙 획득의 15% 사본을 인접 트랙에
    if 'PL' in members and gains.get(main, 0) > 0 and main in NEXT:
        gains[NEXT[main]] = gains.get(NEXT[main], 0) + gains[main] * 0.15
    for k in ('P', 'S', 'E', 'M'):
        if k in gains:
            R[k] = min(100, R[k] + gains[k])
    if 'integ' in gains:
        R['integ'] = max(0, min(100, R['integ'] + gains['integ']))
    if 'trust' in gains:
        R['trust'] = max(0, min(100, R['trust'] + gains['trust']))
    if 'debt' in gains:
        R['debt'] = max(0, min(60, R['debt'] + gains['debt']))
    if 'emp' in gains:
        R['emp'] = min(100, R['emp'] + gains['emp'])


# ---------- 훅 ----------
def h_debt(v):
    def f(R, P):
        R['debt'] = max(0, min(60, R['debt'] + v))
    return f

def h_integ(v):
    def f(R, P):
        R['integ'] = max(0, min(100, R['integ'] + v))
    return f

def h_inspect(R, P):  # 이혜미 액티브 전수검수
    R['integ'] = min(100, R['integ'] + 8)
    R['debt'] = max(0, R['debt'] - 3)
    P['HM']['F'] = max(0, P['HM']['F'] - 10)

def h_salvage(R, P):  # 손미림 액티브 살릴 수 있는 컷
    R['S'] = min(100, R['S'] + 5)
    R['E'] = min(100, R['E'] + 4)

def h_move(src, dst, amt):  # 허파랑 액티브 총괄 판단(트랙 이동)
    def f(R, P):
        mv = min(amt, R[src])
        R[src] -= mv
        R[dst] = min(100, R[dst] + mv)
    return f

def h_refuse(R, P):  # 허파랑 패시브 확장 거절
    R['debt'] = max(0, R['debt'] - 4)
    for k in P:
        P[k]['F'] = min(STATS[k]['F'], P[k]['F'] + 3)


# ---------- ⓐ 무계획 ----------
A = {
 'D-7': dict(day=[('기획', ['MR', 'PL'], {'P': 8, 'emp': 4}, 1.0, '핵심구조'),
              ('프리', ['HP', 'YL'], {'integ': 6, 'P': 3}, 1.0, '자료인수')]),
 'D-6': dict(day=[('기획', ['PL', 'HM'], {'P': 7}, 1.0, '콘티'),
              ('프리', ['YL', 'MR'], {'S': 4}, 1.0, '로케')]),
 'D-5': dict(day=[('촬영', ['MR', 'YL'], {'S': 12}, 1.1, '부두(카메라만)'),
              ('회복', ['HM', 'PL'], {}, 1.0, '')]),
 'D-4': dict(day=[('편집', ['MR', 'PL'], {'E': 10}, 1.0, '러프컷'),
              ('회복', ['HP', 'YL'], {}, 1.0, '')]),
 'D-3': dict(day=[('편집', ['MR', 'PL'], {'E': 8}, 1.0, '그래픽'),
              ('회복', ['HP', 'YL'], {}, 1.0, '')]),
 'D-2': dict(day=[('편집', ['MR', 'PL'], {'E': 8}, 1.0, '음악'),
              ('회복', ['HP', 'YL'], {}, 1.0, '')]),
 'D-1': dict(day=[('QC', ['HM', 'MR'], {'M': 12}, 1.0, '최종 납품본 QC(요구 E60 충족)')]),
}

# ---------- ⓑ 균형 ----------
B = {
 'D-7': dict(day=[('기획', ['YL', 'HP'], {'P': 6, 'debt': -2}, 1.25, '브리프 잠금+한문장한장면'),
              ('프리', ['HM', 'PL'], {'integ': 6, 'P': 3}, 1.0, '자료인수'),
              ('회복', ['MR'], {}, 1.0, '')]),
 'D-6': dict(day=[('기획', ['YL', 'MR'], {'P': 7}, 1.0, '콘티(스토리보드 전이)'),
              ('프리', ['HM', 'PL'], {'S': 4}, 1.0, '로케'),
              ('촬영', ['HP'], {'S': 8, 'P': 4}, 1.2, '인터뷰(IT-14/16)')]),
 'D-5': dict(day=[('촬영', ['MR', 'HP'], {'S': 18}, 1.2, '부두+콘셉트투프레임(+6)+카메라·콘티'),
              ('QC', ['HM', 'PL'], {'integ': 8}, 1.0, '백업'),
              ('회복', ['YL'], {}, 1.0, '')],
          hooks=[h_integ(10), h_refuse],  # 원본 체인 콤보 / 허파랑 확장 거절①
          night=('편집', ['MR', 'PL'], {'E': 10}, 1.0, '야근① 러프컷')),
 'D-4': dict(day=[('편집', ['MR', 'PL'], {'E': 8}, 1.0, '그래픽'),
              ('기획', ['YL', 'HP'], {'P': 8, 'emp': 4}, 1.25, '핵심구조+한문장한장면'),
              ('회복', ['HM'], {}, 1.0, '')],
          hooks=[h_debt(-2), h_refuse],  # 한문장한장면 부채 -2 / 확장 거절②
          night=('편집', ['MR', 'PL'], {'E': 8}, 1.0, '야근② 음악·사운드')),
 'D-3': dict(day=[('촬영', ['MR', 'PL'], {'S': 9}, 1.0, '보충 촬영(요구 편집25)'),
              ('QC', ['HM', 'YL'], {'M': 6, 'integ': 4}, 1.0, '권리·크레딧'),
              ('회복', ['HP'], {}, 1.0, '')]),
 'D-2': dict(day=[('편집', ['MR', 'HP'], {'E': 10}, 1.0, '파인컷(요구 E45·S60)'),
              ('QC', ['HM', 'PL'], {'M': 7}, 1.0, '규격 테스트'),
              ('회복', ['YL'], {}, 1.0, '')],
          hooks=[h_inspect, h_salvage]),
 'D-1': dict(day=[('QC', ['HM', 'MR'], {'M': 12}, 1.0, '최종 납품본 QC(요구 E60)'),
              ('편집', ['YL', 'PL'], {'E': 8}, 1.0, '색보정(요구 E55·IT-22)'),
              ('회복', ['HP'], {}, 1.0, '')],
          hooks=[h_move('E', 'M', 6)]),
}

# 브리프 잠금 D-7 페어 부채 -2는 카드에 포함(debt -2)

# ---------- ⓒ 극한 ----------
C = {
 'D-7': dict(day=[('기획', ['YL', 'HP'], {'P': 6, 'debt': -2}, 1.25, '브리프 잠금'),
              ('프리', ['HM', 'PL'], {'integ': 6, 'P': 3}, 1.0, '자료인수'),
              ('회복', ['MR'], {}, 1.0, '')],
          night=('기획', ['MR', 'PL', 'YL'], {'P': 8, 'emp': 4}, 1.0, '야근 핵심구조'),
          night_integ_loss=True),
 'D-6': dict(day=[('기획', ['YL', 'MR'], {'P': 7}, 1.0, '콘티'),
              ('프리', ['HM', 'PL'], {'S': 4}, 1.0, '로케'),
              ('촬영', ['HP'], {'S': 8, 'P': 4}, 1.2, '인터뷰')],
          coffee_in=5,
          night=('촬영', ['MR', 'PL', 'HP'], {'S': 8, 'P': 4}, 1.2, '야근 인터뷰 반복'),
          night_integ_loss=True),
 'D-5': dict(day=[('촬영', ['MR', 'HP'], {'S': 18}, 1.2, '부두+콘셉트투프레임'),
              ('QC', ['HM', 'PL'], {'integ': 8}, 1.0, '백업'),
              ('기획', ['YL'], {'P': 8, 'emp': 4}, 1.0, '핵심구조 반복')],
          night=('편집', ['MR', 'PL', 'HM'], {'E': 10}, 1.0, '야근 러프컷'),
          night_integ_loss=True),
 'D-4': dict(day=[('편집', ['MR', 'PL'], {'E': 8}, 1.0, '그래픽'),
              ('기획', ['YL', 'HP'], {'P': 8, 'emp': 4}, 1.25, '핵심구조 반복'),
              ('QC', ['HM'], {'M': 6, 'integ': 4}, 1.0, '권리·크레딧')],
          coffee_in=5,
          hooks=[lambda R, P: (R.update(S=min(100, R['S'] + 8)),
                               R.update(debt=min(60, R['debt'] + 0)))],  # 확장 수락①: 촬영 +8, 게이트 +5(별도 기록)
          night=('편집', ['MR', 'PL', 'YL'], {'E': 8}, 1.0, '야근 음악'),
          night_integ_loss=True),
 'D-3': dict(day=[('촬영', ['MR', 'PL'], {'S': 9}, 1.0, '보충(요구 E25)'),
              ('QC', ['HM'], {'M': 7}, 1.0, '규격'),
              ('기획', ['YL', 'HP'], {'P': 8, 'emp': 4}, 1.25, '핵심구조 반복')],
          night=('QC', ['MR', 'PL', 'HM'], {'M': 6, 'integ': 4}, 1.0, '야근 권리 반복'),
          night_integ_loss=True),
 'D-2': dict(day=[('편집', ['MR', 'HP'], {'E': 10}, 1.0, '파인컷(요구 E45·S60)'),
              ('QC', ['HM', 'PL'], {'M': 7}, 1.0, '규격 반복'),
              ('기획', ['YL'], {'P': 8, 'emp': 4}, 1.0, '핵심구조 반복')],
          night=('편집', ['MR'], {'E': 8}, 1.0, '야근 색보정(요구 E55)'),
          night_integ_loss=True),
 'D-1': dict(day=[('QC', ['HM', 'MR'], {'M': 12}, 1.0, '최종QC(요구 E60)'),
              ('편집', ['YL', 'PL'], {'E': 8}, 1.0, '그래픽 반복'),
              ('기획', ['HP'], {'P': 8, 'emp': 4}, 1.0, '핵심구조 반복')],
          night=('QC', ['MR', 'PL', 'HM'], {'M': 7}, 1.0, '야근 시도(커피 부족 예상)'),
          night_integ_loss=True),
}

ra, _ = run('ⓐ 무계획', A, use_share=False)
rb, _ = run('ⓑ 균형', B, use_share=True)
rc, _ = run('ⓒ 극한', C, use_share=True, fear_per_enc=12.0)

for nm, R in (('ⓐ', ra), ('ⓑ', rb), ('ⓒ', rc)):
    score = (R['P'] * 0.20 + R['S'] * 0.25 + R['E'] * 0.25 + R['M'] * 0.15 +
             R['integ'] * 0.10 + R['trust'] * 0.05 - R['debt'] * 0.35)
    if R['emp'] >= 60:
        score += 3
    gates = [('기획 80', R['P'] >= 80), ('촬영 85', R['S'] >= 85), ('편집 80', R['E'] >= 80),
             ('마스터 75', R['M'] >= 75), ('무결성 65', R['integ'] >= 65), ('신뢰 45', R['trust'] >= 45)]
    print(f"\n{nm} 최종: 점수 {score:.2f} | 게이트: " +
          ', '.join(f"{g}{'○' if ok else '×'}" for g, ok in gates))
