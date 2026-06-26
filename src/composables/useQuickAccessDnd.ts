// 多个快速访问模块之间拖拽的协调器(页面内单例)。
// 各实例注册自己的取/删能力,拖拽落到别的实例时由目标实例查询源实例完成跨模块移动。

export interface QaDragItem {
  title: string
  url: string
  bookmarkId?: string
}

export interface QaSource {
  mode: () => 'custom' | 'folder'
  itemAt: (index: number) => QaDragItem | null
  // 从源实例移除该项。自定义模式真正移除(移动语义);文件夹模式不动真实书签(复制语义)。
  detach: (index: number) => void
}

let seq = 0
const sources = new Map<number, QaSource>()
let active: { uid: number; index: number } | null = null

export const nextQaUid = (): number => ++seq
export const registerQaSource = (uid: number, api: QaSource): void => { sources.set(uid, api) }
export const unregisterQaSource = (uid: number): void => { sources.delete(uid) }

export const beginQaDrag = (uid: number, index: number): void => { active = { uid, index } }
export const endQaDrag = (): void => { active = null }
export const getQaActive = () => active
export const getQaSource = (uid: number): QaSource | null => sources.get(uid) || null
