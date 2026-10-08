#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const MODULES = ['doctor', 'barber', 'food'];

console.log('\n🏗️  Building all modules...\n');

let successCount = 0;
let failureCount = 0;

for (const module of MODULES) {
  try {
    console.log(`\nBuilding ${module} module...`);
    execSync(`node ${path.join(__dirname, 'build-module.js')} ${module}`, {
      stdio: 'inherit',
    });
    successCount++;
  } catch (error) {
    console.error(`Failed to build ${module} module`);
    failureCount++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`Build Summary: ${successCount} succeeded, ${failureCount} failed`);
console.log('='.repeat(50) + '\n');

if (failureCount > 0) {
  process.exit(1);
}
