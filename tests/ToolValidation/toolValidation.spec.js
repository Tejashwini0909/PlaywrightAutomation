
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

  test('TC_09 - Verify GPT-5 module Accepts and uses: PDF (text), PDF (scan/OCR), PNG/JPG, CSV/XLSX ≤50 MB; - 6 file formats', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Test file upload functionality for all 6 supported formats
    const testDataFolder = path.join(process.cwd(), 'TestData');
    const uploadResults = await toolValidationpageObject.testAllFileFormatsUpload(testDataFolder);

    // Verify that at least some file formats were successfully uploaded
    const successfulUploads = uploadResults.filter(result => result.status === 'SUCCESS');
    expect(successfulUploads.length).toBeGreaterThan(0);
    console.log(`✅ Successfully uploaded ${successfulUploads.length} out of ${uploadResults.length} file formats`);
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

  test('TC_12 - Verify GPT-5 module validation with tool is CU ingestion tool', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');
    await toolValidationpageObject.selectCUDirectIngestionToolSetting()
    await toolValidationpageObject.runautoReasoningToolAndVerify('Ingest selections', 'Ingest', 3);
  });

  test('TC_13 - Simple collapsible checkbox section validation', async ({ page }) => {
    const toolValidationpageObject = new toolValidationPages(page);
    await toolValidationpageObject.selectModule('gemini-2.5-pro');

    // Ensure checkbox is unchecked for this test
    await toolValidationpageObject.uncheckCheckboxIfNotChecked();
    // Step 1: Check if all checkboxes are selected initially
    const allSelected = await toolValidationpageObject.areAllCheckboxesSelected();
    console.log(`All checkboxes initially selected: ${allSelected}`);

    // Step 2: Select "Delivery & CSat" section and verify all its checkboxes
    await toolValidationpageObject.selectSectionCheckbox('Delivery & CSat', true);
    await toolValidationpageObject.verifyAllCheckboxesInSectionSelected('Delivery & CSat');

    // Step 3: Test with another section - "Innovation"
    await toolValidationpageObject.selectSectionCheckbox('Innovation', true);
    await toolValidationpageObject.verifyAllCheckboxesInSectionSelected('Innovation');

    // Step 4: Uncheck a section
    await toolValidationpageObject.selectSectionCheckbox('Delivery & CSat', false);

    // Step 5: Test with another section - "Base"
    await toolValidationpageObject.selectSectionCheckbox('Base', true);
    await toolValidationpageObject.verifyAllCheckboxesInSectionSelected('Base');

    console.log('✅ TC_13 Passed: Simple collapsible checkbox validation completed');
  });

});
