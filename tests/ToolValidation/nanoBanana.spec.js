import { test, expect } from '@playwright/test';
import { LoginPage } from '../../utils/login.js';

test.describe('NanoBanana Image Generation Tool – Automation Validation', () => {

  test.beforeEach(async ({ page }) => {
    console.log('Starting NanoBanana automation flow...');
    const login = new LoginPage(page);

    try {
      await login.loginWithGoogle();
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  });

  test('TC_01 – Validate NanoBanana tool invocation after image prompt', async ({ page }) => {
    console.log('TC_01: Sending image generation prompt');

    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await expect(chatInput).toBeVisible({ timeout: 15_000 });

    // Send a prompt that should clearly trigger image generation
    await chatInput.fill(
      'Generate a high-resolution, photorealistic image of a modern QA engineer’s workspace during late evening.'
    );
    await chatInput.press('Enter');

    // The tool label appears early, so we use it as confirmation
    // that the backend image generation flow has started
    await expect(
      page.getByText('Tool used: nanoBannanaStream')
    ).toBeVisible({ timeout: 60_000 });

    console.log('TC_01 PASSED: NanoBanana tool was invoked by the AI');
  });

  test('TC_02 – Validate generated image is rendered and loaded', async ({ page }) => {
    console.log('TC_02: Validating image render on the UI');

    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });

    // Trigger image generation again for this test case
    await chatInput.fill(
      'Generate a high-resolution, photorealistic image of a modern QA engineer’s workspace during late evening.'
    );
    await chatInput.press('Enter');

    // Wait until the tool invocation is visible before checking the image
    await expect(
      page.getByText('Tool used: nanoBannanaStream')
    ).toBeVisible({ timeout: 60_000 });

    // The image itself is dynamic, so we locate it using stable classes
    const generatedImage = page.locator('img.max-w-full.h-auto.rounded-lg').first();

    // Make sure the image is actually rendered on the page
    await expect(generatedImage).toBeVisible({ timeout: 60_000 });

    // A non-empty src confirms the backend returned an image URL
    await expect(generatedImage).toHaveAttribute('src', /.+/);

    // naturalWidth > 0 confirms the image has fully loaded
    // and is not just a placeholder or broken image
    await expect
      .poll(
        async () => {
          return await generatedImage.evaluate(img => img.naturalWidth);
        },
        { timeout: 60_000 }
      )
      .toBeGreaterThan(0);

    console.log('TC_02 PASSED: Image rendered and loaded successfully');
  });

  test('TC_03 – Validate image action controls after image render', async ({ page }) => {
    console.log('TC_03: Validating image action buttons');

    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });

    // Trigger image generation
    await chatInput.fill(
      'Generate a high-resolution, photorealistic image of a modern QA engineer’s workspace during late evening.'
    );
    await chatInput.press('Enter');

    // The tool indicator appears before the image finishes streaming,
    // so we wait for it first to confirm the request was handled
    await expect(
      page.getByText('Tool used: nanoBannanaStream')
    ).toBeVisible({ timeout: 60_000 });

    // The CTA buttons only appear once the image has fully rendered,
    // so we wait on the image itself instead of using a fixed delay
    const generatedImage = page.locator('img.max-w-full.h-auto.rounded-lg').first();

    await expect(generatedImage).toBeVisible({ timeout: 60_000 });

    await expect
      .poll(
        async () => {
          return await generatedImage.evaluate(img => img.naturalWidth);
        },
        { timeout: 60_000 }
      )
      .toBeGreaterThan(0);

    console.log('Image fully rendered; validating available actions');

    // Once the image is ready, the action buttons should be available
    await expect(
      page.getByRole('button', { name: 'View fullscreen' })
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByRole('button', { name: 'Download image' })
    ).toBeVisible({ timeout: 15_000 });

    console.log('TC_03 PASSED: Image action buttons are visible');
  });

  test('TC_04 – Validate NanoBanana is not triggered for text-only prompts', async ({ page }) => {
    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });

    // Send a normal text prompt that should not trigger image generation
    await chatInput.fill('Explain what a QA engineer does.');
    await chatInput.press('Enter');

    // Confirm that the image generation tool is not invoked
    await expect(
      page.getByText('Tool used: nanoBannanaStream')
    ).not.toBeVisible({ timeout: 10_000 });

    console.log('TC_04 PASSED: NanoBanana not triggered for text-only prompt');
  });

});
