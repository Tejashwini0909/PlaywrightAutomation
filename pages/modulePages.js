import { Page, expect } from '@playwright/test';

export class ModulePages {

    constructor(page) {
        this.page = page;
        this.btnContinueWithGoogle = page.locator("//button[text() = 'Continue with Google']");
        this.iptEmail = page.locator("//input[@aria-label='Email or phone']");
        this.btnNext = page.locator("(//span[text() = 'Next'])[last()]");
        this.iptPassword = page.locator("//input[@aria-label='Enter your password']");
        this.moduleDrpDown = page.locator("(//button[@aria-haspopup='menu'])[last()]");

        this.messageBox = page.locator("//textarea[@placeholder ='Send a message...']");
        this.messageSend = page.locator("//div[contains(@class, 'justify-end')]");
 this.stopbtn = page.locator("//div[contains(@class, 'justify-end')]//*[@fill-rule='evenodd' and @clip-rule='evenodd' ]");

    }
 
    async selectModule(moduleName) {
        await this.page.waitForLoadState('networkidle');
        // Click the dropdown button
        await this.moduleDrpDown.waitFor({ state: 'visible' });
        await this.moduleDrpDown.hover();
        await this.moduleDrpDown.click();
        // Select the module by name
        await this.page.waitForSelector(`//div[@role='menuitem']//span[text() = '${moduleName}']`, { state: 'visible' });
        await this.page.waitForTimeout(1000); // Wait for the dropdown to be populated
        await this.page.locator(`//div[@role='menuitem']//span[text() = '${moduleName}']`).hover();
        await this.page.locator(`//div[@role='menuitem']//span[text() = '${moduleName}']`).click();
        await this.page.waitForTimeout(2000); // Wait for the module to be selected
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
        await this.page.waitForTimeout(5000*3); // Wait for the response to be generated       
        const assistantContainer = this.page.locator("//div[@data-role='assistant']");
        const responseTexts = await assistantContainer.locator('h1, h2, p,li').allTextContents();
        const fullResponse = responseTexts.join(' ').trim();
        expect(fullResponse).toContain(expectedAnswer);
    }


}