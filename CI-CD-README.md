# CI/CD Integration Guide - Playwright Automation

This document describes the CI/CD pipeline setup for the Playwright automation project.

## 🚀 Overview

The project is integrated with GitHub Actions to provide:
- **Automated Testing**: Runs all test suites on every push and pull request
- **Continuous Integration**: Validates code quality and test results
- **Continuous Deployment**: Automated deployment to staging and production environments
- **Quality Gates**: Ensures all tests pass before deployment

## 📋 Workflow Files

### 1. Main CI/CD Pipeline (`ci-cd-pipeline.yml`)
**Triggers:**
- Push to `main`, `develop`, or `feature/*` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Jobs:**
- **Lint & Validate**: Code validation and Playwright config check
- **Simple Tests**: Basic page load and structure tests
- **CI-Friendly Tests**: Network connectivity and browser functionality tests
- **Smoke Tests**: AI model validation tests (main automation suite)
- **Test Report**: Comprehensive test execution summary
- **Staging Deployment**: Automatic deployment to staging (develop branch only)

### 2. Production Deployment (`deploy-production.yml`)
**Triggers:**
- Manual workflow dispatch only (requires confirmation)

**Features:**
- Deployment confirmation checkbox
- Deployment notes/reason input
- Branch protection validation
- Comprehensive deployment logging

## 🔧 Environment Configuration

### Staging Environment
- **URL**: https://staging.ai.future.works
- **Auto-deploy**: Yes (on develop branch)
- **Required Reviews**: 1
- **Protection**: Strict status checks

### Production Environment
- **URL**: https://ai.future.works
- **Auto-deploy**: No (manual only)
- **Required Reviews**: 2
- **Code Owner Reviews**: Required
- **Protection**: Strict status checks + branch restrictions

## 📊 Test Suites

### 1. Simple Tests (`tests/simple.spec.js`)
- **Purpose**: Basic page validation and structure verification
- **Timeout**: 15 minutes
- **Browser**: Chromium only
- **Artifacts**: Test results and screenshots

### 2. CI-Friendly Tests (`tests/ci-friendly.spec.js`)
- **Purpose**: Network connectivity and external service validation
- **Timeout**: 20 minutes
- **Browser**: Chromium only
- **Artifacts**: Test results and screenshots

### 3. Smoke Tests (`tests/SmokeSuite/smokeTesting.spec.js`)
- **Purpose**: AI model validation and automation verification
- **Timeout**: 120 minutes
- **Browser**: Chromium only
- **Artifacts**: Test results, videos, and error context

## 🚀 Deployment Process

### Staging Deployment
1. **Trigger**: Automatic on `develop` branch push
2. **Prerequisites**: All tests must pass
3. **Process**: Automated deployment validation
4. **Notification**: Deployment success/failure artifacts

### Production Deployment
1. **Trigger**: Manual workflow dispatch
2. **Prerequisites**: 
   - Deployment confirmation checked
   - All tests passing (if run)
   - Branch protection rules satisfied
3. **Process**: Manual deployment execution
4. **Notification**: Comprehensive deployment logs

## 📈 Monitoring and Reporting

### Test Results
- **Artifacts**: Uploaded for all test suites
- **Retention**: 30 days for test results, 90 days for production deployments
- **Reports**: Combined test execution summary
- **Failure Handling**: Detailed error context and screenshots

### Deployment Tracking
- **Staging**: Automatic success/failure tracking
- **Production**: Manual deployment logs with timestamps
- **Notifications**: Deployment artifacts for audit trails

## 🛠️ Local Development

### Running Tests Locally
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/SmokeSuite/smokeTesting.spec.js

# Run with UI
npm run test:ui

# Run in headed mode
npm run test:headed
```

### Pre-commit Validation
```bash
# Install dependencies
npm ci

# Validate Playwright config
npx playwright --version

# Run quick validation tests
npm test -- tests/simple.spec.js
```

## 🔒 Security and Compliance

### Branch Protection
- **Main Branch**: Requires PR reviews and status checks
- **Develop Branch**: Requires PR reviews and status checks
- **Feature Branches**: No restrictions (for development)

### Environment Protection
- **Staging**: Automatic deployment with test validation
- **Production**: Manual deployment with confirmation and notes
- **Artifacts**: Secure storage with configurable retention

## 📝 Best Practices

### For Developers
1. **Always run tests locally** before pushing
2. **Use feature branches** for development
3. **Create meaningful commit messages**
4. **Test your changes** with the appropriate test suite

### For DevOps
1. **Monitor workflow executions** regularly
2. **Review deployment logs** for any issues
3. **Update environment configurations** as needed
4. **Maintain security policies** and access controls

### For QA
1. **Review test results** after each run
2. **Validate staging deployments** before production
3. **Report any test failures** with detailed context
4. **Maintain test data** and environment configurations

## 🚨 Troubleshooting

### Common Issues
1. **Test Timeouts**: Increase timeout values in workflow files
2. **Browser Installation**: Ensure `--with-deps` flag is used
3. **Environment Variables**: Check GitHub repository secrets
4. **Permission Issues**: Verify workflow permissions and branch protection

### Getting Help
1. **Check workflow logs** in GitHub Actions
2. **Review test artifacts** for detailed error information
3. **Consult team members** for environment-specific issues
4. **Update documentation** with any new findings

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI/CD Guide](https://playwright.dev/docs/ci)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: DevOps Team
