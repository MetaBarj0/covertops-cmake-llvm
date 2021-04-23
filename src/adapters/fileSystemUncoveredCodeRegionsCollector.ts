import { UncoveredCodeRegionsCollector } from "../ports/uncoveredCodeRegionsCollector";

export class FileSystemUncoveredCodeRegionsCollector implements UncoveredCodeRegionsCollector {
  collectUncoveredCodeRegions() { return Promise.reject(); }
};
