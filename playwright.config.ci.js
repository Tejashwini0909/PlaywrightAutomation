// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * CI-specific Playwright configuration for GitHub Actions
 * This configuration is optimized for automated testing in CI environment
 */
export default defineConfig({
  testDir: './tests',
  timeout: 120 * 1000, // 2 minutes per test
  globalTimeout: 120 * 1000, // Global timeout
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'] // Add list reporter for better CI output
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* CI-specific settings */
    actionTimeout: 30000, // 30 seconds for actions
    navigationTimeout: 60000, // 60 seconds for navigation
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true, // Always headless in CI
        slowMo: 0, // No slow motion in CI
        navigationTimeout: 60000, // Increased navigation timeout
        actionTimeout: 30000, // Action timeout
        browserName: 'chromium', // Specify the browser name
      },
    },
  ],
  
  /* CI-specific web server configuration */
  webServer: {
    command: 'echo "No local server needed for CI tests"',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
  
  /* Global setup and teardown for CI */
  globalSetup: undefined, // No global setup needed for CI
  globalTeardown: undefined, // No global teardown needed for CI
  
  /* CI-specific output directory */
  outputDir: 'test-results/',
  
  /* CI-specific test matching */
  testMatch: '**/*.spec.js',
  
  /* CI-specific test ignore patterns */
  testIgnore: [
    '**/node_modules/**',
    '**/playwright-report/**',
    '**/test-results/**'
  ],
});
