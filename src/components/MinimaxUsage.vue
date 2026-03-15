<template>
  <div class="module-box">
    <div class="minimax-usage">
      <div class="minimax-header">
        <span class="minimax-title">Minimax 用量查询</span>
        <button class="minimax-refresh" @click="fetchUsage" :disabled="loading || !apiKey">
          {{ loading ? '查询中...' : '刷新' }}
        </button>
      </div>

      <div v-if="!apiKey" class="minimax-empty">
        请在模块设置中配置 API Key
      </div>

      <div v-else class="minimax-result">
        <div v-if="error" class="minimax-error">{{ error }}</div>
        <div v-else-if="modelRemains.length > 0" class="minimax-data">
          <div v-for="model in modelRemains" :key="model.model_name" class="model-card">
            <div class="model-name">{{ model.model_name }}</div>
            <div class="model-stats">
              <div class="stat-item">
                <span class="stat-label">已使用:</span>
                <span class="stat-value">{{ model.current_interval_total_count - model.current_interval_usage_count }} / {{ model.current_interval_total_count }}</span>
              </div>
              <div class="stat-progress">
                <div class="progress-bar">
                  <div class="progress-bar-inner" :style="{ width: ((model.current_interval_total_count - model.current_interval_usage_count) / model.current_interval_total_count * 100) + '%' }"></div>
                </div>
                <span class="progress-percent">{{ Math.round((model.current_interval_total_count - model.current_interval_usage_count) / model.current_interval_total_count * 100) }}%</span>
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
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface ModelRemain {
  model_name: string
  current_interval_total_count: number
  current_interval_usage_count: number
  start_time: number
  end_time: number
  remains_time: number
}

const props = defineProps({
  apiKey: {
    type: String,
    default: ''
  }
})

const loading = ref(false)
const error = ref('')
const modelRemains = ref<ModelRemain[]>([])

let timer: ReturnType<typeof setInterval> | null = null

const startPolling = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (props.apiKey) {
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
  if (props.apiKey) {
    fetchUsage()
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})

watch(() => props.apiKey, (newKey) => {
  if (newKey) {
    fetchUsage()
    startPolling()
  } else {
    stopPolling()
    modelRemains.value = []
  }
})

const fetchUsage = async () => {
  if (!props.apiKey) return

  loading.value = true
  error.value = ''

  try {
    const response = await fetch('https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${props.apiKey}`,
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
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}(UTC+8)`
}

const formatTimeRange = (start: number, end: number) => {
  if (!start || !end) return '-'
  return `${formatTime(start)}-${formatTime(end).replace('(UTC+8)', '')}`
}

const formatRemainsTime = (seconds: number) => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时后重置`
  }
  return `${minutes}分钟后重置`
}

defineExpose({ fetchUsage })
</script>

<style scoped>
.minimax-usage {
  padding: 12px;
}

.minimax-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.minimax-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.minimax-refresh {
  padding: 4px 12px;
  font-size: 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.minimax-refresh:hover:not(:disabled) {
  background: #4338ca;
}

.minimax-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.minimax-config {
  display: flex;
  gap: 8px;
}

.minimax-key-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.minimax-save-btn {
  padding: 8px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.minimax-save-btn:hover {
  background: #4338ca;
}

.minimax-result {
  font-size: 13px;
}

.minimax-error {
  color: #dc2626;
  padding: 8px;
  background: #fef2f2;
  border-radius: 4px;
}

.minimax-data {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-card {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.model-name {
  font-weight: 600;
  color: #333;
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
  color: #666;
}

.stat-value {
  font-weight: 500;
  color: #333;
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
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: #4f46e5;
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-percent {
  font-size: 12px;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.minimax-empty {
  color: #999;
  text-align: center;
  padding: 20px;
}
</style>
