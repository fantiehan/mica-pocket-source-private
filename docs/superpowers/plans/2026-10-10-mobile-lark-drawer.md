# Mobile Lark Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free mobile HTML simulation of the reference Feishu chat screen and its animated account drawer.

**Architecture:** Keep visual markup and styling separate from a small state controller. Centralize mock identity data in one configuration object, bind it in `app.js`, and test state transitions without a browser by injecting fake event targets.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, in-app browser verification.

---

## File map

- `index.html`: semantic mobile screen, static chat list, drawer markup, inline SVG symbols.
- `styles.css`: 440×956 responsive canvas, dark theme, drawer geometry, transitions, watermark, responsive behavior.
- `config.js`: immutable account fixture (`Tiehan Fan`, `ByteDance`, verified).
- `drawer-controller.js`: framework-free open/close/toggle controller with injected elements.
- `app.js`: render account fixture and initialize the drawer controller.
- `tests/drawer-controller.test.cjs`: behavioral unit tests using fake elements and event targets.
- `tests/page-contract.test.cjs`: static contract for required markup, content binding, geometry, and animation.
- `package.json`: local test and static-server scripts.

### Task 1: Define the behavior with failing tests

**Files:**
- Create: `tests/drawer-controller.test.cjs`
- Create: `tests/page-contract.test.cjs`
- Create: `package.json`

- [ ] **Step 1: Write controller tests**

Create fake elements with `classList`, attributes, and listeners. Require `drawer-controller.js` and assert that clicking the trigger adds `is-drawer-open`, sets `aria-expanded="true"`, sets drawer/backdrop `aria-hidden="false"`, and that backdrop click or Escape reverses all state. Verify `destroy()` removes listeners.

- [ ] **Step 2: Write page contract tests**

Read `index.html`, `styles.css`, `config.js`, and `app.js`. Assert required test IDs, the immutable account values, drawer widths `97px` and `281px`, a 300–340ms drawer transition, and a delayed verified animation.

- [ ] **Step 3: Run tests and verify RED**

Run: `node --test tests/*.test.cjs`
Expected: FAIL because production files do not exist.

### Task 2: Implement the controller and account binding

**Files:**
- Create: `config.js`
- Create: `drawer-controller.js`
- Create: `app.js`

- [ ] **Step 1: Add immutable configuration**

Expose `{ account: { name: 'Tiehan Fan', organization: 'ByteDance', initials: 'TF', verified: true } }` as `MockConfig` in browsers and as CommonJS exports in tests.

- [ ] **Step 2: Add the minimal drawer controller**

Implement `createDrawerController({ root, trigger, drawer, backdrop, eventTarget })` with `open()`, `close()`, `toggle()`, `isOpen()`, and `destroy()`. Synchronize CSS class and ARIA attributes in one `sync()` function.

- [ ] **Step 3: Bind the page**

Fill every `[data-account-name]`, `[data-account-organization]`, and `[data-account-initials]` node from `MockConfig`; hide or show `[data-account-verified]`; initialize the controller after `DOMContentLoaded`.

- [ ] **Step 4: Run controller tests**

Run: `node --test tests/drawer-controller.test.cjs`
Expected: all controller/config tests PASS.

### Task 3: Build the reference-matched mobile screen

**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Add semantic static markup**

Create the status bar, chat header, shortcut row, segmented filter, nine static conversations, bottom navigation, backdrop, account rail, main drawer, account card, seven menu items, Emergency SOS, and reusable SVG symbols. Add the data/test attributes required by the contract tests.

- [ ] **Step 2: Add exact layout tokens**

Define a 440px maximum canvas, a 97px rail, a 281px panel, a 378px drawer group, safe-area-aware height, the reference dark palette, typography, row dimensions, and fixed z-index layers.

- [ ] **Step 3: Add motion**

Use a 320ms transform transition with `cubic-bezier(.22, 1, .36, 1)`, fade the backdrop, and reveal `Verified` after 700ms. Add a reduced-motion override without changing final states.

- [ ] **Step 4: Run all tests**

Run: `node --test tests/*.test.cjs`
Expected: all tests PASS with zero failures.

### Task 4: Browser visual and interaction verification

**Files:**
- Modify only if verification finds a measurable mismatch.

- [ ] **Step 1: Start static server**

Run: `python3 -m http.server 4173 --directory /Users/bytedance/Documents/代码/html`
Expected: server listens on `http://127.0.0.1:4173`.

- [ ] **Step 2: Verify initial state at 440×956**

Open the page, confirm the chat list is visible, drawer is hidden, trigger reports `aria-expanded="false"`, and screenshot proportions match the reference.

- [ ] **Step 3: Verify open state and delayed badge**

Click the account trigger, wait 1000ms, confirm drawer is visible, account name/organization/Verified are visible, and the right 62px chat strip remains under a dark overlay.

- [ ] **Step 4: Verify close paths and console**

Close once via backdrop and once via Escape. Confirm both restore the initial state and that the browser console contains no errors.

- [ ] **Step 5: Run final verification**

Run: `node --test tests/*.test.cjs`
Expected: all tests PASS after any visual tuning.
