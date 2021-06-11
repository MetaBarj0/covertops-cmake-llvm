import { createReadStream } from 'fs';

export namespace inputStream {
  export const readableStream = { createStream: createReadStream };
}