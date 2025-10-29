// config.js - Environment configuration and timeout management
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Timeout configuration class
 * Provides centralized timeout management from environment variables
 */
export class TimeoutConfig {
    static get DEFAULT_TIMEOUT() {
        return parseInt(process.env.DEFAULT_TIMEOUT) || 10000;
    }

    static get SHORT_TIMEOUT() {
        return parseInt(process.env.SHORT_TIMEOUT) || 5000;
    }

    static get LONG_TIMEOUT() {
        return parseInt(process.env.LONG_TIMEOUT) || 500000;
    }

    /**
     * Get timeout value by type
     * @param {string} type - 'default', 'short', or 'long'
     * @returns {number} Timeout value in milliseconds
     */
    static getTimeout(type = 'default') {
        switch (type.toLowerCase()) {
            case 'short':
                return this.SHORT_TIMEOUT;
            case 'long':
                return this.LONG_TIMEOUT;
            case 'default':
            default:
                return this.DEFAULT_TIMEOUT;
        }
    }

    /**
     * Log current timeout configuration
     */
    static logConfig() {
        console.log('🕒 Timeout Configuration:');
        console.log(`   DEFAULT_TIMEOUT: ${this.DEFAULT_TIMEOUT}ms`);
        console.log(`   SHORT_TIMEOUT: ${this.SHORT_TIMEOUT}ms`);
        console.log(`   LONG_TIMEOUT: ${this.LONG_TIMEOUT}ms`);
    }
}

/**
 * Environment configuration class
 * Provides access to all environment variables
 */
export class EnvConfig {
    static get STAGE_ENV() {
        return process.env.STAGE_ENV || 'https://staging.ai.future.works/';
    }

    static get QA_USERNAME() {
        return process.env.QA_USERNAME || '';
    }

    static get QA_PASSWORD() {
        return process.env.QA_PASSWORD || '';
    }

    /**
     * Validate that all required environment variables are set
     * @returns {boolean} True if all required vars are present
     */
    static validateConfig() {
        const requiredVars = ['STAGE_ENV', 'QA_USERNAME', 'QA_PASSWORD'];
        const missing = requiredVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            console.error('❌ Missing required environment variables:', missing.join(', '));
            return false;
        }
        
        console.log('✅ All required environment variables are configured');
        return true;
    }

    /**
     * Log current environment configuration (without sensitive data)
     */
    static logConfig() {
        console.log('🔧 Environment Configuration:');
        console.log(`   STAGE_ENV: ${this.STAGE_ENV}`);
        console.log(`   QA_USERNAME: ${this.QA_USERNAME ? '***configured***' : 'NOT SET'}`);
        console.log(`   QA_PASSWORD: ${this.QA_PASSWORD ? '***configured***' : 'NOT SET'}`);
    }
}