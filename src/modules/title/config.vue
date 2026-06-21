<template>
  <div class="config-item">
    <label>标题文字</label>
    <input type="text" :value="(config?.text as string) ?? ''" @input="emit('update-config', { ...(config || {}), text: ($event.target as HTMLInputElement).value })" placeholder="请输入标题文字">
  </div>
  <div class="config-item">
    <label>文字大小</label>
    <select :value="(config?.fontSize as number) || 24" @change="emit('update-config', { ...(config || {}), fontSize: parseInt(($event.target as HTMLSelectElement).value) })">
      <option :value="16">16px</option>
      <option :value="20">20px</option>
      <option :value="24">24px</option>
      <option :value="28">28px</option>
      <option :value="32">32px</option>
      <option :value="36">36px</option>
      <option :value="40">40px</option>
    </select>
  </div>
  <div class="config-item">
    <label>对齐方式</label>
    <select :value="(config?.align as string) || 'center'" @change="emit('update-config', { ...(config || {}), align: ($event.target as HTMLSelectElement).value })">
      <option value="left">靠左</option>
      <option value="center">居中</option>
      <option value="right">靠右</option>
    </select>
  </div>
  <div class="config-item">
    <label>字体</label>
    <select :value="(config?.fontFamily as string) || 'inherit'" @change="emit('update-config', { ...(config || {}), fontFamily: ($event.target as HTMLSelectElement).value })">
      <option value="inherit">默认字体</option>
      <option value="Microsoft YaHei, sans-serif">微软雅黑</option>
      <option value="SimSun, serif">宋体</option>
      <option value="KaiTi, cursive">楷体</option>
      <option value="Arial, sans-serif">Arial</option>
      <option value="Times New Roman, serif">Times New Roman</option>
      <option value="Courier New, monospace">Courier New</option>
    </select>
  </div>
  <div class="config-item">
    <label>首行缩进</label>
    <select :value="(config?.textIndent as number) || 0" @change="emit('update-config', { ...(config || {}), textIndent: parseInt(($event.target as HTMLSelectElement).value) })">
      <option :value="0">无</option>
      <option :value="2">2字符</option>
      <option :value="4">4字符</option>
      <option :value="8">8字符</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { ModuleConfig } from '../types'

defineProps<{
  config?: ModuleConfig
}>()

const emit = defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()
</script>