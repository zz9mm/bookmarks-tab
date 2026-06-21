<template>
  <img v-if="!failed" :src="currentSrc" @error="handleError" alt="" />
  <slot v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getFavicon, getFaviconFallback } from '../composables/useFavicon'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  url: string
  size?: number
}>()

const stage = ref<'primary' | 'fallback'>('primary')
const failed = ref(false)
const currentSrc = ref(getFavicon(props.url, props.size))

const handleError = () => {
  if (stage.value === 'primary') {
    const fallback = getFaviconFallback(props.url)
    if (fallback) {
      stage.value = 'fallback'
      currentSrc.value = fallback
      return
    }
  }
  failed.value = true
}
</script>