import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Electron charge index.html via file://, donc on veut des chemins relatifs
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});
