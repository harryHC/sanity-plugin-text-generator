import { definePlugin } from 'sanity';
import { TextInputWithButtonContainer } from './index';

export default definePlugin({
  name: 'sanity-plugin-text-generator',

  schema: {
    types: [
      {
        name: 'string',
        components: {
          input: TextInputWithButtonContainer
        }
      }
    ]
  }
});
