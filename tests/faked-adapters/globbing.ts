import * as CoverageInfoFileResolver from '../../src/domain/services/internal/coverage-info-file-resolver';

export namespace globbing {
  export function buildFakeGlobSearchForNoMatch() {
    return new class implements CoverageInfoFileResolver.GlobSearchLike {
      search(_pattern: string) {
        return Promise.resolve([]);
      }
    };
  }

  export function buildFakeGlobSearchForSeveralMatch() {
    return new class implements CoverageInfoFileResolver.GlobSearchLike {
      search(_pattern: string) {
        return Promise.resolve(['', '']);
      }
    };
  }

  export function buildFakeGlobSearchForExactlyOneMatch() {
    return new class implements CoverageInfoFileResolver.GlobSearchLike {
      search(_pattern: string) {
        return Promise.resolve(['oneMatchShow']);
      }
    };
  }
}
