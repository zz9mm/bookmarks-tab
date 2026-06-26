<template>
  <div class="module-box todo-section">
    <div class="content-layer">
      <h2 class="todo-header">
        <span class="todo-tag">{{ title }}</span>
        <span v-if="activeCount > 0" class="todo-count">{{ activeCount }}</span>
      </h2>

      <form class="todo-add" @submit.prevent="addTask">
        <input
          v-model="draft"
          class="todo-input"
          type="text"
          maxlength="200"
          placeholder="添加待办，回车确认"
        >
        <button type="submit" class="todo-add-btn" :disabled="!draft.trim()" title="添加">+</button>
      </form>

      <ul v-if="displayItems.length > 0" class="todo-list">
        <li
          v-for="item in displayItems"
          :key="item.id"
          class="todo-item"
          :class="{ done: item.done }"
        >
          <button
            class="todo-check"
            :class="{ checked: item.done }"
            :aria-label="item.done ? '标记未完成' : '标记完成'"
            @click="toggle(item.id)"
          >
            <svg v-if="item.done" viewBox="0 0 24 24" width="12" height="12">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
          <span class="todo-text" :title="item.text">{{ item.text }}</span>
          <button class="todo-del" title="删除" @click="remove(item.id)">×</button>
        </li>
      </ul>
      <div v-else class="empty-state">暂无待办</div>

      <div v-if="doneCount > 0" class="todo-footer">
        <span>{{ doneCount }} 项已完成</span>
        <button class="todo-clear" @click="clearDone">清除已完成</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ModuleConfig } from '../types'

interface Task {
  id: string
  text: string
  done: boolean
}

const props = defineProps<{
  config?: ModuleConfig
}>()

const emit = defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : 'td-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8))

const title = computed(() => (props.config?.title as string) || '待办')
const completedMode = computed(() => (props.config?.completed as string) || 'keep') // keep | bottom | hide
const items = computed<Task[]>(() => (props.config?.items as Task[]) || [])

const draft = ref('')

const persist = (next: Task[]) => {
  emit('update-config', { ...(props.config || {}), items: next })
}

const addTask = () => {
  const text = draft.value.trim()
  if (!text) return
  persist([...items.value, { id: makeId(), text, done: false }])
  draft.value = ''
}

const toggle = (id: string) => {
  persist(items.value.map(i => (i.id === id ? { ...i, done: !i.done } : i)))
}

const remove = (id: string) => {
  persist(items.value.filter(i => i.id !== id))
}

const clearDone = () => {
  persist(items.value.filter(i => !i.done))
}

const activeCount = computed(() => items.value.filter(i => !i.done).length)
const doneCount = computed(() => items.value.filter(i => i.done).length)

const displayItems = computed<Task[]>(() => {
  if (completedMode.value === 'hide') return items.value.filter(i => !i.done)
  if (completedMode.value === 'bottom') {
    return [...items.value.filter(i => !i.done), ...items.value.filter(i => i.done)]
  }
  return items.value
})
</script>

<style scoped>
.todo-section {
  padding: 14px 16px;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.todo-tag {
  font-size: 14px;
  font-weight: 650;
  color: var(--color-text);
}

.todo-count {
  min-width: 18px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 999px;
}

.todo-add {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.todo-input {
  flex: 1;
  min-width: 0;
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
}

.todo-input:focus {
  border-color: var(--color-primary);
}

.todo-input::placeholder {
  color: var(--color-text-muted);
}

.todo-add-btn {
  flex-shrink: 0;
  width: 32px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.todo-add-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

.todo-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.todo-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-radius: 6px;
  transition: background 0.12s;
}

.todo-item:hover {
  background: var(--color-surface-hover);
}

.todo-check {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 5px;
  background: var(--color-surface);
  color: #fff;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.todo-check.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.todo-check svg {
  fill: currentColor;
}

.todo-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--color-text);
  word-break: break-word;
}

.todo-item.done .todo-text {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.todo-del {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s, background 0.12s, color 0.12s;
}

.todo-item:hover .todo-del {
  opacity: 1;
}

.todo-del:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.todo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-muted);
}

.todo-clear {
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}

.todo-clear:hover {
  color: var(--color-danger);
}
</style>
