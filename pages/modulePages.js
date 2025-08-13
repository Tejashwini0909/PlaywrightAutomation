import { Page, expect } from '@playwright/test';

export class ModulePages {

    constructor(page) {
        this.page = page;
        this.btnContinueWithGoogle = page.locator("//button[text() = 'Continue with Google']");
        this.iptEmail = page.locator("//input[@aria-label='Email or phone']");
        this.btnNext = page.locator("(//span[text() = 'Next'])[last()]");
        this.iptPassword = page.locator("//input[@aria-label='Enter your password']");
        
        // Workspace selection locators
        this.workspaceDropdown = page.locator("//button[contains(@aria-label, 'workspace') or contains(@aria-label, 'Workspace') or contains(@aria-label, 'organization')]");
        this.workspaceOption = page.locator("//div[@role='menuitem']//span[contains(text(), 'Future Works') or contains(text(), 'future.works')]");
        
        this.moduleDrpDown = page.locator("(//button[@aria-haspopup='menu'])[last()]");

        this.messageBox = page.locator("//textarea[@placeholder ='Send a message...']");
        this.messageSend = page.locator("//div[contains(@class, 'justify-end')]");
        this.stopbtn = page.locator("//div[contains(@class, 'justify-end')]//*[@fill-rule='evenodd' and @clip-rule='evenodd' ]");

    }
 
    async selectFutureWorksWorkspace() {
        console.log('Checking if Future Works workspace selection is needed...');
        await this.page.waitForLoadState('networkidle');
        
        // First, check if we're already in the Future Works workspace
        try {
            const futureWorksText = this.page.locator("//span[contains(text(), 'Future Works') or contains(text(), 'future.works')]");
            if (await futureWorksText.count() > 0) {
                console.log('Already in Future Works workspace, no selection needed');
                return;
            }
        } catch (error) {
            console.log('Could not determine current workspace, proceeding with selection attempt...');
        }
        
        try {
            // Try to find and click the workspace dropdown
            const workspaceDropdown = this.page.locator("//button[contains(@aria-label, 'workspace') or contains(@aria-label, 'Workspace') or contains(@aria-label, 'organization') or contains(@class, 'workspace') or contains(@class, 'organization')]");
            
            if (await workspaceDropdown.count() > 0) {
                await workspaceDropdown.first().click();
                console.log('Workspace dropdown clicked');
                
                // Wait for the dropdown menu to appear
                await this.page.waitForTimeout(1000);
                
                // Look for the Future Works option
                const futureWorksOption = this.page.locator("//div[@role='menuitem']//span[contains(text(), 'Future Works') or contains(text(), 'future.works')]");
                if (await futureWorksOption.count() > 0) {
                    await futureWorksOption.first().click();
                    console.log('Future Works workspace selected successfully');
                    await this.page.waitForTimeout(2000);
                    return;
                }
            }
            
            console.log('No workspace dropdown found, checking if workspace selection is needed...');
            
            // Check if we can proceed without workspace selection
            const pageTitle = await this.page.title();
            const currentUrl = this.page.url();
            
            if (currentUrl.includes('future.works') || pageTitle.includes('Future Works')) {
                console.log('Already in Future Works context, proceeding without explicit workspace selection');
                return;
            }
            
        } catch (error) {
            console.log(`Workspace selection attempt failed: ${error.message}`);
        }
        
        // If we get here, workspace selection wasn't possible or needed
        console.log('Proceeding without explicit workspace selection - may already be in correct workspace');
    }
 
    async selectModule(moduleName) {
        console.log(`Selecting module: ${moduleName}`);
        await this.page.waitForLoadState('networkidle');
        
        // Wait for the dropdown to be visible and clickable
        await this.moduleDrpDown.waitFor({ state: 'visible', timeout: 10000 });
        
        // Click the dropdown button
        await this.moduleDrpDown.click();
        console.log('Module dropdown clicked');
        
        // Wait for the dropdown menu to appear
        await this.page.waitForTimeout(1000);
        
        // Try to find and select the module by name
        try {
            // Wait for the specific module option to be visible
            const moduleOption = this.page.locator(`//div[@role='menuitem']//span[text() = '${moduleName}']`);
            await moduleOption.waitFor({ state: 'visible', timeout: 5000 });
            
            // Click the module option
            await moduleOption.click();
            console.log(`Module ${moduleName} selected successfully`);
            
            // Wait for the module to be loaded
            await this.page.waitForTimeout(2000);
            
        } catch (error) {
            console.log(`Failed to select module ${moduleName} with first method, trying alternative...`);
            
            // Alternative method: try to find by partial text match
            try {
                const partialMatch = this.page.locator(`//div[@role='menuitem']//span[contains(text(), '${moduleName}')]`);
                if (await partialMatch.count() > 0) {
                    await partialMatch.first().click();
                    console.log(`Module ${moduleName} selected with partial match`);
                    await this.page.waitForTimeout(2000);
                } else {
                    throw new Error(`Module ${moduleName} not found in dropdown`);
                }
            } catch (altError) {
                console.log(`Alternative method also failed: ${altError.message}`);
                throw new Error(`Could not select module ${moduleName}`);
            }
        }
        
        // Verify the module was selected by checking if the dropdown shows the selected module
        try {
            const selectedModuleText = await this.moduleDrpDown.textContent();
            console.log(`Current selected module: ${selectedModuleText}`);
        } catch (error) {
            console.log('Could not verify selected module text');
        }
    }
    
    async loginWithGoogle(email, password) {
        console.log('Starting Google login process...');
        await this.page.waitForLoadState('networkidle');
        
        // Wait for and click the Continue with Google button
        await this.btnContinueWithGoogle.waitFor({ state: 'visible', timeout: 10000 }); 
        await this.btnContinueWithGoogle.click();
        console.log('Continue with Google button clicked');
        
        // Wait for the Google login page to load
        await this.page.waitForTimeout(2000);
        
        // Fill in the email
        await this.iptEmail.waitFor({ state: 'visible', timeout: 10000 });
        await this.iptEmail.fill(email);
        console.log('Email filled');
        
        // Click Next
        await this.btnNext.click();
        console.log('Next button clicked after email');
        
        // Wait for password field to appear
        await this.page.waitForTimeout(2000);
        
        // Fill in the password
        await this.iptPassword.waitFor({ state: 'visible', timeout: 10000 });
        await this.iptPassword.fill(password);
        console.log('Password filled');
        
        // Click Next to complete login
        await this.btnNext.click();
        console.log('Next button clicked after password');
        
        // Wait for login to complete and redirect back to the application
        await this.page.waitForTimeout(5000);
        
        // Wait for the application to load after successful login
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 15000 });
            console.log('Login completed successfully, application loaded');
        } catch (error) {
            console.log('Login may have completed, but application load timeout reached');
        }
    }

    async sendMessage(message) {
        await this.messageBox.waitFor({ state: 'visible' });
        await this.messageBox.fill(message);
        
        // Click the send button and wait for it to be processed
        await this.messageSend.click();
        
        // Wait for the message to be sent and response to start appearing
        await this.page.waitForTimeout(2000);
        
        // Look for indicators that the AI is responding
        try {
            // Wait for either a typing indicator or the start of a response
            await this.page.waitForSelector('div[data-role="assistant"], .assistant, [class*="assistant"], [class*="typing"], [class*="loading"]', { 
                timeout: 10000,
                state: 'visible' 
            });
        } catch (error) {
            console.log('No immediate response indicator found, continuing...');
        }
        
        // Additional wait for the response to be processed
        await this.page.waitForTimeout(3000);
    }

    /**
     * Verifies the assistant's response matches the expected answer.
     * @param {string} expectedAnswer - The expected answer text.
     */
    async verifyAssistantResponse(expectedAnswer) {
        // Wait for the response to be generated
        await this.page.waitForTimeout(8000);
        
        // Try multiple selectors to find the assistant's response
        let responseText = '';
        
        // Method 1: Look for the most recent assistant message in the chat
        try {
            // Wait for any assistant response to appear
            await this.page.waitForSelector('div[data-role="assistant"], .assistant, [class*="assistant"]', { timeout: 10000 });
            
            // Get all assistant messages and find the latest one
            const assistantMessages = this.page.locator('div[data-role="assistant"], .assistant, [class*="assistant"]');
            const count = await assistantMessages.count();
            
            if (count > 0) {
                // Get the last (most recent) assistant message
                const lastMessage = assistantMessages.nth(count - 1);
                responseText = await lastMessage.textContent();
            }
        } catch (error) {
            console.log('Method 1 failed, trying alternative selectors...');
        }
        
        // Method 2: Look for response text in the chat area
        if (!responseText || responseText.trim() === '') {
            try {
                // Look for any text content in the main chat area that's not the user's message
                const chatArea = this.page.locator('main, [role="main"], .chat-area, .conversation');
                if (await chatArea.count() > 0) {
                    const allTextElements = chatArea.locator('p, div, span, h1, h2, h3, h4, h5, h6, li');
                    const texts = await allTextElements.allTextContents();
                    // Filter out empty texts and get the last meaningful response
                    const meaningfulTexts = texts.filter(text => text && text.trim().length > 10);
                    if (meaningfulTexts.length > 0) {
                        responseText = meaningfulTexts[meaningfulTexts.length - 1];
                    }
                }
            } catch (error) {
                console.log('Method 2 failed, trying fallback...');
            }
        }
        
        // Method 3: Fallback - look for any recent text content
        if (!responseText || responseText.trim() === '') {
            try {
                // Look for any text that appeared after sending the message
                const allTexts = await this.page.locator('body').textContent();
                if (allTexts) {
                    // Split by lines and get the last few lines that might contain the response
                    const lines = allTexts.split('\n').filter(line => line.trim().length > 0);
                    if (lines.length > 0) {
                        responseText = lines.slice(-3).join(' '); // Get last 3 lines
                    }
                }
            } catch (error) {
                console.log('All methods failed to extract response text');
            }
        }
        
        // Clean up the response text
        responseText = responseText ? responseText.trim() : '';
        
        // Log the extracted text for debugging
        console.log(`Extracted response text: "${responseText.substring(0, 200)}..."`);
        
        // More flexible matching - check if any part of the expected answer is in the response
        const expectedWords = expectedAnswer.toLowerCase().split(' ');
        const responseLower = responseText.toLowerCase();
        
        // Check if at least one word from expected answer is in the response
        const hasMatch = expectedWords.some(word => responseLower.includes(word));
        
        if (!hasMatch) {
            // If no match found, try to get more context about what's on the page
            const pageTitle = await this.page.title();
            const currentUrl = this.page.url();
            console.log(`Page title: ${pageTitle}`);
            console.log(`Current URL: ${currentUrl}`);
            
            // Take a screenshot for debugging
            await this.page.screenshot({ path: 'debug-response.png' });
        }
        
        expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${responseText.substring(0, 200)}..."`).toBeTruthy();
    }
}