import {FilesetResolver, LlmInference} from './_genai_bundle.mjs'

const GENAI_FILESET_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'

// Initialize MediaPipe LLM
let llmInference = null
let loadingModel = false

const initializeModel = async (modelParameters) => {
  if (!llmInference && !loadingModel) {
    try {
      loadingModel = true
      postMessage({type: 'status', status: 'loading-model'})

      // Initialize the MediaPipe LLM inference package
      const genaiFileset = await FilesetResolver.forGenAiTasks(GENAI_FILESET_URL)

      // Create the model instance
      llmInference = await LlmInference.createFromOptions(genaiFileset, {
        baseOptions: {
          modelAssetPath: modelParameters.url,
        },
        maxTokens: modelParameters.maxTokens,
        temperature: modelParameters.temperature,
      })

      postMessage({type: 'status', status: 'model-loaded'})
      loadingModel = false
    } catch (error) {
      loadingModel = false
      postMessage({type: 'error', error: error.message})
      throw error
    }
  }
  return llmInference
}

const generateText = async (options) => {
  const {modelParameters, prompt, value} = options
  try {
    const model = await initializeModel(modelParameters)
    let results = value || ''

    console.log(`Generating text with prompt: ${prompt}`)
    model.generateResponse(prompt, (partialResults, complete) => {
      if (!partialResults?.trim() && !complete) {
        return
      }
      results += partialResults
      postMessage({type: 'generation-update', results, complete})
    })
  } catch (error) {
    postMessage({type: 'error', error: error.message})
    throw error
  }
}

function stopInference() {
  if (llmInference) {
    try {
      // TODO: Worker error: Cannot process because LLM inference engine is currently loading or processing.
      if (loadingModel) {
        setTimeout(stopInference, 500)
      } else {
        llmInference.close()
        llmInference = null
        postMessage({type: 'status', status: 'cancelled'})
      }
    } catch (error) {
      postMessage({type: 'error', error: error.message})
    }
  }
}

// Handle messages from the main thread
self.addEventListener('message', async (e) => {
  console.log('Worker received message:', e.data)

  if (e.data.type === 'generate') {
    await generateText(e.data.options)
  } else if (e.data.type === 'cancel') {
    stopInference()
  }
})
