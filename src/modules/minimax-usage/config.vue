<template>
  <div class="config-content">
    <div class="config-item">
      <label>API Key</label>
      <div class="api-key-row">
        <input type="password" :value="apiKey" @input="emit('update-config', { ...(config || {}), apiKey: ($event.target as HTMLInputElement).value })" placeholder="输入 Minimax API Key">
        <button class="query-models-btn" @click="queryModels" :disabled="!apiKey || querying">
          {{ querying ? '查询中...' : '查询模型' }}
        </button>
      </div>
      <div v-if="queryError" class="query-error">{{ queryError }}</div>
    </div>

    <div class="config-item checkbox-item">
      <label>
        <input type="checkbox" :checked="!!config?.showAllModels" @change="emit('update-config', { ...(config || {}), showAllModels: ($event.target as HTMLInputElement).checked })">
        显示所有模型
      </label>
    </div>

    <div class="config-item" v-if="!config?.showAllModels">
      <label>默认显示模型</label>
      <select :value="(config?.defaultModel as string) || ''" @change="emit('update-config', { ...(config || {}), defaultModel: ($event.target as HTMLSelectElement).value })">
        <option value="">请先查询模型</option>
        <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
      </select>
      <div v-if="availableModels.length > 0" class="model-list-hint">
        共 {{ availableModels.length }} 个可用模型
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ModuleConfig } from '../types'

const props = defineProps<{
  config?: ModuleConfig
}>()

const emit = defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const apiKey = computed(() => (props.config?.apiKey as string) || '')
const availableModels = computed<string[]>(() => (props.config?.availableModels as string[]) || [])

const querying = ref(false)
const queryError = ref('')

const queryModels = async () => {
  if (!apiKey.value) return

  querying.value = true
  queryError.value = ''

  try {
    const response = await fetch('https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.value}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({})) as { message?: string }
      throw new Error(errData.message || `请求失败: ${response.status}`)
    }

    const data = await response.json() as { model_remains?: { model_name: string }[], code?: number, data?: { model_name: string }, message?: string }
    let models: string[] = []
    if (data.model_remains && Array.isArray(data.model_remains)) {
      models = data.model_remains.map(m => m.model_name)
    } else if (data.code === 0 && data.data) {
      models = [data.data.model_name]
    } else {
      throw new Error(data.message || '获取模型列表失败')
    }

    emit('update-config', { ...(props.config || {}), availableModels: models })
  } catch (err: unknown) {
    console.error('查询模型失败:', err)
    queryError.value = err instanceof Error ? err.message : '查询模型失败'
  } finally {
    querying.value = false
  }
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
  background: var(--color-info);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.query-models-btn:hover:not(:disabled) {
  background: var(--color-info-light);
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
  border-color: var(--color-info);
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

.query-error {
  color: var(--color-danger);
  background: var(--color-danger-bg);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  margin-top: 4px;
}
</style>