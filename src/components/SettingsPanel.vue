<template>
  <div class="settings-panel" @click.stop role="dialog" aria-modal="true" aria-label="设置面板">
    <!-- 背景图设置 -->
    <div class="settings-section">
      <div class="settings-subtitle">页面背景图</div>
      <div class="config-item">
        <input type="file" accept="image/*,.webm" @change="handleBackgroundImageSelect" ref="backgroundImageInput">
        <div v-if="backgroundError" class="inline-error">{{ backgroundError }}</div>
      </div>
      <div v-if="backgroundSaveError" class="inline-error">{{ backgroundSaveError }}</div>
      <div v-if="backgroundImage" class="config-item">
        <video v-if="isBackgroundVideo" class="background-preview" autoplay muted playsinline @timeupdate="handlePreviewVideoTimeUpdate" ref="previewVideoRef">
          <source :src="backgroundImage" type="video/webm">
        </video>
        <div v-else class="background-preview" :style="`background-image: url(${backgroundImage})`"></div>
        <button class="clear-background-btn" @click="clearBackgroundImage">清除背景图</button>
      </div>
    </div>
    <div class="settings-header">
      <div class="settings-title">布局设置</div>
      <div class="settings-actions">
        <button class="settings-action-btn" @click="triggerImport" title="导入布局">导入</button>
        <button class="settings-action-btn" @click="$emit('export')" title="导出布局">导出</button>
      </div>
      <input type="file" ref="fileInput" @change="handleFileImport" accept=".json" style="display: none;">
      <div v-if="importError" class="inline-error" style="padding: 0 20px 8px">{{ importError }}</div>
    </div>
    <div class="settings-section">
      <div class="settings-subtitle">可用模块</div>
      <div class="module-palette">
        <div v-for="module in availableModules" :key="module.type" class="module-item">
          <span>{{ module.name }}</span>
          <div>
            <button class="module-add-btn" @click="$emit('add-module', module.type, 'top')" title="添加到顶部">↑</button>
            <button class="module-add-btn" @click="$emit('add-module', module.type, 'left')" title="添加到左侧">←</button>
            <button class="module-add-btn" @click="$emit('add-module', module.type, 'right')" title="添加到右侧">→</button>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-section" v-for="(modules, side) in sideModules" :key="side">
      <div class="settings-subtitle">{{ sideLabel(side) }}</div>
      <div class="module-list">
        <div v-for="(module, index) in modules" :key="module.id" class="module-item">
          <span>{{ getModuleName(module.type) }}</span>
          <div class="module-actions">
            <button class="module-move" @click="$emit('move-module', module.id, -1)" :disabled="index === 0" title="上移">↑</button>
            <button class="module-move" @click="$emit('move-module', module.id, 1)" :disabled="index === modules.length - 1" title="下移">↓</button>
            <button v-if="hasConfig(module.type)" class="module-config" @click="$emit('open-config', module.id, module.type)" title="配置">⚙</button>
            <button class="module-remove" @click="$emit('remove-module', module.id)">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Module Config Panel -->
    <div v-if="showConfigPanel" class="module-config-panel" @click.stop role="dialog" aria-modal="true" aria-label="模块设置">
      <div class="config-header">
        <span class="config-title">模块设置</span>
        <button class="config-close" @click="$emit('close-config')">&times;</button>
      </div>
      <div class="config-content">
        <component
          :is="configComponent"
          :config="editingConfig"
          @update-config="handleConfigUpdate"
        />
      </div>
    </div>

    <button class="reset-layout-btn" @click="confirmReset">重置布局</button>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, toRefs } from 'vue'
import { moduleList } from '../modules/types'
import type { ModuleInstance, ModuleConfig } from '../modules/types'

const WebSearchConfig = defineAsyncComponent(() => import('../modules/web-search/config.vue'))
const QuickAccessConfig = defineAsyncComponent(() => import('../modules/quick-access/config.vue'))
const TitleConfig = defineAsyncComponent(() => import('../modules/title/config.vue'))
const MinimaxUsageConfig = defineAsyncComponent(() => import('../modules/minimax-usage/config.vue'))
const DesktopIconsConfig = defineAsyncComponent(() => import('../modules/desktop-icons/config.vue'))

const configComponents: Record<string, any> = {
  'web-search': WebSearchConfig,
  'quick-access': QuickAccessConfig,
  'title': TitleConfig,
  'minimax-usage': MinimaxUsageConfig,
  'desktop-icons': DesktopIconsConfig
}

const props = defineProps<{
  showConfigPanel: boolean
  configModuleType: string
  topModules?: ModuleInstance[]
  leftModules?: ModuleInstance[]
  rightModules?: ModuleInstance[]
  backgroundImage?: string
  importError?: string
  backgroundSaveError?: string
  editingConfig?: ModuleConfig
  editingId?: string
}>()

const { backgroundImage } = toRefs(props)

const isBackgroundVideo = computed(() => {
  return backgroundImage.value?.startsWith('data:video/')
})

const emit = defineEmits<{
  (e: 'export'): void
  (e: 'file-import', event: Event): void
  (e: 'add-module', type: string, side: 'top' | 'left' | 'right'): void
  (e: 'remove-module', id: string): void
  (e: 'move-module', id: string, direction: number): void
  (e: 'open-config', id: string, type: string): void
  (e: 'close-config'): void
  (e: 'update-config', id: string, config: ModuleConfig): void
  (e: 'update-background-image', value: string): void
  (e: 'reset-layout'): void
}>()

const previewVideoRef = ref<HTMLVideoElement | null>(null)

const handlePreviewVideoTimeUpdate = () => {
  const video = previewVideoRef.value
  if (!video || !video.duration) return
  if (video.duration - video.currentTime < 0.3) {
    video.currentTime = 0
  }
}

const availableModules = moduleList
const backgroundError = ref('')
const backgroundImageInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const triggerImport = () => {
  fileInput.value?.click()
}

const MAX_BACKGROUND_SIZE = 4 * 1024 * 1024

const handleBackgroundImageSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > MAX_BACKGROUND_SIZE) {
    backgroundError.value = '文件过大，请选择小于 4MB 的图片或视频'
    return
  }
  backgroundError.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (result) {
      emit('update-background-image', result)
    }
  }
  reader.readAsDataURL(file)
  if (backgroundImageInput.value) {
    backgroundImageInput.value.value = ''
  }
}

const clearBackgroundImage = () => {
  emit('update-background-image', '')
}

const getModuleName = (type: string): string => {
  const module = moduleList.find(m => m.type === type)
  return module?.name || type
}

const hasConfig = (type: string): boolean => {
  const module = moduleList.find(m => m.type === type)
  return module?.hasConfig || false
}

const configComponent = computed(() => configComponents[props.configModuleType])

const sideModules = computed(() => ({
  left: props.leftModules || [],
  right: props.rightModules || [],
  top: props.topModules || []
}))

const sideLabel = (side: string): string => {
  if (side === 'left') return '左侧模块'
  if (side === 'right') return '右侧模块'
  return '顶部模块（全宽）'
}

const editingConfig = computed(() => props.editingConfig || {})

const handleFileImport = (event: Event) => {
  emit('file-import', event)
}

const handleConfigUpdate = (cfg: ModuleConfig) => {
  if (props.editingId) {
    emit('update-config', props.editingId, cfg)
  }
}

const confirmReset = () => {
  if (confirm('确定重置布局？所有自定义布局将恢复默认。')) {
    emit('reset-layout')
  }
}
</script>

<style scoped>
.background-preview {
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  margin-top: 8px;
}

.clear-background-btn {
  margin-top: 8px;
  min-height: 34px;
  padding: 6px 10px;
  color: var(--color-danger);
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.inline-error {
  color: var(--color-danger);
  background: var(--color-danger-bg);
  border: 1px solid rgba(220, 38, 38, 0.16);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  margin-top: 6px;
}
</style>
