import {ChevronDownIcon, ComposeSparklesIcon} from '@sanity/icons'
import {Button, Flex, Menu, MenuButton, MenuItem, Select, Spinner, Stack} from '@sanity/ui'
import React, {ChangeEvent, useCallback, useState} from 'react'
import {
  ObjectInputProps,
  SanityDocument,
  set,
  StringInputProps,
  useClient,
  useFormValue,
} from 'sanity'

import {LanguageCode, SUPPORTED_LANGUAGES} from '../constants'
import {generateText, TextGenerationOptions} from '../model'
import {getCachedLanguage, setCachedLanguage} from './../cache'

export type GenerationOption = 'Generate' | 'Summarise' | 'Translate'
export type DocumentContext = Record<string, unknown>

const GENERATION_OPTIONS: GenerationOption[] = ['Generate', 'Summarise', 'Translate']

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
  const [language, setLanguage] = useState<LanguageCode>('')
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

  const languageChangeHandler = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as LanguageCode)
  }, [])

  const onMouseEnter = useCallback(() => {
    setShowGenButtons((schemaType.jsonType === 'string' && level !== 0) || isGenerating)
  }, [isGenerating, level, schemaType.jsonType])
  const onMouseLeave = useCallback(() => {
    setShowGenButtons(isGenerating || false)
  }, [isGenerating])

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
          style={{position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 1}}
          wrap={'wrap'}
          justify={'flex-end'}
        >
          <Button
            onClick={handleButtonClick}
            icon={isGenerating ? Spinner : ComposeSparklesIcon}
            text={isGenerating ? 'Working on it...' : option}
            tone="primary"
            disabled={isGenerating}
            type="button"
            mode="default"
            style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}}
            fontSize={1}
            paddingY={1}
          />

          <Stack space={2}>
            <MenuButton
              button={
                <Button
                  style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                  mode="default"
                  disabled={isGenerating}
                  tone="primary"
                  icon={ChevronDownIcon}
                />
              }
              id="text-generation-options"
              menu={
                <Menu>
                  {GENERATION_OPTIONS.map((genOption) => (
                    <MenuItem
                      key={genOption}
                      text={genOption}
                      // eslint-disable-next-line react/jsx-no-bind
                      onClick={() => handleOptionChange(genOption)}
                      tone={option === genOption ? 'primary' : 'default'}
                    />
                  ))}
                </Menu>
              }
              popover={{portal: true, placement: 'bottom-end'}}
            />
          </Stack>

          {showLanguageSelect && (
            <div style={{marginTop: '0.5rem', flex: '0 0 50%'}}>
              <Select onChange={languageChangeHandler} value={language} disabled={isGenerating}>
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
