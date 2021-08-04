import * as RegionCoverageInfoModule from "../../../src/modules/abstractions/coverage-info-collector/region-coverage-info";
import * as WorkspaceModule from "../../../src/adapters/abstractions/vscode/workspace";
import * as SettingsModule from "../../../src/modules/abstractions/settings-provider/settings";

export namespace Modules {
  export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
  export type Settings = SettingsModule.Settings;
}

export namespace Adapters {
  export namespace vscode {
    export type VscodeWorkspaceFolderLike = WorkspaceModule.VscodeWorkspaceFolderLike;
  }
}
