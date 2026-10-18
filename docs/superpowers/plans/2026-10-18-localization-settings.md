# Localization Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent English/Simplified Chinese switching in Settings and a live local-day calendar glyph.

**Architecture:** Keep navigation, locale, and calendar responsibilities in separate dependency-free controllers. Use `data-i18n` attributes for static UI and centralized dictionaries in `config.js`; retain dynamic account/business data as-is.

**Tech Stack:** HTML/CSS/JavaScript, Node test runner, localStorage, GitHub Pages.

---

### Task 1: Locale state
- [ ] Write failing locale-controller tests for default English, Chinese application, persistence, invalid fallback, ARIA translation, and cleanup.
- [ ] Run RED tests.
- [ ] Implement `locale-controller.js`.
- [ ] Run GREEN tests.

### Task 2: Settings navigation
- [ ] Write failing settings-controller tests for delayed open, duplicate prevention, back/Escape, and cleanup.
- [ ] Run RED tests.
- [ ] Implement `settings-controller.js`.
- [ ] Run GREEN tests.

### Task 3: Calendar date
- [ ] Write failing calendar-controller tests for boot date, focus/pageshow/visibility refresh, next-midnight timer, and cleanup.
- [ ] Run RED tests.
- [ ] Implement `calendar-controller.js`.
- [ ] Run GREEN tests.

### Task 4: DOM, translations, and styling
- [ ] Add failing page/data contracts.
- [ ] Add Settings page, language rows, i18n keys, dictionaries, dynamic calendar target, and controller wiring.
- [ ] Add page-transition and selected-state CSS without violating viewport invariants.
- [ ] Run contracts and full tests.

### Task 5: Build, browser verification, and release
- [ ] Inline all new controllers in the single-file build and test no external references remain.
- [ ] Verify English, Chinese, persistence, date, back navigation, no scroll, and no browser errors at 390×844.
- [ ] Review release diff, commit only built `index.html`, push main, wait for Pages built, and hash-check production.
