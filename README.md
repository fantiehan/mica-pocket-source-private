# Mica Pocket 移动端原型页

## 在手机上打开

### 方式一：生成单文件后直接传到手机

如果不想在手机上输入局域网地址，先生成一个可直接打开的单文件 HTML：

```bash
cd /Users/bytedance/Documents/代码/html
npm run build:single
```

生成文件：

```text
dist/mica-pocket.html
```

把这个文件通过 AirDrop、聊天工具或文件传输工具发到手机，在手机上打开即可。这个文件已经内联了样式和脚本，不依赖本目录里的其他文件。

注意：如果是在 Safari / Chrome 普通浏览器标签页里打开，浏览器自己的底部工具栏仍然会出现，网页无法用 CSS/JS 强制隐藏它。

### 去掉手机浏览器底部工具栏

需要把页面添加到主屏幕，再从主屏幕图标打开：

- iPhone Safari：打开页面 → 点分享按钮 → 添加到主屏幕 → 从桌面图标打开。
- Android Chrome：打开页面 → 右上角菜单 → 添加到主屏幕 / 安装应用 → 从桌面图标打开。

页面已配置 `standalone` Web App 元数据；从主屏幕图标启动时会以独立窗口打开，不显示浏览器底部导航栏。

### 主屏幕图标

页面使用从本机目标应用安装包提取的官方图标，并提供 iOS `apple-touch-icon` 与 PWA Manifest 图标。

图标更新后，iOS 不会替换已经保存到主屏幕的旧图标。需要：

1. 删除主屏幕上的旧图标；
2. 用 Safari 重新打开部署地址；
3. 再次选择“添加到主屏幕”。

如需从本机已安装的目标应用重新生成图标：

```bash
python3 scripts/generate-app-icons.py
```

### 切换中英文

打开左侧账户抽屉，进入 `Settings / 设置`，可选择：

- `English`
- `简体中文`

选择后会立即更新聊天页、账户抽屉和个人信息页，并保存在本机；下次打开时继续使用上次选择。

底部日历图标会读取设备本地日期，并在 Web App 恢复到前台或跨过午夜时自动更新。

### 方式二：电脑开本地服务，手机同 Wi-Fi 访问

1. 确保电脑和手机连接同一个 Wi-Fi。
2. 在电脑终端进入本目录：

   ```bash
   cd /Users/bytedance/Documents/代码/html
   npm run serve
   ```

3. 终端会输出类似 `Phone on same Wi-Fi: http://192.168.x.x:4173` 的地址。
4. 在手机 Safari 或 Chrome 中输入该地址。
5. 点击左上角头像打开侧栏；也可以从屏幕左缘向右滑。点击右侧暗色区域或向左滑可关闭。

页面不再绘制假的手机状态栏；在真实手机浏览器里使用系统自己的状态栏和安全区。

如果手机无法访问：

- 确认两台设备处于同一局域网，且没有开启会隔离设备的访客 Wi-Fi。
- macOS 首次询问是否允许 Python 接收网络连接时，选择“允许”。
- 公司网络可能启用客户端隔离；此时改用个人热点，并让电脑连接到该热点。

## 修改账户信息

编辑 `config.js`：

```js
name: 'Tiehan Fan',
organization: 'ByteDance',
initials: 'TF',
verified: true,
```

## 验证

```bash
npm test
npm run build:single
```
