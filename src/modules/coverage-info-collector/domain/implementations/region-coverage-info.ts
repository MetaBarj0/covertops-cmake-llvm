import * as Imports from '../../imports';

export function make(rawLLVMRegionCoverageInfo: Imports.Domain.Abstractions.RawLLVMRegionCoverageInfo) {
  return new RegionCoverageInfo(rawLLVMRegionCoverageInfo);
}

class RegionCoverageInfo implements Imports.Domain.Abstractions.RegionCoverageInfo {
  constructor(rawLLVMRegionCoverageInfo: Imports.Domain.Abstractions.RawLLVMRegionCoverageInfo) {
    // https://github.com/llvm/llvm-project/blob/21c18d5a04316891110cecc2bf37ce51533decba/llvm/tools/llvm-cov/CoverageExporterJson.cpp#L87
    this.kind = rawLLVMRegionCoverageInfo[7] === 0 ? 'Normal' : 'Other';
    this.executionCount = rawLLVMRegionCoverageInfo[4];

    this.regionRange = {
      start: {
        line: rawLLVMRegionCoverageInfo[0],
        character: rawLLVMRegionCoverageInfo[1]
      },
      end: {
        line: rawLLVMRegionCoverageInfo[2],
        character: rawLLVMRegionCoverageInfo[3]
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
    return this.kind === 'Normal';
  }

  private get hasNotBeenExecuted() {
    return this.executionCount === 0;
  }

  private readonly kind: RegionKind;
  private readonly executionCount: number;
  private readonly regionRange: Imports.Domain.Abstractions.RegionRange;
}

type RegionKind = 'Normal' | 'Other';
