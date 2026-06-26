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

    <!-- 时钟设置 -->
    <div class="settings-section">
      <div class="settings-subtitle">时钟</div>
      <div class="config-item">
        <label>显示时钟</label>
        <select :value="(clockSettings?.show ?? true) ? '1' : '0'" @change="emit('update-clock', { show: ($event.target as HTMLSelectElement).value === '1' })">
          <option value="1">显示</option>
          <option value="0">隐藏</option>
        </select>
      </div>
      <template v-if="clockSettings?.show ?? true">
        <div class="config-item">
          <label>样式</label>
          <select :value="clockSettings?.style || 'stacked'" @change="emit('update-clock', { style: ($event.target as HTMLSelectElement).value })">
            <option value="minimal">简约（纯时间）</option>
            <option value="stacked">时间 + 日期</option>
            <option value="card">玻璃卡片</option>
          </select>
        </div>
        <div class="config-item">
          <label>时间格式</label>
          <select :value="(clockSettings?.hour12) ? '12' : '24'" @change="emit('update-clock', { hour12: ($event.target as HTMLSelectElement).value === '12' })">
            <option value="24">24 小时制</option>
            <option value="12">12 小时制</option>
          </select>
        </div>
        <div class="config-item">
          <label>显示秒</label>
          <select :value="(clockSettings?.showSeconds ?? true) ? '1' : '0'" @change="emit('update-clock', { showSeconds: ($event.target as HTMLSelectElement).value === '1' })">
            <option value="1">显示</option>
            <option value="0">隐藏</option>
          </select>
        </div>
      </template>
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
        <div
          v-for="(module, index) in modules"
          :key="module.id"
          class="module-item"
          :class="{ 'module-item-active': showConfigPanel && module.id === editingId }"
        >
          <div class="module-label">
            <span class="module-name">
              {{ getModuleName(module.type) }}
              <span v-if="instanceMeta[module.id]?.total > 1" class="module-ordinal">#{{ instanceMeta[module.id].ordinal }}</span>
            </span>
            <span v-if="instanceMeta[module.id]?.detail" class="module-detail">{{ instanceMeta[module.id].detail }}</span>
          </div>
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
    <Teleport to="body">
      <div v-if="showConfigPanel" class="config-overlay" @click="$emit('close-config')">
        <div class="module-config-panel" @click.stop role="dialog" aria-modal="true" aria-label="模块设置">
          <div class="config-header">
            <span class="config-title">
              {{ getModuleName(configModuleType) }}
              <span v-if="editingMeta?.detail" class="config-title-detail">· {{ editingMeta.detail }}</span>
              <span v-else-if="editingMeta?.total > 1" class="config-title-detail">· #{{ editingMeta.ordinal }}</span>
            </span>
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
      </div>
    </Teleport>

    <button class="reset-layout-btn" @click="confirmReset">重置布局</button>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, toRefs } from 'vue'
import { moduleList } from '../modules/types'
import type { ModuleInstance, ModuleConfig } from '../modules/types'

interface ClockSettings {
  show?: boolean
  style?: string
  hour12?: boolean
  showSeconds?: boolean
}

const WebSearchConfig = defineAsyncComponent(() => import('../modules/web-search/config.vue'))
const QuickAccessConfig = defineAsyncComponent(() => import('../modules/quick-access/config.vue'))
const TitleConfig = defineAsyncComponent(() => import('../modules/title/config.vue'))

const configComponents: Record<string, any> = {
  'web-search': WebSearchConfig,
  'quick-access': QuickAccessConfig,
  'title': TitleConfig
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
  moduleConfigs?: Record<string, ModuleConfig>
  clockSettings?: ClockSettings
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
  (e: 'update-clock', partial: Partial<ClockSettings>): void
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

const engineLabels: Record<string, string> = {
  bing: 'Bing',
  baidu: '百度',
  google: 'Google'
}

// 为每个模块实例生成区分信息：同类型的序号 + 可识别的配置内容
const instanceMeta = computed(() => {
  const all = [
    ...(props.topModules || []),
    ...(props.leftModules || []),
    ...(props.rightModules || [])
  ]
  const counts: Record<string, number> = {}
  const totals: Record<string, number> = {}
  for (const m of all) totals[m.type] = (totals[m.type] || 0) + 1

  const meta: Record<string, { ordinal: number; total: number; detail: string }> = {}
  for (const m of all) {
    counts[m.type] = (counts[m.type] || 0) + 1
    const cfg = props.moduleConfigs?.[m.id] || {}
    let detail = ''
    if (m.type === 'title') detail = String(cfg.text ?? '').trim()
    else if (m.type === 'quick-access') detail = String(cfg.folderName ?? '').trim()
    else if (m.type === 'web-search') detail = engineLabels[String(cfg.engine ?? '')] || ''
    meta[m.id] = { ordinal: counts[m.type], total: totals[m.type], detail }
  }
  return meta
})

const editingMeta = computed(() => (props.editingId ? instanceMeta.value[props.editingId] : undefined))

const configComponent = computed(() => configComponents[props.configModuleType])

const sideModules = computed(() => ({
  top: props.topModules || [],
  left: props.leftModules || [],
  right: props.rightModules || []
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

.module-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.module-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.module-ordinal {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0 5px;
  line-height: 16px;
}

.module-detail {
  font-size: 12px;
  font-weight: 450;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

:deep(.module-item.module-item-active) {
  border-color: var(--color-accent, #2563eb);
  box-shadow: 0 0 0 1px var(--color-accent, #2563eb) inset;
}

.config-title-detail {
  font-weight: 450;
  color: var(--color-text-muted);
}

</style>
