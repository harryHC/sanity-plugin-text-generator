interface Model {
  url: string
  maxTokens: number
  temperature: number
  model: string
}

interface ModelsCollection {
  GEMMA_3_1B: Model
  DEEPSEEK_R1_1_5B: Model
}

const MODELS: ModelsCollection = {
  GEMMA_3_1B: {
    url: 'https://media.githubusercontent.com/media/harryHC/sanity-plugin-text-generator/main/gemma3-1b-it-int4.task',
    maxTokens: 2048,
    temperature: 0.8,
    model: 'Gemma 3 1B',
  },
  DEEPSEEK_R1_1_5B: {
    url: 'https://media.githubusercontent.com/media/harryHC/sanity-plugin-text-generator/main/deepseek_q8_ekv1280.task',
    maxTokens: 2048,
    temperature: 0.8,
    model: 'DeepSeek R1 1.5B',
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

export type LanguageCode = 'gr' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | ''

interface Language {
  code: LanguageCode
  name: string
}

/**
 * Supported languages
 */
const SUPPORTED_LANGUAGES: Language[] = [
  {code: 'gr', name: 'Greek'},
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
  type Model,
  MODELS,
  type ModelsCollection,
  STORAGE_KEYS,
  type StorageKeys,
  SUPPORTED_LANGUAGES,
  type TextGenerationDefaults,
}
