import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build works both hosted and file-packaged (Fire OS WebView).
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 1200,
  },
});
