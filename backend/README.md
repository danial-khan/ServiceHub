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
- `PUBLIC_BASE_URL`: Base URL for module URLs in catalog.json (leave empty for relative URLs)
- `VERCEL`: Set to `1` by Vercel automatically (uses `public/modules` instead of `MODULES_DIR`)

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

## Vercel Deployment

### Quick Deploy

```bash
# From repository root:
npm run build:modules      # Build modules in frontend
npm run publish:modules    # Copy to backend/public/modules

# Commit the modules
git add backend/public
git commit -m "Publish modules"
git push

# Deploy to Vercel
cd backend
vercel deploy --prod
```

### Vercel Configuration

Set **Root Directory** to `backend` in your Vercel project settings.

The backend is configured for serverless deployment:
- `api/index.ts` exports the Express app (doesn't call `listen()`)
- `vercel.json` routes requests to the serverless function
- Modules are served from committed `public/modules` directory
- No build step required on Vercel (modules are pre-built and committed)

### Local Testing with Vercel

```bash
cd backend
npm run build
vercel dev

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/catalog.json
curl http://localhost:3000/modules/doctor/doctor.container.bundle | sha256sum
```

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
- `GET /modules/doctor/*` — Doctor module bundles
- `GET /modules/barber/*` — Barber module bundles
- `GET /modules/food/*` — Food module bundles

## Publishing Modules

After building modules in the frontend workspace (`npm run build:modules`), run the publish scripts from the root to copy bundles into `backend/public/modules/` and update `catalog.json` with SHA-256 checksums:

```bash
# From repository root
npm run publish:modules
```

For Vercel deployment, commit the published modules:

```bash
git add backend/public/modules backend/public/catalog.json
git commit -m "Publish modules"
```

## Module URLs

The publish script uses `PUBLIC_BASE_URL` environment variable:

```bash
# Relative URLs (default, works on any domain)
npm run publish:modules

# Absolute URLs (if needed)
PUBLIC_BASE_URL=https://servicehub-backend.vercel.app npm run publish:modules
```

For Vercel, relative URLs are recommended.
