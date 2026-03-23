<template>
  <div class="config-item">
    <label>每行显示图标数量</label>
    <select :value="modelValue?.cols" @change="updateConfig('cols', parseInt(($event.target as HTMLSelectElement).value))">
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
interface QuickAccessConfig {
  cols?: number
  backgroundImage?: string
}

const props = defineProps<{
  modelValue?: QuickAccessConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: QuickAccessConfig): void
}>()

const updateConfig = (key: keyof QuickAccessConfig, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
.background-preview {
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-top: 8px;
}
</style>
