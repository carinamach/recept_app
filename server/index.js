/**
 * Minimal API: reads/writes project file data/recipes.json (seed from public/recipes.json if missing).
 */
import 'dotenv/config';
import express from 'express';
import fs from 'fs/promises';

import { openAISuggestRecipes } from './suggestOpenAI.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'recipes.json');
const SEED_PATH = path.join(ROOT, 'public', 'recipes.json');
const DIST_PATH = path.join(ROOT, 'dist');
const isProduction = process.env.NODE_ENV === 'production';

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    const seed = await fs.readFile(SEED_PATH, 'utf8');
    await fs.writeFile(DATA_PATH, seed, 'utf8');
  }
}

async function readPayload() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writePayload(obj) {
  const tmp = `${DATA_PATH}.${process.pid}.tmp`;
  const body = JSON.stringify(obj, null, 2);
  await fs.writeFile(tmp, body, 'utf8');
  await fs.rename(tmp, DATA_PATH);
}

const app = express();
app.use(express.json({ limit: '8mb' }));

if (isProduction) {
  app.use(express.static(DIST_PATH));
}

app.get('/api/recipes', async (_req, res) => {
  try {
    const data = await readPayload();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'read failed' });
  }
});

/**
 * POST /api/suggest — recipe ideas via OpenAI (OPENAI_API_KEY in .env).
 * Body: { mood?, ingredients?, recipeTitles?: string[] }
 */
app.post('/api/suggest', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      res.status(503).json({
        error: 'no_api_key',
        message: 'Lägg OPENAI_API_KEY i .env och starta om servern (npm run dev).',
      });
      return;
    }

    const body = req.body || {};
    const recipeTitles = Array.isArray(body.recipeTitles) ? body.recipeTitles : [];

    const suggestions = await openAISuggestRecipes({
      mood: typeof body.mood === 'string' ? body.mood : '',
      ingredients: typeof body.ingredients === 'string' ? body.ingredients : '',
      recipeTitles,
    });

    res.json({ suggestions });
  } catch (e) {
    /** @type {any} */
    const err = e;
    if (err.code === 'NO_KEY') {
      res.status(503).json({ error: 'no_api_key', message: err.message });
      return;
    }
    console.error('[api/suggest]', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'suggest failed' });
  }
});

app.put('/api/recipes', async (req, res) => {
  try {
    const body = req.body;
    const recipes = Array.isArray(body) ? body : body?.recipes;
    if (!Array.isArray(recipes)) {
      res.status(400).json({ error: 'Body must be { recipes: [...] } or a bare array' });
      return;
    }
    const payload = {
      version: typeof body?.version === 'number' ? body.version : 1,
      recipes,
    };
    await writePayload(payload);
    res.json(payload);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'write failed' });
  }
});

const PORT = Number(process.env.RECIPES_API_PORT || process.env.PORT) || 3021;

if (isProduction) {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`[recept-api] http://localhost:${PORT}  →  ${path.relative(ROOT, DATA_PATH)}`);
});

server.on('error', (err) => {
  if (/** @type {NodeJS.ErrnoException} */ (err).code === 'EADDRINUSE') {
    console.error(
      `\n[recept-api] Port ${PORT} is already in use.\n` +
        `  • Create/edit .env and set RECIPES_API_PORT to a free port (e.g. 3025).\n` +
        `  • Or find the process:  netstat -ano | findstr :${PORT}\n` +
        `    Then:                  taskkill /PID <pid> /F\n`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
