const https = require('https');
const fs = require('fs');

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'aitema-gmbh/edufunds-grundschule';
const BRANCH = 'main';

// Zuerst: Aktuellen Inhalt der Datei holen (um SHA zu bekommen)
function getFileSha(filePath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'EduFunds-Bot',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          resolve(response.sha);
        } else if (res.statusCode === 404) {
          resolve(null); // Datei existiert nicht
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Dann: Datei updaten oder erstellen
function uploadFile(filePath, content, sha) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      branch: BRANCH,
      message: `Deploy: ${filePath}`,
      content: Buffer.from(content).toString('base64'),
      sha: sha
    });

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${REPO}/contents/${filePath}`,
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
          console.log(`✅ ${filePath} hochgeladen`);
          resolve(response);
        } else {
          console.log(`❌ ${filePath}: ${response.message}`);
          reject(new Error(response.message));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Hauptfunktion
async function deploy() {
  console.log('🚀 Starte Deployment zu GitHub...\n');
  
  const files = [
    { path: 'README.md', content: '# EduFunds\n\n50 Förderprogramme für Schulen.\nKI-gestützter Antragsassistent.\n\n## Deployment\nAutomatisch via GitHub Actions zu Cloudflare Pages.' },
    { path: '.github/workflows/deploy.yml', content: fs.readFileSync('.github/workflows/deploy.yml', 'utf8') },
    { path: 'package.json', content: fs.readFileSync('package.json', 'utf8') },
    { path: 'export-static.js', content: fs.readFileSync('export-static.js', 'utf8') },
    { path: 'data/foerderprogramme.json', content: fs.readFileSync('data/foerderprogramme.json', 'utf8') },
  ];

  for (const file of files) {
    try {
      const sha = await getFileSha(file.path);
      await uploadFile(file.path, file.content, sha);
    } catch (err) {
      console.error(`Fehler bei ${file.path}:`, err.message);
    }
  }
  
  console.log('\n✅ Deployment abgeschlossen!');
  console.log('GitHub Actions sollte jetzt starten...');
}

deploy().catch(console.error);
