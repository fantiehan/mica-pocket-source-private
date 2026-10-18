# Home Screen Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the official Lark/Feishu icon as the iOS and PWA home-screen icon.

**Architecture:** Generate opaque, correctly sized PNG assets from the installed app's ICNS. Use real files for hosted Safari/PWA reliability and data URLs for the standalone single-file build.

**Tech Stack:** Python Pillow, PNG, HTML, Web App Manifest, Node tests.

---

### Task 1: Icon asset contracts
- [ ] Add failing tests for 180/192/512 opaque PNG files.
- [ ] Add failing HTML/manifest icon declaration tests.
- [ ] Run RED.

### Task 2: Generate official icon assets
- [ ] Extract the 1024 ICNS representation.
- [ ] Crop transparent margins, composite white, and resize with Lanczos.
- [ ] Run asset tests GREEN and inspect previews.

### Task 3: Wire hosted and standalone icons
- [ ] Add apple-touch, favicon, and manifest declarations.
- [ ] Extend the single-file builder to inline icon data URLs into HTML and manifest.
- [ ] Run build tests and complete regression.

### Task 4: Publish
- [ ] Copy the built HTML and three PNG assets into the release repository.
- [ ] Review the diff and PNG metadata.
- [ ] Commit, push, wait for Pages built, and compare production hashes.
