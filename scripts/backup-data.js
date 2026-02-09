#!/usr/bin/env node
/**
 * Backup-Skript für EduFunds Daten
 * 
 * Funktionen:
 * - Kopiert data/foerderprogramme.json mit Zeitstempel
 * - Speichert in data/backups/ Ordner
 * - Behält nur letzte 10 Backups (löscht ältere)
 * - Kann bei Änderungen automatisch ausgeführt werden
 */

const fs = require('fs');
const path = require('path');

// Konfiguration
const CONFIG = {
  sourceFile: path.join(__dirname, '..', 'data', 'foerderprogramme.json'),
  backupDir: path.join(__dirname, '..', 'data', 'backups'),
  maxBackups: 10,
  prefix: 'foerderprogramme'
};

/**
 * Erstellt einen Zeitstempel im Format YYYY-MM-DD_HH-mm-ss
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
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
 * Erstellt Backup-Ordner falls nicht vorhanden
 */
function ensureBackupDir() {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    console.log(`📁 Backup-Ordner erstellt: ${CONFIG.backupDir}`);
  }
}

/**
 * Liest alle vorhandenen Backups
 */
function getExistingBackups() {
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
 * Löscht alte Backups, behält nur die letzten N
 */
function cleanupOldBackups(backups) {
  if (backups.length <= CONFIG.maxBackups) {
    return;
  }

  const toDelete = backups.slice(CONFIG.maxBackups);
  console.log(`\n🧹 Bereinige alte Backups (${toDelete.length} werden gelöscht)...`);
  
  for (const backup of toDelete) {
    try {
      fs.unlinkSync(backup.path);
      console.log(`   ❌ Gelöscht: ${backup.name}`);
    } catch (err) {
      console.error(`   ⚠️ Fehler beim Löschen von ${backup.name}: ${err.message}`);
    }
  }
}

/**
 * Führt das Backup durch
 */
function createBackup() {
  console.log('🔧 EduFunds Backup-Skript\n');

  // Prüfe ob Quelldatei existiert
  if (!fs.existsSync(CONFIG.sourceFile)) {
    console.error(`❌ Fehler: Quelldatei nicht gefunden: ${CONFIG.sourceFile}`);
    process.exit(1);
  }

  // Erstelle Backup-Ordner
  ensureBackupDir();

  // Erstelle Backup-Dateiname
  const timestamp = getTimestamp();
  const backupName = `${CONFIG.prefix}_${timestamp}.json`;
  const backupPath = path.join(CONFIG.backupDir, backupName);

  // Kopiere Datei
  try {
    fs.copyFileSync(CONFIG.sourceFile, backupPath);
    const stats = fs.statSync(backupPath);
    
    console.log(`✅ Backup erstellt:`);
    console.log(`   📄 Datei: ${backupName}`);
    console.log(`   📊 Größe: ${formatFileSize(stats.size)}`);
    console.log(`   🕐 Zeit: ${new Date().toLocaleString('de-DE')}`);
  } catch (err) {
    console.error(`❌ Fehler beim Erstellen des Backups: ${err.message}`);
    process.exit(1);
  }

  // Cleanup alte Backups
  const allBackups = getExistingBackups();
  cleanupOldBackups(allBackups);

  // Zeige verbleibende Backups
  const remainingBackups = getExistingBackups();
  console.log(`\n📦 Verbleibende Backups: ${remainingBackups.length}/${CONFIG.maxBackups}`);
  
  console.log('\n✨ Backup abgeschlossen!');
}

/**
 * Prüft ob sich die Datei seit dem letzten Backup geändert hat
 */
function hasFileChanged() {
  const backups = getExistingBackups();
  if (backups.length === 0) return true;

  const latestBackup = backups[0];
  const sourceStats = fs.statSync(CONFIG.sourceFile);
  
  return sourceStats.mtime > latestBackup.created;
}

// Hauptprogramm
const args = process.argv.slice(2);
const isAutoMode = args.includes('--auto');
const forceMode = args.includes('--force');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
EduFunds Backup-Skript

Verwendung:
  node scripts/backup-data.js [Optionen]

Optionen:
  --auto    Automatischer Modus (nur bei Änderungen)
  --force   Backup erzwingen (auch ohne Änderungen)
  --help    Diese Hilfe anzeigen

Beispiele:
  node scripts/backup-data.js           # Manuelles Backup
  node scripts/backup-data.js --auto    # Automatisches Backup
  node scripts/backup-data.js --force   # Backup erzwingen
`);
  process.exit(0);
}

if (isAutoMode && !forceMode) {
  if (!hasFileChanged()) {
    console.log('ℹ️ Keine Änderungen erkannt - Backup übersprungen');
    process.exit(0);
  }
  console.log('📝 Änderungen erkannt - Backup wird erstellt...\n');
}

createBackup();
