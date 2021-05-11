class Position {
  constructor(other: Position) {
    this.line = other.line;
    this.column = other.column;
  }

  readonly line: number;
  readonly column: number;
}
class Location {
  constructor(other: Location) {
    this.begin = new Position(other.begin);
    this.end = new Position(other.end);
  }

  readonly begin: Position;
  readonly end: Position;
};

class FileDecorations {
  constructor(other: FileDecorations) {
    this.file = other.file;
    this.locations = new Array<Location>(...other.locations);
  }

  readonly file: string;
  readonly locations: ReadonlyArray<Location>;
};

type CoverageDecorationsData = {
  readonly fileDecorations: ReadonlyArray<FileDecorations>;
};

export class CoverageDecorations implements CoverageDecorationsData {
  constructor(other: CoverageDecorationsData) {
    this.fileDecorations = new Array<FileDecorations>(...other.fileDecorations);
  }

  getFor(requiredFile: string): FileDecorations {
    const found = this.fileDecorations.find(value => { return value.file === requiredFile; });

    if (found)
      return found;

    throw new Error(
      'Cannot find any uncovered code regions for the file: ' +
      `${requiredFile}. Ensure this file belongs to a project that is covered by at least a test project.`);
  }

  readonly fileDecorations: ReadonlyArray<FileDecorations>;
};
