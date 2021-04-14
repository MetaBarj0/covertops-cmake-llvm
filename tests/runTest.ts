import * as path from 'path';
import * as fs from 'fs-extra';

import { runTests } from 'vscode-test';

async function runAcceptanceTests(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/acceptance/index');

  await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

async function runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/integration/index.noworkspace');

  await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

async function createCmakeProject() {
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

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../..');

    await runAcceptanceTests(extensionDevelopmentPath);
    await runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath);
    await runIntegrationTestsWithWorkspace(extensionDevelopmentPath);
  } catch (error) {
    console.error('Failed to run tests\n' + error);
    process.exit(1);
  }
}

main();