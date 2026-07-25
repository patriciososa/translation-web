#!/usr/bin/env python3
"""Authoritative geometry for the Bluelab Translations mark: "Parentheses".

A navy opening parenthesis and a royal-blue closing parenthesis cupping a
two-tone bar — punctuation that means "an aside, rendered in other words".

Proportions are measured from the approved Gemini candidate and snapped to exact
integers on a 512-unit square, so every edge is mathematically true and every
colour is exactly on-palette. Generated rasters carry specular edge bleed and
silhouettes that are not real mirrors; this module replaces them.

Layout on the 512 box (all values exact):

    t    = 56             stroke weight, shared by the parens and the bar
    Ri   = 115, Ro = 171  inner/outer radius of each paren; centreline Rc = 143
    cx   = 211            arc centre of the left paren (the right one mirrors it)
    sinT = 10/13          half-angle of the arc sweep
    bar  = 228 x 56, corner radius 28, centred
    ink  = 432 x 276, centred on the 512 box

Everything is drawn from the left half and mirrored, so the two sides are
guaranteed pixel-identical.
"""
import math

from PIL import Image, ImageDraw

NAVY = (16, 26, 61)      # #101A3D
BLUE = (37, 99, 235)     # #2563EB
NAVY_HEX = "#101A3D"
BLUE_HEX = "#2563EB"

BOX = 512
CY = BOX // 2                        # 256
T = 56                               # stroke weight
RI, RO = 115, 171                    # paren inner / outer radius
RC = (RI + RO) // 2                  # 143, centreline
CX = 211                             # left paren arc centre
SIN_T = 10 / 13
COS_T = math.sqrt(1 - SIN_T ** 2)
THETA_DEG = math.degrees(math.asin(SIN_T))

# Centreline endpoints of the left paren; the round caps are centred here.
CAP_X = CX - RC * COS_T              # 119.628
CAP_TOP_Y = CY - RC * SIN_T          # 146.0
CAP_BOT_Y = CY + RC * SIN_T          # 366.0

BAR_L = 228
BR = T // 2                          # 28
BX0 = (BOX - BAR_L) // 2             # 142
BX1 = BX0 + BAR_L                    # 370
BYTOP = CY - BR                      # 228
BYBOT = CY + BR                      # 284

X0 = CX - RO                         # 40, leftmost ink
W = BOX - 2 * X0                     # 432
YTOP = CAP_TOP_Y - BR                # 118
YBOT = CAP_BOT_Y + BR                # 394
H = YBOT - YTOP                      # 276


def render(size, supersample=8):
    """Draw the mark at `size` px on a transparent square.

    The left half is drawn once and mirrored for the right, so the silhouette is
    exactly symmetric. Reduction uses a BOX (area-average) filter: unlike LANCZOS
    it cannot overshoot, so flat regions stay exactly on-palette.
    """
    s = supersample
    side = size * s
    k = side / BOX
    seam = round(CY * k)

    left = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    d = ImageDraw.Draw(left)

    # Paren: a constant-width arc band — PIL grows `width` inward from the bbox,
    # so an outer-radius bbox yields exactly the band between RI and RO.
    d.arc(
        [(CX - RO) * k, (CY - RO) * k, (CX + RO) * k, (CY + RO) * k],
        start=180 - THETA_DEG, end=180 + THETA_DEG,
        fill=NAVY + (255,), width=round(T * k),
    )
    for cy in (CAP_TOP_Y, CAP_BOT_Y):   # round caps
        d.ellipse(
            [(CAP_X - BR) * k, (cy - BR) * k, (CAP_X + BR) * k, (cy + BR) * k],
            fill=NAVY + (255,),
        )

    # Left half of the bar: the full capsule, masked to everything left of centre.
    mask = Image.new("L", left.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle(
        [BX0 * k, BYTOP * k, BX1 * k - 1, BYBOT * k - 1], radius=BR * k, fill=255
    )
    md.rectangle([seam, 0, side, side], fill=0)
    left.paste(Image.new("RGBA", left.size, NAVY + (255,)), (0, 0), mask)

    # The right half is that exact mirror, recoloured.
    right = left.transpose(Image.FLIP_LEFT_RIGHT)
    px = right.load()
    for y in range(side):
        for x in range(seam, side):
            a = px[x, y][3]
            if a:
                px[x, y] = BLUE + (a,)

    left.alpha_composite(right)
    return left.resize((size, size), Image.BOX)


def _paren(mirrored, X=lambda v: v, Y=lambda v: v, R=lambda v: v):
    """Centreline arc of one paren as path data, in whatever space X/Y/R map to."""
    x = X(BOX - CAP_X) if mirrored else X(CAP_X)
    sweep = 1 if mirrored else 0
    return f"M{x},{Y(CAP_TOP_Y)} A{R(RC)},{R(RC)} 0 0 {sweep} {x},{Y(CAP_BOT_Y)}"


def svg():
    """The vector master. Parens are stroked with round caps; the bar is filled."""
    r3 = lambda v: round(v, 3)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}" role="img" aria-label="Bluelab Translations">
  <title>Bluelab Translations</title>
  <path fill="none" stroke="{NAVY_HEX}" stroke-width="{T}" stroke-linecap="round" d="{_paren(False, r3, r3, r3)}"/>
  <path fill="none" stroke="{BLUE_HEX}" stroke-width="{T}" stroke-linecap="round" d="{_paren(True, r3, r3, r3)}"/>
  <path fill="{NAVY_HEX}" d="M{CY} {BYTOP} H{BX0 + BR} A{BR} {BR} 0 0 0 {BX0 + BR} {BYBOT} H{CY} Z"/>
  <path fill="{BLUE_HEX}" d="M{CY} {BYTOP} H{BX1 - BR} A{BR} {BR} 0 0 1 {BX1 - BR} {BYBOT} H{CY} Z"/>
</svg>
"""


def android_vector():
    """Adaptive-icon foreground, fitted inside the guaranteed 66dp safe circle."""
    s = 66.0 / math.hypot(W, H)
    ox = 54.0 - (W * s) / 2 - X0 * s
    oy = 54.0 - (H * s) / 2 - YTOP * s

    def X(v): return round(v * s + ox, 3)
    def Y(v): return round(v * s + oy, 3)
    def R(v): return round(v * s, 3)

    bar_l = (f"M{X(CY)},{Y(BYTOP)} H{X(BX0 + BR)} "
             f"A{R(BR)},{R(BR)} 0 0 0 {X(BX0 + BR)},{Y(BYBOT)} H{X(CY)} Z")
    bar_r = (f"M{X(CY)},{Y(BYTOP)} H{X(BX1 - BR)} "
             f"A{R(BR)},{R(BR)} 0 0 1 {X(BX1 - BR)},{Y(BYBOT)} H{X(CY)} Z")

    return f"""<?xml version="1.0" encoding="utf-8"?>
<!--
  Bluelab Translations launcher foreground: the parentheses mark — a navy opening
  paren and a royal-blue closing paren cupping a two-tone bar.
  Generated by web/brand-assets/mark/assets.py; edit the geometry in generate.py.
  Artwork is fitted inside the 66dp adaptive-icon safe circle.
-->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#00000000"
        android:strokeColor="{NAVY_HEX}"
        android:strokeWidth="{R(T)}"
        android:strokeLineCap="round"
        android:pathData="{_paren(False, X, Y, R)}" />
    <path
        android:fillColor="#00000000"
        android:strokeColor="{BLUE_HEX}"
        android:strokeWidth="{R(T)}"
        android:strokeLineCap="round"
        android:pathData="{_paren(True, X, Y, R)}" />
    <path
        android:fillColor="{NAVY_HEX}"
        android:pathData="{bar_l}" />
    <path
        android:fillColor="{BLUE_HEX}"
        android:pathData="{bar_r}" />
</vector>
"""


if __name__ == "__main__":
    import pathlib
    out = pathlib.Path(__file__).parent
    (out / "bluelab-mark.svg").write_text(svg())
    for px in (16, 32, 48, 56, 64, 128, 192, 256, 512, 1024):
        render(px).save(out / f"bluelab-mark-{px}.png", optimize=True)
    print("wrote master to", out)
