import {ComposeSparklesIcon, StopIcon} from '@sanity/icons'
import {Button, Flex, Select, Spinner, SpinnerProps, Stack} from '@sanity/ui'
import React, {ChangeEvent, useCallback, useState} from 'react'
import {
  ObjectInputProps,
  SanityDocument,
  set,
  StringInputProps,
  useClient,
  useFormValue,
} from 'sanity'

import {LanguageCode, Model, SUPPORTED_LANGUAGES} from '../constants'
import {
  cancelTextGeneration,
  generateText,
  getSavedModelOption,
  loadModel,
  saveModelOption,
  TextGenerationOptions,
} from '../model'
import {getCachedLanguage, setCachedLanguage} from './../cache'
import ActionsMenu, {GenerationOption} from './ActionsMenu'
import SettingsMenu from './SettingsMenu'

export type DocumentContext = Record<string, unknown>

export const BUTTONS_PADDING: number[] = [2, 1.5, 1.5]

// Helper function to extract string values from document context
const extractStringValues = (document: SanityDocument): Record<string, string> => {
  const result: Record<string, string> = {}

  Object.entries(document).forEach(([key, value]) => {
    if (key.startsWith('_') || Array.isArray(value)) {
      return
    }

    // Type check before accessing _type property
    if (typeof value === 'object' && value !== null && '_type' in value) {
      if (value._type === 'reference' || value._type === 'image') {
        return
      }
    }
    result[key] = value as string
  })

  return result
}

const TextInputWithButton = (props: ObjectInputProps | StringInputProps): React.ReactElement => {
  const {onChange, value = '', renderDefault, level, schemaType} = props
  const [option, setOption] = useState<GenerationOption>('Generate')
  const [model, setModel] = useState<Model>(getSavedModelOption())
  const [language, setLanguage] = useState<LanguageCode>(SUPPORTED_LANGUAGES[0].code)
  const [showLanguageSelect, setShowLanguageSelect] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const document = useFormValue([]) as SanityDocument
  const [showGenButtons, setShowGenButtons] = useState<boolean>(false)

  // Get Sanity client
  const client = useClient({apiVersion: '2023-03-01'})
  client.withConfig({apiVersion: '2023-03-01', useCdn: false, perspective: 'raw'})

  const handleOptionChange = useCallback((newOption: GenerationOption) => {
    setOption(newOption)
    if (newOption === 'Translate') {
      setShowLanguageSelect(true)
    } else {
      setShowLanguageSelect(false)
    }
  }, [])

  const handleModelChange = useCallback((newModel: Model) => {
    setModel(newModel)
    saveModelOption(newModel)
    // Load the new model
    loadModel(newModel)
  }, [])

  const generateTextCallback = useCallback(
    (results: string = '', complete: boolean) => {
      if (complete) {
        setIsGenerating(false)
        setShowGenButtons(false)
      }

      onChange(set(results))
    },
    [onChange],
  )

  const handleButtonClick = useCallback(async (): Promise<void> => {
    setIsGenerating(true)

    const cachedLanguage: LanguageCode = getCachedLanguage()
    const selectedLanguage: LanguageCode = language || cachedLanguage

    if (option === 'Translate' && !selectedLanguage) {
      // Prompt user to select a language
      // Cache the selected language
      setCachedLanguage(selectedLanguage)
    }

    // Extract valuable string data from document
    const extractedContext = extractStringValues(document)

    const options: TextGenerationOptions = {
      field: `${props.id} (${schemaType.title})`,
      value: value as string,
      context: extractedContext,
      generationOption: option,
      language: selectedLanguage,
      callback: generateTextCallback,
    }

    generateText(options)
  }, [language, option, document, props.id, schemaType.title, value, generateTextCallback])

  const handleStopGeneration = useCallback(() => {
    cancelTextGeneration()
    setIsGenerating(false)
  }, [])

  const languageChangeHandler = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as LanguageCode)
  }, [])

  const onMouseEnter = useCallback(() => {
    setShowGenButtons((schemaType.jsonType === 'string' && level !== 0) || isGenerating)
  }, [isGenerating, level, schemaType.jsonType])
  const onMouseLeave = useCallback(() => {
    setShowGenButtons(isGenerating || false)
  }, [isGenerating])

  const LoadingIcon = (
    _props: React.JSX.IntrinsicAttributes &
      Omit<SpinnerProps & Omit<React.HTMLProps<HTMLDivElement>, 'size' | 'as'>, 'ref'> &
      React.RefAttributes<HTMLDivElement>,
  ) => (
    <Spinner
      {..._props}
      style={{
        transform: 'translateY(0.6rem)',
      }}
    />
  )

  return (
    <Stack
      space={1}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'relative',
        zIndex: 1,
      }}
    >
      {renderDefault(props)}

      {showGenButtons && (
        <Flex
          style={{
            position: 'absolute',
            top: '0.3rem',
            right: '0.3rem',
            zIndex: 1,
            alignItems: 'center',
          }}
          justify={'flex-end'}
        >
          <Button
            onClick={handleButtonClick}
            padding={BUTTONS_PADDING}
            // eslint-disable-next-line react/jsx-no-bind
            icon={isGenerating ? LoadingIcon : ComposeSparklesIcon}
            text={isGenerating ? 'Working on it...' : option}
            tone="primary"
            disabled={isGenerating}
            type="button"
            mode="default"
            style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}}
          />

          <div style={{minWidth: isGenerating ? 40 : 60}}>
            {isGenerating ? (
              <Button
                style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0, width: '100%'}}
                onClick={handleStopGeneration}
                icon={StopIcon}
                aria-label="Stop text generation"
                tone="critical"
                mode="default"
                padding={BUTTONS_PADDING}
              />
            ) : (
              <>
                <ActionsMenu
                  selectedOption={option}
                  onOptionChange={handleOptionChange}
                  MenuToggleButtonProps={{
                    style: {
                      borderRadius: 0,
                      borderLeft: '1px solid',
                    },
                  }}
                />
                <SettingsMenu
                  selectedOption={model}
                  onOptionChange={handleModelChange}
                  MenuToggleButtonProps={{
                    style: {
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderLeft: '1px solid',
                    },
                  }}
                />
              </>
            )}
          </div>

          {showLanguageSelect && (
            <div style={{marginLeft: 8, flex: '0 0 50%'}}>
              <Select
                onChange={languageChangeHandler}
                value={language}
                disabled={isGenerating}
                padding={BUTTONS_PADDING}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </Flex>
      )}
    </Stack>
  )
}

export default TextInputWithButton
