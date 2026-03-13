<template>
  <div class="folder-item" :class="{ collapsed: collapsedFolders.includes(folder.id) }">
    <div class="folder-header" @click="$emit('toggle', folder.id)">
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
        <FolderItem v-else-if="child.children" :folder="child" :collapsedFolders="collapsedFolders" @toggle="$emit('toggle', $event)" />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FolderItem',
  props: {
    folder: {
      type: Object,
      required: true
    },
    collapsedFolders: {
      type: Array,
      default: () => []
    }
  },
  emits: ['toggle'],
  setup() {
    const getDomain = (url) => {
      try {
        return new URL(url).hostname
      } catch {
        return ''
      }
    }

    const getFavicon = (url) => {
      const domain = getDomain(url)
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    }

    return { getFavicon }
  }
}
</script>
