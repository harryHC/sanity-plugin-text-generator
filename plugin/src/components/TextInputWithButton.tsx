import {Box, Button, Select, Stack} from '@sanity/ui'
import React, {ChangeEvent, useCallback, useState} from 'react'
import {ObjectInputProps, set, StringInputProps, useFormValue} from 'sanity'

import {generateText} from '../model'
import {getCachedLanguage, setCachedLanguage} from './../cache'

export type GenerationOption = 'Translate' | 'Summarise' | 'Generate'
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | ''
export type DocumentContext = Record<string, unknown>

const TextInputWithButton = (props: ObjectInputProps | StringInputProps): React.ReactElement => {
  const {onChange, value, renderDefault, level, schemaType} = props
  const [option, setOption] = useState<GenerationOption>('Generate')
  const [language, setLanguage] = useState<LanguageCode>('')
  const [showLanguageSelect, setShowLanguageSelect] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const document = useFormValue([]) as DocumentContext
  const [showGenButtons, setShowGenButtons] = useState<boolean>(false)

  const handleOptionChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target.value as GenerationOption
    setOption(selectedOption)
    if (selectedOption === 'Translate') {
      setShowLanguageSelect(true)
    } else {
      setShowLanguageSelect(false)
    }
  }, [])

  const handleButtonClick = useCallback(async (): Promise<void> => {
    setIsGenerating(true)

    const cachedLanguage: LanguageCode = getCachedLanguage()
    const selectedLanguage: LanguageCode = language || cachedLanguage

    if (option === 'Translate' && !selectedLanguage) {
      // Prompt user to select a language
      // Cache the selected language
      setCachedLanguage(selectedLanguage)
    }

    const callback = (partialResults: string, complete: boolean) => {
      let newText: string = value + partialResults
      if (complete) {
        newText += '\n'
        setIsGenerating(false)
      }
      onChange(set(newText))
    }

    generateText(document, option, selectedLanguage, callback)
  }, [language, option, document, value, onChange])

  const languageChangeHandler = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as LanguageCode)
  }, [])

  const onMouseEnter = useCallback(() => {
    setShowGenButtons(schemaType.jsonType === 'string' && level !== 0)
  }, [level, schemaType.jsonType])
  const onMouseLeave = useCallback(() => {
    setShowGenButtons(false)
  }, [])

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
        <Box style={{position: 'absolute', top: 0, right: 0, zIndex: 1}}>
          <Stack space={3}>
            <Select onChange={handleOptionChange} value={option}>
              <option value="Generate">Generate</option>
              <option value="Summarise">Summarise</option>
              <option value="Translate">Translate</option>
            </Select>

            {showLanguageSelect && (
              <Select onChange={languageChangeHandler} value={language}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
              </Select>
            )}

            <Button
              onClick={handleButtonClick}
              text={isGenerating ? 'Generating...' : 'Generate Text'}
              tone="positive"
              disabled={isGenerating}
            />
          </Stack>
        </Box>
      )}
    </Stack>
  )
}

export default TextInputWithButton
