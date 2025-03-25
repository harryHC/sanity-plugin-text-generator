import React from 'react';
import { useFormValue } from 'sanity';
import { GemmaLLM, LlmInference } from '@mediapipe/tasks-genai';
import TextInputWithButton from './components/TextInputWithButton';
import { setCachedLanguage, getCachedLanguage, loadModelFromUrl } from './cache';
import { MODEL_URLS, TEXT_GENERATION_DEFAULTS } from './constants';
import textGeneratorPlugin from './schema';

// Initialize MediaPipe LLM
let gemmaModel = null;
let loadingModel = false;

const initializeModel = async () => {
  if (!gemmaModel && !loadingModel) {
    try {
      loadingModel = true;
      // Initialize the MediaPipe LLM inference package
      const llmInference = await LlmInference.createInstance();

      // Check if the model is cached and load from URL if needed
      const modelUrl = MODEL_URLS.GEMMA_3_1B.MODEL;
      const modelData = await loadModelFromUrl(modelUrl, (progress) => {
        console.log(`Loading model: ${Math.round(progress * 100)}%`);
      });

      // Configure and load the Gemma model
      gemmaModel = await GemmaLLM.createInstance({
        llmInference: llmInference,
        model: modelData,
      });

      loadingModel = false;
    } catch (error) {
      loadingModel = false;
      console.error("Error initializing model:", error);
      throw error;
    }
  }
  return gemmaModel;
};

const generateText = async (context, option, language) => {
  try {
    const model = await initializeModel();
    let prompt = '';

    switch (option) {
      case 'Translate':
        prompt = `Translate the following content to ${language}:\n${JSON.stringify(context)}`;
        break;
      case 'Summarise':
        prompt = `Summarize the following content:\n${JSON.stringify(context)}`;
        break;
      case 'Generate':
        prompt = `Generate content based on this context:\n${JSON.stringify(context)}`;
        break;
      default:
        throw new Error('Invalid option');
    }

    // Generate text using MediaPipe
    const result = await model.generate({
      text: prompt,
      maxTokens: TEXT_GENERATION_DEFAULTS.MAX_TOKENS,
      temperature: TEXT_GENERATION_DEFAULTS.TEMPERATURE
    });

    return result.text;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
};

export const TextInputWithButtonContainer = (props) => {
  const { onChange, value } = props;
  // Use useFormValue to get the current document
  const document = useFormValue([]);

  const handleButtonClick = async (option, language) => {
    const cachedLanguage = getCachedLanguage();
    const selectedLanguage = language || cachedLanguage;
    if (option === 'Translate' && !selectedLanguage) {
      // Prompt user to select a language
      // Cache the selected language
      setCachedLanguage(selectedLanguage);
    }
    const generatedText = await generateText(document, option, selectedLanguage);

    // Update the text input with the generated text
    if (onChange && generatedText) {
      onChange(generatedText);
    }
  };

  return React.createElement(TextInputWithButton, {
    onButtonClick: handleButtonClick,
    value: value
  });
};

// Export the plugin as default export
export default textGeneratorPlugin;

// Also export the container component and utilities
export {
  generateText,
  initializeModel,
  MODEL_URLS,
  TEXT_GENERATION_DEFAULTS
};
