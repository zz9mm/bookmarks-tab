<template>
  <div class="config-item">
    <label>API Key</label>
    <input type="password" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" placeholder="输入 Minimax API Key">
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>
