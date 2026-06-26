<template>
  <div id="app-container">
    <!-- Page Background -->
    <video
      v-if="backgroundImage && isVideo"
      ref="bgVideoRef"
      class="page-background-video"
      autoplay
      muted
      playsinline
      @timeupdate="handleVideoTimeUpdate"
    >
      <source :src="backgroundImage" type="video/webm">
    </video>
    <div v-else-if="backgroundImage" class="page-background" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>

    <!-- Theme Toggle Button -->
    <button class="theme-btn" @click.stop="toggleTheme" :aria-label="theme === 'dark' ? '切换到浅色' : '切换到深色'">
      <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="20" height="20">
        <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM4.22 5.64a1 1 0 011.42 0l1.42 1.42a1 1 0 11-1.42 1.42L4.22 7.05a1 1 0 010-1.41zm12.72 12.72a1 1 0 011.42 0l1.42 1.41a1 1 0 11-1.42 1.42l-1.42-1.42a1 1 0 010-1.41zM2 12a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm17 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM5.64 19.78a1 1 0 010-1.42l1.42-1.42a1 1 0 111.42 1.42l-1.42 1.42a1 1 0 01-1.42 0zM18.36 5.64a1 1 0 010 1.42l-1.42 1.42a1 1 0 11-1.42-1.42l1.42-1.42a1 1 0 011.42 0z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="20" height="20">
        <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73 8.15 8.15 0 01-8.14-8.1 8.59 8.59 0 01.25-2A1 1 0 008 2.36a10.14 10.14 0 1014 11.69 1 1 0 00-.36-1.05z"/>
      </svg>
    </button>

    <!-- Settings Button -->
    <button class="settings-btn" @click.stop="toggleSettings" aria-label="设置">
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </svg>
    </button>

    <!-- Settings Panel -->
    <Transition name="settings-panel">
    <SettingsPanel
      v-if="showSettings"
      :show-config-panel="showConfigPanel"
      :config-module-type="configModuleType"
      :top-modules="topModules"
      :left-modules="leftModules"
      :right-modules="rightModules"
      :background-image="backgroundImage"
      :import-error="importError"
      :background-save-error="backgroundSaveError"
      :editing-config="editingConfig"
      :editing-id="editingId"
      :module-configs="moduleConfigs"
      @export="exportLayout"
      @file-import="handleFileImport"
      @add-module="addModule"
      @remove-module="removeModule"
      @move-module="moveModule"
      @open-config="openConfig"
      @close-config="closeConfig"
      @update-config="updateConfig"
      @update-background-image="updateBackgroundImage"
      @reset-layout="resetLayout"
    />
    </Transition>

    <!-- Main Layout -->
    <div class="main-layout" :class="{ 'has-background': backgroundImage }" @click="closeSettings">
      <!-- Top Panel -->
      <div class="top-panel">
        <ModuleRenderer
          v-for="m in topModules"
          :key="m.id"
          :module="m"
          :config="getModuleConfig(m)"
          :bookmarks="allBookmarks"
          :direct-bookmarks="directBookmarks"
          :subfolders="subfolders"
          @update-config="(cfg) => updateConfig(m.id, cfg)"
        />
      </div>

      <div class="bottom-panels">
        <!-- Left Panel -->
        <div class="left-panel">
          <ModuleRenderer
            v-for="m in leftModules"
            :key="m.id"
            :module="m"
            :config="getModuleConfig(m)"
            :bookmarks="allBookmarks"
            :direct-bookmarks="directBookmarks"
            :subfolders="subfolders"
            @update-config="(cfg) => updateConfig(m.id, cfg)"
          />
        </div>

        <!-- Right Panel -->
        <div class="right-panel">
          <ModuleRenderer
            v-for="m in rightModules"
            :key="m.id"
            :module="m"
            :config="getModuleConfig(m)"
            :bookmarks="allBookmarks"
            :direct-bookmarks="directBookmarks"
            :subfolders="subfolders"
            @update-config="(cfg) => updateConfig(m.id, cfg)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import ModuleRenderer from './components/ModuleRenderer.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { defaultModuleConfigs } from './modules/types'

const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10))

const toInstances = (arr) => {
  if (!Array.isArray(arr)) return null
  return arr.filter(t => typeof t === 'string' && t in defaultModuleConfigs).map(t => ({ id: makeId(), type: t }))
}

const isInstanceArray = (arr) =>
  Array.isArray(arr) && arr.every(x => x && typeof x === 'object' && typeof x.type === 'string' && typeof x.id === 'string' && x.type in defaultModuleConfigs)

const defaultLayout = () => ({
  top: [],
  left: [
    { id: makeId(), type: 'bookmark-search' },
    { id: makeId(), type: 'folder' }
  ],
  right: [
    { id: makeId(), type: 'web-search' },
    { id: makeId(), type: 'quick-access' }
  ]
})

export default {
  name: 'App',
  components: { ModuleRenderer, SettingsPanel },
  setup() {
    const showSettings = ref(false)
    const showConfigPanel = ref(false)
    const configModuleType = ref('')
    const editingId = ref('')
    const editingConfig = computed(() => editingId.value ? (moduleConfigs[editingId.value] || {}) : {})

    const topModules = ref([])
    const leftModules = ref([])
    const rightModules = ref([])
    const moduleConfigs = reactive({})
    const backgroundImage = ref('')
    const importError = ref('')
    const backgroundSaveError = ref('')
    const bgVideoRef = ref(null)
    const theme = ref('light')

    const isVideo = computed(() => {
      return backgroundImage.value && backgroundImage.value.startsWith('data:video/')
    })

    const handleVideoTimeUpdate = () => {
      const video = bgVideoRef.value
      if (!video || !video.duration) return
      if (video.duration - video.currentTime < 0.3) {
        video.currentTime = 0
      }
    }

    const allBookmarks = ref([])
    const directBookmarks = ref([])
    const subfolders = ref([])

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
        backgroundImage: backgroundImage.value,
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

    const handleFileImport = (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (isInstanceArray(data.top)) topModules.value = data.top
          if (isInstanceArray(data.left)) leftModules.value = data.left
          if (isInstanceArray(data.right)) rightModules.value = data.right
          if (data.backgroundImage) backgroundImage.value = data.backgroundImage
          if (data.moduleConfigs) {
            Object.assign(moduleConfigs, data.moduleConfigs)
            saveModuleConfigs()
          }
          saveLayoutSettings()
          importError.value = ''
        } catch (err) {
          importError.value = '导入失败：无效的 JSON 文件'
        }
      }
      reader.readAsText(file)
      event.target.value = ''
    }

    const getModuleConfig = (m) => {
      if (!moduleConfigs[m.id]) {
        moduleConfigs[m.id] = { ...defaultModuleConfigs[m.type] }
        saveModuleConfigs()
      }
      return moduleConfigs[m.id]
    }

    const addModule = (type, side) => {
      const instance = { id: makeId(), type }
      if (side === 'top') {
        topModules.value.push(instance)
      } else if (side === 'left') {
        leftModules.value.push(instance)
      } else {
        rightModules.value.push(instance)
      }
      saveLayoutSettings()
    }

    const removeModule = (id) => {
      const removeFrom = (arr) => {
        const idx = arr.findIndex(m => m.id === id)
        if (idx >= 0) arr.splice(idx, 1)
      }
      removeFrom(topModules.value)
      removeFrom(leftModules.value)
      removeFrom(rightModules.value)
      delete moduleConfigs[id]
      saveLayoutSettings()
      saveModuleConfigs()
    }

    const moveModule = (id, direction) => {
      const find = (arr) => arr.findIndex(m => m.id === id)
      const topIdx = find(topModules.value)
      const leftIdx = find(leftModules.value)
      const rightIdx = find(rightModules.value)

      let arr, idx
      if (topIdx >= 0) { arr = topModules.value; idx = topIdx }
      else if (leftIdx >= 0) { arr = leftModules.value; idx = leftIdx }
      else if (rightIdx >= 0) { arr = rightModules.value; idx = rightIdx }
      else return

      const newIndex = idx + direction
      if (newIndex < 0 || newIndex >= arr.length) return
      const temp = arr[idx]
      arr[idx] = arr[newIndex]
      arr[newIndex] = temp
      saveLayoutSettings()
    }

    const openConfig = (id, type) => {
      configModuleType.value = type
      editingId.value = id
      if (!moduleConfigs[id]) {
        moduleConfigs[id] = { ...defaultModuleConfigs[type] }
        saveModuleConfigs()
      }
      showConfigPanel.value = true
    }

    const closeConfig = () => {
      showConfigPanel.value = false
    }

    const updateConfig = (id, value) => {
      moduleConfigs[id] = { ...(moduleConfigs[id] || {}), ...value }
      saveModuleConfigs()
    }

    const resetLayout = () => {
      topModules.value = []
      leftModules.value = []
      rightModules.value = []
      saveLayoutSettings()
    }

    const updateBackgroundImage = (value) => {
      backgroundImage.value = value
      saveBackgroundImage()
    }

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    watch(theme, (newVal) => {
      document.body.classList.toggle('dark', newVal === 'dark')
      localStorage.setItem('theme', newVal)
    })

    watch(backgroundImage, (newVal) => {
      if (newVal) {
        document.body.classList.add('has-page-background')
      } else {
        document.body.classList.remove('has-page-background')
      }
    })

    const loadLayoutSettings = () => {
      const saved = localStorage.getItem('layoutSettings')
      const fallback = defaultLayout()
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          topModules.value = isInstanceArray(settings.top) ? settings.top : fallback.top
          leftModules.value = isInstanceArray(settings.left) ? settings.left : fallback.left
          rightModules.value = isInstanceArray(settings.right) ? settings.right : fallback.right
        } catch (e) {
          console.error('布局设置解析失败:', e)
          topModules.value = fallback.top
          leftModules.value = fallback.left
          rightModules.value = fallback.right
        }
        backgroundImage.value = localStorage.getItem('backgroundImage') || ''
      } else {
        topModules.value = fallback.top
        leftModules.value = fallback.left
        rightModules.value = fallback.right
      }
    }

    const saveLayoutSettings = () => {
      localStorage.setItem('layoutSettings', JSON.stringify({
        top: topModules.value,
        left: leftModules.value,
        right: rightModules.value
      }))
    }

    const saveBackgroundImage = () => {
      if (backgroundImage.value) {
        try {
          localStorage.setItem('backgroundImage', backgroundImage.value)
          backgroundSaveError.value = ''
        } catch (e) {
          console.error('背景图保存失败，文件可能过大:', e)
          backgroundSaveError.value = '背景图保存失败，文件可能过大（已显示但不会持久化）'
        }
      } else {
        localStorage.removeItem('backgroundImage')
        backgroundSaveError.value = ''
      }
    }

    const loadModuleConfigs = () => {
      const saved = localStorage.getItem('moduleConfigs')
      if (saved) {
        try {
          const configs = JSON.parse(saved)
          Object.assign(moduleConfigs, configs)
        } catch (e) {
          console.error('模块配置解析失败:', e)
        }
      }
    }

    const saveModuleConfigs = () => {
      localStorage.setItem('moduleConfigs', JSON.stringify(moduleConfigs))
    }

    const loadBookmarks = () => {
      if (typeof chrome === 'undefined' || !chrome.bookmarks) return
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

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme')
      theme.value = savedTheme === 'dark' ? 'dark' : 'light'
      document.body.classList.toggle('dark', theme.value === 'dark')
      loadLayoutSettings()
      if (backgroundImage.value) {
        document.body.classList.add('has-page-background')
      }
      loadModuleConfigs()
      loadBookmarks()
    })

    return {
      showSettings,
      showConfigPanel,
      configModuleType,
      editingId,
      editingConfig,
      moduleConfigs,
      topModules,
      leftModules,
      rightModules,
      backgroundImage,
      importError,
      backgroundSaveError,
      theme,
      isVideo,
      bgVideoRef,
      handleVideoTimeUpdate,
      allBookmarks,
      directBookmarks,
      subfolders,
      toggleSettings,
      closeSettings,
      exportLayout,
      handleFileImport,
      getModuleConfig,
      addModule,
      removeModule,
      moveModule,
      openConfig,
      closeConfig,
      updateConfig,
      resetLayout,
      updateBackgroundImage,
      toggleTheme
    }
  }
}
</script>
