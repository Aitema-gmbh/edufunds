#!/usr/bin/env node
/**
 * Restore-Skript für EduFunds Daten
 * 
 * Funktionen:
 * - Listet alle verfügbaren Backups auf
 * - Ermöglicht Wiederherstellung eines Backups
 * - Erstellt automatisch Backup vor dem Restore
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Konfiguration
const CONFIG = {
  sourceFile: path.join(__dirname, '..', 'data', 'foerderprogramme.json'),
  backupDir: path.join(__dirname, '..', 'data', 'backups'),
  prefix: 'foerderprogramme'
};

/**
 * Erstellt Interface für Benutzereingabe
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Formatiert Dateigröße für Anzeige
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formatiert Datum für Anzeige
 */
function formatDate(date) {
  return date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Liest alle verfügbaren Backups
 */
function getAvailableBackups() {
  if (!fs.existsSync(CONFIG.backupDir)) {
    return [];
  }
  
  return fs.readdirSync(CONFIG.backupDir)
    .filter(file => file.startsWith(CONFIG.prefix) && file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(CONFIG.backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        created: stats.birthtime,
        size: stats.size
      };
    })
    .sort((a, b) => b.created - a.created); // Neueste zuerst
}

/**
 * Zeigt alle verfügbaren Backups an
 */
function listBackups(backups) {
  console.log('\n📦 Verfügbare Backups:\n');
  
  if (backups.length === 0) {
    console.log('   Keine Backups vorhanden.\n');
    return;
  }

  console.log('   Nr.  Datum                    Größe     Dateiname');
  console.log('   ─────────────────────────────────────────────────────────');
  
  backups.forEach((backup, index) => {
    const marker = index === 0 ? ' ⭐' : '';
    console.log(
      `   ${(index + 1).toString().padStart(2)}.  ` +
      `${formatDate(backup.created).padEnd(22)} ` +
      `${formatFileSize(backup.size).padStart(8)}  ` +
      `${backup.name}${marker}`
    );
  });
  
  console.log('\n   ⭐ = Neuestes Backup\n');
}

/**
 * Erstellt ein Sicherheits-Backup vor dem Restore
 */
function createSafetyBackup() {
  if (!fs.existsSync(CONFIG.sourceFile)) {
    return null;
  }

  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  const safetyName = `pre-restore_${timestamp}.json`;
  const safetyPath = path.join(CONFIG.backupDir, safetyName);

  fs.copyFileSync(CONFIG.sourceFile, safetyPath);
  return safetyName;
}

/**
 * Führt Restore durch
 */
function restoreBackup(backupPath) {
  try {
    // Erstelle Sicherheits-Backup
    const safetyName = createSafetyBackup();
    if (safetyName) {
      console.log(`\n💾 Aktueller Stand gesichert als: ${safetyName}`);
    }

    // Kopiere Backup zur Quelldatei
    fs.copyFileSync(backupPath, CONFIG.sourceFile);
    
    const stats = fs.statSync(CONFIG.sourceFile);
    console.log(`✅ Wiederherstellung erfolgreich!`);
    console.log(`   📄 Datei: ${path.basename(backupPath)}`);
    console.log(`   📊 Größe: ${formatFileSize(stats.size)}`);
    
    return true;
  } catch (err) {
    console.error(`❌ Fehler bei der Wiederherstellung: ${err.message}`);
    return false;
  }
}

/**
 * Validiert eine Backup-Datei
 */
function validateBackup(backupPath) {
  try {
    const content = fs.readFileSync(backupPath, 'utf8');
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      return { valid: false, error: 'Kein gültiges JSON-Array' };
    }
    
    return { valid: true, count: data.length };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Interaktiver Restore-Modus
 */
async function interactiveRestore() {
  const rl = createInterface();
  const backups = getAvailableBackups();

  if (backups.length === 0) {
    console.log('\n❌ Keine Backups zum Wiederherstellen vorhanden.');
    rl.close();
    return;
  }

  listBackups(backups);

  const askQuestion = () => {
    return new Promise((resolve) => {
      rl.question('🔄 Welches Backup wiederherstellen? (Nr. oder "abbrechen"): ', (answer) => {
        resolve(answer.trim());
      });
    });
  };

  while (true) {
    const answer = await askQuestion();

    if (answer.toLowerCase() === 'abbrechen' || answer.toLowerCase() === 'q') {
      console.log('\n❎ Wiederherstellung abgebrochen.');
      break;
    }

    const index = parseInt(answer, 10) - 1;
    
    if (isNaN(index) || index < 0 || index >= backups.length) {
      console.log('⚠️ Ungültige Eingabe. Bitte eine Nummer aus der Liste wählen.\n');
      continue;
    }

    const selectedBackup = backups[index];
    
    // Validiere Backup
    console.log(`\n🔍 Prüfe Backup: ${selectedBackup.name}`);
    const validation = validateBackup(selectedBackup.path);
    
    if (!validation.valid) {
      console.log(`⚠️ Ungültiges Backup: ${validation.error}\n`);
      continue;
    }
    
    console.log(`   ✅ Gültiges Backup mit ${validation.count} Einträgen`);
    
    // Bestätigung einholen
    const confirmAnswer = await new Promise((resolve) => {
      rl.question(`\n⚠️ Wirklich wiederherstellen? Aktuelle Daten werden überschrieben! (ja/nein): `, (answer) => {
        resolve(answer.trim().toLowerCase());
      });
    });

    if (confirmAnswer === 'ja' || confirmAnswer === 'j' || confirmAnswer === 'yes') {
      restoreBackup(selectedBackup.path);
      break;
    } else {
      console.log('\n❎ Wiederherstellung abgebrochen.');
      break;
    }
  }

  rl.close();
}

/**
 * Direkter Restore ohne Interaktion
 */
function directRestore(backupName) {
  const backups = getAvailableBackups();
  const backup = backups.find(b => b.name === backupName);

  if (!backup) {
    console.error(`❌ Backup nicht gefunden: ${backupName}`);
    process.exit(1);
  }

  const validation = validateBackup(backup.path);
  if (!validation.valid) {
    console.error(`❌ Ungültiges Backup: ${validation.error}`);
    process.exit(1);
  }

  restoreBackup(backup.path);
}

// Hauptprogramm
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
EduFunds Restore-Skript

Verwendung:
  node scripts/restore-data.js [Optionen] [Backup-Name]

Optionen:
  --list, -l     Liste alle Backups auf
  --help, -h     Diese Hilfe anzeigen

Ohne Argumente:
  Interaktiver Modus - Zeigt Liste und ermöglicht Auswahl

Beispiele:
  node scripts/restore-data.js                    # Interaktiver Modus
  node scripts/restore-data.js --list             # Nur auflisten
  node scripts/restore-data.js foerderprogramme_2025-02-05_08-42-15.json
`);
  process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
  const backups = getAvailableBackups();
  listBackups(backups);
  process.exit(0);
}

// Direkter Restore wenn Dateiname angegeben
const backupFile = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));

if (backupFile) {
  directRestore(backupFile);
} else {
  interactiveRestore();
}
