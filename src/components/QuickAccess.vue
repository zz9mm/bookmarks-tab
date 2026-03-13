<template>
  <div class="module-box quick-access-section">
    <div class="section-title">快速访问</div>
    <div v-if="bookmarks.length > 0" class="quick-access-grid-container">
      <div class="quick-access-grid" :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }">
        <a
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="quick-access-item"
          :href="bookmark.url"
          target="_blank"
        >
          <img
            class="quick-access-icon"
            :src="getIcon(bookmark)"
            @error="handleIconError($event, bookmark.url)"
            alt=""
          >
          <span class="quick-access-title" :title="bookmark.title">{{ bookmark.title }}</span>
        </a>
      </div>
    </div>
    <div v-else class="empty-state">暂无书签</div>
  </div>
</template>

<script setup>
import { getFavicon } from '../composables/useFavicon'

const props = defineProps({
  bookmarks: {
    type: Array,
    default: () => []
  },
  cols: {
    type: Number,
    default: 4
  }
})

const getIcon = (bookmark) => getFavicon(bookmark.url, 64)

const handleIconError = (event, url) => {
  event.target.src = getFavicon(url, 64)
  event.target.onerror = () => {
    event.target.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#666" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'
    )
  }
}
</script>
