import {loadModelFromUrl} from './cache'
import {DocumentContext, GenerationOption} from './components/TextInputWithButton'
import {LanguageCode, MODELS} from './constants'

let textGeneratorWorker: Worker | null = null

export type TextGenerationOptions = {
  field: string | undefined
  value: string
  context: DocumentContext
  generationOption: GenerationOption
  language: LanguageCode
  callback: (results: string, complete: boolean) => void
}

// Initialize the web worker
const getWorker = (): Worker => {
  if (!textGeneratorWorker) {
    textGeneratorWorker = new Worker(new URL('./textGeneratorWorker.js?worker', import.meta.url), {
      type: 'classic',
    })
  }
  return textGeneratorWorker
}

// This function is now running in a web worker
const generateText = async (options: TextGenerationOptions): Promise<void> => {
  const {field, value, context, generationOption, language, callback} = options
  try {
    const worker = getWorker()

    // Handle messages from the worker
    worker.onmessage = (e) => {
      const {type} = e.data

      switch (type) {
        case 'generation-update':
          callback(e.data.results, e.data.complete)
          break
        case 'loading-progress':
          console.log(`Loading model in worker: ${e.data.progress}%`)
          break
        case 'status':
          console.log(`Worker status: ${e.data.status}`)
          break
        case 'error':
          console.error('Worker error:', e.data.error)
          break
        default:
          console.warn('Unknown message type from worker:', type)
          break
      }
    }

    const modelParameters = {
      ...MODELS.GEMMA_3_1B,
      url: await loadModelFromUrl(MODELS.GEMMA_3_1B.url),
    }

    // Send the generation request to the worker
    console.log('Sending generation request to worker:')
    worker.postMessage({
      type: 'generate',
      options: {
        modelParameters,
        field,
        value,
        context,
        generationOption,
        language,
      },
    })
  } catch (error) {
    console.error('Error generating text:', error)
    throw error
  }
}

// Function to cancel ongoing text generation
const cancelTextGeneration = (): void => {
  if (textGeneratorWorker) {
    textGeneratorWorker.postMessage({type: 'cancel'})
  }
}

// Also export the container component and utilities
export {cancelTextGeneration, generateText, MODELS}
