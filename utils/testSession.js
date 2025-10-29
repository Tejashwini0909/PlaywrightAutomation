/**
 * Session Login Test
 * 
 * Quick test to verify session-based login is working
 * 
 * Usage: node utils/testSession.js
 */

import { chromium } from '@playwright/test';
import { LoginPage } from './login.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSessionLogin() {
    console.log('🧪 Testing session-based login...');
    
    // Temporarily set login method to session
    const originalMethod = process.env.LOGIN_METHOD;
    process.env.LOGIN_METHOD = 'session';
    
    const browser = await chromium.launch({ 
        headless: false,  // Visible to see the result
        slowMo: 500 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        const login = new LoginPage(page);
        await login.loginWithGoogle();
        
        console.log('✅ Session login successful!');
        console.log('🔍 Current URL:', page.url());
        console.log('📋 Page title:', await page.title());
        
        // Wait a bit to see the result
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ Session login failed:', error.message);
        console.log('💡 Make sure you have run: node utils/setupSession.js first');
    } finally {
        // Restore original login method
        process.env.LOGIN_METHOD = originalMethod;
        await browser.close();
    }
}

testSessionLogin().catch(console.error);