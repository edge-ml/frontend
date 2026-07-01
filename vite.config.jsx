import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/ds': {
        target: 'https://beta.edge-ml.org',
        changeOrigin: true,
        secure: false,
        bypass: (req, res, options) => {
          console.log('[PROXY BYPASS CHECK]', req.method, req.url);
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('[PROXY REQ]', req.method, req.url, '-> beta.edge-ml.org');
          });
          proxy.on('proxyRes', (proxyReq, req, res) => {
            console.log('[PROXY RES]', req.url, 'status:', res.statusCode);
          });
        },
      },
      '/api': {
        target: 'https://beta.edge-ml.org',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'https://beta.edge-ml.org',
        changeOrigin: true,
        secure: false,
      },
      '/ml': {
        target: 'https://beta.edge-ml.org',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
