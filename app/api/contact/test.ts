/**
 * Tests für die Kontakt API
 * 
 * Ausführen mit:
 * npx ts-node --esm app/api/contact/test.ts
 */

import { contactSchema, type ContactFormData } from '../../../lib/contactSchema';

// Test 1: Validierung - Gültige Daten
function testValidData() {
  const validData = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    subject: 'Test Betreff',
    message: 'Dies ist eine Testnachricht mit mehr als 20 Zeichen.',
    datenschutz: true as const,
    timestamp: Date.now() - 5000, // 5 Sekunden alt
  };

  const result = contactSchema.safeParse(validData);
  console.log('Test 1 - Gültige Daten:', result.success ? '✓ PASS' : '✗ FAIL');
  if (!result.success) {
    console.log('  Fehler:', result.error.errors);
  }
  return result.success;
}

// Test 2: Validierung - Name zu kurz
function testNameTooShort() {
  const invalidData = {
    name: 'M',
    email: 'max@example.com',
    subject: 'Test Betreff',
    message: 'Dies ist eine Testnachricht mit mehr als 20 Zeichen.',
    datenschutz: true as const,
    timestamp: Date.now() - 5000,
  };

  const result = contactSchema.safeParse(invalidData);
  const hasNameError = !result.success && result.error.errors.some(e => e.path[0] === 'name');
  console.log('Test 2 - Name zu kurz:', hasNameError ? '✓ PASS' : '✗ FAIL');
  return hasNameError;
}

// Test 3: Validierung - Ungültige E-Mail
function testInvalidEmail() {
  const invalidData = {
    name: 'Max Mustermann',
    email: 'keine-email',
    subject: 'Test Betreff',
    message: 'Dies ist eine Testnachricht mit mehr als 20 Zeichen.',
    datenschutz: true as const,
    timestamp: Date.now() - 5000,
  };

  const result = contactSchema.safeParse(invalidData);
  const hasEmailError = !result.success && result.error.errors.some(e => e.path[0] === 'email');
  console.log('Test 3 - Ungültige E-Mail:', hasEmailError ? '✓ PASS' : '✗ FAIL');
  return hasEmailError;
}

// Test 4: Validierung - Betreff zu kurz
function testSubjectTooShort() {
  const invalidData = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    subject: 'Test',
    message: 'Dies ist eine Testnachricht mit mehr als 20 Zeichen.',
    datenschutz: true as const,
    timestamp: Date.now() - 5000,
  };

  const result = contactSchema.safeParse(invalidData);
  const hasSubjectError = !result.success && result.error.errors.some(e => e.path[0] === 'subject');
  console.log('Test 4 - Betreff zu kurz:', hasSubjectError ? '✓ PASS' : '✗ FAIL');
  return hasSubjectError;
}

// Test 5: Validierung - Nachricht zu kurz
function testMessageTooShort() {
  const invalidData = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    subject: 'Test Betreff',
    message: 'Zu kurz',
    datenschutz: true as const,
    timestamp: Date.now() - 5000,
  };

  const result = contactSchema.safeParse(invalidData);
  const hasMessageError = !result.success && result.error.errors.some(e => e.path[0] === 'message');
  console.log('Test 5 - Nachricht zu kurz:', hasMessageError ? '✓ PASS' : '✗ FAIL');
  return hasMessageError;
}

// Test 6: Validierung - Datenschutz nicht akzeptiert
function testDatenschutzNotAccepted() {
  const invalidData = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    subject: 'Test Betreff',
    message: 'Dies ist eine Testnachricht mit mehr als 20 Zeichen.',
    datenschutz: false as const,
    timestamp: Date.now() - 5000,
  };

  const result = contactSchema.safeParse(invalidData);
  const hasDatenschutzError = !result.success && result.error.errors.some(e => e.path[0] === 'datenschutz');
  console.log('Test 6 - Datenschutz nicht akzeptiert:', hasDatenschutzError ? '✓ PASS' : '✗ FAIL');
  return hasDatenschutzError;
}

// Test 7: Validierung - Honeypot akzeptiert
function testHoneypotOptional() {
  const validData = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    subject: 'Test Betreff',
    message: 'Dies ist eine Testnachricht mit mehr als 20 Zeichen.',
    datenschutz: true as const,
    website: '', // Leerer Honeypot ist OK
    timestamp: Date.now() - 5000,
  };

  const result = contactSchema.safeParse(validData);
  console.log('Test 7 - Honeypot akzeptiert:', result.success ? '✓ PASS' : '✗ FAIL');
  return result.success;
}

// Alle Tests ausführen
export function runTests() {
  console.log('\n=== Kontakt API Tests ===\n');
  
  const results = [
    testValidData(),
    testNameTooShort(),
    testInvalidEmail(),
    testSubjectTooShort(),
    testMessageTooShort(),
    testDatenschutzNotAccepted(),
    testHoneypotOptional(),
  ];

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n=== Ergebnis: ${passed}/${total} Tests bestanden ===\n`);
  
  return passed === total;
}

// Wenn direkt ausgeführt
if (require.main === module) {
  runTests();
}
