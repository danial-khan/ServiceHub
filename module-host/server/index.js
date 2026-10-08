const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/doctor', express.static(path.join(__dirname, '../../build/modules/doctor')));
app.use('/barber', express.static(path.join(__dirname, '../../build/modules/barber')));
app.use('/food', express.static(path.join(__dirname, '../../build/modules/food')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/catalog.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/catalog.json'));
});

app.listen(PORT, () => {
  console.log(`Module host server running on http://localhost:${PORT}`);
  console.log(`Catalog available at http://localhost:${PORT}/catalog.json`);
  console.log('\nModule endpoints:');
  console.log(`  Doctor: http://localhost:${PORT}/doctor/`);
  console.log(`  Barber: http://localhost:${PORT}/barber/`);
  console.log(`  Food: http://localhost:${PORT}/food/`);
});
