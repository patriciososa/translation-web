#!/usr/bin/env python3
"""Produce every production asset for the Bluelab bracket mark from the single
geometry spec in generate.py, and write each one to its home in the three apps.

Run from anywhere:  python3 web/brand-assets/mark/assets.py [--check]

--check writes nothing. It reports, per target, whether the committed file
already holds exactly what the generator produces, and exits non-zero if any
does not — so a geometry change that was never re-rendered fails a check
instead of shipping a stale icon.
"""
import io
import pathlib
import sys

from PIL import Image, ImageDraw

import generate as g

ROOT = pathlib.Path(__file__).resolve().parents[3]
MARK = "web/brand-assets/mark"

ICO_SIZES = [(16, 16), (32, 32), (48, 48)]
PNG_SIZES = (16, 32, 48, 56, 64, 128, 192, 256, 512, 1024)


def tile(size, radius_frac=0.1875, bleed=False):
    """The mark on a white tile — how the brand always presents it (see site-header.tsx).

    Favicons and launcher icons need an opaque ground: navy on a dark browser tab
    would otherwise disappear. `bleed` fills the whole square (iOS applies its own mask).
    """
    s = 4
    big = Image.new("RGBA", (size * s, size * s), (0, 0, 0, 0))
    if bleed:
        ImageDraw.Draw(big).rectangle([0, 0, size * s, size * s], fill=(255, 255, 255, 255))
    else:
        ImageDraw.Draw(big).rounded_rectangle(
            [0, 0, size * s - 1, size * s - 1],
            radius=int(size * s * radius_frac),
            fill=(255, 255, 255, 255),
        )
    ground = big.resize((size, size), Image.BOX)
    mark = g.render(size)
    ground.paste(mark, (0, 0), mark)
    return ground


def on_white(size):
    """Flattened onto opaque white, for contexts that reject alpha (Google Ads)."""
    out = Image.new("RGB", (size, size), "white")
    mark = g.render(size)
    out.paste(mark, (0, 0), mark)
    return out


def white_512():
    """The 512 master on an opaque white ground, for decks and docs."""
    return Image.alpha_composite(
        Image.new("RGBA", (512, 512), (255, 255, 255, 255)), g.render(512)
    ).convert("RGB")


# (path relative to repo root, kind, how to build it)
TARGETS = [
    ("web/public/brand-logo.png", "png", lambda: g.render(512)),
    ("web/src/app/icon.png", "png", lambda: tile(512)),
    ("web/src/app/apple-icon.png", "png", lambda: tile(180, bleed=True).convert("RGB")),
    ("web/src/app/favicon.ico", "ico", lambda: tile(64)),
    ("archive-browser/public/brand-logo.png", "png", lambda: g.render(512)),
    ("web/brand-assets/google-ads/bluelab-logo-1200.png", "png", lambda: on_white(1200)),
    ("app/app/src/main/res/drawable/ic_launcher_foreground.xml", "text", g.android_vector),
    # The vector master and its PNG reference set, alongside this script.
    (f"{MARK}/bluelab-mark.svg", "text", g.svg),
    (f"{MARK}/bluelab-mark-512-white.png", "png", white_512),
] + [
    (f"{MARK}/bluelab-mark-{px}.png", "png", lambda px=px: g.render(px))
    for px in PNG_SIZES
]


def write(kind, payload, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if kind == "text":
        dest.write_text(payload)
    elif kind == "ico":
        payload.save(dest, sizes=ICO_SIZES)
    else:
        payload.save(dest, optimize=True)


def _pixels(img):
    return img.convert("RGBA").tobytes()


def matches(kind, payload, dest):
    """Whether `dest` already holds exactly what `payload` would write.

    Images compare by pixel rather than by file bytes: a Pillow upgrade can
    re-encode identical artwork into different bytes, and reporting that as
    drift would train everyone to ignore --check.
    """
    if not dest.exists():
        return False
    if kind == "text":
        return dest.read_text() == payload
    if kind == "ico":
        buf = io.BytesIO()
        payload.save(buf, format="ICO", sizes=ICO_SIZES)
        buf.seek(0)
        fresh, disk = Image.open(buf), Image.open(dest)
        if sorted(disk.ico.sizes()) != sorted(fresh.ico.sizes()):
            return False
        return all(
            _pixels(disk.ico.getimage(s)) == _pixels(fresh.ico.getimage(s))
            for s in sorted(fresh.ico.sizes())
        )
    return _pixels(Image.open(dest)) == _pixels(payload)


def main():
    check = "--check" in sys.argv
    stale = []

    for rel, kind, build in TARGETS:
        dest = ROOT / rel
        payload = build()
        if check:
            ok = matches(kind, payload, dest)
            if not ok:
                stale.append(rel)
            print(f"{'ok' if ok else 'STALE':>7}  {rel}")
            continue
        write(kind, payload, dest)
        print(f"{'wrote':>7}  {rel}")

    if not check:
        return 0
    if stale:
        print(f"\n{len(stale)} of {len(TARGETS)} assets differ from the generator:")
        for rel in stale:
            print(f"  {rel}")
        print("re-run without --check to regenerate them.")
        return 1
    print(f"\nall {len(TARGETS)} assets match the generator.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
