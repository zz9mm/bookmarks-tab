// favicon 持久化缓存:首次抓取后存入 IndexedDB,之后打开直接读缓存,零网络请求。
// 存 IDB 而非 localStorage,避免挤占背景图占用的 ~5MB 配额(见 pensieve localstorage 策略)。
import { getDomain, getFavicon, getFaviconFallback } from './useFavicon'

const DB_NAME = 'bt-favicons'
const STORE = 'icons'
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 天后后台刷新(图标极少变)

interface CacheRecord {
  domain: string
  blob: Blob
  ts: number
}

let dbPromise: Promise<IDBDatabase | null> | null = null

const openDB = (): Promise<IDBDatabase | null> => {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, { keyPath: 'domain' })
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

const idbGet = async (domain: string): Promise<CacheRecord | null> => {
  const db = await openDB()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(domain)
      r.onsuccess = () => resolve((r.result as CacheRecord) || null)
      r.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

const idbPut = async (domain: string, blob: Blob): Promise<void> => {
  const db = await openDB()
  if (!db) return
  try {
    db.transaction(STORE, 'readwrite').objectStore(STORE).put({ domain, blob, ts: Date.now() })
  } catch {
    /* 写失败忽略,下次重新抓 */
  }
}

const fetchOne = async (u: string): Promise<Blob | null> => {
  if (!u) return null
  try {
    const r = await fetch(u)
    if (!r.ok) return null
    const b = await r.blob()
    return b.size > 0 && b.type.startsWith('image') ? b : null
  } catch {
    return null
  }
}

// 先 icon.horse,失败回退站点 /favicon.ico
const fetchFaviconBlob = async (url: string): Promise<Blob | null> =>
  (await fetchOne(getFavicon(url))) || (await fetchOne(getFaviconFallback(url)))

const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(blob)
  })

// 同一域名在本次会话内只解析一次(多个图标组件 / 多次渲染共享)
const memo = new Map<string, Promise<string | null>>()

/**
 * 解析某 URL 的 favicon,返回 data URL(可直接做 <img src>),无可用图标返回 null。
 * 命中 IDB 缓存则零网络;未命中则抓取一次并写缓存。
 */
export const resolveFavicon = (url: string): Promise<string | null> => {
  const domain = getDomain(url)
  if (!domain) return Promise.resolve(null)
  const cached = memo.get(domain)
  if (cached) return cached

  const p = (async () => {
    const rec = await idbGet(domain)
    if (rec?.blob) {
      // 过期则后台静默刷新,不阻塞本次渲染
      if (Date.now() - rec.ts > TTL_MS) {
        fetchFaviconBlob(url).then((b) => { if (b) idbPut(domain, b) })
      }
      try {
        return await blobToDataURL(rec.blob)
      } catch {
        /* 缓存损坏,继续走抓取 */
      }
    }
    const blob = await fetchFaviconBlob(url)
    if (!blob) return null
    idbPut(domain, blob)
    try {
      return await blobToDataURL(blob)
    } catch {
      return null
    }
  })()

  memo.set(domain, p)
  return p
}
