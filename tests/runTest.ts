import * as path from 'path';
import * as fs from 'fs/promises';

import { runTests } from 'vscode-test';

async function runAcceptanceTests(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/acceptance/index');

  await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

async function runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/integration/index.noworkspace');

  await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

async function createWorkspaceAndBuildDirectories(workspaceDirectory: string) {
  await fs.stat(workspaceDirectory)
    .then(async _ => { await fs.rm(workspaceDirectory, { recursive: true }); })
    .catch(_ => { });

  return fs.mkdir(workspaceDirectory, { recursive: true });
}

async function runIntegrationTestsWithWorkspace(extensionDevelopmentPath: string) {
  const extensionTestsPath = path.resolve(__dirname, './suites/integration/index.workspace');
  const workspaceDirectory = path.resolve(__dirname, '../workspace');
  const buildDirectory = path.resolve(__dirname, '../workspace/build');

  await createWorkspaceAndBuildDirectories(buildDirectory);

  return runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs: [workspaceDirectory] });
}

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../..');

    await runAcceptanceTests(extensionDevelopmentPath);
    await runIntegrationTestsWithoutWorkspace(extensionDevelopmentPath);
    await runIntegrationTestsWithWorkspace(extensionDevelopmentPath);
  } catch (_) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();