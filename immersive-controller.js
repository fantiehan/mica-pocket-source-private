(function exposeImmersiveController(globalScope) {
  'use strict';

  function createImmersiveController({ eventTarget }) {
    if (!eventTarget) {
      throw new TypeError('Immersive controller requires an event target.');
    }

    function preventScroll(event) {
      if (event.cancelable === false) return;
      event.preventDefault();
    }

    eventTarget.addEventListener('touchmove', preventScroll, { passive: false });
    eventTarget.addEventListener('wheel', preventScroll, { passive: false });
    eventTarget.addEventListener('gesturestart', preventScroll, { passive: false });

    function destroy() {
      eventTarget.removeEventListener('touchmove', preventScroll);
      eventTarget.removeEventListener('wheel', preventScroll);
      eventTarget.removeEventListener('gesturestart', preventScroll);
    }

    return {
      destroy,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createImmersiveController };
  }

  globalScope.createImmersiveController = createImmersiveController;
})(typeof globalThis !== 'undefined' ? globalThis : window);
