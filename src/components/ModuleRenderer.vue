<template>
  <BookmarkSearch
    v-if="module.type === 'bookmark-search'"
    :bookmarks="bookmarks"
  />
  <FolderTree
    v-else-if="module.type === 'folder'"
    :folders="subfolders"
  />
  <WebSearch
    v-else-if="module.type === 'web-search'"
    :config="config"
    @update-config="emit('update-config', $event)"
  />
  <QuickAccess
    v-else-if="module.type === 'quick-access'"
    :bookmarks="directBookmarks"
    :config="config"
    @update-config="emit('update-config', $event)"
  />
  <Title
    v-else-if="module.type === 'title'"
    :config="config"
    @update-config="emit('update-config', $event)"
  />
  <MinimaxUsage
    v-else-if="module.type === 'minimax-usage'"
    :config="config"
    @update-config="emit('update-config', $event)"
  />
</template>

<script setup lang="ts">
import BookmarkSearch from '../modules/bookmark-search/index.vue'
import FolderTree from '../modules/folder/index.vue'
import WebSearch from '../modules/web-search/index.vue'
import QuickAccess from '../modules/quick-access/index.vue'
import Title from '../modules/title/index.vue'
import MinimaxUsage from '../modules/minimax-usage/index.vue'
import type { ModuleInstance, ModuleConfig } from '../modules/types'

interface Bookmark {
  id: string
  title: string
  url: string
}

interface FolderNode {
  id: string
  title: string
  url?: string
  children?: FolderNode[]
}

defineProps<{
  module: ModuleInstance
  config: ModuleConfig
  bookmarks: Bookmark[]
  directBookmarks: Bookmark[]
  subfolders: FolderNode[]
}>()

const emit = defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()
</script>