import { configureAndRun } from '../configureAndRun';

export function run() {
  return configureAndRun('./acceptance/**/**.test.js');
}