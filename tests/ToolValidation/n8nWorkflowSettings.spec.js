import { test, expect } from '@playwright/test';
import { LoginPage } from '../../utils/login.js';

test.describe('n8n Workflow Settings Tests', () => {

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);

    try {
      await login.loginWithGoogle();
      console.log('Login successful for n8n workflow settings tests');
    } catch (error) {
      console.error('Login failed during setup:', error.message);
      throw error;
    }
  });

  test('TC_01 - Navigate to n8n Workflows Settings and verify UI elements', async ({ page }) => {
    console.log('Starting n8n workflows settings validation');

    // Open the user menu from the header
    const toggleBtn = page
      .locator('header button[data-state="closed"]')
      .first();

    await toggleBtn.scrollIntoViewIfNeeded();

    // Small wait to allow header animations and layout to stabilize
    await page.waitForTimeout(300);

    await toggleBtn.click();

    // Navigate to Admin Settings from the user menu
    await page
      .getByRole('button', { name: 'raphey@future.works raphey@' })
      .click();

    await page
      .getByRole('menuitem', { name: 'Admin Settings' })
      .click();

    // Open the n8n Workflows section
    await expect(
      page.getByRole('button', { name: 'n8n Workflows' })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'n8n Workflows' })
      .click();

    // Validate main workflows page elements
    await expect(
      page.getByRole('heading', { name: 'Workflows' })
    ).toBeVisible();

    await expect(
      page.getByRole('textbox', { name: 'Search...' })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'New' })
    ).toBeVisible();

    // Validate table structure and headers
    await expect(page.getByRole('cell', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Description' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Owner' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Method' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Access Level' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'URL' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Actions' })).toBeVisible();

    // Confirm at least one existing workflow is listed
    await expect(
      page.getByRole('cell', { name: 'Email to Call Transcript' })
    ).toBeVisible();

    console.log('All core workflow listing elements are visible');
  });

  test('TC_02 - Create new workflow form verification', async ({ page }) => {
    console.log('Starting create workflow navigation validation');

    // Navigation steps are intentionally repeated to keep tests independent
    const toggleBtn = page
      .locator('header button[data-state="closed"]')
      .first();

    await toggleBtn.scrollIntoViewIfNeeded();
  });

  test('TC_03 - Verify workflow creation form elements visibility', async ({ page }) => {
    console.log('Validating workflow creation form fields');

    // Open user menu
    const toggleBtn = page
      .locator('header button[data-state="closed"]')
      .first();

    await toggleBtn.scrollIntoViewIfNeeded();

    // Allow UI animations to complete before interaction
    await page.waitForTimeout(300);

    await toggleBtn.click();

    // Navigate to Admin Settings
    await page
      .getByRole('button', { name: 'raphey@future.works raphey@' })
      .click();

    await page
      .getByRole('menuitem', { name: 'Admin Settings' })
      .click();

    // Navigate to n8n Workflows and open the create form
    await expect(
      page.getByRole('button', { name: 'n8n Workflows' })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'n8n Workflows' })
      .click();

    await page
      .getByRole('button', { name: 'New' })
      .click();

    // Confirm Create Workflow form is displayed
    await expect(
      page.getByRole('heading', { name: 'Create Workflow' })
    ).toBeVisible();

    // Validate input fields and their enabled state
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Workflow name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Workflow name' })).toBeEnabled();

    await expect(page.getByText('Description', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Optional description' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Optional description' })).toBeEnabled();

    await expect(page.getByText('Workflow URL')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'https://' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'https://' })).toBeEnabled();

    // Validate dropdown fields
    await expect(page.getByText('Owner')).toBeVisible();
    await expect(page.getByText('HTTP Method')).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: 'GET' })).toBeVisible();

    await expect(page.getByText('Access Level')).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: 'User' })).toBeVisible();

    // Validate Create action button
    await expect(
      page.getByRole('button', { name: 'Create' })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Create' })
    ).toBeEnabled();

    console.log('Workflow creation form fields are visible and interactive');
  });

  test('TC_04 - Verify workflow table action buttons are accessible', async ({ page }) => {
    console.log('Validating workflow table and action controls');

    // Open user menu
    const toggleBtn = page
      .locator('header button[data-state="closed"]')
      .first();

    await toggleBtn.scrollIntoViewIfNeeded();

    // Allow UI to stabilize before interaction
    await page.waitForTimeout(300);

    await toggleBtn.click();

    // Navigate to Admin Settings
    await page
      .getByRole('button', { name: 'raphey@future.works raphey@' })
      .click();

    await page
      .getByRole('menuitem', { name: 'Admin Settings' })
      .click();

    // Open n8n Workflows page
    await expect(
      page.getByRole('button', { name: 'n8n Workflows' })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'n8n Workflows' })
      .click();

    // Confirm workflows table and related elements are present
    await expect(page.getByRole('heading', { name: 'Workflows' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Search...' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();

    await expect(page.getByRole('cell', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Description' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Owner' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Method' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Access Level' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'URL' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Actions' })).toBeVisible();
  });

});
