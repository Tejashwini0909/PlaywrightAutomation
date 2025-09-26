import { test, expect } from '@playwright/test';
import { ModulePages } from '../../pages/modulePages.js';
import { LoginPage } from '../../utils/login.js';

// Remove serial mode to allow tests to continue even if one fails
test.describe('FW Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Fresh setup for each test to ensure independence
    const modulepageObject = new ModulePages(page);
    const login = new LoginPage(page);
    
    try {
      await login.loginWithGoogle();
      console.log('✅ Login successful for test');
    } catch (error) {
      console.error('❌ Login failed in beforeEach:', error.message);
      throw error;
    }
    
    // Store objects in test context for access in test methods
    test.info().annotations.push({ type: 'modulepageObject', description: modulepageObject });
    test.info().annotations.push({ type: 'login', description: login });
  });
  
  test.afterEach(async ({ page }) => {
    // Clean up after each test to prevent state issues
    try {
      if (page && !page.isClosed()) {
        await page.reload(); // Refresh page to clean state
        console.log('🔄 Page refreshed for cleanup');
      }
    } catch (error) {
      console.error('⚠️ Cleanup error in afterEach:', error.message);
      // Don't throw error here to avoid affecting next test
    }
  });

  test('TC_01- Verify grok-4 module validation', async ({ page }) => {
    const modulepageObject = new ModulePages(page);
    
    try {
      await modulepageObject.selectModule('grok-4');
      await modulepageObject.selectFutureWorksIfNotSelected();
      await modulepageObject.sendMessage('What is Sanity Testing?');
      await modulepageObject.verifyAssistantResponse('sanity testing');
      console.log('✅ TC_01 - grok-4 test completed successfully');
    } catch (error) {
      console.error('❌ TC_01 - grok-4 test failed:', error.message);
      throw error; // Re-throw to mark test as failed but allow next test to run
    }
  });

  test('TC_03 - Verify gemini-2.5-pro module validation', async ({ page }) => {
    const modulepageObject = new ModulePages(page);
    
    try {
      await modulepageObject.selectModule('gemini-2.5-pro');
      await modulepageObject.selectFutureWorksIfNotSelected();
      await modulepageObject.sendMessage('What is Functional Testing?');
      await modulepageObject.verifyAssistantResponse('functional testing');
      console.log('✅ TC_03 - gemini-2.5-pro test completed successfully');
    } catch (error) {
      console.error('❌ TC_03 - gemini-2.5-pro test failed:', error.message);
      throw error;
    }
  });

  // GPT-5 modules
  test('TC_04 - Verify GPT-5-Auto module validation', async ({ page }) => {
    const modulepageObject = new ModulePages(page);
    
    try {
      await modulepageObject.selectModule('GPT-5-Auto');
      await modulepageObject.selectFutureWorksIfNotSelected();
      await modulepageObject.sendMessage('Summarize what smoke testing ensures.');
      await modulepageObject.verifyAssistantResponse('summary');
      console.log('✅ TC_04 - GPT-5-Auto test completed successfully');
    } catch (error) {
      console.error('❌ TC_04 - GPT-5-Auto test failed:', error.message);
      throw error;
    }
  });

  test('TC_05 - Verify GPT-5-Mini-Thinking module validation', async ({ page }) => {
    const modulepageObject = new ModulePages(page);
    
    try {
      await modulepageObject.selectModule('GPT-5-Mini-Thinking');
      await modulepageObject.selectFutureWorksIfNotSelected();
      await modulepageObject.sendMessage('Explain sanity testing in one line.');
      await modulepageObject.verifyAssistantResponse('sanity');
      console.log('✅ TC_05 - GPT-5-Mini-Thinking test completed successfully');
    } catch (error) {
      console.error('❌ TC_05 - GPT-5-Mini-Thinking test failed:', error.message);
      throw error;
    }
  });

  test('TC_06 - Verify GPT-5-Auto Thinking validation', async ({ page }) => {
    const modulepageObject = new ModulePages(page);
    
    try {
      await modulepageObject.selectModule('GPT-5-Auto Thinking');
      await modulepageObject.selectFutureWorksIfNotSelected();
      await modulepageObject.sendMessage('Define functional testing briefly.');
      await modulepageObject.verifyAssistantResponse('functional');
      console.log('✅ TC_06 - GPT-5-Auto Thinking test completed successfully');
    } catch (error) {
      console.error('❌ TC_06 - GPT-5-Auto Thinking test failed:', error.message);
      throw error;
    }
  });

  test('TC_07 - Verify GPT-5-Thinking module validation', async ({ page }) => {
    const modulepageObject = new ModulePages(page);
    
    try {
      await modulepageObject.selectModule('GPT-5-Thinking');
      await modulepageObject.selectFutureWorksIfNotSelected();
      await modulepageObject.sendMessage('What is regression testing?');
      await modulepageObject.verifyAssistantResponse('regression');
      console.log('✅ TC_07 - GPT-5-Thinking test completed successfully');
    } catch (error) {
      console.error('❌ TC_07 - GPT-5-Thinking test failed:', error.message);
      throw error;
    }
  });

  test('TC_08 - Verify Claude 4 Sonnet module validation', async ({ page }) => {
    const modulepageObject = new ModulePages(page);
    
    try {
      await modulepageObject.selectModule('Claude 4 Sonnet');
      await modulepageObject.selectFutureWorksIfNotSelected();
      await modulepageObject.sendMessage('What is QA Automation Role');
      await modulepageObject.verifyAssistantResponse('automation');
      console.log('✅ TC_08 - Claude 4 Sonnet test completed successfully');
    } catch (error) {
      console.error('❌ TC_08 - Claude 4 Sonnet test failed:', error.message);
      throw error;
    }
  });

  test('TC_09 - Verify DeepSeek R1 module validation', async ({ page }) => {
    const modulepageObject = new ModulePages(page);
    
    try {
      await modulepageObject.selectModule('DeepSeek R1');
      await modulepageObject.selectFutureWorksIfNotSelected();
      await modulepageObject.sendMessage('What is Regression Testing?');
      await modulepageObject.verifyAssistantResponse('regression');
      console.log('✅ TC_09 - DeepSeek R1 test completed successfully');
    } catch (error) {
      console.error('❌ TC_09 - DeepSeek R1 test failed:', error.message);
      throw error;
    }
  });
});




