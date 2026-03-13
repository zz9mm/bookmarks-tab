<template>
  <div class="module-box">
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
        >
      </div>
      <div class="search-dropdown bookmark-dropdown" :class="{ show: showDropdown && searchResults.length > 0 }">
        <a
          v-for="bookmark in searchResults"
          :key="bookmark.id"
          class="search-result-item"
          :href="bookmark.url"
          target="_blank"
        >
          <img :src="getFavicon(bookmark.url)" alt="">
          <span>{{ bookmark.title }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getFavicon } from '../composables/useFavicon'

const props = defineProps({
  bookmarks: {
    type: Array,
    default: () => []
  }
})

const searchQuery = ref('')
const searchResults = ref([])
const showDropdown = ref(false)

const handleSearch = () => {
  const query = searchQuery.value.toLowerCase()
  showDropdown.value = true

  if (!query) {
    searchResults.value = []
    return
  }

  searchResults.value = props.bookmarks
    .filter(b => b.title.toLowerCase().includes(query))
    .slice(0, 8)
}

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
</script>
