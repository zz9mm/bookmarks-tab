<template>
  <div class="module-box title-section">
    <div class="title-content" :style="titleStyle">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text?: string
  fontSize?: number
  align?: string
  fontFamily?: string
  textIndent?: number
}>()

const titleStyle = computed(() => ({
  fontSize: (props.fontSize || 24) + 'px',
  textAlign: props.align as 'left' | 'center' | 'right' || 'center',
  fontFamily: props.fontFamily || 'inherit',
  textIndent: (props.textIndent || 0) + 'em'
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
