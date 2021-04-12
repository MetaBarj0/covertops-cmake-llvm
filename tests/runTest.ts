import * as path from 'path';

import { runTests } from 'vscode-test';

async function runAcceptanceTests(extensionDevelopmentPath: string) {
  // The path to test runner for acceptance tests
  // Passed to --extensionTestsPath
  const extensionTestsPath = path.resolve(__dirname, './suites/acceptance/index');

  // Download VS Code, unzip it and run all tests
  await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

async function runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath: string) {
  // The path to test runner for acceptance tests
  // Passed to --extensionTestsPath
  const extensionTestsPath = path.resolve(__dirname, './suites/integration/index');
  const launchArgs = [''];

  // Download VS Code, unzip it and run all tests
  await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs });
}

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../src/');

    await runAcceptanceTests(extensionDevelopmentPath);
    await runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath);
  } catch (_) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();