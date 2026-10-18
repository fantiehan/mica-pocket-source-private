# Localization Settings Design

## Goal

Add an English/Simplified Chinese language selector inside a Settings page, persist the choice, translate all application chrome shown in `ref-zh.mp4`, and make the calendar icon show the device's current local day.

## Architecture

- `settings-controller.js` owns only Settings page navigation. It closes the drawer, waits for the drawer transition, opens the page, and returns to chat without reopening the drawer.
- `locale-controller.js` owns locale validation, persistence under `mica-pocket.locale`, `document.documentElement.lang`, translated text/ARIA attributes, and selected-language state.
- `calendar-controller.js` owns current-day rendering. It updates on boot, focus, pageshow, visibility change, and at the next local midnight.
- Static UI text uses `data-i18n` keys. Business data such as account name, organization, department, conversation titles, message previews, and URLs remain unchanged.

## User Flow

1. Open the account drawer.
2. Tap Settings / 设置.
3. The drawer closes; after 320 ms the Settings page slides in from the right.
4. Choose English or 简体中文. The current page and application chrome update immediately.
5. The selected locale is persisted and restored on the next launch.
6. Back returns to the chat page and leaves the drawer closed.

## Translation Scope

Translate filters, bottom navigation, drawer actions, Verified, SOS label, Information labels, Settings labels, and relevant UI tags. Do not translate account identity or conversation content.

## Calendar Behavior

The calendar glyph displays `new Date().getDate()` using local time. It refreshes when the app becomes active and schedules a refresh for the next local midnight.

## Error Handling

Unavailable or invalid stored locales fall back to English. Storage read/write errors do not prevent rendering. Timers and event listeners are removed by `destroy()`.

## Verification

Unit tests cover navigation, locale persistence/application, invalid storage fallback, date refresh, midnight scheduling, duplicate navigation, Escape, and cleanup. Browser verification covers both language states, persisted reload, current date, Settings return behavior, and viewport invariants.
