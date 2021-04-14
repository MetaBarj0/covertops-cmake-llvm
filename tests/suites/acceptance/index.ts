import { runFor } from '../runFor';

export function run() {
  return runFor('./acceptance/**/**.test.js');
}