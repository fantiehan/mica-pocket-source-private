(function exposeLocaleController(globalScope) {
  'use strict';

  function createLocaleController({
    root,
    documentElement,
    storage,
    messages,
    defaultLocale = 'zh-CN',
    storageKey = 'mica-pocket.locale',
  }) {
    if (!root || !documentElement || !messages || !messages[defaultLocale]) {
      throw new TypeError('Locale controller requires root, documentElement, and a valid messages map.');
    }

    const textNodes = Array.from(root.querySelectorAll('[data-i18n]'));
    const ariaNodes = Array.from(root.querySelectorAll('[data-i18n-aria-label]'));
    const options = Array.from(root.querySelectorAll('[data-locale-option]'));
    let locale = defaultLocale;

    function isSupported(value) {
      return typeof value === 'string' && Object.prototype.hasOwnProperty.call(messages, value);
    }

    function translate(key) {
      return messages[locale][key] ?? messages[defaultLocale][key] ?? key;
    }

    function apply() {
      documentElement.setAttribute('lang', locale);
      textNodes.forEach((node) => {
        node.textContent = translate(node.getAttribute('data-i18n'));
      });
      ariaNodes.forEach((node) => {
        node.setAttribute('aria-label', translate(node.getAttribute('data-i18n-aria-label')));
      });
      options.forEach((option) => {
        const selected = option.getAttribute('data-locale-option') === locale;
        option.setAttribute('aria-checked', String(selected));
        option.classList.toggle('is-selected', selected);
      });
    }

    function persist() {
      if (!storage || typeof storage.setItem !== 'function') return;
      try {
        storage.setItem(storageKey, locale);
      } catch (_) {
        // Private browsing and embedded web views may reject storage writes.
      }
    }

    function setLocale(nextLocale, { save = true } = {}) {
      if (!isSupported(nextLocale)) nextLocale = defaultLocale;
      locale = nextLocale;
      apply();
      if (save) persist();
    }

    function onOptionClick(event) {
      setLocale(event.currentTarget.getAttribute('data-locale-option'));
    }

    if (storage && typeof storage.getItem === 'function') {
      try {
        const stored = storage.getItem(storageKey);
        if (isSupported(stored)) locale = stored;
      } catch (_) {
        locale = defaultLocale;
      }
    }

    options.forEach((option) => option.addEventListener('click', onOptionClick));
    apply();

    function destroy() {
      options.forEach((option) => option.removeEventListener('click', onOptionClick));
    }

    return {
      getLocale: () => locale,
      setLocale,
      translate,
      destroy,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createLocaleController };
  }

  globalScope.createLocaleController = createLocaleController;
})(typeof globalThis !== 'undefined' ? globalThis : window);
