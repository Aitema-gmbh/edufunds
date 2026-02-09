#!/usr/bin/env node
/**
 * DEPLOYMENT WORKAROUND
 * Da Git im Container Probleme macht, nutze dieses Skript
 * Es erstellt alle Dateien und zeigt dir den nächsten Schritt
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 EduFunds Deployment Workaround\n');

// 1. Statische Dateien erstellen
require('./export-static.js');

console.log('\n📦 Nächster Schritt:');
console.log('===================');
console.log('Da Git im Container nicht funktioniert:');
console.log('');
console.log('Option 1: Manuelles ZIP & Upload');
console.log('  zip -r deploy.zip dist/');
console.log('  → ZIP herunterladen');
console.log('  → Cloudflare Pages Dashboard');
console.log('  → Upload assets');
console.log('');
console.log('Option 2: Wrangler CLI (lokal auf deinem PC)');
console.log('  npm install -g wrangler');
console.log('  wrangler login');
console.log('  wrangler pages deploy dist --project-name=edufunds');
console.log('');
console.log('Option 3: GitHub Actions (empfohlen)');
console.log('  1. Secrets in GitHub eintragen:');
console.log('     CLOUDFLARE_API_TOKEN');
console.log('     CLOUDFLARE_ACCOUNT_ID');
console.log('  2. Push auf GitHub');
console.log('  3. Automatisches Deployment');
console.log('');
