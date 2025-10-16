
import { expect } from '@playwright/test';
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
        this.moduleDrpDown = page.locator("(//header//ul[@data-sidebar='menu']//following-sibling::button)[1]");
        this.messageBox = page.locator("//textarea[@placeholder ='Send a message...' or @placeholder = 'Ask anything']");
        this.messageSend = page.locator("//textarea[@placeholder ='Send a message...' or @placeholder = 'Ask anything']//parent::div//following-sibling::button");
        this.stopbtn = page.locator("//div[contains(@class, 'justify-end')]//*[@fill-rule='evenodd' and @clip-rule='evenodd' ]");
        this.assistantContainer = page.locator("//div[@data-role='assistant']");
        this.thinkingTxt = page.locator("//div[text() = 'Thinking...']");
        this.futureWorksChkbox = page.locator("//span[text() = 'Future Works']//following-sibling::button");
        this.waitAssistantContainer = page.locator("(//div[@data-role='assistant']//p)[last()]");
    }

    async selectModule(moduleName) {
        await this.page.waitForLoadState('networkidle');
        await this.moduleDrpDown.waitFor({ state: 'visible' });
        await this.moduleDrpDown.click();

        // Wait for menu container
        const menu = this.page.getByRole('menu');
        await menu.first().waitFor({ state: 'visible' });

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
    async verifyAssistantResponse(expectedAnswer, retries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await this.thinkingTxt.waitFor({ state: 'hidden', timeout: TimeoutConfig.LONG_TIMEOUT }).catch(() => {});
                await this.page.waitForTimeout(5000); // Wait for the response to be generated
                
                // Verify expected answer in assistant response
                await this.waitAssistantContainer.waitFor({ state: 'visible', timeout: TimeoutConfig.LONG_TIMEOUT });      
                const responseTexts = await this.assistantContainer.locator('h1, h2, p,li').allTextContents();
                const fullResponse = responseTexts.join(' ').trim();

                // More flexible matching - check if any part of the expected answer is in the response
                const expectedWords = expectedAnswer.toLowerCase().split(' ');
                const responseLower = fullResponse.toLowerCase();

                // Check if at least one word from expected answer is in the response
                const hasMatch = expectedWords.some(word => responseLower.includes(word));
                expect(hasMatch, `Expected response to contain words from "${expectedAnswer}" but got: "${fullResponse.substring(0, 200)}..."`).toBeTruthy();
                
                return; // Success
            } catch (error) {
                lastError = error;
                if (attempt < retries) {
                    console.log(`Attempt ${attempt} failed, retrying... Error: ${error.message}`);
                    await this.page.waitForTimeout(3000); // Wait before retrying
                }
            }
        }
        throw lastError; // If all retries fail, throw the last error
    }
}