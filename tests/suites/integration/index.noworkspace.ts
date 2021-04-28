import { configureAndRun } from '../configure-and-run';

export function run() {
  return configureAndRun('./integration/**/**.noworkspace.test.js');
}
