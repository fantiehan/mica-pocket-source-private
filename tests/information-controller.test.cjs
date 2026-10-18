const test = require('node:test');
const assert = require('node:assert/strict');

const { createInformationController } = require('../information-controller.js');

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
    for (const listener of this.listeners.get(type) || []) listener({ type, ...event });
  }
}

class FakeScheduler {
  constructor() {
    this.nextId = 1;
    this.tasks = new Map();
  }

  setTimeout(callback, delay) {
    const id = this.nextId++;
    this.tasks.set(id, { callback, delay });
    return id;
  }

  clearTimeout(id) {
    this.tasks.delete(id);
  }

  flush() {
    const tasks = [...this.tasks.values()];
    this.tasks.clear();
    tasks.forEach(({ callback }) => callback());
  }
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
    close() {
      closeCalls += 1;
      drawerOpen = false;
    },
    isOpen: () => drawerOpen,
  };
  const controller = createInformationController({
    root,
    trigger,
    screen,
    backButton,
    eventTarget,
    drawerController,
    scheduler,
    openDelay: 320,
  });

  return {
    root,
    trigger,
    screen,
    backButton,
    eventTarget,
    scheduler,
    drawerController,
    controller,
    closeCalls: () => closeCalls,
  };
}

test('Verified click closes the drawer before opening Information after the transition delay', () => {
  const { root, trigger, screen, scheduler, drawerController, controller, closeCalls } = createHarness();

  trigger.dispatch('click');

  assert.equal(closeCalls(), 1);
  assert.equal(drawerController.isOpen(), false);
  assert.equal(controller.isPending(), true);
  assert.equal(controller.isOpen(), false);
  assert.equal(root.classList.contains('is-information-open'), false);
  assert.equal(screen.getAttribute('aria-hidden'), 'true');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.deepEqual([...scheduler.tasks.values()].map(({ delay }) => delay), [320]);

  scheduler.flush();

  assert.equal(controller.isPending(), false);
  assert.equal(controller.isOpen(), true);
  assert.equal(root.classList.contains('is-information-open'), true);
  assert.equal(screen.getAttribute('aria-hidden'), 'false');
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
});

test('duplicate Verified clicks cannot queue duplicate Information openings', () => {
  const { trigger, scheduler, controller, closeCalls } = createHarness();

  trigger.dispatch('click');
  trigger.dispatch('click');

  assert.equal(closeCalls(), 1);
  assert.equal(scheduler.tasks.size, 1);
  scheduler.flush();
  trigger.dispatch('click');

  assert.equal(controller.isOpen(), true);
  assert.equal(closeCalls(), 1);
  assert.equal(scheduler.tasks.size, 0);
});

test('back closes Information and leaves the account drawer closed', () => {
  const { root, trigger, screen, backButton, scheduler, drawerController, controller } = createHarness();

  trigger.dispatch('click');
  scheduler.flush();
  backButton.dispatch('click');

  assert.equal(controller.isOpen(), false);
  assert.equal(controller.isPending(), false);
  assert.equal(root.classList.contains('is-information-open'), false);
  assert.equal(screen.getAttribute('aria-hidden'), 'true');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(drawerController.isOpen(), false);
});

test('Escape cancels a pending opening and closes an open Information page', () => {
  const { trigger, eventTarget, scheduler, controller } = createHarness();

  trigger.dispatch('click');
  eventTarget.dispatch('keydown', { key: 'Escape' });
  scheduler.flush();
  assert.equal(controller.isOpen(), false);
  assert.equal(controller.isPending(), false);

  trigger.dispatch('click');
  scheduler.flush();
  eventTarget.dispatch('keydown', { key: 'Escape' });
  assert.equal(controller.isOpen(), false);
});

test('destroy removes listeners and cancels a pending opening', () => {
  const { trigger, backButton, eventTarget, scheduler, controller } = createHarness();

  trigger.dispatch('click');
  controller.destroy();
  scheduler.flush();
  trigger.dispatch('click');
  backButton.dispatch('click');
  eventTarget.dispatch('keydown', { key: 'Escape' });

  assert.equal(controller.isOpen(), false);
  assert.equal(controller.isPending(), false);
  assert.equal(trigger.listeners.get('click').size, 0);
  assert.equal(backButton.listeners.get('click').size, 0);
  assert.equal(eventTarget.listeners.get('keydown').size, 0);
});
