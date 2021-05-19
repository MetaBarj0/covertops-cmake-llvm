class Position {
  constructor(other: Position) {
    this.line = other.line;
    this.column = other.column;
  }

  readonly line: number;
  readonly column: number;
}
class Region {
  constructor(other: Region) {
    this.begin = new Position(other.begin);
    this.end = new Position(other.end);
  }

  readonly begin: Position;
  readonly end: Position;
};

class Summary {
  constructor(other: Summary) {
    this.count = other.count;
    this.covered = other.covered;
    this.notCovered = other.notCovered;
    this.percent = other.percent;
  }

  readonly count: number;
  readonly covered: number;
  readonly notCovered: number;
  readonly percent: number;
};

class CoverageInfo {
  constructor(other: CoverageInfo) {
    this.file = other.file;
    this.regions = new Array<Region>(...other.regions);
    this.summary = new Summary(other.summary);
  }

  readonly file: string;
  readonly regions: ReadonlyArray<Region>;
  readonly summary: Summary;
};

type CollectedCoverageInfoContract = {
  readonly coverageInfoCollection: ReadonlyArray<CoverageInfo>;
};

export class CollectedCoverageInfo implements CollectedCoverageInfoContract {
  constructor(other: CollectedCoverageInfoContract) {
    this.coverageInfoCollection = new Array<CoverageInfo>(...other.coverageInfoCollection);
  }

  getFor(filePath: string): CoverageInfo {
    const found = this.coverageInfoCollection.find(value => { return value.file === filePath; });

    if (!found)
      throw new Error(
        'Cannot find any uncovered code regions for the file: ' +
        `${filePath}. Ensure this file belongs to a project that is covered by at least a test project.`);

    return found;
  }

  readonly coverageInfoCollection: ReadonlyArray<CoverageInfo>;
};
