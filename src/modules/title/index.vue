<template>
  <div class="module-box title-section">
    <div class="title-content" :style="titleStyle">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ModuleConfig } from '../types'

const props = defineProps<{
  config?: ModuleConfig
}>()

defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const text = computed(() => (props.config?.text as string) ?? '文本')

const titleStyle = computed(() => ({
  fontSize: ((props.config?.fontSize as number) || 24) + 'px',
  textAlign: (props.config?.align as 'left' | 'center' | 'right') || 'center',
  fontFamily: (props.config?.fontFamily as string) || 'inherit',
  textIndent: ((props.config?.textIndent as number) || 0) + 'em'
}))
</script>

<style scoped>
.title-section {
  padding: 12px 16px;
}

.title-content {
  font-weight: 600;
  color: #333;
  word-break: break-word;
}
</style>