import * as Abstrations from "../../abstractions/node/file-system";

import * as fs from "fs";
import * as globby from "globby";

export const stat: Abstrations.StatCallable = fs.promises.stat;
export const globSearch: Abstrations.GlobSearchCallable = globby;
export const mkdir: Abstrations.MkdirCallable = fs.promises.mkdir;
export const createReadStream: Abstrations.CreateReadStreamCallable = fs.createReadStream;
