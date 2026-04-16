<template>
  <div>
    <div class="config-item">
      <label>书签文件夹</label>
      <button class="folder-select-btn" @click="showModal = true">
        {{ modelValue?.folderName || '请选择文件夹' }}
      </button>
    </div>
    <div class="config-item">
      <label>每行图标数量</label>
      <select :value="modelValue?.cols" @change="updateConfig('cols', parseInt(($event.target as HTMLSelectElement).value))">
        <option :value="4">4 个</option>
        <option :value="5">5 个</option>
        <option :value="6">6 个</option>
        <option :value="8">8 个</option>
        <option :value="10">10 个</option>
      </select>
    </div>

    <!-- 文件夹选择弹窗 -->
    <teleport to="body">
      <div v-if="showModal" class="folder-modal-overlay" @click.self="showModal = false">
        <div class="folder-modal">
          <div class="folder-modal-header">
            <span>选择书签文件夹</span>
            <button class="folder-modal-close" @click="showModal = false">&times;</button>
          </div>
          <div class="folder-modal-body">
            <FolderNode
              v-for="node in folderTree"
              :key="node.id"
              :node="node"
              :selected-id="modelValue?.folderId"
              @select="handleSelect"
            />
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue'

interface DesktopIconsConfig {
  folderId?: string
  folderName?: string
  cols?: number
}

interface BookmarkNode {
  id: string
  title: string
  url?: string
  children?: BookmarkNode[]
}

interface FolderTree {
  id: string
  title: string
  children: FolderTree[]
}

const props = defineProps<{
  modelValue?: DesktopIconsConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DesktopIconsConfig): void
}>()

const showModal = ref(false)
const folderTree = ref<FolderTree[]>([])

onMounted(() => {
  if (typeof chrome === 'undefined' || !chrome.bookmarks) return
  chrome.bookmarks.getTree((nodes) => {
    folderTree.value = buildFolderTree(nodes as BookmarkNode[])
  })
})

function buildFolderTree(nodes: BookmarkNode[]): FolderTree[] {
  const result: FolderTree[] = []
  for (const node of nodes) {
    if (!node.url) {
      if (node.id === '0') {
        if (node.children) result.push(...buildFolderTree(node.children))
      } else {
        const children = node.children ? buildFolderTree(node.children) : []
        result.push({ id: node.id, title: node.title, children })
      }
    }
  }
  return result
}

const handleSelect = (id: string, title: string) => {
  emit('update:modelValue', { ...props.modelValue, folderId: id, folderName: title })
  showModal.value = false
}

const updateConfig = (key: keyof DesktopIconsConfig, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const FolderNode = defineComponent({
  name: 'FolderNode',
  props: {
    node: { type: Object as () => FolderTree, required: true },
    selectedId: { type: String, default: '' },
    depth: { type: Number, default: 0 }
  },
  emits: ['select'],
  setup(p, { emit: emitNode }) {
    const expanded = ref(false)
    return () => {
      const node = p.node as FolderTree
      const isSelected = p.selectedId === node.id
      const hasChildren = node.children && node.children.length > 0
      return h('div', { class: 'folder-node' }, [
        h('div', {
          class: ['folder-node-row', isSelected ? 'selected' : ''],
          style: { paddingLeft: `${p.depth * 14 + 8}px` }
        }, [
          h('span', {
            class: ['folder-arrow', expanded.value ? 'expanded' : '', !hasChildren ? 'invisible' : ''],
            onClick: (e: Event) => { e.stopPropagation(); expanded.value = !expanded.value }
          }, '▶'),
          h('span', {
            class: 'folder-icon'
          }, '📁'),
          h('span', {
            class: 'folder-title',
            onClick: () => emitNode('select', node.id, node.title)
          }, node.title)
        ]),
        expanded.value && hasChildren
          ? h('div', {}, node.children.map(child =>
              h(FolderNode, {
                key: child.id,
                node: child,
                selectedId: p.selectedId,
                depth: p.depth + 1,
                onSelect: (id: string, title: string) => emitNode('select', id, title)
              })
            ))
          : null
      ])
    }
  }
})
</script>

<style scoped>
.config-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.folder-select-btn {
  flex: 1;
  text-align: left;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  border: 1px solid #d9d9d9;
  background: #fafafa;
  color: #333;
  transition: border-color 0.2s, box-shadow 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-select-btn:hover {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64,150,255,0.1);
}

.folder-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.folder-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  min-width: 320px;
  max-width: 400px;
  width: 90vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  z-index: 10000;
  animation: panelFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes panelFadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.folder-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  font-size: 15px;
  color: #1a1a1a;
  background: #fafafa;
}

.folder-modal-close {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  transition: background 0.15s, color 0.15s;
  line-height: 1;
}

.folder-modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

.folder-modal-body {
  overflow-y: auto;
  padding: 6px 0;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;
}

.folder-modal-body::-webkit-scrollbar {
  width: 4px;
}

.folder-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.folder-modal-body::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}
</style>

<style>
.folder-node-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 6px;
  margin: 1px 6px;
  color: #333;
  transition: background 0.12s;
  user-select: none;
}

.folder-node-row:hover {
  background: #f5f5f5;
}

.folder-node-row.selected {
  background: #e6f4ff;
  color: #1677ff;
}

.folder-node-row.selected .folder-arrow {
  color: #1677ff;
}

.folder-arrow {
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
  color: #bbb;
  width: 14px;
  flex-shrink: 0;
}

.folder-arrow.expanded {
  transform: rotate(90deg);
}

.folder-arrow.invisible {
  visibility: hidden;
}

.folder-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.folder-title {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
</style>
