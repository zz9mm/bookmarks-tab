<template>
  <div class="module-box title-section">
    <div class="title-content" :style="titleStyle">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'

export default {
  name: 'TitleModule',
  props: {
    text: {
      type: String,
      default: '文本'
    },
    fontSize: {
      type: Number,
      default: 24
    },
    align: {
      type: String,
      default: 'center'
    },
    fontFamily: {
      type: String,
      default: 'inherit'
    },
    textIndent: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const titleStyle = computed(() => ({
      fontSize: props.fontSize + 'px',
      textAlign: props.align as 'left' | 'center' | 'right',
      fontFamily: props.fontFamily,
      textIndent: props.textIndent + 'em'
    }))

    return {
      titleStyle
    }
  }
}
</script>

<style scoped>
.title-section {
  padding: 12px 16px;
}

.title-content {
  font-weight: 600;
  color: #333;
  word-break: break-word;
}
</style>
