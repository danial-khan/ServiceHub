import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;
const MODULES_DIR = process.env.MODULES_DIR || path.join(__dirname, '../../frontend/build/modules');

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/doctor', express.static(path.join(MODULES_DIR, 'doctor/android')));
app.use('/barber', express.static(path.join(MODULES_DIR, 'barber/android')));
app.use('/food', express.static(path.join(MODULES_DIR, 'food/android')));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/catalog.json', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/catalog.json'));
});

app.listen(PORT, () => {
  console.log(`Module host server running on http://localhost:${PORT}`);
  console.log(`Catalog available at http://localhost:${PORT}/catalog.json`);
  console.log('\nModule endpoints:');
  console.log(`  Doctor: http://localhost:${PORT}/doctor/`);
  console.log(`  Barber: http://localhost:${PORT}/barber/`);
  console.log(`  Food: http://localhost:${PORT}/food/`);
  console.log(`\nModules directory: ${MODULES_DIR}`);
});
