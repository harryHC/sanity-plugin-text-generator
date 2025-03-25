import {LanguageCode, STORAGE_KEYS} from './constants'

// Extend the global Window interface to include FileProxyCache
declare global {
  interface Window {
    FileProxyCache: {
      setCacheName: (name: string) => void
      setShardSize: (size: number) => void
      enableDebug: (enable: boolean) => void
      loadFromURL: (
        url: string,
        progressCallback?: (progress: number) => void,
      ) => Promise<ArrayBuffer>
      isCached: (url: string) => Promise<boolean>
      clearCache: () => Promise<boolean>
    }
  }
}

type FileProxyCacheType = {
  setCacheName: (name: string) => void
  setShardSize: (size: number) => void
  enableDebug: (enable: boolean) => void
  loadFromURL: (url: string, progressCallback?: (progress: number) => void) => Promise<string>
  isCached: (url: string) => Promise<boolean>
  clearCache: () => Promise<boolean>
}

let FileProxyCache: FileProxyCacheType

  // Dynamic import
;(async () => {
  try {
    FileProxyCache = (
      await import(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /*@ts-ignore*/
        'https://cdn.jsdelivr.net/gh/jasonmayes/web-ai-model-proxy-cache@main/FileProxyCache.min.js'
      )
    ).default as FileProxyCacheType

    // Configure FileProxyCache
    FileProxyCache.setCacheName('SanityTextGenerator')
    FileProxyCache.setShardSize(134217728) // 128MB shards
    FileProxyCache.enableDebug(false)
  } catch (error) {
    console.error('Failed to load FileProxyCache module:', error)
  }
})()

/**
 * Gets the cached language preference
 * @returns {string} The cached language code
 */
const getCachedLanguage = (): LanguageCode => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en') as LanguageCode
  }
  return 'en'
}

/**
 * Sets the language preference in cache
 * @param {string} language - The language code to cache
 */
const setCachedLanguage = (language: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language)
  }
}

/**
 * Loads a model from URL with caching support
 * @param {string} modelUrl - URL of the model to load
 * @param {function} progressCallback - Optional callback for progress updates
 * @returns {Promise<string>} Data URL path to the model
 */
const loadModelFromUrl = async (
  modelUrl: string,
  progressCallback?: (progress: number) => void,
): Promise<string> => {
  try {
    if (!FileProxyCache) {
      throw new Error('FileProxyCache not initialized')
    }
    const dataURL = await FileProxyCache.loadFromURL(modelUrl, progressCallback)
    return dataURL
  } catch (error) {
    console.error('Error loading model:', error)
    throw error
  }
}

/**
 * Checks if a model URL is cached
 * @param {string} modelUrl - URL to check
 * @returns {Promise<boolean>} True if cached
 */
const isModelCached = async (modelUrl: string): Promise<boolean> => {
  if (!FileProxyCache) {
    return false
  }
  return await FileProxyCache.isCached(modelUrl)
}

/**
 * Clear all cached models
 * @returns {Promise<boolean>} True if cache was cleared successfully
 */
const clearModelCache = async (): Promise<boolean> => {
  if (!FileProxyCache) {
    return false
  }
  return await FileProxyCache.clearCache()
}

export {clearModelCache, getCachedLanguage, isModelCached, loadModelFromUrl, setCachedLanguage}
