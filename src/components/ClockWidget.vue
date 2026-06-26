<template>
  <div class="clock-widget" :class="`clock-style-${style}`">
    <div class="clock-time">{{ timeText }}</div>
    <div v-if="showDate" class="clock-date">{{ dateText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface ClockSettings {
  show?: boolean
  style?: string
  hour12?: boolean
  showSeconds?: boolean
}

const props = defineProps<{
  settings?: ClockSettings
}>()

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const style = computed(() => props.settings?.style || 'stacked')
const hour12 = computed(() => props.settings?.hour12 ?? false)
const showSeconds = computed(() => props.settings?.showSeconds ?? true)
// 简约样式不显示日期，其余样式显示
const showDate = computed(() => style.value !== 'minimal')

const pad = (n: number) => String(n).padStart(2, '0')

const timeText = computed(() => {
  const d = now.value
  let h = d.getHours()
  let suffix = ''
  if (hour12.value) {
    suffix = h >= 12 ? ' PM' : ' AM'
    h = h % 12 || 12
  }
  const parts = [hour12.value ? String(h) : pad(h), pad(d.getMinutes())]
  if (showSeconds.value) parts.push(pad(d.getSeconds()))
  return parts.join(':') + suffix
})

const dateText = computed(() => {
  const d = now.value
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
})
</script>

<style scoped>
.clock-widget {
  position: fixed;
  top: 24px;
  left: 28px;
  z-index: 9990;
  pointer-events: none;
  user-select: none;
  color: var(--color-text);
}

.clock-time {
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
}

.clock-date {
  color: var(--color-text-muted);
  font-size: 14px;
  margin-top: 4px;
}

/* 简约：纯时间大字 */
.clock-style-minimal .clock-time {
  font-size: 44px;
}

/* 日期：时间 + 日期堆叠 */
.clock-style-stacked .clock-time {
  font-size: 48px;
}

/* 卡片：玻璃卡片包裹 */
.clock-style-card {
  padding: 12px 18px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--surface-glass);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}

.clock-style-card .clock-time {
  font-size: 36px;
}

@media (max-width: 640px) {
  .clock-widget {
    top: 12px;
    left: 12px;
  }

  .clock-style-minimal .clock-time,
  .clock-style-stacked .clock-time {
    font-size: 34px;
  }

  .clock-style-card .clock-time {
    font-size: 28px;
  }
}
</style>
