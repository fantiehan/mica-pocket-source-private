(function exposeCalendarController(globalScope) {
  'use strict';

  function createCalendarController({
    target,
    eventTarget,
    documentTarget,
    clock = () => new Date(),
    scheduler = globalScope,
  }) {
    if (!target || !eventTarget || !documentTarget) {
      throw new TypeError('Calendar controller requires target, eventTarget, and documentTarget.');
    }
    if (!scheduler || typeof scheduler.setTimeout !== 'function' || typeof scheduler.clearTimeout !== 'function') {
      throw new TypeError('Calendar controller requires a timer scheduler.');
    }

    let midnightTimer = null;

    function scheduleMidnight(now) {
      if (midnightTimer !== null) scheduler.clearTimeout(midnightTimer);
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const delay = Math.max(1, nextMidnight.getTime() - now.getTime());
      midnightTimer = scheduler.setTimeout(refresh, delay);
    }

    function refresh() {
      const now = clock();
      target.textContent = String(now.getDate());
      scheduleMidnight(now);
    }

    function onVisibilityChange() {
      if (documentTarget.visibilityState !== 'hidden') refresh();
    }

    function destroy() {
      if (midnightTimer !== null) {
        scheduler.clearTimeout(midnightTimer);
        midnightTimer = null;
      }
      eventTarget.removeEventListener('focus', refresh);
      eventTarget.removeEventListener('pageshow', refresh);
      documentTarget.removeEventListener('visibilitychange', onVisibilityChange);
    }

    eventTarget.addEventListener('focus', refresh);
    eventTarget.addEventListener('pageshow', refresh);
    documentTarget.addEventListener('visibilitychange', onVisibilityChange);
    refresh();

    return { refresh, destroy };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createCalendarController };
  }

  globalScope.createCalendarController = createCalendarController;
})(typeof globalThis !== 'undefined' ? globalThis : window);
