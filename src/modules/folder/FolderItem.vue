<template>
  <div class="folder-item" :class="{ collapsed: collapsedFolders.includes(folder.id) }" role="treeitem" :aria-expanded="!collapsedFolders.includes(folder.id)">
    <div class="folder-header" @click="$emit('toggle', folder.id)" role="button" tabindex="0" @keydown.enter="$emit('toggle', folder.id)" @keydown.space.prevent="$emit('toggle', folder.id)">
      <svg class="folder-icon" viewBox="0 0 24 24">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
      </svg>
      <span class="folder-name">{{ folder.title }}</span>
    </div>
    <div class="folder-children" role="group">
      <template v-for="child in folder.children" :key="child.id">
        <a v-if="child.url" class="bookmark-item" :href="child.url" target="_blank">
          <FaviconImg :url="child.url">
            <span class="bookmark-fallback">{{ child.title.charAt(0) }}</span>
          </FaviconImg>
          <span class="bookmark-title">{{ child.title }}</span>
        </a>
        <FolderItem v-else-if="child.children" :folder="child" :collapsedFolders="collapsedFolders" @toggle="$emit('toggle', $event)" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import FaviconImg from '../../components/FaviconImg.vue'

interface FolderNode {
  id: string
  title: string
  url?: string
  children?: FolderNode[]
}

defineProps<{
  folder: FolderNode
  collapsedFolders: string[]
}>()

defineEmits<{
  (e: 'toggle', id: string): void
}>()
</script>
