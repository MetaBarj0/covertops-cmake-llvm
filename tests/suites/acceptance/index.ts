import { configureAndRun } from '../configure-and-run';

export function run() {
  return configureAndRun('./acceptance/**/**.test.js');
}