import { configureAndRun } from "../configure-and-run";

export function run(): Promise<void> {
  return configureAndRun("./extension/**/**.test.js", { timeout: "120s" });
}
