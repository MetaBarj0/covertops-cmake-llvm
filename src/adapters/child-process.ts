import * as cp from 'child_process';

// TODO: out of namespace export
// TODO: probably need to rename that file
export namespace childProcess {
  export const executeFile = cp.execFile;
}