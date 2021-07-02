import { GlobSearchCallable } from '../../../src/shared-kernel/abstractions/file-system';

export function buildFakeGlobSearchForNoMatch(): GlobSearchCallable {
  return (_pattern: string) => Promise.resolve([]);
}

export function buildFakeGlobSearchForSeveralMatch(): GlobSearchCallable {
  return (_pattern: string) => Promise.resolve(['', '']);
}

export function buildFakeGlobSearchForExactlyOneMatch(): GlobSearchCallable {
  return (_pattern: string) => Promise.resolve(['oneMatchShow']);
}
