<template>
  <div class="config-item">
    <label>默认搜索引擎</label>
    <select :value="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option value="bing">Bing</option>
      <option value="baidu">百度</option>
      <option value="google">Google</option>
    </select>
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
