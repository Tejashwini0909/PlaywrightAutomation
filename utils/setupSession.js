/**
 * Manual Session Setup Helper
 * 
 * This script helps you manually login once and save session cookies
 * for future automated tests (bypassing CAPTCHA issues).
 * 
 * Usage:
 * 1. Run: node utils/setupSession.js
 * 2. Browser will open - manually login and solve CAPTCHA
 * 3. Session cookies will be saved automatically
 * 4. Change LOGIN_METHOD=session in .env
 * 5. Run automated tests without CAPTCHA!
 */

import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

dotenv.config();

async function setupSession() {
    console.log('🚀 Starting manual session setup...');
    console.log('📋 This will open a browser for you to manually login');
    console.log('💡 After login, session cookies will be saved automatically');
    
    const browser = await chromium.launch({ 
        headless: false,  // Always visible for manual interaction
        slowMo: 1000 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('🌐 Navigating to application...');
        await page.goto(process.env.STAGE_ENV);
        
        // Detect common Google verification prompts (phone / "Verify it's you") and save a screenshot to help debugging
        try {
            const phoneSelector = "input[type='tel'], input[name='phone'], input[id*='phone']";
            const verifyHeading = await page.locator("text=Verify it's you").isVisible().catch(() => false);
            const phoneVisible = await page.locator(phoneSelector).isVisible().catch(() => false);
            if (verifyHeading || phoneVisible) {
                console.log('⚠️ Google verification detected (phone number / "Verify it\'s you").');
                console.log('   Please complete the verification in the opened browser (enter phone or use recovery).');
                // Save screenshot for reference
                const ssPath = path.resolve('session-phone-challenge.png');
                await page.screenshot({ path: ssPath, fullPage: true });
                console.log('   Screenshot saved to:', ssPath);
            }
        } catch (err) {
            // Non-fatal - continue to manual steps
            console.log('ℹ️ Could not auto-detect verification page:', err.message);
        }
        
        console.log('⏳ Please complete the following steps manually:');
        console.log('   1. Click "Continue with Google"');
        console.log('   2. Enter email: ' + process.env.QA_USERNAME);
        console.log('   3. Solve CAPTCHA if prompted');
        console.log('   4. Enter password: ' + process.env.QA_PASSWORD);
        console.log('   5. Complete any additional verification');
        console.log('   6. Wait until you see the main application page');
        console.log('');
        console.log('👀 When you see the main app (not login page), press ENTER in this terminal...');
        
        // Wait for user to complete manual login
        await waitForUserInput();
        
        // Check if login was successful
        const currentUrl = page.url();
        console.log('🔍 Current URL:', currentUrl);
        
        if (currentUrl.includes('/login')) {
            throw new Error('Still on login page. Please complete the login process first.');
        }
        
        // Save session cookies
        console.log('💾 Saving session cookies...');
        const cookies = await context.cookies();
        const cookiesFile = process.env.SESSION_COOKIES_FILE || './cookies.json';
        const cookiesPath = path.resolve(cookiesFile);
        
        fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
        
        // Also save Playwright storage state (cookies + localStorage)
        try {
            const stateFile = path.resolve('state.json');
            await context.storageState({ path: stateFile });
            console.log('💾 Playwright storage state saved to:', stateFile);
        } catch (err) {
            console.log('⚠️ Could not save storage state:', err.message);
        }

        console.log('✅ Session setup completed successfully!');
        console.log('📁 Cookies saved to:', cookiesPath);
        console.log('');
        console.log('🎯 Next steps:');
        console.log('   1. Update .env file: LOGIN_METHOD=session');
        console.log('   2. Run your automated tests');
        console.log('   3. Tests will now bypass CAPTCHA using saved session!');
        
    } catch (error) {
        console.error('❌ Session setup failed:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

function waitForUserInput() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('', () => {
            rl.close();
            resolve();
        });
    });
}

// Run the session setup
setupSession().catch(console.error);