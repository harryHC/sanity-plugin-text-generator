import { defineType, defineField } from 'sanity';
import TextInputWithButton from './components/TextInputWithButton';

export default defineType({
  name: 'documentWithTextInput',
  type: 'document',
  title: 'Document with Text Input',
  fields: [
    defineField({
      name: 'textInput',
      type: 'string',
      title: 'Text Input',
      inputComponent: TextInputWithButton,
    }),
  ],
  components: {
    input: (props) => {
      if (props.type === 'string') {
        return <TextInputWithButton {...props} />;
      }
      return props.children;
    },
  },
});
