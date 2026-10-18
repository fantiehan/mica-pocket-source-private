(function exposeDrawerController(globalScope) {
  'use strict';

  function createDrawerController({ root, trigger, drawer, backdrop, eventTarget, gestureSurface }) {
    if (!root || !trigger || !drawer || !backdrop || !eventTarget) {
      throw new TypeError('Drawer controller requires root, trigger, drawer, backdrop, and eventTarget.');
    }

    let opened = false;
    let gestureStart = null;

    function sync() {
      root.classList.toggle('is-drawer-open', opened);
      trigger.setAttribute('aria-expanded', String(opened));
      drawer.setAttribute('aria-hidden', String(!opened));
      backdrop.setAttribute('aria-hidden', String(!opened));
    }

    function open() {
      opened = true;
      sync();
    }

    function close() {
      opened = false;
      sync();
    }

    function toggle() {
      opened ? close() : open();
    }

    function onKeydown(event) {
      if (event.key === 'Escape' && opened) close();
    }

    function beginGesture(id, clientX, clientY) {
      if (!opened && clientX > 28) return;
      gestureStart = { id, x: clientX, y: clientY };
    }

    function finishGesture(id, clientX, clientY) {
      if (!gestureStart || id !== gestureStart.id) return;
      const deltaX = clientX - gestureStart.x;
      const deltaY = clientY - gestureStart.y;
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
      gestureStart = null;

      if (!isHorizontal || Math.abs(deltaX) < 56) return;
      if (!opened && deltaX > 0) open();
      else if (opened && deltaX < 0) close();
    }

    function cancelGesture() {
      gestureStart = null;
    }

    function onPointerDown(event) {
      if (event.isPrimary === false || (event.pointerType && event.pointerType !== 'touch' && event.pointerType !== 'pen')) return;
      beginGesture(event.pointerId, event.clientX, event.clientY);
    }

    function onPointerUp(event) {
      finishGesture(event.pointerId, event.clientX, event.clientY);
    }

    function onTouchStart(event) {
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) return;
      beginGesture(touch.identifier, touch.clientX, touch.clientY);
    }

    function onTouchEnd(event) {
      if (!gestureStart || !event.changedTouches) return;
      const touch = Array.from(event.changedTouches).find((item) => item.identifier === gestureStart.id);
      if (!touch) return;
      finishGesture(touch.identifier, touch.clientX, touch.clientY);
    }

    function destroy() {
      trigger.removeEventListener('click', toggle);
      backdrop.removeEventListener('click', close);
      eventTarget.removeEventListener('keydown', onKeydown);
      if (gestureSurface) {
        gestureSurface.removeEventListener('pointerdown', onPointerDown);
        gestureSurface.removeEventListener('pointerup', onPointerUp);
        gestureSurface.removeEventListener('pointercancel', cancelGesture);
        gestureSurface.removeEventListener('touchstart', onTouchStart);
        gestureSurface.removeEventListener('touchend', onTouchEnd);
        gestureSurface.removeEventListener('touchcancel', cancelGesture);
      }
    }

    trigger.addEventListener('click', toggle);
    backdrop.addEventListener('click', close);
    eventTarget.addEventListener('keydown', onKeydown);
    if (gestureSurface) {
      gestureSurface.addEventListener('pointerdown', onPointerDown);
      gestureSurface.addEventListener('pointerup', onPointerUp);
      gestureSurface.addEventListener('pointercancel', cancelGesture);
      gestureSurface.addEventListener('touchstart', onTouchStart, { passive: true });
      gestureSurface.addEventListener('touchend', onTouchEnd, { passive: true });
      gestureSurface.addEventListener('touchcancel', cancelGesture, { passive: true });
    }
    sync();

    return {
      open,
      close,
      toggle,
      isOpen: () => opened,
      destroy,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createDrawerController };
  }

  globalScope.createDrawerController = createDrawerController;
})(typeof globalThis !== 'undefined' ? globalThis : window);
