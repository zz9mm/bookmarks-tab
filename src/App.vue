<template>
  <div id="app-container">
    <!-- Settings Button -->
    <button class="settings-btn" @click.stop="toggleSettings">
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </svg>
    </button>

    <!-- Settings Panel -->
    <div class="settings-panel" :class="{ show: showSettings }" @click.stop>
      <div class="settings-header">
        <div class="settings-title">布局设置</div>
        <div class="settings-actions">
          <button class="settings-action-btn" @click="importLayout" title="导入布局">导入</button>
          <button class="settings-action-btn" @click="exportLayout" title="导出布局">导出</button>
        </div>
        <input type="file" ref="fileInput" @change="handleFileImport" accept=".json" style="display: none;">
      </div>
      <div class="settings-section">
        <div class="settings-subtitle">可用模块</div>
        <div class="module-palette">
          <div v-for="module in availableModules" :key="module.type" class="module-item">
            <span>{{ module.name }}</span>
            <div>
              <button class="module-add-btn" @click="addModule(module.type, 'top')" title="添加到顶部">↑</button>
              <button class="module-add-btn" @click="addModule(module.type, 'left')" title="添加到左侧">←</button>
              <button class="module-add-btn" @click="addModule(module.type, 'right')" title="添加到右侧">→</button>
            </div>
          </div>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-subtitle">左侧模块</div>
        <div class="module-list">
          <div v-for="(module, index) in leftModules" :key="'left-' + index" class="module-item">
            <span>{{ getModuleName(module) }}</span>
            <div class="module-actions">
              <button class="module-move" @click="moveModule('left', index, -1)" :disabled="index === 0" title="上移">↑</button>
              <button class="module-move" @click="moveModule('left', index, 1)" :disabled="index === leftModules.length - 1" title="下移">↓</button>
              <button v-if="hasConfig(module)" class="module-config" @click="openConfig('left', index, module)" title="配置">⚙</button>
              <button class="module-remove" @click="removeModule('left', index)">×</button>
            </div>
          </div>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-subtitle">右侧模块</div>
        <div class="module-list">
          <div v-for="(module, index) in rightModules" :key="'right-' + index" class="module-item">
            <span>{{ getModuleName(module) }}</span>
            <div class="module-actions">
              <button class="module-move" @click="moveModule('right', index, -1)" :disabled="index === 0" title="上移">↑</button>
              <button class="module-move" @click="moveModule('right', index, 1)" :disabled="index === rightModules.length - 1" title="下移">↓</button>
              <button v-if="hasConfig(module)" class="module-config" @click="openConfig('right', index, module)" title="配置">⚙</button>
              <button class="module-remove" @click="removeModule('right', index)">×</button>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-subtitle">顶部模块（全宽）</div>
        <div class="module-list">
          <div v-for="(module, index) in topModules" :key="'top-' + index" class="module-item">
            <span>{{ getModuleName(module) }}</span>
            <div class="module-actions">
              <button class="module-move" @click="moveModule('top', index, -1)" :disabled="index === 0" title="上移">↑</button>
              <button class="module-move" @click="moveModule('top', index, 1)" :disabled="index === topModules.length - 1" title="下移">↓</button>
              <button v-if="hasConfig(module)" class="module-config" @click="openConfig('top', index, module)" title="配置">⚙</button>
              <button class="module-remove" @click="removeModule('top', index)">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Module Config Panel -->
      <div v-if="showConfigPanel" class="module-config-panel" @click.stop>
        <div class="config-header">
          <span class="config-title">模块设置</span>
          <button class="config-close" @click="closeConfig">&times;</button>
        </div>
        <div class="config-content">
          <!-- Quick Access Config -->
          <div v-if="configModuleType === 'quick-access'" class="config-item">
            <label>每行显示图标数量</label>
            <select v-model="tempConfig.cols" @change="saveConfig">
              <option :value="3">3 个</option>
              <option :value="4">4 个</option>
              <option :value="5">5 个</option>
              <option :value="6">6 个</option>
              <option :value="8">8 个</option>
              <option :value="10">10 个</option>
            </select>
          </div>
          <!-- Web Search Config -->
          <div v-if="configModuleType === 'web-search'" class="config-item">
            <label>默认搜索引擎</label>
            <select v-model="tempConfig.engine" @change="saveConfig">
              <option value="bing">Bing</option>
              <option value="baidu">百度</option>
              <option value="google">Google</option>
            </select>
          </div>
          <!-- Title Config -->
          <template v-if="configModuleType === 'title'">
            <div class="config-item">
              <label>标题文字</label>
              <input type="text" v-model="tempConfig.text" @input="saveConfig" placeholder="请输入标题文字">
            </div>
            <div class="config-item">
              <label>文字大小</label>
              <select v-model="tempConfig.fontSize" @change="saveConfig">
                <option :value="16">16px</option>
                <option :value="20">20px</option>
                <option :value="24">24px</option>
                <option :value="28">28px</option>
                <option :value="32">32px</option>
                <option :value="36">36px</option>
                <option :value="40">40px</option>
              </select>
            </div>
            <div class="config-item">
              <label>对齐方式</label>
              <select v-model="tempConfig.align" @change="saveConfig">
                <option value="left">靠左</option>
                <option value="center">居中</option>
                <option value="right">靠右</option>
              </select>
            </div>
            <div class="config-item">
              <label>字体</label>
              <select v-model="tempConfig.fontFamily" @change="saveConfig">
                <option value="inherit">默认字体</option>
                <option value="Microsoft YaHei, sans-serif">微软雅黑</option>
                <option value="SimSun, serif">宋体</option>
                <option value="KaiTi, cursive">楷体</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Courier New, monospace">Courier New</option>
              </select>
            </div>
            <div class="config-item">
              <label>首行缩进</label>
              <select v-model="tempConfig.textIndent" @change="saveConfig">
                <option :value="0">无</option>
                <option :value="2">2字符</option>
                <option :value="4">4字符</option>
                <option :value="8">8字符</option>
              </select>
            </div>
          </template>
        </div>
      </div>

      <button class="reset-layout-btn" @click="resetLayout">重置布局</button>
    </div>

    <!-- Main Layout -->
    <div class="main-layout" @click="closeSettings">
      <!-- Top Panel -->
      <div class="top-panel">
        <template v-for="(module, index) in topModules" :key="'top-' + index">
          <BookmarkSearch v-if="module === 'bookmark-search'" :bookmarks="allBookmarks" />
          <FolderTree v-else-if="module === 'folder'" :folders="subfolders" />
          <WebSearch v-else-if="module === 'web-search'" :defaultEngine="getModuleEngine('top', index)" @engineChange="updateEngine" />
          <QuickAccess v-else-if="module === 'quick-access'" :bookmarks="directBookmarks" :cols="getModuleCols('top', index)" />
          <Title v-else-if="module === 'title'" v-bind="getModuleTitleConfig('top', index)" />
        </template>
      </div>

      <div class="bottom-panels">
        <!-- Left Panel -->
        <div class="left-panel">
          <template v-for="(module, index) in leftModules" :key="'left-' + index">
            <BookmarkSearch v-if="module === 'bookmark-search'" :bookmarks="allBookmarks" />
            <FolderTree v-else-if="module === 'folder'" :folders="subfolders" />
            <WebSearch v-else-if="module === 'web-search'" :defaultEngine="getModuleEngine('left', index)" @engineChange="updateEngine" />
            <QuickAccess v-else-if="module === 'quick-access'" :bookmarks="directBookmarks" :cols="getModuleCols('left', index)" />
            <Title v-else-if="module === 'title'" v-bind="getModuleTitleConfig('left', index)" />
          </template>
        </div>

        <!-- Right Panel -->
        <div class="right-panel">
          <template v-for="(module, index) in rightModules" :key="'right-' + index">
            <BookmarkSearch v-if="module === 'bookmark-search'" :bookmarks="allBookmarks" />
            <FolderTree v-else-if="module === 'folder'" :folders="subfolders" />
            <WebSearch v-else-if="module === 'web-search'" :defaultEngine="getModuleEngine('right', index)" @engineChange="updateEngine" />
            <QuickAccess v-else-if="module === 'quick-access'" :bookmarks="directBookmarks" :cols="getModuleCols('right', index)" />
            <Title v-else-if="module === 'title'" v-bind="getModuleTitleConfig('right', index)" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import BookmarkSearch from './components/BookmarkSearch.vue'
import FolderTree from './components/FolderTree.vue'
import WebSearch from './components/WebSearch.vue'
import QuickAccess from './components/QuickAccess.vue'
import Title from './components/Title.vue'

export default {
  name: 'App',
  components: {
    BookmarkSearch,
    FolderTree,
    WebSearch,
    QuickAccess,
    Title
  },
  setup() {
    // Module definitions
    const availableModules = [
      { type: 'bookmark-search', name: '书签搜索' },
      { type: 'folder', name: '收藏夹' },
      { type: 'web-search', name: '网页搜索' },
      { type: 'quick-access', name: '快速访问' },
      { type: 'title', name: '文本' }
    ]

    const moduleNames = {
      'bookmark-search': '书签搜索',
      'folder': '收藏夹',
      'web-search': '网页搜索',
      'quick-access': '快速访问',
      'title': '文本'
    }

    // State
    const showSettings = ref(false)
    const showConfigPanel = ref(false)
    const configSide = ref('')
    const configIndex = ref(0)
    const configModuleType = ref('')
    const tempConfig = reactive({})
    const fileInput = ref(null)

    const topModules = ref([])
    const leftModules = ref([])
    const rightModules = ref([])
    const moduleConfigs = reactive({})

    const allBookmarks = ref([])
    const directBookmarks = ref([])
    const subfolders = ref([])

    const currentEngine = ref('bing')

    const searchEngines = {
      bing: { url: 'https://www.bing.com/search?q=', name: 'Bing' },
      baidu: { url: 'https://www.baidu.com/s?wd=', name: '百度' },
      google: { url: 'https://www.google.com/search?q=', name: 'Google' }
    }

    // Methods
    const toggleSettings = () => {
      showSettings.value = !showSettings.value
    }

    const closeSettings = () => {
      showSettings.value = false
      showConfigPanel.value = false
    }

    const exportLayout = () => {
      // 深拷贝避免引用问题
      const data = {
        top: JSON.parse(JSON.stringify(topModules.value)),
        left: JSON.parse(JSON.stringify(leftModules.value)),
        right: JSON.parse(JSON.stringify(rightModules.value)),
        moduleConfigs: JSON.parse(JSON.stringify(moduleConfigs))
      }
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bookmarks-layout.json'
      a.click()
      URL.revokeObjectURL(url)
    }

    const importLayout = () => {
      fileInput.value.click()
    }

    const handleFileImport = (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.top) topModules.value = data.top
          if (data.left) leftModules.value = data.left
          if (data.right) rightModules.value = data.right
          if (data.moduleConfigs) {
            Object.assign(moduleConfigs, data.moduleConfigs)
            saveModuleConfigs()
          }
          saveLayoutSettings()
        } catch (err) {
          alert('导入失败：无效的 JSON 文件')
        }
      }
      reader.readAsText(file)
      event.target.value = ''
    }

    const getModuleName = (type) => moduleNames[type] || type

    const hasConfig = (type) => type === 'quick-access' || type === 'web-search' || type === 'title'

    const getModuleConfigKey = (side, index) => `${side}-${index}`

    const getModuleConfig = (side, index, type) => {
      const key = getModuleConfigKey(side, index)
      if (!moduleConfigs[key]) {
        if (type === 'quick-access') {
          moduleConfigs[key] = { cols: 4 }
        } else if (type === 'web-search') {
          moduleConfigs[key] = { engine: 'bing' }
        } else if (type === 'title') {
          moduleConfigs[key] = { text: '文本', fontSize: 24, align: 'center', fontFamily: 'inherit', textIndent: 0 }
        }
      }
      return moduleConfigs[key] || {}
    }

    const getModuleCols = (side, index) => {
      const config = getModuleConfig(side, index, 'quick-access')
      return config.cols || 4
    }

    const getModuleEngine = (side, index) => {
      const config = getModuleConfig(side, index, 'web-search')
      return config.engine || 'bing'
    }

    const getModuleTitleConfig = (side, index) => {
      const config = getModuleConfig(side, index, 'title')
      return {
        text: config.text || '文本',
        fontSize: config.fontSize || 24,
        align: config.align || 'center',
        fontFamily: config.fontFamily || 'inherit',
        textIndent: config.textIndent || 0
      }
    }

    const addModule = (type, side) => {
      if (side === 'top') {
        topModules.value.push(type)
      } else if (side === 'left') {
        leftModules.value.push(type)
      } else {
        rightModules.value.push(type)
      }
      saveLayoutSettings()
    }

    const removeModule = (side, index) => {
      if (side === 'top') {
        topModules.value.splice(index, 1)
      } else if (side === 'left') {
        leftModules.value.splice(index, 1)
      } else {
        rightModules.value.splice(index, 1)
      }
      saveLayoutSettings()
    }

    const moveModule = (side, index, direction) => {
      const modules = side === 'top' ? topModules.value : side === 'left' ? leftModules.value : rightModules.value
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= modules.length) return

      const temp = modules[index]
      modules[index] = modules[newIndex]
      modules[newIndex] = temp
      saveLayoutSettings()
    }

    const openConfig = (side, index, type) => {
      configSide.value = side
      configIndex.value = index
      configModuleType.value = type

      const config = getModuleConfig(side, index, type)
      Object.assign(tempConfig, config)

      showConfigPanel.value = true
    }

    const closeConfig = () => {
      showConfigPanel.value = false
    }

    const saveConfig = () => {
      const key = getModuleConfigKey(configSide.value, configIndex.value)
      moduleConfigs[key] = { ...tempConfig }

      if (configModuleType.value === 'web-search') {
        currentEngine.value = tempConfig.engine
        localStorage.setItem('searchEngine', tempConfig.engine)
      }

      saveModuleConfigs()
    }

    const resetLayout = () => {
      topModules.value = []
      leftModules.value = ['bookmark-search', 'folder']
      rightModules.value = ['web-search', 'quick-access']
      saveLayoutSettings()
    }

    const updateEngine = (engine) => {
      currentEngine.value = engine
      localStorage.setItem('searchEngine', engine)
    }

    // Storage
    const loadLayoutSettings = () => {
      const saved = localStorage.getItem('layoutSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        topModules.value = settings.top || []
        leftModules.value = settings.left || []
        rightModules.value = settings.right || []
      } else {
        topModules.value = []
        leftModules.value = ['bookmark-search', 'folder']
        rightModules.value = ['web-search', 'quick-access']
      }
    }

    const saveLayoutSettings = () => {
      localStorage.setItem('layoutSettings', JSON.stringify({
        top: topModules.value,
        left: leftModules.value,
        right: rightModules.value
      }))
    }

    const loadModuleConfigs = () => {
      const saved = localStorage.getItem('moduleConfigs')
      if (saved) {
        const configs = JSON.parse(saved)
        Object.assign(moduleConfigs, configs)
      }
    }

    const saveModuleConfigs = () => {
      localStorage.setItem('moduleConfigs', JSON.stringify(moduleConfigs))
    }

    const loadSearchEnginePreference = () => {
      const saved = localStorage.getItem('searchEngine')
      if (saved && searchEngines[saved]) {
        currentEngine.value = saved
      }
    }

    // Bookmarks
    const loadBookmarks = () => {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const bookmarksBar = findBookmarksBar(bookmarkTreeNodes)
        if (bookmarksBar && bookmarksBar.children) {
          const direct = []
          const folders = []

          bookmarksBar.children.forEach(child => {
            if (child.url) {
              direct.push(child)
            } else if (child.children && child.children.length > 0) {
              folders.push(child)
            }
          })

          directBookmarks.value = direct
          subfolders.value = folders
          allBookmarks.value = flattenBookmarks([bookmarksBar])
        } else {
          allBookmarks.value = flattenBookmarks(bookmarkTreeNodes)
        }
      })
    }

    const findBookmarksBar = (nodes) => {
      for (const node of nodes) {
        if (node.id === '1' || node.title === '书签栏' || node.title === 'Bookmarks Bar') {
          return node
        }
        if (node.children) {
          const found = findBookmarksBar(node.children)
          if (found) return found
        }
      }
      return null
    }

    const flattenBookmarks = (nodes) => {
      const result = []
      nodes.forEach(node => {
        if (node.url) {
          result.push({
            id: node.id,
            title: node.title,
            url: node.url
          })
        }
        if (node.children) {
          result.push(...flattenBookmarks(node.children))
        }
      })
      return result
    }

    // Lifecycle
    onMounted(() => {
      loadLayoutSettings()
      loadModuleConfigs()
      loadSearchEnginePreference()
      loadBookmarks()
    })

    return {
      showSettings,
      showConfigPanel,
      configSide,
      configIndex,
      configModuleType,
      tempConfig,
      fileInput,
      topModules,
      leftModules,
      rightModules,
      allBookmarks,
      directBookmarks,
      subfolders,
      currentEngine,
      availableModules,
      toggleSettings,
      closeSettings,
      exportLayout,
      importLayout,
      handleFileImport,
      getModuleName,
      hasConfig,
      getModuleCols,
      getModuleEngine,
      getModuleTitleConfig,
      addModule,
      removeModule,
      moveModule,
      openConfig,
      closeConfig,
      saveConfig,
      resetLayout,
      updateEngine
    }
  }
}
</script>
