import * as RegionCoverageInfoModule from "../../../src/modules/abstractions/coverage-info-collector/region-coverage-info";
import * as AbstractVscodeModule from "../../../src/adapters/abstractions/vscode";
import * as SettingsModule from "../../../src/modules/abstractions/settings-provider/settings";

export namespace Modules {
  export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
  export type Settings = SettingsModule.Settings;
}

export namespace Adapters {
  export namespace vscode {
    export type VscodeWorkspaceFolderLike = AbstractVscodeModule.VscodeWorkspaceFolderLike;
  }
}
