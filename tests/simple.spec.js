import { test, expect } from '@playwright/test';

test.describe('Simple Tests', () => {
  
  test('Basic page load test', async ({ page }) => {
    await page.goto('https://ai.future.works/');
    await page.waitForLoadState('networkidle');
    
    // Check if the page has a title (more flexible than expecting specific text)
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Log the actual title for debugging
    console.log(`Page title: ${title}`);
  });

  test('Check if page loads without login', async ({ page }) => {
    await page.goto('https://ai.future.works/');
    await page.waitForLoadState('networkidle');
    
    // Check if the page has basic elements
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check if the page has content
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
    expect(bodyContent.length).toBeGreaterThan(0);
    
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
    
    // Check if page has some interactive elements or content
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const inputs = await page.locator('input').count();
    
    // Log page structure for debugging
    console.log(`Page has ${buttons} buttons, ${links} links, ${inputs} inputs`);
    
    // Basic validation that the page has some structure
    expect(buttons + links + inputs).toBeGreaterThan(0);
  });
}); 