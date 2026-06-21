<template>
  <div class="config-item">
    <label>默认搜索引擎</label>
    <select :value="config?.engine || 'bing'" @change="emit('update-config', { ...(config || {}), engine: ($event.target as HTMLSelectElement).value })">
      <option value="bing">Bing</option>
      <option value="baidu">百度</option>
      <option value="google">Google</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { ModuleConfig } from '../types'

defineProps<{
  config?: ModuleConfig
}>()

defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()
</script>