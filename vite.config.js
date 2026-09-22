import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { parseCambridgeHtml } from './src/services/cambridgeParser.js'

function createCambridgeMiddleware() {
  return async (req, res, next) => {
    if (!req.url.startsWith('/api/cambridge')) {
      return next();
    }

    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const word = urlObj.searchParams.get('word');

      if (!word) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Word parameter is required' }));
        return;
      }

      const slug = word.toLowerCase().trim().replace(/\s+/g, '-');
      const targetUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(slug)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        res.statusCode = response.status === 404 ? 404 : 200; // avoid hard error, return JSON
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ notFound: true, status: response.status }));
        return;
      }

      const html = await response.text();
      const parsed = parseCambridgeHtml(html, word);

      if (!parsed) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ notFound: true }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(parsed));
    } catch (err) {
      console.warn('Cambridge API proxy error:', err.message);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ notFound: true, error: err.message }));
    }
  };
}

function cambridgePlugin() {
  const handler = createCambridgeMiddleware();
  return {
    name: 'cambridge-dictionary-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cambridgePlugin()],
})
