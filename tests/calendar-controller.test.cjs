const test = require('node:test');
const assert = require('node:assert/strict');

const { createCalendarController } = require('../calendar-controller.js');

class FakeTarget {
  constructor(extra = {}) { this.listeners = new Map(); this.textContent = ''; Object.assign(this, extra); }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  dispatch(type) { for (const listener of this.listeners.get(type) || []) listener({ type }); }
}

class FakeScheduler {
  constructor() { this.id = 1; this.tasks = new Map(); }
  setTimeout(callback, delay) { const id = this.id++; this.tasks.set(id, { callback, delay }); return id; }
  clearTimeout(id) { this.tasks.delete(id); }
  runNext() {
    const first = this.tasks.entries().next().value;
    if (!first) return;
    const [id, task] = first;
    this.tasks.delete(id);
    task.callback();
  }
}

function createHarness(initialDate) {
  let now = new Date(initialDate);
  const target = new FakeTarget();
  const eventTarget = new FakeTarget();
  const documentTarget = new FakeTarget({ visibilityState: 'visible' });
  const scheduler = new FakeScheduler();
  const controller = createCalendarController({
    target,
    eventTarget,
    documentTarget,
    scheduler,
    clock: () => new Date(now),
  });
  return { target, eventTarget, documentTarget, scheduler, controller, setNow: (value) => { now = new Date(value); } };
}

test('calendar shows the current local day and schedules the next local midnight', () => {
  const { target, scheduler } = createHarness('2026-10-18T23:59:50');

  assert.equal(target.textContent, '18');
  assert.equal(scheduler.tasks.size, 1);
  assert.equal([...scheduler.tasks.values()][0].delay, 10_000);
});

test('focus, pageshow, and visible visibilitychange refresh the date', () => {
  const { target, eventTarget, documentTarget, setNow } = createHarness('2026-10-18T12:00:00');

  setNow('2026-10-19T08:00:00');
  eventTarget.dispatch('focus');
  assert.equal(target.textContent, '19');

  setNow('2026-10-20T08:00:00');
  eventTarget.dispatch('pageshow');
  assert.equal(target.textContent, '20');

  setNow('2026-10-21T08:00:00');
  documentTarget.visibilityState = 'hidden';
  documentTarget.dispatch('visibilitychange');
  assert.equal(target.textContent, '20');
  documentTarget.visibilityState = 'visible';
  documentTarget.dispatch('visibilitychange');
  assert.equal(target.textContent, '21');
});

test('midnight timer updates the day and schedules the following midnight', () => {
  const { target, scheduler, setNow } = createHarness('2026-10-18T23:59:50');

  setNow('2026-10-19T00:00:00');
  scheduler.runNext();

  assert.equal(target.textContent, '19');
  assert.equal(scheduler.tasks.size, 1);
  assert.equal([...scheduler.tasks.values()][0].delay, 86_400_000);
});

test('destroy removes lifecycle listeners and the midnight timer', () => {
  const { eventTarget, documentTarget, scheduler, controller } = createHarness('2026-10-18T12:00:00');

  controller.destroy();

  assert.equal(scheduler.tasks.size, 0);
  assert.equal(eventTarget.listeners.get('focus').size, 0);
  assert.equal(eventTarget.listeners.get('pageshow').size, 0);
  assert.equal(documentTarget.listeners.get('visibilitychange').size, 0);
});
