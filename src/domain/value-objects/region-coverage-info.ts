export enum RegionKind { normal, other }

export type RawLLVMRegionCoverageInfo = [number, number, number, number, number, number, number, number];

export class RegionCoverageInfo {
  constructor(rawLLVMRegionCoverageInfo: RawLLVMRegionCoverageInfo) {
    // https://github.com/llvm/llvm-project/blob/21c18d5a04316891110cecc2bf37ce51533decba/llvm/tools/llvm-cov/CoverageExporterJson.cpp#L87
    this.kind = rawLLVMRegionCoverageInfo[7] === 0 ? RegionKind.normal : RegionKind.other;
    this.executionCount = rawLLVMRegionCoverageInfo[4];
  }

  get isAnUncoveredRegion() {
    return this.isNormalRegion && this.hasNotBeenExecuted;
  }

  private get isNormalRegion() {
    return this.kind === RegionKind.normal;
  }

  private get hasNotBeenExecuted() {
    return this.executionCount === 0;
  }

  private readonly kind: RegionKind;
  private readonly executionCount: number;
}