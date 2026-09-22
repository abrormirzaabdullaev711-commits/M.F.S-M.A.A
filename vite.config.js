import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { parseCambridgeHtml } from './src/services/cambridgeParser.js'

function cambridgePlugin() {
  return {
    name: 'cambridge-dictionary-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
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

          const targetUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.toLowerCase().trim())}`;
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ notFound: true, status: response.status }));
            return;
          }

          const html = await response.text();
          const parsed = parseCambridgeHtml(html, word);

          if (!parsed) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ notFound: true }));
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(parsed));
        } catch (err) {
          console.error('Cambridge API proxy error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cambridgePlugin()],
})
