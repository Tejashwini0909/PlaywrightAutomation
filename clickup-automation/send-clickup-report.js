#!/usr/bin/env node

/**
 * Playwright → ClickUp notification utility.
 *
 * Required env vars:
 * - CLICKUP_API_TOKEN
 * - CLICKUP_TEAM_ID
 * - CLICKUP_ROOM_ID
 *
 * Optional env vars:
 * - JUNIT_PATH (defaults to ./junit-report.xml)
 * - RUN_CONCLUSION
 * - GITHUB_WORKFLOW_NAME
 * - GITHUB_RUN_ID
 * - GITHUB_RUN_NUMBER
 * - GITHUB_REPOSITORY
 * - GITHUB_SERVER_URL
 */

const fs = require('node:fs');
const path = require('node:path');

const {
  CLICKUP_API_TOKEN,
  CLICKUP_TEAM_ID,
  CLICKUP_ROOM_ID,
  JUNIT_PATH = 'junit-report.xml',
  RUN_CONCLUSION = 'unknown',
  GITHUB_WORKFLOW_NAME = 'Playwright Tests',
  GITHUB_RUN_ID,
  GITHUB_RUN_NUMBER,
  GITHUB_REPOSITORY,
  GITHUB_SERVER_URL = 'https://github.com',
} = process.env;

if (!CLICKUP_API_TOKEN || !CLICKUP_TEAM_ID || !CLICKUP_ROOM_ID) {
  console.error('Missing ClickUp env vars. Please set CLICKUP_API_TOKEN, CLICKUP_TEAM_ID, CLICKUP_ROOM_ID.');
  process.exit(1);
}

const junitPath = path.resolve(JUNIT_PATH);
if (!fs.existsSync(junitPath)) {
  console.error(`JUnit report not found at ${junitPath}`);
  process.exit(1);
}

const xml = fs.readFileSync(junitPath, 'utf-8');

const parseAttributes = (str) => {
  const attrs = {};
  str.replace(/([\w:-]+)="([^"]*)"/g, (_, key, value) => {
    attrs[key] = value;
    return '';
  });
  return attrs;
};

const extractSuites = (xmlContent) => {
  const suites = [];
  const suiteRegex = /<testsuite\b([^>]*)>([\s\S]*?)<\/testsuite>/g;

  let suiteMatch;
  while ((suiteMatch = suiteRegex.exec(xmlContent)) !== null) {
    const attr = parseAttributes(suiteMatch[1] || '');
    const body = suiteMatch[2] || '';
    const testcases = [];
    const caseRegex = /<testcase\b([^>]*)>([\s\S]*?)<\/testcase>/g;
    let caseMatch;

    while ((caseMatch = caseRegex.exec(body)) !== null) {
      const tcAttr = parseAttributes(caseMatch[1] || '');
      const inner = caseMatch[2] || '';
      const failureMatch = inner.match(/<failure\b([^>]*)>([\s\S]*?)<\/failure>/);
      const errorMatch = inner.match(/<error\b([^>]*)>([\s\S]*?)<\/error>/);

      let failure = null;
      if (failureMatch) {
        failure = {
          type: 'failure',
          ...parseAttributes(failureMatch[1] || ''),
          details: (failureMatch[2] || '').trim(),
        };
      } else if (errorMatch) {
        failure = {
          type: 'error',
          ...parseAttributes(errorMatch[1] || ''),
          details: (errorMatch[2] || '').trim(),
        };
      }

      testcases.push({
        ...tcAttr,
        failure,
      });
    }

    suites.push({
      ...attr,
      testcases,
    });
  }

  return suites;
};

const suites = extractSuites(xml);
const rootSuite = suites[0] || {};
const total = Number(rootSuite.tests ?? 0);
const failures = Number(rootSuite.failures ?? 0);
const errors = Number(rootSuite.errors ?? 0);
const skipped = Number(rootSuite.skipped ?? 0);
const passed = Math.max(total - failures - errors - skipped, 0);

const failedTests = [];
suites.forEach((suite) => {
  suite.testcases.forEach((tc) => {
    if (tc.failure) {
      failedTests.push({
        suite: suite.name || suite.file || 'Unnamed Suite',
        name: tc.name || 'Unnamed Test',
        failure: tc.failure,
      });
    }
  });
});

const runUrl =
  GITHUB_SERVER_URL && GITHUB_REPOSITORY && GITHUB_RUN_ID
    ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
    : 'N/A';

const lines = [
  `Workflow: ${GITHUB_WORKFLOW_NAME}`,
  `Run: #${GITHUB_RUN_NUMBER ?? 'N/A'} (${runUrl})`,
  `Conclusion: ${RUN_CONCLUSION}`,
  `Total: ${total} | Passed: ${passed} | Failed: ${failures} | Errors: ${errors} | Skipped: ${skipped}`,
];

if (failedTests.length > 0) {
  lines.push('\nFailed Tests:');
  failedTests.slice(0, 10).forEach((test, idx) => {
    const label = `${idx + 1}. ${test.suite} › ${test.name}`;
    const details = test.failure.details
      ? `${test.failure.details.slice(0, 300)}${test.failure.details.length > 300 ? '…' : ''}`
      : test.failure.message || 'No stack trace provided.';
    lines.push(`${label}\n   - ${test.failure.type}: ${details}`);
  });
  if (failedTests.length > 10) {
    lines.push(`...and ${failedTests.length - 10} more failures.`);
  }
} else if (total > 0) {
  lines.push('\nAll tests passed ✅');
} else {
  lines.push('\nNo tests detected in report.');
}

const message = lines.join('\n');

async function postToClickUp(content) {
  const endpoint = `https://api.clickup.com/api/v2/room/${CLICKUP_ROOM_ID}/message?team_id=${CLICKUP_TEAM_ID}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: CLICKUP_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ClickUp API error (${response.status}): ${text}`);
  }
}

postToClickUp(message)
  .then(() => {
    console.log('ClickUp notification sent.');
  })
  .catch((err) => {
    console.error('Failed to send ClickUp notification:', err);
    process.exit(1);
  });


