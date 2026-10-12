#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODULE_NAME = process.argv[2];
const VALID_MODULES = ['doctor', 'barber', 'food'];

if (!MODULE_NAME || !VALID_MODULES.includes(MODULE_NAME)) {
  console.error(`Usage: node build-module.js <module-name>`);
  console.error(`Valid modules: ${VALID_MODULES.join(', ')}`);
  process.exit(1);
}

console.log(`\n📦 Building ${MODULE_NAME} module...\n`);

try {
  const frontendRoot = path.join(__dirname, '..');
  const command = `PLATFORM=android webpack-cli --config webpack.${MODULE_NAME}.config.mjs --mode production`;
  execSync(command, { stdio: 'inherit', cwd: frontendRoot });

  const buildPath = path.join(frontendRoot, `build/modules/${MODULE_NAME}/android`);
  const bundlePath = path.join(buildPath, 'index.bundle');

  if (fs.existsSync(bundlePath)) {
    const stats = fs.statSync(bundlePath);
    console.log(`\n✓ Module built successfully`);
    console.log(`  Bundle size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`  Location: ${bundlePath}`);
  } else {
    throw new Error('Bundle file not found after build');
  }

  console.log(`\n✓ ${MODULE_NAME} module ready for deployment\n`);
} catch (error) {
  console.error(`\n✗ Build failed:`, error.message);
  process.exit(1);
}
