import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  content:[
    "./index.htm",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  plugins: [
    react({
      // Fix the preamble detection issue
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  define: {
    // Ensure process.env is defined
    'process.env': {}
  },
  server: {
    headers: {
      // Simplified CSP that should work with Vite
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data:;
        connect-src 'self' http://127.0.0.1:5000;
        frame-src 'self';
        object-src 'none';
      `.trim().replace(/\n/g, ' ')
        
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});