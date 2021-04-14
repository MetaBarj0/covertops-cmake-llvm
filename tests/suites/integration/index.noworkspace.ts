import { runFor } from '../runFor';

export function run() {
  return runFor('./integration/**/**.noworkspace.test.js');
}
