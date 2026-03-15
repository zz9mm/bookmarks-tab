# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Edge 浏览器扩展，在新标签页显示书签快速访问界面。使用 Chrome Extensions Manifest V3 + Vue 3 + Vite。

## Development Commands

### Load Extension in Edge
1. Run `npm run build` to build the extension
2. Open `edge://extensions/`
3. Enable "Developer mode" (右上角)
4. Click "Load unpacked" (加载已解压的扩展程序)
5. Select the `dist` folder

### Development
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Reload Extension
After making changes, rebuild and go to `edge://extensions/` to reload.

## Architecture

### File Structure
- `manifest.json` - Extension config, defines permissions and overrides newtab
- `index.html` - Vite entry point
- `src/main.js` - Vue app entry
- `src/App.vue` - Main application component
- `src/components/` - Vue components
- `src/styles/main.css` - Global styles (Tailwind CSS)
- `icons/` - Extension icons (16/32/48/128px)

### Key Technologies
- Vue 3 + Vite
- Ant Design Vue 4.x
- Tailwind CSS 4.x
- Chrome Extensions API (Manifest V3)
- chrome.bookmarks API for reading bookmarks
- localStorage for persisting user preferences

### Module Components
- `BookmarkSearch` - Search bookmarks as you type
- `FolderTree` - Tree view of bookmark folders with collapse/expand
- `WebSearch` - Web search with engine dropdown (Bing/Baidu/Google)
- `QuickAccess` - Grid of bookmark icons from bookmarks bar
- `Title` - Custom text display
- `MinimaxUsage` - API usage tracking
