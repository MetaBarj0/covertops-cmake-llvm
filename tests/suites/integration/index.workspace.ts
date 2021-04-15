import { configureAndRun } from '../configureAndRun';

export function run() {
  return configureAndRun('./integration/**/**.workspace.test.js', { timeout: '60s' });
}