(function exposeInformationController(globalScope) {
  'use strict';

  function createInformationController({
    root,
    trigger,
    screen,
    backButton,
    eventTarget,
    drawerController,
    openDelay = 320,
    scheduler = globalScope,
  }) {
    if (!root || !trigger || !screen || !backButton || !eventTarget || !drawerController) {
      throw new TypeError('Information controller requires root, trigger, screen, backButton, eventTarget, and drawerController.');
    }
    if (!scheduler || typeof scheduler.setTimeout !== 'function' || typeof scheduler.clearTimeout !== 'function') {
      throw new TypeError('Information controller requires a timer scheduler.');
    }

    let opened = false;
    let pending = false;
    let openTimer = null;

    function sync() {
      root.classList.toggle('is-information-open', opened);
      trigger.setAttribute('aria-expanded', String(opened));
      screen.setAttribute('aria-hidden', String(!opened));
    }

    function open() {
      if (opened || pending) return;
      pending = true;
      drawerController.close();
      openTimer = scheduler.setTimeout(() => {
        openTimer = null;
        pending = false;
        opened = true;
        sync();
      }, openDelay);
    }

    function close() {
      if (openTimer !== null) {
        scheduler.clearTimeout(openTimer);
        openTimer = null;
      }
      pending = false;
      opened = false;
      sync();
    }

    function onKeydown(event) {
      if (event.key === 'Escape' && (opened || pending)) close();
    }

    function destroy() {
      trigger.removeEventListener('click', open);
      backButton.removeEventListener('click', close);
      eventTarget.removeEventListener('keydown', onKeydown);
      close();
    }

    trigger.addEventListener('click', open);
    backButton.addEventListener('click', close);
    eventTarget.addEventListener('keydown', onKeydown);
    sync();

    return {
      open,
      close,
      isOpen: () => opened,
      isPending: () => pending,
      destroy,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createInformationController };
  }

  globalScope.createInformationController = createInformationController;
})(typeof globalThis !== 'undefined' ? globalThis : window);
