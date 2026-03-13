<template>
  <div class="module-box">
    <div class="search-wrapper">
      <div class="search-bar web-search">
        <div class="engine-dropdown" ref="dropdownRef">
          <button class="engine-selected" @click.stop="toggleEngineMenu">
            <img :src="getEngineIcon(currentEngine)" alt="" class="engine-icon">
            <span class="engine-name">{{ getEngineName(currentEngine) }}</span>
            <span class="engine-arrow">▼</span>
          </button>
          <div class="engine-menu" :class="{ show: showEngineMenu }">
            <div v-for="(engine, key) in searchEngines" :key="key" class="engine-option" @click="selectEngine(key)">
              <img :src="getEngineIcon(key)" alt="" class="engine-icon">
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
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { searchEngines, getEngineIcon } from '../composables/useFavicon'

const props = defineProps({
  defaultEngine: {
    type: String,
    default: 'bing'
  }
})

const emit = defineEmits(['engineChange'])

const searchQuery = ref('')
const currentEngine = ref(props.defaultEngine)
const showEngineMenu = ref(false)
const dropdownRef = ref(null)

const getEngineName = (engine) => searchEngines[engine]?.name || 'Bing'

const toggleEngineMenu = () => {
  showEngineMenu.value = !showEngineMenu.value
}

const selectEngine = (engine) => {
  currentEngine.value = engine
  showEngineMenu.value = false
  emit('engineChange', engine)
}

const performSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    const engine = searchEngines[currentEngine.value]
    window.open(engine.url + encodeURIComponent(query), '_blank')
  }
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
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
