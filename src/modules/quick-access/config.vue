<template>
  <div class="config-item">
    <label>每行显示图标数量</label>
    <select :value="modelValue" @change="$emit('update:modelValue', parseInt(($event.target as HTMLSelectElement).value))">
      <option :value="3">3 个</option>
      <option :value="4">4 个</option>
      <option :value="5">5 个</option>
      <option :value="6">6 个</option>
      <option :value="8">8 个</option>
      <option :value="10">10 个</option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: number
}>()

defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()
</script>
