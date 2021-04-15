import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function configureAndRun(testsGlob: string, options: Mocha.MochaOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create the mocha test
    const mocha = new Mocha({
      ui: 'tdd',
      color: true,
      ...options
    });

    const testsRoot = path.resolve(__dirname, '.');

    glob(testsGlob, { cwd: testsRoot }, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run(failures => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  });
}

