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

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'WebSearch',
  props: {
    defaultEngine: {
      type: String,
      default: 'bing'
    }
  },
  emits: ['engineChange'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const currentEngine = ref(props.defaultEngine)
    const showEngineMenu = ref(false)
    const dropdownRef = ref(null)

    const searchEngines = {
      bing: { url: 'https://www.bing.com/search?q=', name: 'Bing' },
      baidu: { url: 'https://www.baidu.com/s?wd=', name: '百度' },
      google: { url: 'https://www.google.com/search?q=', name: 'Google' }
    }

    const getEngineIcon = (engine) => {
      const domain = engine === 'baidu' ? 'baidu.com' : `${engine}.com`
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    }

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

    return {
      searchQuery,
      currentEngine,
      showEngineMenu,
      dropdownRef,
      searchEngines,
      getEngineIcon,
      getEngineName,
      toggleEngineMenu,
      selectEngine,
      performSearch
    }
  }
}
</script>
