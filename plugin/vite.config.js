import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxInject: `import React from 'react'`,
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  build: {
    lib: {
      entry: 'index.js',
      formats: ['es'],
      fileName: 'index'
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['react', 'sanity']
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  // If you're building a library
  lib: {
    entry: './index.js',
    formats: ['es', 'cjs'],
    fileName: (format) => `index.${format}.js`,
  },
  // Add external dependencies that shouldn't be bundled
  rollupOptions: {
    external: ['react', 'react-dom', 'sanity'],
    output: {
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        sanity: 'Sanity',
      },
    },
  },
});
