<template>
  <div id="app-container">
    <!-- Page Background -->
    <video
      v-if="backgroundUrl && isVideo"
      ref="bgVideoRef"
      class="page-background-video"
      :style="videoStyle"
      autoplay
      muted
      playsinline
      @timeupdate="handleVideoTimeUpdate"
    >
      <source :src="backgroundUrl" type="video/webm">
    </video>
    <div v-else-if="backgroundUrl" class="page-background" :style="bgStyle"></div>

    <!-- Clock Widget (fixed top-left) -->
    <ClockWidget v-if="clockSettings.show" :settings="clockSettings" />

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
      :background-url="backgroundUrl"
      :background-type="backgroundType"
      :background-settings="backgroundSettings"
      :import-error="importError"
      :import-success="importSuccess"
      :background-save-error="backgroundSaveError"
      :editing-config="editingConfig"
      :editing-id="editingId"
      :module-configs="moduleConfigs"
      :clock-settings="clockSettings"
      :theme-mode="themeMode"
      :theme-schedule="themeSchedule"
      @update-theme-mode="setThemeMode"
      @update-theme-schedule="updateThemeSchedule"
      @update-clock="updateClockSettings"
      @export="exportLayout"
      @file-import="handleFileImport"
      @add-module="addModule"
      @remove-module="removeModule"
      @reorder-module="reorderModule"
      @open-config="openConfig"
      @close-config="closeConfig"
      @update-config="updateConfig"
      @select-background="selectBackground"
      @clear-background="clearBackgroundImage"
      @update-background-settings="updateBackgroundSettings"
      @reset-layout="resetLayout"
    />
    </Transition>

    <!-- Main Layout -->
    <div class="main-layout" :class="{ 'has-background': backgroundUrl }" @click="closeSettings">
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
import ClockWidget from './components/ClockWidget.vue'
import { useEscClose } from './composables/useEscClose'
import { getBackground, putBackground, clearBackground, dataURLToBlob, blobToDataURL } from './composables/useBackgroundStore'
import { defaultModuleConfigs } from './modules/types'
import { storageGet, storageSet, requestPersistentStorage } from './composables/useSettingsStore'

const defaultClockSettings = () => ({ show: true, style: 'stacked', hour12: false, showSeconds: true })

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
  components: { ModuleRenderer, SettingsPanel, ClockWidget },
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
    const backgroundUrl = ref('')   // 渲染用的 object URL
    const backgroundType = ref('')  // 'image' | 'video'
    const backgroundSettings = reactive({ fit: 'cover', position: 'center' })
    const importError = ref('')
    const importSuccess = ref('')
    const backgroundSaveError = ref('')
    const bgVideoRef = ref(null)
    const themeMode = ref('light') // light | dark | auto | schedule
    const themeSchedule = reactive({ darkStart: '18:00', darkEnd: '06:00' })
    const theme = ref('light') // 实际生效的主题(由 themeMode 派生)
    const clockSettings = reactive(defaultClockSettings())

    const isVideo = computed(() => backgroundType.value === 'video')

    // 背景图样式:适配方式 + 位置
    const positionValue = computed(() => {
      const map = { center: 'center', top: 'top center', bottom: 'bottom center', left: 'left center', right: 'right center' }
      return map[backgroundSettings.position] || 'center'
    })
    const bgStyle = computed(() => {
      const fit = backgroundSettings.fit
      return {
        backgroundImage: `url(${backgroundUrl.value})`,
        backgroundSize: fit === 'cover' ? 'cover' : fit === 'contain' ? 'contain' : 'auto',
        backgroundRepeat: fit === 'tile' ? 'repeat' : 'no-repeat',
        backgroundPosition: positionValue.value
      }
    })
    const videoStyle = computed(() => ({
      objectFit: backgroundSettings.fit === 'contain' ? 'contain' : 'cover',
      objectPosition: positionValue.value
    }))

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

    // 设置面板:Esc 关闭(模块配置面板叠加时由其自身优先处理)
    useEscClose(showSettings, closeSettings)

    // 设置面板:点击面板/相关弹窗以外的区域时收回
    const onOutsideClick = (e) => {
      const el = e.target
      if (el.closest && el.closest('.settings-panel, .settings-btn, .config-overlay, .folder-modal-overlay, .qa-modal-overlay')) return
      closeSettings()
    }
    watch(showSettings, (open) => {
      if (open) document.addEventListener('mousedown', onOutsideClick)
      else document.removeEventListener('mousedown', onOutsideClick)
    })

    const exportLayout = async () => {
      let backgroundImage = ''
      const blob = await getBackground()
      if (blob) {
        try { backgroundImage = await blobToDataURL(blob) } catch (e) { /* 忽略 */ }
      }
      const data = {
        top: JSON.parse(JSON.stringify(topModules.value)),
        left: JSON.parse(JSON.stringify(leftModules.value)),
        right: JSON.parse(JSON.stringify(rightModules.value)),
        backgroundImage,
        backgroundSettings: JSON.parse(JSON.stringify(backgroundSettings)),
        moduleConfigs: JSON.parse(JSON.stringify(moduleConfigs)),
        themeMode: themeMode.value,
        themeSchedule: JSON.parse(JSON.stringify(themeSchedule)),
        clockSettings: JSON.parse(JSON.stringify(clockSettings))
      }
      const json = JSON.stringify(data, null, 2)
      const jsonBlob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(jsonBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bookmarks-layout.json'
      a.click()
      URL.revokeObjectURL(url)
    }

    const handleFileImport = (event) => {
      const file = event.target.files[0]
      if (!file) return
      importError.value = ''
      importSuccess.value = ''

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (isInstanceArray(data.top)) topModules.value = data.top
          if (isInstanceArray(data.left)) leftModules.value = data.left
          if (isInstanceArray(data.right)) rightModules.value = data.right
          if (data.backgroundImage) {
            const blob = dataURLToBlob(data.backgroundImage)
            if (blob) selectBackground(blob)
          }
          if (data.backgroundSettings && typeof data.backgroundSettings === 'object') {
            updateBackgroundSettings(data.backgroundSettings)
          }
          if (data.moduleConfigs && typeof data.moduleConfigs === 'object') {
            // 替换语义:导入=恢复完整快照,清掉当前孤儿配置后再写入
            Object.keys(moduleConfigs).forEach(k => delete moduleConfigs[k])
            Object.assign(moduleConfigs, data.moduleConfigs)
            saveModuleConfigs()
          }
          // 主题:先恢复定时区间,再设模式,保证 applyTheme 用到正确区间
          if (data.themeSchedule && typeof data.themeSchedule === 'object') {
            updateThemeSchedule(data.themeSchedule)
          }
          if (['light', 'dark', 'auto', 'schedule'].includes(data.themeMode)) {
            setThemeMode(data.themeMode)
          }
          if (data.clockSettings && typeof data.clockSettings === 'object') {
            updateClockSettings(data.clockSettings)
          }
          saveLayoutSettings()
          importError.value = ''
          importSuccess.value = '导入成功'
        } catch (err) {
          importSuccess.value = ''
          importError.value = '导入失败：无效的 JSON 文件'
        }
      }
      reader.readAsText(file)
      event.target.value = ''
    }

    const getModuleConfig = (m) => {
      // 仅在内存里补默认值供渲染,不持久化:默认值是确定性的,渲染期写存储会在
      // 加载竞态下覆盖已保存配置。真正的持久化交给 openConfig/updateConfig。
      if (!moduleConfigs[m.id]) {
        moduleConfigs[m.id] = { ...defaultModuleConfigs[m.type] }
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

    // 拖拽排序:把模块移到目标区域的指定位置(支持同区重排与跨区移动)
    const reorderModule = (id, toSide, toIndex) => {
      const arrays = { top: topModules, left: leftModules, right: rightModules }
      const dst = arrays[toSide]
      if (!dst) return
      let srcArr = null
      let srcIdx = -1
      for (const key of ['top', 'left', 'right']) {
        const i = arrays[key].value.findIndex(m => m.id === id)
        if (i >= 0) { srcArr = arrays[key]; srcIdx = i; break }
      }
      if (!srcArr) return
      const [moved] = srcArr.value.splice(srcIdx, 1)
      let idx = toIndex
      if (idx < 0) idx = 0
      if (idx > dst.value.length) idx = dst.value.length
      dst.value.splice(idx, 0, moved)
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

    const applyBackgroundBlob = (blob) => {
      if (backgroundUrl.value) URL.revokeObjectURL(backgroundUrl.value)
      backgroundUrl.value = URL.createObjectURL(blob)
      backgroundType.value = blob.type.startsWith('video') ? 'video' : 'image'
    }

    const selectBackground = async (file) => {
      if (!file) return
      applyBackgroundBlob(file)
      try {
        await putBackground(file)
        backgroundSaveError.value = ''
      } catch (e) {
        console.error('背景图保存失败:', e)
        backgroundSaveError.value = '背景图保存失败（已显示但不会持久化）'
      }
    }

    const clearBackgroundImage = () => {
      if (backgroundUrl.value) URL.revokeObjectURL(backgroundUrl.value)
      backgroundUrl.value = ''
      backgroundType.value = ''
      backgroundSaveError.value = ''
      clearBackground()
    }

    const updateBackgroundSettings = (partial) => {
      Object.assign(backgroundSettings, partial)
      storageSet('backgroundSettings', backgroundSettings)
    }

    let darkMql = null
    let scheduleTimer = null

    const toMinutes = (hhmm) => {
      const [h, m] = String(hhmm).split(':').map(Number)
      return (h || 0) * 60 + (m || 0)
    }

    const computeEffectiveTheme = () => {
      if (themeMode.value === 'dark') return 'dark'
      if (themeMode.value === 'auto') return darkMql && darkMql.matches ? 'dark' : 'light'
      if (themeMode.value === 'schedule') {
        const now = new Date()
        const cur = now.getHours() * 60 + now.getMinutes()
        const start = toMinutes(themeSchedule.darkStart)
        const end = toMinutes(themeSchedule.darkEnd)
        // start <= end 同日区间;否则为跨夜区间
        const inDark = start <= end ? cur >= start && cur < end : cur >= start || cur < end
        return inDark ? 'dark' : 'light'
      }
      return 'light'
    }

    const applyTheme = () => {
      theme.value = computeEffectiveTheme()
      document.body.classList.toggle('dark', theme.value === 'dark')
    }

    const refreshThemeWatchers = () => {
      if (scheduleTimer) { clearInterval(scheduleTimer); scheduleTimer = null }
      if (themeMode.value === 'schedule') {
        scheduleTimer = setInterval(applyTheme, 30000)
      }
    }

    const setThemeMode = (mode) => {
      themeMode.value = mode
      storageSet('themeMode', mode)
      refreshThemeWatchers()
      applyTheme()
    }

    const updateThemeSchedule = (partial) => {
      Object.assign(themeSchedule, partial)
      storageSet('themeSchedule', themeSchedule)
      applyTheme()
    }

    // 顶部按钮:在浅色/深色显式模式间快速切换
    const toggleTheme = () => {
      setThemeMode(theme.value === 'dark' ? 'light' : 'dark')
    }

    const updateClockSettings = (partial) => {
      Object.assign(clockSettings, partial)
      storageSet('clockSettings', clockSettings)
    }

    watch(backgroundUrl, (newVal) => {
      if (newVal) {
        document.body.classList.add('has-page-background')
      } else {
        document.body.classList.remove('has-page-background')
      }
    })

    // 从 IndexedDB 加载背景;迁移旧的 localStorage.backgroundImage(base64)
    const loadBackground = async (bsValue) => {
      if (bsValue && typeof bsValue === 'object') Object.assign(backgroundSettings, bsValue)

      let blob = await getBackground()
      if (!blob) {
        const legacy = localStorage.getItem('backgroundImage')
        if (legacy) {
          blob = dataURLToBlob(legacy)
          if (blob) { try { await putBackground(blob) } catch (e) { /* 忽略 */ } }
          localStorage.removeItem('backgroundImage')
        }
      }
      if (blob) applyBackgroundBlob(blob)
    }

    const loadLayoutSettings = (settings) => {
      const fallback = defaultLayout()
      if (settings && typeof settings === 'object') {
        topModules.value = isInstanceArray(settings.top) ? settings.top : fallback.top
        leftModules.value = isInstanceArray(settings.left) ? settings.left : fallback.left
        rightModules.value = isInstanceArray(settings.right) ? settings.right : fallback.right
      } else {
        topModules.value = fallback.top
        leftModules.value = fallback.left
        rightModules.value = fallback.right
      }
    }

    const saveLayoutSettings = () => {
      storageSet('layoutSettings', {
        top: topModules.value,
        left: leftModules.value,
        right: rightModules.value
      })
    }


    const loadModuleConfigs = (configs) => {
      if (configs && typeof configs === 'object') Object.assign(moduleConfigs, configs)
    }

    const saveModuleConfigs = () => {
      storageSet('moduleConfigs', moduleConfigs)
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

    onMounted(async () => {
      // 申请持久化存储,保护 IndexedDB 背景图/favicon 不被站点数据清理驱逐
      requestPersistentStorage()

      const store = await storageGet([
        'themeMode', 'theme', 'themeSchedule', 'clockSettings',
        'backgroundSettings', 'layoutSettings', 'moduleConfigs'
      ])

      // 主题模式:优先读 themeMode,回退旧的 theme 值做迁移
      const savedMode = store.themeMode
      themeMode.value = ['light', 'dark', 'auto', 'schedule'].includes(savedMode)
        ? savedMode
        : (store.theme === 'dark' ? 'dark' : 'light')
      if (store.themeSchedule && typeof store.themeSchedule === 'object') {
        Object.assign(themeSchedule, store.themeSchedule)
      }
      if (typeof matchMedia !== 'undefined') {
        darkMql = matchMedia('(prefers-color-scheme: dark)')
        darkMql.addEventListener('change', applyTheme)
      }
      refreshThemeWatchers()
      applyTheme()
      if (store.clockSettings && typeof store.clockSettings === 'object') {
        Object.assign(clockSettings, store.clockSettings)
      }
      // 必须先填充模块配置,再放出模块实例:否则 await 间隙里模块先渲染,
      // getModuleConfig 见配置为空会写默认值并覆盖存储,冲掉已保存的配置(如快速访问文件夹)
      loadModuleConfigs(store.moduleConfigs)
      loadLayoutSettings(store.layoutSettings)
      loadBookmarks()
      await loadBackground(store.backgroundSettings)
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
      backgroundUrl,
      backgroundType,
      backgroundSettings,
      bgStyle,
      videoStyle,
      importError,
      importSuccess,
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
      reorderModule,
      openConfig,
      closeConfig,
      updateConfig,
      resetLayout,
      selectBackground,
      clearBackgroundImage,
      updateBackgroundSettings,
      toggleTheme,
      themeMode,
      themeSchedule,
      setThemeMode,
      updateThemeSchedule,
      clockSettings,
      updateClockSettings
    }
  }
}
</script>
