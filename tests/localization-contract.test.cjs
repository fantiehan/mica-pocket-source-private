const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const config = require('../config.js');

const expectedChinese = {
  chats: '消息',
  unread: '未读 80',
  flagged: '标记',
  navMessenger: '消息',
  navCalendar: '日历',
  navWorkplace: '工作台',
  navDocs: '云文档',
  navEmail: '邮箱',
  navMore: '更多',
  status: '+ 状态',
  verified: '已认证',
  profile: '我的个人名片',
  wallet: '钱包',
  favorites: '收藏',
  moreAccounts: '登录更多账号',
  contactUs: '帮助与客服',
  manageDevices: '登录设备',
  settings: '设置',
  emergency: 'SOS 紧急联系',
  information: '个人信息',
  profilePhoto: '头像',
  name: '姓名',
  myQrCode: '我的二维码',
  myBadges: '我的勋章',
  bio: '个性签名',
  organization: '企业',
  department: '所属部门',
  language: '语言',
};

test('translation dictionaries include the Chinese UI shown in ref-zh.mp4', () => {
  assert.equal(config.defaultLocale, 'en');
  assert.equal(config.localeStorageKey, 'mica-pocket.locale');
  assert.equal(Object.isFrozen(config.messages), true);
  for (const [key, value] of Object.entries(expectedChinese)) {
    assert.equal(config.messages['zh-CN'][key], value, key);
    assert.equal(typeof config.messages.en[key], 'string', `missing English ${key}`);
  }
});

test('page exposes Settings navigation, language choices, translatable UI, and a dynamic calendar target', () => {
  const html = read('index.html');
  for (const testId of ['settings-trigger', 'settings-screen', 'settings-back', 'calendar-day']) {
    assert.match(html, new RegExp(`data-testid=["']${testId}["']`));
  }
  assert.match(html, /data-locale-option="en"/);
  assert.match(html, /data-locale-option="zh-CN"/);
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /data-i18n="chats"/);
  assert.match(html, /data-i18n="settings"/);
  assert.match(html, /data-i18n="information"/);
  assert.match(html, /data-i18n="navCalendar"/);
  assert.doesNotMatch(html, /nav-glyph--calendar">10</);
});

test('application initializes locale, Settings navigation, and calendar controllers', () => {
  const app = read('app.js');
  assert.match(app, /createLocaleController/);
  assert.match(app, /createSettingsController/);
  assert.match(app, /createCalendarController/);
  assert.match(app, /MockConfig\.messages/);
  assert.match(app, /MockConfig\.localeStorageKey/);
  assert.match(app, /\[data-testid="calendar-day"\]/);
});

test('Settings page uses the same page-level transition as Information', () => {
  const css = read('styles.css');
  assert.match(css, /\.settings-screen\s*\{[^}]*position:\s*absolute[^}]*height:\s*100vh[^}]*transform:\s*translate3d\(100%,\s*0,\s*0\)[^}]*transition:\s*transform\s+var\(--information-duration\)\s+var\(--drawer-ease\)/s);
  assert.match(css, /\.is-settings-open\s+\.settings-screen\s*\{[^}]*transform:\s*translate3d\(0,\s*0,\s*0\)[^}]*pointer-events:\s*auto/s);
  assert.match(css, /\.is-settings-open\s+\.chat-screen\s*\{[^}]*transform:\s*translate3d\(-28%,\s*0,\s*0\)/s);
  assert.match(css, /\.locale-option\.is-selected/);
});
