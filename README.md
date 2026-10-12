# ServiceHub

React Native portfolio demo showing **on-demand module delivery** with Re.Pack 5 Module Federation. The app downloads business vertical modules (Doctor, Barber, Food) dynamically at runtime.

> **Note:** Auth and sample data are mocked. This is a portfolio/architecture demonstration, not a production app.

## Architecture

```mermaid
graph TD
    A[Shell App] -->|fetches| B[catalog.json]
    A -->|uses| C[@servicehub/core]
    B -->|lists| D[Doctor Module]
    B -->|lists| E[Barber Module]
    B -->|lists| F[Food Module]
    A -->|SHA-256 check| D
    A -->|registerRemotes + loadRemote| D
    D -->|returns .default export| A
    G[Module Host :9000] -->|serves| B
    G -->|serves| D
    G -->|serves| E
    G -->|serves| F
```

### Components

- **Shell** (`src/`): Minimal core with auth, navigation, and module loader
- **@servicehub/core** (`packages/core/`): Shared design system (Button, Card, Text, theme)
- **Remote Modules** (`modules/doctor`, `modules/barber`, `modules/food`): Independently built webpack bundles served via HTTP
- **Catalog** (`module-host/public/catalog.json`): Module registry with URLs, sizes, and SHA-256 checksums
- **Module Host** (`module-host/`): Express server on port 9000 serving catalog + bundles

## On-Demand Loading Flow

1. Shell fetches `catalog.json` from `http://10.0.2.2:9000` (Android) / `http://localhost:9000` (iOS)
2. User selects a module to install
3. `moduleLoader.verifyChecksum()` downloads container bundle and validates SHA-256 hash
4. `registerRemotes([{ name: 'doctor', entry: containerURL }])` registers the remote with Module Federation runtime
5. `loadRemote('doctor/Module')` loads the remote and returns its module namespace
6. Extract `.default` export (the React component) and render: `<ModuleComponent onBack={...} />`

## Code Signing

Re.Pack's `CodeSigningPlugin` signs all production bundles with RSA-2048:

```bash
# Generate keys
node scripts/generate-signing-keys.js

# Creates:
#   .keys/private.pem (gitignored)
#   .keys/public.pem (reference)
#   android/app/src/main/res/values/strings.xml (with RepackPublicKey)
#   ios/ServiceHub/Info.plist (with RepackPublicKey)
```

The **public key is committed** to the repo in native configs. Only the private key is gitignored.

**ScriptManager resolver** validates signatures at runtime:
- **Production:** `verifyScriptSignature: 'strict'` (requires valid `.sign` files)
- **Development:** `verifyScriptSignature: 'off'` (dev builds work without signing)

## Adding a New Module

1. Create `modules/newmodule/src/index.tsx`:
   ```tsx
   export default function NewModule({ onBack }: { onBack: () => void }) {
     return <View><Text>New Module</Text></View>;
   }
   ```

2. Create `webpack.newmodule.config.mjs` (copy `webpack.doctor.config.mjs`, change `name: 'NewModule'`, entry path, and output path)

3. Add to `scripts/build-all.js`:
   ```js
   const MODULES = ['doctor', 'barber', 'food', 'newmodule'];
   ```

4. Build & publish:
   ```bash
   npm run build:all-modules
   npm run publish:all
   ```

The new module appears in the catalog and can be installed dynamically.

## Build & Run

```bash
# Install dependencies
npm install

# Generate code signing keys
node scripts/generate-signing-keys.js

# Build all remote modules (production mode)
npm run build:all-modules
# Output: doctor (2.4 MB), barber (2.4 MB), food (2.5 MB)

# Publish modules to host (updates catalog.json with SHA-256 hashes)
npm run publish:all

# In separate terminal: start module host
cd module-host && npm start
# Serves http://localhost:9000

# Build shell for Android
npm run build:shell

# Run on device/emulator
npx react-native run-android   # or run-ios
```

## Apple App Store Policy

**Guideline 2.5.2** prohibits downloading executable code, **except** JavaScript downloaded and run by Apple's built-in WebKit or JavaScriptCore.

React Native uses JavaScriptCore on iOS, so **dynamically downloaded JS bundles are permitted** under the JS exception. Module Federation delivers JavaScript bundles, not native binaries.

**Guideline 3.3.1 / 4.7** requires apps with dynamic content to implement content filtering and comply with local laws. This demo has no user-generated content or content filtering—it's a fixed set of pre-approved business verticals for portfolio demonstration.

**Recommendation:** For production App Store submission, consult Apple's guidelines and consider an attorney review of your specific use case.

## Verified (Real Outputs)

### Tests
```bash
$ npm test
Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

### TypeScript
```bash
$ npm run typecheck
> tsc --noEmit
# Exit code: 0 (no errors)
```

### Build
```bash
$ npm run build:all-modules
Build Summary: 3 succeeded, 0 failed
```

### Publish & SHA-256
```bash
$ npm run publish:all
✅ doctor module published successfully
   SHA-256: 765ebac94dd10c79c9295b5d373d293deff80adbfef84c8e889d858d50e51694
   Size: 45863 bytes
✅ barber module published successfully  
   SHA-256: 1fdfaa2b0cf79a5136350efb9de80e4615705fd901145722893ffb5270cc14a1
   Size: 45863 bytes
✅ food module published successfully
   SHA-256: a9b2bd93f713fbe51cedd0edb6f75dece97c0e925a1b77b434591b5ea866a1c8
   Size: 45843 bytes
```

### SHA-256 Verification (curl + sha256sum)
```bash
$ curl http://localhost:9000/modules/doctor/doctor.container.bundle | sha256sum
765ebac94dd10c79c9295b5d373d293deff80adbfef84c8e889d858d50e51694
Match: true
```

### Shell Bundle Grep Check
```bash
$ ls -lh build/shell/android/shell.bundle
1.9M

$ grep -c "Dr. Sarah" build/shell/android/shell.bundle
0
$ grep -c "Mike Johnson" build/shell/android/shell.bundle  
0
$ grep -c "Zinger Burger" build/shell/android/shell.bundle
0
```

Shell contains no remote module strings (verified).

## Not Verified

- **Not tested on physical device** (requires Android Studio / Xcode + device)
- **Code signing signatures** not generated (`.sign` files would appear in production device builds)
- **Not tested on iOS** (macOS with Xcode required)
- **Not submitted to App Store** (App Store review not performed)

## Deploying Backend to Vercel

The backend is configured for zero-config deployment to Vercel as a serverless function.

### Prerequisites

1. Install Vercel CLI: `npm install -g vercel`
2. Build and publish modules to `backend/public/modules` (they will be committed and deployed)

### Deployment Steps

```bash
# 1. Build modules (frontend)
npm run build:modules

# 2. Publish modules to backend/public (this commits them)
npm run publish:modules

# 3. Commit the published modules
git add backend/public/modules backend/public/catalog.json
git commit -m "Publish modules for Vercel deployment"
git push

# 4. Deploy to Vercel (from backend directory)
cd backend
vercel deploy --prod
```

### Configuration

**Root Directory**: Set to `backend` in Vercel project settings

**Environment Variables** (optional):
- `PUBLIC_BASE_URL`: Your Vercel URL (e.g., `https://servicehub-backend.vercel.app`)

### Update Frontend

After deploying, update the production URL in the frontend:

```typescript
// frontend/src/modules/moduleLoader.ts
const PRODUCTION_MODULE_HOST_URL = 'https://your-app.vercel.app';
```

### Local Verification

Test the serverless function locally:

```bash
cd backend

# Build the backend
npm run build

# Test with Vercel CLI (emulates serverless environment)
vercel dev

# Or test endpoints directly
curl http://localhost:3000/health
curl http://localhost:3000/catalog.json
curl http://localhost:3000/modules/doctor/doctor.container.bundle | sha256sum
```

### How It Works

1. **Serverless Function**: `api/index.ts` exports the Express app without calling `listen()`
2. **Static Assets**: Modules and catalog are served from `backend/public` (committed to git)
3. **Routing**: `vercel.json` rewrites `/health`, `/catalog.json`, and `/modules/*` to the serverless function
4. **Module URLs**: Catalog uses relative URLs (`/modules/doctor/...`) that work on any domain
5. **No Build Step**: Vercel serves pre-built modules from git; no React Native build needed

### Architecture

```
Vercel Function (api/index.ts)
├── GET /health → { status: 'ok' }
├── GET /catalog.json → backend/public/catalog.json
└── GET /modules/:module/* → backend/public/modules/:module/*
```

## Tech Stack

- React Native 0.87.1
- React 19.2.3
- Re.Pack 5 (Module Federation for React Native)
- Webpack 5
- TypeScript 5
- Zustand (state management, persisted via AsyncStorage)
- Jest 29 (unit tests)
- Express 4 (backend)
- Vercel (serverless deployment)

## License

MIT © 2026 Danial Khan
