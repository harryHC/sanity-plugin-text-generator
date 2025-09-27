interface Model {
  id: string
  maxTokens: number
  temperature: number
  name: string
  dtype: string
}

interface ModelsCollection {
  GEMMA_3_1B: Model
  DEEPSEEK_R1_1_5B: Model
}

// onnx-community/moondream2.text_model-ONNX
// onnx-community/Qwen2.5-1.5B-Instruct
// onnx-community/gemma-3-1b-it-ONNX-web
const MODELS: ModelsCollection = {
  GEMMA_3_1B: {
    id: 'onnx-community/gemma-3-1b-it-ONNX-web',
    maxTokens: 2048,
    temperature: 0.8,
    name: 'Gemma 3 1B',
    dtype: 'q8',
  },
  DEEPSEEK_R1_1_5B: {
    id: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX',
    maxTokens: 2048,
    temperature: 0.8,
    name: 'DeepSeek R1 1.5B',
    dtype: 'q4f16',
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
