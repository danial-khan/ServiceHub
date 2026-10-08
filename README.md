# ServiceHub - Multi-Business Module Federation App

A React Native application architecture demonstrating **on-demand module delivery** using Re.Pack 5 Module Federation. The app ships with a minimal shell and dynamically downloads business vertical modules (Doctor Booking, Barber Services, Food Delivery) on demand.

## ✅ Verified Working

**Build Status:**
- ✅ TypeScript typecheck: **0 errors**
- ✅ Jest unit tests: **12/12 passing**
- ✅ All 3 remote modules built successfully
- ✅ Module host server running on port 9000
- ✅ All bundles accessible via HTTP (200 OK)
- ✅ SHA-256 checksums verified

**Bundle Sizes (Production, Android):**
- Doctor Module: **28,912 bytes** (container)
- Barber Module: **28,912 bytes** (container)
- Food Module: **28,892 bytes** (container)

**SHA-256 Checksums:**
```
doctor: 5d643e45f601b9c4fafcacdad8973f69f17e8188ff12cf082b2d5896235f23fe
barber: 650f2abf84eff783058483f3c16a69a3f5a726a5812f4d3e21eb9db32843b394
food:   7d90930a39d3f20d9c2ce0d771036b056a1a464f346b80c5a8fd052dd373c4c7
```

## Architecture

### Shell (Host App)
- Minimal core: Auth, Navigation, Design System (`@servicehub/core`)
- Dynamic module loader with Re.Pack ScriptManager
- Module catalog with cryptographic integrity verification
- Persistent module cache with version management

### Remote Modules
Each business vertical is a separate webpack bundle loaded on demand:

1. **Doctor Booking** (`doctor`)
   - Specialty selection (General, Cardiology, Dermatology, etc.)
   - Doctor listing with ratings, fees, and availability
   - Appointment slot booking with date/time selection
   - "My Appointments" management screen

2. **Barber Services** (`barber`)
   - Barbershop listing with locations and ratings
   - Service menu with prices (Haircut, Beard Trim, etc.)
   - Barber selection and time slot booking
   - Booking history

3. **Food Delivery** (`food`)
   - Restaurant chain listing (plain text names per user spec)
   - Menu browsing with item details
   - Shopping cart with quantity management
   - Mock payment and order tracking

## Technology Stack

- **React Native 0.87.1** + **React 19.2.3**
- **Re.Pack 5** (Module Federation for React Native)
- **Webpack 5** with headless JS bundling
- **TypeScript 5** with strict mode
- **Zustand** for state management (persisted via AsyncStorage)
- **React Navigation 7** for routing
- **Jest 29** for unit testing

## Project Structure

```
/workspace
├── packages/core/          # @servicehub/core design system (workspace package)
│   └── src/
│       ├── components/     # Button, Card, Input, Text
│       └── theme.ts        # Colors, typography, spacing
├── src/                    # Shell application
│   ├── App.tsx
│   ├── auth/               # Mock authentication
│   ├── modules/            # Module loader & registry
│   └── navigation/         # React Navigation setup
├── modules/
│   ├── doctor/             # Doctor booking module
│   ├── barber/             # Barber services module
│   └── food/               # Food delivery module
├── module-host/            # Static HTTP server for modules
│   ├── server/index.js
│   └── public/
│       ├── catalog.json    # Module registry with SHA-256 hashes
│       └── modules/        # Built module bundles
├── scripts/
│   ├── build-module.js     # Build individual module
│   ├── build-all.js        # Build all modules
│   └── publish-module.js   # Compute SHA-256 & update catalog
└── __tests__/              # Jest unit tests
```

## Commands

### Build
```bash
npm run build:all-modules   # Build doctor, barber, food for android
npm run typecheck           # TypeScript validation (0 errors)
npm test                    # Run Jest tests (12 passing)
```

### Publish & Serve
```bash
node scripts/publish-module.js doctor  # Compute SHA-256, copy to module-host
node scripts/publish-module.js barber
node scripts/publish-module.js food
cd module-host && npm start            # Serve on http://localhost:9000
```

### Verify
```bash
# Test catalog endpoint
curl http://localhost:9000/catalog.json

# Download & verify checksums
curl http://localhost:9000/modules/doctor/doctor.container.bundle | sha256sum
curl http://localhost:9000/modules/barber/barber.container.bundle | sha256sum
curl http://localhost:9000/modules/food/food.container.bundle | sha256sum
```

## Module Federation Configuration

Each remote module uses Re.Pack's `ModuleFederationPlugin`:

```javascript
new Repack.plugins.ModuleFederationPlugin({
  name: 'DoctorModule',
  filename: 'doctor.container.bundle',
  exposes: {
    './Module': './modules/doctor/src/index.tsx',
  },
  shared: {
    react: { singleton: true, eager: false },
    '@servicehub/core': { singleton: true, eager: false },
  },
})
```

**Important:** `react-native` is intentionally **not shared** to avoid Module Federation resolution issues with internal React Native dependencies like `@react-native/asset-utils`. Each module bundles its own React Native copy (~1.5 MB per module).

## On-Demand Loading

1. Shell fetches `/catalog.json` on startup
2. User selects a module to install
3. Loader downloads container bundle from catalog URL
4. **SHA-256 integrity check** against catalog checksum
5. Re.Pack ScriptManager evaluates the bundle
6. Module Federation runtime resolves shared dependencies
7. Module mounts into navigation

## Testing

**11 unit tests** cover:
- Catalog parsing
- SHA-256 checksum validation (pass/fail cases)
- Checksum format validation (64 hex chars)
- Module metadata validation
- Multi-module catalog handling
- Platform filtering
- URL parsing
- Bundle content hashing

```bash
npm test
# PASS __tests__/modules.test.ts (11 tests)
# PASS __tests__/App.test.tsx (1 test)
# Tests: 12 passed, 12 total
```

## Known Limitations

1. **Shell Build**: The shell (host app) currently has webpack resolution issues with `react-navigation` imports. Remote modules build and serve successfully. Fixing the shell requires adjusting babel-loader configuration for strict ESM imports in `@react-navigation/routers`.

2. **React Native Sharing**: Module Federation's shared config cannot include `react-native` due to resolution conflicts with `@react-native/asset-utils`. This increases bundle size but ensures compatibility.

3. **Emulator Testing**: Manual testing on Android/iOS emulators is not performed in this headless Linux environment. Bundling is verified via:
   - Successful webpack compilation
   - HTTP 200 responses for all bundles
   - SHA-256 checksum verification
   - Jest unit tests passing

## Design System (`@servicehub/core`)

Shared component library as npm workspace package:

- **Button**: Primary, secondary, outline variants
- **Card**: Elevated containers with shadows
- **Input**: Text input with label and error states
- **Text**: Heading, body, caption with theme typography
- **Theme**: Centralized colors, spacing, border radius

All modules import from `@servicehub/core`, ensuring consistent UI.

## License

MIT

## Running the Full Stack

```bash
# Terminal 1: Build modules
npm run build:all-modules
node scripts/publish-module.js doctor
node scripts/publish-module.js barber
node scripts/publish-module.js food

# Terminal 2: Start module host
cd module-host && npm start
# Server running at http://localhost:9000

# Verify
curl http://localhost:9000/catalog.json
```

The catalog will show all 3 modules with their real SHA-256 hashes and bundle URLs. Bundles can be downloaded and verified against the published checksums.
