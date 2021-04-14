import { runFor } from '../runFor';

export function run() {
  return runFor('./integration/**/**.workspace.test.js');
}