<template>
  <div class="module-box quick-access-section">
    <div class="content-layer">
      <h2 class="section-title">快速访问</h2>
    <div v-if="bookmarks && bookmarks.length > 0" class="quick-access-grid-container">
      <div class="quick-access-grid" :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }">
        <a
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="quick-access-item"
          :href="bookmark.url"
          target="_blank"
        >
          <div class="icon-wrapper">
            <img
              v-show="iconLoaded[bookmark.id]"
              class="quick-access-icon"
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
              {{ getInitial(bookmark.url) }}
            </div>
          </div>
          <span class="quick-access-title" :title="bookmark.title">{{ bookmark.title }}</span>
        </a>
      </div>
    </div>
    <div v-else class="empty-state">暂无书签</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { getFavicon, getDomain } from '../../composables/useFavicon'

interface Bookmark {
  id: string
  title: string
  url: string
}

const props = defineProps<{
  bookmarks?: Bookmark[]
  cols?: number
}>()

const iconLoaded = reactive<Record<string, boolean>>({})

// 监听 bookmarks 变化时重置状态
watch(() => props.bookmarks, (newBookmarks) => {
  if (newBookmarks) {
    newBookmarks.forEach(bm => {
      if (!(bm.id in iconLoaded)) {
        iconLoaded[bm.id] = false
      }
    })
  }
}, { immediate: true })

const getIcon = (url: string) => getFavicon(url, 64)

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
