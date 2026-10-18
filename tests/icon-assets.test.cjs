const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function readPng(relativePath) {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR');
  return {
    bytes,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colorType: bytes[25],
  };
}

test('official home-screen icon assets are opaque PNGs at required sizes', () => {
  for (const [file, size] of [
    ['apple-touch-icon.png', 180],
    ['icons/icon-192.png', 192],
    ['icons/icon-512.png', 512],
  ]) {
    const png = readPng(file);
    assert.equal(png.width, size, file);
    assert.equal(png.height, size, file);
    assert.equal(png.bitDepth, 8, file);
    assert.equal(png.colorType, 2, `${file} must be truecolor without alpha`);
    assert.ok(png.bytes.length > size * 20, `${file} must contain real artwork`);
  }
});

test('HTML and manifest declare iOS and installable PWA icons', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));

  assert.match(html, /<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon\.png">/);
  assert.match(html, /<link rel="icon" type="image\/png" sizes="192x192" href="icons\/icon-192\.png">/);
  assert.deepEqual(manifest.icons, [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ]);
});
