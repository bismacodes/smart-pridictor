import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import 'dotenv/config';
import { generatePlantingAdvice, getProviderStatus } from './src/predictor';

function apiPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        if (req.url === '/api/status' && req.method === 'GET') {
          try {
            const status = await getProviderStatus();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.url === '/api/sample' && req.method === 'GET') {
          const sample = {
            location: {
              country: 'Nigeria',
              state: 'Kaduna',
              lga: 'Igabi',
              coordinates: { lat: 10.78, lng: 7.44 },
            },
            crop: 'Maize (SAMMAZ 15 Drought-Tolerant Hybrid)',
            intendedDate: 'May 18 - May 30, 2026',
            soilType: 'Sandy Loam',
            irrigation: 'Rainfed Only (Natural Rainfall)',
            weatherObservation: 'First scattered showers (12mm) recorded on May 4. Currently dry for 6 days. Daily highs at 33°C. Farmers report erratic showers.',
            rainfallTrend: 'Transitioning from dry season into unimodal rainy season. Soil moisture currently building in subsoil.',
          };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(sample));
          return;
        }

        if (req.url === '/api/predict' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const input = JSON.parse(body || '{}');
              const advice = await generatePlantingAdvice(input);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(advice));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Prediction failed' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
