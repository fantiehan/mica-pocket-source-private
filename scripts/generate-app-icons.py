#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path('/Applications/Lark.app/Contents/Resources/app.icns')
OUTPUTS = {
    ROOT / 'apple-touch-icon.png': 180,
    ROOT / 'icons' / 'icon-192.png': 192,
    ROOT / 'icons' / 'icon-512.png': 512,
}

if not SOURCE.exists():
    raise SystemExit(f'Official Lark icon not found: {SOURCE}')

source = Image.open(SOURCE).convert('RGBA')
alpha_box = source.getchannel('A').getbbox()
if not alpha_box:
    raise SystemExit('Official icon has no visible pixels')

left, top, right, bottom = alpha_box
side = max(right - left, bottom - top)
center_x = (left + right) / 2
center_y = (top + bottom) / 2
crop_left = round(center_x - side / 2)
crop_top = round(center_y - side / 2)
cropped = source.crop((crop_left, crop_top, crop_left + side, crop_top + side))

# Apple recommends an opaque touch icon. White matches the official icon plate
# and prevents transparent corners from being rendered against a dark fill.
opaque = Image.new('RGB', cropped.size, 'white')
opaque.paste(cropped, mask=cropped.getchannel('A'))

for output, size in OUTPUTS.items():
    output.parent.mkdir(parents=True, exist_ok=True)
    icon = opaque.resize((size, size), Image.Resampling.LANCZOS)
    icon.save(output, format='PNG', optimize=True)
    print(f'Generated {output.relative_to(ROOT)} ({size}x{size})')
