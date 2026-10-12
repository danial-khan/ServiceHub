const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('Usage: node scripts/publish-module.js <module-name>');
  process.exit(1);
}

const sourcePath = path.join(__dirname, '..', 'frontend', 'build', 'modules', moduleName, 'android');
const destPath = path.join(__dirname, '..', 'backend', 'public', 'modules', moduleName);
const catalogPath = path.join(__dirname, '..', 'backend', 'public', 'catalog.json');

// Ensure destination directory exists
fs.mkdirSync(destPath, { recursive: true });

// Copy all bundle files
const files = fs.readdirSync(sourcePath);
const bundles = files.filter(f => f.endsWith('.bundle'));

console.log(`📦 Publishing ${moduleName} module...`);

// Copy bundles
for (const bundle of bundles) {
  const src = path.join(sourcePath, bundle);
  const dest = path.join(destPath, bundle);
  fs.copyFileSync(src, dest);
  console.log(`   Copied ${bundle}`);
}

// Compute SHA-256 for container bundle
const containerFile = bundles.find(b => b.includes('.container.bundle'));
if (!containerFile) {
  console.error(`❌ No container bundle found for ${moduleName}`);
  process.exit(1);
}

const containerPath = path.join(destPath, containerFile);
const containerData = fs.readFileSync(containerPath);
const hash = crypto.createHash('sha256').update(containerData).digest('hex');
const size = containerData.length;

console.log(`   SHA-256: ${hash}`);
console.log(`   Size: ${size} bytes`);

// Update catalog
let catalog = { modules: [] };
if (fs.existsSync(catalogPath)) {
  catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
}

// Remove old entry if exists
catalog.modules = catalog.modules.filter(m => m.id !== moduleName);

// Add new entry
catalog.modules.push({
  id: moduleName,
  name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
  version: '1.0.0',
  url: `http://localhost:9000/modules/${moduleName}/${containerFile}`,
  size,
  checksum: hash,
  platform: 'android',
  updatedAt: new Date().toISOString(),
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log(`✅ ${moduleName} module published successfully`);
