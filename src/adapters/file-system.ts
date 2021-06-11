import { promises as fs } from 'fs';
import * as globby from 'globby';

export namespace fileSystem {
  export const statFile = { stat: fs.stat };
  export const globSearch = { search: globby };
  export const makeDirectory = { mkdir: fs.mkdir };
}