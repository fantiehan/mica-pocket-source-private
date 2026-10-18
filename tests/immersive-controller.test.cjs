const test = require('node:test');
const assert = require('node:assert/strict');

const { createImmersiveController } = require('../immersive-controller.js');

class FakeTarget {
  constructor(extra = {}) {
    this.listeners = new Map();
    this.attributes = new Map();
    Object.assign(this, extra);
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

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }
}

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

function createStyle() {
  const values = new Map();
  return {
    values,
    setProperty(name, value) {
      values.set(name, value);
    },
  };
}

test('immersive controller leaves full-screen sizing entirely to CSS', () => {
  const style = createStyle();
  const visualViewport = new FakeTarget({ height: 812 });
  const root = new FakeTarget({ ownerDocument: {} });
  const win = new FakeTarget({ innerHeight: 700 });
  const eventTarget = new FakeTarget({ defaultView: win });

  createImmersiveController({ root, eventTarget, documentElement: { style }, visualViewport });

  assert.equal(style.values.has('--app-height'), false);
  assert.equal(visualViewport.listeners.has('resize'), false);
  assert.equal(win.listeners.has('resize'), false);
  assert.equal(win.listeners.has('orientationchange'), false);
});

test('immersive controller blocks document scrolling without requesting fullscreen', () => {
  const style = createStyle();
  const eventTarget = new FakeTarget({ defaultView: new FakeTarget({ innerHeight: 700 }) });
  const ownerDocument = {};
  let fullscreenCalls = 0;
  const root = new FakeTarget({
    ownerDocument,
    requestFullscreen() {
      fullscreenCalls += 1;
      throw new Error('fullscreen should not be requested');
    },
  });

  const controller = createImmersiveController({
    root,
    eventTarget,
    documentElement: { style },
    visualViewport: new FakeTarget({ height: 812 }),
  });

  let prevented = false;
  eventTarget.dispatch('touchmove', { preventDefault: () => { prevented = true; } });
  eventTarget.dispatch('pointerdown');

  assert.equal(prevented, true);
  assert.equal(fullscreenCalls, 0);

  controller.destroy();
  assert.equal(eventTarget.listeners.get('touchmove').size, 0);
});
