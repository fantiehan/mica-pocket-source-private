# Home Screen Icon Design

## Goal

Use the official icon extracted from the locally installed `/Applications/Lark.app` as the iOS home-screen and PWA install icon.

## Design

Extract `Contents/Resources/app.icns` at 1024×1024, crop the transparent outer margin around the official artwork, composite it over white to avoid transparent-corner rendering artifacts, and generate opaque PNG assets at 180, 192, and 512 pixels.

The hosted application declares `apple-touch-icon.png` for iOS and 192/512 icons in the web manifest. The standalone single-file build replaces all icon URLs with PNG data URLs and embeds a manifest whose icon entries also contain data URLs.

The public release contains only final deployment assets: `index.html`, `apple-touch-icon.png`, `icons/icon-192.png`, and `icons/icon-512.png`.

## Verification

Tests parse PNG IHDR data to verify format, dimensions, and absence of alpha. Contracts verify HTML and manifest declarations. Build tests verify there are no external icon paths in the standalone HTML. Production hashes must equal local deployment assets.
