#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MODULE_NAME = process.argv[2];
const VERSION = process.argv[3] || '1.0.0';
const VALID_MODULES = ['doctor', 'barber', 'food'];

const MODULE_ID_MAP = {
  doctor: 'DoctorModule',
  barber: 'BarberModule',
  food: 'FoodModule',
};

const MODULE_PORT_MAP = {
  doctor: 9001,
  barber: 9002,
  food: 9003,
};

if (!MODULE_NAME || !VALID_MODULES.includes(MODULE_NAME)) {
  console.error(`Usage: node publish-module.js <module-name> [version]`);
  console.error(`Valid modules: ${VALID_MODULES.join(', ')}`);
  process.exit(1);
}

console.log(`\n📤 Publishing ${MODULE_NAME} module (v${VERSION})...\n`);

const catalogPath = path.join(__dirname, '../module-host/public/catalog.json');
const bundlePath = path.join(
  __dirname,
  `../build/modules/${MODULE_NAME}/android/index.bundle`
);

if (!fs.existsSync(bundlePath)) {
  console.error('Bundle not found. Please build the module first.');
  process.exit(1);
}

const stats = fs.statSync(bundlePath);
const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
const checksum = crypto.createHash('md5').update(bundleContent).digest('hex').substring(0, 8);

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

const moduleId = MODULE_ID_MAP[MODULE_NAME];
const port = MODULE_PORT_MAP[MODULE_NAME];
const existingModuleIndex = catalog.modules.findIndex((m) => m.id === moduleId);

const moduleMetadata = {
  id: moduleId,
  name: MODULE_NAME === 'doctor' ? 'Doctor Booking' 
       : MODULE_NAME === 'barber' ? 'Barber Services' 
       : 'Food Delivery',
  description:
    MODULE_NAME === 'doctor'
      ? 'Book appointments with doctors across specialties'
      : MODULE_NAME === 'barber'
      ? 'Book haircuts and grooming services'
      : 'Order food from popular restaurant chains',
  version: VERSION,
  bundleUrl: `http://localhost:${port}/index.bundle`,
  size: stats.size,
  checksum,
  minShellVersion: '1.0.0',
  icon: MODULE_NAME === 'doctor' ? 'medical' : MODULE_NAME === 'barber' ? 'scissors' : 'restaurant',
};

if (existingModuleIndex >= 0) {
  catalog.modules[existingModuleIndex] = moduleMetadata;
  console.log(`✓ Updated ${moduleId} in catalog`);
} else {
  catalog.modules.push(moduleMetadata);
  console.log(`✓ Added ${moduleId} to catalog`);
}

catalog.lastUpdated = Date.now();

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`\n✓ Module published successfully`);
console.log(`  Version: ${VERSION}`);
console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`  Checksum: ${checksum}`);
console.log(`  Bundle URL: ${moduleMetadata.bundleUrl}`);
console.log(`\nTo serve modules, run: cd module-host && npm start\n`);
