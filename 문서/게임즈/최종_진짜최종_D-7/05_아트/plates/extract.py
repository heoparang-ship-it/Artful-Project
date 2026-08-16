#!/usr/bin/env python3
"""납품 레퍼런스(AI_PROMPT_FINAL_PASS_R2)에서 게임용 인물 컷을 뽑는다.

시트·라인업은 종이색 배경 위에 인물이 놓인 그림이다. 테두리에서 색이
비슷한 영역을 밀어 들어가며 지워 배경만 투명으로 만들고, 남은 형체를
잘라 낸 뒤 게임 크기로 줄인다. 인물 안쪽의 밝은 면(흰 티, 종이)은
테두리와 이어져 있지 않으므로 지워지지 않는다.

실행: python3 extract.py
결과: 이 폴더에 crew-*.png (배경 투명, 발끝이 아래 끝)
"""
from PIL import Image
import numpy as np
from collections import deque
from pathlib import Path

R2 = Path(__file__).resolve().parents[1].parent / "02_발주서" / "AI_PROMPT_FINAL_PASS_R2"
OUT = Path(__file__).resolve().parent
TARGET_H = 440           # 게임에 넣을 세로 픽셀. 무대에서 인물은 이보다 작게 그려진다

# 어떤 그림의 어느 인물을 쓸지. 라인업은 5인이 같은 스케일·같은 조명이라 기준으로 삼는다.
LINEUP = R2 / "09_sonmirim_widepants_fixed" / "ch_lineup_sonmirim_widepants_fixed.png"
# 이영림만 라인업 판이 크롭탑·쇼츠(발주서 2.5-5 저촉)라 07의 재킷 버전을 쓴다.
LYL_SHEET = R2 / "07_leeyeonglim_influencer_fixed" / "ch_leeyeonglim_sheet_influencer_fixed.png"


def strip_bg(img, tol=34):
    """테두리에서 시작해 비슷한 색을 밀고 들어가며 배경을 투명화한다."""
    rgb = np.asarray(img.convert("RGB")).astype(np.int16)
    h, w, _ = rgb.shape
    seen = np.zeros((h, w), bool)
    q = deque()

    # 테두리 색의 중앙값을 배경색으로 본다(모서리 하나가 튀어도 흔들리지 않게)
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(edge, axis=0)

    for x in range(w):
        for y in (0, h - 1):
            if not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if not seen[y, x]:
                seen[y, x] = True; q.append((y, x))

    close = (np.abs(rgb - bg).max(axis=2) <= tol)   # 배경색과 충분히 가까운 픽셀
    while q:
        y, x = q.popleft()
        if not close[y, x]:
            continue
        for ny, nx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)):
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx]:
                seen[ny, nx] = True
                if close[ny, nx]:
                    q.append((ny, nx))

    alpha = np.where(seen & close, 0, 255).astype(np.uint8)
    out = img.convert("RGBA")
    a = np.asarray(out).copy()
    a[:, :, 3] = alpha
    return Image.fromarray(a)


def columns_of_figures(alpha, min_gap=18, min_width=40, min_px=10):
    """인물이 실제로 차지한 열만 묶는다.
    '한 픽셀이라도 있으면 인물'로 보면 배경 제거 후 남은 잔점이 인물 사이를
    이어버려 5명이 3덩어리가 된다. 열당 불투명 픽셀 수로 문턱을 둔다."""
    cols = (alpha > 8).sum(axis=0) >= min_px
    groups, run = [], None
    gap = 0
    for x, on in enumerate(cols):
        if on:
            if run is None:
                run = [x, x]
            else:
                run[1] = x
            gap = 0
        elif run is not None:
            gap += 1
            if gap >= min_gap:
                groups.append(tuple(run)); run = None
    if run is not None:
        groups.append(tuple(run))
    return [g for g in groups if g[1] - g[0] >= min_width]


def crop_alpha(im):
    a = np.asarray(im)[:, :, 3]
    ys, xs = np.where(a > 8)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def to_target(im, target_h=TARGET_H):
    r = target_h / im.height
    return im.resize((max(1, round(im.width * r)), target_h), Image.LANCZOS)


def save(im, name):
    p = OUT / name
    im.save(p, "PNG", optimize=True)
    print(f"  {name:16s} {im.width}x{im.height}  {p.stat().st_size // 1024}KB")


print("라인업에서 배경 제거 중…")
line = Image.open(LINEUP)
line_top = line.crop((0, 0, line.width, int(line.height * 0.55)))   # 위쪽 컬러 5인만
cut = strip_bg(line_top)
alpha = np.asarray(cut)[:, :, 3]
groups = columns_of_figures(alpha, min_gap=6, min_width=60, min_px=75)
print(f"  인물 {len(groups)}명 검출: {groups}")

# 라인업 순서 = 허파랑·이영림·이혜미·손미림·김신입
KEYS = ["heo", "lyl", "lhm", "smr", "you"]
if len(groups) != 5:
    raise SystemExit(f"인물 분리 실패({len(groups)}개). tol/min_gap 조정 필요")

# 라인업은 5인이 같은 스케일로 그려져 있다. 각자를 440px로 맞추면 그 관계가
# 사라지므로(이혜미가 가장 크고 손미림이 가장 작다), 공통 배율 하나만 적용한다.
figs = {}
for key, (x0, x1) in zip(KEYS, groups):
    figs[key] = crop_alpha(cut.crop((x0, 0, x1 + 1, cut.height)))
tallest = max(f.height for f in figs.values())
scale = TARGET_H / tallest
print(f"공통 배율 {scale:.3f} (가장 큰 인물 {tallest}px → {TARGET_H}px)")

print("인물 컷 저장:")
for key, f in figs.items():
    if key == "lyl":
        continue                                   # 아래에서 07 시트로 대체
    save(f.resize((max(1, round(f.width * scale)), round(f.height * scale)), Image.LANCZOS),
         f"crew-{key}.png")

print("이영림 — 07 재킷 버전에서 정면 1체 추출:")
sheet = strip_bg(Image.open(LYL_SHEET))
sa = np.asarray(sheet)[:, :, 3]
sg = columns_of_figures(sa, min_gap=6, min_width=80, min_px=75)
print(f"  검출 {len(sg)}개 → 첫 번째(정면) 사용")
fig = crop_alpha(sheet.crop((sg[0][0], 0, sg[0][1] + 1, sheet.height)))
# 다른 그림에서 왔으므로, 라인업의 이영림 키에 맞춘다
want = round(figs["lyl"].height * scale)
r = want / fig.height
save(fig.resize((max(1, round(fig.width * r)), want), Image.LANCZOS), "crew-lyl.png")

print("\n키 비교(게임에 들어갈 세로 px):")
for k in KEYS:
    from PIL import Image as I
    print(f"  {k}: {I.open(OUT / f'crew-{k}.png').height}")
print("\n완료. node ../../04_MVP프로토타입/build-artifact.mjs 로 게임에 반영한다.")
