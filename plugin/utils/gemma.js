const Gemma3 = require('gemma3');
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

module.exports = {
  generateText,
};
