// 背景图/视频以原始 Blob 存入 IndexedDB:无 base64 膨胀、配额按磁盘百分比,
// 解决 localStorage ~5MB 上限导致的 4K 大图模糊问题。

const DB_NAME = 'bt-background'
const STORE = 'bg'
const KEY = 'current'

let dbPromise: Promise<IDBDatabase | null> | null = null

const openDB = (): Promise<IDBDatabase | null> => {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

export const getBackground = async (): Promise<Blob | null> => {
  const db = await openDB()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY)
      r.onsuccess = () => resolve((r.result as Blob) || null)
      r.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export const putBackground = async (blob: Blob): Promise<void> => {
  const db = await openDB()
  if (!db) throw new Error('IndexedDB 不可用')
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(blob, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    } catch (e) {
      reject(e)
    }
  })
}

export const clearBackground = async (): Promise<void> => {
  const db = await openDB()
  if (!db) return
  try {
    db.transaction(STORE, 'readwrite').objectStore(STORE).delete(KEY)
  } catch {
    /* 忽略 */
  }
}

export const dataURLToBlob = (dataURL: string): Blob | null => {
  try {
    const [head, body] = dataURL.split(',')
    const mime = head.match(/data:([^;]+)/)?.[1] || 'application/octet-stream'
    const bin = atob(body)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return new Blob([arr], { type: mime })
  } catch {
    return null
  }
}

export const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(blob)
  })
