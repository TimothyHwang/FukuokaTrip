#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const steps = [
  'extract-items.js',
  'fetch-wikimedia.js',
  'download-images.js',
  'apply-images.js',
];

for (const s of steps) {
  console.log(`\n=== ${s} ===`);
  execSync(`node "${path.join(__dirname, s)}"`, { cwd: ROOT, stdio: 'inherit' });
}
