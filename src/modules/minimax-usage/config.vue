<template>
  <div class="config-content">
    <div class="config-item">
      <label>API Key</label>
      <div class="api-key-row">
        <input type="password" :value="modelValue?.apiKey" @input="updateConfig('apiKey', ($event.target as HTMLInputElement).value)" placeholder="输入 Minimax API Key">
        <button class="query-models-btn" @click="queryModels" :disabled="!modelValue?.apiKey || querying">
          {{ querying ? '查询中...' : '查询模型' }}
        </button>
      </div>
    </div>

    <div class="config-item" v-if="!modelValue?.showAllModels">
      <label>默认显示模型</label>
      <select :value="modelValue?.defaultModel || ''" @change="updateConfig('defaultModel', ($event.target as HTMLSelectElement).value)">
        <option value="">请先查询模型</option>
        <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
      </select>
      <div v-if="availableModels.length > 0" class="model-list-hint">
        共 {{ availableModels.length }} 个可用模型
      </div>
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
import { ref, watch } from 'vue'

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

const availableModels = ref<string[]>([])
const querying = ref(false)

// 当 API Key 变化时清空模型列表
watch(() => props.modelValue?.apiKey, () => {
  availableModels.value = []
})

const queryModels = async () => {
  if (!props.modelValue?.apiKey) return

  querying.value = true

  try {
    const response = await fetch('https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${props.modelValue.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({})) as { message?: string }
      throw new Error(errData.message || `请求失败: ${response.status}`)
    }

    const data = await response.json() as { model_remains?: { model_name: string }[], code?: number, data?: { model_name: string }, message?: string }
    if (data.model_remains && Array.isArray(data.model_remains)) {
      availableModels.value = data.model_remains.map(m => m.model_name)
    } else if (data.code === 0 && data.data) {
      availableModels.value = [data.data.model_name]
    } else {
      throw new Error(data.message || '获取模型列表失败')
    }
  } catch (err: unknown) {
    console.error('查询模型失败:', err)
    alert(err instanceof Error ? err.message : '查询模型失败')
  } finally {
    querying.value = false
  }
}

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

.api-key-row {
  display: flex;
  gap: 8px;
}

.api-key-row input {
  flex: 1;
}

.query-models-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.query-models-btn:hover:not(:disabled) {
  background: #4338ca;
}

.query-models-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.config-item input[type="text"],
.config-item input[type="password"],
.config-item select {
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
}

.config-item input[type="text"]:focus,
.config-item input[type="password"]:focus,
.config-item select:focus {
  outline: none;
  border-color: #4f46e5;
}

.model-list-hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
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
