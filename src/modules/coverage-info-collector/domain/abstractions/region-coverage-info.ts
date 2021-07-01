export type RegionCoverageInfo = {
  get isAnUncoveredRegion(): boolean;
  get range(): RegionRange;
};

export type RegionRange = {
  start: RegionPosition,
  end: RegionPosition
};

export type RawLLVMRegionsCoverageInfo = ReadonlyArray<RawLLVMRegionCoverageInfo>;
export type RawLLVMRegionCoverageInfo = [number, number, number, number, number, number, number, number];

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

type RegionPosition = {
  line: number,
  character: number
};
