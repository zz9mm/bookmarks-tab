<template>
  <div class="config-item">
    <label>布局（列 × 行）</label>
    <select :value="layoutValue" @change="onLayoutChange(($event.target as HTMLSelectElement).value)">
      <option v-for="opt in layouts" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <div class="layout-hint">共显示 {{ cols * rows }} 个书签，多余部分会隐藏</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ModuleConfig } from '../types'

const props = defineProps<{
  config?: ModuleConfig
}>()

const emit = defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const layouts = [
  { value: '3x3', cols: 3, rows: 3, label: '3 × 3（9 个）' },
  { value: '4x3', cols: 4, rows: 3, label: '4 × 3（12 个）' },
  { value: '5x2', cols: 5, rows: 2, label: '5 × 2（10 个）' },
  { value: '6x2', cols: 6, rows: 2, label: '6 × 2（12 个）' },
  { value: '2x4', cols: 2, rows: 4, label: '2 × 4（8 个）' },
  { value: '1x5', cols: 1, rows: 5, label: '1 × 5（5 个）' }
]

const cols = computed(() => (props.config?.cols as number) || 4)
const rows = computed(() => (props.config?.rows as number) || 3)

const layoutValue = computed(() => {
  const matched = layouts.find(l => l.cols === cols.value && l.rows === rows.value)
  return matched?.value || '4x3'
})

const onLayoutChange = (value: string) => {
  const opt = layouts.find(l => l.value === value)
  if (!opt) return
  emit('update-config', { ...(props.config || {}), cols: opt.cols, rows: opt.rows })
}
</script>

<style scoped>
.layout-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 6px;
}
</style>