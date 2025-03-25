/**
 * Model URLs for different LLMs
 */
const MODEL_URLS = {
  GEMMA_3_1B: {
    MODEL: 'https://huggingface.co/litert-community/Gemma3-1B-IT/resolve/main/gemma3-1b-it-int4.task?download=true',
  },
};

/**
 * Default text generation options
 */
const TEXT_GENERATION_DEFAULTS = {
  MAX_TOKENS: 512,
  TEMPERATURE: 0.8,
};

/**
 * Local storage keys
 */
const STORAGE_KEYS = {
  LANGUAGE: 'sanityTextGenerator_language',
  SELECTED_MODEL: 'sanityTextGenerator_selectedModel',
};

/**
 * Supported languages
 */
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
];

export {
  MODEL_URLS,
  TEXT_GENERATION_DEFAULTS,
  STORAGE_KEYS,
  SUPPORTED_LANGUAGES,
};
