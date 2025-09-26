import { Page, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export class LoginPage {
    page;
    btnContinueWithGoogle;
    iptEmail;
    btnNext;
    iptPassword;

    constructor(page) {
        this.page = page;
        this.btnContinueWithGoogle = page.locator("//button[text() = 'Continue with Google']");
        this.iptEmail = page.locator("//input[@aria-label='Email or phone']");
        this.btnNext = page.locator("(//span[text() = 'Next'])[last()]");
        this.iptPassword = page.locator("//input[@aria-label='Enter your password']");
    }

    /**
     * Logs in with Google using credentials from .env by default.
     * @param {string} [email] - Optional email, defaults to QA_USERNAME from .env
     * @param {string} [password] - Optional password, defaults to QA_PASSWORD from .env
     */
    async loginWithGoogle(email = process.env.QA_USERNAME, password = process.env.QA_PASSWORD) {
        try {
            console.log('🚀 Starting login process...');
            
            // Navigate to the application
            await this.page.goto(process.env.STAGE_ENV);
            console.log('✅ Navigated to staging environment');
            
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle', { timeout: 15000 });
            console.log('✅ Page load completed');
            
            // Wait for and click Google login button
            await this.btnContinueWithGoogle.waitFor({ state: 'visible', timeout: 10000 });
            await this.btnContinueWithGoogle.click();
            console.log('✅ Clicked Continue with Google');
            
            // Handle email input
            await this.iptEmail.waitFor({ state: 'visible', timeout: 10000 });
            await this.iptEmail.fill(email);
            console.log('✅ Filled email address');
            
            // Click Next after email
            await this.btnNext.click();
            console.log('✅ Clicked Next after email');
            
            // Handle password input
            await this.iptPassword.waitFor({ state: 'visible', timeout: 10000 });
            await this.iptPassword.fill(password);
            console.log('✅ Filled password');
            
            // Click Next after password
            await this.btnNext.click();
            console.log('✅ Clicked Next after password');
            
            // Wait for login to complete
            await this.page.waitForLoadState('networkidle', { timeout: 15000 });
            console.log('✅ Login completed successfully');
            
        } catch (error) {
            console.error('❌ Login failed:', error.message);
            console.error('📍 Current URL:', this.page.url());
            throw new Error(`Login failed: ${error.message}`);
        }
    }
}