(function initializeMobilePrototype(globalScope) {
  'use strict';

  function fillText(selector, value) {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  }

  function getStorage() {
    try {
      return globalScope.localStorage;
    } catch (_) {
      return null;
    }
  }

  function boot() {
    const account = globalScope.MockConfig.account;

    fillText('[data-account-name]', account.name);
    fillText('[data-account-organization]', account.organization);
    fillText('[data-account-initials]', account.initials);
    fillText('[data-account-bio]', account.bio);
    fillText('[data-account-department]', account.department);

    document.querySelectorAll('[data-account-verified]').forEach((badge) => {
      badge.hidden = !account.verified;
    });

    const root = document.querySelector('[data-testid="app-shell"]');

    globalScope.localeController = globalScope.createLocaleController({
      root: document,
      documentElement: document.documentElement,
      storage: getStorage(),
      messages: globalScope.MockConfig.messages,
      defaultLocale: globalScope.MockConfig.defaultLocale,
      storageKey: globalScope.MockConfig.localeStorageKey,
    });

    globalScope.calendarController = globalScope.createCalendarController({
      target: document.querySelector('[data-testid="calendar-day"]'),
      eventTarget: globalScope,
      documentTarget: document,
    });

    globalScope.immersiveController = globalScope.createImmersiveController({
      eventTarget: document,
    });

    globalScope.drawerController = globalScope.createDrawerController({
      root,
      trigger: document.querySelector('[data-testid="account-trigger"]'),
      drawer: document.querySelector('[data-testid="account-drawer"]'),
      backdrop: document.querySelector('[data-testid="drawer-backdrop"]'),
      eventTarget: document,
      gestureSurface: root,
    });

    globalScope.informationController = globalScope.createInformationController({
      root,
      trigger: document.querySelector('[data-testid="verified-trigger"]'),
      screen: document.querySelector('[data-testid="information-screen"]'),
      backButton: document.querySelector('[data-testid="information-back"]'),
      eventTarget: document,
      drawerController: globalScope.drawerController,
    });

    globalScope.settingsController = globalScope.createSettingsController({
      root,
      trigger: document.querySelector('[data-testid="settings-trigger"]'),
      screen: document.querySelector('[data-testid="settings-screen"]'),
      backButton: document.querySelector('[data-testid="settings-back"]'),
      eventTarget: document,
      drawerController: globalScope.drawerController,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
