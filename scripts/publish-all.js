const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const modules = ['doctor', 'barber', 'food'];

console.log('\n📦 Publishing all modules...\n');

for (const module of modules) {
  try {
    execSync(`node ${path.join(__dirname, 'publish-module.js')} ${module}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  } catch (error) {
    console.error(`Failed to publish ${module}:`, error.message);
    process.exit(1);
  }
}

console.log('\n✅ All modules published successfully\n');
