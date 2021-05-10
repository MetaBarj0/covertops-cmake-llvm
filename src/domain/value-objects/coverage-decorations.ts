class Position {
  constructor(position: Position) {
    this.line = position.line;
    this.column = position.column;
  }

  readonly line: number;
  readonly column: number;
}
class Range {
  constructor(range: Range) {
    this.begin = new Position(range.begin);
    this.end = new Position(range.end);
  }

  readonly begin: Position;
  readonly end: Position;
};

type CoverageDecorationsData = {
  file: string;
  locations: ReadonlyArray<Range>;
};

export class CoverageDecorations implements CoverageDecorationsData {
  constructor(coverageDecorations: CoverageDecorationsData) {
    this.file = coverageDecorations.file;

    const locations = new Array<Range>();
    coverageDecorations.locations.forEach(range => { locations.push(new Range(range)); });
    this.locations = locations;
  }

  getFor(requiredFile: string) {
    throw new Error(
      'Cannot find any uncovered code regions for the file: ' +
      `${requiredFile}. Ensure this file belongs to a project that is covered by at least a test project.`);
  }

  readonly file: string;
  readonly locations: ReadonlyArray<Range>;
};
