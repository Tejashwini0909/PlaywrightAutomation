import { expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export class LoginPage {
    page;
    btnContinueWithGoogle;
    iptEmail;
    btnNext;
    iptPassword;
    
    // Additional selectors for handling various Google auth scenarios
    btnTryAnotherWay;
    btnSkip;
    btnYes;
    btnContinue;
    accountSelector;
    // Alternative email selectors
    iptEmailAlt1;
    iptEmailAlt2;

    constructor(page) {
        this.page = page;
        
        // Multiple selectors for Google login button
        this.btnContinueWithGoogle = page.locator("//button[text() = 'Continue with Google']");
        this.btnContinueWithGoogleAlt1 = page.locator("//button[contains(text(), 'Google')]");
        this.btnContinueWithGoogleAlt2 = page.locator("button[class*='google']");
        this.btnContinueWithGoogleAlt3 = page.locator("[data-provider='google']");
        
        // Multiple email input selectors
        this.iptEmail = page.locator("//input[@aria-label='Email or phone']");
        this.iptEmailAlt1 = page.locator("input[type='email']");
        this.iptEmailAlt2 = page.locator("#identifierId");
        
        this.btnNext = page.locator("(//span[text() = 'Next'])[last()]");
        
        // Multiple password input selectors
        this.iptPassword = page.locator("//input[@aria-label='Enter your password']");
        this.iptPasswordAlt1 = page.locator("input[type='password']");
        this.iptPasswordAlt2 = page.locator("#password");
        this.iptPasswordAlt3 = page.locator("//input[@name='password']");
        
        // CAPTCHA related selectors
        this.captchaFrame = page.locator("iframe[src*='recaptcha']");
        this.captchaImage = page.locator("//img[contains(@src, 'captcha')]");
        this.captchaInput = page.locator("//input[@aria-label='Type the text you hear or see']");
        this.audioButton = page.locator("//button[@aria-label='Get an audio challenge']");
        
        // Additional selectors for MFA/verification scenarios
        this.btnTryAnotherWay = page.locator("//button[contains(text(), 'Try another way')]");
        this.btnSkip = page.locator("//button[contains(text(), 'Skip')]");
        this.btnYes = page.locator("//button[contains(text(), 'Yes')]");
        this.btnContinue = page.locator("//button[contains(text(), 'Continue')]");
        this.accountSelector = page.locator("//div[@data-identifier]");
    }

    /**
     * Logs in with Google using credentials from .env by default.
     * @param {string} [email] - Optional email, defaults to QA_USERNAME from .env
     * @param {string} [password] - Optional password, defaults to QA_PASSWORD from .env
     */
    async loginWithGoogle(email = process.env.QA_USERNAME, password = process.env.QA_PASSWORD) {
        const loginMethod = process.env.LOGIN_METHOD || 'google';
        
        console.log(`🚀 Starting login process with method: ${loginMethod}`);
        
        switch (loginMethod) {
            case 'session':
                return await this.loginWithSession();
            case 'direct':
                return await this.loginDirect(email, password);
            case 'google':
            default:
                return await this.loginWithGoogleOAuth(email, password);
        }
    }
    
    /**
     * Login using saved session cookies (bypasses OAuth)
     */
    async loginWithSession() {
        try {
            console.log('🍪 Attempting login with session cookies...');
            
            const cookiesFile = process.env.SESSION_COOKIES_FILE || './cookies.json';
            
            // Try to load existing cookies
            try {
                const fs = await import('fs');
                const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf8'));
                await this.page.context().addCookies(cookies);
                console.log('✅ Loaded session cookies');
            } catch (error) {
                console.log('⚠️ No valid session cookies found, need to create them');
                console.log('💡 Please run this process once manually to save session:');
                console.log('   1. Set LOGIN_METHOD=google in .env');
                console.log('   2. Run test and solve CAPTCHA manually');
                console.log('   3. Session will be saved automatically');
                throw new Error('Session cookies not found. Please perform manual login first.');
            }
            
            // Validate environment variables
            const stageUrl = process.env.STAGE_ENV;
            if (!stageUrl || stageUrl.trim() === '') {
                throw new Error('STAGE_ENV environment variable is required but not set');
            }
            
            // Navigate to the application
            await this.page.goto(stageUrl);
            console.log('✅ Navigated to staging environment with session');
            
           
            const currentUrl = this.page.url();
            if (currentUrl.includes('/login')) {
                throw new Error('Session cookies are invalid or expired. Please perform manual login to refresh session.');
            }
            
            console.log('✅ Session login successful!');
            
        } catch (error) {
            console.error('❌ Session login failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Original Google OAuth login method
     */
    async loginWithGoogleOAuth(email, password) {
        try {
            console.log('🚀 Starting login process...');
            
            // Validate environment variables
            const stageUrl = process.env.STAGE_ENV;
            if (!stageUrl || stageUrl.trim() === '') {
                console.error('❌ STAGE_ENV environment variable is not set or empty');
                console.error('💡 Available environment variables:');
                console.error('   STAGE_ENV:', process.env.STAGE_ENV || 'undefined');
                console.error('   QA_USERNAME:', process.env.QA_USERNAME ? '***set***' : 'undefined');
                console.error('   QA_PASSWORD:', process.env.QA_PASSWORD ? '***set***' : 'undefined');
                throw new Error('STAGE_ENV environment variable is required but not set');
            }
            
            console.log('🌐 Navigating to:', stageUrl);
            
            // Navigate to the application
            await this.page.goto(stageUrl);
            console.log('✅ Navigated to staging environment');
            
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            console.log('✅ Page load completed');
            
            // Debug: Show current page info
            console.log('🔍 Current page info:');
            console.log('   URL:', this.page.url());
            console.log('   Title:', await this.page.title());
            
            // Find and click Google login button - try multiple selectors
            let googleButtonFound = false;
            const googleButtonSelectors = [
                this.btnContinueWithGoogle,
                this.btnContinueWithGoogleAlt1, 
                this.btnContinueWithGoogleAlt2,
                this.btnContinueWithGoogleAlt3
            ];
            
            for (let i = 0; i < googleButtonSelectors.length && !googleButtonFound; i++) {
                const selector = googleButtonSelectors[i];
                const selectorName = ['XPath Exact Text', 'XPath Contains Google', 'CSS Class Google', 'Data Provider'][i];
                
                console.log(`🔍 Trying ${selectorName} selector for Google button...`);
                const isButtonVisible = await selector.isVisible().catch(() => false);
                
                if (isButtonVisible) {
                    console.log(`✅ Found Google button with ${selectorName}, clicking...`);
                    await selector.click();
                    googleButtonFound = true;
                    
                    // Wait for navigation to Google
                    console.log('⏳ Waiting for navigation to Google...');
                    await this.page.waitForLoadState('networkidle');
                    console.log('✅ Navigation completed');
                    break;
                }
            }
            
            if (!googleButtonFound) {
                console.log('❌ No Google login button found with any selector');
                console.log('📋 Available buttons on page:');
                const buttons = await this.page.locator('button').all();
                for (let i = 0; i < buttons.length; i++) {
                    const button = buttons[i];
                    const text = await button.textContent().catch(() => 'no text');
                    const className = await button.getAttribute('class').catch(() => 'no class');
                    const dataProvider = await button.getAttribute('data-provider').catch(() => 'no data-provider');
                    console.log(`Button ${i + 1}: text="${text}", class="${className}", data-provider="${dataProvider}"`);
                }
                throw new Error('Google login button not found. Please check the page structure.');
            }
            
            console.log('✅ Clicked Continue with Google');
            
            // Verify we're on Google's OAuth page
            const currentUrl = this.page.url();
            console.log('🔍 Current URL after Google button click:', currentUrl);
            
            if (!currentUrl.includes('accounts.google.com')) {
                console.log('❌ Not redirected to Google OAuth page');
                console.log('📋 Current page title:', await this.page.title());
                
                // Wait a bit more and check again
                await this.page.waitForTimeout(5000);
                const newUrl = this.page.url();
                console.log('🔍 URL after waiting:', newUrl);
                
                if (!newUrl.includes('accounts.google.com')) {
                    throw new Error('Failed to navigate to Google OAuth page. Google login button may not be working.');
                }
            }
            
            console.log('✅ Successfully navigated to Google OAuth page');
            
            // Check if account is already selected (sometimes Google shows account picker)
            const isAccountPresent = await this.accountSelector.first().isVisible().catch(() => false);
            if (isAccountPresent) {
                console.log('🔍 Account selector found, clicking on account...');
                await this.accountSelector.first().click();
                await this.page.waitForTimeout(2000);
            }
            
            // Handle email input (if not already logged in) - try multiple selectors
            let emailInputFound = false;
            const emailSelectors = [this.iptEmail, this.iptEmailAlt1, this.iptEmailAlt2];
            
            for (let i = 0; i < emailSelectors.length && !emailInputFound; i++) {
                const selector = emailSelectors[i];
                const selectorName = ['XPath Email', 'CSS Email', 'ID Email'][i];
                
                console.log(`🔍 Trying ${selectorName} selector...`);
                const isEmailVisible = await selector.isVisible().catch(() => false);
                
                if (isEmailVisible) {
                    console.log(`✅ ${selectorName} selector found, filling email...`);
                    await selector.clear();
                    await selector.fill(email);
                    console.log('✅ Filled email address');
                    emailInputFound = true;
                    
                    // Click Next after email - try multiple approaches
                    console.log('🔍 Looking for Next button...');
                    const nextButtons = [
                        this.btnNext,
                        this.page.locator("//span[text()='Next']"),
                        this.page.locator("button[id='identifierNext']"),
                        this.page.locator("//button[contains(text(), 'Next')]")
                    ];
                    
                    let nextButtonClicked = false;
                    for (let j = 0; j < nextButtons.length && !nextButtonClicked; j++) {
                        const nextBtn = nextButtons[j];
                        const nextBtnName = ['XPath Next (last)', 'XPath Next', 'ID Next', 'Text Next'][j];
                        
                        const isNextVisible = await nextBtn.isVisible().catch(() => false);
                        if (isNextVisible) {
                            console.log(`✅ Found ${nextBtnName}, clicking...`);
                            await nextBtn.click();
                            nextButtonClicked = true;
                            break;
                        }
                    }
                    
                    if (!nextButtonClicked) {
                        console.log('❌ No Next button found, trying Enter key...');
                        await selector.press('Enter');
                    }
                    
                    console.log('✅ Clicked Next after email');
                    
                    // Wait a bit for the page to load
                    await this.page.waitForTimeout(3000);

                    // Detect phone / MFA verification pages and handle accordingly
                    await this.detectAndHandlePhoneVerification();
                    break;
                }
            }
            
            if (!emailInputFound) {
                console.log('❌ No email input field found with any selector');
                console.log('📋 Available input fields on page:');
                const inputs = await this.page.locator('input').all();
                for (let i = 0; i < inputs.length; i++) {
                    const input = inputs[i];
                    const type = await input.getAttribute('type').catch(() => 'unknown');
                    const placeholder = await input.getAttribute('placeholder').catch(() => 'no placeholder');
                    const id = await input.getAttribute('id').catch(() => 'no id');
                    const ariaLabel = await input.getAttribute('aria-label').catch(() => 'no aria-label');
                    console.log(`Input ${i + 1}: type="${type}", id="${id}", placeholder="${placeholder}", aria-label="${ariaLabel}"`);
                }
                throw new Error('Email input field not found. Please check the page structure.');
            }
            
            // Handle various verification scenarios that might appear
            await this.handleVerificationSteps();
            
            // Check for CAPTCHA before looking for password input
            await this.handleCaptcha();

            // If Google now asks for phone verification after CAPTCHA/verification steps, handle it
            await this.detectAndHandlePhoneVerification();
            
            // Handle password input (try multiple times as sometimes it takes time to load)
            let passwordInputFound = false;
            const passwordSelectors = [this.iptPassword, this.iptPasswordAlt1, this.iptPasswordAlt2, this.iptPasswordAlt3];
            
            for (let attempt = 1; attempt <= 3; attempt++) {
                console.log(`🔍 Attempt ${attempt}: Looking for password input...`);
                
                // Try each password selector
                for (let i = 0; i < passwordSelectors.length && !passwordInputFound; i++) {
                    const selector = passwordSelectors[i];
                    const selectorName = ['XPath Password', 'CSS Password', 'ID Password', 'Name Password'][i];
                    
                    const isPasswordVisible = await selector.isVisible().catch(() => false);
                    if (isPasswordVisible) {
                        console.log(`✅ Found password input with ${selectorName}, filling...`);
                        await selector.clear();
                        await selector.fill(password);
                        console.log('✅ Filled password');
                        
                        // Click Next after password
                        const nextButtons = [
                            this.btnNext,
                            this.page.locator("//span[text()='Next']"),
                            this.page.locator("button[id='passwordNext']"),
                            this.page.locator("//button[contains(text(), 'Next')]")
                        ];
                        
                        let nextButtonClicked = false;
                        for (let j = 0; j < nextButtons.length && !nextButtonClicked; j++) {
                            const nextBtn = nextButtons[j];
                            const nextBtnName = ['XPath Next (last)', 'XPath Next', 'ID Password Next', 'Text Next'][j];
                            
                            const isNextVisible = await nextBtn.isVisible().catch(() => false);
                            if (isNextVisible) {
                                console.log(`✅ Found ${nextBtnName} after password, clicking...`);
                                await nextBtn.click();
                                nextButtonClicked = true;
                                break;
                            }
                        }
                        
                        if (!nextButtonClicked) {
                            console.log('⚠️ No Next button found after password, trying Enter key...');
                            await selector.press('Enter');
                        }
                        
                        console.log('✅ Clicked Next after password');
                        passwordInputFound = true;
                        break;
                    }
                }
                
                if (!passwordInputFound) {
                    console.log(`⏳ Password input not found on attempt ${attempt}, waiting...`);
                    await this.page.waitForTimeout(3000);
                    
                    // Try to handle any intermediate steps
                    await this.handleVerificationSteps();
                }
            }
            
            if (!passwordInputFound) {
                console.log('📋 Current page content:');
                console.log('Page title:', await this.page.title());
                console.log('Page URL:', this.page.url());
                
                // Check if we're already logged in
                const currentUrl = this.page.url();
                if (currentUrl.includes('ai.future.works') && !currentUrl.includes('accounts.google.com')) {
                    console.log('✅ Already logged in, skipping password step');
                    return;
                }
                
                throw new Error('Password input field not found after multiple attempts. Check if MFA is disabled or if there are verification steps.');
            }
            
            // Handle any post-login verification steps
            await this.handleVerificationSteps();

            // Check again for phone-based MFA before finishing
            await this.detectAndHandlePhoneVerification();

            // Wait for login to complete
            await this.page.waitForLoadState('networkidle');
            console.log('✅ Login completed successfully');
            
            // Save session cookies for future use
            await this.saveSessionCookies();
            
        } catch (error) {
            console.error('❌ Login failed:', error.message);
            console.error('📍 Current URL:', this.page.url());
            console.error('📋 Page title:', await this.page.title().catch(() => 'Cannot get title'));
            throw new Error(`Login failed: ${error.message}`);
        }
    }
    
    /**
     * Direct login method (if the app supports it)
     */
    async loginDirect(email, password) {
        try {
            console.log('🔑 Attempting direct login...');
            
            // Validate environment variables
            const stageUrl = process.env.STAGE_ENV;
            if (!stageUrl || stageUrl.trim() === '') {
                throw new Error('STAGE_ENV environment variable is required but not set');
            }
            
            // Navigate to the application
            await this.page.goto(stageUrl);
            console.log('✅ Navigated to staging environment');
            
            // Wait for page to be ready
            await this.page.waitForLoadState('networkidle');
            
            // Look for direct login form (if available)
            const directEmailInput = this.page.locator("input[type='email'], input[name='email']");
            const directPasswordInput = this.page.locator("input[type='password'], input[name='password']");
            const directLoginButton = this.page.locator("button[type='submit'], input[type='submit']");
            
            const hasDirectLogin = await directEmailInput.isVisible().catch(() => false) &&
                                  await directPasswordInput.isVisible().catch(() => false);
            
            if (hasDirectLogin) {
                console.log('✅ Direct login form found');
                await directEmailInput.fill(email);
                await directPasswordInput.fill(password);
                await directLoginButton.click();
                
                await this.page.waitForLoadState('networkidle');
                console.log('✅ Direct login completed');
            } else {
                throw new Error('Direct login form not available. Use Google OAuth method.');
            }
            
        } catch (error) {
            console.error('❌ Direct login failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Save session cookies after successful login
     */
    async saveSessionCookies() {
        try {
            const cookiesFile = process.env.SESSION_COOKIES_FILE || './cookies.json';
            const cookies = await this.page.context().cookies();
            
            const fs = await import('fs');
            fs.writeFileSync(cookiesFile, JSON.stringify(cookies, null, 2));
            console.log(`💾 Session cookies saved to ${cookiesFile}`);
            console.log('💡 Next time, set LOGIN_METHOD=session in .env to use saved session');
            
        } catch (error) {
            console.log('⚠️ Failed to save session cookies:', error.message);
        }
    }
    
    /**
     * Handles various verification steps that Google might show
     */
    async handleVerificationSteps() {
        try {
            // Wait a bit for any verification screens to load
            await this.page.waitForTimeout(2000);
            
            // Handle "Try another way" if present
            const isTryAnotherWayVisible = await this.btnTryAnotherWay.isVisible().catch(() => false);
            if (isTryAnotherWayVisible) {
                console.log('🔄 "Try another way" found, clicking...');
                await this.btnTryAnotherWay.click();
                await this.page.waitForTimeout(2000);
            }
            
            // Handle "Skip" if present
            const isSkipVisible = await this.btnSkip.isVisible().catch(() => false);
            if (isSkipVisible) {
                console.log('⏭️ "Skip" button found, clicking...');
                await this.btnSkip.click();
                await this.page.waitForTimeout(2000);
            }
            
            // Handle "Yes" if present (for "Was this you?" type questions)
            const isYesVisible = await this.btnYes.isVisible().catch(() => false);
            if (isYesVisible) {
                console.log('✅ "Yes" button found, clicking...');
                await this.btnYes.click();
                await this.page.waitForTimeout(2000);
            }
            
            // Handle "Continue" if present
            const isContinueVisible = await this.btnContinue.isVisible().catch(() => false);
            if (isContinueVisible) {
                console.log('➡️ "Continue" button found, clicking...');
                await this.btnContinue.click();
                await this.page.waitForTimeout(2000);
            }
            
        } catch (error) {
            console.log('⚠️ Error in verification step handling:', error.message);
            // Don't throw error here as these are optional steps
        }
    }
    
    /**
     * Handles CAPTCHA challenges that Google might show
     */
    async handleCaptcha() {
        try {
            console.log('🔍 Checking for CAPTCHA...');
            
            // Check if CAPTCHA frame is present
            const isCaptchaFrameVisible = await this.captchaFrame.isVisible().catch(() => false);
            const isCaptchaImageVisible = await this.captchaImage.isVisible().catch(() => false);
            const isCaptchaInputVisible = await this.captchaInput.isVisible().catch(() => false);
            
            // Additional CAPTCHA detection methods
            const captchaText = await this.page.locator("//span[contains(text(), 'Type the text you hear or see')]").isVisible().catch(() => false);
            const captchaContainer = await this.page.locator("div[role='img']").isVisible().catch(() => false);
            
            if (isCaptchaFrameVisible || isCaptchaImageVisible || isCaptchaInputVisible || captchaText || captchaContainer) {
                console.log('🤖 CAPTCHA detected!');
                console.log('⚠️ CAPTCHA cannot be solved automatically.');
                console.log('📋 Current automation will pause for manual intervention.');
                
                // Check current URL to see if we're still on identifier page
                const currentUrl = this.page.url();
                console.log('📍 Current URL:', currentUrl);
                
                if (currentUrl.includes('/signin/identifier')) {
                    console.log('⚠️ Still on identifier page - CAPTCHA needs to be solved');
                    console.log('🛑 Stopping automation - Manual CAPTCHA solving required');
                    console.log('� Solution options:');
                    console.log('   1. Use a different test account without CAPTCHA');
                    console.log('   2. Clear browser data and try from a trusted IP');
                    console.log('   3. Set up session cookies from manual login');
                    console.log('   4. Configure application to bypass Google OAuth for testing');
                    
                    throw new Error('CAPTCHA challenge requires manual intervention. Please use a test account that does not trigger CAPTCHA or implement session cookie approach.');
                }
                
            } else {
                console.log('✅ No CAPTCHA detected, proceeding...');
            }
            
        } catch (error) {
            console.log('⚠️ Error in CAPTCHA handling:', error.message);
            throw error; // Re-throw CAPTCHA errors as they are critical
        }
    }

    /**
     * Detects a Google phone verification / "Verify it's you" page.
     * - If running interactively (not CI), pauses and asks user to complete MFA in the opened browser.
     * - If running in CI, saves a screenshot and throws an error so CI fails clearly.
     */
    async detectAndHandlePhoneVerification() {
        try {
            const phoneSelector = "input[type='tel'], input[name='phone'], input[id*='phone'], input[aria-label*='phone']";
            const verifyHeadingLocator = this.page.locator("text=Verify it's you");

            const verifyHeading = await verifyHeadingLocator.isVisible().catch(() => false);
            const phoneVisible = await this.page.locator(phoneSelector).isVisible().catch(() => false);

            if (verifyHeading || phoneVisible) {
                console.log('🚨 Google MFA / phone verification detected');

                // Save screenshot for debugging
                try {
                    const pathMod = await import('path');
                    const ssPath = pathMod.resolve('mfa-challenge.png');
                    await this.page.screenshot({ path: ssPath, fullPage: true });
                    console.log('📸 Saved MFA screenshot to:', ssPath);
                } catch (err) {
                    console.log('⚠️ Failed to save MFA screenshot:', err.message);
                }

                const isCI = !!process.env.CI;
                if (isCI) {
                    // In CI we cannot proceed with interactive MFA
                    throw new Error('Google MFA (phone verification) detected. Cannot complete MFA in CI. Screenshot saved to mfa-challenge.png');
                } else {
                    // Interactive runs: ask user to complete the MFA in the opened browser
                    console.log('👉 Please complete the phone verification in the opened browser window.');
                    console.log('📝 After completing MFA, return to this terminal and press ENTER to continue.');
                    await this.waitForUserInput();
                    // Give the page a moment to update
                    await this.page.waitForTimeout(2000);
                }
            }
        } catch (error) {
            // Non-fatal: let normal flow continue if detection fails
            console.log('ℹ️ MFA detection check error:', error.message);
        }
    }

    // Small helper to pause for ENTER on the terminal (used for manual MFA completion)
    waitForUserInput() {
        return new Promise((resolve) => {
            // Use dynamic import for readline to stay ESM-compatible
            import('readline').then((readline) => {
                const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
                rl.question('', () => { rl.close(); resolve(); });
            }).catch(() => resolve());
        });
    }
}