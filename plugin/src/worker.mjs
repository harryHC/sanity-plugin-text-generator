/* eslint-disable camelcase */
import {
  AutoModelForCausalLM,
  AutoTokenizer,
  InterruptableStoppingCriteria,
  TextStreamer,
} from '../node_modules/@huggingface/transformers/dist/transformers.web.min.js'

// Active connections list
const connections = new Set()

/**
 * Helper function to perform feature detection for WebGPU
 */
async function check() {
  try {
    const adapter = await navigator.gpu.requestAdapter()
    broadcastMessage({
      type: 'support-result',
      supported: !!adapter,
    })
  } catch (e) {
    broadcastMessage({
      type: 'error',
      error: e.toString(),
    })

    broadcastMessage({
      type: 'support-result',
      supported: false,
      error: e.toString(),
    })
  }
}

// Broadcast a message to all connected clients
function broadcastMessage(message) {
  for (const port of connections) {
    port.postMessage(message)
  }
}

/**
 * This class uses the Singleton pattern to enable lazy-loading of the pipeline
 */
class TextGenerationPipeline {
  static loading = false
  static modelId = null
  static tokenizer = null

  // TODO use specialised models for each GenerationOption
  // TODO Remove models options selection from the UI
  // https://huggingface.co/tasks/text-generation
  // https://huggingface.co/tasks/translation
  // https://huggingface.co/tasks/summarization
  static async initialise(modelOptions) {
    this.loading = true
    this.tokenizer = await AutoTokenizer.from_pretrained(modelOptions.id, {
      force_download: true,
      useauth_token: true,
      local_files_only: false,
    })
    this.model = await AutoModelForCausalLM.from_pretrained(modelOptions.id, {
      dtype: modelOptions.dtype,
      device: 'webgpu',
      progress_callback: (x) => x.progress && broadcastMessage({...x, type: 'loading-progress'}),
    })
    this.modelId = modelOptions.id
    this.loading = false

    return [this.tokenizer, this.model]
  }

  static isLoading() {
    return this.loading
  }

  static getInstance() {
    return [this.tokenizer, this.model]
  }
}

const stopping_criteria = new InterruptableStoppingCriteria()

async function generate(prompt) {
  // Retrieve the text-generation pipeline.
  if (TextGenerationPipeline.isLoading()) {
    setTimeout(() => generate(prompt), 200)
    return
  }

  const [tokenizer, model] = TextGenerationPipeline.getInstance()

  const chat = [{role: 'system', content: prompt}]
  const inputs = tokenizer.apply_chat_template(chat, {
    add_generation_prompt: true,
    return_dict: true,
  })

  const [END_THINKING_TOKEN_ID] = tokenizer.encode('</think>\n\n', {
    add_special_tokens: false,
  })

  let state = 'thinking' // 'thinking' or 'answering'

  const token_callback_function = (tokens) => {
    if (tokens[0] === BigInt(END_THINKING_TOKEN_ID)) {
      state = 'answering'
    }
  }

  let results = ''
  const callback_function = (output) => {
    // if (state === 'thinking' || output.indexOf('</think>') !== -1) {
    //   return
    // }
    results += output
    broadcastMessage({
      type: 'generation-update',
      results,
      state,
    })
  }

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function,
    token_callback_function,
  })

  // Tell the main thread we are starting
  broadcastMessage({type: 'status', state})

  // const {sequences} = await model.generate({
  await model.generate({
    ...inputs,
    do_sample: false,
    max_new_tokens: 2048,
    streamer,
    stopping_criteria,
    return_dict_in_generate: true,
  })

  broadcastMessage({type: 'generation-update', results, complete: true, state})
}

async function load(modelOptions) {
  broadcastMessage({type: 'status', status: 'loading-model'})

  const [tokenizer, model] = await TextGenerationPipeline.initialise(modelOptions)

  // Run model with dummy input to compile shaders
  const inputs = tokenizer('a')
  await model.generate({...inputs, max_new_tokens: 1})
  broadcastMessage({type: 'status', status: 'model-loaded'})
}

self.onconnect = function (e) {
  const port = e.ports[0]
  connections.add(port)

  port.start()

  // eslint-disable-next-line no-shadow
  port.onmessage = async (e) => {
    const {type, options} = e.data

    switch (type) {
      case 'check':
        check()
        break

      case 'load':
        try {
          stopping_criteria.reset()
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          // Ignore error
        }
        load(options.model)
        break

      case 'generate':
        stopping_criteria.reset()
        generate(options.prompt)
        break

      case 'cancel':
      case 'interrupt':
        stopping_criteria.interrupt()
        break

      case 'reset':
        stopping_criteria.reset()
        break

      default:
        broadcastMessage({
          type: 'status',
          error: `Unknown message type: ${type}`,
        })
        break
    }
  }

  // Handle disconnection
  port.onclose = function () {
    connections.delete(port)
  }
}
