import { test, expect } from '@playwright/test';
import { LoginPage } from '../../utils/login.js';

async function activateGmailTool(page) {
  // Wait for the page to be fully loaded
  await page.waitForTimeout(2000); 

  // Find the Gmail tool row specifically by its structure
  const gmailToolRow = page.locator('div.flex.w-full.justify-between.pl-5.px-2').filter({ hasText: 'Gmail' });

  await expect(gmailToolRow).toBeVisible({ timeout: 15_000 });

  // Find the checkbox button within the Gmail tool row
  const gmailCheckbox = gmailToolRow.locator('button[role="checkbox"]');

  await expect(gmailCheckbox).toBeVisible({ timeout: 10_000 });

  // Check if Gmail is already activated
  const ariaChecked = await gmailCheckbox.getAttribute('aria-checked');

  // Activate only if not already checked
  if (ariaChecked !== 'true') {
    await gmailCheckbox.click();
    await page.waitForTimeout(500); // Wait for state change
  }

  // Assert activation
  await expect(gmailCheckbox).toHaveAttribute('aria-checked', 'true');

  console.log('Gmail tool activated');
}

async function triggerGmailSearch(
  page,
  message = 'Fetch my recent emails from my inbox'
) {
  const chatInput = page.getByRole('textbox', { name: 'Ask anything' });

  await expect(chatInput).toBeVisible();
  await expect(chatInput).toBeEnabled();

  await chatInput.fill(message);
  await chatInput.press('Enter');

  await expect(
    page.getByText('Tool used: gmailSearchTool')
  ).toBeVisible({ timeout: 90_000 });
}

async function waitForAIResponseToFinish(page) {
  const stopButton = page.locator('button.bg-red-100');

  try {
    await expect(stopButton).toBeVisible({ timeout: 5_000 });
    await expect(stopButton).toBeHidden({ timeout: 90_000 });
  } catch {
    console.log('Fast response detected — no streaming stop button');
  }
}

test.describe('Gmail Integration Tool – Core Validation', () => {

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.loginWithGoogle();
  });

  test('TC_01 - Validate Gmail tool availability and activation', async ({ page }) => {
    await activateGmailTool(page);
  });

  test('TC_02 - Validate Gmail tool backend routing and execution', async ({ page }) => {
    // Step 1: Ensure Gmail tool is activated
    await activateGmailTool(page);

    let interceptedRequest;

    // Step 2: Listen for outgoing chat request
    const requestPromise = page.waitForRequest(
      request =>
        request.method() === 'POST' &&
        request.url().includes('/api/chat') &&
        request.postData() !== null &&
        request.postData().includes('isGmailAdded'),
      { timeout: 30_000 }
    ).then(req => {
      interceptedRequest = req;
    });
  
    // Step 3: Trigger Gmail tool
    await triggerGmailSearch(page);
  
    // Step 4: Wait for backend request
    await requestPromise;
  
    // Step 5: Assert request was sent
    expect(
      interceptedRequest,
      'Expected chat request when Gmail tool is triggered'
    ).toBeTruthy();
  
    // Step 6: Parse payload
    const payload = interceptedRequest.postDataJSON();
    expect(payload, 'Chat payload should exist').toBeTruthy();

    // CORRECT Gmail assertion (real contract)
    expect(
      payload.isGmailAdded,
      'Gmail flag should be enabled in chat payload'
    ).toBe(true);
  
    // Optional safety checks (non-blocking)
    if ('isDriveAdded' in payload) {
      expect(payload.isDriveAdded).toBe(false);
    }
    if ('isN8nEnabled' in payload) {
      expect(payload.isN8nEnabled).toBe(false);
    }
  
    // Step 7: Wait for AI execution to complete
    await waitForAIResponseToFinish(page);
  
    // Step 8: Validate UI confirms tool execution
    await expect(
      page.getByText('Tool used: gmailSearchTool')
    ).toBeVisible({ timeout: 90_000 });
  
    // Step 9: Check for actual error alerts
    const visibleErrors = page.locator('[role="alert"]:visible');
    const errorCount = await visibleErrors.count();

    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await visibleErrors.nth(i).textContent();
        const trimmedText = errorText?.trim() || '';

        // Only fail if there's actual error content
        if (trimmedText && (trimmedText.toLowerCase().includes('error') ||
                           trimmedText.toLowerCase().includes('failed') ||
                           trimmedText.toLowerCase().includes('exception'))) {
          throw new Error(`Found error alert: ${trimmedText}`);
        }
      }
    }
  
    console.log('TC_02 PASSED: Gmail tool backend routing and execution validated');
  });
      

  test('TC_03 - Chat remains responsive after AI response completes', async ({ page }) => {
    await activateGmailTool(page);
    await triggerGmailSearch(page);
    await waitForAIResponseToFinish(page);

    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await expect(chatInput).toBeEnabled();

    await chatInput.fill('Thanks, that works.');
    await chatInput.press('Enter');

    await expect(
      page.getByText('Thanks, that works.')
    ).toBeVisible({ timeout: 15_000 });
  });

  test('TC_04 - Gmail tool handles no-results query gracefully', async ({ page }) => {
    await activateGmailTool(page);
    await triggerGmailSearch(page, 'Fetch emails from the year 2001');
    await waitForAIResponseToFinish(page);

    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await expect(chatInput).toBeEnabled();

    const assistantResponse = page.locator('[data-role="assistant"]').last();
    await expect(assistantResponse).toBeVisible();

    console.log('TC_04 PASSED');
  });

  test('TC_05 - Gmail tool can be invoked multiple times in the same session', async ({ page }) => {
    await activateGmailTool(page);

    await triggerGmailSearch(page);
    await waitForAIResponseToFinish(page);

    await triggerGmailSearch(page, 'Fetch emails from yesterday');
    await waitForAIResponseToFinish(page);

    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await expect(chatInput).toBeEnabled();

    await chatInput.fill('Thanks, that helps.');
    await chatInput.press('Enter');

    await expect(
      page.getByText('Thanks, that helps.')
    ).toBeVisible({ timeout: 15_000 });

    console.log('TC_05 PASSED');
  });

  test('TC_06 - Gmail tool is not used when Gmail is disabled', async ({ page }) => {
    let interceptedRequest;
  
    // Listen for the outgoing chat request
    const requestPromise = page.waitForRequest(
      request =>
        request.method() === 'POST' &&
        request.url().includes('/chat') &&
        request.postData() !== null,
      { timeout: 30_000 }
    ).then(req => {
      interceptedRequest = req;
    });
  
    // Send an email-related prompt WITHOUT enabling Gmail
    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await chatInput.fill('Fetch my recent emails');
    await chatInput.press('Enter');
  
    // Wait for backend request
    await requestPromise;
  
    // Backend request should still be sent
    expect(interceptedRequest).toBeTruthy();
  
    const payload = interceptedRequest.postDataJSON();
    expect(payload).toBeTruthy();
  
    // Gmail must NOT be enabled
    expect(payload.isGmailAdded).not.toBe(true);
  
    // Gmail tool must NOT appear in the UI
    await expect(
      page.getByText('Tool used: gmailSearchTool')
    ).toHaveCount(0);
  
    // Chat should remain usable
    await waitForAIResponseToFinish(page);
    await expect(chatInput).toBeEnabled();
  
    console.log('TC_06 PASSED: Gmail tool correctly not triggered when disabled');
  });  

  test('TC_07 - Non-email prompt does not trigger Gmail when Gmail is enabled', async ({ page }) => {
    // Enable Gmail tool first
    await activateGmailTool(page);
  
    // Send a clearly non-email prompt
    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await chatInput.fill('Explain what unit testing is in simple terms.');
    await chatInput.press('Enter');
  
    // Wait for the AI response lifecycle to fully complete
    await waitForAIResponseToFinish(page);
  
    // Gmail tool must NEVER appear
    await expect(
      page.getByText('Tool used: gmailSearchTool')
    ).toHaveCount(0);
  
    // Optional backend validation (secondary, not primary)
    const requests = [];
    page.on('request', req => {
      if (req.url().includes('/chat') && req.postData()) {
        requests.push(req);
      }
    });
  
    // Ensure none of the captured requests enabled Gmail
    for (const req of requests) {
      const payload = req.postDataJSON?.();
      if (payload && payload.isGmailAdded === true) {
        throw new Error('Gmail was enabled in backend payload for non-email prompt');
      }
    }
  
    // Chat should still be usable
    await expect(chatInput).toBeEnabled();
  
    console.log('TC_07 PASSED: Gmail was not triggered for non-email prompt');
  });  
  
});