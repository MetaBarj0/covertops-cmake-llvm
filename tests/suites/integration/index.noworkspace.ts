import { configureAndRun } from '../configureAndRun';

export function run() {
  return configureAndRun('./integration/**/**.noworkspace.test.js');
}
