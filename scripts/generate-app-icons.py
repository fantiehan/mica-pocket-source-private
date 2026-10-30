#!/usr/bin/env python3
"""Resize the flat, opaque icon master; leave corner masking to the OS."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'icons' / 'icon-master-flat.png'
OUTPUTS = {
    ROOT / 'apple-touch-icon.png': 180,
    ROOT / 'icons' / 'icon-192.png': 192,
    ROOT / 'icons' / 'icon-512.png': 512,
}

source = Image.open(SOURCE)
if source.width != source.height:
    raise SystemExit('Icon master must be square')
if source.mode == 'RGBA' and source.getchannel('A').getextrema() != (255, 255):
    raise SystemExit('Icon master must be opaque')
source = source.convert('RGB')

# Catch the old macOS icon plate/shadow before generating iOS assets again.
# The flat white margin can have up to 3 levels of rasterization noise.
margin = round(source.width * 0.08)
for box in [
    (0, 0, source.width, margin),
    (0, source.height - margin, source.width, source.height),
    (0, 0, margin, source.height),
    (source.width - margin, 0, source.width, source.height),
]:
    if any(low < 252 for low, high in source.crop(box).getextrema()):
        raise SystemExit('Icon master must have flat white margins without a border or shadow')

for output, size in OUTPUTS.items():
    output.parent.mkdir(parents=True, exist_ok=True)
    source.resize((size, size), Image.Resampling.LANCZOS).save(output, format='PNG', optimize=True)
    print(f'Generated {output.relative_to(ROOT)} ({size}x{size})')
