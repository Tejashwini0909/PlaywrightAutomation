import { test, expect } from '@playwright/test';
import { ModulePages } from '../pages/modulePages';

test.describe('FW Tests', () => {
  let modulepageObject;

  test.beforeEach(async ({ page }) => {
    modulepageObject = new ModulePages(page);
    await page.goto("https://ai.future.works/");
    await modulepageObject.loginWithGoogle('qa-user@future.works', '60XfapO&z2tDzJ*5');
  });

  test('TC_01 - Verify gpt-4.1 module validation', async ({ page }) => {
    await modulepageObject.selectModule('gpt-4.1');
    await modulepageObject.sendMessage('What is Smoke Testing');
    await modulepageObject.verifyAssistantResponse('smoke');
  });
  
  test('TC_02 - Verify grok-4 module validation', async ({ page }) => {
    await modulepageObject.selectModule('grok-4');
    await modulepageObject.sendMessage('What is Sanity Testing?');
    await modulepageObject.verifyAssistantResponse('sanity');
  });
  
  test('TC_03 - Verify gemini-2.5-pro module validation', async ({ page }) => {
    await modulepageObject.selectModule('gemini-2.5-pro');
    await modulepageObject.sendMessage('What is Functional Testing?');
    await modulepageObject.verifyAssistantResponse('functional');
  });
  
  test('TC_04 - Verify gpt-o3 module validation', async ({ page }) => {
    await modulepageObject.selectModule('gpt-o3');
    await modulepageObject.sendMessage('What is Exploratory Testing?');
    await modulepageObject.verifyAssistantResponse('exploratory');
  });

  test('TC_05 - Verify gpt-o3-mini module validation', async ({ page }) => {
    await modulepageObject.selectModule('gpt-o3-mini');
    await modulepageObject.sendMessage('What is Playwright?');
    await modulepageObject.verifyAssistantResponse('playwright');
  });
  
  test('TC_06 - Verify gpt-4.5-preview module validation', async ({ page }) => {
    await modulepageObject.selectModule('gpt-4.5-preview');
    await modulepageObject.sendMessage('Explain about current affiliate stock marketing trends');
    await modulepageObject.verifyAssistantResponse('stock');
  });
  
  test('TC_07 - Verify Claude 4 Sonnet module validation', async ({ page }) => {
    await modulepageObject.selectModule('Claude 4 Sonnet');
    await modulepageObject.sendMessage('What is QA Automation Role');
    await modulepageObject.verifyAssistantResponse('automation');
  });
  
  test('TC_08 - Verify DeepSeek R1 module validation', async ({ page }) => {
    await modulepageObject.selectModule('DeepSeek R1');
    await modulepageObject.sendMessage('What is Regression Testing?');
    await modulepageObject.verifyAssistantResponse('regression');
  });

});