// 模块类型定义

export type ModuleType = 'bookmark-search' | 'folder' | 'web-search' | 'quick-access' | 'title' | 'minimax-usage'

export interface ModuleInfo {
  type: ModuleType
  name: string
  hasConfig: boolean
}

export interface ModuleConfig {
  [key: string]: unknown
}

// 各模块的默认配置
export const defaultModuleConfigs: Record<ModuleType, ModuleConfig> = {
  'bookmark-search': {},
  'folder': {},
  'web-search': { engine: 'bing' },
  'quick-access': { cols: 4 },
  'title': { text: '文本', fontSize: 24, align: 'center', fontFamily: 'inherit', textIndent: 0 },
  'minimax-usage': { apiKey: '' }
}

export const moduleList: ModuleInfo[] = [
  { type: 'bookmark-search', name: '书签搜索', hasConfig: false },
  { type: 'folder', name: '收藏夹', hasConfig: false },
  { type: 'web-search', name: '网页搜索', hasConfig: true },
  { type: 'quick-access', name: '快速访问', hasConfig: true },
  { type: 'title', name: '文本', hasConfig: true },
  { type: 'minimax-usage', name: 'Minimax 用量', hasConfig: true }
]
