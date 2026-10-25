import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  // In production (build & preview for https://privatep88.github.io/certificate/), base is '/certificate/'.
  // In local development (AI Studio dev server), base is '/'.
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production';
  return {
    base: process.env.VITE_BASE_PATH || (isProd ? '/certificate/' : '/'),
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'github-pages-spa-bundle',
        closeBundle() {
          try {
            const distDir = path.resolve('.', 'dist');
            const indexHtml = path.join(distDir, 'index.html');
            if (fs.existsSync(indexHtml)) {
              fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));
              fs.writeFileSync(path.join(distDir, '.nojekyll'), '# Disable Jekyll processing on GitHub Pages\n', 'utf-8');
            }
          } catch {
            // ignore
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

