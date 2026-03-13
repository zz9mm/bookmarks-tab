// Search engine configurations
const searchEngines = {
  bing: {
    url: 'https://www.bing.com/search?q=',
    name: 'Bing'
  },
  baidu: {
    url: 'https://www.baidu.com/s?wd=',
    name: '百度'
  },
  google: {
    url: 'https://www.google.com/search?q=',
    name: 'Google'
  }
};

function getDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
}

let currentEngine = 'bing';
let allBookmarks = [];

// Module templates
const moduleTemplates = {
  'bookmark-search': `
    <div class="module-box">
      <div class="search-wrapper">
        <div class="search-bar bookmark-search">
          <svg class="search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input type="text" class="bookmark-search-input" placeholder="搜索书签..." autocomplete="off">
        </div>
        <div class="search-dropdown bookmark-dropdown"></div>
      </div>
    </div>
  `,
  'folder': `
    <div class="module-box folder-section">
      <div class="sidebar-header">
        <span>收藏夹</span>
        <input type="text" class="folder-search-input" placeholder="筛选..." autocomplete="off">
      </div>
      <div class="folder-list"></div>
    </div>
  `,
  'web-search': `
    <div class="module-box">
      <div class="search-wrapper">
        <div class="search-bar web-search">
          <div class="engine-dropdown">
            <button class="engine-selected">
              <img src="https://www.google.com/s2/favicons?domain=bing.com&sz=32" alt="" class="engine-icon">
              <span class="engine-name">Bing</span>
              <span class="engine-arrow">▼</span>
            </button>
            <div class="engine-menu">
              <div class="engine-option" data-engine="bing">
                <img src="https://www.google.com/s2/favicons?domain=bing.com&sz=32" alt="" class="engine-icon">
                <span>Bing</span>
              </div>
              <div class="engine-option" data-engine="baidu">
                <img src="https://www.google.com/s2/favicons?domain=baidu.com&sz=32" alt="" class="engine-icon">
                <span>百度</span>
              </div>
              <div class="engine-option" data-engine="google">
                <img src="https://www.google.com/s2/favicons?domain=google.com&sz=32" alt="" class="engine-icon">
                <span>Google</span>
              </div>
            </div>
          </div>
          <input type="text" class="web-search-input" placeholder="搜索网页..." autocomplete="off">
        </div>
        <div class="search-dropdown web-dropdown"></div>
      </div>
    </div>
  `,
  'quick-access': `
    <div class="module-box quick-access-section">
      <div class="section-title">快速访问</div>
      <div class="quick-access-grid-container"></div>
    </div>
  `
};

const moduleNames = {
  'bookmark-search': '书签搜索',
  'folder': '收藏夹',
  'web-search': '网页搜索',
  'quick-access': '快速访问'
};

// Layout state
let leftModules = [];
let rightModules = [];

// Module configs - keyed by "side-index"
let moduleConfigs = {};

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('Initializing...');

  loadModuleConfigs();

  // Direct event listener for settings button
  document.getElementById('settings-btn').onclick = function(e) {
    e.stopPropagation();
    var panel = document.getElementById('settings-panel');
    panel.classList.toggle('show');
  };

  document.onclick = function(e) {
    document.getElementById('settings-panel').classList.remove('show');
    document.getElementById('module-config-panel').style.display = 'none';
  };

  document.getElementById('settings-panel').onclick = function(e) {
    e.stopPropagation();
  };

  document.getElementById('module-config-panel').onclick = function(e) {
    e.stopPropagation();
  };

  // Config close button
  document.getElementById('config-close').addEventListener('click', () => {
    document.getElementById('module-config-panel').style.display = 'none';
  });

  loadLayoutSettings();
  loadSearchEnginePreference();
  setupModuleAddListeners();
  renderLayout();
  loadBookmarks();
}

function loadModuleConfigs() {
  const saved = localStorage.getItem('moduleConfigs');
  if (saved) {
    moduleConfigs = JSON.parse(saved);
  }
}

function saveModuleConfigs() {
  localStorage.setItem('moduleConfigs', JSON.stringify(moduleConfigs));
}

function getModuleConfigKey(side, index) {
  return `${side}-${index}`;
}

function getModuleConfig(side, index, moduleType) {
  const key = getModuleConfigKey(side, index);
  if (!moduleConfigs[key]) {
    // Set default config based on module type
    if (moduleType === 'quick-access') {
      moduleConfigs[key] = { cols: 4 };
    }
  }
  return moduleConfigs[key] || {};
}

function showModuleConfigPanel(side, index, moduleType) {
  const configPanel = document.getElementById('module-config-panel');
  const configContent = document.getElementById('config-content');
  const config = getModuleConfig(side, index, moduleType);

  let html = '';

  if (moduleType === 'quick-access') {
    html = `
      <div class="config-item">
        <label>每行显示图标数量</label>
        <select id="module-config-cols">
          <option value="3" ${config.cols === 3 ? 'selected' : ''}>3 个</option>
          <option value="4" ${config.cols === 4 ? 'selected' : ''}>4 个</option>
          <option value="5" ${config.cols === 5 ? 'selected' : ''}>5 个</option>
          <option value="6" ${config.cols === 6 ? 'selected' : ''}>6 个</option>
          <option value="8" ${config.cols === 8 ? 'selected' : ''}>8 个</option>
          <option value="10" ${config.cols === 10 ? 'selected' : ''}>10 个</option>
        </select>
      </div>
    `;
  } else if (moduleType === 'web-search') {
    html = `
      <div class="config-item">
        <label>默认搜索引擎</label>
        <select id="module-config-engine">
          <option value="bing" ${config.engine === 'bing' ? 'selected' : ''}>Bing</option>
          <option value="baidu" ${config.engine === 'baidu' ? 'selected' : ''}>百度</option>
          <option value="google" ${config.engine === 'google' ? 'selected' : ''}>Google</option>
        </select>
      </div>
    `;
  }

  configContent.innerHTML = html;

  // Add event listeners for config changes
  const colsSelect = document.getElementById('module-config-cols');
  if (colsSelect) {
    colsSelect.addEventListener('change', (e) => {
      const key = getModuleConfigKey(side, index);
      moduleConfigs[key] = { cols: parseInt(e.target.value) };
      saveModuleConfigs();
      renderLayout();
      loadBookmarks();
    });
  }

  const engineSelect = document.getElementById('module-config-engine');
  if (engineSelect) {
    engineSelect.addEventListener('change', (e) => {
      const key = getModuleConfigKey(side, index);
      moduleConfigs[key] = { engine: e.target.value };
      currentEngine = e.target.value;
      localStorage.setItem('searchEngine', e.target.value);
      saveModuleConfigs();
      updateAllEngineDropdowns();
      document.getElementById('module-config-panel').style.display = 'none';
    });
  }

  configPanel.style.display = 'block';
}

function loadLayoutSettings() {
  const saved = localStorage.getItem('layoutSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    leftModules = settings.left || [];
    rightModules = settings.right || [];
  } else {
    // Default layout
    leftModules = ['bookmark-search', 'folder'];
    rightModules = ['web-search', 'quick-access'];
  }
}

function saveLayoutSettings() {
  localStorage.setItem('layoutSettings', JSON.stringify({
    left: leftModules,
    right: rightModules
  }));
}

function renderLayout() {
  renderModuleList('left-modules', leftModules, 'left');
  renderModuleList('right-modules', rightModules, 'right');
  renderPanel('left-panel', leftModules);
  renderPanel('right-panel', rightModules);
}

function renderModuleList(containerId, modules, side) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  modules.forEach((module, index) => {
    const item = document.createElement('div');
    item.className = 'module-item';
    const showConfigBtn = (module === 'quick-access' || module === 'web-search');
    item.innerHTML = `
      <span>${moduleNames[module]}</span>
      <div class="module-actions">
        ${showConfigBtn ? `<button class="module-config" data-side="${side}" data-index="${index}" data-module="${module}" title="配置">⚙</button>` : ''}
        <button class="module-remove" data-side="${side}" data-index="${index}">×</button>
      </div>
    `;
    container.appendChild(item);
  });

  // Add config listeners
  container.querySelectorAll('.module-config').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const side = btn.dataset.side;
      const index = parseInt(btn.dataset.index);
      const moduleType = btn.dataset.module;
      showModuleConfigPanel(side, index, moduleType);
    });
  });

  // Add remove listeners
  container.querySelectorAll('.module-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const side = btn.dataset.side;
      const index = parseInt(btn.dataset.index);
      if (side === 'left') {
        leftModules.splice(index, 1);
      } else {
        rightModules.splice(index, 1);
      }
      saveLayoutSettings();
      renderLayout();
      loadBookmarks();
    });
  });
}

function renderPanel(panelId, modules) {
  const panel = document.getElementById(panelId);
  const isLeft = panelId === 'left-panel';
  panel.innerHTML = '';

  modules.forEach((module, index) => {
    const temp = document.createElement('div');
    temp.innerHTML = moduleTemplates[module];
    const moduleEl = temp.firstElementChild;

    // Store module info for config
    moduleEl.dataset.module = module;
    moduleEl.dataset.side = isLeft ? 'left' : 'right';
    moduleEl.dataset.index = index;

    panel.appendChild(moduleEl);
  });

  // Setup module-specific functionality
  setupModuleFunctionality(panelId, modules);
}

function setupModuleFunctionality(panelId, modules) {
  modules.forEach(module => {
    if (module === 'bookmark-search') {
      setupBookmarkSearchInPanel(panelId);
    } else if (module === 'folder') {
      setupFolderSearchInPanel(panelId);
    } else if (module === 'web-search') {
      setupWebSearchInPanel(panelId);
    }
  });
}

function setupBookmarkSearchInPanel(panelId) {
  const panel = document.getElementById(panelId);
  const input = panel.querySelector('.bookmark-search-input');
  const dropdown = panel.querySelector('.bookmark-dropdown');

  if (input) {
    input.addEventListener('input', (e) => handleBookmarkSearchInputInPanel(e, dropdown));
    input.addEventListener('focus', (e) => handleBookmarkSearchInputInPanel(e, dropdown));
    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.style.display = 'none', 200);
    });
  }
}

function handleBookmarkSearchInputInPanel(e, dropdown) {
  const query = e.target.value.toLowerCase();
  dropdown.innerHTML = '';

  if (!query) {
    dropdown.style.display = 'none';
    return;
  }

  const matches = allBookmarks.filter(b => b.title.toLowerCase().includes(query)).slice(0, 8);

  if (matches.length > 0) {
    matches.forEach(bookmark => {
      const item = document.createElement('a');
      item.className = 'search-result-item';
      item.href = bookmark.url;
      item.target = '_blank';
      item.innerHTML = `
        <img src="https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32" alt="">
        <span>${bookmark.title}</span>
      `;
      dropdown.appendChild(item);
    });
    dropdown.style.display = 'block';
  } else {
    dropdown.style.display = 'none';
  }
}

function setupFolderSearchInPanel(panelId) {
  const panel = document.getElementById(panelId);
  const input = panel.querySelector('.folder-search-input');
  const folderList = panel.querySelector('.folder-list');

  if (input && folderList) {
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const folders = folderList.querySelectorAll('.folder-item');
      folders.forEach(folder => {
        const title = folder.querySelector('.folder-name').textContent.toLowerCase();
        folder.style.display = title.includes(query) ? '' : 'none';
      });
    });
  }
}

function setupWebSearchInPanel(panelId) {
  const panel = document.getElementById(panelId);
  const input = panel.querySelector('.web-search-input');
  const engineSelected = panel.querySelector('.engine-selected');
  const engineMenu = panel.querySelector('.engine-menu');
  const engineIcon = panel.querySelector('.engine-selected .engine-icon');
  const engineName = panel.querySelector('.engine-selected .engine-name');

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim();
        if (query) {
          performSearch(query, engineName.textContent);
        }
      }
    });
  }

  if (engineSelected && engineMenu) {
    engineSelected.addEventListener('click', (e) => {
      e.stopPropagation();
      engineMenu.classList.toggle('show');
    });

    engineMenu.querySelectorAll('.engine-option').forEach(option => {
      option.addEventListener('click', () => {
        const engine = option.dataset.engine;
        engineIcon.src = `https://www.google.com/s2/favicons?domain=${searchEngines[engine].name === '百度' ? 'baidu.com' : searchEngines[engine].name.toLowerCase() + '.com'}&sz=32`;
        engineName.textContent = searchEngines[engine].name;
        engineMenu.classList.remove('show');
      });
    });
  }
}

function performSearch(query, engineName) {
  const engine = Object.values(searchEngines).find(e => e.name === engineName) || searchEngines[currentEngine];
  window.open(engine.url + encodeURIComponent(query), '_blank');
}

function setupModuleAddListeners() {
  document.querySelectorAll('.module-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const module = btn.closest('.module-item').dataset.module;
      const side = btn.dataset.side;

      if (side === 'left') {
        leftModules.push(module);
      } else {
        rightModules.push(module);
      }

      saveLayoutSettings();
      renderLayout();
      loadBookmarks();
    });
  });

  document.getElementById('reset-layout').addEventListener('click', () => {
    leftModules = ['bookmark-search', 'folder'];
    rightModules = ['web-search', 'quick-access'];
    saveLayoutSettings();
    renderLayout();
    loadBookmarks();
  });
}

function loadSearchEnginePreference() {
  const saved = localStorage.getItem('searchEngine');
  if (saved && searchEngines[saved]) {
    currentEngine = saved;
  }
  updateAllEngineDropdowns();
}

function updateAllEngineDropdowns() {
  document.querySelectorAll('.engine-selected').forEach(el => {
    const icon = el.querySelector('.engine-icon');
    const name = el.querySelector('.engine-name');
    if (icon && name) {
      const engine = searchEngines[currentEngine];
      icon.src = `https://www.google.com/s2/favicons?domain=${engine.name === '百度' ? 'baidu.com' : engine.name.toLowerCase() + '.com'}&sz=32`;
      name.textContent = engine.name;
    }
  });
}

function loadBookmarks() {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    // Find the bookmarks bar (收藏夹栏)
    const bookmarksBar = findBookmarksBar(bookmarkTreeNodes);
    if (bookmarksBar && bookmarksBar.children) {
      // Separate direct bookmarks from subfolders
      const directBookmarks = [];
      const subfolders = [];

      bookmarksBar.children.forEach(child => {
        if (child.url) {
          directBookmarks.push(child);
        } else if (child.children && child.children.length > 0) {
          subfolders.push(child);
        }
      });

      allBookmarks = flattenBookmarks([bookmarksBar]);
      renderBookmarksSeparate(directBookmarks, subfolders);
    } else {
      // Fallback to root if bookmarks bar not found
      allBookmarks = flattenBookmarks(bookmarkTreeNodes);
      // Render empty state for all quick-access modules
      document.querySelectorAll('.quick-access-grid-container').forEach(container => {
        container.innerHTML = '<div class="empty-state">暂无书签</div>';
      });
    }
  });
}

function renderBookmarksSeparate(directBookmarks, subfolders) {
  // Render quick access in all quick-access modules
  document.querySelectorAll('.quick-access-grid-container').forEach(container => {
    container.innerHTML = '';

    // Get module config
    const moduleBox = container.closest('.module-box');
    const side = moduleBox ? moduleBox.dataset.side : 'left';
    const index = moduleBox ? parseInt(moduleBox.dataset.index) : 0;
    const config = getModuleConfig(side, index, 'quick-access');
    const cols = config.cols || 4;

    if (directBookmarks.length > 0) {
      const grid = document.createElement('div');
      grid.className = 'quick-access-grid';
      grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

      directBookmarks.forEach(bookmark => {
        grid.appendChild(createLargeIconElement(bookmark));
      });

      container.appendChild(grid);
    } else {
      container.innerHTML = '<div class="empty-state">暂无书签</div>';
    }
  });

  // Render folders in all folder modules
  document.querySelectorAll('.folder-section').forEach(section => {
    const folderList = section.querySelector('.folder-list');
    if (folderList) {
      folderList.innerHTML = '';
      subfolders.forEach(folder => {
        folderList.appendChild(createFolderElement(folder));
      });
    }
  });
}

function createLargeIconElement(bookmark) {
  const link = document.createElement('a');
  link.className = 'quick-access-item';
  link.href = bookmark.url;
  link.target = '_blank';

  const domain = getDomain(bookmark.url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  const directFaviconUrl = `${domain}/favicon.ico`;

  const icon = document.createElement('img');
  icon.className = 'quick-access-icon';
  // 优先使用网站的 favicon.ico，失败则用 Google 服务，再失败用默认图标
  icon.src = directFaviconUrl;
  icon.onerror = function() {
    this.onerror = function() {
      this.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#666" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>');
    };
    this.src = faviconUrl;
  };

  const title = document.createElement('span');
  title.className = 'quick-access-title';
  title.textContent = bookmark.title;
  title.title = bookmark.title;

  link.appendChild(icon);
  link.appendChild(title);

  return link;
}

function findBookmarksBar(nodes) {
  for (const node of nodes) {
    // Check for bookmarks bar - it can have id '1' or 'toolbar____'
    if (node.id === '1' || node.title === '书签栏' || node.title === 'Bookmarks Bar') {
      return node;
    }
    // Recursively search children
    if (node.children) {
      const found = findBookmarksBar(node.children);
      if (found) return found;
    }
  }
  return null;
}

function flattenBookmarks(nodes) {
  const result = [];
  nodes.forEach(node => {
    if (node.url) {
      result.push({
        id: node.id,
        title: node.title,
        url: node.url
      });
    }
    if (node.children) {
      result.push(...flattenBookmarks(node.children));
    }
  });
  return result;
}

function createBookmarkElement(bookmark) {
  const link = document.createElement('a');
  link.className = 'bookmark-item';
  link.href = bookmark.url;
  link.target = '_blank';

  const domain = getDomain(bookmark.url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const icon = document.createElement('img');
  icon.classList.add('bookmark-icon');
  icon.src = faviconUrl;
  icon.onerror = function() {
    this.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#666" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>');
  };

  const title = document.createElement('span');
  title.className = 'bookmark-title';
  title.textContent = bookmark.title;

  link.appendChild(icon);
  link.appendChild(title);

  return link;
}

function createFolderElement(folder) {
  const folderItem = document.createElement('div');
  folderItem.className = 'folder-item';

  const header = document.createElement('div');
  header.className = 'folder-header';

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.classList.add('folder-icon');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.innerHTML = '<path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>';

  const name = document.createElement('span');
  name.className = 'folder-name';
  name.textContent = folder.title;

  header.appendChild(icon);
  header.appendChild(name);
  header.addEventListener('click', () => {
    folderItem.classList.toggle('collapsed');
  });

  const children = document.createElement('div');
  children.className = 'folder-children';

  folder.children.forEach(child => {
    if (child.url) {
      children.appendChild(createBookmarkElement(child));
    } else if (child.children && child.children.length > 0) {
      children.appendChild(createFolderElement(child));
    }
  });

  folderItem.appendChild(header);
  folderItem.appendChild(children);

  return folderItem;
}
