const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawn, spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const entry = path.join(root, 'dist', 'mica-pocket.html');

function commandExists(command) {
  const checker = process.platform === 'win32' ? 'where' : 'command';
  const args = process.platform === 'win32' ? [command] : ['-v', command];
  return spawnSync(checker, args, { stdio: 'ignore', shell: process.platform !== 'win32' }).status === 0;
}

function edgeCandidates() {
  if (process.platform === 'darwin') {
    return [
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      path.join(process.env.HOME || '', 'Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'),
    ];
  }
  if (process.platform === 'win32') {
    return [
      path.join(process.env.PROGRAMFILES || '', 'Microsoft/Edge/Application/msedge.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
      'msedge.exe',
    ];
  }
  return ['microsoft-edge', 'microsoft-edge-stable', 'msedge'];
}

function findEdge() {
  for (const candidate of edgeCandidates()) {
    if (candidate.endsWith('.exe') && candidate.includes(':') && fs.existsSync(candidate)) return candidate;
    if (candidate.startsWith('/') && fs.existsSync(candidate)) return candidate;
    if (!candidate.includes('/') && commandExists(candidate)) return candidate;
  }
  return null;
}

function ensureBuilt() {
  if (!fs.existsSync(entry)) {
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/build-single.cjs')], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}

ensureBuilt();
const edge = findEdge();
if (!edge) {
  console.error('未找到 Microsoft Edge。请先安装 Edge，或用手机“添加到主屏幕/安装应用”方式打开。');
  process.exit(1);
}

const url = pathToFileURL(entry).href;
const args = [`--app=${url}`, '--start-fullscreen', '--disable-pinch'];

if (process.argv.includes('--print-command')) {
  console.log([edge, ...args].join(' '));
  process.exit(0);
}

const child = spawn(edge, args, { detached: true, stdio: 'ignore' });
child.unref();
console.log('已尝试用 Microsoft Edge app/fullscreen 模式打开：');
console.log(url);
