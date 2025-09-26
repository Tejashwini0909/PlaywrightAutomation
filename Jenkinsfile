pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 18'
    }
    
    environment {
        NODE_ENV = 'test'
        PLAYWRIGHT_BROWSERS_PATH = '0'
    }
    
    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['all', 'simple', 'ci-friendly', 'smoke', 'tool-validation'],
            description: 'Select test suite to run'
        )
        booleanParam(
            name: 'RUN_PARALLEL',
            defaultValue: true,
            description: 'Run tests in parallel'
        )
        booleanParam(
            name: 'GENERATE_REPORT',
            defaultValue: true,
            description: 'Generate HTML test report'
        )
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "🔍 Checkout completed for branch: ${env.BRANCH_NAME}"
                    echo "📅 Build started at: ${new Date()}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                script {
                    echo "✅ Dependencies installed successfully"
                }
            }
        }
        
        stage('Install Playwright Browsers') {
            steps {
                sh 'npx playwright install --with-deps chromium'
                script {
                    echo "✅ Playwright browsers installed successfully"
                }
            }
        }
        
        stage('Run Simple Tests') {
            when {
                anyOf {
                    params.TEST_SUITE == 'all'
                    params.TEST_SUITE == 'simple'
                }
            }
            steps {
                script {
                    echo "🧪 Running Simple Tests..."
                }
                sh 'npx playwright test tests/simple.spec.js --project=chromium'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Simple Tests Report'
                    ])
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Run CI-Friendly Tests') {
            when {
                anyOf {
                    params.TEST_SUITE == 'all'
                    params.TEST_SUITE == 'ci-friendly'
                }
            }
            steps {
                script {
                    echo "🧪 Running CI-Friendly Tests..."
                }
                sh 'npx playwright test tests/ci-friendly.spec.js --project=chromium'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'CI-Friendly Tests Report'
                    ])
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Run Smoke Tests') {
            when {
                anyOf {
                    params.TEST_SUITE == 'all'
                    params.TEST_SUITE == 'smoke'
                }
            }
            steps {
                script {
                    echo "🧪 Running Smoke Tests (AI Model Validation)..."
                    echo "⚠️  This may take up to 120 minutes"
                }
                sh '''
                    npx playwright test tests/SmokeSuite/smokeTesting.spec.js --project=chromium
                '''
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Smoke Tests Report'
                    ])
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Run Tool Validation Tests') {
            when {
                anyOf {
                    params.TEST_SUITE == 'all'
                    params.TEST_SUITE == 'tool-validation'
                }
            }
            steps {
                script {
                    echo "🧪 Running Tool Validation Tests..."
                    echo "⚠️  This may take up to 90 minutes"
                }
                sh '''
                    npx playwright test tests/ToolValidation/toolValidation.spec.js --project=chromium
                '''
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Tool Validation Tests Report'
                    ])
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Run All Tests (Parallel)') {
            when {
                allOf {
                    params.TEST_SUITE == 'all'
                    params.RUN_PARALLEL == true
                }
            }
            parallel {
                stage('Parallel Simple Tests') {
                    steps {
                        sh 'npx playwright test tests/simple.spec.js --project=chromium'
                    }
                }
                stage('Parallel CI-Friendly Tests') {
                    steps {
                        sh 'npx playwright test tests/ci-friendly.spec.js --project=chromium'
                    }
                }
            }
        }
        
        stage('Generate Combined Report') {
            when {
                params.GENERATE_REPORT == true
            }
            steps {
                script {
                    echo "📊 Generating combined test report..."
                }
                sh '''
                    echo "# Jenkins Test Execution Summary" > test-summary.md
                    echo "## Build: ${BUILD_NUMBER}" >> test-summary.md
                    echo "## Branch: ${BRANCH_NAME}" >> test-summary.md
                    echo "## Date: $(date)" >> test-summary.md
                    echo "## Test Suite: ${TEST_SUITE}" >> test-summary.md
                    echo "" >> test-summary.md
                    echo "### Test Results:" >> test-summary.md
                    echo "- All test artifacts are available in the build artifacts" >> test-summary.md
                    echo "- HTML reports are published for each test suite" >> test-summary.md
                    echo "- Screenshots and videos are included for failed tests" >> test-summary.md
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'test-summary.md', allowEmptyArchive: true
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🏁 Pipeline execution completed"
                echo "📅 Build finished at: ${new Date()}"
                echo "🔗 Build URL: ${BUILD_URL}"
            }
        }
        success {
            script {
                echo "✅ All tests passed successfully!"
            }
        }
        failure {
            script {
                echo "❌ Some tests failed. Check the test reports for details."
            }
        }
        unstable {
            script {
                echo "⚠️  Some tests were unstable. Check the test reports for details."
            }
        }
        cleanup {
            cleanWs()
        }
    }
} 