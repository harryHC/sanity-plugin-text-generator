import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',

  // Remove this block to enable strict export validation
  extract: {
    rules: {
      'ae-incompatible-release-tags': 'off',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
  },

  // Add static assets configuration for the worker file
  assets: {
    sources: [
      {
        from: 'src/textGeneratorWorker.js',
        to: 'dist/textGeneratorWorker.js',
      },
    ],
  },
})
