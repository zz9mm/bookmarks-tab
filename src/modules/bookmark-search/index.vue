<template>
  <div class="module-box" aria-label="书签搜索">
    <div class="search-wrapper">
      <div class="search-bar bookmark-search">
        <svg class="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          type="text"
          class="bookmark-search-input"
          placeholder="搜索书签..."
          autocomplete="off"
          v-model="searchQuery"
          @input="handleSearch"
          @focus="handleSearch"
          @blur="handleBlur"
          @keydown="handleKeydown"
        >
      </div>
      <div class="search-dropdown bookmark-dropdown" :class="{ show: showDropdown && searchResults.length > 0 }">
        <a
          v-for="(bookmark, index) in searchResults"
          :key="bookmark.id"
          class="search-result-item"
          :class="{ active: activeIndex === index }"
          :href="bookmark.url"
          target="_blank"
          @mousedown.prevent
        >
          <FaviconImg :url="bookmark.url">
            <span class="search-result-fallback">{{ bookmark.title.charAt(0) }}</span>
          </FaviconImg>
          <span>{{ bookmark.title }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FaviconImg from '../../components/FaviconImg.vue'

interface Bookmark {
  id: string
  title: string
  url: string
}

const props = defineProps<{
  bookmarks?: Bookmark[]
}>()

const searchQuery = ref('')
const searchResults = ref<Bookmark[]>([])
const showDropdown = ref(false)
const activeIndex = ref(-1)

const handleSearch = () => {
  const query = searchQuery.value.toLowerCase()
  showDropdown.value = true
  activeIndex.value = -1

  if (!query) {
    searchResults.value = []
    return
  }

  searchResults.value = (props.bookmarks || [])
    .filter(b => b.title.toLowerCase().includes(query) || b.url.toLowerCase().includes(query))
    .slice(0, 8)
}

const handleBlur = () => {
  showDropdown.value = false
  activeIndex.value = -1
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!showDropdown.value || searchResults.value.length === 0) {
    if (e.key === 'Escape') {
      showDropdown.value = false
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % searchResults.value.length
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = activeIndex.value <= 0 ? searchResults.value.length - 1 : activeIndex.value - 1
      break
    case 'Enter':
      if (activeIndex.value >= 0 && activeIndex.value < searchResults.value.length) {
        e.preventDefault()
        window.open(searchResults.value[activeIndex.value].url, '_blank')
        showDropdown.value = false
      }
      break
    case 'Escape':
      showDropdown.value = false
      activeIndex.value = -1
      break
  }
}
</script>
