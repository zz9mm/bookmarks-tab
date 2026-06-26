<template>
  <div class="module-box quick-access-section">
    <div class="content-layer">
      <h2 class="section-title">
        <span class="qa-title-tag">快速访问</span>
        <span v-if="folderName" class="qa-title-name" :title="folderName">{{ folderName }}</span>
        <button
          class="qa-add-header-btn"
          title="添加快速访问"
          @click="openAddModal"
        >+</button>
      </h2>

      <!-- 自定义模式:可拖拽排序 + 增删 -->
      <div v-if="isCustomMode" class="quick-access-grid-container">
        <div v-if="customItems.length > 0" class="quick-access-grid" :style="gridStyle">
          <a
            v-for="(item, index) in customItems"
            :key="item.id"
            class="quick-access-item"
            :class="{ 'qa-dragging': dragIndex === index, 'qa-drag-over': overIndex === index && dragIndex !== index }"
            :href="item.url"
            target="_blank"
            draggable="true"
            @dragstart="onDragStart(index, $event)"
            @dragover="onDragOver(index, $event)"
            @drop="onDrop(index, $event)"
            @dragend="onDragEnd"
          >
            <button class="qa-delete-btn" title="删除" @click.prevent.stop="removeItem(index)">×</button>
            <div class="icon-wrapper">
              <FaviconImg :url="item.url">
                <div class="fallback-icon" :style="{ backgroundColor: getColor(item.url) }">
                  {{ getInitial(item.url) }}
                </div>
              </FaviconImg>
            </div>
            <span class="quick-access-title" :title="item.title">{{ item.title }}</span>
          </a>
        </div>
        <div v-else class="empty-state">暂无快速访问，点击右上角 + 添加</div>
      </div>

      <!-- 文件夹模式:只读镜像 -->
      <div v-else-if="displayedBookmarks.length > 0" class="quick-access-grid-container">
        <div class="quick-access-grid" :style="gridStyle">
          <a
            v-for="(bookmark, index) in displayedBookmarks"
            :key="bookmark.id"
            class="quick-access-item"
            :class="{ 'qa-dragging': dragIndex === index, 'qa-drag-over': overIndex === index && dragIndex !== index }"
            :href="bookmark.url"
            target="_blank"
            draggable="true"
            @dragstart="onDragStart(index, $event)"
            @dragover="onDragOver(index, $event)"
            @drop="onDrop(index, $event)"
            @dragend="onDragEnd"
          >
            <button class="qa-delete-btn" title="删除" @click.prevent.stop="removeFolderBookmark(bookmark)">×</button>
            <div class="icon-wrapper">
              <FaviconImg :url="bookmark.url">
                <div class="fallback-icon" :style="{ backgroundColor: getColor(bookmark.url) }">
                  {{ getInitial(bookmark.url) }}
                </div>
              </FaviconImg>
            </div>
            <span class="quick-access-title" :title="bookmark.title">{{ bookmark.title }}</span>
          </a>
        </div>
        <div v-if="hiddenCount > 0" class="quick-access-overflow">
          还有 {{ hiddenCount }} 个书签未显示
        </div>
      </div>
      <div v-else class="empty-state">暂无书签</div>
    </div>

    <!-- 添加弹窗 -->
    <teleport to="body">
      <div v-if="showAddModal" class="qa-modal-overlay" @click.self="closeAddModal">
        <div class="qa-modal">
          <div class="qa-modal-header">
            <span>添加快速访问</span>
            <button class="qa-modal-close" @click="closeAddModal">&times;</button>
          </div>
          <div class="qa-modal-body">
            <label class="qa-field">
              <span>网址</span>
              <input
                ref="urlInputRef"
                v-model="addUrl"
                type="text"
                placeholder="example.com 或 https://example.com"
                @keydown.enter="submitAdd"
              >
            </label>
            <label class="qa-field">
              <span>名称 <span v-if="fetchingTitle" class="qa-fetching">· 获取中…</span></span>
              <input
                v-model="addTitle"
                type="text"
                :placeholder="fetchingTitle ? '正在获取网页标题…' : '自动获取，留空则用域名'"
                @input="onTitleInput"
                @keydown.enter="submitAdd"
              >
            </label>
            <div v-if="addError" class="qa-modal-error">{{ addError }}</div>
          </div>
          <div class="qa-modal-footer">
            <button class="qa-btn-cancel" @click="closeAddModal">取消</button>
            <button class="qa-btn-confirm" @click="submitAdd">添加</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { getDomain } from '../../composables/useFavicon'
import { useEscClose } from '../../composables/useEscClose'
import FaviconImg from '../../components/FaviconImg.vue'
import type { ModuleConfig } from '../types'

interface Bookmark {
  id: string
  title: string
  url: string
}

interface QuickItem {
  id: string
  title: string
  url: string
  bookmarkId?: string // 来源于 Chrome 书签时记录其 id,删除时联动移除
}

const props = defineProps<{
  bookmarks?: Bookmark[]
  config?: ModuleConfig
}>()

const emit = defineEmits<{
  (e: 'update-config', config: ModuleConfig): void
}>()

const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : 'qa-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8))

const cols = computed(() => (props.config?.cols as number) || 4)
const rows = computed(() => (props.config?.rows as number) || 3)
const folderId = computed(() => (props.config?.folderId as string) || '')
const folderName = computed(() => (props.config?.folderName as string) || '')

// 未选文件夹 = 自定义可编辑模式;选了文件夹 = 只读镜像模式
const isCustomMode = computed(() => !folderId.value)

const customItems = computed<QuickItem[]>(() => (props.config?.items as QuickItem[]) || [])

const persistItems = (items: QuickItem[]) => {
  emit('update-config', { ...(props.config || {}), items })
}

// 首次进入自定义模式且无 items 时,从书签栏种子迁移,保证老用户内容不丢
watch(
  [() => props.bookmarks, isCustomMode],
  () => {
    if (!isCustomMode.value) return
    if (props.config?.items !== undefined) return
    const seed = props.bookmarks || []
    if (!seed.length) return
    persistItems(seed.map(b => ({ id: makeId(), title: b.title, url: b.url, bookmarkId: b.id })))
  },
  { immediate: true }
)

// ===== 文件夹模式 =====
const folderBookmarks = ref<Bookmark[]>([])

const loadFolder = () => {
  if (!folderId.value) {
    folderBookmarks.value = []
    return
  }
  if (typeof chrome === 'undefined' || !chrome.bookmarks) return
  chrome.bookmarks.getChildren(folderId.value, (children) => {
    folderBookmarks.value = (children || []).filter(c => !!c.url) as Bookmark[]
  })
}

watch(folderId, loadFolder, { immediate: true })

const displayedBookmarks = computed(() => folderBookmarks.value.slice(0, cols.value * rows.value))
const hiddenCount = computed(() => Math.max(0, folderBookmarks.value.length - cols.value * rows.value))

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`
}))

// ===== 拖拽排序 =====
const dragIndex = ref(-1)
const overIndex = ref(-1)

const onDragStart = (index: number, e: DragEvent) => {
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

const onDragOver = (index: number, e: DragEvent) => {
  e.preventDefault()
  overIndex.value = index
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

const onDrop = (index: number, e: DragEvent) => {
  e.preventDefault()
  const from = dragIndex.value
  onDragEnd()
  if (from < 0 || from === index) return
  if (isCustomMode.value) {
    // 自定义模式:本地列表重排
    const arr = [...customItems.value]
    const [moved] = arr.splice(from, 1)
    arr.splice(index, 0, moved)
    persistItems(arr)
  } else {
    // 文件夹模式:移动真实书签顺序(向后移需 +1 修正 Chrome 同目录 move 的偏移)
    const moved = folderBookmarks.value[from]
    if (!moved || typeof chrome === 'undefined' || !chrome.bookmarks) return
    const newIndex = from < index ? index + 1 : index
    chrome.bookmarks.move(moved.id, { parentId: folderId.value, index: newIndex }, () => loadFolder())
  }
}

const onDragEnd = () => {
  dragIndex.value = -1
  overIndex.value = -1
}

// ===== 删除 =====
const removeItem = (index: number) => {
  const item = customItems.value[index]
  if (!item) return
  if (item.bookmarkId) {
    if (!window.confirm(`删除「${item.title || item.url}」会同时删除 Chrome 中的真实书签,确定吗?`)) return
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.remove(item.bookmarkId, () => { /* 忽略已不存在的情况 */ })
    }
  }
  const arr = [...customItems.value]
  arr.splice(index, 1)
  persistItems(arr)
}

// ===== 添加 =====
const showAddModal = ref(false)
const addUrl = ref('')
const addTitle = ref('')
const addError = ref('')
const fetchingTitle = ref(false)
const titleAutoFilled = ref(false) // 名称是否由自动抓取填入(用户手动改过则不再覆盖)
const urlInputRef = ref<HTMLInputElement | null>(null)
let titleTimer: ReturnType<typeof setTimeout> | undefined

const openAddModal = () => {
  addUrl.value = ''
  addTitle.value = ''
  addError.value = ''
  fetchingTitle.value = false
  titleAutoFilled.value = false
  showAddModal.value = true
  nextTick(() => urlInputRef.value?.focus())
}

const closeAddModal = () => {
  showAddModal.value = false
}

// 抓取网页 <title>;需 host_permissions 跨域读取,失败回退域名
const fetchTitle = async (url: string) => {
  fetchingTitle.value = true
  try {
    const res = await fetch(url, { redirect: 'follow' })
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const title = doc.querySelector('title')?.textContent?.trim()
    if (title && (!addTitle.value.trim() || titleAutoFilled.value)) {
      addTitle.value = title
      titleAutoFilled.value = true
    }
  } catch {
    /* 跨域/网络失败,保持名称为空,提交时回退域名 */
  } finally {
    fetchingTitle.value = false
  }
}

// 名称为空(或仍是自动填入的)时,输入网址自动抓取标题(防抖)
watch(addUrl, (val) => {
  if (titleTimer) clearTimeout(titleTimer)
  if (addTitle.value.trim() && !titleAutoFilled.value) return
  const url = normalizeUrl(val)
  if (!url) return
  titleTimer = setTimeout(() => fetchTitle(url), 600)
})

// 用户手动编辑名称后,不再被自动抓取覆盖
const onTitleInput = () => {
  titleAutoFilled.value = false
}

// Esc 关闭弹窗;关闭时清理防抖定时器
useEscClose(showAddModal, closeAddModal)
watch(showAddModal, (open) => {
  if (!open && titleTimer) clearTimeout(titleTimer)
})

const normalizeUrl = (raw: string): string | null => {
  let url = raw.trim()
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return url
  } catch {
    return null
  }
}

const submitAdd = () => {
  const url = normalizeUrl(addUrl.value)
  if (!url) {
    addError.value = '请输入有效的网址'
    return
  }
  const title = addTitle.value.trim() || getDomain(url) || url
  if (isCustomMode.value) {
    // 自定义模式:追加到本地列表
    persistItems([...customItems.value, { id: makeId(), title, url }])
  } else {
    // 文件夹模式:在所选文件夹里创建真实书签,刷新镜像
    if (typeof chrome === 'undefined' || !chrome.bookmarks) {
      addError.value = '当前环境不支持书签操作'
      return
    }
    chrome.bookmarks.create({ parentId: folderId.value, title, url }, () => loadFolder())
  }
  showAddModal.value = false
}

// 文件夹模式:删除联动真实书签
const removeFolderBookmark = (bookmark: Bookmark) => {
  if (!bookmark?.id) return
  if (!window.confirm(`删除「${bookmark.title || bookmark.url}」会同时删除 Chrome 中的真实书签,确定吗?`)) return
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    chrome.bookmarks.remove(bookmark.id, () => loadFolder())
  }
}

// ===== 图标 =====
const getInitial = (url: string): string => {
  const domain = getDomain(url)
  return domain ? domain.charAt(0).toUpperCase() : '?'
}

const getColor = (url: string): string => {
  const domain = getDomain(url)
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#00C9A7', '#FF6F61', '#6B5B95', '#88B04B'
  ]
  let hash = 0
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.qa-title-tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 5px;
  padding: 2px 7px;
  line-height: 1.4;
}

.qa-title-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 650;
  color: var(--color-text);
}

.quick-access-overflow {
  padding: 8px 18px;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}

/* 拖拽状态 */
.quick-access-item {
  position: relative;
}

.qa-dragging {
  opacity: 0.4;
}

.qa-drag-over {
  outline: 2px dashed var(--color-primary);
  outline-offset: 2px;
  border-radius: 8px;
}

/* 删除按钮 */
.qa-delete-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-danger);
  color: #fff;
  font-size: 13px;
  line-height: 1;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.quick-access-item:hover .qa-delete-btn {
  display: flex;
}

/* 标题栏添加按钮(右上角,不占列表) */
.qa-add-header-btn {
  margin-left: auto;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.qa-add-header-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

/* 弹窗 */
.qa-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.18);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qa-modal {
  width: 90vw;
  max-width: 360px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-popover);
  overflow: hidden;
  animation: qaModalIn 0.18s ease-out;
}

@keyframes qaModalIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.qa-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 650;
  font-size: 14px;
  color: var(--color-text);
}

.qa-modal-close {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-muted);
}

.qa-modal-close:hover {
  background: var(--color-surface-hover);
}

.qa-modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qa-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.qa-field input {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
}

.qa-field input:focus {
  border-color: var(--color-primary);
}

.qa-fetching {
  color: var(--color-primary);
  font-weight: 400;
}

.qa-modal-error {
  color: var(--color-danger);
  font-size: 12px;
}

.qa-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
}

.qa-btn-cancel,
.qa-btn-confirm {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--color-border);
}

.qa-btn-cancel {
  background: var(--color-surface);
  color: var(--color-text);
}

.qa-btn-cancel:hover {
  background: var(--color-surface-hover);
}

.qa-btn-confirm {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.qa-btn-confirm:hover {
  background: var(--color-primary-dark);
}
</style>
