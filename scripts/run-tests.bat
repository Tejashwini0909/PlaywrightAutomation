@echo off
REM Playwright Test Execution Script for Windows
REM This script provides a unified way to run different test suites

setlocal enabledelayedexpansion

REM Default values
set "TEST_SUITE=all"
set "ENVIRONMENT=staging"
set "BROWSER=chromium"
set "HEADLESS=true"
set "PARALLEL=false"
set "REPORT=true"
set "VERBOSE=false"

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :main
if "%~1"=="-s" (
    set "TEST_SUITE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--suite" (
    set "TEST_SUITE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-e" (
    set "ENVIRONMENT=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--env" (
    set "ENVIRONMENT=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-b" (
    set "BROWSER=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--browser" (
    set "BROWSER=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    set "HEADLESS=true"
    shift
    goto :parse_args
)
if "%~1"=="--headless" (
    set "HEADLESS=true"
    shift
    goto :parse_args
)
if "%~1"=="-p" (
    set "PARALLEL=true"
    shift
    goto :parse_args
)
if "%~1"=="--parallel" (
    set "PARALLEL=true"
    shift
    goto :parse_args
)
if "%~1"=="-r" (
    set "REPORT=true"
    shift
    goto :parse_args
)
if "%~1"=="--report" (
    set "REPORT=true"
    shift
    goto :parse_args
)
if "%~1"=="-v" (
    set "VERBOSE=true"
    shift
    goto :parse_args
)
if "%~1"=="--verbose" (
    set "VERBOSE=true"
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    call :show_help
    exit /b 0
)
echo Unknown option: %~1
call :show_help
exit /b 1

:show_help
echo Playwright Test Execution Script
echo ================================
echo.
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -s, --suite SUITE        Test suite to run (all, simple, ci-friendly, smoke, tool-validation)
echo   -e, --env ENVIRONMENT    Environment to test against (staging, production)
echo   -b, --browser BROWSER    Browser to use (chromium, firefox, webkit)
echo   -h, --headless          Run in headless mode (default: true)
echo   -p, --parallel          Run tests in parallel
echo   -r, --report            Generate HTML report (default: true)
echo   -v, --verbose           Verbose output
echo   --help                  Show this help message
echo.
echo Examples:
echo   %0 --suite smoke --env staging
echo   %0 --suite all --parallel --verbose
echo   %0 --suite tool-validation --browser firefox
echo.
goto :eof

:main
echo [%date% %time%] Starting test execution with the following configuration:
echo   Test Suite: %TEST_SUITE%
echo   Environment: %ENVIRONMENT%
echo   Browser: %BROWSER%
echo   Headless: %HEADLESS%
echo   Parallel: %PARALLEL%
echo   Report: %REPORT%
echo   Verbose: %VERBOSE%
echo.

REM Set environment variables
set "NODE_ENV=test"
set "PLAYWRIGHT_BROWSERS_PATH=0"

if "%ENVIRONMENT%"=="staging" (
    if not defined STAGE_ENV set "STAGE_ENV=https://staging.ai.future.works/"
)
if "%ENVIRONMENT%"=="production" (
    if not defined STAGE_ENV set "STAGE_ENV=https://ai.future.works/"
)

REM Build Playwright command
set "PLAYWRIGHT_CMD=npx playwright test --project=%BROWSER%"

if "%HEADLESS%"=="false" (
    set "PLAYWRIGHT_CMD=%PLAYWRIGHT_CMD% --headed"
)

if "%PARALLEL%"=="true" (
    set "PLAYWRIGHT_CMD=%PLAYWRIGHT_CMD% --workers=4"
)

if "%VERBOSE%"=="true" (
    set "PLAYWRIGHT_CMD=%PLAYWRIGHT_CMD% --reporter=list"
)

REM Install dependencies
echo [%date% %time%] Installing dependencies...
call npm ci
if errorlevel 1 (
    echo [%date% %time%] ❌ Failed to install dependencies
    exit /b 1
)

REM Install Playwright browsers
echo [%date% %time%] Installing Playwright browsers...
call npx playwright install --with-deps %BROWSER%
if errorlevel 1 (
    echo [%date% %time%] ❌ Failed to install Playwright browsers
    exit /b 1
)

REM Run tests
echo [%date% %time%] Starting test execution...
set "start_time=%time%"

if "%TEST_SUITE%"=="simple" (
    call %PLAYWRIGHT_CMD% tests/simple.spec.js
) else if "%TEST_SUITE%"=="ci-friendly" (
    call %PLAYWRIGHT_CMD% tests/ci-friendly.spec.js
) else if "%TEST_SUITE%"=="smoke" (
    call %PLAYWRIGHT_CMD% tests/SmokeSuite/smokeTesting.spec.js
) else if "%TEST_SUITE%"=="tool-validation" (
    call %PLAYWRIGHT_CMD% tests/ToolValidation/toolValidation.spec.js
) else if "%TEST_SUITE%"=="all" (
    call %PLAYWRIGHT_CMD%
) else (
    echo [%date% %time%] ❌ Invalid test suite: %TEST_SUITE%
    exit /b 1
)

if errorlevel 1 (
    echo [%date% %time%] ❌ Tests failed
    exit /b 1
) else (
    echo [%date% %time%] ✅ All tests completed successfully
    
    if "%REPORT%"=="true" (
        echo [%date% %time%] Generating test report...
        start npx playwright show-report --host 0.0.0.0 --port 9323
        echo [%date% %time%] ✅ Test report available at http://localhost:9323
    )
    
    exit /b 0
)
