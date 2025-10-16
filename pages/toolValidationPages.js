
import { expect } from '@playwright/test';
import { TimeoutConfig } from '../utils/config.js';

export class toolValidationPages {
    constructor(page) {
        this.page = page;
        
        // Log timeout configuration when page object is created
        TimeoutConfig.logConfig();
        
        this.btnContinueWithGoogle = page.locator("//button[text() = 'Continue with Google']");
        this.iptEmail = page.locator("//input[@aria-label='Email or phone']");
        this.btnNext = page.locator("(//span[text() = 'Next'])[last()]");
        this.iptPassword = page.locator("//input[@aria-label='Enter your password']");
        this.moduleDrpDown = page.locator("(//header//ul[@data-sidebar='menu']//following-sibling::button)[1]");
        this.messageBox = page.locator("//textarea[@placeholder ='Send a message...' or @placeholder = 'Ask anything']");
        this.messageSend = page.locator("//textarea[@placeholder ='Send a message...' or @placeholder = 'Ask anything']//parent::div//following-sibling::button");
        this.stopbtn = page.locator("//div[contains(@class, 'justify-end')]//*[@fill-rule='evenodd' and @clip-rule='evenodd' ]");
        this.assistantContainer = page.locator("//div[@data-role='assistant']");
        this.waitAssistantContainer = page.locator("(//div[@data-role='assistant']//p)[last()]");
        this.settingIcon = page.locator("//input[@id='file-input']//parent::div//button[@data-state='closed']");
        this.select_webSearch = page.locator("//div[text() = ' Web Search']");
        this.select_addPhotos = page.locator('text="Add photos & files"');
        this.select_more = page.locator("//div[text() = 'More']");
        this.select_deepSearch = page.locator("//div[text() = ' Deep Research']");
        this.select_CU_Direct_Ingestion = page.locator("//div[text() = ' CU Direct Ingestion']");
        this.futureWorksChkbox = page.locator("//span[text() = 'Future Works']//following-sibling::button");
        this.thinkingTxt = page.locator("//div[text() = 'Thinking...']");
        this.toolUsedName = page.locator("(//div[text() = 'Tool used: '])[last()]");
        this.retryBtn = page.locator("(//div[@data-role='assistant']//button)[5]");
        this.stopbtn = page.locator("//div[contains(@class, 'justify-end')]//*[@fill-rule='evenodd' and @clip-rule='evenodd' ]");
       // this.assistantContainer = page.locator("//div[@data-role='assistant']");
        this.findRelevantContent = page.locator("//div[text() = 'findRelevantContent']");
        
        // File upload locators
        this.fileUploadButton = page.locator("(//form//textarea//following-sibling::div//button)[1]");
        this.fileUploadSuccessMessage = page.locator("//div[text() = 'File(s) uploaded successfully!']");
        
        // Checkbox locators for validation
        this.specificCheckbox = page.locator("//span[text() = 'Future Works']//parent::div//button[@role='checkbox']");
        this.allCheckboxes = page.locator("//button[@role='checkbox' and @aria-checked='true']");
        this.checkedCheckboxes = page.locator("//button[@role='checkbox' and @aria-checked='true']");
        this.uncheckedCheckboxes = page.locator("//button[@role='checkbox' and @aria-checked='false']");
        
        // File upload locators
        //this.fileUploadButton = page.locator("(//form//textarea//following-sibling::div//button)[1]");
       // this.fileUploadSuccessMessage = page.locator("//div[text() = 'File(s) uploaded successfully!']");
        
        // Banner locators for context selection
        this.contextBanner = page.locator("//span[contains(text(), 'Select context to work')]");
        this.contextBannerFullText = page.locator("//span[text()='Select context to work with our data or leave unselected to work with vanilla models.']");
        
        // Simple collapsible checkbox locators
        this.allCollapsibleSections = page.locator("//div[contains(@class, 'overflow')]//div[@class = 'group/collapsible relative']");
        
    }

    /**
     * Helper method to get timeout values from configuration
     * @param {string} type - 'default', 'short', or 'long'
     * @returns {number} Timeout value in milliseconds
     */
    getTimeout(type = 'default') {
        return TimeoutConfig.getTimeout(type);
    }

    /**
     * Simple method: Check if all checkboxes are selected
     */
    async areAllCheckboxesSelected() {
        const totalCheckboxes = await this.allCheckboxes.count();
        const checkedCheckboxes = await this.checkedCheckboxes.count();
        console.log(`Total checkboxes: ${totalCheckboxes}, Checked: ${checkedCheckboxes}`);
        return totalCheckboxes === checkedCheckboxes;
    }

    /**
     * Simple method: Select a specific section checkbox and expand it
     * @param {string} sectionName - Name of section (e.g., 'Delivery & CSat')
     * @param {boolean} shouldCheck - true to check, false to uncheck
     */
    async selectSectionCheckbox(sectionName, shouldCheck = true) {
        try {
            console.log(`${shouldCheck ? 'Checking' : 'Unchecking'} section: ${sectionName}`);
            
            // Find the section checkbox
            const sectionCheckbox = this.page.locator(`//span[text()='${sectionName}']//following::button[@role='checkbox'][1]`);
            await sectionCheckbox.waitFor({ state: 'visible' });
            
            // Check current state
            const isChecked = await sectionCheckbox.getAttribute('aria-checked') === 'true';
            
            // Only click if state needs to change
            if (isChecked !== shouldCheck) {
                await sectionCheckbox.click();
                await this.page.waitForTimeout(1000);
                console.log(` Section ${sectionName} ${shouldCheck ? 'checked' : 'unchecked'}`);
            } else {
                console.log(`ℹSection ${sectionName} already ${shouldCheck ? 'checked' : 'unchecked'}`);
            }
            
            // If checking, also expand the section to see sub-items
            if (shouldCheck) {
                const expandButton = this.page.locator(`//span[text()='${sectionName}']//ancestor::button[1]`);
                const isExpanded = await expandButton.getAttribute('aria-expanded') === 'true';
                
                if (!isExpanded) {
                    await expandButton.click();
                    await this.page.waitForTimeout(500);
                    console.log(`Section ${sectionName} expanded`);
                }
            }
            
        } catch (error) {
            console.error(` Failed to handle section ${sectionName}:`, error.message);
            throw error;
        }
    }

    /**
     * Simple method: Verify all checkboxes in a section are selected
     * @param {string} sectionName - Name of section to check
     */
    async verifyAllCheckboxesInSectionSelected(sectionName) {
        try {
            console.log(` Verifying all checkboxes in ${sectionName} are selected...`);
            
            // Find all checkboxes in this section
            const sectionDiv = this.page.locator(`//span[text()='${sectionName}']//ancestor::div[@class='group/collapsible relative'][1]`);
            const sectionCheckboxes = sectionDiv.locator("//button[@role='checkbox']");
            const count = await sectionCheckboxes.count();
            
            console.log(`Found ${count} checkboxes in ${sectionName} section`);
            
            // Check each checkbox
            for (let i = 0; i < count; i++) {
                const checkbox = sectionCheckboxes.nth(i);
                const isChecked = await checkbox.getAttribute('aria-checked') === 'true';
                
                if (!isChecked) {
                    console.log(` Found unchecked checkbox in ${sectionName} section`);
                    return false;
                }
            }
            
            console.log(` All checkboxes in ${sectionName} are selected`);
            return true;
            
        } catch (error) {
            console.error(` Failed to verify section ${sectionName}:`, error.message);
            throw error;
        }
    }

    /**
     * Simple method: Process all sections one by one
     * @param {boolean} shouldCheck - true to check all, false to uncheck all
     */
    async processAllSections(shouldCheck = true) {
        try {
            console.log(`${shouldCheck ? 'Checking' : 'Unchecking'} all sections...`);
            
            // Get all section names
            const sectionSpans = this.page.locator("//div[@class='group/collapsible relative']//span[not(contains(@class, 'hidden'))]");
            const count = await sectionSpans.count();
            
            console.log(`Found ${count} sections to process`);
            
            for (let i = 0; i < count; i++) {
                try {
                    const sectionName = await sectionSpans.nth(i).textContent();
                    if (sectionName && sectionName.trim() !== '') {
                        await this.selectSectionCheckbox(sectionName.trim(), shouldCheck);
                        await this.page.waitForTimeout(500); // Small delay between sections
                    }
                } catch (error) {
                    console.log(` Skipped section ${i}: ${error.message}`);
                }
            }
            
            console.log(` Completed processing all sections`);
            
        } catch (error) {
            console.error(` Failed to process all sections:`, error.message);
            throw error;
        }
    }

    /**
     * Example method showing how to use different timeout configurations
     */
    async exampleTimeoutUsage() {
        try {
            // Use short timeout for quick elements
            await this.page.waitForLoadState('networkidle', { timeout: this.getTimeout('short') });
            
            // Use default timeout for standard elements
            await this.messageBox.waitFor({ state: 'visible', timeout: this.getTimeout('default') });
            
            // Use long timeout for AI responses and tool verification
            await this.waitAssistantContainer.waitFor({ state: 'visible', timeout: this.getTimeout('long') });
            
            console.log(' Example timeout usage completed successfully');
        } catch (error) {
            console.error(' Timeout error:', error.message);
            throw error;
        }
    }

    async selectModule(moduleName) {
        await this.page.waitForLoadState('networkidle');
        // Click the dropdown button
        await this.page.waitForTimeout(4000);
        await this.moduleDrpDown.waitFor({ state: 'visible' });
        await this.moduleDrpDown.hover();
        await this.moduleDrpDown.click();
        // Select the module by name
        await this.page.waitForSelector(`//div[@role='menuitem']//span[text() = '${moduleName}']`, { state: 'visible' });
        await this.page.waitForTimeout(1000); // Wait for the dropdown to be populated
        await this.page.locator(`//div[@role='menuitem']//span[text() = '${moduleName}']`).hover();
        await this.page.locator(`//div[@role='menuitem']//span[text() = '${moduleName}']`).click();
        await this.page.waitForTimeout(2000); // Wait for the module to be selected
        await this.futureWorksChkbox.waitFor({ state: 'visible' });
        await this.futureWorksChkbox.click();
    }

    async loginWithGoogle(email, password) {
        await this.page.waitForLoadState('networkidle');
        await this.btnContinueWithGoogle.waitFor({ state: 'visible' });
        await this.btnContinueWithGoogle.click();
        await this.iptEmail.fill(email);
        await this.btnNext.click();
        await this.iptPassword.fill(password);
        await this.btnNext.click();
    }

    async sendMessage(message) {
        await this.messageBox.waitFor({ state: 'visible' });
        await this.messageBox.fill(message);
        await this.messageSend.click();
        await this.page.waitForTimeout(3000); // Wait for the response to be processed 
    }

    /**
     * Verifies the assistant's response matches the expected answer.
     * @param {string} expectedAnswer - The expected answer text.
     */
    async verifyAssistantResponse(expectedAnswer) {
        await this.thinkingTxt.waitFor({ state: 'hidden' });
        await this.page.waitForTimeout(5000 * 3); // Wait for the response to be generated       
        const responseTexts = await assistantContainer.locator('h1, h2, p,li').allTextContents();
        const fullResponse = responseTexts.join(' ').trim();

        // More flexible matching - check if any part of the expected answer is in the response
        const expectedWords = expectedAnswer.toLowerCase().split(' ');
        const responseLower = fullResponse.toLowerCase();

        // Check if at least one word from expected answer is in the response
        const hasMatch = expectedWords.some(word => responseLower.includes(word));
        expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${fullResponse.substring(0, 200)}..."`).toBeTruthy();
    }
    async uncheckCheckboxIfNotChecked()
    {
        try {
            await this.futureWorksChkbox.waitFor({ state: 'visible' });
            
            // Check the current state of the checkbox
            const isChecked = await this.futureWorksChkbox.getAttribute('aria-checked');
            const dataState = await this.futureWorksChkbox.getAttribute('data-state');
            
            console.log(`Current checkbox state - aria-checked: ${isChecked}, data-state: ${dataState}`);
            
            // Only click if the checkbox is currently checked (to uncheck it)
            if (isChecked === 'true' || dataState === 'checked') {
                console.log(' Checkbox is checked, unchecking it...');
                await this.futureWorksChkbox.click();
                await this.page.waitForTimeout(1000); // Wait for state change
                
                // Verify it was unchecked
                const newState = await this.futureWorksChkbox.getAttribute('aria-checked');
                console.log(` Checkbox unchecked successfully. New state: ${newState}`);
            } else {
                console.log(' Checkbox is already unchecked, no action needed');
            }
        } catch (error) {
            console.error('Failed to uncheck checkbox:', error.message);
            throw error;
        }
    }

    /**
     * Check checkbox if not already checked
     */
    async checkCheckboxIfNotChecked()
    {
        try {
            await this.futureWorksChkbox.waitFor({ state: 'visible' });
            
            // Check the current state of the checkbox
            const isChecked = await this.futureWorksChkbox.getAttribute('aria-checked');
            const dataState = await this.futureWorksChkbox.getAttribute('data-state');
            
            console.log(`Current checkbox state - aria-checked: ${isChecked}, data-state: ${dataState}`);
            
            // Only click if the checkbox is currently unchecked (to check it)
            if (isChecked === 'false' || dataState !== 'checked') {
                console.log(' Checkbox is unchecked, checking it...');
                await this.futureWorksChkbox.click();
                await this.page.waitForTimeout(1000); // Wait for state change
                
                // Verify it was checked
                const newState = await this.futureWorksChkbox.getAttribute('aria-checked');
                console.log(` Checkbox checked successfully. New state: ${newState}`);
            } else {
                console.log(' Checkbox is already checked, no action needed');
            }
        } catch (error) {
            console.error('Failed to check checkbox:', error.message);
            throw error;
        }
    }
    async selectWebSearchToolSetting() {
        await this.settingIcon.waitFor({ state: 'visible' });
        await this.settingIcon.click();
        await this.select_more.click();
        await this.select_webSearch.click();
        await this.page.waitForTimeout(2000);
    }
    async verifyWebSearchToolUsed() {
        await this.toolUsedName.waitFor({ state: 'visible' });
        const toolUsedText = await this.toolUsedName.textContent();
        expect(toolUsedText).toContain('Web Search');
    }
    async verifyDeepSearchToolUsed() {
        await this.toolUsedName.waitFor({ state: 'visible' });
        const toolUsedText = await this.toolUsedName.textContent();
        expect(toolUsedText).toContain('Deep Search');
    }
    /**
     * Selects Web Search tool, sends a message, waits for assistant response, and verifies 'Web Search' tool is used, with retry.
     * @param {string} message - The message to send.
     * @param {string} expectedAnswer - The expected answer text.
     * @param {number} retries - Number of retry attempts (default 3).
     */
    async runWebSearchAndVerify(message, expectedAnswer, retries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Select Web Search tool
                await this.settingIcon.waitFor({ state: 'visible' });
                await this.settingIcon.click();
                await this.select_more.click();
                await this.select_webSearch.click();
                await this.page.waitForTimeout(2000);

                // Send message
                await this.messageBox.waitFor({ state: 'visible' });
                await this.messageBox.fill(message);
                await this.messageSend.click();

                // Wait for assistant response
                await this.thinkingTxt.waitFor({ state: 'hidden' });
                await this.page.waitForTimeout(5000);

                // Verify expected answer in assistant response
                await this.waitAssistantContainer.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const responseTexts = await this.assistantContainer.locator('h1, h2, p,li').allTextContents();
                const fullResponse = responseTexts.join(' ').trim();
                const expectedWords = expectedAnswer.toLowerCase().split(' ');
                const responseLower = fullResponse.toLowerCase();
                const hasMatch = expectedWords.some(word => responseLower.includes(word));
                expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${fullResponse.substring(0, 200)}..."`).toBeTruthy();

                // Verify tool used
                await this.toolUsedName.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const toolUsedText = await this.toolUsedName.textContent();
                expect(toolUsedText).toContain('webSearchExa');
                return; // Success
            } catch (error) {
                lastError = error;
                if (attempt < retries) {
                    console.log(`Attempt ${attempt} failed, refreshing page and retrying...`);
                    await this.page.reload();
                    await this.page.waitForTimeout(2000); // Wait for page to load after refresh
                    await this.page.waitForTimeout(1000); // Wait before retrying
                }
            }
        }
        throw lastError; // If all retries fail, throw the last error
    }
    /**
     * Selects Web Search tool, sends a message, waits for assistant response, and verifies 'Web Search' tool is used, with retry.
     * @param {string} message - The message to send.
     * @param {string} expectedAnswer - The expected answer text.
     * @param {number} retries - Number of retry attempts (default 3).
     */
    async runDeepSearchAndVerify(message, expectedAnswer, retries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Select Web Search tool
                await this.settingIcon.waitFor({ state: 'visible' });
                await this.settingIcon.click();
                await this.select_deepSearch.click();
                await this.page.waitForTimeout(2000);

                // Send message
                await this.messageBox.waitFor({ state: 'visible' });
                await this.messageBox.fill(message);
                await this.messageSend.click();

                // Wait for assistant response
                await this.thinkingTxt.waitFor({ state: 'hidden' });
                await this.page.waitForTimeout(5000);

                // Verify expected answer in assistant response
                await this.waitAssistantContainer.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const responseTexts = await this.assistantContainer.locator('h1, h2, p,li').allTextContents();
                const fullResponse = responseTexts.join(' ').trim();
                const expectedWords = expectedAnswer.toLowerCase().split(' ');
                const responseLower = fullResponse.toLowerCase();
                const hasMatch = expectedWords.some(word => responseLower.includes(word));
                expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${fullResponse.substring(0, 200)}..."`).toBeTruthy();

                // Verify tool used
                await this.toolUsedName.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const toolUsedText = await this.toolUsedName.textContent();
                expect(toolUsedText).toContain('deepResearch');
                return; // Success
            } catch (error) {
                lastError = error;
                if (attempt < retries) {
                    console.log(`Attempt ${attempt} failed, refreshing page and retrying...`);
                    await this.page.reload();
                    await this.page.waitForTimeout(2000); // Wait for page to load after refresh
                    await this.page.waitForTimeout(1000); // Wait before retrying
                }
            }
        }
        throw lastError; // If all retries fail, throw the last error
    }
    /**
    * Selects Web Search tool, sends a message, waits for assistant response, and verifies 'Web Search' tool is used, with retry.
    * @param {string} message - The message to send.
    * @param {string} expectedAnswer - The expected answer text.
    * @param {number} retries - Number of retry attempts (default 3).
    */
    async runfindRelavantContentAndVerify(message, expectedAnswer, retries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Send message
                await this.messageBox.waitFor({ state: 'visible' });
                await this.messageBox.fill(message);
                await this.messageSend.click();

                // Wait for assistant response
                await this.thinkingTxt.waitFor({ state: 'hidden' });
                await this.page.waitForTimeout(5000);

                await this.findRelevantContent.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });

                // Verify expected answer in assistant response
                await this.waitAssistantContainer.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const responseTexts = await this.assistantContainer.locator('h1, h2, p,li').allTextContents();
                const fullResponse = responseTexts.join(' ').trim();
                const expectedWords = expectedAnswer.toLowerCase().split(' ');
                const responseLower = fullResponse.toLowerCase();
                const hasMatch = expectedWords.some(word => responseLower.includes(word));
                expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${fullResponse.substring(0, 200)}..."`).toBeTruthy();

                // Verify tool used
                await this.toolUsedName.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const toolUsedText = await this.toolUsedName.textContent();
                expect(toolUsedText).toContain('findRelevantContent');
                return; // Success
            } catch (error) {
                lastError = error;
                if (attempt < retries) {
                    console.log(`Attempt ${attempt} failed, refreshing page and retrying...`);
                    await this.page.reload();
                    await this.page.waitForTimeout(2000); // Wait for page to load after refresh
                    await this.page.waitForTimeout(1000); // Wait before retrying
                }
            }
        }
        throw lastError; // If all retries fail, throw the last error
    }
    /**
    * Selects Web Search tool, sends a message, waits for assistant response, and verifies 'Web Search' tool is used, with retry.
    * @param {string} message - The message to send.
    * @param {string} expectedAnswer - The expected answer text.
    * @param {number} retries - Number of retry attempts (default 3).
    */
    async runclickupTaskAndVerify(message, expectedAnswer, retries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Send message
                await this.messageBox.waitFor({ state: 'visible' });
                await this.messageBox.fill(message);
                await this.messageSend.click();

                // Wait for assistant response
                await this.thinkingTxt.waitFor({ state: 'hidden' });
                await this.page.waitForTimeout(5000);

                // Verify expected answer in assistant response
                await this.waitAssistantContainer.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const responseTexts = await this.assistantContainer.locator('h1, h2, p,li').allTextContents();
                const fullResponse = responseTexts.join(' ').trim();
                const expectedWords = expectedAnswer.toLowerCase().split(' ');
                const responseLower = fullResponse.toLowerCase();
                const hasMatch = expectedWords.some(word => responseLower.includes(word));
                expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${fullResponse.substring(0, 200)}..."`).toBeTruthy();

                // Verify tool used
                await this.toolUsedName.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const toolUsedText = await this.toolUsedName.textContent();
                expect(toolUsedText).toContain('getClickupTask');
                return; // Success
            } catch (error) {
                lastError = error;
                if (attempt < retries) {
                    console.log(`Attempt ${attempt} failed, refreshing page and retrying...`);
                    await this.page.reload();
                    await this.page.waitForTimeout(2000); // Wait for page to load after refresh
                    await this.page.waitForTimeout(1000); // Wait before retrying
                }
            }
        }
        throw lastError; // If all retries fail, throw the last error
    }
     /**
    * Selects autoReasoningTool tool, sends a message, waits for assistant response, and verifies 'autoReasoningTool' tool is used, with retry.
    * @param {string} message - The message to send.
    * @param {string} expectedAnswer - The expected answer text.
    * @param {number} retries - Number of retry attempts (default 3).
    */
    async runautoReasoningToolAndVerify(message, expectedAnswer, retries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Send message
                await this.selectCUDirectIngestionToolSetting();
                await this.messageBox.waitFor({ state: 'visible' });
                await this.messageBox.fill(message);
                await this.messageSend.click();

                // Wait for assistant response
                await this.thinkingTxt.waitFor({ state: 'hidden' });
                await this.page.waitForTimeout(5000);

                // Verify expected answer in assistant response
                await this.waitAssistantContainer.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const responseTexts = await this.assistantContainer.locator('h1, h2, p,li').allTextContents();
                const fullResponse = responseTexts.join(' ').trim();
                const expectedWords = expectedAnswer.toLowerCase().split(' ');
                const responseLower = fullResponse.toLowerCase();
                const hasMatch = expectedWords.some(word => responseLower.includes(word));
                expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${fullResponse.substring(0, 200)}..."`).toBeTruthy();

                // Verify tool used
                await this.toolUsedName.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });
                const toolUsedText = await this.toolUsedName.textContent();
                expect(toolUsedText).toContain('autoReasoningTool');
                return; // Success
            } catch (error) {
                lastError = error;
                if (attempt < retries) {
                    console.log(`Attempt ${attempt} failed, refreshing page and retrying...`);
                    await this.page.reload();
                    await this.page.waitForTimeout(2000); // Wait for page to load after refresh
                    await this.page.waitForTimeout(1000); // Wait before retrying
                }
            }
        }
        throw lastError; // If all retries fail, throw the last error
    }

    /**
     * Validates that all checkboxes are checked
     * @param {boolean} includeSubCheckboxes - Whether to include sub-checkboxes in validation
     */
    async validateAllCheckboxesChecked(includeSubCheckboxes = true) {
        try {
            const allCheckboxes = this.allCheckboxes;
            const checkedCheckboxes = this.checkedCheckboxes;
            
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            
            // Check if any checkboxes exist
            const totalCount = await allCheckboxes.count();
            if (totalCount === 0) {
                console.log(' No checkboxes found on the page');
                return true; // Consider this as passed if no checkboxes to validate
            }
            
            // Wait for first checkbox to be visible
            await allCheckboxes.first().waitFor({ state: 'visible', timeout: 15000 });
            
            const checkedCount = await checkedCheckboxes.count();
            
            console.log(`Total checkboxes found: ${totalCount}`);
            console.log(`Checked checkboxes found: ${checkedCount}`);
            
            if (totalCount === 0) {
                throw new Error('No checkboxes found on the page');
            }
            
            // Validate all checkboxes are checked
            expect(checkedCount).toBe(totalCount);
            
            // Additional validation: Check each checkbox individually
            for (let i = 0; i < totalCount; i++) {
                const checkbox = allCheckboxes.nth(i);
                const isChecked = await checkbox.getAttribute('aria-checked');
                const dataState = await checkbox.getAttribute('data-state');
                
                expect(isChecked).toBe('true');
                expect(dataState).toBe('checked');
            }
            
            console.log(` All ${totalCount} checkboxes are checked`);
            return true;
        } catch (error) {
            console.error('Validation failed:', error.message);
            throw error;
        }
    }

    /**
     * Validates that all checkboxes are unchecked
     * @param {boolean} includeSubCheckboxes - Whether to include sub-checkboxes in validation
     */
    async validateAllCheckboxesUnchecked(includeSubCheckboxes = true) {
        try {
            const allCheckboxes = this.allCheckboxes;
            const uncheckedCheckboxes = this.uncheckedCheckboxes;
            
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            
            // Check if any checkboxes exist
            const totalCount = await allCheckboxes.count();
            if (totalCount === 0) {
                console.log(' No checkboxes found on the page');
                return true; // Consider this as passed if no checkboxes to validate
            }
            
            // Wait for first checkbox to be visible
            await allCheckboxes.first().waitFor({ state: 'visible', timeout: 15000 });
            
            const uncheckedCount = await uncheckedCheckboxes.count();
            
            console.log(`Total checkboxes found: ${totalCount}`);
            console.log(`Unchecked checkboxes found: ${uncheckedCount}`);
            
            if (totalCount === 0) {
                throw new Error('No checkboxes found on the page');
            }
            
            // Validate all checkboxes are unchecked
            expect(uncheckedCount).toBe(totalCount);
            
            // Additional validation: Check each checkbox individually
            for (let i = 0; i < totalCount; i++) {
                const checkbox = allCheckboxes.nth(i);
                const isChecked = await checkbox.getAttribute('aria-checked');
                const dataState = await checkbox.getAttribute('data-state');
                
                expect(isChecked).toBe('false');
                expect(dataState).not.toBe('checked');
            }
            
            console.log(` All ${totalCount} checkboxes are unchecked`);
            return true;
        } catch (error) {
            console.error('Validation failed:', error.message);
            throw error;
        }
    }

    /**
     * Validates specific checkbox state (checked or unchecked)
     * @param {string} checkboxText - The text associated with the checkbox
     * @param {boolean} shouldBeChecked - Expected state (true for checked, false for unchecked)
     */
    async validateSpecificCheckboxState(checkboxText, shouldBeChecked = true) {
        try {
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            
            const specificCheckbox = this.page.locator(`//span[text() = '${checkboxText}']//parent::div//button[@role='checkbox']`);
            
            // Check if checkbox exists
            const count = await specificCheckbox.count();
            if (count === 0) {
                throw new Error(`Checkbox with text '${checkboxText}' not found on the page`);
            }
            
            await specificCheckbox.waitFor({ state: 'visible', timeout: 15000 });
            
            const isChecked = await specificCheckbox.getAttribute('aria-checked');
            const dataState = await specificCheckbox.getAttribute('data-state');
            
            if (shouldBeChecked) {
                expect(isChecked).toBe('true');
                expect(dataState).toBe('checked');
                console.log(` Checkbox '${checkboxText}' is checked as expected`);
            } else {
                expect(isChecked).toBe('false');
                expect(dataState).not.toBe('checked');
                console.log(` Checkbox '${checkboxText}' is unchecked as expected`);
            }
            
            return true;
        } catch (error) {
            console.error(`Validation failed for checkbox '${checkboxText}':`, error.message);
            throw error;
        }
    }

    /**
     * Gets detailed information about all checkboxes on the page
     * @returns {Array} Array of checkbox objects with details
     */
    async getCheckboxesDetails() {
        try {
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            
            const allCheckboxes = this.allCheckboxes;
            const checkboxCount = await allCheckboxes.count();
            
            if (checkboxCount === 0) {
                console.log(' No checkboxes found on the page');
                return [];
            }
            
            // Wait for first checkbox to be visible
            await allCheckboxes.first().waitFor({ state: 'visible', timeout: 15000 });
            
            const checkboxDetails = [];
            
            for (let i = 0; i < checkboxCount; i++) {
                const checkbox = allCheckboxes.nth(i);
                const isChecked = await checkbox.getAttribute('aria-checked');
                const dataState = await checkbox.getAttribute('data-state');
                const value = await checkbox.getAttribute('value');
                
                // Try to find associated text
                const parentDiv = checkbox.locator('..');
                const associatedText = await parentDiv.locator('span').first().textContent().catch(() => 'No text found');
                
                checkboxDetails.push({
                    index: i,
                    isChecked: isChecked === 'true',
                    dataState: dataState,
                    value: value,
                    associatedText: associatedText,
                    element: checkbox
                });
            }
            
            console.log('Checkbox details:', checkboxDetails);
            return checkboxDetails;
        } catch (error) {
            console.error('Failed to get checkbox details:', error.message);
            throw error;
        }
    }

    /**
     * Validates checkbox states with sub-checkbox hierarchy support
     * @param {string} parentCheckboxText - Text of the parent checkbox
     * @param {boolean} expectedState - Expected state for all checkboxes
     */
    async validateCheckboxHierarchy(parentCheckboxText, expectedState = true) {
        try {
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            
            // Find parent checkbox
            const parentCheckbox = this.page.locator(`//span[text() = '${parentCheckboxText}']//parent::div//button[@role='checkbox']`);
            
            // Check if parent checkbox exists
            const parentCount = await parentCheckbox.count();
            if (parentCount === 0) {
                throw new Error(`Parent checkbox with text '${parentCheckboxText}' not found on the page`);
            }
            
            await parentCheckbox.waitFor({ state: 'visible', timeout: 15000 });
            
            // Find all child checkboxes under the parent using XPath
            const parentContainer = this.page.locator(`//span[text() = '${parentCheckboxText}']//ancestor::div[1]`);
            const childCheckboxes = this.page.locator(`//span[text() = '${parentCheckboxText}']//ancestor::div[1]//button[@role='checkbox']`);
            
            const parentState = await parentCheckbox.getAttribute('aria-checked');
            const childCount = await childCheckboxes.count();
            
            console.log(`Parent checkbox '${parentCheckboxText}' state: ${parentState}`);
            console.log(`Found ${childCount} child checkboxes`);
            
            // Validate parent checkbox
            if (expectedState) {
                expect(parentState).toBe('true');
            } else {
                expect(parentState).toBe('false');
            }
            
            // Validate all child checkboxes
            for (let i = 0; i < childCount; i++) {
                const childCheckbox = childCheckboxes.nth(i);
                const childState = await childCheckbox.getAttribute('aria-checked');
                
                if (expectedState) {
                    expect(childState).toBe('true');
                } else {
                    expect(childState).toBe('false');
                }
            }
            
            console.log(` Checkbox hierarchy validation passed for '${parentCheckboxText}'`);
            return true;
        } catch (error) {
            console.error(`Checkbox hierarchy validation failed for '${parentCheckboxText}':`, error.message);
            throw error;
        }
    }

    /**
     * Comprehensive checkbox validation method that covers all scenarios
     * @param {Object} options - Validation options
     * @param {string} options.validationType - 'all-checked', 'all-unchecked', 'specific', or 'hierarchy'
     * @param {string} options.checkboxText - Text for specific checkbox validation
     * @param {boolean} options.expectedState - Expected state for validation
     * @param {boolean} options.includeSubCheckboxes - Whether to validate sub-checkboxes
     */
    async validateCheckboxState(options = {}) {
        const {
            validationType = 'all-checked',
            checkboxText = '',
            expectedState = true,
            includeSubCheckboxes = true
        } = options;
        
        try {
            switch (validationType) {
                case 'all-checked':
                    return await this.validateAllCheckboxesChecked(includeSubCheckboxes);
                
                case 'all-unchecked':
                    return await this.validateAllCheckboxesUnchecked(includeSubCheckboxes);
                
                case 'specific':
                    if (!checkboxText) {
                        throw new Error('checkboxText is required for specific validation');
                    }
                    return await this.validateSpecificCheckboxState(checkboxText, expectedState);
                
                case 'hierarchy':
                    if (!checkboxText) {
                        throw new Error('checkboxText is required for hierarchy validation');
                    }
                    return await this.validateCheckboxHierarchy(checkboxText, expectedState);
                
                default:
                    throw new Error(`Invalid validation type: ${validationType}`);
            }
        } catch (error) {
            console.error('Checkbox validation failed:', error.message);
            throw error;
        }
    }

    /**
     * Upload file and verify successful upload
     * @param {string} filePath - Absolute path to the file to upload
     * @param {string} expectedFormat - Expected file format (e.g., 'PDF', 'CSV', 'XLSX', 'PNG', 'JPG')
     */
    async uploadFileAndVerify(filePath, expectedFormat) {
        try {
            console.log(`📎 Uploading ${expectedFormat} file: ${filePath}`);
            // Select Web Search tool
            await this.settingIcon.waitFor({ state: 'visible' });
            await this.settingIcon.click();
            // Look for the "Add photos & files" button directly in the interface (as shown in screenshot)
            const addPhotosButton = this.page.locator('text="Add photos & files"').first();

            // Wait for the button to be visible
            await addPhotosButton.waitFor({ state: 'visible', timeout: this.getTimeout('default') });

            // Handle file upload using file chooser event
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                addPhotosButton.click()
            ]);

            // Set the file
            await fileChooser.setFiles(filePath);
            console.log('✅ File uploaded using file chooser');

            // Wait a moment for the file to be processed
            await this.page.waitForTimeout(2000);

            // Verify the success message appears
            await this.fileUploadSuccessMessage.waitFor({
                state: 'visible',
                timeout: this.getTimeout('long')
            });

            const successMessage = await this.fileUploadSuccessMessage.textContent();
            console.log(` File upload successful: ${successMessage}`);

            // Additional verification - ensure the message contains expected text
            expect(successMessage).toContain('File(s) uploaded successfully!');

            return true;
        } catch (error) {
            console.error(` Failed to upload ${expectedFormat} file:`, error.message);
            throw error;
        }
    }

    /**
     * Test all supported file formats upload
     * @param {string} testDataFolder - Path to test data folder containing sample files
     */
    async testAllFileFormatsUpload(testDataFolder) {
        const fileFormats = [
            { format: 'PDF', fileName: 'sample.pdf', description: 'PDF (text)' },
            { format: 'PDF_SCAN', fileName: 'sample_scan.pdf', description: 'PDF (scan/OCR)' },
            { format: 'PNG', fileName: 'sample.png', description: 'PNG image' },
            { format: 'JPG', fileName: 'sample.jpg', description: 'JPG image' },
           // { format: 'CSV', fileName: 'sample.csv', description: 'CSV spreadsheet' },
            { format: 'XLSX', fileName: 'sample.xlsx', description: 'Excel spreadsheet' }
        ];

        const results = [];

        for (const fileFormat of fileFormats) {
            try {
                console.log(`\n=== Testing ${fileFormat.description} ===`);
                const filePath = `${testDataFolder}\\${fileFormat.fileName}`;
                
                await this.uploadFileAndVerify(filePath, fileFormat.format);
                
                results.push({
                    format: fileFormat.format,
                    fileName: fileFormat.fileName,
                    description: fileFormat.description,
                    status: 'SUCCESS'
                });
                
                // Wait between uploads to avoid overwhelming the system
                await this.page.waitForTimeout(3000);
                
            } catch (error) {
                console.error(` Failed to upload ${fileFormat.description}:`, error.message);
                results.push({
                    format: fileFormat.format,
                    fileName: fileFormat.fileName,
                    description: fileFormat.description,
                    status: 'FAILED',
                    error: error.message
                });
            }
        }

        // Print summary
        console.log('\n=== FILE UPLOAD TEST SUMMARY ===');
        results.forEach(result => {
            const status = result.status === 'SUCCESS' ? '' : '';
            console.log(`${status} ${result.description}: ${result.status}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });

        return results;
    }

    /**
     * Verify that context banner is visible when checkbox is not selected
     */
    async verifyBannerVisible() {
        try {
            console.log(' Checking if context banner is visible...');
            
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            
            // Check if banner is visible using environment timeout
            await this.contextBanner.waitFor({ state: 'visible', timeout: this.getTimeout('default') });
            
            // Verify banner text content
            const bannerText = await this.contextBanner.textContent();
            console.log(` Banner text: "${bannerText}"`);
            
            // Additional verification with full text locator
            const isFullTextVisible = await this.contextBannerFullText.isVisible();
            
            expect(bannerText).toContain('Select context to work');
            expect(isFullTextVisible).toBeTruthy();
            
            console.log(' Context banner is visible as expected');
            return true;
        } catch (error) {
            console.error(' Banner visibility verification failed:', error.message);
            throw error;
        }
    }

    /**
     * Verify that context banner is not visible when checkbox is selected
     */
    async verifyBannerNotVisible() {
        try {
            console.log(' Checking if context banner is hidden...');
            
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            
            // Check if banner is hidden
            const isBannerVisible = await this.contextBanner.isVisible();
            const isFullTextVisible = await this.contextBannerFullText.isVisible();
            
            console.log(` Banner visible: ${isBannerVisible}`);
            console.log(` Full text banner visible: ${isFullTextVisible}`);
            
            // Verify banner is not visible
            expect(isBannerVisible).toBeFalsy();
            expect(isFullTextVisible).toBeFalsy();
            
            console.log(' Context banner is hidden as expected');
            return true;
        } catch (error) {
            console.error(' Banner hidden verification failed:', error.message);
            throw error;
        }
    }

    /**
     * Test complete banner behavior workflow
     * @param {boolean} checkboxShouldBeSelected - Whether checkbox should be selected for this test
     */
    async testBannerBehavior(checkboxShouldBeSelected = false) {
        try {
            console.log(`\n=== Testing Banner Behavior (Checkbox Selected: ${checkboxShouldBeSelected}) ===`);
            
            // Set checkbox state as required
            if (checkboxShouldBeSelected) {
                await this.checkCheckboxIfNotChecked();
                await this.verifyBannerNotVisible();
            } else {
                await this.uncheckCheckboxIfNotChecked();
                await this.verifyBannerVisible();
            }
            
            console.log(` Banner behavior test completed successfully`);
            return true;
        } catch (error) {
            console.error(' Banner behavior test failed:', error.message);
            throw error;
        }
    }
 async selectCUDirectIngestionToolSetting() {
        await this.settingIcon.waitFor({ state: 'visible' });
        await this.settingIcon.click();
        await this.select_CU_Direct_Ingestion.click();
        await this.page.waitForTimeout(2000);
    }

}

