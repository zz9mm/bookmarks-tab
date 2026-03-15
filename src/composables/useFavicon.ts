// Shared utilities for favicon handling
export const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export const getFavicon = (url: string, size = 32): string => {
  const domain = getDomain(url)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}

export const getEngineIcon = (engine: string): string => {
  const domain = engine === 'baidu' ? 'baidu.com' : `${engine}.com`
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

export const searchEngines = {
  bing: { url: 'https://www.bing.com/search?q=', name: 'Bing' },
  baidu: { url: 'https://www.baidu.com/s?wd=', name: '百度' },
  google: { url: 'https://www.google.com/search?q=', name: 'Google' }
}
