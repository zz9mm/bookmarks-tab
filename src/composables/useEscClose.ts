import { onScopeDispose, watch, type Ref } from 'vue'

// 全局 LIFO 栈:多层弹窗叠加时,Esc 只关闭最顶层的那个
const stack: Array<() => void> = []
let bound = false

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  const top = stack[stack.length - 1]
  if (top) {
    e.stopPropagation()
    e.preventDefault()
    top()
  }
}

const ensureBound = () => {
  if (!bound) {
    window.addEventListener('keydown', handleKeydown)
    bound = true
  }
}

/**
 * 注册一个弹窗的 Esc 关闭。isOpen 变 true 时入栈,变 false / 组件卸载时出栈。
 */
export function useEscClose(isOpen: Ref<boolean>, close: () => void) {
  const remove = () => {
    const i = stack.lastIndexOf(close)
    if (i >= 0) stack.splice(i, 1)
  }
  watch(
    isOpen,
    (open) => {
      remove()
      if (open) {
        stack.push(close)
        ensureBound()
      }
    },
    { immediate: true }
  )
  onScopeDispose(remove)
}
