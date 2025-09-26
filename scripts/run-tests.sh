#!/bin/bash

# Playwright Test Execution Script
# This script provides a unified way to run different test suites

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_SUITE="all"
ENVIRONMENT="staging"
BROWSER="chromium"
HEADLESS="true"
PARALLEL="false"
REPORT="true"
VERBOSE="false"

# Function to display help
show_help() {
    echo "Playwright Test Execution Script"
    echo "================================"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --suite SUITE        Test suite to run (all, simple, ci-friendly, smoke, tool-validation)"
    echo "  -e, --env ENVIRONMENT    Environment to test against (staging, production)"
    echo "  -b, --browser BROWSER    Browser to use (chromium, firefox, webkit)"
    echo "  -h, --headless          Run in headless mode (default: true)"
    echo "  -p, --parallel          Run tests in parallel"
    echo "  -r, --report            Generate HTML report (default: true)"
    echo "  -v, --verbose           Verbose output"
    echo "  --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --suite smoke --env staging"
    echo "  $0 --suite all --parallel --verbose"
    echo "  $0 --suite tool-validation --browser firefox"
    echo ""
}

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log success
log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

# Function to log error
log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--suite)
            TEST_SUITE="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -h|--headless)
            HEADLESS="true"
            shift
            ;;
        -p|--parallel)
            PARALLEL="true"
            shift
            ;;
        -r|--report)
            REPORT="true"
            shift
            ;;
        -v|--verbose)
            VERBOSE="true"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate test suite
case $TEST_SUITE in
    all|simple|ci-friendly|smoke|tool-validation)
        ;;
    *)
        log_error "Invalid test suite: $TEST_SUITE"
        show_help
        exit 1
        ;;
esac

# Validate environment
case $ENVIRONMENT in
    staging|production)
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        show_help
        exit 1
        ;;
esac

# Validate browser
case $BROWSER in
    chromium|firefox|webkit)
        ;;
    *)
        log_error "Invalid browser: $BROWSER"
        show_help
        exit 1
        ;;
esac

# Display configuration
log "Starting test execution with the following configuration:"
echo "  Test Suite: $TEST_SUITE"
echo "  Environment: $ENVIRONMENT"
echo "  Browser: $BROWSER"
echo "  Headless: $HEADLESS"
echo "  Parallel: $PARALLEL"
echo "  Report: $REPORT"
echo "  Verbose: $VERBOSE"
echo ""

# Set environment variables
export NODE_ENV="test"
export PLAYWRIGHT_BROWSERS_PATH="0"

if [ "$ENVIRONMENT" = "staging" ]; then
    export STAGE_ENV="${STAGE_ENV:-https://staging.ai.future.works/}"
elif [ "$ENVIRONMENT" = "production" ]; then
    export STAGE_ENV="${STAGE_ENV:-https://ai.future.works/}"
fi

# Build Playwright command
PLAYWRIGHT_CMD="npx playwright test --project=$BROWSER"

if [ "$HEADLESS" = "false" ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --headed"
fi

if [ "$PARALLEL" = "true" ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --workers=4"
fi

if [ "$VERBOSE" = "true" ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --reporter=list"
fi

# Function to run specific test suite
run_test_suite() {
    local suite=$1
    local test_file=""
    
    case $suite in
        simple)
            test_file="tests/simple.spec.js"
            ;;
        ci-friendly)
            test_file="tests/ci-friendly.spec.js"
            ;;
        smoke)
            test_file="tests/SmokeSuite/smokeTesting.spec.js"
            ;;
        tool-validation)
            test_file="tests/ToolValidation/toolValidation.spec.js"
            ;;
        all)
            test_file=""
            ;;
    esac
    
    if [ -n "$test_file" ]; then
        log "Running $suite tests: $test_file"
        $PLAYWRIGHT_CMD "$test_file"
    else
        log "Running all test suites"
        $PLAYWRIGHT_CMD
    fi
}

# Main execution
main() {
    log "Installing dependencies..."
    npm ci
    
    log "Installing Playwright browsers..."
    npx playwright install --with-deps "$BROWSER"
    
    log "Starting test execution..."
    start_time=$(date +%s)
    
    if run_test_suite "$TEST_SUITE"; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        log_success "All tests completed successfully in ${duration} seconds"
        
        if [ "$REPORT" = "true" ]; then
            log "Generating test report..."
            npx playwright show-report --host 0.0.0.0 --port 9323 &
            log_success "Test report available at http://localhost:9323"
        fi
        
        exit 0
    else
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        log_error "Tests failed after ${duration} seconds"
        exit 1
    fi
}

# Run main function
main
