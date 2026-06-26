<template>
  <img v-if="currentSrc && !failed" class="favicon-img" :src="currentSrc" @error="handleError" alt="" />
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { resolveFavicon } from '../composables/useFaviconCache'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  url: string
  size?: number
}>()

const currentSrc = ref('')
const failed = ref(false)

const load = async (url: string) => {
  failed.value = false
  currentSrc.value = ''
  const src = await resolveFavicon(url)
  // 异步期间 url 可能已变,丢弃过期结果
  if (url !== props.url) return
  if (src) currentSrc.value = src
  else failed.value = true
}

watch(() => props.url, load, { immediate: true })

const handleError = () => {
  failed.value = true
}
</script>
