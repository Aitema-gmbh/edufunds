const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'aitema-gmbh/edufunds-grundschule';
const BRANCH = 'main';

// Dateien einlesen
const files = [
  { path: 'README.md', content: '# EduFunds\n\n50 Förderprogramme für Schulen. KI-gestützter Antragsassistent.' },
  { path: '.github/workflows/deploy.yml', content: fs.readFileSync('.github/workflows/deploy.yml', 'utf8') },
  { path: 'export-static.js', content: fs.readFileSync('export-static.js', 'utf8') },
  { path: 'package.json', content: fs.readFileSync('package.json', 'utf8') },
  { path: 'data/foerderprogramme.json', content: fs.readFileSync('data/foerderprogramme.json', 'utf8') },
];

// Basis64 encodieren
const encodedFiles = files.map(f => ({
  path: f.path,
  content: Buffer.from(f.content).toString('base64')
}));

console.log('🚀 Upload zu GitHub...');
console.log('Dateien:', encodedFiles.length);

// Einfacher HTTP Request
const postData = JSON.stringify({
  branch: BRANCH,
  message: 'Deploy: 50 Förderprogramme + KI-Assistent',
  content: encodedFiles[0].content,
  path: encodedFiles[0].path
});

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${REPO}/contents/${encodedFiles[0].path}`,
  method: 'PUT',
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'EduFunds-Bot',
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Erste Datei hochgeladen!');
      console.log('Commit SHA:', response.commit?.sha?.substring(0, 7));
    } else {
      console.log('⚠️ Status:', res.statusCode);
      console.log('Meldung:', response.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Fehler:', e.message);
});

req.write(postData);
req.end();
