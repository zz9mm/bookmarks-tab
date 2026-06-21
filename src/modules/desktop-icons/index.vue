<template>
  <div class="module-box desktop-icons-section">
    <div class="content-layer">
      <div class="section-title">{{ folderName || '桌面图标' }}</div>
      <div v-if="displayedBookmarks.length > 0" class="desktop-icons-grid" :style="gridStyle">
        <a
          v-for="bookmark in displayedBookmarks"
          :key="bookmark.id"
          class="desktop-icon-item"
          :href="bookmark.url"
          target="_blank"
          :title="bookmark.title"
        >
          <div class="icon-wrapper">
            <FaviconImg :url="bookmark.url" :size="64">
              <div class="fallback-icon" :style="{ backgroundColor: getColor(bookmark.url) }">
                {{ bookmark.title?.charAt(0) }}
              </div>
            </FaviconImg>
          </div>
          <span class="icon-label">{{ bookmark.title }}</span>
        </a>
      </div>
      <div v-else-if="bookmarks.length === 0" class="empty-hint">请在设置中选择书签文件夹</div>
      <div v-else class="empty-hint">布局为 0×0，无显示</div>
      <div v-if="hiddenCount > 0" class="quick-access-overflow">
        还有 {{ hiddenCount }} 个书签未显示
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import FaviconImg from '../../components/FaviconImg.vue'
import type { ModuleConfig } from '../types'

interface Bookmark {
  id: string
  title: string
  url: string
}

const props = defineProps<{
  config?: ModuleConfig
}>()

defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const folderId = computed(() => (props.config?.folderId as string) || '')
const folderName = ref((props.config?.folderName as string) || '')
const cols = computed(() => (props.config?.cols as number) || 6)
const rows = computed(() => (props.config?.rows as number) || 2)

const bookmarks = ref<Bookmark[]>([])

const displayedBookmarks = computed(() => bookmarks.value.slice(0, cols.value * rows.value))
const hiddenCount = computed(() => Math.max(0, bookmarks.value.length - cols.value * rows.value))

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`,
  gridTemplateRows: `repeat(${rows.value}, auto)`
}))

const loadFolder = () => {
  if (!folderId.value) {
    bookmarks.value = []
    folderName.value = ''
    return
  }
  if (typeof chrome === 'undefined' || !chrome.bookmarks) return
  chrome.bookmarks.get(folderId.value, (nodes) => {
    const node = Array.isArray(nodes) ? nodes[0] : nodes
    if (node && node.title) {
      folderName.value = node.title
    }
  })
  chrome.bookmarks.getChildren(folderId.value, (children) => {
    bookmarks.value = (children || []).filter(c => !!c.url) as Bookmark[]
  })
}

watch(folderId, loadFolder, { immediate: true })

const getColor = (url: string) => {
  try {
    const domain = new URL(url).hostname
    let hash = 0
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash)
    }
    return ['#4A90E2','#E24A4A','#E2904A','#4AE290','#904AE2','#E24A90','#4AE2E2'][Math.abs(hash) % 7]
  } catch {
    return '#4A90E2'
  }
}
</script>

<style scoped>
.desktop-icons-section {
  width: 100%;
}

.content-layer {
  padding: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  letter-spacing: 0.04em;
}

.desktop-icons-grid {
  display: grid;
  gap: 8px;
}

.desktop-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.15s;
}

.desktop-icon-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fallback-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: bold;
  border-radius: 10px;
}

.icon-label {
  font-size: 12px;
  color: #333;
  text-align: center;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.empty-hint {
  color: #999;
  font-size: 13px;
  padding: 16px 0;
}

.quick-access-overflow {
  padding: 8px 0;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}
</style>