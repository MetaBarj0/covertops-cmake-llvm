import { VscodeWorkspaceLike } from './settings-provider';

export type GlobSearchLike = {};

export class CoverageInfoFileResolver {
  constructor(_workspace: VscodeWorkspaceLike, _globSearch: GlobSearchLike) { }

  resolveCoverageInfoFileFullPath(): Promise<void> {
    return Promise.reject(
      'Cannot resolve the coverage info file path in the build tree directory. ' +
      'Ensure that both ' +
      "'cmake-llvm-coverage: Build Tree Directory' and 'cmake-llvm-coverage: Coverage Info File Name' " +
      'settings are correctly set.');
  }
};
