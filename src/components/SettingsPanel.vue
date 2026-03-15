<template>
  <div class="settings-panel" :class="{ show: show }" @click.stop>
    <div class="settings-header">
      <div class="settings-title">布局设置</div>
      <div class="settings-actions">
        <button class="settings-action-btn" @click="$emit('import')" title="导入布局">导入</button>
        <button class="settings-action-btn" @click="$emit('export')" title="导出布局">导出</button>
      </div>
      <input type="file" ref="fileInput" @change="handleFileImport" accept=".json" style="display: none;">
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
    <div class="settings-section">
      <div class="settings-subtitle">左侧模块</div>
      <div class="module-list">
        <div v-for="(module, index) in leftModules" :key="'left-' + index" class="module-item">
          <span>{{ getModuleName(module) }}</span>
          <div class="module-actions">
            <button class="module-move" @click="$emit('move-module', 'left', index, -1)" :disabled="index === 0" title="上移">↑</button>
            <button class="module-move" @click="$emit('move-module', 'left', index, 1)" :disabled="index === (leftModules?.length ?? 0) - 1" title="下移">↓</button>
            <button v-if="hasConfig(module)" class="module-config" @click="$emit('open-config', 'left', index, module)" title="配置">⚙</button>
            <button class="module-remove" @click="$emit('remove-module', 'left', index)">×</button>
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
            <button class="module-move" @click="$emit('move-module', 'right', index, -1)" :disabled="index === 0" title="上移">↑</button>
            <button class="module-move" @click="$emit('move-module', 'right', index, 1)" :disabled="index === (rightModules?.length ?? 0) - 1" title="下移">↓</button>
            <button v-if="hasConfig(module)" class="module-config" @click="$emit('open-config', 'right', index, module)" title="配置">⚙</button>
            <button class="module-remove" @click="$emit('remove-module', 'right', index)">×</button>
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
            <button class="module-move" @click="$emit('move-module', 'top', index, -1)" :disabled="index === 0" title="上移">↑</button>
            <button class="module-move" @click="$emit('move-module', 'top', index, 1)" :disabled="index === (topModules?.length ?? 0) - 1" title="下移">↓</button>
            <button v-if="hasConfig(module)" class="module-config" @click="$emit('open-config', 'top', index, module)" title="配置">⚙</button>
            <button class="module-remove" @click="$emit('remove-module', 'top', index)">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Module Config Panel -->
    <div v-if="showConfigPanel" class="module-config-panel" @click.stop>
      <div class="config-header">
        <span class="config-title">模块设置</span>
        <button class="config-close" @click="$emit('close-config')">&times;</button>
      </div>
      <div class="config-content">
        <component
          :is="configComponent"
          :model-value="configModuleType === 'minimax-usage' ? tempConfig : tempConfig?.[currentConfigKey]"
          @update:model-value="handleConfigUpdate"
          :config="tempConfig"
          @update:config="handleConfigUpdateFull"
        />
      </div>
    </div>

    <button class="reset-layout-btn" @click="$emit('reset-layout')">重置布局</button>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { moduleList } from '../modules/types'

// 动态导入模块配置组件
const WebSearchConfig = defineAsyncComponent(() => import('../modules/web-search/config.vue'))
const QuickAccessConfig = defineAsyncComponent(() => import('../modules/quick-access/config.vue'))
const TitleConfig = defineAsyncComponent(() => import('../modules/title/config.vue'))
const MinimaxUsageConfig = defineAsyncComponent(() => import('../modules/minimax-usage/config.vue'))

const configComponents: Record<string, any> = {
  'web-search': WebSearchConfig,
  'quick-access': QuickAccessConfig,
  'title': TitleConfig,
  'minimax-usage': MinimaxUsageConfig
}

interface TempConfig {
  cols?: number
  engine?: string
  text?: string
  fontSize?: number
  align?: string
  fontFamily?: string
  textIndent?: number
  apiKey?: string
  defaultModel?: string
  showAllModels?: boolean
  [key: string]: unknown
}

const props = defineProps<{
  show: boolean
  showConfigPanel: boolean
  configModuleType: string
  tempConfig?: TempConfig
  topModules?: string[]
  leftModules?: string[]
  rightModules?: string[]
}>()

const emit = defineEmits<{
  (e: 'import'): void
  (e: 'export'): void
  (e: 'file-import', event: Event): void
  (e: 'add-module', type: string, side: 'top' | 'left' | 'right'): void
  (e: 'remove-module', side: string, index: number): void
  (e: 'move-module', side: string, index: number, direction: number): void
  (e: 'open-config', side: string, index: number, type: string): void
  (e: 'close-config'): void
  (e: 'update-config', key: string, value: unknown): void
  (e: 'reset-layout'): void
}>()

const availableModules = moduleList

const getModuleName = (type: string): string => {
  const module = moduleList.find(m => m.type === type)
  return module?.name || type
}

const hasConfig = (type: string): boolean => {
  const module = moduleList.find(m => m.type === type)
  return module?.hasConfig || false
}

const currentConfigKey = computed(() => {
  const keyMap: Record<string, string> = {
    'web-search': 'engine',
    'quick-access': 'cols',
    'title': '',
    'minimax-usage': 'apiKey'
  }
  return keyMap[props.configModuleType] || ''
})

const configComponent = computed(() => {
  return configComponents[props.configModuleType]
})

const handleFileImport = (event: Event) => {
  emit('file-import', event)
}

const handleConfigUpdate = (value: unknown) => {
  if (props.configModuleType === 'minimax-usage') {
    // minimax-usage 传递整个配置对象
    emit('update-config', 'minimax-usage', value)
  } else {
    const key = currentConfigKey.value
    if (key) {
      emit('update-config', key, value)
    }
  }
}

const handleConfigUpdateFull = (key: string, value: unknown) => {
  emit('update-config', key, value)
}
</script>
