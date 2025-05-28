import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true, // Allows global access to test utilities like describe, it, expect
      environment: 'node', // Or 'jsdom' if testing components that interact with the DOM
      // reporters: ['default', 'html'], // Optional: for nice HTML reports
      // setupFiles: './path/to/test-setup.ts', // Optional: for global test setup
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      // To ensure Vitest can resolve paths similarly to your application, especially if using aliases:
      alias: {
        '@/': new URL('./client/src/', import.meta.url).pathname,
        '@shared/': new URL('./shared/', import.meta.url).pathname,
      },
    },
  })
); 