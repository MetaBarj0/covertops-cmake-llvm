import { configureAndRun } from "../configure-and-run";

export function run(): Promise<void> {
  return configureAndRun("./acceptance/**/**.test.js");
}
