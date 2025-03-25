import {FilesetResolver, LlmInference} from '@mediapipe/tasks-genai'

import {loadModelFromUrl} from './cache'
import {DocumentContext, GenerationOption} from './components/TextInputWithButton'
import {GENAI_FILESET_URL, LanguageCode, MODEL_URLS, TEXT_GENERATION_DEFAULTS} from './constants'

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
      const modelDataUrl = await loadModelFromUrl(modelUrl, (progress: number) => {
        console.log(`Loading model: ${Math.round(progress * 100)}%`)
      })

      const genaiFileset = await FilesetResolver.forGenAiTasks(GENAI_FILESET_URL)

      // Create the model instance
      gemmaModel = await LlmInference.createFromOptions(genaiFileset, {
        baseOptions: {
          modelAssetPath: modelDataUrl,
        },
        maxTokens: TEXT_GENERATION_DEFAULTS.MAX_TOKENS,
        temperature: TEXT_GENERATION_DEFAULTS.TEMPERATURE,
      })

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

export type TextGenerationOptions = {
  field: string | undefined
  value: string
  context: DocumentContext
  generationOption: GenerationOption
  language: LanguageCode
  callback: (results: string, complete: boolean) => void
}

// TODO run in a web worker
// TODO use model.close to cancel inference
const generateText = async (options: TextGenerationOptions): Promise<void> => {
  const {field, value, context, generationOption, language, callback} = options
  try {
    const model: LlmInference = await initializeModel()
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

    model.generateResponse(prompt, (partialResults, complete) => {
      if (!partialResults?.trim() && !complete) {
        return
      }
      results += partialResults
      callback(results, complete)
    })
  } catch (error) {
    console.error('Error generating text:', error)
    throw error
  }
}

// Also export the container component and utilities
export {generateText, initializeModel, MODEL_URLS, TEXT_GENERATION_DEFAULTS}
