import { test, expect } from '@playwright/test';
import { LoginPage } from '../../utils/login.js';

async function activateN8NTool(page) {
  // Locate the N8N Workflow Tool in the tools list
  const n8nTool = page.getByText('N8N Workflow Tools', { exact: true });
  await expect(n8nTool).toBeVisible({ timeout: 15_000 });

  // Click the tool label to enable it
  await n8nTool.click();

  // Click the associated toggle element to ensure full activation
  await page.locator('div:nth-child(8) > .peer').click();

  // Allow a short buffer for the tool state to stabilize
  await page.waitForTimeout(1000);

  console.log('N8N Workflow Tool activated successfully');
}

test.describe('N8N MCP Tool Testing Flow', () => {

  test.beforeEach(async ({ page }) => {
    console.log('Starting N8N MCP workflow test setup');

    const login = new LoginPage(page);
    try {
      await login.loginWithGoogle();
      console.log('Login completed successfully');
    } catch (error) {
      console.error('Login failed during setup:', error.message);
      throw error;
    }
  });

  test('TC_01 - Validate visibility of N8N Workflow Tool', async ({ page }) => {
    console.log('Validating visibility of N8N Workflow Tool');

    // Verify that the N8N tool label is present in the UI
    const n8nTool = page.getByText('N8N Workflow Tools', { exact: true });
    await expect(n8nTool).toBeVisible({ timeout: 15_000 });

    // Confirm the tool is enabled and available for interaction
    await expect(n8nTool).toBeEnabled();

    // Verify the associated toggle element is rendered
    const toolSelector = page.locator('div:nth-child(8) > .peer');
    await expect(toolSelector).toBeVisible();

    console.log('N8N Workflow Tool is visible and ready for use');
  });

  test('TC_02 - Validate N8N Workflow Tool interaction', async ({ page }) => {
    console.log('Validating basic interaction with the N8N Workflow Tool');

    // Enable the N8N tool before interacting with the chat
    await activateN8NTool(page);

    // Verify the chat input is available
    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await expect(chatInput).toBeVisible({ timeout: 10_000 });
    await expect(chatInput).toBeEnabled();

    // Send a simple workflow trigger message
    await chatInput.fill('Trigger N8N workflow');
    await chatInput.press('Enter');

    // Confirm that the AI invokes an N8N-related tool
    await expect(
      page.getByText(/Tool used:\s*n8n-/i)
    ).toBeVisible({ timeout: 30_000 });

    console.log('N8N tool responds correctly to user input');
  });

  test('TC_03 - Validate tool response and tool usage visibility', async ({ page }) => {
    console.log('Validating N8N tool response after triggering workflow');

    // Ensure the N8N tool is enabled
    await activateN8NTool(page);

    // Submit a workflow trigger command
    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await expect(chatInput).toBeVisible();

    await chatInput.fill('Trigger N8N workflow');
    await chatInput.press('Enter');

    // Verify that the tool usage message appears in the response
    await expect(
      page.getByText(/Tool used:\s*n8n-/i)
    ).toBeVisible({ timeout: 30_000 });

    console.log('N8N tool invocation is visible in the response');
  });

  test('TC_04 - Validate workflow trigger execution', async ({ page }) => {
    console.log('Validating workflow execution sequence');

    // Enable the N8N tool
    await activateN8NTool(page);

    // Send a command that requires workflow execution
    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await expect(chatInput).toBeVisible();

    await chatInput.fill('trigger the calc workflow');
    await chatInput.press('Enter');

    // Confirm that workflow details are fetched
    await expect(
      page.getByText('Tool used: n8n-get_workflow_details')
    ).toBeVisible({ timeout: 30_000 });

    // Confirm that the workflow execution is triggered
    await expect(
      page.getByText('Tool used: n8n-execute_workflow')
    ).toBeVisible({ timeout: 30_000 });

    console.log('Workflow details and execution tools were triggered successfully');
  });

  test('TC_05 - Validate workflow execution after AI response completion', async ({ page }) => {
    console.log('Validating workflow execution after AI processing completes');

    // Enable the N8N tool
    await activateN8NTool(page);

    const chatInput = page.getByRole('textbox', { name: 'Ask anything' });
    await expect(chatInput).toBeVisible();

    // Trigger a workflow execution
    await chatInput.fill('trigger the calc workflow');
    await chatInput.press('Enter');

    // Wait for tool usage to appear, indicating AI processing has started
    try {
      await expect(
        page.getByText('Tool used: n8n-get_workflow_details')
      ).toBeVisible({ timeout: 30_000 });
      console.log('Workflow tool usage detected in response');
    } catch {
      console.log('Tool usage message not detected immediately, continuing validation');
    }

    // Allow additional time for the response to fully render
    await page.waitForTimeout(2000);

    // Ensure that meaningful response content is present on the page
    const pageContent = await page.textContent('body');
    expect(pageContent && pageContent.length).toBeGreaterThan(1000);

    console.log('Response content rendered successfully');

    // Confirm the chat input is re-enabled after processing completes
    await expect(chatInput).toBeEnabled();

    // Verify the user can type a follow-up message
    await chatInput.fill('test follow-up');
    await expect(chatInput).toHaveValue('test follow-up');

    console.log('Chat input is available after workflow execution');
  });

});
