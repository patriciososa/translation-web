#!/usr/bin/env python3
"""Generate the home-page hero photograph with Nano Banana Pro.

Same photographic direction as the Instagram set (social/posts.py STYLE), so the
site and the grid read as one brand.
"""
import base64
import json
import os
import pathlib
import sys
import urllib.request

MODEL = "gemini-3-pro-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "hero-desk.png")

STYLE = (
    "Editorial product photograph for a professional translation agency. "
    "Shot on a medium-format camera, 55mm lens, f/4. Soft diffused north light "
    "from the upper left, gentle natural shadows, no harsh specular highlights. "
    "The surface is a matte off-white, paper-textured desktop in a pale cool grey. "
    "Muted, desaturated, calm colour grade. Deep midnight navy blue and a clean "
    "royal blue appear only as small deliberate accents. "
    "Composition is clean and quietly asymmetric, the subject comfortably framed "
    "with calm empty margins. "
    "\n\nHARD CONSTRAINTS, follow every one:\n"
    "- Everything in frame is UPRIGHT and correctly oriented for the viewer. "
    "No object is rotated 180 degrees, upside down, mirrored or flipped. "
    "Printed lines of text run left-to-right and are the right way up.\n"
    "- Printed body text is rendered soft, small and slightly out of focus, so it "
    "reads as elegant grey texture rather than as legible words. Do not attempt "
    "sentences. Never render nonsense words large or sharp enough to read.\n"
    "- Never draw any colour name, hex code, camera setting or word from this "
    "prompt anywhere in the picture.\n"
    "- No logos, no brand names, no watermarks, no signage, no company marks.\n"
    "- No people, no faces, no hands.\n"
    "- No headline, caption, title or graphic-design text overlaid on the photo. "
    "This is a bare photograph only.\n"
    "- Photorealistic. Not an illustration, not a 3D render, not a flat vector."
)

SCENE = (
    "A wide view of a translator's working desk, shot from slightly above at a "
    "shallow angle. The composition is deliberately weighted to the RIGHT: the "
    "entire LEFT HALF of the frame is bare, softly lit desktop surface with "
    "nothing on it at all — no objects, no paper, no shadows of objects, just "
    "calm empty texture and a gentle falloff of light. On the right side of the "
    "frame stands a slim modern computer monitor, fully inside the frame, its "
    "screen facing the viewer and showing a calm out-of-focus video still in "
    "muted blues with one soft white subtitle strip across its lower third and "
    "a thin playback progress line beneath it. In front of and just left of the "
    "monitor, two printed document pages overlap at a slight angle — the same "
    "layout twice, an original and its translation — with a slim navy fountain "
    "pen across the upper page and folded reading glasses beside them. A small "
    "closed navy notebook sits at the lower right edge. Everything on the right "
    "is slightly soft, as though shot at a shallow depth of field, so the whole "
    "image reads as a quiet backdrop rather than a subject."
)


def api_key():
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    for line in (pathlib.Path.home() / ".claude" / ".env").read_text().splitlines():
        if line.startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip("'\"")
    raise SystemExit("GEMINI_API_KEY not found")


body = json.dumps({
    "contents": [{"parts": [{"text": f"{STYLE}\n\nSCENE: {SCENE}"}]}],
    "generationConfig": {
        "responseModalities": ["IMAGE"],
        "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"},
    },
}).encode()

req = urllib.request.Request(
    ENDPOINT, data=body,
    headers={"Content-Type": "application/json", "x-goog-api-key": api_key()},
)
with urllib.request.urlopen(req, timeout=300) as r:
    data = json.load(r)

for cand in data.get("candidates", []):
    for part in cand.get("content", {}).get("parts", []):
        if "inlineData" in part:
            OUT.write_bytes(base64.b64decode(part["inlineData"]["data"]))
            print(f"-> {OUT} ({OUT.stat().st_size // 1024} KB)")
            raise SystemExit(0)

raise SystemExit(f"no image in response: {json.dumps(data)[:800]}")
