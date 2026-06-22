<template>
  <div class="module-box">
    <div class="minimax-usage">
      <div class="minimax-header">
        <h2 class="minimax-title">Minimax 用量查询</h2>
        <button class="minimax-refresh" @click="fetchUsage" :disabled="loading || !apiKey">
          {{ loading ? '查询中...' : '刷新' }}
        </button>
      </div>

      <div v-if="!apiKey" class="minimax-empty">
        请在模块设置中配置 API Key
      </div>

      <div v-else class="minimax-result">
        <div v-if="error" class="minimax-error">{{ error }}</div>
        <div v-else-if="displayedModels.length > 0" class="minimax-data">
          <div v-for="model in displayedModels" :key="model.model_name" class="model-card">
            <div class="model-name">{{ model.model_name }}</div>
            <div class="model-stats">
              <div class="stat-item">
                <span class="stat-label">已使用:</span>
                <span class="stat-value">{{ model.current_interval_total_count - model.current_interval_usage_count }} / {{ model.current_interval_total_count }}</span>
              </div>
              <div class="stat-progress">
                <div class="progress-bar">
                  <div class="progress-bar-inner" :style="{ width: (model.current_interval_total_count ? (model.current_interval_total_count - model.current_interval_usage_count) / model.current_interval_total_count * 100 : 0) + '%' }"></div>
                </div>
                <span class="progress-percent">{{ model.current_interval_total_count ? Math.round((model.current_interval_total_count - model.current_interval_usage_count) / model.current_interval_total_count * 100) : 0 }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ formatTimeRange(model.start_time, model.end_time) }}</span>
                <span class="stat-value">{{ formatRemainsTime(model.remains_time) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="minimax-empty">点击刷新按钮查询用量</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { ModuleConfig } from '../types'

interface ModelRemain {
  model_name: string
  current_interval_total_count: number
  current_interval_usage_count: number
  start_time: number
  end_time: number
  remains_time: number
}

const props = defineProps<{
  config?: ModuleConfig
}>()

defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const apiKey = computed(() => (props.config?.apiKey as string) || '')
const defaultModel = computed(() => (props.config?.defaultModel as string) || '')
const showAllModels = computed(() => !!props.config?.showAllModels)

const displayedModels = computed(() => {
  if (!modelRemains.value.length) return []
  if (showAllModels.value) return modelRemains.value
  if (defaultModel.value) {
    return modelRemains.value.filter(m => m.model_name === defaultModel.value)
  }
  return [modelRemains.value[0]]
})

const loading = ref(false)
const error = ref('')
const modelRemains = ref<ModelRemain[]>([])

let timer: ReturnType<typeof setInterval> | null = null

const startPolling = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (apiKey.value) {
      fetchUsage()
    }
  }, 60000)
}

const stopPolling = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  if (apiKey.value) {
    fetchUsage()
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})

watch(apiKey, (newKey) => {
  if (newKey) {
    fetchUsage()
    startPolling()
  } else {
    stopPolling()
    modelRemains.value = []
  }
})

watch([defaultModel, showAllModels], () => {
  if (apiKey.value && !modelRemains.value.length) {
    fetchUsage()
  }
})

const fetchUsage = async () => {
  if (!apiKey.value) return

  loading.value = true
  error.value = ''

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

    const data = await response.json() as { model_remains?: ModelRemain[], code?: number, data?: ModelRemain, message?: string }
    if (data.model_remains) {
      modelRemains.value = data.model_remains
    } else if (data.code === 0 && data.data) {
      modelRemains.value = [data.data]
    } else {
      throw new Error(data.message || '获取用量失败')
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '获取用量失败'
    modelRemains.value = []
  } finally {
    loading.value = false
  }
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const formatTimeRange = (start: number, end: number) => {
  if (!start || !end) return '-'
  return `${formatTime(start)} - ${formatTime(end)}`
}

const formatRemainsTime = (seconds: number) => {
  if (!seconds) return '-'
  const ms = Math.floor(seconds / 1000)
  const hours = Math.floor(ms / 3600)
  const minutes = Math.floor((ms % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟后重置`
  }
  return `${minutes}分钟后重置`
}

defineExpose({ fetchUsage })
</script>

<style scoped>
.minimax-usage {
  padding: 14px;
}

.minimax-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.minimax-title {
  font-weight: 650;
  font-size: 14px;
  color: var(--color-text);
}

.minimax-refresh {
  min-height: 32px;
  padding: 5px 10px;
  font-size: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 650;
  transition: background 0.16s ease, border-color 0.16s ease;
}

.minimax-refresh:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
}

.minimax-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.minimax-result {
  font-size: 13px;
}

.minimax-error {
  color: var(--color-danger);
  padding: 8px;
  background: var(--color-danger-bg);
  border: 1px solid rgba(220, 38, 38, 0.16);
  border-radius: 6px;
}

.minimax-data {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-card {
  padding: 10px;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.model-name {
  font-weight: 650;
  color: var(--color-text);
  margin-bottom: 8px;
}

.model-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.stat-label {
  color: var(--color-text-muted);
}

.stat-value {
  font-weight: 500;
  color: var(--color-text);
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-percent {
  font-size: 12px;
  color: var(--color-text-muted);
  min-width: 40px;
  text-align: right;
}

.minimax-empty {
  color: var(--color-text-muted);
  text-align: center;
  padding: 20px;
}
</style>
