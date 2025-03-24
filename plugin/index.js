import { withDocument } from 'part:@sanity/form-builder';
import Gemma3 from 'gemma3';
import TextInputWithButton from './components/TextInputWithButton';
import { cacheLanguage, getCachedLanguage } from './cache';

const gemma = new Gemma3();

const generateText = async (context, option, language) => {
  try {
    let result;
    switch (option) {
      case 'Translate':
        result = await gemma.translate(context, language);
        break;
      case 'Summarise':
        result = await gemma.summarise(context);
        break;
      case 'Generate':
        result = await gemma.generate(context);
        break;
      default:
        throw new Error('Invalid option');
    }
    return result;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
};

const TextInputWithButtonContainer = withDocument((props) => {
  const { document } = props;
  const context = document;

  const handleButtonClick = async (option, language) => {
    const cachedLanguage = getCachedLanguage();
    const selectedLanguage = language || cachedLanguage;
    if (option === 'Translate' && !selectedLanguage) {
      // Prompt user to select a language
      // Cache the selected language
      cacheLanguage(selectedLanguage);
    }
    const generatedText = await generateText(context, option, selectedLanguage);
    // Update the text input with the generated text
  };

  return <TextInputWithButton onButtonClick={handleButtonClick} />;
});

export default TextInputWithButtonContainer;
