import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';

/**
 * Optional catalog API (the take-home's bonus).
 *
 * It serves the very same data/catalog.json the app bundles, so the two can
 * never drift. The front end only talks to it when VITE_API_URL is set and
 * falls back to the bundled copy on any failure — running this is never a
 * requirement for a clean clone.
 */

const here = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(here, '..', 'data', 'catalog.json');
const PORT = Number(process.env.PORT ?? 8787);
const LATENCY_MS = Number(process.env.API_LATENCY_MS ?? 250);

const app = express();
app.use(cors());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'bundle-builder-catalog' });
});

app.get('/api/catalog', async (_req, res) => {
  try {
    // Read per request so editing the JSON doesn't need a server restart.
    const raw = await readFile(CATALOG_PATH, 'utf8');
    // A small deliberate delay so the app's loading state is exercised.
    if (LATENCY_MS > 0) await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    res.type('application/json').send(raw);
  } catch (error) {
    console.error('[api] failed to read catalog:', error);
    res.status(500).json({ error: 'Could not read catalog.json' });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`[api] catalog available at http://localhost:${PORT}/api/catalog`);
});
