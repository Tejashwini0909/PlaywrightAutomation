import { test, expect } from '@playwright/test';
import { ModulePages } from '../../pages/modulePages.js';

test.describe('FW Tests', () => {
  let modulepageObject;

  test.beforeEach(async ({ page }) => {
    modulepageObject = new ModulePages(page);
    
    // Navigate to the application
    console.log('Navigating to application...');
    await page.goto("https://staging.ai.future.works/");
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Login with Google
    console.log('Logging in with Google...');
    await modulepageObject.loginWithGoogle('qa-user@future.works', '60XfapO&z2tDzJ*5');
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    console.log('Login completed successfully');
    
    // Select Future Works workspace
    console.log('Selecting Future Works workspace...');
    await modulepageObject.selectFutureWorksWorkspace();
    console.log('Workspace selection completed');
  });

  test('TC_01 - Verify gpt-4.1 module validation', async ({ page }) => {
    console.log('Starting TC_01 - gpt-4.1 module validation');
    await modulepageObject.selectModule('gpt-4.1');
    await modulepageObject.sendMessage('What is Smoke Testing');
    await modulepageObject.verifyAssistantResponse('smoke');
    console.log('TC_01 completed successfully');
  });
  
  test('TC_02 - Verify grok-4 module validation', async ({ page }) => {
    console.log('Starting TC_02 - grok-4 module validation');
    await modulepageObject.selectModule('grok-4');
    await modulepageObject.sendMessage('What is Sanity Testing?');
    await modulepageObject.verifyAssistantResponse('sanity');
    console.log('TC_02 completed successfully');
  });
  
  test('TC_03 - Verify gemini-2.5-pro module validation', async ({ page }) => {
    console.log('Starting TC_03 - gemini-2.5-pro module validation');
    await modulepageObject.selectModule('gemini-2.5-pro');
    await modulepageObject.sendMessage('What is Functional Testing?');
    await modulepageObject.verifyAssistantResponse('functional');
    console.log('TC_03 completed successfully');
  });
  
  test('TC_04 - Verify gpt-o3 module validation', async ({ page }) => {
    console.log('Starting TC_04 - gpt-o3 module validation');
    await modulepageObject.selectModule('gpt-o3');
    await modulepageObject.sendMessage('What is Exploratory Testing?');
    await modulepageObject.verifyAssistantResponse('exploratory');
    console.log('TC_04 completed successfully');
  });

  test('TC_05 - Verify gpt-o3-mini module validation', async ({ page }) => {
    console.log('Starting TC_05 - gpt-o3-mini module validation');
    await modulepageObject.selectModule('gpt-o3-mini');
    await modulepageObject.sendMessage('What is Playwright?');
    await modulepageObject.verifyAssistantResponse('playwright');
    console.log('TC_05 completed successfully');
  }); 
   
  test('TC_06 - Verify Claude 4 Sonnet module validation', async ({ page }) => {
    console.log('Starting TC_06 - Claude 4 Sonnet module validation');
    await modulepageObject.selectModule('Claude 4 Sonnet');
    await modulepageObject.sendMessage('What is QA Automation Role');
    await modulepageObject.verifyAssistantResponse('automation');
    console.log('TC_06 completed successfully');
  });
  
  test('TC_07 - Verify DeepSeek R1 module validation', async ({ page }) => {
    console.log('Starting TC_07 - DeepSeek R1 module validation');
    await modulepageObject.selectModule('DeepSeek R1');
    await modulepageObject.sendMessage('What is Regression Testing?');
    await modulepageObject.verifyAssistantResponse('regression');
    console.log('TC_07 completed successfully');
  });

});