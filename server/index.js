/**
 * Minimal API: reads/writes project file data/recipes.json (seed from public/recipes.json if missing).
 */
import 'dotenv/config';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'recipes.json');
const SEED_PATH = path.join(ROOT, 'public', 'recipes.json');

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

app.get('/api/recipes', async (_req, res) => {
  try {
    const data = await readPayload();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'read failed' });
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
