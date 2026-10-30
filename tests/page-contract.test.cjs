const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('page exposes the chat, trigger, backdrop, drawer, account rail, and main panel', () => {
  const html = read('index.html');
  for (const testId of [
    'chat-screen',
    'account-trigger',
    'drawer-backdrop',
    'account-drawer',
    'account-rail',
    'drawer-panel',
    'verified-badge',
    'verified-trigger',
    'information-screen',
    'information-back',
  ]) {
    assert.match(html, new RegExp(`data-testid=["']${testId}["']`));
  }
  assert.match(html, /data-account-name/);
  assert.match(html, /data-account-organization/);
  assert.match(html, /data-account-verified/);
  assert.match(html, /data-account-bio/);
  assert.match(html, /data-account-department/);
});

test('page uses measured drawer geometry and motion from the reference video', () => {
  const css = read('styles.css');
  assert.match(css, /--rail-width:\s*97px/);
  assert.match(css, /--panel-width:\s*281px/);
  assert.match(css, /--drawer-duration:\s*320ms/);
  assert.match(css, /animation-delay:\s*700ms/);
  assert.match(css, /@keyframes\s+verified-reveal/);
  assert.match(css, /cubic-bezier\(\.22,\s*1,\s*\.36,\s*1\)/);
});

test('application binds centralized account data and initializes the controller', () => {
  const app = read('app.js');
  assert.match(app, /MockConfig\.account/);
  assert.match(app, /\[data-account-name\]/);
  assert.match(app, /\[data-account-organization\]/);
  assert.match(app, /\[data-account-initials\]/);
  assert.match(app, /createDrawerController/);
  assert.match(app, /createInformationController/);
});

test('Verified is a button that opens a semantic Information page with centralized profile fields', () => {
  const html = read('index.html');
  const config = read('config.js');

  assert.match(html, /<button[^>]*class="verified-badge drawer-verified-badge"[^>]*data-testid="verified-trigger"/);
  assert.match(html, /<section[^>]*class="information-screen"[^>]*data-testid="information-screen"[^>]*aria-hidden="true"/);
  assert.match(html, /data-testid="information-back"/);
  for (const label of ['个人信息', '头像', '姓名', '我的二维码', '我的勋章', '个性签名', '企业', '所属部门']) {
    assert.match(html, new RegExp(label));
  }
  assert.match(config, /bio:\s*'https:\/\/magic\.solutionsuite\.cn\/r\?k=img_v3_02e1\.\.\.'/);
  assert.match(config, /department:\s*'TikTok-Data-Live'/);
});

test('Information follows the reference page transition and delayed verification reveal', () => {
  const css = read('styles.css');

  assert.match(css, /--information-duration:\s*320ms/);
  assert.match(css, /\.information-screen\s*\{[^}]*position:\s*absolute[^}]*height:\s*100vh[^}]*transform:\s*translate3d\(100%,\s*0,\s*0\)[^}]*transition:\s*transform\s+var\(--information-duration\)\s+var\(--drawer-ease\)/s);
  assert.match(css, /\.is-information-open\s+\.information-screen\s*\{[^}]*transform:\s*translate3d\(0,\s*0,\s*0\)[^}]*pointer-events:\s*auto/s);
  assert.match(css, /\.is-information-open\s+\.chat-screen\s*\{[^}]*transform:\s*translate3d\(-28%,\s*0,\s*0\)/s);
  assert.match(css, /\.is-information-open\s+\.information-verified-badge:not\(\[hidden\]\)\s*\{[^}]*animation-name:\s*information-verified-reveal[^}]*animation-delay:\s*700ms/s);
  assert.match(css, /@keyframes\s+information-verified-reveal/);
});

test('mobile delivery uses a clean viewport chain, touch gestures, and a LAN server entry point', () => {
  const html = read('index.html');
  const css = read('styles.css');
  const app = read('app.js');
  const pkg = JSON.parse(read('package.json'));
  const server = read('serve.py');

  assert.doesNotMatch(html, /viewport-fit=cover/);
  assert.doesNotMatch(css, /100dvh/);
  assert.match(css, /100vh/);
  assert.doesNotMatch(css, /safe-area-inset/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(app, /gestureSurface:\s*root/);
  assert.equal(pkg.scripts.serve, 'python3 serve.py');
  assert.match(server, /ThreadingHTTPServer/);
  assert.match(server, /0\.0\.0\.0/);
});

test('page lets iOS own the status area instead of drawing or offsetting it manually', () => {
  const html = read('index.html');
  const css = read('styles.css');

  assert.doesNotMatch(html, /class=["'][^"']*(status-bar|dynamic-island|status-indicators|cellular|battery)/);
  assert.doesNotMatch(css, /\.status-bar|\.dynamic-island|\.status-indicators|\.cellular|\.battery/);
  assert.doesNotMatch(css, /--device-top-offset|safe-area-inset-top/);
  assert.match(css, /--header-account-top:\s*22px/);
});

test('ByteDance rail logo is upright and centered instead of skewed', () => {
  const css = read('styles.css');

  assert.match(css, /\.rail-app--byte\s*\{/);
  assert.match(css, /\.rail-app--byte i\s*\{/);
  assert.match(css, /\.rail-app--byte\s*\{[^}]*align-items:\s*center/s);
  assert.doesNotMatch(css, /\.rail-app--byte i\s*\{[^}]*skewY/s);
});

test('open drawer shifts the chat surface so the right peek is filled with conversation content', () => {
  const css = read('styles.css');

  assert.match(css, /\.chat-screen\s*\{[^}]*transition:\s*transform\s+var\(--drawer-duration\)\s+var\(--drawer-ease\)/s);
  assert.match(css, /\.is-drawer-open\s+\.chat-screen\s*\{[^}]*transform:\s*translate3d\(var\(--drawer-width\),\s*0,\s*0\)/s);
});

test('account rail does not include the personal Feishu account', () => {
  const html = read('index.html');
  const css = read('styles.css');

  assert.doesNotMatch(html, /Feishu Perso/);
  assert.doesNotMatch(html, /rail-app--feishu/);
  assert.doesNotMatch(css, /rail-app--feishu/);
});

test('package exposes a single-file build command for direct phone opening', () => {
  const pkg = JSON.parse(read('package.json'));

  assert.equal(pkg.scripts['build:single'], 'node scripts/build-single.cjs');
});

test('public-facing app identity uses the random Mica Pocket name', () => {
  const html = read('index.html');
  const manifest = JSON.parse(read('manifest.webmanifest'));
  const pkg = JSON.parse(read('package.json'));
  const readme = read('README.md');

  assert.match(html, /<title>Mica Pocket<\/title>/);
  assert.match(html, /name="apple-mobile-web-app-title" content="Mica Pocket"/);
  assert.equal(manifest.name, 'Mica Pocket');
  assert.equal(manifest.short_name, 'Mica Pocket');
  assert.equal(pkg.name, 'mica-pocket-demo');

  for (const publicText of [html, JSON.stringify(manifest), pkg.description, readme]) {
    assert.doesNotMatch(publicText, /Feishu|飞书|Lark/i);
  }
});

test('iPhone standalone layout has one clean 100vh height chain without fixed body or safe-area math', () => {
  const css = read('styles.css');

  assert.doesNotMatch(css, /--app-height/);
  assert.doesNotMatch(css, /100dvh/);
  assert.doesNotMatch(css, /safe-area-inset/);
  assert.match(css, /html,\s*\nbody\s*\{[^}]*background:\s*var\(--bg\)/s);
  assert.doesNotMatch(css, /html,\s*\nbody\s*\{[^}]*position:\s*fixed/s);
  assert.doesNotMatch(css, /html,\s*\nbody\s*\{[^}]*inset:\s*0/s);
  assert.match(css, /html,\s*\nbody\s*\{[^}]*height:\s*100vh/s);
  assert.match(css, /html,\s*\nbody\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /html,\s*\nbody\s*\{[^}]*overscroll-behavior:\s*none/s);
  assert.match(css, /\.app-shell\s*\{[^}]*height:\s*100vh/s);
  assert.match(css, /\.chat-screen\s*\{[^}]*height:\s*100vh/s);
  assert.doesNotMatch(css, /min-height:\s*540px/);
});

test('bottom tab bar follows the same 100vh shell without adding safe-area height', () => {
  const html = read('index.html');
  const css = read('styles.css');

  assert.match(html, /class="bottom-nav/);
  assert.match(css, /--bottom-nav-height:\s*72px/);
  assert.doesNotMatch(css, /--bottom-bleed/);
  assert.match(css, /\.conversation-list\s*\{[^}]*bottom:\s*var\(--bottom-nav-height\)/s);
  assert.match(css, /\.bottom-nav\s*\{[^}]*position:\s*absolute/s);
  assert.doesNotMatch(css, /\.bottom-nav\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /\.bottom-nav\s*\{[^}]*bottom:\s*0/s);
  assert.match(css, /\.bottom-nav\s*\{[^}]*height:\s*var\(--bottom-nav-height\)/s);
  assert.match(css, /\.bottom-nav\s*\{[^}]*padding-bottom:\s*6px/s);
  assert.match(css, /\.bottom-nav\s*\{[^}]*background:\s*var\(--bg\)/s);
});

test('page initializes viewport lock controller without showing a fullscreen button', () => {
  const html = read('index.html');
  const app = read('app.js');
  const css = read('styles.css');
  const pkg = JSON.parse(read('package.json'));

  assert.doesNotMatch(html, /data-testid="fullscreen-button"/);
  assert.match(html, /<script src="immersive-controller\.js" defer><\/script>/);
  assert.doesNotMatch(css, /\.fullscreen-button/);
  assert.match(app, /createImmersiveController/);
  assert.doesNotMatch(app, /fullscreenButton/);
  assert.equal(pkg.scripts['open:edge'], 'node scripts/open-edge-fullscreen.cjs');
});

test('page opts out of search indexing for public demo hosting', () => {
  const html = read('index.html');

  assert.match(html, /name="robots" content="noindex,nofollow"/);
});

test('page declares standalone mobile web app metadata to avoid browser chrome after home-screen install', () => {
  const html = read('index.html');
  const manifest = JSON.parse(read('manifest.webmanifest'));

  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /name="mobile-web-app-capable" content="yes"/);
  assert.match(html, /name="apple-mobile-web-app-capable" content="yes"/);
  assert.match(html, /name="apple-mobile-web-app-title" content="Mica Pocket"/);
  assert.match(html, /name="apple-mobile-web-app-status-bar-style" content="black"/);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'portrait');
  assert.equal(manifest.start_url, './index.html');
});
