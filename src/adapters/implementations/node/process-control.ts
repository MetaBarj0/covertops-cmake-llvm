import * as Abstractions from "../../abstractions/node/process-control";

import * as cp from "child_process";

export const execFile: Abstractions.ExecFileCallable = cp.execFile;
