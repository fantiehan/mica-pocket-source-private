const test = require('node:test');
const assert = require('node:assert/strict');

const { createLocaleController } = require('../locale-controller.js');

class FakeTarget {
  constructor(attributes = {}) {
    this.attributes = new Map(Object.entries(attributes));
    this.listeners = new Map();
    this.textContent = '';
    this.classList = {
      values: new Set(),
      toggle: (name, force) => force ? this.classList.values.add(name) : this.classList.values.delete(name),
      contains: (name) => this.classList.values.has(name),
    };
  }

  getAttribute(name) { return this.attributes.get(name); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  dispatch(type) {
    for (const listener of this.listeners.get(type) || []) listener({ type, currentTarget: this });
  }
}

class FakeRoot {
  constructor({ textNodes, ariaNodes, options }) {
    this.textNodes = textNodes;
    this.ariaNodes = ariaNodes;
    this.options = options;
  }

  querySelectorAll(selector) {
    if (selector === '[data-i18n]') return this.textNodes;
    if (selector === '[data-i18n-aria-label]') return this.ariaNodes;
    if (selector === '[data-locale-option]') return this.options;
    return [];
  }
}

class FakeStorage {
  constructor(value = null, throws = false) {
    this.value = value;
    this.throws = throws;
    this.writes = [];
  }
  getItem() {
    if (this.throws) throw new Error('storage unavailable');
    return this.value;
  }
  setItem(key, value) {
    if (this.throws) throw new Error('storage unavailable');
    this.value = value;
    this.writes.push([key, value]);
  }
}

const messages = {
  en: { languageName: 'English', greeting: 'Settings', back: 'Back' },
  'zh-CN': { languageName: '简体中文', greeting: '设置', back: '返回' },
};

function createHarness(stored = null, throws = false) {
  const text = new FakeTarget({ 'data-i18n': 'greeting' });
  const aria = new FakeTarget({ 'data-i18n-aria-label': 'back' });
  const english = new FakeTarget({ 'data-locale-option': 'en' });
  const chinese = new FakeTarget({ 'data-locale-option': 'zh-CN' });
  const root = new FakeRoot({ textNodes: [text], ariaNodes: [aria], options: [english, chinese] });
  const documentElement = new FakeTarget();
  const storage = new FakeStorage(stored, throws);
  const controller = createLocaleController({ root, documentElement, storage, messages });
  return { text, aria, english, chinese, documentElement, storage, controller };
}

test('locale controller defaults to English and synchronizes translated text and option state', () => {
  const { text, aria, english, chinese, documentElement, controller } = createHarness();

  assert.equal(controller.getLocale(), 'en');
  assert.equal(text.textContent, 'Settings');
  assert.equal(aria.getAttribute('aria-label'), 'Back');
  assert.equal(documentElement.getAttribute('lang'), 'en');
  assert.equal(english.getAttribute('aria-checked'), 'true');
  assert.equal(chinese.getAttribute('aria-checked'), 'false');
  assert.equal(english.classList.contains('is-selected'), true);
});

test('selecting Simplified Chinese applies it immediately and persists it', () => {
  const { text, aria, english, chinese, documentElement, storage, controller } = createHarness();

  chinese.dispatch('click');

  assert.equal(controller.getLocale(), 'zh-CN');
  assert.equal(text.textContent, '设置');
  assert.equal(aria.getAttribute('aria-label'), '返回');
  assert.equal(documentElement.getAttribute('lang'), 'zh-CN');
  assert.equal(english.getAttribute('aria-checked'), 'false');
  assert.equal(chinese.getAttribute('aria-checked'), 'true');
  assert.deepEqual(storage.writes, [['mica-pocket.locale', 'zh-CN']]);
});

test('stored Simplified Chinese is restored while invalid or unavailable storage falls back to English', () => {
  assert.equal(createHarness('zh-CN').controller.getLocale(), 'zh-CN');
  assert.equal(createHarness('invalid').controller.getLocale(), 'en');
  assert.equal(createHarness(null, true).controller.getLocale(), 'en');
});

test('destroy removes language option listeners', () => {
  const { english, chinese, controller } = createHarness();

  controller.destroy();
  chinese.dispatch('click');

  assert.equal(controller.getLocale(), 'en');
  assert.equal(english.listeners.get('click').size, 0);
  assert.equal(chinese.listeners.get('click').size, 0);
});
