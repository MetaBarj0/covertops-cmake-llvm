import * as CoverageInfoCollector from '../../../src/modules/coverage-info-collector/domain/coverage-info-collector';
import { CreateReadStreamCallable } from '../../../src/adapters/interfaces/file-system';
import { Readable } from 'stream';

export namespace inputStream {
  export function buildEmptyReadableStream() {
    const empty = (function* () { })();

    return Readable.from(empty);
  }

  export function buildNotJsonStream() {
    return Readable.from('foo');
  }

  export function buildInvalidLlvmCoverageJsonObjectStream() {
    return Readable.from(JSON.stringify({
      data: [
        { foo: 'bar' },
        {}
      ]
    }));
  }

  export function buildValidLlvmCoverageJsonObjectStream() {
    return Readable.from(JSON.stringify({
      "data": [
        {
          "files": [
            {
              "filename": "/a/source/file.cpp",
              "summary": {
                "regions": {
                  "count": 2,
                  "covered": 2,
                  "notcovered": 0,
                  "percent": 100
                }
              }
            }
          ],
          "functions": [
            {
              "filenames": [
                "/a/source/file.cpp"
              ],
              "regions": [
                [
                  4,
                  52,
                  4,
                  54,
                  1,
                  0,
                  0,
                  0
                ],
                [
                  6,
                  53,
                  6,
                  71,
                  0,
                  0,
                  0,
                  0
                ]
              ]
            }
          ]
        }
      ],
      "type": "llvm.coverage.json.export",
      "version": "2.0.1"
    }));
  }

  export function buildFakeStreamBuilder(factory: () => Readable): CreateReadStreamCallable {
    return (_path: string) => factory();
  }
}
