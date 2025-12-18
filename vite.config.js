import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/test_kdp.js',
      name: 'GabaritKDP',
      fileName: 'main',
      formats: ['iife'],
    },
  },
});
