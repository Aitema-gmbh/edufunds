#!/usr/bin/env node

/**
 * Statischer HTML-Generator für EduFunds
 * Workaround für NPM/Build-Probleme
 */

const fs = require('fs');
const path = require('path');

// Lade Daten
const programme = JSON.parse(fs.readFileSync('./data/foerderprogramme.json', 'utf8'));

// HTML Template
const template = (title, content, extraBodyClass = '') => `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | EduFunds</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #0f172a; color: #f8fafc; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .gradient-text { background: linear-gradient(to right, #f97316, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-bg { background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); }
    </style>
</head>
<body class="min-h-screen ${extraBodyClass}">
    <nav class="glass fixed w-full z-50 top-0">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" class="text-2xl font-bold gradient-text">EduFunds</a>
            <div class="flex gap-6">
                <a href="/" class="text-slate-300 hover:text-orange-400">Start</a>
                <a href="/programme" class="text-slate-300 hover:text-orange-400">Förderfinder</a>
                <a href="/ueber-uns" class="text-slate-300 hover:text-orange-400">Über uns</a>
                <a href="/kontakt" class="text-slate-300 hover:text-orange-400">Kontakt</a>
            </div>
        </div>
    </nav>
    
    <main class="pt-24 pb-12">
        <div class="container mx-auto px-4">
            ${content}
        </div>
    </main>
    
    <footer class="border-t border-slate-800 py-8 mt-12">
        <div class="container mx-auto px-4 text-center text-slate-500 text-sm">
            © 2025 EduFunds | 
            <a href="/impressum" class="hover:text-orange-400">Impressum</a> | 
            <a href="/datenschutz" class="hover:text-orange-400">Datenschutz</a> |
            <a href="/agb" class="hover:text-orange-400">AGB</a>
        </div>
    </footer>
</body>
</html>`;

// Generate Index Page
const indexContent = `
    <div class="text-center py-20">
        <h1 class="text-5xl font-bold mb-6">Fördermittel für Schulen</h1>
        <p class="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Finden und beantragen Sie Förderungen – unterstützt durch KI.
        </p>
        <a href="/programme" class="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-white">
            Förderfinder öffnen
        </a>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-orange-400">${programme.length}</div>
            <div class="text-sm text-slate-500">Programme</div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-cyan-400">${programme.filter(p => p.foerdergeberTyp === 'bund').length}</div>
            <div class="text-sm text-slate-500">Bund</div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-purple-400">${programme.filter(p => p.foerdergeberTyp === 'land').length}</div>
            <div class="text-sm text-slate-500">Länder</div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-green-400">${programme.filter(p => p.foerdergeberTyp === 'stiftung').length}</div>
            <div class="text-sm text-slate-500">Stiftungen</div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-blue-400">${programme.filter(p => p.foerdergeberTyp === 'eu').length}</div>
            <div class="text-sm text-slate-500">EU</div>
        </div>
    </div>
`;

// Generate Programme List Page
const programmeContent = `
    <h1 class="text-3xl font-bold mb-8">Förderprogramme</h1>
    
    <div class="grid gap-4">
        ${programme.map(p => `
        <article class="glass rounded-xl p-6">
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-${p.foerdergeberTyp === 'bund' ? 'cyan' : p.foerdergeberTyp === 'land' ? 'purple' : p.foerdergeberTyp === 'stiftung' ? 'green' : 'blue'}-500/20 text-${p.foerdergeberTyp === 'bund' ? 'cyan' : p.foerdergeberTyp === 'land' ? 'purple' : p.foerdergeberTyp === 'stiftung' ? 'green' : 'blue'}-400">
                    ${p.foerdergeberTyp.toUpperCase()}
                </span>
                ${p.kiAntragGeeignet ? '<span class="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">KI-geeignet</span>' : ''}
            </div>
            <h2 class="text-xl font-bold mb-2">${p.name}</h2>
            <p class="text-slate-400 text-sm mb-3">${p.foerdergeber}</p>
            <p class="text-slate-300 mb-4">${p.kurzbeschreibung}</p>
            <div class="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                <span>💰 ${p.foerdersummeText}</span>
                <span>📅 ${p.bewerbungsfristText}</span>
            </div>
            <div class="flex gap-2">
                ${p.kategorien.slice(0, 4).map(k => `<span class="px-2 py-1 rounded text-xs bg-slate-800 text-slate-400">${k}</span>`).join('')}
            </div>
            <a href="${p.infoLink}" target="_blank" class="inline-block mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm">
                Details →
            </a>
        </article>
        `).join('')}
    </div>
`;

// Generate Impressum
const impressumContent = `
    <h1 class="text-3xl font-bold mb-8">Impressum</h1>
    <div class="glass rounded-xl p-8">
        <h2 class="text-xl font-bold mb-4">Angaben gemäß § 5 TMG</h2>
        <p class="mb-4">EduFunds<br>Musterstraße 123<br>12345 Musterstadt</p>
        <h2 class="text-xl font-bold mb-4">Kontakt</h2>
        <p>E-Mail: info@edufunds.de</p>
    </div>
`;

// Generate Datenschutz
const datenschutzContent = `
    <h1 class="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
    <div class="glass rounded-xl p-8 space-y-4">
        <h2 class="text-xl font-bold">1. Datenschutz auf einen Blick</h2>
        <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst.</p>
        <h2 class="text-xl font-bold">2. Verantwortlicher</h2>
        <p>EduFunds, Musterstraße 123, 12345 Musterstadt</p>
    </div>
`;

// Generate AGB
const agbContent = `
    <h1 class="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
    <div class="glass rounded-xl p-8 space-y-4">
        <h2 class="text-xl font-bold">§ 1 Geltungsbereich</h2>
        <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der EduFunds-Plattform.</p>
        <h2 class="text-xl font-bold">§ 2 Vertragsschluss</h2>
        <p>Mit der Registrierung auf unserer Plattform kommt ein Nutzungsvertrag zustande.</p>
        <h2 class="text-xl font-bold">§ 3 Leistungen</h2>
        <p>EduFunds stellt eine Plattform zur Recherche von Förderprogrammen bereit.</p>
    </div>
`;

// Generate Über uns
const ueberUnsContent = `
    <h1 class="text-3xl font-bold mb-8">Über EduFunds</h1>
    <div class="glass rounded-xl p-8 space-y-4">
        <h2 class="text-xl font-bold">Unsere Mission</h2>
        <p>Wir helfen Schulen dabei, Fördermittel einfacher zu finden und zu beantragen.</p>
        <h2 class="text-xl font-bold">Unser Team</h2>
        <p>Ein engagiertes Team aus Bildungsexperten und Tech-Enthusiasten.</p>
        <h2 class="text-xl font-bold">KI-Unterstützung</h2>
        <p>Mit modernster KI-Technologie unterstützen wir Sie bei der Antragstellung.</p>
    </div>
`;

// Generate Kontakt
const kontaktContent = `
    <h1 class="text-3xl font-bold mb-8">Kontakt</h1>
    <div class="glass rounded-xl p-8 space-y-4">
        <h2 class="text-xl font-bold">Schreiben Sie uns</h2>
        <p>Haben Sie Fragen oder Anregungen? Wir freuen uns auf Ihre Nachricht!</p>
        <p class="mt-4"><strong>E-Mail:</strong> info@edufunds.de</p>
        <p><strong>Telefon:</strong> +49 123 456789</p>
        <p><strong>Adresse:</strong><br>EduFunds<br>Musterstraße 123<br>12345 Musterstadt</p>
    </div>
`;

// Generate 404 Page
const notFoundContent = `
    <div class="text-center py-20">
        <div class="text-8xl font-bold gradient-text mb-6">404</div>
        <h1 class="text-3xl font-bold mb-4">Seite nicht gefunden</h1>
        <p class="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
            Die von Ihnen gesuchte Seite existiert leider nicht oder wurde verschoben.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" class="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-white">
                ← Zurück zur Startseite
            </a>
            <a href="/programme" class="inline-block px-8 py-4 glass hover:bg-slate-700 rounded-lg font-medium">
                Förderfinder öffnen
            </a>
        </div>
        <div class="mt-12 p-6 glass rounded-xl max-w-lg mx-auto">
            <h3 class="font-bold mb-2">Hilfreiche Links:</h3>
            <ul class="space-y-2 text-slate-400">
                <li><a href="/" class="text-orange-400 hover:underline">Startseite</a></li>
                <li><a href="/programme" class="text-orange-400 hover:underline">Förderfinder</a></li>
                <li><a href="/ueber-uns" class="text-orange-400 hover:underline">Über uns</a></li>
                <li><a href="/kontakt" class="text-orange-400 hover:underline">Kontakt</a></li>
            </ul>
        </div>
    </div>
`;

// Create directories
if (!fs.existsSync('./dist')) fs.mkdirSync('./dist', { recursive: true });
if (!fs.existsSync('./dist/ueber-uns')) fs.mkdirSync('./dist/ueber-uns', { recursive: true });
if (!fs.existsSync('./dist/kontakt')) fs.mkdirSync('./dist/kontakt', { recursive: true });
if (!fs.existsSync('./dist/antrag')) fs.mkdirSync('./dist/antrag', { recursive: true });

// Generate Antrag pages for all programs
programme.forEach(p => {
  const antragDir = `./dist/antrag/${p.id}`;
  if (!fs.existsSync(antragDir)) fs.mkdirSync(antragDir, { recursive: true });
  
  const isKiGeeignet = p.kiAntragGeeignet !== false;
  const kiBadge = isKiGeeignet 
    ? '<span class="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">KI-geeignet</span>' 
    : '<span class="px-2 py-1 rounded-full text-xs font-medium bg-slate-600/20 text-slate-400">KI nicht verfügbar</span>';
  
  const typeColor = p.foerdergeberTyp === 'bund' ? 'cyan' : 
                   p.foerdergeberTyp === 'land' ? 'purple' : 
                   p.foerdergeberTyp === 'stiftung' ? 'green' : 'blue';
  
  const antragContent = `
    <div class="max-w-4xl mx-auto">
      <a href="/programme" class="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 mb-6 transition-colors">
        ← Zurück zur Übersicht
      </a>
      
      <h1 class="text-3xl md:text-4xl font-bold mb-4">Antrag erstellen</h1>
      <p class="text-slate-400 mb-6">Für: <span class="text-orange-400 font-medium">${p.name}</span></p>
      
      <div class="flex flex-wrap gap-2 mb-8">
        <span class="px-2 py-1 rounded-full text-xs font-medium bg-${typeColor}-500/20 text-${typeColor}-400">${p.foerdergeberTyp.toUpperCase()}</span>
        ${kiBadge}
      </div>
      
      <div class="glass rounded-xl p-6 mb-8">
        <h2 class="text-xl font-bold mb-4">${p.name}</h2>
        <p class="text-slate-400 mb-4">${p.foerdergeber}</p>
        <p class="text-slate-300 mb-4">${p.kurzbeschreibung}</p>
        <div class="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
          <span>💰 ${p.foerdersummeText}</span>
          <span>📅 ${p.bewerbungsfristText}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${p.kategorien.slice(0, 4).map(k => `<span class="px-2 py-1 rounded text-xs bg-slate-800 text-slate-400">${k}</span>`).join('')}
        </div>
      </div>
      
      ${isKiGeeignet ? `
      <div class="glass rounded-xl p-8 mb-8 border-orange-500/30">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-3">
          <span class="text-orange-400">🤖</span>
          KI-Antragsassistent
        </h2>
        <p class="text-slate-300 mb-6">
          Der KI-Antragsassistent hilft Ihnen bei der Erstellung eines professionellen Antrags.
          Die KI erstellt einen Entwurf basierend auf Ihren Angaben.
        </p>
        <div class="bg-slate-900/50 rounded-lg p-6">
          <h3 class="font-semibold text-slate-200 mb-4">Antrag starten</h3>
          <p class="text-slate-400 text-sm mb-4">
            Der KI-Antragsassistent ist in der vollständigen Anwendung verfügbar.
          </p>
          <a href="${p.infoLink}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all">
            Zum offiziellen Antragsformular →
          </a>
        </div>
      </div>
      ` : `
      <div class="glass rounded-xl p-8 mb-8 border-yellow-500/30">
        <div class="text-center max-w-lg mx-auto">
          <div class="text-5xl mb-4">⚠️</div>
          <h2 class="text-xl font-semibold text-slate-100 mb-2">KI-Assistent nicht verfügbar</h2>
          <p class="text-slate-400 mb-6">
            Für dieses Programm steht der KI-Antragsassistent derzeit nicht zur Verfügung. 
            Bitte nutzen Sie das offizielle Antragsformular des Fördergebers.
          </p>
          <a href="${p.infoLink}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all">
            Zum offiziellen Antragsformular →
          </a>
        </div>
      </div>
      `}
      
      <div class="glass rounded-xl p-6 border-slate-700/50 bg-slate-800/30">
        <h3 class="font-semibold text-slate-200 mb-4">📋 Hinweise zur Antragstellung</h3>
        <ul class="text-sm text-slate-400 space-y-2">
          <li class="flex items-center gap-2">
            <span class="text-green-400">✓</span>
            Prüfen Sie die aktuellen Antragsrichtlinien des Fördergebers
          </li>
          <li class="flex items-center gap-2">
            <span class="text-green-400">✓</span>
            Bereiten Sie alle erforderlichen Unterlagen vor
          </li>
          <li class="flex items-center gap-2">
            <span class="text-green-400">✓</span>
            Beachten Sie die Bewerbungsfristen
          </li>
          <li class="flex items-center gap-2">
            <span class="text-green-400">✓</span>
            Bei erfolgreicher Förderung: Melden Sie sich gerne bei uns!
          </li>
        </ul>
      </div>
    </div>
  `;
  
  fs.writeFileSync(`${antragDir}/index.html`, template(`Antrag - ${p.name}`, antragContent));
});

console.log(`📝 ${programme.length} Antragsseiten erstellt`);

// Write main pages
fs.writeFileSync('./dist/index.html', template('Startseite', indexContent));
fs.writeFileSync('./dist/programme.html', template('Förderprogramme', programmeContent));
fs.writeFileSync('./dist/impressum.html', template('Impressum', impressumContent));
fs.writeFileSync('./dist/datenschutz.html', template('Datenschutz', datenschutzContent));
fs.writeFileSync('./dist/agb.html', template('AGB', agbContent));
fs.writeFileSync('./dist/404.html', template('Seite nicht gefunden', notFoundContent));

// Write subdirectory pages
fs.writeFileSync('./dist/ueber-uns/index.html', template('Über uns', ueberUnsContent));
fs.writeFileSync('./dist/kontakt/index.html', template('Kontakt', kontaktContent));

console.log('✅ Statische HTML-Dateien erstellt:');
console.log('   - dist/index.html');
console.log('   - dist/programme.html');
console.log('   - dist/impressum.html');
console.log('   - dist/datenschutz.html');
console.log('   - dist/agb.html');
console.log('   - dist/404.html');
console.log('   - dist/ueber-uns/index.html');
console.log('   - dist/kontakt/index.html');
console.log(`\n📊 ${programme.length} Förderprogramme exportiert`);
