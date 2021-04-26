import { configureAndRun } from '../configureAndRun';

export function run() {
  return configureAndRun('./unit/**/**.test.js');
}