import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-manifest',
      closeBundle() {
        const outDir = resolve(__dirname, 'dist');
        if (!existsSync(outDir)) {
          mkdirSync(outDir, { recursive: true });
        }
        copyFileSync(
          resolve(__dirname, 'extension/manifest.json'),
          resolve(outDir, 'manifest.json')
        );
      },
    },
  ],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
      '@ai': resolve(__dirname, 'ai'),
      '@storage': resolve(__dirname, 'storage'),
      '@frontend': resolve(__dirname, 'frontend'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'extension/sidepanel.html'),
        'service-worker': resolve(__dirname, 'extension/service-worker.ts'),
        'content-script': resolve(__dirname, 'extension/content-script.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js';
          }
          if (chunkInfo.name === 'content-script') {
            return 'content-script.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
