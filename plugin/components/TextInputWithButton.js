import React, { useState } from 'react';
import { Button, TextInput, Select } from '@sanity/ui';

const TextInputWithButton = ({ onButtonClick }) => {
  const [option, setOption] = useState('Generate');
  const [language, setLanguage] = useState('');
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  const handleOptionChange = (e) => {
    const selectedOption = e.target.value;
    setOption(selectedOption);
    if (selectedOption === 'Translate') {
      setShowLanguageSelect(true);
    } else {
      setShowLanguageSelect(false);
    }
  };

  const handleButtonClick = () => {
    onButtonClick(option, language);
  };

  return (
    <div>
      <TextInput />
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
          {/* Add more language options as needed */}
        </Select>
      )}
      <Button onClick={handleButtonClick}>Generate Text</Button>
    </div>
  );
};

export default TextInputWithButton;
