# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Edge 浏览器扩展，在新标签页显示书签快速访问界面。使用 Chrome Extensions Manifest V3。

## Development Commands

### Load Extension in Edge
1. Open `edge://extensions/`
2. Enable "Developer mode" (右上角)
3. Click "Load unpacked" (加载已解压的扩展程序)
4. Select this project folder

### No Build Process Required
This is a plain JavaScript extension - no build tools needed. Edit source files directly and reload the extension in Edge.

### Reload Extension
After making changes, go to `edge://extensions/` and click the refresh button on the extension, or toggle developer mode off and on.

## Architecture

### File Structure
- `manifest.json` - Extension config, defines permissions and overrides newtab
- `newtab.html` - Main HTML entry point
- `newtab.css` - All styles
- `newtab.js` - Main application logic
- `icons/` - Extension icons (16/32/48/128px)

### Key Technologies
- Chrome Extensions API (Manifest V3)
- chrome.bookmarks API for reading bookmarks
- localStorage for persisting user preferences (layout, search engine, module configs)

### Data Flow
1. `init()` on DOMContentLoaded loads configs from localStorage
2. `loadBookmarks()` calls chrome.bookmarks.getTree() to fetch bookmark data
3. Bookmarks are rendered via `renderBookmarksSeparate()` - separates direct bookmarks (quick access) from subfolders (folder tree)
4. Layout state stored in `leftModules` and `rightModules` arrays, persisted to localStorage

### Module System
Four module types defined in `moduleTemplates`:
- `bookmark-search` - Search bookmarks as you type
- `folder` - Tree view of bookmark folders with collapse/expand
- `web-search` - Web search with engine dropdown (Bing/Baidu/Google)
- `quick-access` - Grid of bookmark icons from bookmarks bar

Each module can be added to left or right panel via settings panel. Some modules have config options (quick-access: cols count, web-search: default engine).

### State Variables
- `leftModules` / `rightModules` - Current layout
- `moduleConfigs` - Per-module configuration (stored by key like "left-0")
- `allBookmarks` - Flattened bookmark list for search
- `currentEngine` - Default search engine

## Important Implementation Notes

- Uses Google Favicon API (`https://www.google.com/s2/favicons`) as fallback for site favicons
- findBookmarksBar() looks for node with id "1" or title "书签栏" / "Bookmarks Bar"
- Bookmarks bar direct children become "quick access" items, subfolders become folder tree
- Extension overrides newtab page via `chrome_url_overrides` in manifest
