/**
 * Database Setup Script
 * 
 * Dieses Script initialisiert die Datenbank und erstellt alle Tabellen.
 * 
 * Usage:
 *   npx ts-node scripts/setup-db.ts
 *   # oder
 *   npm run setup:db
 */

import { initializeDatabase, isDatabaseInitialized, getDatabaseStatus } from '../lib/db';

async function main() {
  console.log('🚀 EduFunds Database Setup\n');

  try {
    // Prüfe ob bereits initialisiert
    console.log('📊 Prüfe Datenbank-Status...');
    const isInitialized = await isDatabaseInitialized();

    if (isInitialized) {
      console.log('✅ Datenbank ist bereits initialisiert\n');
      
      // Zeige Status
      const status = await getDatabaseStatus();
      console.log('📋 Datenbank-Status:');
      console.log(`   Verbindung: ${status.connected ? 'OK' : 'Fehler'}`);
      console.log(`   Tabellen: ${status.tables.join(', ')}`);
      console.log(`   Einträge:`);
      Object.entries(status.recordCounts).forEach(([table, count]) => {
        console.log(`     - ${table}: ${count}`);
      });
      
      return;
    }

    // Initialisiere Datenbank
    console.log('🔧 Initialisiere Datenbank...\n');
    await initializeDatabase();
    
    console.log('\n✅ Datenbank erfolgreich initialisiert!\n');
    
    // Zeige finalen Status
    const status = await getDatabaseStatus();
    console.log('📋 Finaler Status:');
    console.log(`   Tabellen: ${status.tables.join(', ')}`);
    
  } catch (error) {
    console.error('\n❌ Fehler beim Setup:');
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('   Datenbank-Verbindung fehlgeschlagen.');
        console.error('   Stelle sicher, dass PostgreSQL läuft:');
        console.error('   docker-compose up -d postgres');
      } else if (error.message.includes('password authentication')) {
        console.error('   Authentifizierung fehlgeschlagen.');
        console.error('   Überprüfe DATABASE_URL in .env.local');
      } else {
        console.error(`   ${error.message}`);
      }
    }
    
    process.exit(1);
  }
}

main();
