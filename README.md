# ServiceHub

React Native portfolio demo showing **on-demand module delivery** with Re.Pack 5 Module Federation. The app downloads business vertical modules (Doctor, Barber, Food) dynamically at runtime.

> **Note:** Auth and sample data are mocked. This is a portfolio/architecture demonstration, not a production app.

## Monorepo Structure

```
servicehub/
├── frontend/           # React Native app
│   ├── src/           # Shell app source
│   ├── modules/       # Remote module sources (doctor, barber, food)
│   ├── packages/core/ # @servicehub/core design system
│   ├── android/       # Android native project
│   ├── ios/           # iOS native project
│   └── scripts/       # Build scripts for modules
├── backend/           # Module host server
│   ├── src/          # TypeScript Express server
│   └── public/       # Static assets & catalog.json
└── scripts/          # Root-level publish scripts
```

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

- **Shell** (`frontend/src/`): Minimal core with auth, navigation, and module loader
- **@servicehub/core** (`frontend/packages/core/`): Shared design system (Button, Card, Text, theme)
- **Remote Modules** (`frontend/modules/`): Independently built webpack bundles served via HTTP
- **Catalog** (`backend/public/catalog.json`): Module registry with URLs, sizes, and SHA-256 checksums
- **Module Host** (`backend/`): Express server on port 9000 serving catalog + bundles

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
# Generate keys (run from frontend/)
cd frontend
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

## Quick Start

```bash
# Install dependencies (from root)
npm install

# Generate code signing keys (first time only)
cd frontend && node scripts/generate-signing-keys.js && cd ..

# Build all remote modules
npm run build:modules

# Publish modules to backend (updates catalog.json with SHA-256 hashes)
npm run publish:modules

# In separate terminal: start backend server
npm run backend
# Serves http://localhost:9000

# Run on device/emulator
npm run android   # or npm run ios
```

## Monorepo Scripts (Root)

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm run app` | Start React Native dev server |
| `npm run android` | Run Android app |
| `npm run ios` | Run iOS app |
| `npm run build:modules` | Build all remote modules (production) |
| `npm run publish:modules` | Publish modules to backend & update catalog |
| `npm run backend` | Start backend dev server |
| `npm test` | Run frontend tests |
| `npm run typecheck` | TypeCheck frontend & backend |

## Backend

The backend is a static Express server with **no database or authentication**. See [`backend/README.md`](./backend/README.md) for details.

Environment variables (`.env`):
- `PORT` (default: 9000)
- `MODULES_DIR` (default: `../frontend/build/modules`)

## Adding a New Module

1. Create `frontend/modules/newmodule/src/index.tsx`:
   ```tsx
   export default function NewModule({ onBack }: { onBack: () => void }) {
     return <View><Text>New Module</Text></View>;
   }
   ```

2. Create `frontend/webpack.newmodule.config.mjs` (copy `webpack.doctor.config.mjs`, change `name: 'NewModule'`, entry path, and output path)

3. Add to `frontend/scripts/build-all.js`:
   ```js
   const MODULES = ['doctor', 'barber', 'food', 'newmodule'];
   ```

4. Build & publish:
   ```bash
   npm run build:modules
   npm run publish:modules
   ```

The new module appears in the catalog and can be installed dynamically.

## Apple App Store Policy

**Guideline 2.5.2** prohibits downloading executable code, **except** JavaScript downloaded and run by Apple's built-in WebKit or JavaScriptCore.

React Native uses JavaScriptCore on iOS, so **dynamically downloaded JS bundles are permitted** under the JS exception. Module Federation delivers JavaScript bundles, not native binaries.

**Guideline 3.3.1 / 4.7** requires apps with dynamic content to implement content filtering and comply with local laws. This demo has no user-generated content or content filtering—it's a fixed set of pre-approved business verticals for portfolio demonstration.

**Recommendation:** For production App Store submission, consult Apple's guidelines and consider an attorney review of your specific use case.

## Tech Stack

- React Native 0.87.1
- React 19.2.3
- Re.Pack 5 (Module Federation for React Native)
- Webpack 5
- TypeScript 6
- Zustand (state management, persisted via AsyncStorage)
- Jest 29 (unit tests)
- Express 4 (backend)

## License

MIT © 2026 Danial Khan
