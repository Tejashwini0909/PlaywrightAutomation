
import { test, expect } from '@playwright/test';
import { toolValidationPages } from '../../pages/toolValidationPages.js';
import { LoginPage } from '../../utils/login.js';
import path from 'path';

test.describe('FW Tests', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    try {
      await login.loginWithGoogle();
      console.log('Login successful for test');
    } catch (error) {
      console.error('Login failed in beforeEach:', error.message);
      throw error;
    }
  });

  test('TC_01 - Verify GPT-5 module validation with tool is Web Search', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');
    await toolValidationpageObject.runWebSearchAndVerify('tell me the latest tourist attractions to visit in italy', 'visit in Italy', 3);
  });
  test('TC_02 - Verify GPT-5 module validation with tool is Deep Search', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');
    await toolValidationpageObject.runDeepSearchAndVerify('can you tell me latest methods to handle hallucinations in gen ai', 'hallucinations', 3);
  });
  test('TC_03 - Verify GPT-5 module validation with tool is findRelavantContent', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');
    await toolValidationpageObject.runfindRelavantContentAndVerify('Whats the current sprint of veltris?', 'sprint of veltris', 3);
  });
  test('TC_04 - Verify GPT-5 module validation with tool is clickupTask', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');
    await toolValidationpageObject.runclickupTaskAndVerify('Tell me the details of 868ffdcnu', 'task', 3);
  });
  test('TC_05 - Verify GPT-5 module validation with tool is autoReasoningTool', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');
    await toolValidationpageObject.handleCustomCheckpoint();
    await toolValidationpageObject.runautoReasoningToolAndVerify('Ingest all the tasks for Tejashwini', 'Tejashwini', 3);
  });
  test('TC_06 - Verify GPT-5 module Space/List/Folder selection (Checkbox and Uncheckbox)', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Test scenario 1: Validate specific checkbox (Future Works) is checked
    await toolValidationpageObject.validateSpecificCheckboxState('Future Works', true);

    // Test scenario 2: Get detailed information about all checkboxes
    const checkboxDetails = await toolValidationpageObject.getCheckboxesDetails();
    console.log(`Found ${checkboxDetails.length} checkboxes for validation`);

    // Test scenario 3: Validate all checkboxes are checked
    await toolValidationpageObject.validateAllCheckboxesChecked(true);

    // Test scenario 4: Validate checkbox hierarchy with sub-checkboxes
    await toolValidationpageObject.validateCheckboxHierarchy('Future Works', true);
  });

  test('TC_07 - Verify checkbox validation - All checkboxes unchecked scenario', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Ensure checkbox is unchecked for this test
    await toolValidationpageObject.uncheckCheckboxIfNotChecked();

    // Now validate it's unchecked
    await toolValidationpageObject.validateSpecificCheckboxState('Future Works', false);
  });

  test('TC_08 - Verify comprehensive checkbox validation using options', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Comprehensive validation using the main validation method
    await toolValidationpageObject.validateCheckboxState({
      validationType: 'all-checked',
      includeSubCheckboxes: true
    });

    // Validate specific checkbox using the comprehensive method
    await toolValidationpageObject.validateCheckboxState({
      validationType: 'specific',
      checkboxText: 'Future Works',
      expectedState: true
    });

    // Validate hierarchy using the comprehensive method
    await toolValidationpageObject.validateCheckboxState({
      validationType: 'hierarchy',
      checkboxText: 'Future Works',
      expectedState: true,
      includeSubCheckboxes: true
    });
  });

  test('TC_09 - Verify GPT-5 module Accepts and uses: PDF (text), PDF (scan/OCR), PNG/JPG, CSV/XLSX ≤50 MB; - 7 file formats', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Test file upload functionality for all 7 supported formats
    const testDataFolder = path.join(process.cwd(), 'TestData');
    const uploadResults = await toolValidationpageObject.testAllFileFormatsUpload(testDataFolder);

    // Verify ALL file formats were successfully uploaded
    const successfulUploads = uploadResults.filter(result => result.status === 'SUCCESS');
    const failedUploads = uploadResults.filter(result => result.status === 'FAILED');
    
    console.log(`✅ Successfully uploaded ${successfulUploads.length} out of ${uploadResults.length} file formats`);
    
    // Test should fail if ANY file format failed to upload
    if (failedUploads.length > 0) {
      console.log(`❌ Failed uploads: ${failedUploads.map(f => f.description).join(', ')}`);
    }
    
    expect(successfulUploads.length).toBe(uploadResults.length);
    expect(failedUploads.length).toBe(0);
  });
  test('TC_10 - Verify banner appears when checkbox is not selected', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Test banner behavior when checkbox is not selected
    await toolValidationpageObject.testBannerBehavior(false);

    console.log('✅ TC_10 Passed: Banner is visible when checkbox is not selected');
  });

  test('TC_11 - Verify banner disappears when checkbox is selected', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Test banner behavior when checkbox is selected
    await toolValidationpageObject.testBannerBehavior(true);

    console.log('✅ TC_11 Passed: Banner is hidden when checkbox is selected');
  });

  test('TC_12 - Simple collapsible checkbox section validation', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Ensure checkbox is unchecked for this test
    await toolValidationpageObject.uncheckCheckboxIfNotChecked();
    // Step 1: Check if all checkboxes are selected initially
    const allSelected = await toolValidationpageObject.areAllCheckboxesSelected();
    console.log(`All checkboxes initially selected: ${allSelected}`);

    // Step 2: Select "[SVD] Delivery & CSat" section and verify all its checkboxes
    await toolValidationpageObject.selectSectionCheckbox('[SVD] Delivery & CSat', true);
    await toolValidationpageObject.verifyAllCheckboxesInSectionSelected('[SVD] Delivery & CSat');

    // Step 3: Test with another section - "[INV] Innovation"
    await toolValidationpageObject.selectSectionCheckbox('[INV] Innovation', true);
    await toolValidationpageObject.verifyAllCheckboxesInSectionSelected('[INV] Innovation');

    // Step 4: Uncheck a section
    await toolValidationpageObject.selectSectionCheckbox('[SVD] Delivery & CSat', false);

    // Step 5: Test with another section - "[TEC] Technology"
    await toolValidationpageObject.selectSectionCheckbox('[TEC] Technology', true);
    await toolValidationpageObject.verifyAllCheckboxesInSectionSelected('[TEC] Technology');

    console.log('✅ TC_13 Passed: Simple collapsible checkbox validation completed');
  });
  test('TC_13 - Verify GPT-5 module validation with tool is driveSearchTool', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModuleWithOutFutureCheckbox('gemini-2.5-pro');
    await toolValidationpageObject.runGoogleDriveSearchAndVerify('Can you read the document "Playwright: An Overview" from Google Drive?', 'Playwright', 3);
  });

  test('TC_14 - Verify GPT-5 module validation with tool is driveSearchTool using Google Docs URL', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModuleWithOutFutureCheckbox('gemini-2.5-pro');
    await toolValidationpageObject.runGoogleDriveSearchAndVerify('https://docs.google.com/document/d/1AFh5P-A04PMyX0LMwdxmMGLi_sKuQ6ze/edit#heading=h.jpyal7cu2z9b', 'document', 3);
  });

  test('TC_15 - Verify GPT-5 module validation with Google Docs URL without checkbox selection', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModuleWithOutFutureCheckbox('gemini-2.5-pro');

    // Send URL directly without selecting Google Drive checkbox
    await toolValidationpageObject.sendMessage('https://docs.google.com/document/d/1AFh5P-A04PMyX0LMwdxmMGLi_sKuQ6ze/edit#heading=h.jpyal7cu2z9b');

    // Wait for assistant response
    await toolValidationpageObject.thinkingTxt.waitFor({ state: 'hidden' });
    await page.waitForTimeout(5000);

    // Verify response contains document-related content
    await toolValidationpageObject.waitAssistantContainer.waitFor({ state: 'visible', timeout: 60000 });
    const responseTexts = await toolValidationpageObject.assistantContainer.locator('h1, h2, p, li').allTextContents();
    const fullResponse = responseTexts.join(' ').trim();

    expect(fullResponse.length).toBeGreaterThan(0);
    console.log('✅ TC_15 Passed: URL processed without Google Drive checkbox selection');
  });

  test('TC_16 - Verify Canvas Mode - Create, update and Get Document with Canvas Mode tool', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModuleWithOutFutureCheckbox('gemini-2.5-pro');
    await toolValidationpageObject.runCanvasModeCompleteWorkflow(3);
  });

  test('TC_17 - Verify GPT-5 module validation with Databricks Business Intelligence tool', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModuleWithOutFutureCheckbox('gemini-2.5-pro');
    await toolValidationpageObject.runDatabricksAndVerify('Can I get my last week tasks?', 'tasks', 5);
  });

});

