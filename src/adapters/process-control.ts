import * as Abstractions from '../shared-kernel/abstractions/process-control';

import * as cp from 'child_process';

export const execFile: Abstractions.ExecFileCallable = cp.execFile;
