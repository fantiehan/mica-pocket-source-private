const test = require('node:test');
const assert = require('node:assert/strict');

const { createSettingsController } = require('../settings-controller.js');

class FakeClassList {
  constructor() { this.values = new Set(); }
  toggle(name, force) { if (force) this.values.add(name); else this.values.delete(name); }
  contains(name) { return this.values.has(name); }
}

class FakeTarget {
  constructor() {
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name); }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  dispatch(type, event = {}) { for (const listener of this.listeners.get(type) || []) listener({ type, ...event }); }
}

class FakeScheduler {
  constructor() { this.id = 1; this.tasks = new Map(); }
  setTimeout(callback, delay) { const id = this.id++; this.tasks.set(id, { callback, delay }); return id; }
  clearTimeout(id) { this.tasks.delete(id); }
  flush() { const tasks = [...this.tasks.values()]; this.tasks.clear(); tasks.forEach(({ callback }) => callback()); }
}

function createHarness() {
  const root = new FakeTarget();
  const trigger = new FakeTarget();
  const screen = new FakeTarget();
  const backButton = new FakeTarget();
  const eventTarget = new FakeTarget();
  const scheduler = new FakeScheduler();
  let drawerOpen = true;
  let closeCalls = 0;
  const drawerController = {
    close() { drawerOpen = false; closeCalls += 1; },
    isOpen: () => drawerOpen,
  };
  const controller = createSettingsController({
    root,
    trigger,
    screen,
    backButton,
    eventTarget,
    drawerController,
    scheduler,
    openDelay: 320,
  });
  return { root, trigger, screen, backButton, eventTarget, scheduler, drawerController, controller, closeCalls: () => closeCalls };
}

test('Settings click closes the drawer and opens the page after 320ms', () => {
  const { root, trigger, screen, scheduler, drawerController, controller, closeCalls } = createHarness();

  trigger.dispatch('click');

  assert.equal(closeCalls(), 1);
  assert.equal(drawerController.isOpen(), false);
  assert.equal(controller.isPending(), true);
  assert.equal(root.classList.contains('is-settings-open'), false);
  assert.equal(screen.getAttribute('aria-hidden'), 'true');
  assert.deepEqual([...scheduler.tasks.values()].map(({ delay }) => delay), [320]);

  scheduler.flush();

  assert.equal(controller.isOpen(), true);
  assert.equal(controller.isPending(), false);
  assert.equal(root.classList.contains('is-settings-open'), true);
  assert.equal(screen.getAttribute('aria-hidden'), 'false');
});

test('duplicate Settings clicks queue only one navigation', () => {
  const { trigger, scheduler, closeCalls, controller } = createHarness();
  trigger.dispatch('click');
  trigger.dispatch('click');
  assert.equal(closeCalls(), 1);
  assert.equal(scheduler.tasks.size, 1);
  scheduler.flush();
  trigger.dispatch('click');
  assert.equal(controller.isOpen(), true);
  assert.equal(closeCalls(), 1);
});

test('back and Escape return to chat without reopening the drawer', () => {
  const { root, trigger, backButton, eventTarget, scheduler, drawerController, controller } = createHarness();
  trigger.dispatch('click');
  scheduler.flush();
  backButton.dispatch('click');
  assert.equal(controller.isOpen(), false);
  assert.equal(root.classList.contains('is-settings-open'), false);
  assert.equal(drawerController.isOpen(), false);

  trigger.dispatch('click');
  scheduler.flush();
  eventTarget.dispatch('keydown', { key: 'Escape' });
  assert.equal(controller.isOpen(), false);
  assert.equal(drawerController.isOpen(), false);
});

test('destroy removes Settings listeners and cancels pending navigation', () => {
  const { trigger, backButton, eventTarget, scheduler, controller } = createHarness();
  trigger.dispatch('click');
  controller.destroy();
  scheduler.flush();
  trigger.dispatch('click');
  assert.equal(controller.isOpen(), false);
  assert.equal(controller.isPending(), false);
  assert.equal(trigger.listeners.get('click').size, 0);
  assert.equal(backButton.listeners.get('click').size, 0);
  assert.equal(eventTarget.listeners.get('keydown').size, 0);
});
