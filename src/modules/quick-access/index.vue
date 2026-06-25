<template>
  <div class="module-box quick-access-section">
    <div class="content-layer">
      <h2 class="section-title">快速访问</h2>
    <div v-if="displayedBookmarks.length > 0" class="quick-access-grid-container">
      <div class="quick-access-grid" :style="gridStyle">
        <a
          v-for="bookmark in displayedBookmarks"
          :key="bookmark.id"
          class="quick-access-item"
          :href="bookmark.url"
          target="_blank"
        >
          <div class="icon-wrapper">
            <FaviconImg :url="bookmark.url">
              <div class="fallback-icon" :style="{ backgroundColor: getColor(bookmark.url) }">
                {{ getInitial(bookmark.url) }}
              </div>
            </FaviconImg>
          </div>
          <span class="quick-access-title" :title="bookmark.title">{{ bookmark.title }}</span>
        </a>
      </div>
      <div v-if="hiddenCount > 0" class="quick-access-overflow">
        还有 {{ hiddenCount }} 个书签未显示
      </div>
    </div>
    <div v-else class="empty-state">暂无书签</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getDomain } from '../../composables/useFavicon'
import FaviconImg from '../../components/FaviconImg.vue'
import type { ModuleConfig } from '../types'

interface Bookmark {
  id: string
  title: string
  url: string
}

const props = defineProps<{
  bookmarks?: Bookmark[]
  config?: ModuleConfig
}>()

defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const cols = computed(() => (props.config?.cols as number) || 4)
const rows = computed(() => (props.config?.rows as number) || 3)
const folderId = computed(() => (props.config?.folderId as string) || '')

// 选定文件夹时单独加载其直接子书签；未选则回退到书签栏根目录（props.bookmarks）
const folderBookmarks = ref<Bookmark[]>([])

const loadFolder = () => {
  if (!folderId.value) {
    folderBookmarks.value = []
    return
  }
  if (typeof chrome === 'undefined' || !chrome.bookmarks) return
  chrome.bookmarks.getChildren(folderId.value, (children) => {
    folderBookmarks.value = (children || []).filter(c => !!c.url) as Bookmark[]
  })
}

watch(folderId, loadFolder, { immediate: true })

const sourceBookmarks = computed(() =>
  folderId.value ? folderBookmarks.value : (props.bookmarks || [])
)

const displayedBookmarks = computed(() =>
  sourceBookmarks.value.slice(0, cols.value * rows.value)
)

const hiddenCount = computed(() =>
  Math.max(0, sourceBookmarks.value.length - cols.value * rows.value)
)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`,
  gridTemplateRows: `repeat(${rows.value}, auto)`
}))

const getInitial = (url: string): string => {
  const domain = getDomain(url)
  if (domain) {
    return domain.charAt(0).toUpperCase()
  }
  return '?'
}

const getColor = (url: string): string => {
  const domain = getDomain(url)
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#00C9A7', '#FF6F61', '#6B5B95', '#88B04B'
  ]
  let hash = 0
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.quick-access-overflow {
  padding: 8px 18px;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}
</style>