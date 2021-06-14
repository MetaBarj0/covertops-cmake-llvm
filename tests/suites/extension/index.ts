import { configureAndRun } from '../configure-and-run';

export function run() {
  return configureAndRun('./extension/**/**.test.js');
}