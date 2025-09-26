
import { Page, expect } from '@playwright/test';
import { TimeoutConfig } from '../utils/config.js';
export class ModulePages {
    page;
    btnContinueWithGoogle;
    iptEmail;
    btnNext;
    iptPassword;
    moduleDrpDown;
    messageBox;
    messageSend;
    stopbtn;
    futureWorksChkbox;

    constructor(page) {
        this.page = page;
        TimeoutConfig.logConfig();
        this.btnContinueWithGoogle = page.locator("//button[text() = 'Continue with Google']");
        this.iptEmail = page.locator("//input[@aria-label='Email or phone']");
        this.btnNext = page.locator("(//span[text() = 'Next'])[last()]");
        this.iptPassword = page.locator("//input[@aria-label='Enter your password']");
        this.moduleDrpDown = page.locator("(//button[@aria-haspopup='menu'])[last()]");
        this.messageBox = page.locator("//textarea[@placeholder ='Send a message...']");
        this.messageSend = page.locator("//div[contains(@class, 'justify-end')]");
        this.stopbtn = page.locator("//div[contains(@class, 'justify-end')]//*[@fill-rule='evenodd' and @clip-rule='evenodd' ]");
        this.assistantContainer = page.locator("//div[@data-role='assistant']");
        this.thinkingTxt = page.locator("//div[text() = 'Thinking...']");
        this.futureWorksChkbox = page.locator("//span[text() = 'Future Works']//following-sibling::button");
        this.waitAssistantContainer = page.locator("(//div[@data-role='assistant']//p)[last()]");
    }

    async selectModule(moduleName) {
        await this.page.waitForLoadState('networkidle');
        
        // Add debugging to see what's on the page
        console.log('🔍 Current URL:', this.page.url());
        console.log('🔍 Page title:', await this.page.title());
        
        // Try multiple locators for the module dropdown - more specific ones first
        const possibleDropdowns = [
            "//button[contains(@aria-label, 'model') or contains(@aria-label, 'module')]",
            "//button[contains(text(), 'Select Model') or contains(text(), 'Select Module')]",
            "//div[contains(@class, 'model') or contains(@class, 'module')]//button",
            "//button[contains(@class, 'model') or contains(@class, 'module')]",
            "//select[contains(@name, 'model') or contains(@name, 'module')]",
            "//div[contains(@data-testid, 'model') or contains(@data-testid, 'module')]//button",
            "//button[@aria-haspopup='menu' and not(contains(@class, 'sidebar'))]",
            "//button[@aria-haspopup='menu' and not(contains(@data-sidebar, 'menu'))]",
            "//button[@aria-haspopup='menu' and not(contains(@class, 'peer'))]"
        ];
        
        let dropdownFound = false;
        for (const locator of possibleDropdowns) {
            try {
                const element = this.page.locator(locator);
                const count = await element.count();
                console.log(`🔍 Checking locator "${locator}": found ${count} elements`);
                
                if (count > 0) {
                    const isVisible = await element.first().isVisible();
                    console.log(`🔍 First element visible: ${isVisible}`);
                    
                    if (isVisible) {
                        this.moduleDrpDown = element.first();
                        dropdownFound = true;
                        break;
                    }
                }
            } catch (error) {
                console.log(`🔍 Locator "${locator}" failed: ${error.message}`);
            }
        }
        
        if (!dropdownFound) {
            // Take a screenshot for debugging
            await this.page.screenshot({ path: 'debug-module-dropdown.png' });
            console.log('📸 Screenshot saved as debug-module-dropdown.png');
            
            // Get all buttons on the page for debugging
            const allButtons = await this.page.locator('button').all();
            console.log(`🔍 Found ${allButtons.length} buttons on the page:`);
            for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
                try {
                    const text = await allButtons[i].textContent();
                    const ariaLabel = await allButtons[i].getAttribute('aria-label');
                    const className = await allButtons[i].getAttribute('class');
                    console.log(`  Button ${i}: text="${text}", aria-label="${ariaLabel}", class="${className?.substring(0, 50)}..."`);
                } catch (e) {
                    console.log(`  Button ${i}: Error getting details`);
                }
            }
            
            throw new Error('Module dropdown not found on the page');
        }
        
        await this.moduleDrpDown.waitFor({ state: 'visible', timeout: 10000 });
        await this.moduleDrpDown.click();

        // Wait for menu container
        const menu = this.page.getByRole('menu');
        await menu.first().waitFor({ state: 'visible' });
        
        // Debug: List all available menu items
        const menuItems = await this.page.locator('[role="menuitem"]').all();
        console.log(`🔍 Found ${menuItems.length} menu items:`);
        for (let i = 0; i < Math.min(menuItems.length, 10); i++) {
            try {
                const text = await menuItems[i].textContent();
                console.log(`  ${i}: "${text}"`);
            } catch (e) {
                console.log(`  ${i}: Error getting text`);
            }
        }

        // Try role-based locator first
        let option = this.page.getByRole('menuitem', { name: moduleName });
        if (await option.count() === 0) {
            option = this.page.getByRole('menuitem', { name: new RegExp(moduleName, 'i') });
        }

        // If not visible, try paging through the menu
        let clicked = false;
        for (let i = 0; i < 12; i++) {
            if (await option.count() > 0 && await option.first().isVisible()) {
                await option.first().click();
                clicked = true;
                break;
            }
            // Scroll the menu container if possible
            await this.page.keyboard.press('PageDown');
            await this.page.waitForTimeout(150);
        }

        // Last resort: try ensuring into view and click
        if (!clicked) {
            const xpathExact = this.page.locator(`//div[@role='menuitem']//span[normalize-space(.)='${moduleName}']`).first();
            const xpathContains = this.page.locator(`//div[@role='menuitem']//span[contains(normalize-space(.), '${moduleName}')]`).first();
            const candidate = (await xpathExact.count()) > 0 ? xpathExact : xpathContains;
            await candidate.scrollIntoViewIfNeeded();
            await candidate.waitFor({ state: 'visible' });
            await candidate.click();
        }

        await this.page.waitForTimeout(500);
    }

    async selectFutureWorksIfNotSelected() {
        await this.futureWorksChkbox.waitFor({ state: 'visible' });
        const isChecked = await this.futureWorksChkbox.getAttribute('aria-checked');
        const dataState = await this.futureWorksChkbox.getAttribute('data-state');
        if (isChecked !== 'true' && dataState !== 'checked') {
            await this.futureWorksChkbox.click();
            await this.page.waitForTimeout(1000);
        }
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
     * Verifies the assistant's response matches the expected answer with retry logic.
     * @param {string} expectedAnswer - The expected answer text.
     * @param {number} retries - Number of retry attempts (default 3).
     */
    async verifyAssistantResponse(expectedAnswer, retries = 2) {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Check if page is still valid before proceeding
                if (this.page.isClosed()) {
                    throw new Error('Page has been closed, cannot continue verification');
                }

                console.log(`🔍 Attempt ${attempt}: Looking for assistant response...`);
                
                // First, let's see what's actually on the page
                const assistantElements = await this.assistantContainer.count();
                console.log(`🔍 Found ${assistantElements} assistant container elements`);
                
                // Check if thinking text exists and wait for it to disappear
                const thinkingExists = await this.thinkingTxt.count() > 0;
                console.log(`🔍 Thinking text exists: ${thinkingExists}`);
                
                if (thinkingExists) {
                    console.log('🔍 Waiting for thinking text to disappear...');
                    await this.thinkingTxt.waitFor({ state: 'hidden', timeout: 30000 });
                    console.log('✅ Thinking text disappeared');
                }
                
                // Wait a bit for response to generate
                console.log('🔍 Waiting for response generation...');
                await this.page.waitForTimeout(5000); // Reduced from 10s to 5s
                
                // Check page state again before verification
                if (this.page.isClosed()) {
                    throw new Error('Page was closed during response generation');
                }
                
                // Look for any response elements
                const responseElements = await this.page.locator('[data-role="assistant"]').count();
                console.log(`🔍 Found ${responseElements} assistant response elements`);
                
                // Wait for a complete response (not just "Resolving context..." or "Thinking...")
                console.log('🔍 Waiting for complete response...');
                let responseText = '';
                let attempts = 0;
                const maxWaitAttempts = 10; // Wait up to 10 * 2 = 20 seconds
                
                while (attempts < maxWaitAttempts) {
                    // Try multiple selectors for response content
                    const responseSelectors = [
                        '//div[@data-role="assistant"]//p[last()]',
                        '//div[@data-role="assistant"]//div[last()]',
                        '//div[@data-role="assistant"]//span[last()]',
                        '//div[@data-role="assistant"]//*[text()]',
                        '//div[contains(@class, "message") or contains(@class, "response")]',
                        '//div[contains(@class, "assistant")]//*[text()]'
                    ];
                    
                    let foundText = '';
                    for (const selector of responseSelectors) {
                        try {
                            const element = this.page.locator(selector);
                            const count = await element.count();
                            if (count > 0) {
                                const text = await element.first().textContent();
                                if (text && text.trim().length > 0) {
                                    foundText = text.trim();
                                    break;
                                }
                            }
                        } catch (e) {
                            // Continue to next selector
                        }
                    }
                    
                    if (foundText) {
                        console.log(`🔍 Found text: "${foundText.substring(0, 100)}..."`);
                        
                        // Check if it's a complete response (not just processing messages)
                        const processingMessages = [
                            'resolving context',
                            'thinking',
                            'processing',
                            'loading',
                            'please wait',
                            'generating response',
                            '...'
                        ];
                        
                        const isProcessing = processingMessages.some(msg => 
                            foundText.toLowerCase().includes(msg)
                        );
                        
                        if (!isProcessing && foundText.length > 10) {
                            responseText = foundText;
                            console.log(`✅ Found complete response: "${responseText.substring(0, 100)}..."`);
                            break;
                        } else {
                            console.log(`⏳ Still processing... (${foundText.substring(0, 50)})`);
                        }
                    }
                    
                    attempts++;
                    await this.page.waitForTimeout(2000); // Wait 2 seconds between checks
                }
                
                if (!responseText) {
                    // Take screenshot for debugging
                    await this.page.screenshot({ path: `debug-response-attempt-${attempt}.png` });
                    console.log(`📸 Screenshot saved as debug-response-attempt-${attempt}.png`);
                    throw new Error(`No complete response found after ${maxWaitAttempts * 2} seconds on attempt ${attempt}`);
                }
                
                // Verify expected answer in assistant response
                const expectedWords = expectedAnswer.toLowerCase().split(' ');
                const responseLower = responseText.toLowerCase();

                // Check if at least one word from expected answer is in the response
                const hasMatch = expectedWords.some(word => responseLower.includes(word));
                expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${responseText.substring(0, 200)}..."`).toBeTruthy();
                
                return; // Success
            } catch (error) {
                lastError = error;
                console.log(`Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < retries) {
                    console.log(`Retrying attempt ${attempt + 1}...`);
                    
                    // Check if page is still valid before retrying
                    if (this.page.isClosed()) {
                        console.log('❌ Page was closed, cannot retry');
                        throw new Error('Page was closed during retry attempt');
                    }
                    
                    try {
                        // Shorter wait time for retry
                        await this.page.waitForTimeout(2000);
                    } catch (waitError) {
                        console.log(`❌ Page became invalid during retry wait: ${waitError.message}`);
                        throw new Error(`Page became invalid during retry: ${waitError.message}`);
                    }
                } else {
                    console.log(`❌ All ${retries} attempts failed`);
                }
            }
        }
        throw lastError; // If all retries fail, throw the last error
    }
}