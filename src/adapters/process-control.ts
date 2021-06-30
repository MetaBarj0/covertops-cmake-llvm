import { ExecFileCallable } from '../shared-kernel/abstractions/process-control';

import * as cp from 'child_process';

export const execFile: ExecFileCallable = cp.execFile;
