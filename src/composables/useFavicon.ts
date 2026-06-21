// Shared utilities for favicon handling
export const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export const getFavicon = (url: string, _size = 32): string => {
  const domain = getDomain(url)
  return `https://icon.horse/icon/${domain}`
}

export const getFaviconFallback = (url: string): string => {
  const domain = getDomain(url)
  return domain ? `https://${domain}/favicon.ico` : ''
}

export const getEngineIcon = (engine: string): string => {
  const domain = engine === 'baidu' ? 'baidu.com' : `${engine}.com`
  return `https://icon.horse/icon/${domain}`
}

export const searchEngines = {
  bing: { url: 'https://www.bing.com/search?q=', name: 'Bing' },
  baidu: { url: 'https://www.baidu.com/s?wd=', name: '百度' },
  google: { url: 'https://www.google.com/search?q=', name: 'Google' }
}