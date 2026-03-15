<template>
  <div id="app-container">
    <!-- Settings Button -->
    <button class="settings-btn" @click.stop="toggleSettings">
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </svg>
    </button>

    <!-- Settings Panel -->
    <SettingsPanel
      :show="showSettings"
      :show-config-panel="showConfigPanel"
      :config-module-type="configModuleType"
      :temp-config="tempConfig"
      :top-modules="topModules"
      :left-modules="leftModules"
      :right-modules="rightModules"
      @import="importLayout"
      @export="exportLayout"
      @file-import="handleFileImport"
      @add-module="addModule"
      @remove-module="removeModule"
      @move-module="moveModule"
      @open-config="openConfig"
      @close-config="closeConfig"
      @update-config="updateConfig"
      @reset-layout="resetLayout"
    />

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
          <MinimaxUsage v-else-if="module === 'minimax-usage'" v-bind="getModuleMinimaxConfig('top', index)" />
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
            <MinimaxUsage v-else-if="module === 'minimax-usage'" v-bind="getModuleMinimaxConfig('left', index)" />
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
            <MinimaxUsage v-else-if="module === 'minimax-usage'" v-bind="getModuleMinimaxConfig('right', index)" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import BookmarkSearch from './modules/bookmark-search/index.vue'
import FolderTree from './modules/folder/index.vue'
import WebSearch from './modules/web-search/index.vue'
import QuickAccess from './modules/quick-access/index.vue'
import Title from './modules/title/index.vue'
import MinimaxUsage from './modules/minimax-usage/index.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { moduleList, defaultModuleConfigs } from './modules/types'

export default {
  name: 'App',
  components: {
    BookmarkSearch,
    FolderTree,
    WebSearch,
    QuickAccess,
    Title,
    MinimaxUsage,
    SettingsPanel
  },
  setup() {
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

    const getModuleName = (type) => {
      const module = moduleList.find(m => m.type === type)
      return module?.name || type
    }

    const hasConfig = (type) => {
      const module = moduleList.find(m => m.type === type)
      return module?.hasConfig || false
    }

    const getModuleConfigKey = (side, index) => `${side}-${index}`

    const getModuleConfig = (side, index, type) => {
      const key = getModuleConfigKey(side, index)
      if (!moduleConfigs[key]) {
        moduleConfigs[key] = { ...defaultModuleConfigs[type] }
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

    const getModuleMinimaxConfig = (side, index) => {
      const config = getModuleConfig(side, index, 'minimax-usage')
      return {
        apiKey: config.apiKey || ''
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

    const updateConfig = (key, value) => {
      tempConfig[key] = value

      const configKey = getModuleConfigKey(configSide.value, configIndex.value)
      moduleConfigs[configKey] = { ...tempConfig }

      if (configModuleType.value === 'web-search' && key === 'engine') {
        currentEngine.value = value
        localStorage.setItem('searchEngine', value)
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
      availableModules: moduleList,
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
      getModuleMinimaxConfig,
      addModule,
      removeModule,
      moveModule,
      openConfig,
      closeConfig,
      updateConfig,
      resetLayout,
      updateEngine
    }
  }
}
</script>
