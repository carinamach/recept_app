# Recept App

Det här projektet är en React + Vite-app med en enkel Node/Express-backend för API och receptlagring.

## Klar för deployment

### Viktigt
- `npm start` kör nu din Node-server från `server/index.js`.
- `npm run build` bygger frontend till `dist/`.
- I produktion (`NODE_ENV=production`) servas frontendstatiken från `dist/` och alla icke-API-rutter går till `index.html`.

## Lokalt

1. Installera beroenden:
   ```bash
   npm install
   ```
2. Kör dev-servern med proxy mot backend:
   ```bash
   npm run dev
   ```
3. Besök appen i webbläsaren:
   - `http://localhost:3000`

## Deployment på Node-host

För att få sync mellan dator och mobil behöver du köra hela appen på en Node-host som bygger frontend och startar backend.

### Rekommenderade gratis hosts
- Railway
- Render
- Fly.io

### Deploy-steg
1. Bygg appen: `npm run build`
2. Starta servern: `npm start`

På de flesta hosts räcker det med dessa inställningar:
- Build command: `npm run build`
- Start command: `npm start`
- Port: vanligtvis `PORT`

## Notera

Den här appen använder filbaserad lagring i `data/recipes.json`. Det betyder att data sparas på servern, men kan försvinna om containern startas om eller om hosten använder tillfälligt filsystem.

För bättre persistens behövs en databas (t.ex. Supabase, Firebase eller MongoDB Atlas).
