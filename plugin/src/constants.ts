/**
 * Model URLs for different LLMs
 */
interface ModelUrl {
  MODEL: string
}

interface ModelsCollection {
  GEMMA_3_1B: ModelUrl
}

const MODEL_URLS: ModelsCollection = {
  GEMMA_3_1B: {
    MODEL:
      'https://raw.githubusercontent.com/harryHC/sanity-plugin-text-generator/refs/heads/main/gemma3-1b-it-int4.task',
  },
}

const GENAI_FILESET_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'

/**
 * Default text generation options
 */
interface TextGenerationDefaults {
  MAX_TOKENS: number
  TEMPERATURE: number
}

const TEXT_GENERATION_DEFAULTS: TextGenerationDefaults = {
  MAX_TOKENS: 512,
  TEMPERATURE: 0.8,
}

/**
 * Local storage keys
 */
interface StorageKeys {
  LANGUAGE: string
  SELECTED_MODEL: string
}

const STORAGE_KEYS: StorageKeys = {
  LANGUAGE: 'sanityTextGenerator_language',
  SELECTED_MODEL: 'sanityTextGenerator_selectedModel',
}

/**
 * Supported language definition
 */
interface Language {
  code: string
  name: string
}

/**
 * Supported languages
 */
const SUPPORTED_LANGUAGES: Language[] = [
  {code: 'en', name: 'English'},
  {code: 'es', name: 'Spanish'},
  {code: 'fr', name: 'French'},
  {code: 'de', name: 'German'},
  {code: 'it', name: 'Italian'},
  {code: 'pt', name: 'Portuguese'},
  {code: 'zh', name: 'Chinese'},
  {code: 'ja', name: 'Japanese'},
]

export {
  GENAI_FILESET_URL,
  type Language,
  MODEL_URLS,
  type ModelsCollection,
  type ModelUrl,
  STORAGE_KEYS,
  type StorageKeys,
  SUPPORTED_LANGUAGES,
  TEXT_GENERATION_DEFAULTS,
  type TextGenerationDefaults,
}
