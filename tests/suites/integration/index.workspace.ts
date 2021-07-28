import { configureAndRun } from "../configure-and-run";

export function run(): Promise<void> {
  return configureAndRun("./integration/**/**.workspace.test.js", { timeout: "120s" });
}
