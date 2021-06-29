import { GlobSearchCallable } from '../../../src/adapters/interfaces/file-system';

export namespace globbing {
  export function buildFakeGlobSearchForNoMatch(): GlobSearchCallable {
    return (_pattern: string) => Promise.resolve([]);
  }

  export function buildFakeGlobSearchForSeveralMatch(): GlobSearchCallable {
    return (_pattern: string) => Promise.resolve(['', '']);
  }

  export function buildFakeGlobSearchForExactlyOneMatch(): GlobSearchCallable {
    return (_pattern: string) => Promise.resolve(['oneMatchShow']);
  }
}
