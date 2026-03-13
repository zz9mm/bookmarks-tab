# 书签快速访问

Edge 浏览器扩展，在新标签页显示书签快速访问界面。

## 功能特性

- **快速访问**：以图标网格形式展示书签栏中的书签
- **收藏夹**：树形结构展示所有书签文件夹，支持展开/折叠和筛选
- **书签搜索**：快速搜索书签
- **网页搜索**：支持 Bing、百度、Google 三大搜索引擎
- **自定义布局**：可配置顶部、左侧、右侧区域的模块
- **响应式配置**：可调整快速访问图标的每行显示数量

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
│   ├── main.js              # Vue 应用入口
│   ├── App.vue              # 根组件
│   ├── components/          # Vue 组件
│   │   ├── BookmarkSearch.vue
│   │   ├── FolderTree.vue
│   │   ├── FolderItem.vue
│   │   ├── WebSearch.vue
│   │   └── QuickAccess.vue
│   ├── composables/         # 可组合函数
│   │   └── useFavicon.js
│   └── styles/
│       └── main.css         # 样式文件
├── dist/                    # 构建产物
├── manifest.json            # 扩展配置
├── vite.config.js           # Vite 配置
├── tailwind.config.js      # Tailwind 配置
└── package.json
```

## 技术栈

- Vue 3 (Composition API + Script Setup)
- Vite
- TailwindCSS
- Chrome Extensions API (Manifest V3)

## 许可证

MIT
