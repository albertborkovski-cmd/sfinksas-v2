import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./demo', import.meta.url)),
  base: '/sfinksas-v2/',
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  define: { __SFINKSAS_DEMO__: 'true' },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  build: {
    outDir: fileURLToPath(new URL('./dist-demo', import.meta.url)),
    emptyOutDir: true,
  },
});
