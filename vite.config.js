import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: o mesmo build funciona na raiz ou numa subpasta (GitHub Pages)
  base: './',
});
