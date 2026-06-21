<template>
  <div class="module-box">
    <div class="search-wrapper">
      <div class="search-bar web-search">
        <div class="engine-dropdown" ref="dropdownRef">
          <button class="engine-selected" @click.stop="toggleEngineMenu" @keydown="handleEngineKeydown">
            <span class="engine-icon">
              <FaviconImg :url="`https://${currentEngine === 'baidu' ? 'baidu.com' : currentEngine + '.com'}`">
                <span class="engine-icon-fallback">{{ currentEngine.charAt(0).toUpperCase() }}</span>
              </FaviconImg>
            </span>
            <span class="engine-name">{{ getEngineName(currentEngine) }}</span>
            <span class="engine-arrow">▼</span>
          </button>
          <div class="engine-menu" :class="{ show: showEngineMenu }">
            <div v-for="(engine, key) in searchEngines" :key="key" class="engine-option" :class="{ active: engineActiveIndex === engineKeys.indexOf(key) }" @click="selectEngine(key)">
              <span class="engine-icon">
                <FaviconImg :url="`https://${key === 'baidu' ? 'baidu.com' : key + '.com'}`">
                  <span class="engine-icon-fallback">{{ key.charAt(0).toUpperCase() }}</span>
                </FaviconImg>
              </span>
              <span>{{ engine.name }}</span>
            </div>
          </div>
        </div>
        <input
          type="text"
          class="web-search-input"
          placeholder="搜索网页..."
          autocomplete="off"
          v-model="searchQuery"
          @keydown.enter="performSearch"
          @keydown.escape="showEngineMenu = false"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { searchEngines } from '../../composables/useFavicon'
import FaviconImg from '../../components/FaviconImg.vue'
import type { ModuleConfig } from '../types'

type EngineKey = 'bing' | 'baidu' | 'google'

const props = defineProps<{
  config?: ModuleConfig
}>()

const emit = defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const searchQuery = ref('')
const currentEngine = ref<EngineKey>((props.config?.engine as EngineKey) || 'bing')
const showEngineMenu = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const engineActiveIndex = ref(-1)
const engineKeys = computed(() => Object.keys(searchEngines) as EngineKey[])

const getEngineName = (engine: EngineKey) => searchEngines[engine]?.name || 'Bing'

const toggleEngineMenu = () => {
  showEngineMenu.value = !showEngineMenu.value
  engineActiveIndex.value = -1
}

const selectEngine = (engine: EngineKey) => {
  currentEngine.value = engine
  showEngineMenu.value = false
  engineActiveIndex.value = -1
  emit('update-config', { ...(props.config || {}), engine })
}

const handleEngineKeydown = (e: KeyboardEvent) => {
  if (!showEngineMenu.value) return

  const keys = engineKeys.value
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      engineActiveIndex.value = (engineActiveIndex.value + 1) % keys.length
      break
    case 'ArrowUp':
      e.preventDefault()
      engineActiveIndex.value = engineActiveIndex.value <= 0 ? keys.length - 1 : engineActiveIndex.value - 1
      break
    case 'Enter':
      e.preventDefault()
      if (engineActiveIndex.value >= 0) {
        selectEngine(keys[engineActiveIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      showEngineMenu.value = false
      engineActiveIndex.value = -1
      break
  }
}

const performSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    const engine = searchEngines[currentEngine.value]
    window.open(engine.url + encodeURIComponent(query), '_blank')
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showEngineMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>