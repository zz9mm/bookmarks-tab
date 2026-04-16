<template>
  <div class="module-box desktop-icons-section">
    <div class="content-layer">
      <div class="section-title">{{ folderName || '桌面图标' }}</div>
      <div v-if="bookmarks.length > 0" class="desktop-icons-grid" :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }">
        <a
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="desktop-icon-item"
          :href="bookmark.url"
          target="_blank"
          :title="bookmark.title"
        >
          <div class="icon-wrapper">
            <img
              v-show="iconLoaded[bookmark.id]"
              class="desktop-icon-img"
              :src="getIcon(bookmark.url)"
              @load="iconLoaded[bookmark.id] = true"
              @error="iconLoaded[bookmark.id] = false"
              alt=""
            >
            <div
              v-show="!iconLoaded[bookmark.id]"
              class="fallback-icon"
              :style="{ backgroundColor: getColor(bookmark.url) }"
            >
              {{ bookmark.title?.charAt(0) }}
            </div>
          </div>
          <span class="icon-label">{{ bookmark.title }}</span>
        </a>
      </div>
      <div v-else class="empty-hint">请在设置中选择书签文件夹</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Bookmark {
  id: string
  title: string
  url: string
}

const props = defineProps<{
  folderId?: string
  folderName?: string
  cols?: number
}>()

const iconLoaded = ref<Record<string, boolean>>({})
const bookmarks = ref<Bookmark[]>([])

const loadBookmarks = () => {
  if (!props.folderId) {
    bookmarks.value = []
    return
  }
  if (typeof chrome === 'undefined' || !chrome.bookmarks) return
  chrome.bookmarks.getChildren(props.folderId, (children) => {
    bookmarks.value = (children || []).filter(c => !!c.url) as Bookmark[]
    iconLoaded.value = {}
  })
}

watch(() => props.folderId, loadBookmarks, { immediate: true })

const getIcon = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return ''
  }
}

const colors = ['#4A90E2','#E24A4A','#E2904A','#4AE290','#904AE2','#E24A90','#4AE2E2']
const getColor = (url: string) => {
  try {
    const domain = new URL(url).hostname
    let hash = 0
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  } catch {
    return colors[0]
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
  color: rgba(255, 255, 255, 0.7);
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
  background: rgba(255, 255, 255, 0.12);
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

.desktop-icon-img {
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
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.empty-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  padding: 16px 0;
}
</style>
