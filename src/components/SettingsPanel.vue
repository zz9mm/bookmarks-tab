<template>
  <div class="settings-panel" @click.stop role="dialog" aria-modal="true" aria-label="设置面板">
    <!-- 背景图设置 -->
    <div class="settings-section accordion">
      <button type="button" class="accordion-header" @click="toggle('background')" :aria-expanded="expanded.background">
        <span class="accordion-arrow" :class="{ open: expanded.background }">▸</span>
        <span class="accordion-title">页面背景图</span>
      </button>
      <div v-show="expanded.background" class="accordion-body">
        <div class="config-item">
          <input type="file" accept="image/*,.webm" @change="handleBackgroundImageSelect" ref="backgroundImageInput">
          <div v-if="backgroundError" class="inline-error">{{ backgroundError }}</div>
        </div>
        <div v-if="backgroundSaveError" class="inline-error">{{ backgroundSaveError }}</div>
        <template v-if="backgroundUrl">
          <div class="config-item">
            <video v-if="isBackgroundVideo" class="background-preview" autoplay muted playsinline @timeupdate="handlePreviewVideoTimeUpdate" ref="previewVideoRef">
              <source :src="backgroundUrl" type="video/webm">
            </video>
            <div v-else class="background-preview" :style="`background-image: url(${backgroundUrl})`"></div>
            <button class="clear-background-btn" @click="$emit('clear-background')">清除背景图</button>
          </div>
          <div class="config-item">
            <label>适配方式</label>
            <select :value="backgroundSettings?.fit || 'cover'" @change="emit('update-background-settings', { fit: ($event.target as HTMLSelectElement).value })">
              <option value="cover">填充（裁剪铺满）</option>
              <option value="contain">适应（完整显示）</option>
              <option value="tile">平铺</option>
              <option value="original">原尺寸</option>
            </select>
          </div>
          <div class="config-item">
            <label>位置</label>
            <select :value="backgroundSettings?.position || 'center'" @change="emit('update-background-settings', { position: ($event.target as HTMLSelectElement).value })">
              <option value="center">居中</option>
              <option value="top">顶部</option>
              <option value="bottom">底部</option>
              <option value="left">左侧</option>
              <option value="right">右侧</option>
            </select>
          </div>
        </template>
      </div>
    </div>

    <!-- 主题设置 -->
    <div class="settings-section accordion">
      <button type="button" class="accordion-header" @click="toggle('theme')" :aria-expanded="expanded.theme">
        <span class="accordion-arrow" :class="{ open: expanded.theme }">▸</span>
        <span class="accordion-title">主题</span>
      </button>
      <div v-show="expanded.theme" class="accordion-body">
        <div class="config-item">
          <label>主题模式</label>
          <select :value="themeMode || 'light'" @change="emit('update-theme-mode', ($event.target as HTMLSelectElement).value)">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="auto">跟随系统</option>
            <option value="schedule">定时切换</option>
          </select>
        </div>
        <template v-if="themeMode === 'schedule'">
          <div class="config-item">
            <label>深色开始</label>
            <input type="time" :value="themeSchedule?.darkStart || '18:00'" @change="emit('update-theme-schedule', { darkStart: ($event.target as HTMLInputElement).value })">
          </div>
          <div class="config-item">
            <label>深色结束</label>
            <input type="time" :value="themeSchedule?.darkEnd || '06:00'" @change="emit('update-theme-schedule', { darkEnd: ($event.target as HTMLInputElement).value })">
          </div>
        </template>
      </div>
    </div>

    <!-- 时钟设置 -->
    <div class="settings-section accordion">
      <button type="button" class="accordion-header" @click="toggle('clock')" :aria-expanded="expanded.clock">
        <span class="accordion-arrow" :class="{ open: expanded.clock }">▸</span>
        <span class="accordion-title">时钟</span>
      </button>
      <div v-show="expanded.clock" class="accordion-body">
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
    </div>

    <div class="settings-header">
      <div class="settings-title">布局设置</div>
      <div class="settings-actions">
        <button class="settings-action-btn" @click="triggerImport" title="导入布局">导入</button>
        <button class="settings-action-btn" @click="$emit('export')" title="导出布局">导出</button>
      </div>
      <input type="file" ref="fileInput" @change="handleFileImport" accept=".json" style="display: none;">
      <div v-if="importError" class="inline-error" style="padding: 0 20px 8px">{{ importError }}</div>
      <div v-if="importSuccess" style="padding: 0 20px 8px; color: #16a34a; font-size: 13px">{{ importSuccess }}</div>
    </div>

    <!-- 可用模块 -->
    <div class="settings-section accordion">
      <button type="button" class="accordion-header" @click="toggle('palette')" :aria-expanded="expanded.palette">
        <span class="accordion-arrow" :class="{ open: expanded.palette }">▸</span>
        <span class="accordion-title">可用模块</span>
      </button>
      <div v-show="expanded.palette" class="accordion-body">
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
    </div>

    <div class="settings-section accordion" v-for="(modules, side) in sideModules" :key="side">
      <button type="button" class="accordion-header" @click="toggle(side)" :aria-expanded="expanded[side]">
        <span class="accordion-arrow" :class="{ open: expanded[side] }">▸</span>
        <span class="accordion-title">{{ sideLabel(side) }}</span>
        <span class="accordion-count">{{ modules.length }}</span>
      </button>
      <div v-show="expanded[side]" class="module-list" @dragover.prevent @drop="onListDrop(side, $event)">
        <div
          v-for="(module, index) in modules"
          :key="module.id"
          class="module-item"
          :class="{
            'module-item-active': showConfigPanel && module.id === editingId,
            'mod-dragging': dragId === module.id,
            'mod-drag-over': overKey === `${side}:${index}` && dragId && dragId !== module.id
          }"
          draggable="true"
          @dragstart="onItemDragStart(module.id, $event)"
          @dragover="onItemDragOver(side, index, $event)"
          @drop.stop="onItemDrop(side, index, $event)"
          @dragend="resetItemDrag"
        >
          <span class="module-grip" title="拖拽排序">⠿</span>
          <div class="module-label">
            <span class="module-name">
              {{ getModuleName(module.type) }}
            </span>
            <span v-if="instanceMeta[module.id]?.detail" class="module-detail">{{ instanceMeta[module.id].detail }}</span>
          </div>
          <div class="module-actions">
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
import { computed, defineAsyncComponent, reactive, ref, toRefs } from 'vue'
import { moduleList } from '../modules/types'
import { useEscClose } from '../composables/useEscClose'
import type { ModuleInstance, ModuleConfig } from '../modules/types'

interface ClockSettings {
  show?: boolean
  style?: string
  hour12?: boolean
  showSeconds?: boolean
}

interface ThemeSchedule {
  darkStart?: string
  darkEnd?: string
}

interface BackgroundSettings {
  fit?: string
  position?: string
}

const WebSearchConfig = defineAsyncComponent(() => import('../modules/web-search/config.vue'))
const QuickAccessConfig = defineAsyncComponent(() => import('../modules/quick-access/config.vue'))
const TitleConfig = defineAsyncComponent(() => import('../modules/title/config.vue'))
const TodoConfig = defineAsyncComponent(() => import('../modules/todo/config.vue'))

const configComponents: Record<string, any> = {
  'web-search': WebSearchConfig,
  'quick-access': QuickAccessConfig,
  'title': TitleConfig,
  'todo': TodoConfig
}

const props = defineProps<{
  showConfigPanel: boolean
  configModuleType: string
  topModules?: ModuleInstance[]
  leftModules?: ModuleInstance[]
  rightModules?: ModuleInstance[]
  backgroundUrl?: string
  backgroundType?: string
  backgroundSettings?: BackgroundSettings
  importError?: string
  importSuccess?: string
  backgroundSaveError?: string
  editingConfig?: ModuleConfig
  editingId?: string
  moduleConfigs?: Record<string, ModuleConfig>
  clockSettings?: ClockSettings
  themeMode?: string
  themeSchedule?: ThemeSchedule
}>()

const { backgroundType } = toRefs(props)

const isBackgroundVideo = computed(() => backgroundType.value === 'video')

const emit = defineEmits<{
  (e: 'export'): void
  (e: 'file-import', event: Event): void
  (e: 'add-module', type: string, side: 'top' | 'left' | 'right'): void
  (e: 'remove-module', id: string): void
  (e: 'reorder-module', id: string, toSide: string, toIndex: number): void
  (e: 'open-config', id: string, type: string): void
  (e: 'close-config'): void
  (e: 'update-config', id: string, config: ModuleConfig): void
  (e: 'select-background', file: File): void
  (e: 'clear-background'): void
  (e: 'update-background-settings', partial: Partial<BackgroundSettings>): void
  (e: 'update-clock', partial: Partial<ClockSettings>): void
  (e: 'update-theme-mode', mode: string): void
  (e: 'update-theme-schedule', partial: Partial<ThemeSchedule>): void
  (e: 'reset-layout'): void
}>()

// 模块配置面板:Esc 关闭(叠在设置面板之上,优先于设置面板)
useEscClose(computed(() => !!props.showConfigPanel), () => emit('close-config'))

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

// 存 IndexedDB,放宽到 50MB(原始 Blob,无 base64 膨胀)
const MAX_BACKGROUND_SIZE = 50 * 1024 * 1024

const handleBackgroundImageSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > MAX_BACKGROUND_SIZE) {
    backgroundError.value = '文件过大，请选择小于 50MB 的图片或视频'
    return
  }
  backgroundError.value = ''
  emit('select-background', file)
  if (backgroundImageInput.value) {
    backgroundImageInput.value.value = ''
  }
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

// 为每个模块实例生成可识别的配置内容(用于在列表里区分同类型模块)
const instanceMeta = computed(() => {
  const all = [
    ...(props.topModules || []),
    ...(props.leftModules || []),
    ...(props.rightModules || [])
  ]
  const meta: Record<string, { detail: string }> = {}
  for (const m of all) {
    const cfg = props.moduleConfigs?.[m.id] || {}
    let detail = ''
    if (m.type === 'title') detail = String(cfg.text ?? '').trim()
    else if (m.type === 'quick-access') detail = String(cfg.folderName ?? '').trim()
    else if (m.type === 'web-search') detail = engineLabels[String(cfg.engine ?? '')] || ''
    else if (m.type === 'todo') detail = String(cfg.title ?? '').trim()
    meta[m.id] = { detail }
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

// 折叠区块状态:外观类默认收起,区域模块默认展开
const expanded = reactive<Record<string, boolean>>({
  background: false,
  theme: false,
  clock: false,
  palette: false,
  top: true,
  left: true,
  right: true
})
const toggle = (key: string) => { expanded[key] = !expanded[key] }

// 模块列表拖拽排序(支持同区重排与跨区移动)
const dragId = ref('')
const overKey = ref('')

const onItemDragStart = (id: string, e: DragEvent) => {
  dragId.value = id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}

const onItemDragOver = (side: string, index: number, e: DragEvent) => {
  e.preventDefault()
  overKey.value = `${side}:${index}`
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

const resetItemDrag = () => {
  dragId.value = ''
  overKey.value = ''
}

const onItemDrop = (side: string, index: number, e: DragEvent) => {
  e.preventDefault()
  const id = dragId.value
  resetItemDrag()
  if (id) emit('reorder-module', id, side, index)
}

// 落到区域列表空白处:追加到该区末尾
const onListDrop = (side: string, e: DragEvent) => {
  e.preventDefault()
  const id = dragId.value
  resetItemDrag()
  if (id) emit('reorder-module', id, side, sideModules.value[side as 'top' | 'left' | 'right'].length)
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
/* 折叠区块 */
.settings-section.accordion {
  padding: 0;
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 650;
  transition: background 0.12s;
}

.accordion-header:hover {
  background: var(--color-surface-hover);
}

.accordion-arrow {
  flex-shrink: 0;
  font-size: 10px;
  transition: transform 0.15s;
}

.accordion-arrow.open {
  transform: rotate(90deg);
}

.accordion-title {
  flex: 1;
}

.accordion-count {
  flex-shrink: 0;
  min-width: 18px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 999px;
}

.accordion-body {
  padding: 0 16px 14px;
}

.settings-section.accordion .module-list {
  margin: 0 16px 14px;
}

/* 模块列表拖拽 */
.module-item {
  cursor: grab;
}

.module-grip {
  flex-shrink: 0;
  margin-right: 4px;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1;
  cursor: grab;
  user-select: none;
}

.mod-dragging {
  opacity: 0.4;
}

.mod-drag-over {
  outline: 2px dashed var(--color-primary);
  outline-offset: -2px;
}

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
