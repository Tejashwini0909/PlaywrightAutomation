import { test, expect } from '@playwright/test';

test.describe('Simple Tests', () => {
  
  test('Basic page load test', async ({ page }) => {
    await page.goto('https://ai.future.works/');
    await expect(page).toHaveTitle(/Future/);
  });

  test('Check if page loads without login', async ({ page }) => {
    await page.goto('https://ai.future.works/');
    await page.waitForLoadState('networkidle');
    
    // Check if the page has basic elements
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/homepage.png' });
  });

  test('Verify basic page structure', async ({ page }) => {
    await page.goto('https://ai.future.works/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for basic elements
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });
}); 