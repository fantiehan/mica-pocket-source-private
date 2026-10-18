const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const outputPath = path.join(distDir, 'mica-pocket.html');
const siteDir = path.join(distDir, 'site');

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pngDataUrl = (file) => `data:image/png;base64,${fs.readFileSync(path.join(root, file)).toString('base64')}`;

function inlineManifest() {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  manifest.icons = manifest.icons.map((icon) => ({
    ...icon,
    src: pngDataUrl(icon.src),
  }));
  return JSON.stringify(manifest);
}

function inlineRuntimeAssets(html) {
  return html
    .replace(/\s*<link rel="stylesheet" href="styles\.css">/, () => `\n  <style>\n${read('styles.css')}\n  </style>`)
    .replace(/\s*<script src="config\.js" defer><\/script>/, () => `\n  <script>\n${read('config.js')}\n  </script>`)
    .replace(/\s*<script src="drawer-controller\.js" defer><\/script>/, () => `\n  <script>\n${read('drawer-controller.js')}\n  </script>`)
    .replace(/\s*<script src="immersive-controller\.js" defer><\/script>/, () => `\n  <script>\n${read('immersive-controller.js')}\n  </script>`)
    .replace(/\s*<script src="information-controller\.js" defer><\/script>/, () => `\n  <script>\n${read('information-controller.js')}\n  </script>`)
    .replace(/\s*<script src="settings-controller\.js" defer><\/script>/, () => `\n  <script>\n${read('settings-controller.js')}\n  </script>`)
    .replace(/\s*<script src="locale-controller\.js" defer><\/script>/, () => `\n  <script>\n${read('locale-controller.js')}\n  </script>`)
    .replace(/\s*<script src="calendar-controller\.js" defer><\/script>/, () => `\n  <script>\n${read('calendar-controller.js')}\n  </script>`)
    .replace(/\s*<script src="app\.js" defer><\/script>/, () => `\n  <script>\n${read('app.js')}\n  </script>`);
}

function inlineInstallAssets(html) {
  return html
    .replace(/href="manifest\.webmanifest"/, () => {
      const manifest = inlineManifest();
      return `href="data:application/manifest+json,${encodeURIComponent(manifest)}"`;
    })
    .replace(/href="apple-touch-icon\.png"/, () => `href="${pngDataUrl('apple-touch-icon.png')}"`)
    .replace(/href="icons\/icon-192\.png"/, () => `href="${pngDataUrl('icons/icon-192.png')}"`);
}

const runtimeReferences = [
  'href="styles.css"',
  'src="config.js"',
  'src="drawer-controller.js"',
  'src="immersive-controller.js"',
  'src="information-controller.js"',
  'src="settings-controller.js"',
  'src="locale-controller.js"',
  'src="calendar-controller.js"',
  'src="app.js"',
];

function assertNoReferences(html, references, buildName) {
  for (const reference of references) {
    if (html.includes(reference)) {
      throw new Error(`${buildName} still references ${reference}`);
    }
  }
}

function copySiteAsset(file) {
  const destination = path.join(siteDir, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
}

function build() {
  const source = read('index.html');
  const hosted = inlineRuntimeAssets(source);
  const standalone = inlineInstallAssets(hosted);

  assertNoReferences(hosted, runtimeReferences, 'Hosted build');
  assertNoReferences(standalone, [
    ...runtimeReferences,
    'href="manifest.webmanifest"',
    'href="apple-touch-icon.png"',
    'href="icons/icon-192.png"',
  ], 'Single-file build');

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(outputPath, standalone);

  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), hosted);
  for (const file of ['manifest.webmanifest', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png']) {
    copySiteAsset(file);
  }

  console.log(`Built ${path.relative(root, outputPath)}`);
  console.log(`Built ${path.relative(root, siteDir)}/`);
}

build();
