<template>
  <div class="config-content">
    <div class="config-item">
      <label>API Key</label>
      <input type="password" :value="modelValue?.apiKey" @input="updateConfig('apiKey', ($event.target as HTMLInputElement).value)" placeholder="输入 Minimax API Key">
    </div>
    <div class="config-item">
      <label>默认显示模型</label>
      <input type="text" :value="modelValue?.defaultModel" @input="updateConfig('defaultModel', ($event.target as HTMLInputElement).value)" placeholder="如: abab6.5s-chat">
    </div>
    <div class="config-item checkbox-item">
      <label>
        <input type="checkbox" :checked="modelValue?.showAllModels" @change="updateConfig('showAllModels', ($event.target as HTMLInputElement).checked)">
        显示所有模型
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MinimaxConfig {
  apiKey?: string
  defaultModel?: string
  showAllModels?: boolean
}

const props = defineProps<{
  modelValue?: MinimaxConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: MinimaxConfig): void
}>()

const updateConfig = (key: keyof MinimaxConfig, value: string | boolean) => {
  const current = props.modelValue || {}
  emit('update:modelValue', {
    ...current,
    [key]: value
  })
}
</script>

<style scoped>
.config-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-item label {
  font-size: 13px;
  color: #333;
}

.config-item input[type="text"],
.config-item input[type="password"] {
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
}

.config-item input[type="text"]:focus,
.config-item input[type="password"]:focus {
  outline: none;
  border-color: #4f46e5;
}

.checkbox-item {
  flex-direction: row;
  align-items: center;
}

.checkbox-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
