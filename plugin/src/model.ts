import {FilesetResolver, LlmInference} from '@mediapipe/tasks-genai'

import {loadModelFromUrl} from './cache'
import {DocumentContext, GenerationOption, LanguageCode} from './components/TextInputWithButton'
import {GENAI_FILESET_URL, MODEL_URLS, TEXT_GENERATION_DEFAULTS} from './constants'

// Initialize MediaPipe LLM
let gemmaModel: LlmInference | null = null
let loadingModel = false

const initializeModel = async (): Promise<LlmInference> => {
  if (!gemmaModel && !loadingModel) {
    try {
      loadingModel = true
      // Initialize the MediaPipe LLM inference package

      // Check if the model is cached and load from URL if needed
      const modelUrl = MODEL_URLS.GEMMA_3_1B.MODEL
      const modelData = await loadModelFromUrl(modelUrl, (progress: number) => {
        console.log(`Loading model: ${Math.round(progress * 100)}%`)
      })

      const genaiFileset = await FilesetResolver.forGenAiTasks(GENAI_FILESET_URL)

      // Create the model instance
      gemmaModel = await LlmInference.createFromModelBuffer(genaiFileset, new Uint8Array(modelData))

      console.log('Gemma model loaded successfully')
      loadingModel = false
    } catch (error) {
      loadingModel = false
      console.error('Error initializing model:', error)
      throw error
    }
  }
  return gemmaModel as LlmInference
}

const generateText = async (
  context: DocumentContext,
  option: GenerationOption,
  language: LanguageCode,
  callback: (partialResults: string, complete: boolean) => void,
): Promise<void> => {
  try {
    const model = await initializeModel()
    let prompt = ''

    switch (option) {
      case 'Translate':
        prompt = `Translate the following content to ${language}:\n${JSON.stringify(context)}`
        break
      case 'Summarise':
        prompt = `Summarize the following content:\n${JSON.stringify(context)}`
        break
      case 'Generate':
        prompt = `Generate content based on this context:\n${JSON.stringify(context)}`
        break
      default:
        throw new Error('Invalid option')
    }

    model.generateResponse(prompt, callback)
  } catch (error) {
    console.error('Error generating text:', error)
    throw error
  }
}

// Also export the container component and utilities
export {generateText, initializeModel, MODEL_URLS, TEXT_GENERATION_DEFAULTS}
