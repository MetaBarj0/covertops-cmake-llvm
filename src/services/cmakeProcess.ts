export type CmakeProcess = {
  checkCmakeVersion(): Promise<string>;

  buildCmakeTarget(): Promise<void>;
};
