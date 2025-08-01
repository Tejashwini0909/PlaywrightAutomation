import { test, expect } from '@playwright/test';

test.describe('CI-Friendly Tests', () => {
  
  test('Basic browser functionality test', async ({ page }) => {
    // Test basic browser functionality
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test('Google search test', async ({ page }) => {
    // Test a reliable website
    await page.goto('https://www.google.com');
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    const title = await page.title();
    expect(title).toContain('Google');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/google-homepage.png' });
  });

  test('GitHub test', async ({ page }) => {
    // Test GitHub (reliable and fast)
    await page.goto('https://github.com');
    await page.waitForLoadState('networkidle');
    
    // Check for GitHub elements
    const hasGitHubContent = await page.locator('body').textContent();
    expect(hasGitHubContent).toContain('GitHub');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/github-homepage.png' });
  });

  test('Playwright documentation test', async ({ page }) => {
    // Test Playwright docs (relevant to our project)
    await page.goto('https://playwright.dev');
    await page.waitForLoadState('networkidle');
    
    // Check for Playwright content
    const hasPlaywrightContent = await page.locator('body').textContent();
    expect(hasPlaywrightContent).toContain('Playwright');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/playwright-docs.png' });
  });

  test('Network connectivity test', async ({ page }) => {
    // Test network connectivity
    const response = await page.goto('https://httpbin.org/get');
    expect(response.status()).toBe(200);
    
    // Verify response content
    const body = await response.text();
    expect(body).toContain('"url"');
  });
}); 