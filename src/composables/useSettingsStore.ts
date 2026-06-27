// 设置持久化:统一走 chrome.storage.local。
// 原因:扩展新标签页的 localStorage 属于「站点数据」,Edge「退出时清除站点数据/
// 禁用缓存」会在重启时清空它,导致样式丢失。chrome.storage.local 是扩展级存储,
// 不受站点数据清理影响,重启可靠保留,也没有 localStorage ~5MB 硬上限。
//
// 提供 localStorage 兜底(dev preview 等无 chrome 环境),并在首次读取时把仍只存在
// 于 localStorage 的旧值迁移进 chrome.storage.local —— 对设置仍在的老用户无损。

declare const chrome: any

const hasChromeStorage = (): boolean =>
  typeof chrome !== 'undefined' && !!chrome?.storage?.local

// 去掉 Vue reactive proxy 等不可结构化克隆的包装,保证可写入 chrome.storage。
const toPlain = (value: unknown): unknown => {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return value
  }
}

// localStorage 里的值可能是 JSON 字符串,也可能是裸字符串(如 themeMode='dark')。
const parseMaybeJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * 批量读取设置键。优先 chrome.storage.local;缺失的键回退/迁移自 localStorage。
 * 返回值为已解析的对象(对象/数组/字符串),键不存在则该键缺省(undefined)。
 */
export const storageGet = async (
  keys: string[]
): Promise<Record<string, unknown>> => {
  if (hasChromeStorage()) {
    const got = await chrome.storage.local.get(keys)
    const result: Record<string, unknown> = {}
    const toMigrate: Record<string, unknown> = {}
    for (const k of keys) {
      if (got[k] !== undefined) {
        result[k] = got[k]
      } else {
        const ls = localStorage.getItem(k)
        if (ls !== null) {
          const parsed = parseMaybeJson(ls)
          result[k] = parsed
          toMigrate[k] = parsed
        }
      }
    }
    if (Object.keys(toMigrate).length) {
      try {
        await chrome.storage.local.set(toMigrate)
      } catch {
        /* 迁移失败忽略,下次再试 */
      }
    }
    return result
  }

  // 兜底:纯 localStorage
  const result: Record<string, unknown> = {}
  for (const k of keys) {
    const ls = localStorage.getItem(k)
    if (ls !== null) result[k] = parseMaybeJson(ls)
  }
  return result
}

/** 写入单个设置键。chrome 环境写 chrome.storage.local,否则写 localStorage。 */
export const storageSet = async (key: string, value: unknown): Promise<void> => {
  if (hasChromeStorage()) {
    try {
      await chrome.storage.local.set({ [key]: toPlain(value) })
    } catch {
      /* 写失败忽略 */
    }
    return
  }
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * 申请持久化存储,防止浏览器把 IndexedDB(背景图/favicon 缓存)当站点数据驱逐。
 * 扩展环境通常自动授予;返回是否持久。失败静默。
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist()
  } catch {
    /* 忽略 */
  }
  return false
}
