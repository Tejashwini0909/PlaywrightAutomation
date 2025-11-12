import { test, expect } from '@playwright/test';
import { ModulePages } from '../../pages/modulePages.js';
import { LoginPage } from '../../utils/login.js';

// Sanity Test Suite - UI and Functionality Tests
test.describe('Sanity Tests', () => {
    test.beforeEach(async ({ page }) => {
        const modulepageObject = new ModulePages(page);
        const login = new LoginPage(page);

        try {
            await login.loginWithGoogle();
            console.log('Login successful for test');
        } catch (error) {
            console.error('Login failed in beforeEach:', error.message);
            throw error;
        }
    });

    test.afterEach(async ({ page }) => {
        try {
            if (page && !page.isClosed()) {
                await page.reload();
            }
        } catch (error) {
            console.error('Cleanup error in afterEach:', error.message);
        }
    });
    test('TC_001 - Simple Toggle Sidebar Test', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.expandSection('Delivery & CSat');
            await modulepageObject.selectSubSection('MEH-5: AOS (OLD)');
            console.log('TC_003 - Simple toggle sidebar test completed successfully');
        } catch (error) {
            console.error('TC_003 - Simple toggle sidebar test failed:', error.message);
            throw error;
        }
    });
    test('TC_002 - Verify both the Toggle Sidebars responds correctly when clicked (Expand and Collapse functionality)', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.validateBothToggleSidebarsExpandCollapse();
            console.log('TC_002 - Both Toggle Sidebars expand/collapse test completed successfully');
        } catch (error) {
            console.error('TC_002 - Both Toggle Sidebars expand/collapse test failed:', error.message);
            throw error;
        }
    });


    test('TC_003 - Simple Section Expand and Select', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.expandSection('Delivery & CSat');
            await modulepageObject.selectSubSection('MEH-5: AOS (OLD)');
            console.log('TC_003b - Simple section expand and select completed successfully');
        } catch (error) {
            console.error('TC_003b - Simple section expand and select failed:', error.message);
            throw error;
        }
    });

    test('TC_004 - Verify Toggle sidebars functionality on all screen sizes (zoom in or zoom out)', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.testToggleSidebarsOnScreenSize('normal');
            await modulepageObject.testToggleSidebarsOnScreenSize('maximized');
            await modulepageObject.testToggleSidebarsOnScreenSize('zoom-in');
            await modulepageObject.testToggleSidebarsOnScreenSize('zoom-out');
            console.log('TC_004 - Toggle sidebars screen size test completed successfully');
        } catch (error) {
            console.error('TC_004 - Toggle sidebars screen size test failed:', error.message);
            throw error;
        }
    });

    test('TC_005 - Verify Toggle Sidebars remains the same with multiple clicks', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.testMultipleToggleClicks();
            console.log('TC_005 - Toggle sidebars multiple clicks test completed successfully');
        } catch (error) {
            console.error('TC_005 - Toggle sidebars multiple clicks test failed:', error.message);
            throw error;
        }
    });

    test('TC_006 - Verify Footer displays "Submit feedback", copyright text "© Future Works", and help (?) icon', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.verifyFooterElements();
            console.log('TC_006 - Footer elements verification test completed successfully');
        } catch (error) {
            console.error('TC_006 - Footer elements verification test failed:', error.message);
            throw error;
        }
    });

    test('TC_007 - Verify Submit feedback link is clickable', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.testSubmitFeedbackLink();
            console.log('TC_007 - Submit feedback link test completed successfully');
        } catch (error) {
            console.error('TC_007 - Submit feedback link test failed:', error.message);
            throw error;
        }
    });

    test('TC_008 - Verify help (?) icon functionality', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.testHelpIconFunctionality();
            console.log('TC_008 - Help (?) icon functionality test completed successfully');
        } catch (error) {
            console.error('TC_008 - Help (?) icon functionality test failed:', error.message);
            throw error;
        }
    });

    test('TC_009 - Verify Copyright text', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.verifyCopyrightText();
            console.log('TC_009 - Copyright text verification completed successfully');
        } catch (error) {
            console.error('TC_009 - Copyright text verification failed:', error.message);
            throw error;
        }
    });

    test('TC_010 - Verify Right sidebar is fully scrollable', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
            await modulepageObject.verifyRightSidebarScrollability();
            console.log('TC_010 - Right sidebar scrollability test completed successfully');
        } catch (error) {
            console.error('TC_010 - Right sidebar scrollability test failed:', error.message);
            throw error;
        }
    });

    test('TC_011 - Verify Context Selection Search Filter Functionality', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
        await modulepageObject.validateContextSearchFilter();
        console.log('TC_011 - Context search filter test completed successfully');
        } catch (error) {
        console.error('TC_011 - Context search filter test failed:', error.message);
        throw error;
        }
    });

    test('TC_012 - Verify Add Docs Search Filter Functionality', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
        await modulepageObject.validateAddDocsSearchFilter();
        console.log('TC_012 - Add Docs search filter test completed successfully');
        } catch (error) {
        console.error('TC_012 - Add Docs search filter test failed:', error.message);
        throw error;
        }
    });

    test('TC_013 - Verify grok-4 AOS task adder', async ({ page }) => {
        const modulepageObject = new ModulePages(page);

        try {
        await modulepageObject.selectModule('gemini-2.5-pro');
        await modulepageObject.selectFutureWorksIfNotSelected();
        await modulepageObject.sendMessage('What is Functional Testing?');
        await modulepageObject.verifyAssistantResponse('functional');
        
        // Create AOS task after successful assistant response
        await modulepageObject.createAOSTask('Tejashwini');

        console.log('TC_013 - gemini-2.5-pro AOS task adder test completed successfully');
        } catch (error) {
        console.error('TC_013 - gemini-2.5-pro AOS task adder test failed:', error.message);
        throw error; // Re-throw to mark test as failed but allow next test to run
        }
    });
});