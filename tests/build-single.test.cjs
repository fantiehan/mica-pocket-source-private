const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'dist', 'mica-pocket.html');
const siteDir = path.join(root, 'dist', 'site');

test('single-file build inlines all runtime assets for direct phone opening', () => {
  execFileSync('node', ['scripts/build-single.cjs'], { cwd: root, stdio: 'pipe' });

  const html = fs.readFileSync(outputPath, 'utf8');

  assert.match(html, /<style>\s*:root/);
  assert.match(html, /name="apple-mobile-web-app-capable" content="yes"/);
  assert.match(html, /rel="manifest" href="data:application\/manifest\+json,/);
  assert.match(html, /rel="apple-touch-icon" sizes="180x180" href="data:image\/png;base64,/);
  assert.match(html, /rel="icon" type="image\/png" sizes="192x192" href="data:image\/png;base64,/);
  assert.match(html, /icons%22%3A%5B/);
  assert.doesNotMatch(html, /apple-touch-icon\.png|icons\/icon-(?:192|512)\.png/);
  assert.match(html, /MockConfig/);
  assert.match(html, /function createDrawerController/);
  assert.match(html, /function createImmersiveController/);
  assert.match(html, /function createInformationController/);
  assert.match(html, /function createSettingsController/);
  assert.match(html, /function createLocaleController/);
  assert.match(html, /function createCalendarController/);
  assert.match(html, /data-testid=["']information-screen["']/);
  assert.match(html, /data-testid=["']settings-screen["']/);
  assert.match(html, /data-testid=["']calendar-day["']/);
  assert.match(html, /height:\s*100vh/);
  assert.doesNotMatch(html, /100dvh/);
  assert.doesNotMatch(html, /safe-area-inset/);
  assert.doesNotMatch(html, /black-translucent/);
  assert.doesNotMatch(html, /viewport-fit=cover/);
  assert.match(html, /document\.addEventListener\('DOMContentLoaded'/);
  assert.doesNotMatch(html, /href=["']styles\.css["']/);
  assert.doesNotMatch(html, /href=["']manifest\.webmanifest["']/);
  assert.doesNotMatch(html, /src=["'](?:config|drawer-controller|immersive-controller|information-controller|settings-controller|locale-controller|calendar-controller|app)\.js["']/);
  assert.match(html, /data-testid=["']account-drawer["']/);
});

test('hosted build keeps real HTTPS icon URLs while inlining runtime source', () => {
  execFileSync('node', ['scripts/build-single.cjs'], { cwd: root, stdio: 'pipe' });

  const html = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
  assert.match(html, /href="manifest\.webmanifest"/);
  assert.match(html, /href="apple-touch-icon\.png"/);
  assert.match(html, /href="icons\/icon-192\.png"/);
  assert.doesNotMatch(html, /href=["']styles\.css["']/);
  assert.doesNotMatch(html, /src=["'](?:config|drawer-controller|immersive-controller|information-controller|settings-controller|locale-controller|calendar-controller|app)\.js["']/);

  for (const file of ['manifest.webmanifest', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png']) {
    assert.deepEqual(
      fs.readFileSync(path.join(siteDir, file)),
      fs.readFileSync(path.join(root, file)),
      file,
    );
  }
});
