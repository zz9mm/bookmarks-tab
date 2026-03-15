<template>
  <div class="module-box folder-section">
    <div class="sidebar-header">
      <span>收藏夹</span>
      <input
        type="text"
        class="folder-search-input"
        placeholder="筛选..."
        autocomplete="off"
        v-model="filterQuery"
      >
    </div>
    <div class="folder-list">
      <template v-if="filteredFolders.length > 0">
        <div v-for="folder in filteredFolders" :key="folder.id" class="folder-item" :class="{ collapsed: collapsedFolders.includes(folder.id) }">
          <div class="folder-header" @click="toggleFolder(folder.id)">
            <svg class="folder-icon" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
            <span class="folder-name">{{ folder.title }}</span>
          </div>
          <div class="folder-children">
            <template v-for="child in folder.children" :key="child.id">
              <a v-if="child.url" class="bookmark-item" :href="child.url" target="_blank">
                <img class="bookmark-icon" :src="getFavicon(child.url)" alt="">
                <span class="bookmark-title">{{ child.title }}</span>
              </a>
              <FolderItem v-else-if="child.children" :folder="child" :collapsedFolders="collapsedFolders" @toggle="toggleFolder" />
            </template>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">暂无收藏夹</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getFavicon } from '../../composables/useFavicon'
import FolderItem from './FolderItem.vue'

interface FolderNode {
  id: string
  title: string
  url?: string
  children?: FolderNode[]
}

const props = defineProps<{
  folders?: FolderNode[]
}>()

const filterQuery = ref('')
const collapsedFolders = ref<string[]>([])

const filteredFolders = computed(() => {
  if (!filterQuery.value) return props.folders || []
  const query = filterQuery.value.toLowerCase()
  return (props.folders || []).filter(f => f.title.toLowerCase().includes(query))
})

const toggleFolder = (id: string) => {
  const index = collapsedFolders.value.indexOf(id)
  if (index >= 0) {
    collapsedFolders.value.splice(index, 1)
  } else {
    collapsedFolders.value.push(id)
  }
}
</script>
