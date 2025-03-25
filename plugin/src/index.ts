import React from 'react'
import {definePlugin, InputProps, PluginOptions, StringInputProps} from 'sanity'

import TextInputWithButton from './components/TextInputWithButton'

/**
 * Configuration options for the text generator plugin
 */
export interface TextGeneratorPluginConfig {
  /* Configuration options can be added here in the future */
  model?: string
  maxTokens?: number
  temperature?: number
  language?: string
}

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {textGenerator} from 'sanity-plugin-text-generator'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [textGenerator()],
 * })
 * ```
 */
export const textGenerator = definePlugin<TextGeneratorPluginConfig | void>((_config = {}) => {
  const TextInputComponent = (props: InputProps) =>
    React.createElement(TextInputWithButton, {...props, ..._config} as StringInputProps)

  const pluginConfig: PluginOptions = {
    name: 'sanity-plugin-text-generator',
    form: {
      components: {
        input: TextInputComponent,
      },
    },
  }

  return pluginConfig
})
