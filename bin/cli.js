#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const cwd = path.join(__dirname, '..');

console.log('Installing dependencies...');
execSync('npm install', { cwd, stdio: 'inherit' });

console.log('Starting Expo...');
execSync('npx expo start', { cwd, stdio: 'inherit' });