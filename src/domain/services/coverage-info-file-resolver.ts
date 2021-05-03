import { VscodeWorkspaceLike } from './settings-provider';

export type GlobSearchLike = {};

export class CoverageInfoFileResolver {
  constructor(_workspace: VscodeWorkspaceLike, _globSearch: GlobSearchLike) { }

  resolveCoverageInfoFileFullPath(): Promise<void> {
    return Promise.reject('resolveCoverageInfoFileFullPath is not yet implemented');
  }
};
