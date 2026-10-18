# Verified Information Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the `reference2.mp4` interaction where tapping the drawer's Verified badge closes the drawer, opens a full-screen Information page, reveals the organization verification badge after a delay, and returns to the chat page.

**Architecture:** Keep the drawer controller focused on drawer state. Add an independent `information-controller.js` state machine that coordinates drawer closure, delayed page entry, back navigation, accessibility state, and listener cleanup. Store all profile values in `config.js`; render a sibling `information-screen` within `app-shell` and animate it as a page-level route.

**Tech Stack:** Dependency-free HTML/CSS/JavaScript, Node.js built-in test runner, single-file build script, GitHub Pages.

---

### Task 1: Information navigation state machine

**Files:**
- Create: `information-controller.js`
- Create: `tests/information-controller.test.cjs`

- [ ] **Step 1: Write failing controller tests**

Cover these exact behaviors:

```js
trigger.dispatch('click');
assert.equal(drawerController.isOpen(), false);
assert.equal(controller.isPending(), true);
scheduler.flush();
assert.equal(controller.isOpen(), true);
assert.equal(root.classList.contains('is-information-open'), true);
assert.equal(screen.getAttribute('aria-hidden'), 'false');

backButton.dispatch('click');
assert.equal(controller.isOpen(), false);
assert.equal(drawerController.isOpen(), false);
```

Also test duplicate clicks, Escape, and `destroy()` listener/timer cleanup.

- [ ] **Step 2: Run RED test**

Run:

```bash
node --test tests/information-controller.test.cjs
```

Expected: fail because `information-controller.js` does not exist.

- [ ] **Step 3: Implement controller**

Expose:

```js
createInformationController({
  root,
  trigger,
  screen,
  backButton,
  eventTarget,
  drawerController,
  openDelay: 320,
  scheduler,
})
```

The controller must provide `open`, `close`, `isOpen`, `isPending`, and `destroy`.

- [ ] **Step 4: Run GREEN test**

```bash
node --test tests/information-controller.test.cjs
```

Expected: all Information controller tests pass.

### Task 2: Information page structure and centralized data

**Files:**
- Modify: `index.html`
- Modify: `config.js`
- Modify: `app.js`
- Modify: `tests/drawer-controller.test.cjs`
- Modify: `tests/page-contract.test.cjs`

- [ ] **Step 1: Add failing page/data contract tests**

Require:

```text
data-testid="verified-trigger"
data-testid="information-screen"
data-testid="information-back"
data-account-bio
data-account-department
information-controller.js
createInformationController
```

Require the account fixture to include `bio` and `department`.

- [ ] **Step 2: Run RED tests**

```bash
node --test tests/page-contract.test.cjs tests/drawer-controller.test.cjs
```

Expected: fail on missing Information DOM/controller/data.

- [ ] **Step 3: Add semantic DOM and bindings**

Change the drawer Verified element to a button. Add `information-screen` as a sibling of the drawer with two cards and rows for Profile Photo, Name, My QR code, My Badges, Bio, Organization, and Department. Bind account name, initials, organization, bio, department, and verification visibility from `MockConfig.account`.

- [ ] **Step 4: Run GREEN tests**

```bash
node --test tests/page-contract.test.cjs tests/drawer-controller.test.cjs
```

Expected: all contract tests pass.

### Task 3: Reference-matched page transitions and delayed badge

**Files:**
- Modify: `styles.css`
- Modify: `tests/page-contract.test.cjs`

- [ ] **Step 1: Add failing animation contracts**

Require a `320ms` Information transition, an off-screen `translate3d(100%, 0, 0)` initial state, an open state at `translate3d(0, 0, 0)`, chat parallax to the left, and a `700ms` delayed Information Verified animation.

- [ ] **Step 2: Run RED contract test**

```bash
node --test tests/page-contract.test.cjs
```

Expected: fail because Information styles do not exist.

- [ ] **Step 3: Implement CSS**

Use a full-width, `100vh`, z-indexed Information screen. Preserve the clean PWA height chain: no `100dvh`, no `safe-area-inset`, no fixed body, no viewport-fit override. Keep the Information page non-interactive off-screen and interactive only while open.

- [ ] **Step 4: Run GREEN contract test**

```bash
node --test tests/page-contract.test.cjs
```

Expected: all page contracts pass.

### Task 4: Single-file build and runtime verification

**Files:**
- Modify: `scripts/build-single.cjs`
- Modify: `tests/build-single.test.cjs`

- [ ] **Step 1: Add failing build contract**

Require the output to contain `createInformationController`, `information-screen`, and no external `information-controller.js` reference.

- [ ] **Step 2: Run RED build test**

```bash
node --test tests/build-single.test.cjs
```

- [ ] **Step 3: Inline the new controller**

Insert `information-controller.js` before `app.js` and add it to the external-reference rejection list.

- [ ] **Step 4: Run all automated checks**

```bash
npm run build:single
npm test
node --check information-controller.js
node --check app.js
```

Expected: all tests pass and syntax checks exit 0.

- [ ] **Step 5: Run mobile runtime verification**

At `390×844`, verify:

```text
drawer opens
Verified is clickable
click closes drawer first
Information opens after 320ms
all fields render
Information Verified opacity becomes 1 after 700ms
back returns to chat
back does not reopen drawer
no scroll
no browser errors
```

### Task 5: Publish final artifact

**Files:**
- Modify in release repository: `index.html`

- [ ] **Step 1: Clone release repository and copy `dist/mica-pocket.html` to `index.html`**
- [ ] **Step 2: Review `git diff --check` and ensure only the built artifact changed**
- [ ] **Step 3: Commit with `Add verified information navigation`**
- [ ] **Step 4: Push `main` and wait for GitHub Pages status `built`**
- [ ] **Step 5: Download production HTML and verify its hash equals the local artifact**
