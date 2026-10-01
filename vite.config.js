import { defineConfig } from 'vite';

// Relative base so the built site works from any folder, including GitHub Pages.
export default defineConfig({
  base: './',
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
  },
});
