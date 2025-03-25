import {FilesetResolver, LlmInference} from './genai_bundle.mjs'

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
  const {modelParameters, field, value, context, generationOption, language} = options
  try {
    const model = await initializeModel(modelParameters)
    let prompt = ``
    let results = value || ''
    const contextString = JSON.stringify(context).replaceAll(/"|\{|\}|:|\n|\r/g, ' ')

    switch (generationOption) {
      case 'Translate':
        prompt = `
          Translate the following content to ${language}:\n${value}\n
          The translation should be accurate and maintain the original meaning.
          The translation should be in ${language}.
          Output the generated content only.
        `
        break
      case 'Summarise':
        prompt = `
          Based on this context:\n${contextString}\nsummarize the following content:\n${value}\n
          The provided context is in JSON format, extracted from a Sanity CMS document.
          The summary should be concise and capture the main points.
          The summary should be in ${language}.
          The output should be a single paragraph in plain text without additional formatting, bullet points or quotes.
          The output should contain only the generated content without any responses to the initial instructions and without any quotes.
        `
        break
      case 'Generate':
        prompt = `
          Based on this context:\n${contextString}\ngenerate content for the ${field} field ${value ? `with the following content:\n${value}` : ''}\n
          The provided context is in JSON format, extracted from a Sanity CMS document.
          The output should be relevant to the context and field.
          The output should be in ${language}.
          The output should be in plain text format without any formatting, bullet points or quotes.
          The output should contain only the generated content without any responses to the initial instructions and without any quotes.
        `
        break
      default:
        throw new Error('Invalid option')
    }

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
      // ! Worker error: Cannot process because LLM inference engine is currently loading or processing.
      // TODO
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
