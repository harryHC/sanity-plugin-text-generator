import FileProxyCache from 'https://cdn.jsdelivr.net/gh/jasonmayes/web-ai-model-proxy-cache@main/FileProxyCache.min.js';
import { STORAGE_KEYS } from './constants.js';

// Configure FileProxyCache
FileProxyCache.setCacheName('SanityTextGenerator');
FileProxyCache.setShardSize(134217728); // 128MB shards
FileProxyCache.enableDebug(false);

const getCachedLanguage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  }
  return 'en';
};

const setCachedLanguage = (language) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }
};

/**
 * Loads a model from URL with caching support
 * @param {string} modelUrl - URL of the model to load
 * @param {function} progressCallback - Optional callback for progress updates
 * @returns {Promise<string>} Data URL of the cached model
 */
const loadModelFromUrl = async (modelUrl, progressCallback = null) => {
  try {
    const dataUrl = await FileProxyCache.loadFromURL(modelUrl, progressCallback);
    return dataUrl;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

/**
 * Checks if a model URL is cached
 * @param {string} modelUrl - URL to check
 * @returns {Promise<boolean>} True if cached
 */
const isModelCached = async (modelUrl) => {
  return await FileProxyCache.isCached(modelUrl);
};

/**
 * Clear all cached models
 */
const clearModelCache = async () => {
  return await FileProxyCache.clearCache();
};

export {
  getCachedLanguage,
  setCachedLanguage,
  loadModelFromUrl,
  isModelCached,
  clearModelCache
};
