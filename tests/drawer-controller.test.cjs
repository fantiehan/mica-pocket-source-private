const test = require('node:test');
const assert = require('node:assert/strict');

const { createDrawerController } = require('../drawer-controller.js');
const { account } = require('../config.js');

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  toggle(name, force) {
    if (force) this.values.add(name);
    else this.values.delete(name);
    return force;
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeTarget {
  constructor() {
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) || []) {
      listener({ type, ...event });
    }
  }
}

function createHarness() {
  const root = new FakeTarget();
  const trigger = new FakeTarget();
  const drawer = new FakeTarget();
  const backdrop = new FakeTarget();
  const eventTarget = new FakeTarget();
  const controller = createDrawerController({
    root,
    trigger,
    drawer,
    backdrop,
    eventTarget,
  });
  return { root, trigger, drawer, backdrop, eventTarget, controller };
}

test('account fixture centralizes the required verified identity', () => {
  assert.deepEqual(account, {
    name: 'Tiehan Fan',
    organization: 'ByteDance',
    initials: 'TF',
    verified: true,
    bio: 'https://magic.solutionsuite.cn/r?k=img_v3_02e1...',
    department: 'TikTok-Data-Live',
  });
  assert.equal(Object.isFrozen(account), true);
});

test('account trigger opens the drawer and synchronizes accessibility state', () => {
  const { root, trigger, drawer, backdrop, controller } = createHarness();

  assert.equal(controller.isOpen(), false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');

  trigger.dispatch('click');

  assert.equal(controller.isOpen(), true);
  assert.equal(root.classList.contains('is-drawer-open'), true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(drawer.getAttribute('aria-hidden'), 'false');
  assert.equal(backdrop.getAttribute('aria-hidden'), 'false');
});

test('backdrop click and Escape both close an open drawer', () => {
  const { root, trigger, drawer, backdrop, eventTarget, controller } = createHarness();

  controller.open();
  backdrop.dispatch('click');
  assert.equal(controller.isOpen(), false);

  controller.open();
  eventTarget.dispatch('keydown', { key: 'Escape' });

  assert.equal(controller.isOpen(), false);
  assert.equal(root.classList.contains('is-drawer-open'), false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(drawer.getAttribute('aria-hidden'), 'true');
  assert.equal(backdrop.getAttribute('aria-hidden'), 'true');
});

test('destroy removes every installed event listener', () => {
  const { trigger, backdrop, eventTarget, controller } = createHarness();

  controller.destroy();
  trigger.dispatch('click');
  backdrop.dispatch('click');
  eventTarget.dispatch('keydown', { key: 'Escape' });

  assert.equal(controller.isOpen(), false);
  assert.equal(trigger.listeners.get('click').size, 0);
  assert.equal(backdrop.listeners.get('click').size, 0);
  assert.equal(eventTarget.listeners.get('keydown').size, 0);
});

test('a rightward swipe from the left edge opens the drawer on touch devices', () => {
  const { root, trigger, drawer, backdrop, eventTarget } = createHarness();
  const gestureSurface = new FakeTarget();
  const controller = createDrawerController({
    root,
    trigger,
    drawer,
    backdrop,
    eventTarget,
    gestureSurface,
  });

  gestureSurface.dispatch('pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 12, clientY: 320, isPrimary: true });
  gestureSurface.dispatch('pointerup', { pointerId: 1, pointerType: 'touch', clientX: 104, clientY: 326, isPrimary: true });

  assert.equal(controller.isOpen(), true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
});

test('a leftward swipe closes the open drawer but vertical movement does not', () => {
  const { root, trigger, drawer, backdrop, eventTarget } = createHarness();
  const gestureSurface = new FakeTarget();
  const controller = createDrawerController({ root, trigger, drawer, backdrop, eventTarget, gestureSurface });

  controller.open();
  gestureSurface.dispatch('pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 300, clientY: 300, isPrimary: true });
  gestureSurface.dispatch('pointerup', { pointerId: 2, pointerType: 'touch', clientX: 290, clientY: 390, isPrimary: true });
  assert.equal(controller.isOpen(), true);

  gestureSurface.dispatch('pointerdown', { pointerId: 3, pointerType: 'touch', clientX: 300, clientY: 300, isPrimary: true });
  gestureSurface.dispatch('pointerup', { pointerId: 3, pointerType: 'touch', clientX: 218, clientY: 306, isPrimary: true });
  assert.equal(controller.isOpen(), false);
});

test('destroy also removes mobile gesture listeners', () => {
  const { root, trigger, drawer, backdrop, eventTarget } = createHarness();
  const gestureSurface = new FakeTarget();
  const controller = createDrawerController({ root, trigger, drawer, backdrop, eventTarget, gestureSurface });

  controller.destroy();

  assert.equal(gestureSurface.listeners.get('pointerdown').size, 0);
  assert.equal(gestureSurface.listeners.get('pointerup').size, 0);
  assert.equal(gestureSurface.listeners.get('pointercancel').size, 0);
});

test('touch events also drive edge-swipe open for mobile Safari compatibility', () => {
  const { root, trigger, drawer, backdrop, eventTarget } = createHarness();
  const gestureSurface = new FakeTarget();
  const controller = createDrawerController({ root, trigger, drawer, backdrop, eventTarget, gestureSurface });

  gestureSurface.dispatch('touchstart', { changedTouches: [{ identifier: 4, clientX: 10, clientY: 420 }] });
  gestureSurface.dispatch('touchend', { changedTouches: [{ identifier: 4, clientX: 98, clientY: 426 }] });

  assert.equal(controller.isOpen(), true);
});

test('destroy removes mobile Safari touch listeners', () => {
  const { root, trigger, drawer, backdrop, eventTarget } = createHarness();
  const gestureSurface = new FakeTarget();
  const controller = createDrawerController({ root, trigger, drawer, backdrop, eventTarget, gestureSurface });

  controller.destroy();

  assert.equal(gestureSurface.listeners.get('touchstart').size, 0);
  assert.equal(gestureSurface.listeners.get('touchend').size, 0);
  assert.equal(gestureSurface.listeners.get('touchcancel').size, 0);
});
