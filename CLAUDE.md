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

### Module Structure
Each module follows a consistent pattern:
- `index.vue` - Main module component
- `config.vue` - Configuration panel for the module (optional)

Modules are registered in `src/modules/types.ts` and configured via localStorage.

### Composables
- `src/composables/useFavicon.ts` - Fetcher for website favicons

### Data Flow
- User preferences: localStorage
  - `layoutSettings` - Module layout (top/left/right arrays)
  - `moduleConfigs` - Individual module configurations
  - `searchEngine` - Selected web search engine
- Bookmarks: Chrome `chrome.bookmarks` API (loads from bookmarks bar by default)
- Module layout: Configurable top/left/right regions

### Default Layout
- Left panel: `['bookmark-search', 'folder']`
- Right panel: `['web-search', 'quick-access']`

### Bookmark Loading
- Loads bookmarks from the bookmarks bar (id='1' or title='书签栏'/'Bookmarks Bar')
- Falls back to all bookmarks if bookmarks bar not found

### Default Module Configs
- `web-search`: `{ engine: 'bing' }`
- `quick-access`: `{ cols: 4 }`
- `title`: `{ text: '文本', fontSize: 24, align: 'center', fontFamily: 'inherit', textIndent: 0 }`
- `minimax-usage`: `{ apiKey: '', defaultModel: '', showAllModels: false }`

### Favicon
Uses Google S2 service: `https://www.google.com/s2/favicons?domain={domain}&sz={size}`
