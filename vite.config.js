import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Serve index.html for legacy .php chart URLs so the SPA ChartPage handles
//   /jodi-chart-record/:slug.php  and  /panel-chart-record/:slug.php
// without a backend rewrite (dev + preview). Real PHP hosting will need
// an .htaccess / nginx rewrite to index.html for the same paths.
function chartFallback() {
  return {
    name: 'chart-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (
          url.startsWith('/jodi-chart-record/') ||
          url.startsWith('/panel-chart-record/') ||
          url.startsWith('/chart/')
        ) {
          // Rewrite internally to / so Vite serves the transformed
          // index.html (with the react-refresh preamble). The browser URL
          // stays on the chart path, so ChartPage routing still works.
          // Serving index.html raw via fs.readFileSync bypasses Vite's
          // transform pipeline -> "@vitejs/plugin-react can't detect
          // preamble" error.
          req.url = '/';
          next();
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (
          url.startsWith('/jodi-chart-record/') ||
          url.startsWith('/panel-chart-record/') ||
          url.startsWith('/chart/')
        ) {
          const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8');
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), chartFallback()],
  server: {
    port: 5173,
    // Proxy to the API server. In production set API_TARGET to your host.
    // This also solves CORS: the browser only ever calls same-origin /api.
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
