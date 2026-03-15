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
        <!-- Quick Access Config -->
        <div v-if="configModuleType === 'quick-access'" class="config-item">
          <label>每行显示图标数量</label>
          <select :value="tempConfig?.cols" @change="handleUpdateConfig('cols', parseInt(($event.target as HTMLSelectElement).value))">
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
          <select :value="tempConfig?.engine" @change="handleUpdateConfig('engine', ($event.target as HTMLSelectElement).value)">
            <option value="bing">Bing</option>
            <option value="baidu">百度</option>
            <option value="google">Google</option>
          </select>
        </div>
        <!-- Title Config -->
        <template v-if="configModuleType === 'title'">
          <div class="config-item">
            <label>标题文字</label>
            <input type="text" :value="tempConfig?.text" @input="handleUpdateConfig('text', ($event.target as HTMLInputElement).value)" placeholder="请输入标题文字">
          </div>
          <div class="config-item">
            <label>文字大小</label>
            <select :value="tempConfig?.fontSize" @change="handleUpdateConfig('fontSize', parseInt(($event.target as HTMLSelectElement).value))">
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
            <select :value="tempConfig?.align" @change="handleUpdateConfig('align', ($event.target as HTMLSelectElement).value)">
              <option value="left">靠左</option>
              <option value="center">居中</option>
              <option value="right">靠右</option>
            </select>
          </div>
          <div class="config-item">
            <label>字体</label>
            <select :value="tempConfig?.fontFamily" @change="handleUpdateConfig('fontFamily', ($event.target as HTMLSelectElement).value)">
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
            <select :value="tempConfig?.textIndent" @change="handleUpdateConfig('textIndent', parseInt(($event.target as HTMLSelectElement).value))">
              <option :value="0">无</option>
              <option :value="2">2字符</option>
              <option :value="4">4字符</option>
              <option :value="8">8字符</option>
            </select>
          </div>
        </template>
        <!-- Minimax Usage Config -->
        <div v-if="configModuleType === 'minimax-usage'" class="config-item">
          <label>API Key</label>
          <input type="password" :value="tempConfig?.apiKey" @input="handleUpdateConfig('apiKey', ($event.target as HTMLInputElement).value)" placeholder="输入 Minimax API Key">
        </div>
      </div>
    </div>

    <button class="reset-layout-btn" @click="$emit('reset-layout')">重置布局</button>
  </div>
</template>

<script setup lang="ts">
type ModuleType = 'bookmark-search' | 'folder' | 'web-search' | 'quick-access' | 'title' | 'minimax-usage'

interface ModuleItem {
  type: ModuleType
  name: string
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
}

defineProps<{
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
  (e: 'add-module', type: ModuleType, side: 'top' | 'left' | 'right'): void
  (e: 'remove-module', side: string, index: number): void
  (e: 'move-module', side: string, index: number, direction: number): void
  (e: 'open-config', side: string, index: number, type: string): void
  (e: 'close-config'): void
  (e: 'update-config', key: string, value: unknown): void
  (e: 'reset-layout'): void
}>()

const moduleNames: Record<ModuleType, string> = {
  'bookmark-search': '书签搜索',
  'folder': '收藏夹',
  'web-search': '网页搜索',
  'quick-access': '快速访问',
  'title': '文本',
  'minimax-usage': 'Minimax 用量'
}

const availableModules: ModuleItem[] = [
  { type: 'bookmark-search', name: '书签搜索' },
  { type: 'folder', name: '收藏夹' },
  { type: 'web-search', name: '网页搜索' },
  { type: 'quick-access', name: '快速访问' },
  { type: 'title', name: '文本' },
  { type: 'minimax-usage', name: 'Minimax 用量' }
]

const getModuleName = (type: string): string => moduleNames[type as ModuleType] || type
const hasConfig = (type: string): boolean => type === 'quick-access' || type === 'web-search' || type === 'title' || type === 'minimax-usage'

const handleFileImport = (event: Event) => {
  emit('file-import', event)
}

const handleUpdateConfig = (key: string, value: unknown) => {
  emit('update-config', key, value)
}
</script>
