import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // optimizeDeps: {
  //   exclude: ['lucide-react'],
  // },
  // Proxy /api requests to backend during development. Set VITE_BACKEND_URL in .env if your backend runs on a different port.
  server: {
      host: true,
    proxy: {
      '/api': {
        // default to the backend on 5001 (your server port). You can override
        // with VITE_BACKEND_URL in frontend/.env or your shell environment.
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
