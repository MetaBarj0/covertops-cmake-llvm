export enum RegionKind { normal, other }
export type RawLLVMRegionCoverageInfo = [number, number, number, number, number, number, number, number];
export type RawLLVMRegionsCoverageInfo = ReadonlyArray<RawLLVMRegionCoverageInfo>;

export type RawLLVMFunctionCoverageInfo = {
  filenames: ReadonlyArray<string>,
  regions: RawLLVMRegionsCoverageInfo
};

export class RegionCoverageInfo {
  constructor(rawLLVMRegionCoverageInfo: RawLLVMRegionCoverageInfo) {
    // https://github.com/llvm/llvm-project/blob/21c18d5a04316891110cecc2bf37ce51533decba/llvm/tools/llvm-cov/CoverageExporterJson.cpp#L87
    this.kind = rawLLVMRegionCoverageInfo[7] === 0 ? RegionKind.normal : RegionKind.other;
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
    return this.kind === RegionKind.normal;
  }

  private get hasNotBeenExecuted() {
    return this.executionCount === 0;
  }

  private readonly kind: RegionKind;
  private readonly executionCount: number;
  private readonly regionRange: RegionRange;
}

type RegionPosition = {
  line: number,
  character: number
};

type RegionRange = {
  start: RegionPosition,
  end: RegionPosition
};