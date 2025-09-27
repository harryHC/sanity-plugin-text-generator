import {GenerationOption} from './components/ActionsMenu'
import {DocumentContext} from './components/TextInputWithButton'
import {LanguageCode, Model, MODELS, SUPPORTED_LANGUAGES} from './constants'

export type SharedWorkerMessage = {
  type: string
  status?: string
  progress?: number
  results?: string
  complete?: boolean
  supported?: boolean
  error?: string
  model?: Model
}

let sharedTextGeneratorWorker: SharedWorker | null = null
let sharedWorkerPort: MessagePort | null = null
const messageHandlers: Map<string, ((data: SharedWorkerMessage) => void)[]> = new Map()

export type TextGenerationOptions = {
  field: string | undefined
  value: string
  context: DocumentContext
  generationOption: GenerationOption
  language: LanguageCode
  callback: (results: string, complete: boolean) => void
}

function getSavedModelOption(): Model {
  const savedModelLocalStorage = localStorage.getItem('model')
  const savedModel: Model = savedModelLocalStorage
    ? (JSON.parse(savedModelLocalStorage) as Model)
    : Object.entries(MODELS)[0][1]
  return savedModel
}

function saveModelOption(model: Model): void {
  localStorage.setItem('model', JSON.stringify(model))
}

// Initialize the shared web worker
function getSharedWorker(): {worker: SharedWorker; port: MessagePort} {
  if (!sharedTextGeneratorWorker) {
    sharedTextGeneratorWorker = new SharedWorker(new URL('./worker.mjs?worker', import.meta.url), {
      type: 'module',
      name: 'text-generator-worker',
    })

    sharedWorkerPort = sharedTextGeneratorWorker.port

    // Set up message handling
    sharedWorkerPort.onmessage = (e) => {
      const {type} = e.data

      if (messageHandlers.has(type)) {
        messageHandlers.get(type)?.forEach((handler) => handler(e.data))
      }
    }

    // Start the port
    sharedWorkerPort.start()
  }

  return {
    worker: sharedTextGeneratorWorker,
    port: sharedWorkerPort as MessagePort,
  }
}

// Add handler for specific message types
function addMessageHandler(type: string, handler: (data: SharedWorkerMessage) => void): void {
  if (!messageHandlers.has(type)) {
    messageHandlers.set(type, [])
  }
  messageHandlers.get(type)?.push(handler)
}

// Remove handler for specific message types
function removeMessageHandler(type: string, handler: (data: SharedWorkerMessage) => void): void {
  if (messageHandlers.has(type)) {
    const handlers = messageHandlers.get(type) || []
    messageHandlers.set(
      type,
      handlers.filter((h) => h !== handler),
    )
  }
}

function loadModel(model: Model, progressCallback?: {(progress: number): void}): Promise<void> {
  return new Promise((resolve) => {
    const {port} = getSharedWorker()

    const loadingProgressHandler = (data: SharedWorkerMessage) => {
      if (progressCallback) {
        progressCallback(data.progress as number)
      } else {
        // console.log('Loading progress:', data.progress)
      }
    }

    const statusHandler = (data: SharedWorkerMessage) => {
      if (data.status === 'model-loaded') {
        removeMessageHandler('loading-progress', loadingProgressHandler)
        removeMessageHandler('status', statusHandler)
        resolve()
      }
    }

    addMessageHandler('loading-progress', loadingProgressHandler)
    addMessageHandler('status', statusHandler)

    // Send the model loading request to the worker
    port.postMessage({
      type: 'load',
      options: {model},
    })
  })
}

const buildPrompt = ({
  field,
  value,
  context,
  generationOption,
  language,
}: TextGenerationOptions): string => {
  let prompt = ``
  const contextString = Array.from(Object.keys(context))
    .map((key) => {
      return `${key}: ${JSON.stringify(context[key]).replaceAll(/"|\{|\}|:|\n|\r/g, ' ')}`
    })
    .join('\n')
  const languageName = SUPPORTED_LANGUAGES.find((lang) => lang.code === language)?.name

  switch (generationOption) {
    case 'Translate':
      prompt = `
          Translate the following content to ${languageName}:\n"${value}"\n\n
          The translation should be accurate and maintain the original meaning.
          The translation should be in ${languageName}.
          The output should contain the translated text only.
        `
      break
    case 'Summarise':
      prompt = `
          You are a website copyrighter and you are asked to help create the content for a website.
          Based on the current page content:\n"${contextString}"\n\nsummarize the following:\n"${value}"\n
          The summary should be concise and capture the main points.
          The summary should be in ${languageName}.
          The output should be a single paragraph in plain text without additional formatting, bullet points or quotes.
        `
      break
    case 'Generate':
      prompt = `
          You are a website copyrighter.
          Based on the current content in a website:\n"${contextString}"\n\ngenerate some text for the "${field}" section ${value ? `that already has this content:\n"${value}"` : ''}\n
          The output should be relevant to the given content and section.
          The output should be in ${languageName}.
        `
      break
    default:
      throw new Error('Invalid option')
  }
  return prompt
}

const generateText = async (options: TextGenerationOptions): Promise<void> => {
  const {callback} = options
  try {
    const {port} = getSharedWorker()

    const generationUpdateHandler = (data: SharedWorkerMessage) => {
      callback(data.results || '', !!data.complete)

      if (data.complete) {
        removeMessageHandler('generation-update', generationUpdateHandler)
      }
    }

    // Register handler
    addMessageHandler('generation-update', generationUpdateHandler)

    const prompt = buildPrompt(options)
    // Send the generation request to the worker
    console.log('Sending generation request to worker')
    port.postMessage({
      type: 'generate',
      options: {prompt},
    })
  } catch (error) {
    console.error('Error generating text:', error)
    throw error
  }
}

const cancelTextGeneration = (): void => {
  if (sharedWorkerPort) {
    sharedWorkerPort.postMessage({type: 'cancel'})
  }
}

function checkWebGPUSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const {port} = getSharedWorker()

    const supportHandler = (data: SharedWorkerMessage) => {
      if (data.type === 'support-result') {
        removeMessageHandler('support-result', supportHandler)
        resolve(!!data.supported)
      }
    }

    addMessageHandler('support-result', supportHandler)

    port.postMessage({type: 'check'})
  })
}

export {
  addMessageHandler,
  cancelTextGeneration,
  checkWebGPUSupport,
  generateText,
  getSavedModelOption,
  loadModel,
  removeMessageHandler,
  saveModelOption,
}
