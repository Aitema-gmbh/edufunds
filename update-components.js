const https = require('https');
const fs = require('fs');

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'aitema-gmbh/edufunds-grundschule';
const BRANCH = 'main';

// Datei hochladen/updaten
function uploadFile(filePath, localPath) {
  return new Promise((resolve, reject) => {
    const content = fs.readFileSync(localPath, 'utf8');
    
    // Zuerst SHA holen
    const getOptions = {
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

    const getReq = https.request(getOptions, (getRes) => {
      let data = '';
      getRes.on('data', (chunk) => data += chunk);
      getRes.on('end', () => {
        let sha = null;
        if (getRes.statusCode === 200) {
          sha = JSON.parse(data).sha;
        }
        
        // Dann upload
        const postData = JSON.stringify({
          branch: BRANCH,
          message: `Update: ${filePath}`,
          content: Buffer.from(content).toString('base64'),
          sha: sha
        });

        const putOptions = {
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

        const putReq = https.request(putOptions, (putRes) => {
          let putData = '';
          putRes.on('data', (chunk) => putData += chunk);
          putRes.on('end', () => {
            if (putRes.statusCode === 200 || putRes.statusCode === 201) {
              console.log(`✅ ${filePath}`);
              resolve();
            } else {
              console.log(`❌ ${filePath}: ${JSON.parse(putData).message}`);
              reject();
            }
          });
        });

        putReq.on('error', reject);
        putReq.write(postData);
        putReq.end();
      });
    });

    getReq.on('error', reject);
    getReq.end();
  });
}

async function update() {
  console.log('🚀 Update Komponenten...\n');
  
  await uploadFile('components/HeroSection.tsx', 'components/HeroSection.tsx');
  await uploadFile('components/FeaturesSection.tsx', 'components/FeaturesSection.tsx');
  await uploadFile('app/page.tsx', 'app/page.tsx');
  
  console.log('\n✅ Update abgeschlossen!');
}

update().catch(console.error);
