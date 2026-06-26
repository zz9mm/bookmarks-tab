# 书签快速访问

Edge 浏览器扩展，在新标签页显示书签快速访问界面。

## 功能特性

- **快速访问**：以图标网格形式展示书签，支持指定收藏夹、自定义行列数、跨模块拖拽排序
- **收藏夹**：树形结构展示所有书签文件夹，支持展开/折叠和筛选
- **书签搜索**：快速搜索书签
- **网页搜索**：支持 Bing、百度、Google 三大搜索引擎
- **待办**：新标签页内置待办清单，支持自定义标题与完成项处理策略
- **自定义文本**：可添加自定义标题文本，支持字号、对齐、字体、首行缩进
- **自定义布局**：可配置顶部、左侧、右侧区域的模块，支持拖拽排序
- **自定义背景**：支持设置背景图片/视频（存储于 IndexedDB），可调整填充方式与位置
- **布局导入/导出**：支持布局配置的备份和恢复

## 安装方法

1. 克隆本项目
2. 安装依赖：`npm install`
3. 构建项目：`npm run build`
4. 打开 Edge 浏览器，访问 `edge://extensions/`
5. 开启右上角的「开发者模式」
6. 点击「加载已解压的扩展程序」
7. 选择本项目的 `dist` 文件夹
8. 安装完成后，新标签页将显示书签快速访问界面

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 重新加载扩展

修改代码后：
1. 运行 `npm run build` 重新构建
2. 打开 `edge://extensions/`
3. 点击扩展的刷新按钮

## 项目结构

```
bookmarks-tab/
├── src/
│   ├── main.js                 # Vue 应用入口
│   ├── App.vue                 # 根组件
│   ├── components/             # 公共组件
│   │   └── SettingsPanel.vue   # 设置面板
│   ├── modules/                # 功能模块
│   │   ├── types.ts            # 模块类型定义与默认配置
│   │   ├── bookmark-search/    # 书签搜索
│   │   ├── folder/             # 收藏夹
│   │   ├── web-search/         # 网页搜索
│   │   ├── quick-access/       # 快速访问
│   │   ├── title/              # 自定义文本
│   │   └── todo/               # 待办
│   ├── composables/            # 组合式函数
│   │   ├── useFavicon.ts       # 网站图标获取
│   │   ├── useFaviconCache.ts  # 图标缓存
│   │   ├── useQuickAccessDnd.ts# 快速访问拖拽
│   │   ├── useBackgroundStore.ts# 背景存储 (IndexedDB)
│   │   └── useEscClose.ts      # Esc 关闭交互
│   └── styles/
│       └── main.css             # 样式文件
├── dist/                        # 构建产物
├── manifest.json                # 扩展配置
├── vite.config.js               # Vite 配置
└── package.json
```

## 模块说明

| 模块 | 配置 | 说明 |
|------|------|------|
| 书签搜索 | - | 快速搜索书签 |
| 收藏夹 | - | 树形结构展示所有书签文件夹 |
| 网页搜索 | ✓ | 支持 Bing、百度、Google 搜索 |
| 快速访问 | ✓ | 以图标网格展示书签，可指定收藏夹、行列数 |
| 文本 | ✓ | 自定义标题文本 |
| 待办 | ✓ | 待办清单，可设置标题与完成项处理策略 |

每个模块遵循一致的结构：`index.vue`（主组件）+ `config.vue`（配置面板，可选）。模块在 `src/modules/types.ts` 注册，配置通过 localStorage 持久化。

## 数据存储

- **localStorage**：布局配置（`layoutSettings`）、各模块配置（`moduleConfigs`）、搜索引擎选择等
- **IndexedDB**：背景图片/视频（避免超出 localStorage 5MB 限制，并支持 webm 视频）

## 技术栈

- Vue 3 (Composition API + Script Setup)
- Vite
- Ant Design Vue
- TailwindCSS
- Chrome Extensions API (Manifest V3)
- `chrome.bookmarks` API 读取书签

## 许可证

MIT
