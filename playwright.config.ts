import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Konfiguration für EduFunds E2E-Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Maximale Testdauer */
  timeout: 60 * 1000,
  
  /* Erwartungs-Timeout */
  expect: {
    timeout: 10 * 1000
  },
  
  /* Tests nicht vollständig stoppen bei Fehler */
  fullyParallel: true,
  
  /* Fail-Fast bei CI */
  forbidOnly: !!process.env.CI,
  
  /* Wiederholungsversuche */
  retries: process.env.CI ? 2 : 1,
  
  /* Worker für parallele Tests */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['json', { outputFile: 'e2e-report/results.json' }],
    ['list']
  ],
  
  /* Shared settings für alle Projekte */
  use: {
    /* Base URL für Tests */
    baseURL: process.env.BASE_URL || 'http://localhost:3101',
    
    /* Trace für Debugging */
    trace: 'on-first-retry',
    
    /* Screenshots bei Fehlern */
    screenshot: 'only-on-failure',
    
    /* Videos bei Fehlern */
    video: 'on-first-retry',
    
    /* Viewport */
    viewport: { width: 1280, height: 720 },
    
    /* Action Timeout */
    actionTimeout: 15 * 1000,
    
    /* Navigation Timeout */
    navigationTimeout: 30 * 1000,
  },

  /* Projekte für Cross-Browser Testing */
  projects: [
    // Desktop Chrome
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Desktop Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    // Desktop Safari (WebKit)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Desktop Edge
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    },
    
    // Mobile Chrome (Android)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    // Mobile Safari (iOS)
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
    
    // Tablet iPad
    {
      name: 'Tablet Safari',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  /* Local dev server */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3101',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
