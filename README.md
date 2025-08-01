# Playwright Automation with CI/CD Integration

This project contains Playwright automation tests with CI/CD pipeline integration for GitHub Actions, GitLab CI, and Jenkins.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install-deps
```

### Running Tests Locally
```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run tests only on Chrome
npm run test:chrome

# Show test report
npm run test:report
```

## 🔄 CI/CD Integration

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/playwright.yml`) that:

- Runs on push to `main` and `develop` branches
- Runs on pull requests to `main` and `develop` branches
- Installs Node.js 18 and dependencies
- Installs Playwright browsers
- Runs tests in parallel
- Uploads test reports and artifacts
- Includes separate job for Chrome-specific tests

**To enable GitHub Actions:**

1. Push your code to a GitHub repository
2. Go to your repository → Actions tab
3. The workflow will automatically run on pushes and PRs

### GitLab CI

The project includes a GitLab CI configuration (`.gitlab-ci.yml`) that:

- Uses Node.js 18 Docker image
- Caches node_modules for faster builds
- Runs tests with artifact collection
- Includes retry logic for failed builds
- Generates JUnit reports

**To enable GitLab CI:**

1. Push your code to a GitLab repository
2. Go to your repository → CI/CD → Pipelines
3. The pipeline will automatically run on pushes

### Jenkins

The project includes a Jenkins pipeline (`Jenkinsfile`) that:

- Uses NodeJS 18 tool
- Runs tests in stages
- Publishes HTML reports
- Archives test artifacts
- Includes separate stage for Chrome tests

**To enable Jenkins:**

1. Install the required Jenkins plugins:
   - Pipeline
   - HTML Publisher
   - NodeJS Plugin
2. Configure NodeJS tool in Jenkins
3. Create a new pipeline job
4. Point to your repository and Jenkinsfile

## 📊 Test Reports

### Local Reports
After running tests, view the HTML report:
```bash
npm run test:report
```

### CI/CD Reports
- **GitHub Actions**: Reports are uploaded as artifacts and can be downloaded from the Actions tab
- **GitLab CI**: Reports are available in the CI/CD → Jobs section
- **Jenkins**: HTML reports are published and accessible from the build page

## ⚙️ Configuration

### Playwright Config (`playwright.config.js`)
- Configured for CI/CD with headless mode on CI
- Multiple reporters (HTML, JSON, JUnit)
- Screenshots and videos on failure
- Retry logic for CI environments
- Timeout settings optimized for CI

### Environment Variables
The configuration automatically detects CI environments and adjusts settings:
- `CI=true` - Enables headless mode, retries, and single worker
- `NODE_ENV=test` - Sets test environment

## 🛠️ Customization

### Adding New Tests
1. Create test files in the `tests/` directory
2. Use the existing page object pattern from `pages/modulePages.js`
3. Follow the naming convention: `*.spec.js`

### Modifying CI/CD
- **GitHub Actions**: Edit `.github/workflows/playwright.yml`
- **GitLab CI**: Edit `.gitlab-ci.yml`
- **Jenkins**: Edit `Jenkinsfile`

### Environment-Specific Settings
You can add environment-specific configurations by:
1. Creating `.env` files for different environments
2. Using environment variables in your CI/CD platform
3. Modifying the Playwright config to read from environment variables

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:ui` | Run tests with Playwright UI |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:chrome` | Run tests only on Chrome |
| `npm run test:report` | Show test report |
| `npm run test:install` | Install Playwright browsers |
| `npm run test:codegen` | Generate test code |
| `npm run test:install-deps` | Install browsers with dependencies |

## 🔧 Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check if the application is accessible from CI environment
   - Verify network connectivity and firewall settings
   - Ensure all dependencies are properly installed

2. **Browser installation issues**
   - Run `npm run test:install-deps` to install all browsers
   - Check system requirements for Playwright browsers

3. **Timeout issues**
   - Increase timeout in `playwright.config.js`
   - Check application response times
   - Verify network connectivity

### Getting Help
- Check Playwright documentation: https://playwright.dev/
- Review CI/CD platform documentation
- Check test logs and reports for specific error messages

## 📈 Best Practices

1. **Test Organization**
   - Keep tests independent and isolated
   - Use page object pattern for maintainability
   - Group related tests in describe blocks

2. **CI/CD Best Practices**
   - Use caching for faster builds
   - Implement proper artifact retention
   - Set up notifications for test failures
   - Use parallel execution when possible

3. **Performance**
   - Run tests in parallel when possible
   - Use headless mode in CI
   - Optimize test execution time
   - Clean up resources after tests

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Ensure all tests pass in CI
4. Update documentation as needed 