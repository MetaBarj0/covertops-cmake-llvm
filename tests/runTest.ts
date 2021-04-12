import { homedir } from 'node:os';
import * as path from 'path';

import { runTests } from 'vscode-test';

async function runAcceptanceTests(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/acceptance/index');

  await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

async function runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/integration/index.noworkspace');

  await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

async function runIntegrationTestsWithWorkspace(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/integration/index.workspace');

  if (process.env['CI_WORKSPACE_DIR'] === undefined) {
    console.error('Cannot execute tests. The CI_TMP_HOME environment variable must be defined and target an existing directory.');
    return;
  }

  const launchArgs = [process.env['CI_WORKSPACE_DIR'].toString()];

  await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs });
}

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../src/');

    await runAcceptanceTests(extensionDevelopmentPath);
    await runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath);
    await runIntegrationTestsWithWorkspace(extensionDevelopmentPath);
  } catch (_) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();