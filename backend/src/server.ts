import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;
const IS_VERCEL = process.env.VERCEL === '1';

// On Vercel, modules are in public/modules (committed)
// Locally, they can be in frontend/build/modules or public/modules
const MODULES_DIR = IS_VERCEL 
  ? path.join(__dirname, '../public/modules')
  : process.env.MODULES_DIR || path.join(__dirname, '../../frontend/build/modules');

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('<html><body><h1>Backend is up and running.</h1></body></html>');
});

// Serve static files from public directory (catalog.json and committed modules)
app.use(express.static(path.join(__dirname, '../public')));

// Serve modules from the configured directory
if (!IS_VERCEL) {
  app.use('/modules/doctor', express.static(path.join(MODULES_DIR, 'doctor/android')));
  app.use('/modules/barber', express.static(path.join(MODULES_DIR, 'barber/android')));
  app.use('/modules/food', express.static(path.join(MODULES_DIR, 'food/android')));
}

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/catalog.json', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/catalog.json'));
});

// Only start server when not running on Vercel
if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`Module host server running on http://localhost:${PORT}`);
    console.log(`Catalog available at http://localhost:${PORT}/catalog.json`);
    console.log('\nModule endpoints:');
    console.log(`  Doctor: http://localhost:${PORT}/modules/doctor/`);
    console.log(`  Barber: http://localhost:${PORT}/modules/barber/`);
    console.log(`  Food: http://localhost:${PORT}/modules/food/`);
    console.log(`\nModules directory: ${MODULES_DIR}`);
  });
}

// Export for Vercel serverless
export default app;
