import { writeFile } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { normalize, join } from 'path';

(async () => {
  const sourceFilePath = normalize(join('.', 'package.json'));
  const targetFilePath = normalize(join('./src', 'package.json.ts'));

  const prelude = 'const packageJSON = ';

  await writeFile(targetFilePath, prelude, { flag: 'w' });

  await pipeline(
    createReadStream(sourceFilePath, { flags: 'r' }),
    createWriteStream(targetFilePath, { flags: 'a' })
  );

  const epilogue = ' as const; export default packageJSON;';

  await writeFile(targetFilePath, epilogue, { flag: 'a' });
})();
