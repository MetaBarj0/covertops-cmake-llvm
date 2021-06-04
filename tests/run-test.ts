import * as path from 'path';
import * as fs from 'fs-extra';

import { runTests } from 'vscode-test';

(async function () {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../..');

    await runAcceptanceTests(extensionDevelopmentPath);
    await runUnitTests(extensionDevelopmentPath);
    await runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath);
    await runIntegrationTestsWithWorkspace(extensionDevelopmentPath);
  } catch (error) {
    console.error('Failed to run tests\n' + error);
    process.exit(1);
  }
})();

function runAcceptanceTests(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/acceptance/index');

  return runTests({ extensionDevelopmentPath, extensionTestsPath });
}

function runUnitTests(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/unit/index');

  return runTests({ extensionDevelopmentPath, extensionTestsPath });
}

function runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/integration/index.noworkspace');

  return runTests({ extensionDevelopmentPath, extensionTestsPath });
}

function createCmakeProject() {
  const src = path.resolve(__dirname, '../../tests/suites/integration/data/workspace');
  const dst = path.resolve(__dirname, '../workspace');
  return fs.copy(src, dst, { recursive: true, overwrite: true });
}

async function runIntegrationTestsWithWorkspace(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/integration/index.workspace');
  const workspaceDirectory = path.resolve(__dirname, '../workspace');

  await createCmakeProject();

  return runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs: [workspaceDirectory] });
}
