/**
 * Admin-Security Setup Script
 * 
 * Verwendung:
 * npx ts-node scripts/setup-admin.ts
 * 
 * Generiert:
 * - Sichere bcrypt Passwort-Hashes
 * - JWT Secrets
 * - Admin API Keys
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

function generateJWTSecret(): string {
  return crypto.randomBytes(32).toString('base64');
}

function generateAPIKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🔐 EduFunds Admin Security Setup\n');
  console.log('================================\n');

  // JWT Secret
  console.log('📝 JWT Secret (für .env):');
  console.log(`JWT_SECRET=${generateJWTSecret()}`);
  console.log('');

  // Admin API Key
  console.log('📝 Newsletter Admin Key (für .env):');
  console.log(`NEWSLETTER_ADMIN_KEY=${generateAPIKey()}`);
  console.log('');

  // Beispiel Passwort-Hash
  const examplePassword = 'ChangeMe123!';
  console.log('📝 Beispiel Passwort-Hash (bcrypt, 12 Rounds):');
  console.log(`Password: ${examplePassword}`);
  console.log(`Hash: ${await hashPassword(examplePassword)}`);
  console.log('');

  console.log('⚠️  WICHTIG:');
  console.log('   1. Ändere das Passwort in Production!');
  console.log('   2. Speichere den Hash in ADMIN_PASSWORD_HASH');
  console.log('   3. Bewahre die .env Datei sicher auf!');
  console.log('   4. Gib niemals echte Passwörter in Chat-GPT o.ä. ein!');
  console.log('');

  // Passwort-Validierung testen
  console.log('🧪 Teste Passwort-Validierung:\n');
  
  const testPasswords = [
    'short',
    'nouppercase123!',
    'NOLOWERCASE123!',
    'NoNumbers!',
    'NoSpecial123',
    'ValidPass123!',
  ];

  for (const pwd of testPasswords) {
    const { lib } = await import('../lib/admin-auth');
    // Note: validatePasswordStrength is now in admin-auth.ts
  }
}

main().catch(console.error);
