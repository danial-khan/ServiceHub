# ServiceHub Backend

Static HTTP server that hosts the module catalog and serves React Native module bundles.

## What This Is

A simple Express server that:
- Serves `catalog.json` (module registry with URLs, checksums, and sizes)
- Hosts compiled module bundles (`doctor`, `barber`, `food`) via static file serving
- Provides a `/health` endpoint for monitoring

**This is NOT a production backend.** There is no database, no authentication, and no real business logic. All user data and auth state are mocked in the React Native app.

## Configuration

Environment variables:

- `PORT`: Server port (default: `9000`)
- `MODULES_DIR`: Path to the frontend's `build/modules` directory (default: `../frontend/build/modules`)

Copy `.env.example` to `.env` and customize if needed.

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start
```

The server runs on `http://localhost:9000` by default.

## Docker

```bash
# Build image
docker build -t servicehub-backend .

# Run container (mount modules directory)
docker run -p 9000:9000 \
  -v $(pwd)/../frontend/build/modules:/app/modules \
  servicehub-backend
```

## API

- `GET /health` — Health check (`{ "status": "ok", "timestamp": 1234567890 }`)
- `GET /catalog.json` — Module catalog with checksums
- `GET /doctor/*` — Doctor module bundles
- `GET /barber/*` — Barber module bundles
- `GET /food/*` — Food module bundles

## Publishing Modules

After building modules in the frontend workspace (`npm run build:modules`), run the publish scripts from the root to copy bundles into `backend/public/modules/` and update `catalog.json` with SHA-256 checksums:

```bash
# From root
npm run publish:modules
```
