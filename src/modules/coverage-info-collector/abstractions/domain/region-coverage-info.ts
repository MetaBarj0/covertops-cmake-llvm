export type RawLLVMRegionCoverageInfo = [number, number, number, number, number, number, number, number];
export type RawLLVMRegionsCoverageInfo = ReadonlyArray<RawLLVMRegionCoverageInfo>;

export type RawLLVMFunctionCoverageInfo = {
  filenames: ReadonlyArray<string>,
  regions: RawLLVMRegionsCoverageInfo
};

export type RawLLVMFileCoverageInfo = {
  filename: string;
};

export type RawLLVMStreamedDataItemCoverageInfo = {
  key: number,
  value: {
    files: ReadonlyArray<RawLLVMFileCoverageInfo>,
    functions: ReadonlyArray<RawLLVMFunctionCoverageInfo>
  }
};

export type RegionCoverageInfo = {
  get isAnUncoveredRegion(): boolean;
  get range(): RegionRange;
};

export type RegionRange = {
  start: RegionPosition,
  end: RegionPosition
};

type RegionPosition = {
  line: number,
  character: number
};
