import * as path from "path";
import * as Mocha from "mocha";
import * as glob from "glob";

export function configureAndRun(testsGlob: string, options: Mocha.MochaOptions = {}): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Create the mocha test
    const mocha = new Mocha({
      ui: "tdd",
      color: true,
      ...options
    });

    const testsRoot = path.resolve(__dirname, ".");

    glob(testsGlob, { cwd: testsRoot }, (error, files) => {
      if (error)
        return reject(error);

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run(failures => {
          if (failures > 0)
            return reject(new Error(`${failures} test(s) failed.`));

          return resolve();
        });
      } catch (error) {
        console.error(error);

        reject(error);
      }
    });
  });
}

