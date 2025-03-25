import React, { useState } from 'react';
import { Button, TextInput, Select, Stack, Box } from '@sanity/ui';

const TextInputWithButton = ({ onButtonClick, value }) => {
  const [option, setOption] = useState('Generate');
  const [language, setLanguage] = useState('');
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOptionChange = (e) => {
    const selectedOption = e.target.value;
    setOption(selectedOption);
    if (selectedOption === 'Translate') {
      setShowLanguageSelect(true);
    } else {
      setShowLanguageSelect(false);
    }
  };

  const handleButtonClick = async () => {
    setIsGenerating(true);
    try {
      await onButtonClick(option, language);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Stack space={3}>
      <TextInput
        value={value || ''}
        readOnly
        rows={5}
        placeholder="Generated text will appear here"
      />

      <Box>
        <Stack space={3} direction="row">
          <Select onChange={handleOptionChange} value={option}>
            <option value="Generate">Generate</option>
            <option value="Summarise">Summarise</option>
            <option value="Translate">Translate</option>
          </Select>

          {showLanguageSelect && (
            <Select onChange={(e) => setLanguage(e.target.value)} value={language}>
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
            text={isGenerating ? "Generating..." : "Generate Text"}
            tone="positive"
            disabled={isGenerating}
          />
        </Stack>
      </Box>
    </Stack>
  );
};

export default TextInputWithButton;
