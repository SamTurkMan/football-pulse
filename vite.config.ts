import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-router-dom']
  },
  build: {
    commonjsOptions: {
      include: [/react-router-dom/, /node_modules/],
    },
    rollupOptions: {
      external: [],
    }
  }
});
