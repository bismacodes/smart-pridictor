import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePlantingAdvice, getProviderStatus } from './src/predictor.js';
import { PlantingInput } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API health and provider status
app.get('/api/status', async (_req: Request, res: Response) => {
  try {
    const status = await getProviderStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Realistic sample presets
app.get('/api/sample', (_req: Request, res: Response) => {
  const sample: PlantingInput = {
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
    weatherObservation: 'First scattered showers (12mm) recorded on May 4. Currently dry for 6 days. Daily highs at 33°C. Farmers in neighboring village report erratic showers.',
    rainfallTrend: 'Transitioning from dry season into unimodal rainy season. Soil moisture currently building in subsoil.',
  };
  res.json(sample);
});

// Main planting prediction route
app.post('/api/predict', async (req: Request, res: Response) => {
  try {
    const input: PlantingInput = req.body;
    if (!input || !input.location || !input.crop) {
      res.status(400).json({ error: 'Missing required planting parameters (location and crop).' });
      return;
    }

    const advice = await generatePlantingAdvice(input);
    res.json(advice);
  } catch (error: any) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate planting advice' });
  }
});

// Serve frontend in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart Planting Predictor server listening on port ${PORT}`);
  console.log(`Active Provider: ${process.env.PROVIDER || 'api'}`);
});
