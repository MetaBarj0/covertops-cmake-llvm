import { configureAndRun } from "../configure-and-run";

export function run(): Promise<void> {
  return configureAndRun("./unit/**/**.test.js");
}
