<template>
  <div class="config-item">
    <label>标题</label>
    <input
      type="text"
      :value="(config?.title as string) ?? ''"
      placeholder="待办"
      @input="emit('update-config', { ...(config || {}), title: ($event.target as HTMLInputElement).value })"
    >
  </div>
  <div class="config-item">
    <label>已完成项</label>
    <select
      :value="(config?.completed as string) || 'keep'"
      @change="emit('update-config', { ...(config || {}), completed: ($event.target as HTMLSelectElement).value })"
    >
      <option value="keep">保持原位</option>
      <option value="bottom">置底</option>
      <option value="hide">隐藏</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { ModuleConfig } from '../types'

defineProps<{
  config?: ModuleConfig
}>()

const emit = defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()
</script>
