import * as Types from "../../types";

export function make(rawLLVMRegionCoverageInfo: Types.Modules.RawLLVMRegionCoverageInfo): Types.Modules.RegionCoverageInfo {
  return new RegionCoverageInfo(rawLLVMRegionCoverageInfo);
}

class RegionCoverageInfo implements Types.Modules.RegionCoverageInfo {
  constructor(rawLLVMRegionCoverageInfo: Types.Modules.RawLLVMRegionCoverageInfo) {
    // https://github.com/llvm/llvm-project/blob/21c18d5a04316891110cecc2bf37ce51533decba/llvm/tools/llvm-cov/CoverageExporterJson.cpp#L87
    this.kind = rawLLVMRegionCoverageInfo[7] === 0 ? "Normal" : "Other";
    this.executionCount = rawLLVMRegionCoverageInfo[4];

    // vscode api accepts zero based indices for line and character positions. LLVM coverage info file contains one based position
    this.regionRange = {
      start: {
        line: rawLLVMRegionCoverageInfo[0] - 1,
        character: rawLLVMRegionCoverageInfo[1] - 1
      },
      end: {
        line: rawLLVMRegionCoverageInfo[2] - 1,
        character: rawLLVMRegionCoverageInfo[3] - 1
      }
    };
  }

  get isAnUncoveredRegion() {
    return this.isNormalRegion && this.hasNotBeenExecuted;
  }

  get range() {
    return this.regionRange;
  }

  private get isNormalRegion() {
    return this.kind === "Normal";
  }

  private get hasNotBeenExecuted() {
    return this.executionCount === 0;
  }

  private readonly kind: RegionKind;
  private readonly executionCount: number;
  private readonly regionRange: Types.Modules.RegionRange;
}

type RegionKind = "Normal" | "Other";
